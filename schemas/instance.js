var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

var InstanceSchema = new mongoose.Schema({
    modelDefinition: {type: mongoose.Schema.ObjectId, conditions: {}, ref: 'ModelDefinition', required: true},
    datasetUri: {type: String, required: true},
    in: {type: [String], required: true},
    out: {type: [String], required: true},
    ot: {type: [String], required: true},
    metrics: {type: Boolean, required: true},
    timeout: {type: Number, required: true},
    status: {type: String, required: false},
    creationDate: {type: Date, required: false},
    lastExecutionDate: {type: Date, required: false},
    duration: {type: Number, required: false},
    driverId: {type: String, required: false},
    dsSchema: {type: String, required: false}, // TODO Need review. It may be a JS Object, and also required
    errorMsg: {type: String, required: false},
    frameworkId: {type: String, required: false}
}, {collection: "instances"});

InstanceSchema.plugin(mongoosePaginate);
//InstanceSchema.index({ author: 'text', title: 'text', year: 'text', tutors: 'text', 'tutors.url': 'text', 'tutors.name': 'text', authorName: 'text', idDissertation: 'text' });
//InstanceSchema.index({ '$**': 'text' });

InstanceSchema.pre('save', function(next) {
    this.status = "NOT_STARTED";
    this.creationDate = new Date();
    this.lastExecutionDate = undefined;
    this.duration = undefined;
    this.driverId = undefined;
    // this.dsSchema = undefined;
    this.errorMsg = undefined;
    this.frameworkId = undefined;
    next();
});

mongoose.model("Instance", InstanceSchema);

module.exports = mongoose.model("Instance");