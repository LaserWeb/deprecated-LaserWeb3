var socket, isConnected, playing;

  function initSocket() {
    socket = io.connect(''); // socket.io init
    socket.emit('firstLoad', 1);

    socket.on('data', function (data) {
      if (data.indexOf('ok C: X:') == 0 || data.indexOf('C: X:') == 0) {
        data = data.replace(/:/g,' ');
  			data = data.replace(/X/g,' ');
  			data = data.replace(/Y/g,' ');
  			data = data.replace(/Z/g,' ');
  			data = data.replace(/E/g,' ');
  			var posArray = data.split(/(\s+)/);
  			$('#mX').html('X: '+posArray[4]);
  			$('#mY').html('Y: '+posArray[6]);
  			$('#mZ').html('Z: '+posArray[8]);
        setBullseyePosition(posArray[4], posArray[6], posArray[8]);
      } else if (data =='ok') {
        printLog(data, '#cccccc')
        } else {
        printLog(data, msgcolor)
      }
    });

    socket.on('ports', function (data) {
  		console.log(data);
      var options = $("#port");
      for (i = 0; i< data.length; i++) {
        options.append($("<option />").val(data[i].comName).text(data[i].comName));
      }
      $('#connect').removeClass('disabled')
  	});

    socket.on('connectStatus', function (data) {
  		console.log(data);
      $('#connectStatus').html(data)
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

    socket.on('qCount', function (data) {
      $('#queueCnt').html('Queued: ' + data)
      if (data < 1) {
          $('#playicon').removeClass('fa-pause');
          $('#playicon').addClass('fa-play');
          playing = false;
          paused = false;
      }
    });


  }

function sendGcode(gcode) {
  socket.emit('serialSend', gcode);
}

function playpauseMachine() {
    if (isConnected) {
        if (playing) {
            if (paused) {
                sendGcode('~');
                paused = false;
                $('#playicon').removeClass('fa-play');
                $('#playicon').addClass('fa-pause');
            } else {
                var laseroffcmd;
                laseroffcmd = document.getElementById('laseroff').value;
                sendGcode(laseroffcmd);
                sendGcode('!');
                paused = true;
                $('#playicon').removeClass('fa-pause');
                $('#playicon').addClass('fa-play');
            }
        } else {
            playGcode();
        }
    } else {
        printLog('You have to Connect to a machine First!', errorcolor)
    }



};


function playGcode() {
    var g;
    g = document.getElementById('gcodepreview').value;
    sendGcode(g);
    playing = true;
    $('#playicon').removeClass('fa-play');
    $('#playicon').addClass('fa-pause');
};
