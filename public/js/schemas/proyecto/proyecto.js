function nuevoProyecto(idUsuario,nombre,objetivo,monto,numCuotas,desfase){
  $.ajax({
    url: 'data/middle.php',
    type: 'POST',
    data: {
      'hdnOperation': 'hdnProyecto',
      'hdnType':'nuevoProyecto',
      'idUsuario': idUsuario,
      'nombre': nombre,
      'objetivo': objetivo,
      'monto': monto,
      'numCuotas': numCuotas,
      'desfase': desfase
    },
    dataType: 'json',
    success: function(data){
      if(data.Codigo==202){
        console.log(data);
        happyAlert("Felicidades!, le estaremos informando del avance de su petición!");
      }else{
        console.log(data);
        happyAlert(data.Message);
      }
    }
  });
}
