function listar(id){
  $.ajax({
    url: 'data/middle.php',
    type: 'POST',
    data: {
      'hdnOperation': 'hdnProyecto',
      'hdnType':'listarProyectosPorUsuario',
      'id': id
    },
    dataType: 'json',
    success: function(data){
      if(data.Codigo==203){
        console.log(data.Data);
        var html = ""
        var tipo = "failed to load"
        var estado = ""
        for (var i = 0; i < data.Data.length; i++) {
          switch (data.Data[i][2]) {
            case '0':
              tipo = "Libre Disponibilidad"
              break;
            case '1':
              tipo = "Libre disponibilidad y compra de cartera"
              break;
            case '2':
              tipo = "Compra cartera"
              break;
            case '3':
              tipo = "Credito hipotecario"
              break;
            case '4':
              tipo = "Credito comercial"
              break;
            case '5':
              tipo = "Credito automotriz"
              break;
            case '6':
              tipo = "Cuenta Corriente"
              break;
            case '7':
              tipo = "Cuenta Corriente y Compra de cartera"
              break;
            default:

          }
          var res = ""
          switch (data.Data[i][6]) {
            case '0':
              estado = '<button type="button" class="btn btn-lg btn-info btn-icon btn-round"><button>'
              res = "Revisión en transito"
              break;
            case '1':
              estado = '<button type="button" class="btn btn-lg btn-success btn-icon btn-round"></button>'
              res = "Solicitud Aprobada! Felicidades abonar <a href='#'>aquí</a>"
              break;
            case '2':
              estado = '<button type="button" class="btn btn-lg btn-danger btn-icon btn-round"><button>'
              res = "Se solicitan las ultimas 3 liquidaciones de sueldo"
              break;
            case '3':
              estado = '<button type="button" class="btn btn-lg btn-warning btn-icon btn-round"><button>'
              res = "Se solicitan las ultimas 3 liquidaciones de sueldo"
              break;
            default:

          }
          html += "<tr>"
          html += "<td>" + tipo + "</td>"
          html += "<td>" + data.Data[i][3] + "</td>"
          html += "<td>" + estado + "</td>"
          html += "<td>" + res + "</td>"
          html += "</tr>"
        }
        html += "</tr>"
        $("#listado").html(html)
      }else{
        console.log(data);
      }
    }
  });
}
