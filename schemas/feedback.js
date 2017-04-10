//Feedback.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var feedbackSchema = new Schema({
  client:  String,
  sucursal: String,
  registro: { type: Date, default: Date.now },
  motivo: String,
  mensaje: String
});
// the schema is useless so far
// we need to create a model using it
var Feedback = mongoose.model('Feedback', feedbackSchema)

// make this available to our users in our Node applications
module.exports = Feedback
