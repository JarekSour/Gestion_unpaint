//Propiedad.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var propiedadSchema = new Schema({
  propiedad: String,
  direccion: String,
  valor: Number,
  checkInmueble: { type: Boolean, default: false },
  cuotas: Number,
  client: String,
  fecha: { type: Date, default: Date.now },
  estado: { type: Boolean, default: true },
  confirmado: { type: Boolean, default: false },
  desactivado: Date
});
// the schema is useless so far
// we need to create a model using it
var Propiedad = mongoose.model('Propiedad', propiedadSchema)

// make this available to our users in our Node applications
module.exports = Propiedad
