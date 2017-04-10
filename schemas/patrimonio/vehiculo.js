//Vehiculo.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var vehiculoSchema = new Schema({
  vehiculo: String,
  patente: String,
  marca: String,
  year: Number,
  valor: Number,
  modelo: String,
  client: String,
  fecha: { type: Date, default: Date.now },
  estado: { type: Boolean, default: true },
  confirmado: { type: Boolean, default: false },
  desactivado: Date
});
// the schema is useless so far
// we need to create a model using it
var Vehiculo = mongoose.model('Vehiculo', vehiculoSchema)

// make this available to our users in our Node applications
module.exports = Vehiculo
