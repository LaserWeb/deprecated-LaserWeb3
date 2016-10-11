ws =  null;

function initEsp8266() {
  $('#espConnectBtn').on('click', function() {
    var espIP = $('#espIp').val();
    startWS(espIP);
  });
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
  ws = new WebSocket('ws://'+url+'/ws');
  saveSetting('espIpAddress', url);
  ws.binaryType = "arraybuffer";


  ws.onopen = function(e) {
    printLog("ESP8266 Connected to "+url, successcolor, 'wifi');
    $('#espConnectBtn').hide();
    $('#espDisconnectBtn').show();
    console.log(e);
    sendGcode('baud 115200');
    sendGcode('version');
    sendGcode('who');
  };

  ws.onclose = function(e){
    printLog("ESP8266 closed! ", errorcolor, 'wifi');
    $('#espConnectBtn').show();
    $('#espDisconnectBtn').hide();
    console.log(e);
  };

  ws.onerror = function(e){
    printLog("ESP8266 Error! ", errorcolor, 'wifi');
    $('#espConnectBtn').show();
    $('#espDisconnectBtn').hide();
    console.log(e);
  };

  ws.onmessage = function(e){
    var data = "";
    if(e.data instanceof ArrayBuffer){
      var bytes = new Uint8Array(e.data);
      for (var i = 0; i < bytes.length; i++) {
        data += String.fromCharCode(bytes[i]);
      }
    } else {
      data = e.data;
    }
    $('#syncstatus').html('Socket OK');
    isConnected = true;
    if (data.indexOf('<') == 0) {
      updateStatus(data);
    } else if (data =='ok') {
      printLog(data, '#cccccc', "wifi")
    } else {
      printLog(data, msgcolor, "wifi")
    }
  };
}
