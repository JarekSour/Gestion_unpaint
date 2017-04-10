//  cfm: Compromisos financieros mensuales
//  cm: Carga Maxima
//  ce: Compromisos Externos
//  cr: Carga Restante
//  r: Renta
//  f: factor
//  fc: factor carga
//  meg: Margen de endeudamiento Global
//  mer: Margen de endeudamiento Restante
//  p: indice
var f = [ 0, 4, 5, 8, 10]
var fc = [0, 0.3, 0.35, 0.4, 0.5]
var p = 0
function calcularCarga(r, ce, cfm) {
  if ( r >= 500000 || r <= 800000 ) {
    p = 1
  } else if ( r >= 801000 || r <= 1199999 ) {
    p = 2
  } else if ( r >= 1200000 || r <= 1999999 ) {
    p = 3
  } else if ( r >= 2000000 ) {
    p = 4
  }
  //  Formula para obtener el Margen de endeudamiento Global
  var meg = f[p] * r
  //  Formula para obtener el Margen de endeudamiento Restante
  var mer = meg - ce
  //  Formula para obtener la Carga Maxima
  var cm = fc[p] * r
  //  Formula para obtener la Carga Restante
  var cr = cm - cfm
  //  Retornar resultados
  return [mer, cr]
}
