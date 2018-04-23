var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

var InstanceSchema = new mongoose.Schema({
    copModel: {type: mongoose.Schema.ObjectId, conditions: {}, ref: 'COPModel', required: true},
    in: {type: [String], required: true},
    out: {type: [String], required: true},
    ot: {type: [String], required: true},
    metrics: {type: Boolean, required: true},
    creationDate: {type: Date, required: false},
    lastExecutionDate: {type: Date, required: false},
    duration: {type: Number, required: false},
    appId: {type: String, required: false},
    dataset: {type: mongoose.Schema.ObjectId, conditions: {}, ref: 'Dataset', required: true},
    status: {type: String, required: false},
    errorMsg: {type: String, required: false},
    systemConfig: {
        type: new mongoose.Schema(
            {
                driverCores: {type: String, required: false},
                driverMemory: {type: String, required: false},
                executorCores: {type: String, required: false},
                executorMemory: {type: String, required: false}
            }),
        required: false}
}, {collection: "instances"});

InstanceSchema.plugin(mongoosePaginate);

InstanceSchema.pre('save', function(next) {
    this.status = "NOT_STARTED";
    this.creationDate = new Date();
    this.lastExecutionDate = undefined;
    this.duration = undefined;
    this.appId = undefined;
    // this.dsSchema = undefined;
    this.errorMsg = undefined;
    next();
});

mongoose.model("Instance", InstanceSchema);

module.exports = mongoose.model("Instance");