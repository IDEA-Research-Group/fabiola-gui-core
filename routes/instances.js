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
    Instance.create(body).then(function (instance) {
        res.send(instance);
    }).catch(next);
});

router.put('/:id', function (req, res, next) {
    var body = req.body;
    if (!body)
        res.sendStatus(400);

    // The status, creationDate, lastExecutionDate, duration and driverId cannot be modified here
    delete body.status;
    delete body.creationDate;
    delete body.lastExecutionDate;
    delete body.duration;
    delete body.driverId;

    Instance.findOneAndUpdate(
        {'_id': req.params.id, 'status': {'$nin': ['FINISHED', 'RUNNING']}},
        body,
        {new: true}).then(function (instance) {
        if (!instance)
            res.status(400).send({error: "Cannot update this instance because its status is either or RUNNING or FINISHED."})
        else
            res.send(instance);
    }).catch(next);
});

module.exports = router;
