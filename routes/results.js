var express = require('express');
var router = express.Router();

var result = require('../schemas/result')

/* GET instances listing. */
router.get('/', function(req, res) {
    result.find({}, function (err, elements) {
        res.send(elements);
    });
});

module.exports = router;
