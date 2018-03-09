var express = require('express');
var mongoose = require('mongoose')
var router = express.Router();

var Instance = require('../schemas/instance')

/* GET instances listing. */
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

router.get('/:id', function (req, res) {
    var id = req.params.id;
    // Considero que este if es innecesario
    // if (!id)
    //     res.sendStatus(400);
    Instance.findOne({'_id': id}, function (err, element) {
        if (!element)
            res.sendStatus(404);
        else
            res.send(element);
    });
});

router.post('/', function (req, res, next) {
    var body = req.body;
    Instance.create(body).then(function(instance){
        res.send(instance);
    }).catch(next);
});

router

module.exports = router;
