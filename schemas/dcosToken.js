var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

var DcosTokenSchema = new mongoose.Schema({
    creationDate: {type: Date, required: false},
    token: {type: String, required: true}
}, {collection: "dcosTokens"});

DcosTokenSchema.plugin(mongoosePaginate);

DcosTokenSchema.index({creationDate: 1});

DcosTokenSchema.pre('save', function(next) {
    this.creationDate = new Date();
    next();
});

mongoose.model("DcosToken", DcosTokenSchema);

module.exports = mongoose.model("DcosToken");

