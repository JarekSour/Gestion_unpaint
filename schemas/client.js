//Client.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var clientSchema = new Schema({
  manager: String,
  executive:  String,
  sucursal: String,
  registro: { type: Date, default: Date.now },
  estado: { type: Boolean, default: false },
  recovery: { type: Boolean, default: false },
  token: String,
  estadorenta: { type: Boolean, default: false },
  nombre: String,
  apepa: String,
  apema: String,
  rut: String,
  sexo: String,
  telefono: String,
  estadocivil: String,
  nacionalidad: String,
  nacimiento: String,
  hijos: Number,
  direccion: String,
  ingreso: Number,
  situacion: String,
  empleador: String,
  correo: String,
  password: String
});
// the schema is useless so far
// we need to create a model using it
var Client = mongoose.model('Client', clientSchema)

// make this available to our users in our Node applications
module.exports = Client
