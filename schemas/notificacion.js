//Notificacion.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var notificacionSchema = new Schema({
  executive:  String,
  jof: String,
  sucursal: String,
  registro: { type: Date, default: Date.now },
  motivo: String,
  mensaje: String,
  visto: { type: Boolean, default: false }
});
// the schema is useless so far
// we need to create a model using it
var Notifica = mongoose.model('Notifica', notificacionSchema)

// make this available to our users in our Node applications
module.exports = Notifica
