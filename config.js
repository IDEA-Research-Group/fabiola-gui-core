var config = require("config-yml");

exports.config = function() {
    var env = process.env.ENVIRONMENT || 'dev';
    return config[env];
}();