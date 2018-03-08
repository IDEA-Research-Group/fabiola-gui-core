var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

var InstanceSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.ObjectId},
    modelDefinition: {type: mongoose.Schema.ObjectId, required: true},
    datasetUri: {type: String, required: true},
    in: {type: [String], required: true},
    out: {type: [String], required: true},
    ot: {type: [String], required: true},
    metrics: {type: Boolean, required: true},
    timeout: {type: Number, required: true},
    status: {type: String, required: false},
    creationDate: {type: Date, required: true},
    lastExecutionDate: {type: Date, required: false},
    duration: {type: Number, required: false},
    driverId: {type: String, required: false}
}, {collection: "instances"});

InstanceSchema.plugin(mongoosePaginate);
//InstanceSchema.index({ author: 'text', title: 'text', year: 'text', tutors: 'text', 'tutors.url': 'text', 'tutors.name': 'text', authorName: 'text', idDissertation: 'text' });
//InstanceSchema.index({ '$**': 'text' });


mongoose.model("Instance", InstanceSchema);

module.exports = mongoose.model("Instance");