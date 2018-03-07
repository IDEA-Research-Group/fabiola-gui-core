var express = require('express');
var router = express.Router();

// TODO: Considerar modificar este fichero. Parece inutil
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
