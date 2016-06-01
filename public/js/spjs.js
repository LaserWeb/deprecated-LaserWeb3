var isWsConnected = null;
var isConnected;

var connectedDevice = null;

var wsSendCommandsList = []
var wsSendCommandsListPosition;
var paused = false;
var playing = false;

function spjsInit() {
    $('#sendCommand').on('click', function() {
        var commandValue = $('#command').val();
        wsSend('send ' + $('#port').val() + ' ' + commandValue);
        wsSendCommandsList.push(commandValue);
        wsSendCommandsListPosition = undefined;
        $('#command').val('');
    });
    $(document).bind('keydown', function(e) {
        if (e.which == 13 && $('#command:focus').length > 0 && !$('#sendCommand').is(':disabled')) {
            var commandValue = $('#command').val();
            wsSend('send ' + $('#port').val() + ' ' + commandValue);
            wsSendCommandsList.push(commandValue);
            wsSendCommandsListPosition = undefined;
            $('#command').val('');
        }
        if (e.which == 38 && $('#command:focus').length > 0 && !$('#sendCommand').is(':disabled')) {
            if (wsSendCommandsList.length > 0) {
                console.log(wsSendCommandsListPosition);
                if (wsSendCommandsListPosition === undefined) {
                    wsSendCommandsListPosition = wsSendCommandsList.length - 1;
                } else {
                    wsSendCommandsListPosition = wsSendCommandsListPosition - 1;
                }
                wsSendCommandsListPosition = (wsSendCommandsListPosition < 0) ? 0 : wsSendCommandsListPosition;
                $('#command').val(wsSendCommandsList[wsSendCommandsListPosition]);
            }

        } else if (e.which == 40 && $('#command:focus').length > 0 && !$('#sendCommand').is(':disabled')) {
            if (wsSendCommandsList.length > 0) {
                console.log(wsSendCommandsListPosition);
                if (wsSendCommandsListPosition !== undefined) {
                    wsSendCommandsListPosition = wsSendCommandsListPosition + 1;
                }
                wsSendCommandsListPosition = (wsSendCommandsListPosition > wsSendCommandsList.length) ? wsSendCommandsList.length : wsSendCommandsListPosition;
                $('#command').val(wsSendCommandsList[wsSendCommandsListPosition]);
            } else {
                $('#command').val('');
            }
        }
    });
    window.onbeforeunload = function() {
        if (isConnected) {
            return "STOP: you still have a connected device. If you refresh or reconnect the running job will stop!.";
        }
    }
};

function sendGcode(gcode) {
    console.log('Being asked to send ', gcode)
    if (isConnected) {
        var gcode = gcode;
        wsSend('send ' + $('#port').val() + ' ' + gcode);
        console.log('send ' + $('#port').val() + ' ' + gcode)
    } else {
      var gcode = gcode;
      printLog('Could not send ' + gcode + ' - NOT CONNECTED', errorcolor)
    };
};

function playGcode() {
    var g;
    g = document.getElementById('gcodepreview').value;
    sendGcode(g);
    playing = true;
    $('#playicon').removeClass('fa-play');
    $('#playicon').addClass('fa-pause');
};

function homeMachine() {
    var homecommand;
    homecommand = document.getElementById('homingseq').value;
    sendGcode(homecommand);
};

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


function stopMachine() {
    var laseroffcmd;
    laseroffcmd = document.getElementById('laseroff').value;
    sendGcode(laseroffcmd);
    sendGcode('!');
    sendGcode('%');
    $('#playicon').removeClass('fa-pause');
    $('#playicon').addClass('fa-play');
};


function unlockMachine() {
    sendGcode('$X');
};


