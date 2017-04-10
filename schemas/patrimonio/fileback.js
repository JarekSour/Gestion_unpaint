//Fileback.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var filebackSchema = new Schema({
  patrimonio: String,
  fieldname: String,
  originalname: String,
  encoding: String,
  mimetype: String,
  destination: String,
  filename: String,
  path: String,
  size: Number,
  date: { type: Date, default: Date.now }
});
// the schema is useless so far
// we need to create a model using it
var Fileback = mongoose.model('Fileback', filebackSchema)

// make this available to our users in our Node applications
module.exports = Fileback
