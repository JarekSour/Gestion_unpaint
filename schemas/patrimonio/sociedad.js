//Sociedad.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var sociedadSchema = new Schema({
  sociedad: String,
  nombre: String,
  rut: String,
  porcentaje: Number,
  client: String,
  fecha: { type: Date, default: Date.now },
  estado: { type: Boolean, default: true },
  confirmado: { type: Boolean, default: false },
  desactivado: Date
});
// the schema is useless so far
// we need to create a model using it
var Sociedad = mongoose.model('Sociedad', sociedadSchema)

// make this available to our users in our Node applications
module.exports = Sociedad
