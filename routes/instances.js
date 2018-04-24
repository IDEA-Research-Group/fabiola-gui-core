var express = require('express');
var request = require('request')
var config = require("./../config").config;
var mongoose = require('mongoose');
var utils = require("../utils");

// Initialize this router
var router = express.Router();

// Load schema(s)
var Instance = require('../schemas/instance')
var Result = require('../schemas/result')

/**
 * RETRIEVE all Instances paginated
 * */
router.get('/', function (req, res) {
    var query = {}
    var page = req.query.page;
    var limit = req.query.limit;
    if (!page)
        page = 1;
    if (!limit)
        limit = 10;

    Instance.paginate({}, {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: ['copModel', 'dataset']
    }, function (err, elements) {
        if (err)
            res.sendStatus(500);
        else
            res.send(elements);
    });
});

/**
 * RETRIEVE an Instance by id
 * */
router.get('/:id', function (req, res) {
    var id = req.params.id;
    Instance.findOne({'_id': id}).populate('copModel').populate('dataset').exec(function (err, element) {
        if (!element)
            res.sendStatus(404);
        else
            res.send(element);
    });
});

/**
 * CREATE an Instance
 * */
router.post('/', function (req, res, next) {
    var body = req.body;
    delete body._id;
    Instance.create(body).then(function (instance) {
        res.status(201).send(instance);
    }).catch(next);
});

/**
 * UPDATE an Instance by id
 * */
router.put('/:id', function (req, res, next) {
    var body = req.body;
    var id = req.params.id;

    if (!body || !id)
        res.sendStatus(400);

    // The status, creationDate, lastExecutionDate, duration, appId and errorMsg cannot be modified here
    delete body.status;
    delete body.creationDate;
    delete body.lastExecutionDate;
    delete body.duration;
    delete body.appId;
    delete body.errorMsg;

    Instance.findOneAndUpdate(
        {'_id': id, 'status': {'$nin': ['FINISHED', 'RUNNING', 'WAITING']}},
        body,
        {new: true})
        .then(function (instance) {
            if (!instance)
                res.status(400).send({error: "Cannot update this Instance because it does not exists or its status is WAITING, RUNNING or FINISHED."});
            else
                res.send(instance);
        })
        .catch(next);
});

/**
 * DELETE an Instance by id
 * */
router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id)
        res.sendStatus(400);

    Instance.findOneAndRemove({'_id': id, 'status': {'$nin': ['WAITING', 'RUNNING']}})
        .then(function (instance) {
            if (!instance)
                res.status(400).send({error: "Cannot delete this Instance because it does not exist or its status is RUNNING."});
            else {
                status = instance.status;
                // Borrar los resultados asociados a esta isntancia
                Result.remove({'instance': id}, function (err, removed) {
                    if (err)
                        res.sendStatus(207)
                    else
                        res.sendStatus(204);
                });
            }
        })
        .catch(next);
});

/**
 * RUN an Instance by id
 * */
router.post('/run/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id)
        res.sendStatus(400);

    var bodyReq = {
        action: "CreateSubmissionRequest",
        appArgs: [config.fabiola.metastore.mongo.uri, config.fabiola.metastore.mongo.database, id],
        appResource: config.fabiola.metastore.hdfs.webUri + config.fabiola.appResourcePath,
        mainClass: config.fabiola.copJobClasspath,
        clientSparkVersion: "2.2.1",
        environmentVariables: {
            SPARK_ENV_LOADED: "1"
        },
        sparkProperties: {
            'spark.jars': config.fabiola.metastore.hdfs.webUri + config.fabiola.appResourcePath,
            'spark.submit.deployMode': "cluster",
            'spark.app.name': "FABIOLA",
            // ONLY FOR PRODUCTION ENVIRONMNET
            // "spark.eventLog.enabled": "true",
            // "spark.eventLog.dir": "hdfs://hdfs:8020/history",
            // "spark.mesos.executor.docker.forcePullImage": "true",
            // "spark.mesos.executor.docker.image": "mesosphere/spark:2.1.0-2.2.1-1-hadoop-2.6",
            // "spark.mesos.uris": config.fabiola.spark.mesosUris,
            // "spark.mesos.driver.labels": config.fabiola.spark.mesosDriverLabels,
            // END ONLY FOR PRODUCTION ENVIRONMENT
            'spark.master': config.fabiola.spark.master
        }
    };

    // The dataset can only be deleted if it has not been assigned to any Instance
    Instance.aggregate([
        {$match: {"_id": new mongoose.Types.ObjectId(id)/*, 'status': {'$nin': ['WAITING', 'RUNNING', 'FINISHED']}*/}},
        {$lookup: {from: "datasets", localField: "dataset", foreignField: "_id", as: "matched_docs"}},
        {$match: {"matched_docs.status": {$in: ['VALIDATED']}}}])
        .exec().then(function (results) {
        if (results.length == 0) {
            res.status(400).send({error: "Cannot run this Instance because the Dataset has not been validated."});
        } else {
            // If there are results (max 1 result), it means that the Instance exist and we can also run it. Let's do it
            // Verify that the status is not WAITING, RUNNING, or FINISHED. If so, update the status to WAITING and
            // initialize the COPJob
            Instance.findOneAndUpdate({
                '_id': id,
                'status': {'$nin': ['WAITING', 'RUNNING', 'FINISHED']}
            }, {status: 'WAITING', lastExecutionDate: new Date()}, {new: true}).then(function (result) {
                if (!result)
                    res.status(400).send({error: "Cannot run this Instance because its status is WAITING, RUNNING or FINISHED."});
                else { // Let's start the execution
                    request.post({
                        url: config.fabiola.spark.submissionsUri + '/create',
                        json: bodyReq,
                        // headers: {'Authorization': 'token=eyJhbGciOiJIUzI1NiIsImtpZCI6InNlY3JldCIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIzeUY1VE9TemRsSTQ1UTF4c3B4emVvR0JlOWZOeG05bSIsImVtYWlsIjoiYXZhbGVuY2lhcGFycmFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV4cCI6MTUyMzc4MDQwNSwiaWF0IjoxNTIzMzQ4NDA1LCJpc3MiOiJodHRwczovL2Rjb3MuYXV0aDAuY29tLyIsInN1YiI6ImdpdGh1YnwxMDI4MDg2MiIsInVpZCI6ImF2YWxlbmNpYXBhcnJhQGdtYWlsLmNvbSJ9.k6oFjVoWHomd4w6-etkhZ0jUC4kGeDhgQZ76WoXh9y0'}
                    }, function (error, response, body) {
                        utils.handleResquestResponse(error, body, function (result) {
                            // Check if the spark cluster invocation was successful
                            if (body.success)
                                res.sendStatus(200);
                            else {
                                setInstanceStatusToError(id);
                                res.status(500).send({error: "Error connection to the Spark cluster."});
                            }
                        }, function (error) {
                            setInstanceStatusToError(id);
                            if (error === 401) res.status(401).send({error: "Unauthorized to access to the Spark cluster. Please renew the auth token."});
                            else res.status(500).send({error: "Error connection to the Spark cluster."});
                        });
                    });
                }
            }).catch(next);
        }
    }).catch(next);
});

function setInstanceStatusToError(id) {
    Instance.findByIdAndUpdate(id, {
        status: 'ERROR',
        errorMsg: 'Error accessing to the Spark cluster.'
    }, function (result) {
    });
}

module.exports = router;
