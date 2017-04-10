//Files.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var fileSchema = new Schema({
  client: String,
  fieldname: String,
  originalname: String,
  encoding: String,
  mimetype: String,
  destination: String,
  filename: String,
  path: String,
  size: Number,
  type: { type: String, default: "Documentos" },
  state: { type: String, default: "Waiting" },
  date: { type: Date, default: Date.now }
});
// the schema is useless so far
// we need to create a model using it
var Files = mongoose.model('Files', fileSchema)

// make this available to our users in our Node applications
module.exports = Files
