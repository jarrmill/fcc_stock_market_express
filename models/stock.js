const mongoose = require('mongoose');
const ObkectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const stockSchema = new Schema({
  name: String,
  column_names: Array,
  color: String,
  data: Array,
});

const StockClass = mongoose.model('stock', stockSchema);

module.exports = StockClass;
