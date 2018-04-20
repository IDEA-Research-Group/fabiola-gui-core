var express = require('express');
var request = require('request')
var config = require("./../config").config;
var mongoose = require("mongoose");

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
    Dataset.create(body).then(function (instance) {
        res.status(201).send(instance);
    }).catch(next);
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

            var updateDoc = {'$set': body, '$unset': {'errorMsg': 1 }};

            // If the dataset is being validated, it cannot be edited
            Dataset.findOneAndUpdate({'_id': id, 'status': {'$nin': ['WAITING', 'RUNNING']}}, updateDoc, {new: true}).then(function (result) {
                if(!result)
                    res.status(400).send({error: "Cannot edit this instance because its status is either WAITING or RUNNING."});
                else
                    res.send(result);
            }).catch(next);
        }
    });
});



module.exports = router;