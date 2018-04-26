var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

var DatasetSchema = new mongoose.Schema({
    name: {type: String, required: true},
    hostname: {type: String, required: true},
    port: {type: String, required: true},
    path: {type: String, required: true},
    datasource: {type: String, required: true},
    local: {type: Boolean, required: true},
    format: {type: String, required: false},
    dsSchema: {type: String, required: false},
    credentials: {
        type: new mongoose.Schema(
            {
                user: {type: String, required: true},
                password: {type: String, required: true}
            }),
        required: false},
    status: {type: String, required: false},
    errorMsg: {type: String, required: false},
    creationDate: {type: Date, required: false},
    lastValidationDate: {type: Date, required: false}
}, {collection: "datasets"});

DatasetSchema.plugin(mongoosePaginate);

DatasetSchema.pre('save', function(next) {
    this.status = "NOT_VALIDATED";
    this.creationDate = new Date();
    this.lastValidationDate = undefined;
    this.errorMsg = undefined;
    next();
});

DatasetSchema.pre('validate', function(next) {
    if(!['hdfs', 'mongo'].includes(this.datasource)) {
        var error = new mongoose.Error.ValidationError(this);
        error.message = 'Datasource must be either hdfs or mongo.';
        return next(error);
    } else {
        if(this.datasource === 'hdfs' && !['csv', 'json'].includes(this.format)) {
            var error = new mongoose.Error.ValidationError(this);
            error.message = 'Format field must be either csv or json if the datasource is hdfs.';
            return next(error);
        }
    }
    next()
});


mongoose.model("Dataset", DatasetSchema);

module.exports = mongoose.model("Dataset");