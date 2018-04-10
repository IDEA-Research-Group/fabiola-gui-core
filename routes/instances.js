var express = require('express');
var request = require('request')
var config = require("config-yml");
var moment = require('moment');
const util = require('util')

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

    Instance.paginate({}, {page: parseInt(page), limit: parseInt(limit)}, function (err, elements) {
        if (err)
            res.sendStatus(500)
        else
            res.send(elements);
    });
});

/**
 * RETRIEVE an Instance by id
 * */
router.get('/:id', function (req, res) {
    var id = req.params.id;
    Instance.findOne({'_id': id}, function (err, element) {
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

    // The status, creationDate, lastExecutionDate, duration, driverId, errorMsg and frameworkId cannot be modified here
    delete body.status;
    delete body.creationDate;
    delete body.lastExecutionDate;
    delete body.duration;
    delete body.driverId;
    delete body.errorMsg;
    delete body.frameworkId;

    Instance.findOneAndUpdate(
        {'_id': id, 'status': {'$nin': ['FINISHED', 'RUNNING']}},
        body,
        {new: true})
        .then(function (instance) {
            if (!instance)
                res.status(400).send({error: "Cannot update this instance because it does not exists or its status is either RUNNING or FINISHED."});
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

    Instance.findOneAndRemove({'_id': id, 'status': {'$nin': ['RUNNING']}})
        .then(function (instance) {
            if (!instance)
                res.status(400).send({error: "Cannot delete this instance because it does not exist or its status is RUNNING."});
            else {
                status = instance.status;
                // TODO si borra una instancia cuyo estado es FINISHED, borrar los resultados asociados a esta isntancia
                // if(status == 'FINISHED') //
                Result.remove({'instanceId': id}, function (err, removed) {
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
 * RUN an Instance
 * */
router.post('/run/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id)
        res.sendStatus(400);
    // First, find this instanceId
    Instance.findOne({'_id': id, 'status': {'$nin': ['RUNNING', 'FINISHED']}}).then(function (instance) {
        if (!instance)
            res.status(400).send({error: "The instance with id " + id + " does not exist or its status is either RUNNING or FINISHED."});
        else {
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
                    "spark.eventLog.enabled": "true",
                    "spark.eventLog.dir": "hdfs://hdfs:8020/history",
                    "spark.mesos.executor.docker.forcePullImage": "true",
                    "spark.mesos.executor.docker.image": "mesosphere/spark:2.1.0-2.2.1-1-hadoop-2.6",
                    "spark.mesos.uris": config.fabiola.spark.mesosUris,
                    "spark.mesos.driver.labels": config.fabiola.spark.mesosDriverLabels,
                    // END ONLY FOR PRODUCTION ENVIRONMENT
                    'spark.master': config.fabiola.spark.master
                }
            };

            request.post({
                url: config.fabiola.spark.submissionsUri + '/create',
                json: bodyReq,
                headers: {'Authorization': 'token=eyJhbGciOiJIUzI1NiIsImtpZCI6InNlY3JldCIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIzeUY1VE9TemRsSTQ1UTF4c3B4emVvR0JlOWZOeG05bSIsImVtYWlsIjoiYXZhbGVuY2lhcGFycmFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV4cCI6MTUyMzc4MDQwNSwiaWF0IjoxNTIzMzQ4NDA1LCJpc3MiOiJodHRwczovL2Rjb3MuYXV0aDAuY29tLyIsInN1YiI6ImdpdGh1YnwxMDI4MDg2MiIsInVpZCI6ImF2YWxlbmNpYXBhcnJhQGdtYWlsLmNvbSJ9.k6oFjVoWHomd4w6-etkhZ0jUC4kGeDhgQZ76WoXh9y0'}
            }, function (error, response, body) {
                if(body.includes('Unauthorized')){
                    res.status(401).send({error: "Unauthorized to access to the Spark cluster. Please renew the auth token."});
                } else {
                    // We use the body parameter in order to check if there was an error.
                    try {
                        var bodyJson = body;
                        if (typeof bodyJson == 'string')
                            bodyJson = JSON.parse(body);
                        //console.log('\nbody\n')
                        //console.log(util.inspect(body, false, null))
                        // If an error has occurred, action field will be ErrorResponse or it won't exist.
                        if (bodyJson.success && bodyJson.submissionId) {
                            // Update the status and set the driverId
                            instance.status = "RUNNING";
                            instance.driverId = bodyJson.submissionId;
                            instance.lastExecutionDate = new Date();
                            Instance.findByIdAndUpdate(instance._id, instance, {new: true}).then(function (result) {
                                // Una vez actualizado el estado, pasamos a hacer una petición a la API de mesos para
                                // obtener el frameworkId. Lo hacemos ahora y no antes para evitar:
                                // 1. Condiciones de carrera si hacemos ambas operaciones de forma asíncrona
                                // 2. Que si hacemos todas las actualizaciones (estado + frameworkId) como callback a la
                                // llamada a la API de Mesos, evitar que, si esta falla, la instancia no actualice su estado.
                                // Es más crítico que se actualice el estado que el frameworkId.
                                request.get(config.fabiola.spark.mesosFrameworksApiUri, function (error, response, body) {
                                    var bodyJson = body;
                                    if (typeof bodyJson == 'string')
                                        bodyJson = JSON.parse(body);
                                    if (!error) {
                                        var frameworkIdRes = bodyJson.frameworks
                                            .filter(elem =>
                                                elem.active === true &&
                                                elem.connected === true &&
                                                elem.name === config.fabiola.spark.mesosFrameworkName)
                                            .map(elem => elem.id);

                                        if (frameworkIdRes) {
                                            if (frameworkIdRes.length > 0) {
                                                var frameworkId = frameworkIdRes[0];
                                                var toUpdate = {frameworkId: frameworkId};
                                                Instance.findByIdAndUpdate(instance._id, toUpdate, {new: true}).then(function (result) {
                                                    res.send(result);
                                                }).catch(next);
                                            } else {
                                                res.status(207).send(result);
                                            }
                                        } else {
                                            res.status(207).send(result);
                                        }
                                    } else {
                                        res.sendStatus(207);
                                    }
                                });
                            }).catch(next);
                        } else
                            res.status(500).send({error: "Failed to execute the instance with id " + id + "."});
                    } catch (e) {
                        res.status(500).send({error: "Spark dispatcher response not understood."});
                    }
                }
            });
        }
    }).catch(next);
});

/**
 * GET the status of a RUNNING instance and update it
 * */
router.get('/status/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id)
        res.sendStatus(400);
    // First, find this instanceId. Only can query the driver status of an Instance whose status is RUNNING
    Instance.findOne({'_id': id, 'status': {'$in': ['RUNNING']}}).then(function (instance) {
        if (!instance)
            res.status(400).send({error: "The instance with id " + id + " does not exist or its status is not RUNNING."});
        else {
            request.get(
                {
                    url: config.fabiola.spark.submissionsUri + '/status/' + instance.driverId,
                    headers: {'Authorization': 'token=eyJhbGciOiJIUzI1NiIsImtpZCI6InNlY3JldCIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIzeUY1VE9TemRsSTQ1UTF4c3B4emVvR0JlOWZOeG05bSIsImVtYWlsIjoiYXZhbGVuY2lhcGFycmFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV4cCI6MTUyMzc4MDQwNSwiaWF0IjoxNTIzMzQ4NDA1LCJpc3MiOiJodHRwczovL2Rjb3MuYXV0aDAuY29tLyIsInN1YiI6ImdpdGh1YnwxMDI4MDg2MiIsInVpZCI6ImF2YWxlbmNpYXBhcnJhQGdtYWlsLmNvbSJ9.k6oFjVoWHomd4w6-etkhZ0jUC4kGeDhgQZ76WoXh9y0'}
                }, function (error, response, body) {
                if (!error) {

                    if(body.includes('Unauthorized')){
                        res.status(401).send({error: "Unauthorized to access to the Spark cluster. Please renew the auth token."});
                    } else {
                        try {
                            // Convert JSON string to JSON object
                            var bodyJson = body;
                            if (typeof bodyJson == 'string')
                                bodyJson = JSON.parse(body);

                            // If the petition was successful and the driver was found, the success field is true.
                            // Otherwise, it may be false or undefined
                            if (bodyJson.success) {
                                // Check the wiki to check the different statuses and their interpretation
                                if (bodyJson.driverState == 'RUNNING')
                                    res.status(200).send(instance); // If the driver state is RUNNING it means that the instance status has not changed
                                // If the driverState is not RUNNING, it means either the task has finished successfully or there was an error
                                else {
                                    var message = bodyJson.message;
                                    var state = message.split("state: ").pop().split('\n').shift();
                                    if (state == 'TASK_FINISHED') {
                                        // The job has finished. Update the status in the instance document.
                                        // TODO añadir la duración

                                        request.get(config.fabiola.spark.historyApiUri
                                            + '/applications/'
                                            + instance.frameworkId + '-' + instance.driverId, function (error, response, body) {

                                            if (!error) {
                                                try {
                                                    var bodyJson = body;
                                                    if (typeof bodyJson == 'string')
                                                        bodyJson = JSON.parse(body);
                                                    var duration = bodyJson.attempts[0].duration / 1000.0;

                                                    instance.status = "FINISHED";
                                                    instance.duration = duration;
                                                    //console.log(duration);
                                                    // Let's update this document in the database
                                                    Instance.findByIdAndUpdate(instance._id, instance, {new: true}).then(function (result) {
                                                        res.send(result);
                                                    }).catch(next);
                                                } catch (e) {
                                                    res.status(500).send({error: "Spark History Server response not understood."});
                                                }
                                            } else {
                                                res.status(500).send({error: "Couldn't get date from Spark History Server"});
                                            }
                                        });
                                    } else {
                                        // differentiate the TASK_FAILED and TASK_KILLED statuses
                                        if (state === 'TASK_KILLED')
                                            instance.status = "KILLED";
                                        else
                                            instance.status = "ERROR";
                                        var errorMsg = message.split("message: ").pop().split('\n').shift();
                                        instance.errorMsg = errorMsg;

                                        // var stateMessage = message.split("state: ").pop().split('\\n').shift();
                                        // Let's update this document in the database
                                        Instance.findByIdAndUpdate(instance._id, instance, {new: true}).then(function (result) {
                                            res.send(result);
                                        }).catch(next);
                                    }
                                }
                            } else {
                                // TODO it may mean that the driverId does not exist. It could be because the Spark dispatcher was restarted
                                // TODO in this case, it would be necessary to query the Spark history server
                                res.status(500).send({error: "Failed to get the status of the instance with id " + id + "."});
                            }
                        } catch (e) {
                            res.status(500).send({error: "Spark dispatcher response not understood."});
                        }
                    }
                } else {
                    res.status(500).send({error: "The Spark dispatcher is not available."});
                }
            })
        }
    }).catch(next);
});

module.exports = router;
