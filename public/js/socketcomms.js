var socket, isConnected, connectVia;
var jobStartTime = -1;
var playing = false;
var paused = false;

function initSocket() {
  socket = io.connect(''); // socket.io init
  socket.emit('firstLoad', 1);

  socket.on('data', function (data) {
    $('#syncstatus').html('Socket OK');
    isConnected = true;
    if (data.indexOf('<') == 0) {
      updateStatus(data);
    } else if (data =='ok') {
    printLog(data, '#cccccc', "usb")
    } else {
    printLog(data, msgcolor, "usb")
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
    var lastUsed = loadSetting("lastUsedPort");
    var lastBaud = loadSetting("lastUsedBaud");
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
    saveSetting("lastUsedPort", portName);
    saveSetting("lastUsedBaud", baudRate);
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
      if (jobStartTime >= 0) {
        var jobFinishTime = new Date(Date.now());
        var elapsedTimeMS = jobFinishTime.getTime() - jobStartTime.getTime();
        var elapsedTime = Math.round(elapsedTimeMS / 1000);
        printLog("Job started at " + jobStartTime.toString(), msgcolor, "file");
        printLog("Job finished at " + jobFinishTime.toString(), msgcolor, "file");
        printLog("Elapsed time: " + elapsedTime + " seconds.", msgcolor, "file");
        jobStartTime = -1;

        // Update accumulated job time
        var accumulatedJobTimeMS = accumulateTime(elapsedTimeMS);

        printLog("Total accumulated job time: " + (accumulatedJobTimeMS / 1000).toHHMMSS());
      }
    }
  });
}

function sendGcode(gcode) {
  if(gcode) {
    // console.log('Sending', gcode)
    var connectVia = $('#connectVia').val()
    if (connectVia == "USB") {
      socket.emit('serialSend', gcode);
    } else if (connectVia == "Ethernet") {
      runCommand(gcode);
    } else if (connectVia == "ESP8266") {
      ws.send(gcode);
    }
  }
}

function stopMachine () {
  var laseroffcmd;
  laseroffcmd = document.getElementById('laseroff').value;
  var connectVia = $('#connectVia').val()
  if (connectVia == "USB") {
    if (laseroffcmd) {
      socket.emit('stop', laseroffcmd);
    } else {
      socket.emit('stop', 0);
    }
  } else if (connectVia == "Ethernet") {
    if (laseroffcmd) {
      runCommand('abort');
      runCommand(laseroffcmd);
      runCommand('\030');
      runCommand('$X');
      runCommand(laseroffcmd);
    } else {
      runCommand('abort');
      runCommand('\030');
    }
  } else if (connectVia == "ESP8266") {
    if (laseroffcmd) {
      gcodeQueue = [];
      sendGcode(laseroffcmd);
      sendGcode('abort');
      sendGcode(laseroffcmd);
    } else {
      gcodeQueue = [];
      sendGcode('abort');
    }
    $('#queueCnt').html('Queued: ' + gcodeQueue.length)
  }
  $('#playicon').addClass('fa-play');
  $('#playicon').removeClass('fa-pause');
  playing = false;

}

function playpauseMachine() {
  if (isConnected) {
    if (playing == true) {
      if (paused == true) {
        // sendGcode('~');
        var connectVia = $('#connectVia').val()
        if (connectVia == "USB") {
          socket.emit('unpause', 1);
        } else if (connectVia == "Ethernet") {
          runCommand('resume');
        } else if (connectVia == "ESP8266") {
          // Do nothing.  The paused var starts the uploadLine function
          paused = false;
          uploadLine();
        }
        paused = false;
        $('#playicon').removeClass('fa-play');
        $('#playicon').addClass('fa-pause');
      // end ifPaused
      } else {
        var laseroffcmd;
        laseroffcmd = document.getElementById('laseroff').value;
        if (laseroffcmd) {
          var connectVia = $('#connectVia').val()
          if (connectVia == "USB") {
            socket.emit('pause', laseroffcmd);
            paused = true;
          } else if (connectVia == "Ethernet") {
            runCommand('suspend');
            runCommand(laseroffcmd)
            paused = true;
          } else if (connectVia == "ESP8266") {
            sendGcode("suspend");
            sendGcode(laseroffcmd)
            paused = true;
          }
        } else {
          if (connectVia == "USB") {
            socket.emit('pause', 0);
          } else if (connectVia == "Ethernet") {
            runCommand('pause');
          } else if (connectVia == "ESP8266") {
            // Do nothing.  The paused var stops the uploadLine function
          }
        }
        paused = true;
        $('#playicon').removeClass('fa-pause');
        $('#playicon').addClass('fa-play');
      }
    // end isPlaying
    } else {
      playGcode();
    }
  // end isConnected
  } else {
    printLog('You have to Connect to a machine First!', errorcolor, "usb")
  }
};

function playGcode() {
  jobStartTime = new Date(Date.now());
  printLog("Job started at " + jobStartTime.toString(), msgcolor, "file");
  var connectVia = $('#connectVia').val()
  if (connectVia == "USB") {
    if (isConnected) {
      var g;
      g = prepgcodefile();
      sendGcode(g);
      playing = true;
      $('#playicon').removeClass('fa-play');
      $('#playicon').addClass('fa-pause');
    } else {
      printLog('Not Connected', errorcolor, "usb")
    }
  } else if (connectVia == "Ethernet") {
    // Upload to SD Wizard
  } else if (connectVia == "ESP8266") {
    // Upload to SD
    $('#playicon').removeClass('fa-play');
    $('#playicon').addClass('fa-pause');
    playing = true;
    espPlay();
  }
};

function homeMachine() {
    var homecommand;
    homecommand = document.getElementById('homingseq').value;
    sendGcode(homecommand);
};

function updateStatus(data) {
  // https://github.com/grbl/grbl/wiki/Configuring-Grbl-v0.8#---current-status
  // remove first <
  var t = data.substr(1);
    // remove last >
  t = t.substr(0,t.length-3);
  // split on , and :
  t = t.split(/,|:|>/);
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
  $('#machineStatus').html(t[0]);
  $('#mX').html(t[6]);
  $('#mY').html(t[7]);
  $('#mZ').html(t[8]);
  if (bullseye) {
    setBullseyePosition(t[6], t[7], t[8]); // Also updates #mX #mY #mZ
  }
}
