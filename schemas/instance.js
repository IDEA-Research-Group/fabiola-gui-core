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
    this.errorMsg = undefined;
    next();
});

// driverCores, if set, must be a numeric value, between 1 and 32
InstanceSchema.path('systemConfig.driverCores').validate(function (value) {
    if(/^\d+$/.test(value)) if(Number(value) > 0 && Number(value) <= 32) return true; else return false;
    else return false;
}, 'Value must be a numeric value between 1 and 32.');

// executorCores, if set, must be a numeric value, between 1 and 32
InstanceSchema.path('systemConfig.executorCores').validate(function (value) {
    if(/^\d+$/.test(value)) if(Number(value) > 0 && Number(value) <= 32) return true; else return false;
    else return false;
}, 'Value must be a numeric value between 1 and 32.');

// driverMemory, if set, must be a number followed by G, g, M or m, and greater or equal than 512m or 0.5g
InstanceSchema.path('systemConfig.driverMemory').validate(function (value) {
    if(/^(\d*\.)?\d+(g|G|m|M)$/.test(value)) {
        if(['g', 'G'].includes(value.slice(-1)) ) if(Number(value.slice(0, -1)) >= 0.5) return true; else return false;
        else if(Number(value.slice(0, -1)) >= 512) return true; else return false;

    } else return false;
}, 'Value must be a number followed by G, g, M or m. The amount of memory must be greater or equal than 512m or 0.5g');

// executorMemory, if set, must be a number followed by G, g, M or m, and greater or equal than 512m or 0.5g
InstanceSchema.path('systemConfig.executorMemory').validate(function (value) {
    if(/^(\d*\.)?\d+(g|G|m|M)$/.test(value)) {
        if(['g', 'G'].includes(value.slice(-1)) ) if(Number(value.slice(0, -1)) >= 0.5) return true; else return false;
        else if(Number(value.slice(0, -1)) >= 512) return true; else return false;

    } else return false;
}, 'Value must be a number followed by G, g, M or m. The amount of memory must be greater or equal than 512m or 0.5g');


mongoose.model("Instance", InstanceSchema);

module.exports = mongoose.model("Instance");

