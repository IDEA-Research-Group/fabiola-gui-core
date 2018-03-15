var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

var ResultSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.ObjectId, required: false},
    instanceId: {type: mongoose.Schema.ObjectId, required: true},
    in: { type: [{}], required: true },
    out: { type: [{}], required: true },
    ot: { type: [{}], required: true },
    metrics: { type: [{}], required: true }
}, {collection: "results"});

ResultSchema.plugin(mongoosePaginate);

mongoose.model("Result", ResultSchema);

module.exports = mongoose.model("Result");