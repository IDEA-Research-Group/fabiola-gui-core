var express = require('express');
var router = express.Router();

/* GET instances listing. */
router.get('/', function(req, res, next) {
  res.send('Ey! It worked! :)');
});

module.exports = router;
