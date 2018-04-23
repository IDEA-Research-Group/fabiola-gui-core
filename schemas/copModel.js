var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

var COPModelSchema = new mongoose.Schema({
    name: {type: String, required: true},
    domainData: {type: String, required: true},
    variables: {type: String, required: true},
    constraints: {type: String, required: true},
    objective: {type: String, required: true},
    solution: {type: String, required: true}
}, {collection: "copModels"});

COPModelSchema.plugin(mongoosePaginate);

mongoose.model("COPModel", COPModelSchema);

module.exports = mongoose.model("COPModel");