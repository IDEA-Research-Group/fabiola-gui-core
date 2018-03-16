var express = require('express');
var q2m = require('query-to-mongo');
var mongoose = require('mongoose');

var router = express.Router();

var Result = require('../schemas/result')
var Instance = require('../schemas/instance')

/**
 * RETRIEVE all results by instance id that match the specified query paginated
 * */
router.get('/:instanceId', function (req, res, next) {
    var instanceId = req.params.instanceId;
    var query = req.query;

    // Pagination information
    var pagination = {page: parseInt(query.page) || 1, limit: parseInt(query.limit) || 10};

    // Let's delete the fields that wee won't use for filtering
    delete query.page;
    delete query.limit;

    // Parse de query to MongoDB format
    query = q2m(query);

    // Get the fields to index
    var fieldsToIndex = Object.keys(Object.assign(query.criteria, query.options.sort));

    // Let's check whether the instance exists and if the fields to query also exist
    Instance.findById(instanceId).then(function (instance) {
        if (instance) {
            // Generate a list with all the mapped field of this instance. We need to concat the in., out., or ot.
            var instanceMappedFields = [];
            if (instance.in) instanceMappedFields = instanceMappedFields.concat(instance.in.map(s => 'in.' + s));
            if (instance.out) instanceMappedFields = instanceMappedFields.concat(instance.out.map(s => 'out.' + s));
            if (instance.ot) instanceMappedFields = instanceMappedFields.concat(instance.ot.map(s => 'ot.' + s));
            var instanceMappedFieldsSet = new Set(instanceMappedFields);

            // Check if the queried fields (fieldsToIndex) are contained in the instance mapped fields
            var notIncluded = fieldsToIndex.filter(f => !instanceMappedFieldsSet.has(f));
            var isSubset = notIncluded.length === 0;

            if (isSubset) {
                var toIndex = {};
                Object.keys(Object.assign(query.criteria, query.options.sort)).forEach(function (key) {
                    toIndex[key] = 1;
                });

                // It will create the indexes only if they don't exist.
                Result.collection.createIndex(toIndex, {partialFilterExpression: {instanceId: instanceId}}).then(function (result) {
                    // Finally execute the query
                    Result.paginate(
                        // Query: it includes the instanceId, the criteria and the sort options.
                        Object.assign({'instanceId': instanceId}, query.criteria, query.options.sort),
                        pagination
                    ).then(function (elements) {
                        res.send(elements);
                    }).catch(next);
                }).catch(next);
            } else
                res.status(400).send({
                    error: "You have queried some fields that are not declared in your instance as in, out or ot",
                    fields: notIncluded
                });
        } else
            res.status(404).send({error: "The instance with _id " + instanceId + " does not exist."});
    }).catch(next);
});

/**
 * RETRIEVE all results by instance id performing the aggregate operation
 * */
/*
* TODO: validar la operación a realizar
* */
router.get('/aggregate/:instanceId', function (req, res, next) {
    var instanceId = req.params.instanceId;
    var query = req.query;

    // Pagination information
    var pagination = {page: parseInt(query.page) || 1, limit: parseInt(query.limit) || 10};

    // Let's delete the fields that wee won't use for filtering
    delete query.page;
    delete query.limit;

    if (!query.groupField || !query.op || !query.opField)
        res.status(404).send({'error': 'You must specify the following information: groupField, op and opField.'});

    var fieldsToIndex = [query.groupField];

    // Let's check whether the instance exists and if the fields to query also exist
    Instance.findById(instanceId).then(function (instance) {
        if (instance) {
            // Generate a list with all the mapped field of this instance. We need to concat the in., out., or ot.
            var instanceMappedFields = [];
            if (instance.in) instanceMappedFields = instanceMappedFields.concat(instance.in.map(s => 'in.' + s));
            if (instance.out) instanceMappedFields = instanceMappedFields.concat(instance.out.map(s => 'out.' + s));
            if (instance.ot) instanceMappedFields = instanceMappedFields.concat(instance.ot.map(s => 'ot.' + s));
            var instanceMappedFieldsSet = new Set(instanceMappedFields);

            // Check if the queried fields (fieldsToIndex) are contained in the instance mapped fields
            var notIncluded = fieldsToIndex.filter(f => !instanceMappedFieldsSet.has(f));
            var isSubset = notIncluded.length === 0;

            if (isSubset) {
                var toIndex = {};
                fieldsToIndex.forEach(function (key) {
                    toIndex[key] = 1;
                });

                // It will create the indexes only if they don't exist.
                Result.collection.createIndex(toIndex, {partialFilterExpression: {instanceId: instanceId}}).then(function (result) {
                    // Finally execute the query
                    Result.aggregate([
                            {$match: {instanceId: new mongoose.Types.ObjectId(instanceId)}},
                            {
                                $group: {
                                    _id: '$' + query.groupField,
                                    result: JSON.parse("{\"$"+query.op+"\": \"$"+ query.opField+"\"}")
                                }
                            }
                        ]
                    ).then(function (elements) {
                        res.send(elements);
                    }).catch(next);
                }).catch(next);
            } else
                res.status(400).send({
                    error: "You have queried some fields that are not declared in your instance as in, out or ot",
                    fields: notIncluded
                });
        } else
            res.status(404).send({error: "The instance with _id " + instanceId + " does not exist."});
    }).catch(next);

});

/**
 * DELETE all results by instance
 * */
router.delete('/:instanceId', function (req, res, next) {
    var instanceId = req.params.instanceId;
    if (!instanceId)
        res.sendStatus(400);

    Result.deleteMany({'instanceId': instanceId})
        .then(function (instance) {
            res.sendStatus(204);
        }).catch(next);
});

module.exports = router;
