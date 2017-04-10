function nuevoDocumento(documento){
  $.ajax({
    url: 'data/middle.php',
    type: 'POST',
    data: documento,
    cache: false,
    dataType: 'json',
    processData: false, // Don't process the files
    contentType: false, // Set content type to false as jQuery will
    success: function(data){
      if(data.Codigo==207){
        console.log(data);
        happyAlert("Documento Subido exitosamente!");
      }else{
        console.log(data);
        happyAlert(data.Message);
      }
    }
  });
}

function listar(id){
  $.ajax({
    url: 'data/middle.php',
    type: 'POST',
    data: {
      'hdnOperation': 'hdnDocumento',
      'hdnType':'listarDocumentoUsuario',
      'id': id
    },
    dataType: 'json',
    success: function(data){
      if(data.Codigo==208){
        console.log(data.Data);
        var html = '<center><h5><u>MIS DOCUMENTOS</u></h5></center><br>'
        for (var i = 0; i < data.Data.length; i++) {
          html += "<center><P><b>" + data.Data[i][1] + "</b>  <i>" + data.Data[i][4] + "</i></P></center>"
        }
        $("#documentacion").html(html)
      }else{
        console.log(data);
      }
    }
  });
}
