var express = require('express');
var request = require('request');
var config = require("./../config").config;
var utils = require("../utils");
var mongoose = require("mongoose");
var hdfs247 = require('hdfs247');
var fs = require('fs');

var multer = require('multer');
var DIR = './temp/';
var upload = multer(
    {
        dest: DIR,
        fileFilter: function (req, file, cb) {
            // It's safer to check the mimetype rather than the file extension
            if (!['application/json', 'text/csv'].includes(file.mimetype)) {
                return cb(null, false)
            }
            cb(null, true)
        }

    }).single('dataset');


// Initialize this router
var router = express.Router();

// Load schema(s)
var Dataset = require('../schemas/dataset')

/**
 * RETRIEVE all Datasets paginated
 * */
router.get('/', function (req, res) {
    var query = {}
    var page = req.query.page;
    var limit = req.query.limit;
    if (!page)
        page = 1;
    if (!limit)
        limit = 10;

    Dataset.paginate({}, {page: parseInt(page), limit: parseInt(limit)}, function (err, elements) {
        if (err)
            res.sendStatus(500)
        else
            res.send(elements);
    });
});

/**
 * RETRIEVE a Dataset by id
 * */
router.get('/:id', function (req, res) {
    var id = req.params.id;
    Dataset.findOne({'_id': id}, function (err, element) {
        if (!element)
            res.sendStatus(404);
        else
            res.send(element);
    });
});

/**
 * CREATE a Dataset
 * */
router.post('/', function (req, res, next) {
    var body = req.body;
    delete body._id;

    // Set local attribute to false
    body.local = false;

    Dataset.create(body).then(function (instance) {
        res.status(201).send(instance);
    }).catch(next);
});

/**
 * CREATE a Dataset from local file
 * */
router.post('/upload', function (req, res, next) {
    // Upload the file to the temp folder. If the format is not the expected, it will throw a 400 error.
    upload(req, res, function (err) {
        var file = req.file;
        if (!file) {
            res.status(400).send({error: "Error uploading the file. Format must be JSON or CSV."});
        } else {
            // This is the Dataset object name field
            var originalName = file.originalname;

            // Path of the local temp file
            var localPath = file.path;

            // Let's form remotePath from hdfsMongoId and the pseudo random name given to the temp file, and the format
            // hdfsMongoId is a MongoDB id to form the dataset name at fabiola metastore
            var hdfsMongoId = mongoose.Types.ObjectId();
            var newName = file.filename;
            var format = (file.mimetype === 'text/csv') ? 'csv' : 'json';
            var remotePath = '/datasets/' + hdfsMongoId + '-' + newName + '.' + format;

            var hdfs = new hdfs247({
                protocol: 'http',
                hostname: config.fabiola.metastore.hdfs.host,
                port: config.fabiola.metastore.hdfs.webPort
            });

            // Upload the temp file to hdfs
            hdfs.upload({
                overwrite: true,
                localpath: localPath,
                path: remotePath
            }, function (error, response, body) {
                if (error) {
                    fs.unlink(localPath, function (err) {
                        if (err) console.error(err)
                    });
                    res.status(500).send({error: "Error uploading the file."});
                } else {

                    // local attribute must be set to true
                    var datasetObj = {
                        name: originalName,
                        hostname: config.fabiola.metastore.hdfs.host,
                        port: config.fabiola.metastore.hdfs.port,
                        path: remotePath,
                        datasource: 'hdfs',
                        format: format,
                        local: true
                    };

                    fs.unlink(localPath, function (err) {
                        if (err) console.error(err)
                    });

                    Dataset.create(datasetObj).then(function (element) {
                        res.status(201).send(element);
                    }).catch(next);
                }
            });
        }
    });
});

/**
 * UPDATE an Dataset by id
 * */