wsConnect = function(host) {
    //host = '127.0.0.1';
    fullurl = "ws://" + host + ":8989/ws";

    conn = new WebSocket(fullurl);
    console.log('WebSocket Connection', conn);

    conn.onopen = function(evt) {
        //  that.wsWasEverConnected = true;
        //  that.reconMsgHide();
        //  that.onWsConnect(evt);
        console.log('Websocket Open');
        conn.send('list'); // Lets get list of connected devices!
        isWsConnected = true;

        //  $.cookie('lasthost', conn.url, {
        //      expires: 365,
        //      path: '/'
        //  });
        //  if (onsuccess) onsuccess.apply(that);
        //
        //  var slist = that.serverListGet();
        //  if (that.conn.url in slist) {
        //    // ignore
        //  } else {
        //    // the url we just opened is not in recent list
        //    // so add it
        //    that.serverListSet(that.conn.url, '<a href="javascript:">' + that.conn.url + '</a>');
        //    that.showRecentServerList();
        //
        //  }

    };

    conn.onerror = function(evt) {
        console.log('Websocket Error', evt);
        //  console.log(evt);
        //  that.publishSysMsg("Serial port ajax error.");
        //  if (onfail) onfail.apply(that);
    };

    conn.onclose = function(evt) {
        console.log('Websocket Close', evt);
        $('#connect').html('Connect');
        $('#connect').addClass('disabled');
        $("#port").prop("disabled", true);
        $("#baud").prop("disabled", true);
        $("#buffer").prop("disabled", true);
        //  if (that.wsWasEverConnected) that.reconMsgShow();
        //  that.onWsDisconnect(evt);
    }

    conn.onmessage = function(evt) {
        //console.log('Websocket Message', evt);
        //  that.publishMsg(evt.data);
        onWsMessage(evt.data);
    };
};

wsSend = function(msg) {
    console.log('Being asked to send ', msg)
    if (isWsConnected) {
        conn.send(msg);
        console.log('Sending: ', msg);
    } else {
        console.log("Tried to send message, but we are not connected to serial port ajax server.");
    }
};

serialConnect = function(portname, baud, buf) {

    if ($('#connect').html() == 'Connect') {
        // pause queue on server
        //$('#connect').html('Disconnect'); // Letting onPortOpen do this instead
        console.log('Closing ', portname, ' before reconnecting')
        wsSend("close " + portname);

        console.log('Connecting ', portname, ' at ', baud, ' using ', buf)
        wsSend("open " + portname + " " + baud + " " + buf);
        localStorage.setItem("lastUsedPort", portname);
        localStorage.setItem("lastUsedBuffer", buf);
        localStorage.setItem("lastUsedBaud", baud);
    } else {
        console.log('Closing ', portname)
        wsSend("close " + portname);
    }
}

getPortListCount: 0,
    getPortList = function() {
        if (isWsConnected) {
            getPortListCount = 0;
            wsSend("list");
        } else {
            var host = $('#spjsip').val();
            if (host) {
                console.log('Connecting SPJS at ', host);
                wsConnect(host);
            } else {
                wsConnect('127.0.0.1');
            }
            wsSend("list");
        }
    };

