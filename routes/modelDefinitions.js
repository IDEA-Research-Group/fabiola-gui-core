var express = require('express');
var router = express.Router();

var modelDefinition = require('../schemas/modelDefinition')

/* GET instances listing. */
router.get('/', function(req, res) {
    modelDefinition.find({}, function (err, elements) {
        res.send(elements);
    });
});

module.exports = router;
