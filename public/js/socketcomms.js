var socket;

  function initSocket() {
    socket = io.connect(''); // socket.io init
    socket.emit('firstLoad', 1);

    socket.on('data', function (data) {
      printLog(data, msgcolor)
    });

    socket.on('ports', function (data) {
  		console.log(data);
      var options = $("#port");
      for (i = 0; i< data.length; i++) {
        options.append($("<option />").val(data[i].comName).text(data[i].comName));
      }
      $('#connect').removeClass('disabled')
  	});

    $('#refreshPort').on('click', function() {
        $('#port').find('option').remove().end()
        socket.emit('refreshPorts', 1);

    });

    $('#connect').on('click', function() {
      var portName = $('#port').val();
      var baudRate = $('#baud').val();
      socket.emit('connectTo', portName + ',' + baudRate);
      isConnected = true;
    });

    $('#sendCommand').on('click', function() {
        var commandValue = $('#command').val();
        sendGcode(commandValue);
        $('#command').val('');
    });

  }

function sendGcode(gcode) {
  socket.emit('serialSend', gcode);
}
