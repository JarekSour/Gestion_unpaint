//sucursal.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sucursalSchema = new Schema({
  jof:  String,
  telefono: String,
  direccion: String,
  token: String,
  estado: { type:Boolean, dafault:false },
  date: { type: Date, default: Date.now },
  sucursal: String
});
// the schema is useless so far
// we need to create a model using it
var Sucursal = mongoose.model('Sucursal', sucursalSchema)

// make this available to our users in our Node applications
module.exports = Sucursal
