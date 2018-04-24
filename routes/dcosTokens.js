var express = require('express');

// Initialize this router
var router = express.Router();

// Load schema(s)
var DcosToken = require('../schemas/dcosToken');

/**
 * RETRIEVE all DcosTokens paginated
 * */
router.get('/', function (req, res) {
    var page = req.query.page;
    var limit = req.query.limit;
    if (!page)
        page = 1;
    if (!limit)
        limit = 10;

    DcosToken.paginate({}, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: {creationDate: -1}
    }, function (err, elements) {
        if (err)
            res.sendStatus(500);
        else
            res.send(elements);
    });
});

/**
 * RETRIEVE the latest DcosToken
 */
router.get('/latest', function (req, res) {
    DcosToken.findOne({}, {}, {sort: {'creationDate': -1}}, function (err, element) {
        if (!element)
            res.sendStatus(204);
        else
            res.send(element);
    });
});

/**
 * CREATE an DcosToken
 * */
router.post('/', function (req, res, next) {
    var body = req.body;
    delete body._id;
    DcosToken.create(body).then(function (instance) {
        res.status(201).send(instance);
    }).catch(next);
});

/**
 * DELETE a DcosToken by id
 * */
router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id)
        res.sendStatus(400);
    DcosToken.findByIdAndRemove(id)
        .then(function(dcosToken) {
            if(!dcosToken)
                res.sendStatus(404);
            else
                res.sendStatus(204);
        })
        .catch(next);
});

module.exports = router;