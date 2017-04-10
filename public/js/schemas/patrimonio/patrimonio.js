function nuevoInmueble(idUsuario,tipo,direccion,valor,estado,renta){
  $.ajax({
    url: 'data/middle.php',
    type: 'POST',
    data: {
      'hdnOperation': 'hdnDatos',
      'hdnType':'addInmueble',
      'id':idUsuario,
      'tipo': tipo,
      'direccion': direccion,
      'valor': valor,
      'estado': estado,
      'renta': renta
    },
    dataType: 'json',
    success: function(data){
      if(data.Codigo==209){
        console.log(data);
        happyAlert("Operación Exitosa");
      }else{
        console.log(data);
        happyAlert(data.Message);
      }
    }
  });
}

function nuevoVehiculo(idUsuario,tipo,marca,modelo,fecha,valor){
  $.ajax({
    url: 'data/middle.php',
    type: 'POST',
    data: {
      'hdnOperation': 'hdnDatos',
      'hdnType':'addVehiculo',
      'id':idUsuario,
      'tipo': tipo,
      'marca': marca,
      'modelo': modelo,
      'fecha': fecha,
      'valor': valor
    },
    dataType: 'json',
    success: function(data){
      if(data.Codigo==210){
        console.log(data);
        happyAlert("Operación Exitosa");
      }else{
        console.log(data);
        happyAlert(data.Message);
      }
    }
  });
}

function nuevaSociedad(idUsuario,rut,nombre,porcentaje,tipo){
  $.ajax({
    url: 'data/middle.php',
    type: 'POST',
    data: {
      'hdnOperation': 'hdnDatos',
      'hdnType':'addSociedad',
      'id':idUsuario,
      'rut': rut,
      'nombre': nombre,
      'porcentaje': porcentaje,
      'tipo': tipo
    },
    dataType: 'json',
    success: function(data){
      if(data.Codigo==210){
        console.log(data);
        happyAlert("Operación Exitosa");
      }else{
        console.log(data);
        happyAlert(data.Message);
      }
    }
  });
}

function cargarPatrimonio(idUsuario){
  $.ajax({
    url: 'data/middle.php',
    type: 'POST',
    data: {
      'hdnOperation': 'hdnDatos',
      'hdnType':'verDatos',
      'id':idUsuario
    },
    dataType: 'json',
    success: function(data){
      if(data.Codigo==212){
        var html = "<br><center><h5><u>MI PATRIMONIO</u></h5></center><br>"
        html += "<center><p>Numero de inmuebles: " + data.Inmueble.length + "</br>"
        html += "Numero de Sociedades: " + data.Sociedad.length + "</br>"
        html += "Numero de Vehiculos: " + data.Vehiculo.length + "</p></center>"
        $("#patrimonio").html(html)
      }else{
        console.log(data);
        happyAlert(data.Message);
      }
    }
  });
}