router.put('/:id', function (req, res, next) {
    var body = req.body;
    var id = req.params.id;

    if (!body || !id)
        res.sendStatus(400);

    // The creationDate, lastValidationDate and dsSchema cannot be modified here
    delete body.creationDate;
    delete body.lastValidationDate;
    delete body.dsSchema;

    // The dataset can only be updated if it has not been assigned to any Instance
    Dataset.aggregate([
        {
            $match: {"_id": new mongoose.Types.ObjectId(id)}
        },
        {
            $lookup:
                {
                    from: "instances",
                    localField: "_id",
                    foreignField: "dataset",
                    as: "matched_docs"
                }
        },
        {
            $match: {"matched_docs": {$size: 0}}
        }
    ])
        .exec().then(function (results) {
        if (results.length == 0)
            res.status(400).send({error: "This Dataset has been assigned to at least one Instance."});
        else {
            // If there are results (max 1 result), it means that the Dataset exist and we can also modify it. Let's do it

            // An updated dataset must be validated again. For this reason, the errorMsg is set to undefined and the status
            // field is set to NOT_VALIDATED
            body.status = "NOT_VALIDATED";

            var updateDoc = {'$set': body, '$unset': {'errorMsg': 1}};

            // If the dataset is being validated, it cannot be edited
            Dataset.findOneAndUpdate({
                '_id': id,
                'status': {'$nin': ['WAITING', 'RUNNING']}
            }, updateDoc, {new: true}).then(function (result) {
                if (!result)
                    res.status(400).send({error: "Cannot edit this Dataset because its status is either WAITING or RUNNING."});
                else
                    res.send(result);
            }).catch(next);
        }
    }).catch(next);
});


/**
 * DELETE a Dataset by id
 * */
router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id)
        res.sendStatus(400);

    // The dataset can only be deleted if it has not been assigned to any Instance
    Dataset.aggregate([
        {
            $match: {"_id": new mongoose.Types.ObjectId(id)}
        },
        {
            $lookup:
                {
                    from: "instances",
                    localField: "_id",
                    foreignField: "dataset",
                    as: "matched_docs"
                }
        },
        {
            $match: {"matched_docs": {$size: 0}}
        }
    ])
        .exec().then(function (results) {
        if (results.length == 0)
            res.status(400).send({error: "This Dataset has been assigned to at least one Instance."});
        else {
            // If there are results (max 1 result), it means that the Dataset exist and we can also delete it. Let's do it

            // If the dataset is being validated, it cannot be deleted
            Dataset.findOneAndRemove({'_id': id, 'status': {'$nin': ['WAITING', 'RUNNING']}}).then(function (result) {
                console.log(result);
                if (!result)
                    res.status(400).send({error: "Cannot edit this Dataset because its status is either WAITING or RUNNING."});
                else
                    res.sendStatus(204);
            }).catch(next);
        }
    }).catch(next);
});

/**
 * VALIDATE a Dataset by id
 */
router.post('/validate/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id)
        res.sendStatus(400);

    var bodyReq = {
        action: "CreateSubmissionRequest",
        appArgs: [config.fabiola.metastore.mongo.uri, config.fabiola.metastore.mongo.database, id],
        appResource: config.fabiola.metastore.hdfs.webUri + config.fabiola.appResourcePath,
        mainClass: config.fabiola.datasetJobClasspath,
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

    // Verify that the status is not WAITING or RUNNING. If so, update the status to WAITING and initialize the
    // validation process.
    Dataset.findOneAndUpdate({
        '_id': id,
        'status': {'$nin': ['WAITING', 'RUNNING']}
    }, {status: 'WAITING', lastValidationDate: new Date()}, {new: true}).then(function (result) {
        if (!result)
            res.status(400).send({error: "Cannot edit this Dataset because its status is either WAITING or RUNNING."});
        else { // Let's start the validation
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
                        setDatasetStatusToError(id);
                        res.status(500).send({error: "Error connection to the Spark cluster."});
                    }
                }, function (error) {
                    setDatasetStatusToError(id);
                    if (error === 401) res.status(401).send({error: "Unauthorized to access to the Spark cluster. Please renew the auth token."});
                    else res.status(500).send({error: "Error connection to the Spark cluster."});
                });
            });
        }
    }).catch(next);
});

function setDatasetStatusToError(id) {
    Dataset.findByIdAndUpdate(id, {
        status: 'VALIDATION_ERROR',
        errorMsg: 'Error accessing to the Spark cluster.'
    }, function (result) {
    });
}

module.exports = router;