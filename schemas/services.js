//Services.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var serviceSchema = new Schema({
  client:  String,
  registro: { type: Date, default: Date.now },
  nombre: String,
  objetivo: String,
  monto: Number,
  cuotas: String,
  desfase: Boolean,
  tasa: {type: String, default: 0},
  valorcuota: {type: Number, default: 0},
  estado: { type: String, default: 'En revision' },
  revision: { type: Number, default: 0 },
  actualizado: { type: Date, default: Date.now },
  mensaje: String,
  visible: { type: Boolean, default: true },
  sucursal: String,
  aprobado: { type: Boolean, default: false },
  fechafirma: String
});
// the schema is useless so far
// we need to create a model using it
var Service = mongoose.model('Service', serviceSchema)

// make this available to our users in our Node applications
module.exports = Service
