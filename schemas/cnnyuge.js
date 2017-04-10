//conyuge.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// create a schema
var conyugeSchema = new Schema({
  client:  String,
  sucursal: String,
  registro: { type: Date, default: Date.now },
  rut: String,
  nombre: String
});
// the schema is useless so far
// we need to create a model using it
var Conyuge = mongoose.model('Conyuge', conyugeSchema)

// make this available to our users in our Node applications
module.exports = Conyuge
