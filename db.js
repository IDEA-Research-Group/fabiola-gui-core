var mongoose = require('mongoose');
var config = require("config-yml");

mongoose.connect(config.db.mongoUri, {useMongoClient: true});