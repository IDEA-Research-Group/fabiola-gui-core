var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

var COPModelSchema = new mongoose.Schema({
    name: {type: String, required: true},
    model: {type: String, required: true}
}, {collection: "copModels"});

COPModelSchema.plugin(mongoosePaginate);

mongoose.model("COPModel", COPModelSchema);

module.exports = mongoose.model("COPModel");