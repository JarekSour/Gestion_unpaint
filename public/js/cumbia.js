function datas(){
  $.ajax({
    url: 'executive/news',
    type: 'GET',
    dataType: 'json',
    success: function(data){
      if(data.length>0){
        var html = ''
        var count = 0
        var nombre = ''

        for (var i = 0; i < data.length; i++) {
          if (!data[i].length) {
            nombre = data[i].nombre + ' ' + data[i].apepa + ' ' + data[i].apema
          } else {
            for (var x = 0; x < data[i].length; x++) {
              html += '<a href="javascript:void(0);" class="unit"><span class="icon-box"></span><p>' + nombre + ': ' + data[i][x].objetivo + '</p></a>'
              count++
            }
          }
        }
        $("#message-btn").html('<span class="notification-count">' + count + '</span>')
        $("#conteniendo").html(html)
      }
    }
  });
}
setInterval(datas(), 50000))
datas()
