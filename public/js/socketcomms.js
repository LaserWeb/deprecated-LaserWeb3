var socket, isConnected, playing, connectVia;
var jobStartTime = -1;

function initSocket() {
  socket = io.connect('http://localhost:8000'); // socket.io init
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
  console.log('Sending', gcode)
  var connectVia = $('#connectVia').val()
  if (connectVia == "USB") {
    socket.emit('serialSend', gcode);
  } else if (connectVia == "Ethernet") {
    runCommand(gcode);
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
  }
}

function playpauseMachine() {
  if (isConnected) {
    if (playing) {
      if (paused) {
        // sendGcode('~');
        var connectVia = $('#connectVia').val()
        if (connectVia == "USB") {
          socket.emit('unpause', 1);
        } else if (connectVia == "Ethernet") {
          runCommand('resume');
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
          } else if (connectVia == "Ethernet") {
            runCommand('suspend');
            runCommand(laseroffcmd)
          }
        } else {
          if (connectVia == "USB") {
            socket.emit('pause', 0);
          } else if (connectVia == "Ethernet") {
            runCommand('pause');
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
  $('#machineStatus').html(t[0]);
  $('#mX').html(t[6]);
  $('#mY').html(t[7]);
  $('#mZ').html(t[8]);
  if (bullseye) {
    setBullseyePosition(t[6], t[7], t[8]); // Also updates #mX #mY #mZ
  }
}
