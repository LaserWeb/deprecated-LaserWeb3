//"use strict";
var socket, isConnected, connectVia;
var jobStartTime = -1;
var playing = false;
var paused = false;
var firmware;
var ovStep = 1;
var ovLoop;

function initSocket() {
  socket = io.connect(''); // socket.io init
  socket.emit('firstLoad', 1);

  socket.on('data', function (data) {
    $('#syncstatus').html('Socket OK');
    isConnected = true;
    if (data.indexOf('<') === 0) {
      updateStatus(data);
    } else if (data ==='ok') {
      printLog(data, '#cccccc', "usb");
    } else {
      printLog(data, msgcolor, "usb");
    }
    if (data.indexOf('LPC176')) {	//LPC1768 or LPC1769 should be Smoothie
      $('#overrides').removeClass('hide');
    }
    if (data.indexOf('Grbl')) {
      if (parseFloat(data) >= 1.1) {	//is Grbl >= v1.1
        $('#overrides').removeClass('hide');
      }
    }
  });

  // smoothie feed override report (from server)
  socket.on('feedOverride', function (data) {
    $('#oF').html(data.toString() + '%');
  });

  // smoothie spindle override report (from server)
  socket.on('spindleOverride', function (data) {
    $('#oS').html(data.toString() + '%');
  });

  socket.on('ports', function (data) {
    $('#syncstatus').html('Socket Init');
    var options = $("#port");
    for (var i = 0; i< data.length; i++) {
      options.append($("<option />").val(data[i].comName).text(data[i].comName));
    }
    $('#connect').removeClass('disabled');
    // Might as well pre-select the last-used port and buffer
    var lastUsed = loadSetting("lastUsedPort");
    var lastBaud = loadSetting("lastUsedBaud");
    $("#port option:contains(" + lastUsed + ")").attr('selected', 'selected');
    $("#baud option:contains(" + lastBaud + ")").attr('selected', 'selected');
  });

  socket.on('activePorts', function (data) {
    console.log('activePorts' + data);
  });

  socket.on('connectStatus', function (data) {
	console.log(data);
    $('#connectStatus').html(data);
    $('#syncstatus').html('Socket OK');
  });

  $('#refreshPort').on('click', function() {
    $('#port').find('option').remove().end();
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
    $('#closePort').removeClass('disabled');
  });

  $('#closePort').on('click', function() {
    socket.emit('closePort', 1);
    isConnected = false;
    $('#closePort').addClass('disabled');
    $('#machineStatus').html('Not Connected');
    $("#machineStatus").removeClass('badge-ok');
    $("#machineStatus").addClass('badge-notify');
    $("#machineStatus").removeClass('badge-warn');
    $("#machineStatus").removeClass('badge-busy');
    $('#overrides').addClass('hide');
  });

  $('#sendCommand').on('click', function() {
    var commandValue = $('#command').val();
    sendGcode(commandValue);
    $('#command').val('');
  });

  socket.on('qCount', function (data) {
    data = parseInt(data);
    $('#queueCnt').html('Queued: ' + data);
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

	$('body').on('keydown', function(ev) {
		if (ev.keyCode === 17) {
			//CTRL key down > set override stepping to 10
			ovStep = 10;
		}
	});

	$('body').on('keyup', function(ev) {
		if (ev.keyCode === 17) {
			//CTRL key released-> reset override stepping to 1
			ovStep = 1;
		}
	});

	// increase feed override
	$('#iF').on('mousedown', function(ev) {
		console.log("F+ mousedown");
		override('F', ovStep);
		ovLoop = setInterval(function() {
			override('F', ovStep);
		}, 300);
	});

	$('#iF').on('mouseup', function(ev) {
		console.log("F+ mouseup");
		clearInterval(ovLoop);
	});

	$('#iF').on('mouseout', function(ev) {
		console.log("F+ mouseout");
		clearInterval(ovLoop);
	});

	// decrease feed override
	$('#dF').on('mousedown', function(ev) {
		console.log("F- mousedown");
		override('F', -ovStep);
		ovLoop = setInterval(function() {
			override('F', -ovStep);
		}, 300);
	});

	$('#dF').on('mouseup', function(ev) {
		console.log("F- mouseup");
		clearInterval(ovLoop);
	});

	$('#dF').on('mouseout', function(ev) {
		console.log("F- mouseout");
		clearInterval(ovLoop);
	});

	// reset feed override
	$('#rF').on('click', function(ev) {
		console.log("F reset");
		override('F', 0);
	});

	// increase spindle override
	$('#iS').on('mousedown', function(ev) {
		console.log("S+ mousedown");
		override('S', ovStep);
		ovLoop = setInterval(function() {
			override('S', ovStep);
		}, 300);
	});

	$('#iS').on('mouseup', function(ev) {
		console.log("S+ mouseup");
		clearInterval(ovLoop);
	});

	$('#iS').on('mouseout', function(ev) {
		console.log("S+ mouseout");
		clearInterval(ovLoop);
	});

	// decrease spindle override
	$('#dS').on('mousedown', function(ev) {
		console.log("S- mousedown");
		override('S', -ovStep);
		ovLoop = setInterval(function() {
			override('S', -ovStep);
		}, 300);
	});

	$('#dS').on('mouseup', function(ev) {
		console.log("S- mouseup");
		clearInterval(ovLoop);
	});

	$('#dS').on('mouseout', function(ev) {
		console.log("S- mouseout");
		clearInterval(ovLoop);
	});

	// reset spindle override
	$('#rS').on('click', function(ev) {
		console.log("S reset");
		override('S', 0);
	});
}

function sendGcode(gcode) {
  // printLog("<i class='fa fa-arrow-right' aria-hidden='true'></i>"+ gcode, msgcolor)
  if(gcode) {
    // console.log('Sending', gcode)
    var connectVia = $('#connectVia').val();
    if (connectVia === "USB") {
      socket.emit('serialSend', gcode);
    } else if (connectVia === "Ethernet") {
      runCommand(gcode);
    } else if (connectVia === "ESP8266") {
      if (ws) {
        if (ws.readyState == '1') {
          ws.send(gcode);
        } else {
          printLog("Unable to send gcode: Not connected to Websocket: "+ gcode, errorcolor, "wifi");
        }
      } else {
        printLog("Unable to send gcode: Not connected: "+ gcode, errorcolor, "wifi");
      }
    }
  }
}

function stopMachine () {
  var laseroffcmd = document.getElementById('laseroff').value;
  var connectVia = $('#connectVia').val();
  if (connectVia === "USB") {
    if (laseroffcmd) {
      socket.emit('stop', laseroffcmd);
    } else {
      socket.emit('stop', 0);
    }
  } else if (connectVia === "Ethernet") {
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
  } else if (connectVia === "ESP8266") {
    if (laseroffcmd) {
      gcodeQueue = [];
      sendGcode(laseroffcmd);
      sendGcode('abort');
      sendGcode(laseroffcmd);
    } else {
      gcodeQueue = [];
      sendGcode('abort');
    }
    $('#queueCnt').html('Queued: ' + gcodeQueue.length);
  }
  $('#playicon').addClass('fa-play');
  $('#playicon').removeClass('fa-pause');
  playing = false;
}

function playpauseMachine() {
  if (isConnected) {
    var connectVia = $('#connectVia').val();
    if (playing == true) {
      if (paused == true) {
        // unpause
        // sendGcode('~');
        var laseroncmd = document.getElementById('laseron').value;
		if (laseroncmd.length === 0) {
			laseroncmd = 0;
		}
        if (connectVia === "USB") {
          socket.emit('unpause', laseroncmd);
        } else if (connectVia === "Ethernet") {
          runCommand('resume');
        } else if (connectVia === "ESP8266") {
          // Do nothing.  The paused var starts the uploadLine function
          paused = false;
          uploadLine();
        }
        paused = false;
        $('#playicon').removeClass('fa-play');
        $('#playicon').addClass('fa-pause');
      // end ifPaused
      } else {
        // pause
        var laseroffcmd = document.getElementById('laseroff').value;
        if (laseroffcmd) {
          if (connectVia === "USB") {
            socket.emit('pause', laseroffcmd);
            paused = true;
          } else if (connectVia === "Ethernet") {
            runCommand('suspend');
            runCommand(laseroffcmd);
            paused = true;
          } else if (connectVia === "ESP8266") {
            sendGcode("suspend");
            sendGcode(laseroffcmd);
            paused = true;
          }
        } else {
          if (connectVia === "USB") {
            socket.emit('pause', 0);
          } else if (connectVia === "Ethernet") {
            runCommand('pause');
          } else if (connectVia === "ESP8266") {
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
    printLog('You have to Connect to a machine First!', errorcolor, "usb");
  }
}

function playGcode() {
  jobStartTime = new Date(Date.now());
  printLog("Job started at " + jobStartTime.toString(), msgcolor, "file");
  var connectVia = $('#connectVia').val();
  if (connectVia === "USB") {
    if (isConnected) {
      var g;
      g = prepgcodefile();
      sendGcode(g);
      playing = true;
      $('#playicon').removeClass('fa-play');
      $('#playicon').addClass('fa-pause');
    } else {
      printLog('Not Connected', errorcolor, "usb");
    }
  } else if (connectVia === "Ethernet") {
    // Upload to SD Wizard
  } else if (connectVia === "ESP8266") {
    // Upload to SD
    $('#playicon').removeClass('fa-play');
    $('#playicon').addClass('fa-pause');
    playing = true;
    espPlay();
  }
}

function homeMachine() {
    var homecommand = document.getElementById('homingseq').value;
    sendGcode(homecommand);
}

function updateStatus(data) {
  // Smoothieware: <Idle,MPos:49.5756,279.7644,-15.0000,WPos:0.0000,0.0000,0.0000>  
  // till GRBL v0.9: <Idle,MPos:0.000,0.000,0.000,WPos:0.000,0.000,0.000>
  // since GRBL v1.1: <Idle|WPos:0.000,0.000,0.000|Bf:15,128|FS:0,0|Pn:S|WCO:0.000,0.000,0.000> (when $10=2)

  // Extract state
  var state = data.substring(data.indexOf('<')+1, data.search(/(,|\|)/));
  if (state === 'Alarm') {
    $("#machineStatus").removeClass('badge-ok');
    $("#machineStatus").addClass('badge-notify');
    $("#machineStatus").removeClass('badge-warn');
    $("#machineStatus").removeClass('badge-busy');
  } else if (state === 'Home') {
    $("#machineStatus").removeClass('badge-ok');
    $("#machineStatus").removeClass('badge-notify');
    $("#machineStatus").removeClass('badge-warn');
    $("#machineStatus").addClass('badge-busy');
  } else if (state === 'Hold') {
    $("#machineStatus").removeClass('badge-ok');
    $("#machineStatus").removeClass('badge-notify');
    $("#machineStatus").addClass('badge-warn');
    $("#machineStatus").removeClass('badge-busy');
  } else if (state === 'Idle') {
    $("#machineStatus").addClass('badge-ok');
    $("#machineStatus").removeClass('badge-notify');
    $("#machineStatus").removeClass('badge-warn');
    $("#machineStatus").removeClass('badge-busy');
  } else if (state === 'Run') {
    $("#machineStatus").removeClass('badge-ok');
    $("#machineStatus").removeClass('badge-notify');
    $("#machineStatus").removeClass('badge-warn');
    $("#machineStatus").addClass('badge-busy');
  }
  $('#machineStatus').html(state);

  // Extract Pos
  var startPos = data.search(/wpos:/i) + 5;
  var pos;
  if (startPos>5){
    pos = data.replace('>','').substr(startPos).split(/,|\|/, 3);
  } else {
	  startPos = data.search(/mpos:/i) + 5;
	  if (startPos>5){
		pos = data.replace('>','').substr(startPos).split(/,|\|/, 3);
	  }
  }
  if (Array.isArray(pos)){
    $('#mX').html(pos[0]);
    $('#mY').html(pos[1]);
    $('#mZ').html(pos[2]);
    if (bullseye) {
      setBullseyePosition(pos[0], pos[1], pos[2]); // Also updates #mX #mY #mZ
    }
  }

  // Extract override values (for Grbl > v1.1 only!)
  startOv = data.search(/ov:/i) + 3;
  if (startOv>3){
    var ov = data.replace('>','').substr(startOv).split(/,|\|/, 3);
    //printLog("Overrides: " + ov[0] + ',' + ov[1] + ',' + ov[2],  msgcolor, "USB");
	if (Array.isArray(ov)){
	  $('#oF').html(ov[0].trim() + '%');
	  //$('#oR').html(ov[1].trim() + '%');
	  $('#oS').html(ov[2].trim() + '%');
	}
  }
  
  // Extract realtime Feedrate (for Grbl > v1.1 only!)
  var startFS = data.search(/FS:/i) + 3;
  if (startFS>3){
    var fs = data.replace('>','').substr(startFS).split(/,|\|/, 2);
	if (Array.isArray(fs)){
	  //$('#mF').html(fs[0].trim());
	  //$('#mS').html(fs[1].trim());
	}
  }
}

function override(param, value) {
  if (isConnected) {
    var connectVia = $('#connectVia').val();
    if (connectVia === "USB") {
      switch (param) {
        case 'F':
		  socket.emit('feedOverride', value);
		  break;
		case 'S':  
		  socket.emit('spindleOverride', value);
		  break;
      }
    } else if (connectVia === "Ethernet") {
      runCommand(value);
    } else if (connectVia === "ESP8266") {
      // needs to be programmed
    }
  } else {
    printLog('You have to Connect to a machine First!', errorcolor, "usb");
  }
}
