var socket, isConnected, playing;

  function initSocket() {
    socket = io.connect(''); // socket.io init
    socket.emit('firstLoad', 1);

    socket.on('data', function (data) {

      $('#syncstatus').html('Socket OK');
      isConnected = true;
      if ($('#console p').length > 300) {
        // remove oldest if already at 300 lines
        $('#console p').first().remove();
      }
      if (data.indexOf('<') == 0) {
        // https://github.com/grbl/grbl/wiki/Configuring-Grbl-v0.8#---current-status
        // remove first <
        var t = data.substr(1);

          // remove last >
        t = t.substr(0,t.length-2);

        // split on , and :
        t = t.split(/,|:/);

        //<Idle,MPos:26.7550,0.0850,0.0000,WPos:26.7550,0.0850,0.0000>
        //0 status
        //1 MPos
        //2 mx
        //3 my
        //4 mz
        //5 WPos
        //6 wx
        //7 wy
        //8 wz
        if (t[0] == 'Alarm') {
          $("#machineStatus").removeClass('badge-ok')
          $("#machineStatus").addClass('badge-notify')
          $("#machineStatus").removeClass('badge-warn')
          $("#machineStatus").removeClass('badge-busy')
        } else if (t[0] == 'Home') {
          $("#machineStatus").removeClass('badge-ok')
          $("#machineStatus").removeClass('badge-notify')
          $("#machineStatus").removeClass('badge-warn')
          $("#machineStatus").addClass('badge-busy')
        } else if (t[0] == 'Hold') {
          $("#machineStatus").removeClass('badge-ok')
          $("#machineStatus").removeClass('badge-notify')
          $("#machineStatus").addClass('badge-warn')
          $("#machineStatus").removeClass('badge-busy')
        } else if (t[0] == 'Idle') {
          $("#machineStatus").addClass('badge-ok')
          $("#machineStatus").removeClass('badge-notify')
          $("#machineStatus").removeClass('badge-warn')
          $("#machineStatus").removeClass('badge-busy')
        } else if (t[0] == 'Run') {
          $("#machineStatus").removeClass('badge-ok')
          $("#machineStatus").removeClass('badge-notify')
          $("#machineStatus").removeClass('badge-warn')
          $("#machineStatus").addClass('badge-busy')
        }


syncstatus
        $('#machineStatus').html(t[0]);
        $('#mX').html(t[6]);
        $('#mY').html(t[7]);
        $('#mZ').html(t[8]);
          if (bullseye) {
            setBullseyePosition(t[6], t[7], t[8]); // Also updates #mX #mY #mZ
          }
        } else if (data =='ok') {
        printLog(data, '#cccccc')
        } else {
        printLog(data, msgcolor)
      }
    });

    socket.on('ports', function (data) {
      $('#syncstatus').html('Socket Init');
      var options = $("#port");
      for (i = 0; i< data.length; i++) {
        options.append($("<option />").val(data[i].comName).text(data[i].comName));
      }
      $('#connect').removeClass('disabled')
      // Might as well pre-select the last-used port and buffer
      var lastUsed = localStorage.getItem("lastUsedPort");
      var lastBaud = localStorage.getItem("lastUsedBaud");
      $("#port option:contains(" + lastUsed + ")").attr('selected', 'selected');
      $("#baud option:contains(" + lastBaud + ")").attr('selected', 'selected');

  	});

    socket.on('activePorts', function (data) {
      console.log('activePorts' + data)
    });

    socket.on('connectStatus', function (data) {
  		console.log(data);
      $('#connectStatus').html(data)
      $('#syncstatus').html('Socket OK');
  	});

    $('#refreshPort').on('click', function() {
        $('#port').find('option').remove().end()
        socket.emit('refreshPorts', 1);
        $('#syncstatus').html('Socket Refreshed');


    });

    $('#connect').on('click', function() {
      var portName = $('#port').val();
      var baudRate = $('#baud').val();
      socket.emit('connectTo', portName + ',' + baudRate);
      isConnected = true;
      localStorage.setItem("lastUsedPort", portName);
      localStorage.setItem("lastUsedBaud", baudRate);
      $('#closePort').removeClass('disabled')
    });

    $('#closePort').on('click', function() {
      socket.emit('closePort', 1);
      isConnected = false;
      $('#closePort').addClass('disabled')
      $('#machineStatus').html('Not Connected');
      $("#machineStatus").removeClass('badge-ok')
      $("#machineStatus").addClass('badge-notify')
      $("#machineStatus").removeClass('badge-warn')
      $("#machineStatus").removeClass('badge-busy')
    });


    $('#sendCommand').on('click', function() {
        var commandValue = $('#command').val();
        sendGcode(commandValue);
        $('#command').val('');
    });

    socket.on('qCount', function (data) {
      data = parseInt(data);
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
  console.log('Sending', gcode)
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
