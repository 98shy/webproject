const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  productname: {type: String, trim: true, required: true},
  reserver: {type: String, trim: true, required: true},
  phonenumber: {type: String, trim: true, required: true},
  date: {type: String, trim: true, required: true},
  count: {type: String, trim: true, required: true},
  totalcost: {type: String, trim: true, required: true},
  reservedAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: { virtuals: true}
});
schema.plugin(mongoosePaginate);
var Reserve = mongoose.model('Reserve', schema);

module.exports = Reserve;
