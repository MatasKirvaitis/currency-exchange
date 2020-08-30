const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rateSchema = new Schema({
  _id: String,
  rate: Number,
  name: String,
}, { collection: 'rates' });

const renewedSchema = new Schema({
  _id: String,
  date: String,
}, { collection: 'renewed' });

const logsSchema = new Schema({
  _id: String,
  cookieId: String,
  fromCurrency: String,
  toCurrency: String,
  amount: Number,
  timestamp: String
}, { collection: 'logs' });

module.exports = { rateSchema, renewedSchema, logsSchema };