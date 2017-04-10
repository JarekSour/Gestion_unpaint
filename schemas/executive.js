//Executive.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var executiveSchema = new Schema({
  executive:  String,
  sucursal: String,
  registro: { type: Date, default: Date.now },
  estado: { type: Boolean, default: false },
  nombre: String,
  apepa: String,
  apema: String,
  rut: String,
  telefono: String,
  token: String,
  correo: String,
  password: String,
  situacion: { type: String, default: 'Activo' },
});
// the schema is useless so far
// we need to create a model using it
var Executive = mongoose.model('Executive', executiveSchema)

// make this available to our users in our Node applications
module.exports = Executive
