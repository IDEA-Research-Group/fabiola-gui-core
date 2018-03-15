var express = require('express');
var router = express.Router();

var Result = require('../schemas/result')

/**
 * RETRIEVE all results by instance id paginated
 * */
/*
* TODO: Pensar si merece la pena hacer una comprobación previa sobre si existe el instanceId pasado como parámetro
* y los atributos a filtrar.
* */
router.get('/:instanceId', function (req, res, next) {
    var instanceId = req.params.instanceId;

    var page = req.query.page;
    var limit = req.query.limit;

    delete req.query.page;
    delete req.query.limit;
    delete req.query.instanceId;

    var query = req.query;
    var toIndex = {};

    console.log(req.query)

    Object.keys(query).forEach(function (key) {
        toIndex[key] = 1;
    });

    console.log(toIndex)

    Result.collection.createIndex(toIndex, {partialFilterExpression: {instanceId: instanceId}}, function (err, result) {
        console.log(err);
        console.log(result);
    });

    // https://www.npmjs.com/package/mongoose-api-query
    // https://www.npmjs.com/package/mongoose-query --> esta esta actualizada
    console.log(Object.assign({'instanceId': instanceId}, query))

    if (!page)
        page = 1;
    if (!limit)
        limit = 10;
    Result.paginate(Object.assign({'instanceId': instanceId}, query), {
        page: parseInt(page),
        limit: parseInt(limit)
    }).then(function (elements) {
        res.send(elements);
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
