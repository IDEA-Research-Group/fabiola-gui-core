var express = require('express');
var router = express.Router();

var instance = require('../schemas/instance')

/* GET instances listing. */
router.get('/', function(req, res) {
  instance.find({}, function (err, elements) {
    res.send(elements);
  });
});

module.exports = router;
