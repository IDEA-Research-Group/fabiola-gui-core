var express = require('express');
var mongoose = require("mongoose");

var router = express.Router();

var ModelDefinition = require('../schemas/modelDefinition')

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

    ModelDefinition.paginate({}, {page: parseInt(page), limit: parseInt(limit)}, function (err, elements) {
        if (err)
            res.sendStatus(500)
        else
            res.send(elements);
    });
});

/**
 * RETRIEVE a ModelDefinition by id
 * */
router.get('/:id', function (req, res) {
    var id = req.params.id;

    ModelDefinition.findOne({'_id': id}, function (err, element) {
        if (!element)
            res.sendStatus(404);
        else
            res.send(element);
    });
});

/**
 * CREATE a ModelDefinition
 * */
router.post('/', function (req, res, next) {
    var body = req.body;
    ModelDefinition.create(body).then(function (instance) {
        res.send(instance);
    }).catch(next);
});

/**
 * UPDATE a ModelDefinition by id
 * */
router.put('/:id', function (req, res, next) {
    var body = req.body;
    var id = req.params.id;

    if (!body || !id)
        res.sendStatus(400);
    if (!mongoose.Types.ObjectId.isValid(id))
        res.sendStatus(400);

    ModelDefinition.aggregate([
        {
            $match: {"_id": new mongoose.Types.ObjectId(id)}
        },
        {
            $lookup:
                {
                    from: "instances",
                    localField: "_id",
                    foreignField: "modelDefinition",
                    as: "matched_docs"
                }
        },
        {
            $match: {"matched_docs.status": {$nin: ['FINISHED', 'RUNNING']}}
        }
    ])
        .exec().then(function (results) {
            if (results.length == 0)
                res.status(400).send({error: "The ModelDefinition with _id "+ id +" does not exist or its status is either RUNNING or FINISHED and cannto me modified."});
            else{
                // If there are results (max 1 result), it means that the ModelDefinition exist and we can also modify it. Let's do it
                ModelDefinition.findByIdAndUpdate(id, body, {new: true}).then(function (result) {
                    res.send(result);
                }).catch(next);
            }
        }).catch(next);
});

/**
 * DELETE a ModelDefinition by id
 * */
router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id)
        res.sendStatus(400);
    if (!mongoose.Types.ObjectId.isValid(id))
        res.sendStatus(400);

    ModelDefinition.aggregate([
        {
            $match: {"_id": new mongoose.Types.ObjectId(id)}
        },
        {
            $lookup:
                {
                    from: "instances",
                    localField: "_id",
                    foreignField: "modelDefinition",
                    as: "matched_docs"
                }
        },
        {
            $match: {"matched_docs": {$size: 0}}
        }
    ])
        .exec().then(function (results) {
        if (results.length == 0)
            res.status(400).send({error: "The ModelDefinition with _id "+ id +" does not exist or it is associated with an Instance and cannot be deleted."});
        else{
            // If there are results (max 1 result), it means that the ModelDefinition exist and we can also delete it. Let's do it
            ModelDefinition.findByIdAndDelete(id).then(function (result) {
                res.send(204);
            }).catch(next);
        }
    }).catch(next);
});

module.exports = router;
