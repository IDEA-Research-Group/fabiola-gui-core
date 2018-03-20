var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

var ModelDefinitionSchema = new mongoose.Schema({
    name: {type: String, required: true},
    domainData: {type: String, required: true},
    variables: {type: String, required: true},
    constraints: {type: String, required: true},
    objective: {type: String, required: true},
    solution: {type: String, required: true}
}, {collection: "modelDefinitions"});

ModelDefinitionSchema.plugin(mongoosePaginate);

mongoose.model("ModelDefinition", ModelDefinitionSchema);

module.exports = mongoose.model("ModelDefinition");