var express = require('express');
var request = require('request')
var config = require("./../config").config;

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



module.exports = router;