onWsMessage = function(msg) {
    //console.log("inside onWsMessage. msg: " + msg);
    if (msg.match(/^\{/)) {
        // it's json
        //console.log("it is json");
        var data = null;
        //try {
        data = $.parseJSON(msg);
        /*
        } catch (e) {
            // error
            console.log("got error parsing json from CNC controller. msg:", msg);
            // try some cleanup based on some anomalies we've seen
            msg = msg.replace(/\{"sr"\{"sr"\:/, '{"sr":');
            msg = msg.replace(/\{"r"\{"sr"\:/, '{"sr":');
            data = $.parseJSON(msg);
        }
        */
        if (data && data.Cmd && data.Cmd == "OpenFail") {
            // we tried to open the serial port, but it failed. usually access denied.
            onPortOpenFail(data);
        } else if (data && data.Cmd && data.Cmd == "Open") {
            // the port was opened, possibly by other browser or even locally from sys tray
            onPortOpen(data);
        } else if (data && data.Cmd && data.Cmd == "Close") {
            // the port was closed, possibly by other browser or even locally from sys tray
            onPortClose(data);
        } else if (data && data.Cmd && data.Cmd == "Queued") {
            // we need to watch for queues being done so we know to send next
            // is it a json queued response or text mode queued response
            //  if ("Data" in data) {
            //      // it is a json mode response
            //      onQueuedJson(data);
            //  } else {
            //      onQueuedText(data);
            //      //sendBufferedOnWsRecv(data);
            //  }
            // update prog bar of buffer
            onUpdateQueueCnt(data);
        } else if (data && data.Cmd && data.Cmd == "Write") {
            // update prog bar of buffer. this would decrement prog bar cuz a dequeue happened
            // see if we have an Id resposne, if so it is from
            // a json send and we need to see the response
            if ("Id" in data) {
                onWriteJson(data);
            }
            onUpdateQueueCnt(data);
        } else if (data && data.Cmd && (data.Cmd == "Complete" || data.Cmd == "CompleteFake")) {
            onCompleteJson(data);
        } else if (data && data.Cmd && data.Cmd == "Error") {
            //if cnc returns error, publish error signal.
            onErrorJson(data);
        } else if (data && data.Cmd && data.Cmd == "Broadcast") {
            // if spjs returns broadcast, publish broadcast signal.
            onBroadcast(data);
        } else if (data && data.Cmd && data.Cmd == "FeedRateOverride") {
            // if spjs returns FeedRateOverride, publish onFeedRateOverride signal.
            //onFeedRateOverride(data);
        } else if (data && data.SerialPorts) {
            // we got a serial port list
            console.log("got serial port list");
            //console.log(data);
            onPortList(data.SerialPorts);
        } else if (data && data.Version) {
            onVersion(data.Version);
        } else if (data && data.Hostname) {
            onSpjsName(data.Hostname);
        } else if (data && data.P && data.D) {


            var activePort = $('#port').val();
            // Now we only pay attention to data from the port we are connected to
            if (data.P.indexOf(activePort) != -1 && isConnected) {
                if (data.D.length > 1 && debug) {
                    // replace < > by &lt; and &gt;
                    var dataText = data.D.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    printLog('Port ' + data.P + ' data: ' + dataText, msgcolor);
                }

                var data = data.D;

                if (!connectedDevice) {
                    connectedDevice = detectTypeOfConnectedDevice(data);
                }

                if (connectedDevice) {
                    switch (connectedDevice.device) {
                        case 'Smoothie':
                            data = data.replace(/:/g, ' ');
                            data = data.replace(/X/g, ' ');
                            data = data.replace(/Y/g, ' ');
                            data = data.replace(/Z/g, ' ');
                            data = data.replace(/E/g, ' ');
                            var posArray = data.split(/(\s+)/);

                            setBullseyePosition(posArray[4], posArray[6], posArray[8]);
                            break;
                        case 'Repetier':
                            data = data.replace(/:/g, ' ');
                            data = data.replace(/X/g, ' ');
                            data = data.replace(/Y/g, ' ');
                            data = data.replace(/Z/g, ' ');
                            data = data.replace(/E/g, ' ');
                            var posArray = data.split(/(\s+)/);

                            setBullseyePosition(posArray[2], posArray[4], posArray[6]);
                            break;
                        case 'Grbl':
                            // Grbl fun stuff
                            var message = grbl.parseData(data);
                            if (message) {
                                switch (message.messageType) {
                                    case 'statusReport':
                                        setBullseyePosition(grbl.WPos[0], grbl.WPos[1], grbl.WPos[2]);
                                        break;
                                    case 'feedbackMessage':
                                        printLog("<b>Grbl message: </b><i>" + message.message + "</i>", warncolor);
                                        break;
                                    case 'ok':
                                        printLog(message.message, successcolor);
                                        break;
                                    case 'error':
                                        printLog(data, errorcolor);
                                        break;
                                    case 'setting':
                                        printLog("<b>Grbl setting: </b> <i>" + message.setting.command + ' => ' + message.setting.description + '= ' + message.setting.value + "</i>", msgcolor);
                                        break;
                                    case 'control':
                                        printLog("<b>Grbl control: </b> <i>" + message.control.command + ' => ' + message.control.description + "</i>", msgcolor);
                                        break;
                                    case 'alarm':
                                        printLog(data, errorcolor);
                                        break;
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
            };




            // we got actual raw serial port data
            // we need to parse into newlines and buffer
            // for the next time we get here and only fire off
            // a publish per newline

            //if (isSingleSelectMode && singleSelectPort == data.P) {

            //console.log("this:", this);
            //console.log("dataBuffer:", dataBuffer);
            //console.log("p:", data.P, "d:", data.D);
            //console.log(dataBuffer[data.P]);
            //  if(!(data.P in dataBuffer))
            //      dataBuffer[data.P] = data.D;
            //  else
            //      dataBuffer[data.P] += data.D;
            //  //console.log(dataBuffer[data.P]);
            //  //console.log("dataBuffer:", dataBuffer);
            //
            //  //var portBuf = dataBuffer[data.P];
            //
            //  // see if we got newline
            //  while (dataBuffer[data.P].match(/\n/)) {
            //      //console.log("we have a newline.");
            //      var tokens = dataBuffer[data.P].split(/\n/);
            //      var line = tokens.shift() + "\n";
            //      dataBuffer[data.P] = tokens.join("\n");
            //      //console.log("publishing line:", line);
            //      //console.log("new buffer:", dataBuffer[data.P], "len:", dataBuffer[data.P].length);
            //
            //      // do some last minute cleanup
            //      // THIS IS NOT GOOD, BUT SEEING TINYG SHOWING BAD DATA
            //      // THIS IS ALSO NOT THE RIGHT SPOT SINCE THIS SERIAL PORT WIDGET IS SUPPOSED
            //      // TO BE GENERIC. Remove when TinyG has no problems.
            //      line = line.replace(/\{"sr"\{"sr"\:/, '{"sr":');
            //      line = line.replace(/\{"r"\{"sr"\:/, '{"sr":');
            //
            //      chilipeppr.publish("/" + id + "/recvline", {
            //          ws: conn.url,
            //          port: data.P,
            //          dataline: line
            //      });

            // }
            //  } else {
            //      console.log("have a /recvline to publish, but since in single select mode we don't have a match to the selected port so ignoring.");
            //  }

        }

    } else if (msg.match(/We could not find the serial port/)) {
        // kind of a hack to send publishSysMsg when we get this
        // the serial-port-json-server should be changed to send this as json
        console.log(msg);
    }
};

detectTypeOfConnectedDevice = function(data) {
    if (data.indexOf('ok C: X:') == 0 || data.indexOf('C: X:') == 0) {
        printLog('<b>Smoothie connected</b>', successcolor);
        return {
            device: 'Smoothie',
            version: ''
        }
    }
    if (data.indexOf('X:') == 0 || data.indexOf('ok X:') == 0) {
        printLog('<b>Repetier connected</b>', successcolor);
        return {
            device: 'Repetier',
            version: ''
        }
    }
    if (data.indexOf('Grbl') == 0) {
        var t = data.split(' ');
        printLog('<b>Grbl ' + t[1] + ' connected</b>', successcolor);
        $('#unlockBtnGrp').show();
        grbl.setVersion(t[1]);
        return {
            device: 'Grbl',
            version: t[1]
        }
    }
    return null;
}
setBullseyePosition = function(x, y, z) {
    console.log('Set Position: ', x, y, z)
    if (x) {
        $('#mX').html('X: ' + x);
        bullseye.position.x = (parseInt(x, 10) - (laserxmax / 2));
    };
    if (y) {
        $('#mY').html('Y: ' + y);
        bullseye.position.y = (parseInt(y, 10) - (laserymax / 2));
    };
    if (z) {
        $('#mZ').html('Z: ' + z);
        bullseye.position.z = (parseInt(z, 10));
    };
}


onVersion = function(version) {
    //console.log("got version cmd. version:", version);
    version = version;
    versionFloat = parseFloat(version);
    $('#spjs-version').text("SPJS v" + version + " ");
};

onPortList = function(portlist) {
    //console.group("serial port widget onPortList");
    //console.log("inside onPortList");
    var html = "";
    var htmlFirst = ""; // show the connected ports first in the HTML
    var that = this;
    this.portlist = portlist;

    // now build the UI

    // keep flag for whether we know what all these devices are
    // thus we can hide the buffer encouragement flag
    var areAllDevicesKnown = true;

    var options = $("#port");

    var availBuffers = [];

    if (portlist.length > 0) {
        $.each(portlist, function(portlistIndex, item) {
            //console.log("looping thru ports. item:", item);

            // see if this is deleted
            if (item.isDeleted) {
                //console.log("this port is deleted so skipping");
                return;
            }

            // create friendly version of port name
            //item.DisplayPort = item.Name.replace("/dev/", "");
            item.DisplayPort = item.Name; //.replace("/dev/", "");

            //console.log('Name: ', item.DisplayPort)
            options.append($("<option />").val(item.DisplayPort).text(item.DisplayPort));
            if ('IsOpen' in item && item.IsOpen == true) {
                //console.log('Port ', item.DisplayPort, ' is already open');
                printLog('Port ' + item.DisplayPort + ' is already open', successcolor);
            };




            //  var rowClass = "";
            //  if (item.Name == that.singleSelectPort) {
            //      rowClass = "success";
            //  }
            //  var i = item.Name;
            //  i = that.toSafePortName(i);
            //  console.log("the port name we will use is:", i);
            //
            //  // create available algorithms dropdown
            //  var availArgsHtml = "";
            if ('AvailableBufferAlgorithms' in item) {
                // we are on a version of the server that gives us this
                //      availArgsHtml = "<td><select id=\"" + i + "Buffer\" class=\"com-chilipeppr-widget-serialport-buffer\" class=\"form-control\">";
                //      //availArgsHtml += "<option></option>"
                item.AvailableBufferAlgorithms.forEach(function(alg) {
                    //console.log("algorithm:", alg);
                    availBuffers.push(alg);
                    //          availArgsHtml += "<option value=\"" + alg + "\">" + alg + "</option>";
                });
                //      availArgsHtml += "</select>" +
                //          //"</td>" +
                //          "";
            }
        });

    } else {
        // no serial ports in list
        html = '<div class="alert alert-danger" style="margin-bottom:0;">No serial ports found on your Serial Port JSON Server.</div>';
    }

    availBuffers = $.grep(availBuffers, function(v, k) {
        return $.inArray(v, availBuffers) === k;
    });

    // console.log('Buffer List', availBuffers);
    for (i = 0; i < availBuffers.length; i++) {
        // console.log("algorithm:", availBuffers[i]);
        $("#buffer").append($("<option />").val(availBuffers[i]).text(availBuffers[i]));
    }
    // Might as well pre-select the last-used port and buffer
    var lastBuffer = localStorage.getItem("lastUsedBuffer")
    var lastUsed = localStorage.getItem("lastUsedPort");
    var lastBaud = localStorage.getItem("lastUsedBaud");
    $("#port option:contains(" + lastUsed + ")").attr('selected', 'selected');
    $("#buffer option:contains(" + lastBuffer + ")").attr('selected', 'selected');
    $("#baud option:contains(" + lastBaud + ")").attr('selected', 'selected');


    // Now that we have a Portlist we can enable the relevant UI elements

    if (isConnected) {
        console.log('Ignoring Portlist since we are already connected on this Endpoint');
    } else {
        console.log('Processing Portlist');
        $('#connect').removeClass('disabled')
        $("#port").prop("disabled", false);
        $("#baud").prop("disabled", false);
        $("#buffer").prop("disabled", false);
    }

    //          availArgsHtml += "<option value=\"" + alg + "\">" + alg + "</option>";
    //  });
    //  html = htmlFirst + html;
    //  $('.table.com-chilipeppr-widget-serialport-portlist tbody').html(html);
    //
    //  console.log("about to do baud/buffer override for isopen, cookie, meta, etc");
    //  $.each(portlist, function (i, item) {
    //      // now set the values from the cookie so we make their life easier
    //      var cookie = that.serialGetCookie(item.Name);
    //      //console.log("got cookie for ", item.Name, " cookie:", cookie);
    //      //console.log(cookie.baud);
    //
    //      var i = that.toSafePortName(item.Name);
    //
    //      //debugger;
    //
    //      // do baud
    //      if ('metaBaud' in item && item.metaBaud) {
    //          // we found the baud in our meta data, which means
    //          // we let it override everything
    //          $('#' + i + "Baud").val(item.metaBaud);
    //      } else if (cookie && cookie.baud) {
    //          // choose baud stored in the cookie
    //          $('#' + i + "Baud").val(cookie.baud);
    //      } else {
    //          // if no cookie then fallback to default
    //          // for the workspace type we're in
    //          if (that.defaultBaud) {
    //              $('#' + i + "Baud").val(that.defaultBaud);
    //          }
    //      }
    //
    //      // see if they want to hide the baud rate
    //      if ('removeBaud' in item && item.removeBaud) {
    //          $('#' + i + "Baud").addClass("hidden");
    //      }
    //
    //      // now set the values for the bufferflow
    //      if ('metaBuffer' in item && item.metaBuffer) {
    //          // we found the buffer in our meta data, which means
    //          // we let it override everything
    //          $('#' + i + "Buffer").val(item.metaBuffer);
    //      } else if (cookie && cookie.buffer) {
    //          // choose baud stored in the cookie
    //          $('#' + i + "Buffer").val(cookie.buffer);
    //      } else {
    //          // if no cookie, fallback to default
    //          if ('buffertype' in that && that.buffertype && that.buffertype.length > 0) {
    //              $('#' + i + "Buffer").val(that.buffertype);
    //          }
    //      }
    //
    //      // see if they want to hide the baud rate
    //      if ('removeBuffer' in item && item.removeBuffer) {
    //          $('#' + i + "Buffer").addClass("hidden");
    //          // set colspan one wider than it is now
    //
    //      }
    //
    //      // we may have set the default vals from the cookie, but now override
    //      // based on what the serial port server has open and what those settings are
    //      if (item.IsOpen) {
    //          $('#' + i + "Cb").prop('checked', item.IsOpen);
    //          // choose baud it was opened at
    //          $('#' + i + "Baud").val(item.Baud);
    //          // choose buffer it was opened as
    //          $('#' + i + "Buffer").val(item.BufferAlgorithm);
    //          // lock pulldown
    //          $('#' + i + "Buffer").prop("disabled", true);
    //          //debugger;
    //          // see if open as a true buffer and then add a buffer bar
    //          if (that.versionFloat >= 1.4) {
    //              console.log("adding buffer bar");
    //              $('#' + i + "Buffer").parent().append(
    //                  '<div class="progress hidden com-chilipeppr-widget-serialport-progbar">' +
    //                  '<div id="' + i + 'BufferProgBar" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="10" style="width: 80%;">' +
    //                  '    <span class="" style="min-width:20px;padding-left:3px;">Unknown</span>' +
    //                  '</div>' +
    //                  '</div>');
    //          }
    //
    //          // if isInitting then fire off fake onportopen signals
    //          // as if user just opened this port
    //          if (that.isInitting) {
    //              chilipeppr.publish("/com-chilipeppr-widget-serialport/onportopen", item);
    //          }
    //      }
    //
    //      // set default buffer based on what was set (if anything) in this.bufferType
    //      // but only do it if item is not open and there's no cookie
    //      if (item.IsOpen == false && cookie && !('buffer' in cookie) && that.buffertype != null) {
    //          console.log("setting default buffer type cuz item not open, no cookie, and is a default buf type. item:", item);
    //          $('#' + i + "Buffer").val(that.buffertype);
    //      }
    //
    //      // pass my item inside the data val on the click event
    //      $('#' + i + "Cb").parent().click({that:that,port:item}, that.onPortCbClicked);
    //      $('#' + i + "Friendly").click({that:that,port:item}, that.onPortFriendlyClicked);
    //      $('#' + i + "Img").click({that:that,port:item}, that.onPortFriendlyClicked);
    //
    //      // if they click the config button
    //      $('#' + i + "Config").click({that:that,port:item}, that.onPortConfigClicked.bind(that));
    //
    //      // if they click the programmer button
    //      $('#' + i + "Program").click({that:that,port:item}, that.onPortProgramClicked.bind(that));
    //
    //  });
    //
    //  // set isInitting to false, that means only the 1st time
    //  // thru this method will we do any isInitting code
    //  if (that.isInitting) {
    //      console.log("setting isInitting to false so don't run init code again on port list");
    //      that.isInitting = false;
    //  }
    //
    //  // now do last check on whether to hide buffer encouragement
    //  console.log("about to check if we need to hide buffer encouragement. areAllDevicesKnown:", areAllDevicesKnown);
    //  if (areAllDevicesKnown == true) {
    //      // we can hide buffer encouragement
    //      console.log("cuz all devices are known, we can safely hide");
    //      this.hideBufferEncouragement();
    //  }
    //
    //  this.showAllPopovers();
    //
    //  // publish the port list for other listeners
    //  chilipeppr.publish("/com-chilipeppr-widget-serialport/listAfterMetaDataAdded", portlist);
    //
    //  console.groupEnd();
};

onSpjsName = function(spjsName) {
    //$('.com-chilipeppr-widget-serialport .panel-heading .hosttitle').text(spjsName);
    console.log('SPJS Name:', spjsName);
};

onPortOpen = function(data) {
    connectedDevice = null;
    $('#controlstatus').hide();
    $('#refreshPort').addClass('disabled');
    $('#sendCommand').removeClass('disabled').prop("disabled", false);;
    $('#connect').html('Disconnect'); // Update Button Text
    $("#port").prop("disabled", true);
    $("#baud").prop("disabled", true);
    $("#buffer").prop("disabled", true);
    isConnected = true;
    console.group("onPortOpen");
    console.log("Open a port: ", data, data.Port);
    var portname = data.Port;
    // swap back weird characters
    portname = toSafePortName(portname);
    console.log("got onPortOpen. portname to use for dom lookups:", portname);
    // $('#' + portname + "Cb").prop('checked', true);
    // $('#' + portname + "Row .glyphicon-exclamation-sign").addClass("hidden");
    // if (this.isSingleSelectMode) {
    //     console.log("got port open but in single select mode.");
    //     // hilite this port
    //     $('.com-chilipeppr-widget-serialport-portlist > tbody > tr').removeClass("success");
    //     $('#' + portname + "Row").addClass("success");
    //     this.singleSelectPort = data.Port;
    //     // save cookie, but let path be to this workspace so other workspaces using this
    //     // widget leave their own default last singleSelectPort
    //     $.cookie("singleSelectPort", data.Port, { expires: 365 * 10 });
    // }
    //
    // // publish /ws/onconnect
    // chilipeppr.publish('/' + this.id + '/ws/onconnect', data);
    //
    // // publish /onportopen
    // chilipeppr.publish('/' + this.id + '/onportopen', data);
    //
    // // if user has a startup script for this port, let's run it here
    // console.log("seeing if we should run a startup script. data:", data);
    // var portid = data.Port;
    // var url = this.conn.url;
    // var key = "portid:" + portid + ",url:" + url;
    // var script = localStorage.getItem(key, $('#com-chilipeppr-serialport-modalconfig textarea').val());
    // console.log("the script key:", key, "val is:", script);
    //
    // // only send this config info like 1 second later
    // var that = this;
    // setTimeout(function() {
    //     chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {Id:"startup" +  that.configSendCtr++, D:script});
    // }, 3000);
    //
    console.groupEnd();
};
onPortClose = function(data) {
    connectedDevice = null;
    $('#controlstatus').show();
    $('#refreshPort').removeClass('disabled');
    $('#sendCommand').addClass('disabled').prop("disabled", true);
    console.log("onPortClose Close a port: ", data, data.Port);
    var portname = data.Port;
    portname = toSafePortName(portname);
    $('#connect').html('Connect');
    $("#port").prop("disabled", false);
    $("#baud").prop("disabled", false);
    $("#buffer").prop("disabled", false);
    isConnected = false;
    // $('#' + portname + "Cb").prop('checked', false);
    // $('#' + portname + "Row .glyphicon-exclamation-sign").addClass("hidden");
    //
    // // publish /onportclose
    // chilipeppr.publish('/' + this.id + '/onportclose', data);
};
onPortOpenFail = function(data) {
    connectedDevice = null;
    console.log("Opening a port failed: ", data, data.Port);
    var portname = data.Port;
    portname = toSafePortName(portname);
    $('#connect').html('Connect');
    isConnected = false;
    // $('#' + portname + "Cb").prop('checked', false);7
    // //$('#' + portname + "Row .glyphicon-exclamation-sign").prop("title", data.Desc);
    // $('#' + portname + "Row .glyphicon-exclamation-sign").removeClass("hidden");
    // $('#' + portname + "Row .glyphicon-exclamation-sign").tooltip({
    //     title: data.Desc,
    //     animation: true,
    //     delay: 100,
    //     container: 'body'
    // });
    // // publish /onportopenfail
    // chilipeppr.publish('/' + this.id + '/onportopenfail', data);
};
toSafePortName = function(portname) {
    // we need to convert vals that could show up in the port name
    // with vals that are safe to use in the DOM as id's
    portname = portname.replace(/\//g, "-fslash-");
    portname = portname.replace(/\./g, "-dot-");
    return portname;
};

onUpdateQueueCnt = function(data) {
    // we'll get json like this so we know our buffer state in spjs
    // {"Cmd":"Queued","QCnt":6,"Type":["Buf","Buf","Buf","Buf","Buf"],...,"Port":"COM22"}

    console.log("got onUpdateQueueCnt. data:", data);
    var port = data.Port;
    if ('P' in data) port = data.P;
    var i = toSafePortName(port);
    if (data.Cmd == "Queued" || data.Cmd == "Write") {
        var val = data.QCnt;
        //printLog('Queued: ' + val, msgcolor)
        $('#queueCnt').html('Queued: ' + val)

        // if job is done, make pause button a play button again
        if (val < 1) {
            $('#playicon').removeClass('fa-pause');
            $('#playicon').addClass('fa-play');
            playing = false;
            paused = false;
        }
        // fire off a pubsub for QCnt
        //chilipeppr.publish("/" + this.id + "/qcnt", val);

        // see if we need to pause or resume
        // if (this.isPlannerPaused) {
        //     if (val < this.sendResumeAt) {
        //         // send resume
        //         chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/plannerresume');
        //         this.isPlannerPaused = false;
        //     }
        // } else {
        //     if (val > this.sendPauseAt) {
        //         this.isPlannerPaused = true;
        //         chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/plannerpause');
        //     }
        // }

        // recalc max value
        // if (!(i in this.queueMax) || this.queueMax[i] < val) {
        //     this.queueMax[i] = val;
        //     $('#' + i + "BufferProgBar").attr('aria-valuemax', val);
        // }
        // var valpct = (val / this.queueMax[i]) * 100;
        // $('#' + i + "BufferProgBar").css('width', valpct+'%').attr('aria-valuenow', val).parent().removeClass("hidden");
        // var color = "white";
        // if (valpct < 30.0) color = "black";
        // $('#' + i + "BufferProgBar span").text(val).css('color', color);
    }
};

onWriteJson = function(data) {
    // we got a write msg. good. fire off event
    //console.group("onWriteJson");
    console.log("onWriteJson. data:", data);
    var payload = {
        Id: data.Id,
        QCnt: data.QCnt,
        Port: data.P
    };
    //chilipeppr.publish("/" + this.id + "/onWrite", payload);
    //console.groupEnd();
};
onCompleteJson = function(data) {
    // we got a complete msg. good. fire off event
    //console.group("onCompleteJson");
    console.log("onCompleteJson. data:", data);
    var payload = {
        Id: data.Id
    };
    //chilipeppr.publish("/" + this.id + "/onComplete", payload);
    //console.groupEnd();
};
onErrorJson = function(data) {
    // we got an error message from cnc controller. bad. notify widgets
    //console.group("onCompleteJson");
    //console.log("data:", data);
    var payload = {
        Id: data.Id
    };
    //chilipeppr.publish("/" + this.id + "/onError", payload);
    //console.groupEnd();
};
