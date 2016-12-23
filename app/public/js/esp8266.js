ws =  null;
queryLoop = null;
var blocked;
var gcodeQueue; gcodeQueue = [];
var heap;
var buffer = "";

function initEsp8266() {
  $('#espConnectBtn').on('click', function() {
    var espIP = $('#espIp').val();
    startWS(espIP);
  });

  $('#scanwifi').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation(); // only neccessary if something above is listening to the (default-)event too
      scanWifiSubnet()
  });
}


function espQueue(data) {
  data = data.split('\n')
  for (i=0; i<data.length; i++) {
    addQ(data[i])
    // console.log(data[i])
  }
}

function addQ(gcode) {
  gcodeQueue.push(gcode);
}

function uploadLine() {
  if(paused==false) {
    if (gcodeQueue.length > 0 && !blocked) {
        var gcode = gcodeQueue.shift()
        // console.log('Sent: '  + gcode + ' Q: ' + gcodeQueue.length)
        $('#queueCnt').html('Queued: ' + gcodeQueue.length)
        lastSent = gcode
        sendGcode(gcode + '\n');
        blocked = true;
      }
  }
}

function espPlay() {
    // espQueue("M28 "+ $('#saveasname').val() + "\n")
    g = prepgcodefile();
    espQueue(g);
    // espQueue("M29\n");
    uploadLine();
}

function stopWS() {
  // Close WS if already opened
  if (ws) {
    ws.close();
    ws = null;
  }
  $('#espConnectBtn').show();
  $('#espDisconnectBtn').hide();
}

// Start WebSocket
function startWS(url) {
  if (url === undefined )
    url = document.location.host;
  stopWS();
  ws = new WebSocket('ws://'+url+'/');
  saveSetting('espIpAddress', url);
  ws.binaryType = "arraybuffer";


  ws.onopen = function(e) {
    printLog("ESP8266 Connected to "+url, successcolor, 'wifi');
    $('#espConnectBtn').hide();
    $('#espDisconnectBtn').show();
    console.log(e);
    sendGcode('version');
    queryLoop = setInterval(function() {
        // console.log('StatusChkc')
        sendGcode('?\n');
        uploadLine();
    }, 200);
    $("#machineStatus").addClass('badge-ok')
    $("#machineStatus").removeClass('badge-notify')
    $("#machineStatus").removeClass('badge-warn')
    $("#machineStatus").removeClass('badge-busy')
    $('#machineStatus').html("Wifi Connected");
  };

  ws.onclose = function(e){
    printLog("ESP8266 closed! ", errorcolor, 'wifi');
    clearInterval(queryLoop);
    $('#espConnectBtn').show();
    $('#espDisconnectBtn').hide();
    $("#machineStatus").removeClass('badge-ok')
    $("#machineStatus").addClass('badge-notify')
    $("#machineStatus").removeClass('badge-warn')
    $("#machineStatus").removeClass('badge-busy')
    $('#machineStatus').html("Disconnected");
    console.log(e);
  };

  ws.onerror = function(e){
    printLog("ESP8266 Error! ", errorcolor, 'wifi');
    $('#espConnectBtn').show();
    $('#espDisconnectBtn').hide();
    console.log(e);
  };

  ws.onmessage = function(e){
    // console.log(e.data)
    var data = "";
    if(e.data instanceof ArrayBuffer){
      var bytes = new Uint8Array(e.data);
      for (var i = 0; i < bytes.length; i++) {
        data += String.fromCharCode(bytes[i]);
      }
    } else {
      data = e.data;
    }
    // console.log(data);
    $('#syncstatus').html('Socket OK');
    isConnected = true;

      buffer += data
      var split = buffer.split("\n");
      buffer = split.pop(); //last not fin data back to buffer
      // console.log(split)
      for (i=0; i< split.length; i++) {
        var response = split[i];
        // console.log(response)
        // trigger line handling event here
        if(response.indexOf("ok") != -1 || response == "start\r" || response.indexOf('<') == 0){
          if (response.indexOf("ok") == 0) { // Got an OK so we are clear to send
            printLog(response, '#cccccc', "wifi")
            uploadLine()
          } else if (response.indexOf('<') != -1) {
            updateStatus(response);
          } else {
            printLog(response, msgcolor, "wifi")
          }
          blocked = false;
        }
    }
  };
}


function scanWifiSubnet() {
  scanned = 254;
  scanok = 0;
  scanfail = 0;
  $("#foundIpwifi").empty();
  var subnet1 = $("#wifisubnet1").val();
  var subnet2 = $("#wifisubnet2").val();
  var subnet3 = $("#wifisubnet3").val();
  if (!subnet1) {
    subnet1 = "192";
  }
  if (!subnet2) {
    subnet2 = "168";
  }
  if (!subnet3) {
    subnet3 = "137";
  }
  var subnet = subnet1 + '.' +  subnet2 + '.' + subnet3 + '.' ;

  for (var ctr = 1; ctr < 255; ctr++) {
    var ip = subnet + ctr
    var result = scanWifiIP(ip)
  }
  saveSetting("wifisubnet1", subnet1);
  saveSetting("wifisubnet2", subnet2);
  saveSetting("wifisubnet3", subnet3);
};

function  scanWifiIP(ip) {
  printLog('Wifi Checking: '+ip, successcolor, "wifi")
  var cmd = "version\n";
  var url = "http://" + ip + "/command";
  // Send the data using post
  var posting = new WebSocket('ws://'+ip+'/');

  posting.onopen = function(e) {
    scanned = scanned - 1;
    scanok += 1
    $("#scannumberwifi").html('Scanning: <span style="color: #00cc00">'+scanok+ '</span>+<span style="color: #cc0000">'+scanfail+ '</span> done. '+scanned+' to go.' )
    $("#foundIpwifi").append("<div class='panel panel-primary'><div class='panel-heading'><h3 class='panel-title'><a onclick='setWifiIP(\""+ip+"\")' href='#'>"+ip+"</a></h3></div></div>");
  }

  posting.onclose = function(e){
    scanned = scanned - 1;
    scanfail += 1
    $("#scannumberwifi").html('Scanning: <span style="color: #00cc00">'+scanok+ '</span>+<span style="color: #cc0000">'+scanfail+ '</span> done. '+scanned+' to go.' )
  }

}

function setWifiIP(ipaddr) {
  $("#espIp").val(ipaddr);
  $('#espConnectBtn').click();
}
