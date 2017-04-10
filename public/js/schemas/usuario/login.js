function login(rut,password){
  $.ajax({
    url: 'data/middle.php',
    type: 'POST',
    data: {
      'hdnOperation': 'hdnUsuario',
      'hdnType':'loginUsuario',
      'rut': rut,
      'password': password
    },
    dataType: 'json',
    success: function(data){
      if(data.Codigo==201){
        //console.log(data);
        //happyAlert("Operation succesful");
        localStorage.setItem("id", data.Data[0]);
        localStorage.setItem("rut", data.Data[1]);
        localStorage.setItem("nombre", data.Data[2]);
        localStorage.setItem("apellido", data.Data[3] + " " + data.Data[4]);
        localStorage.setItem("completo", data.Data[2] + " " +data.Data[3] + " " + data.Data[4]);
        localStorage.setItem("correo", data.Data[5]);
        localStorage.setItem("estadoCivil", data.Data[6]);
        localStorage.setItem("direccion", data.Data[7]);
        localStorage.setItem("renta", data.Data[8]);
        localStorage.setItem("numHijos", data.Data[9]);
        localStorage.setItem("nacionalidad", data.Data[10]);
        localStorage.setItem("fechaNacimiento", data.Data[11]);
        localStorage.setItem("inicioTrabajo", data.Data[13]);
        localStorage.setItem("empresa", data.Data[14]);
        window.location.href = "panel.html";
      }else{
        console.log(data);
        happyAlert(data.Message);
      }
    }
  });
}
