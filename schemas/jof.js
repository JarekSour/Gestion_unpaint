//jof.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jofSchema = new Schema({
  jof:  String,
  nombre: String,
  apepa: String,
  apema: String,
  rut: String,
  correo: String,
  telefono: String,
  sucursal: String,
  token: String,
  estado: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  password: String
});
// the schema is useless so far
// we need to create a model using it
var Jof = mongoose.model('Jof', jofSchema)

// make this available to our users in our Node applications
module.exports = Jof
