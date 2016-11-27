"use strict";
/*

    AUTHOR:  Claudio Prezzi github.com/laserweb

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/
var config = require('./config');
//var serialport = require("serialport");
//var SerialPort = serialport;

// Create a TinyG library object
var TinyG = require('tinyg');
// Then create a TinyG object called 'g'
var g = new TinyG();

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var nstatic = require('node-static');
var EventEmitter = require('events').EventEmitter;
var url = require('url');
var qs = require('querystring');
var util = require('util');
var http = require('http');
var chalk = require('chalk');
var isConnected, connectedTo, port, isBlocked, lastSent = "", paused = false, blocked = false, queryLoop, infoLoop, queueCounter, connections = [];
var gcodeQueue; gcodeQueue = [];
var request = require('request'); // proxy for remote webcams
var firmware = 'tinyg';


require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log(chalk.green(' '));
    console.log(chalk.green('***************************************************************'));
    console.log(chalk.white('                 ---- LaserWeb Started ----                    '));
    console.log(chalk.green('***************************************************************'));
    console.log(chalk.white('  Access the LaserWeb User Interface:                        '));
    console.log(chalk.green('  1. Open Chrome                                              '));
    console.log(chalk.green('  2. Go to : '), chalk.yellow(' http://'+add+':'+config.webPort+'/'));
    console.log(chalk.green('***************************************************************'));
    console.log(chalk.green(' '));
    console.log(chalk.green(' '));
    console.log(chalk.red('* Updates: '));
    console.log(chalk.green('  Remember to check the commit log on'));
    console.log(chalk.green(' '), chalk.yellow('https://github.com/openhardwarecoza/LaserWeb3/commits/master'));
    console.log(chalk.green('  regularly, to know about updates and fixes, and then when ready'));
    console.log(chalk.green('  update LaserWeb3 accordingly by running'), chalk.cyan("git pull"));
    console.log(chalk.green(' '));
    console.log(chalk.red('* Support: '));
    console.log(chalk.green('  If you need help / support, come over to '));
    console.log(chalk.green(' '), chalk.yellow('https://plus.google.com/communities/115879488566665599508'));
});


// Webserver
app.listen(config.webPort);
var fileServer = new nstatic.Server('./public');

function handler (req, res) {
  var queryData = url.parse(req.url, true).query;
  if (queryData.url) {
	if (queryData.url != "") {
	  request({
        url: queryData.url,  // proxy for remote webcams
        callback: (err, res, body) => {
          if (err) {
            // console.log(err)
            console.error(chalk.red('ERROR:'), chalk.yellow(' Remote Webcam Proxy error: '), chalk.white("\""+queryData.url+"\""), chalk.yellow(' is not a valid URL: '));
          }
        }
      }).on('error', function(e) {
        res.end(e);
	  }).pipe(res);
	}
  } else {
    fileServer.serve(req, res, function (err, result) {
      if (err) {
        console.error(chalk.red('ERROR:'), chalk.yellow(' fileServer error:'+req.url+' : '), err.message);
      }
	});
  }
}

function ConvChar( str ) {
  var c = {'<':'<', '>':'>', '&':'&', '"':'"', "'":"'", '#':'#' };
  return str.replace( /[<&>'"#]/g, function(s) { return c[s]; } );
}


// Websocket <-> Serial
io.sockets.on('connection', handleConnection);

function handleConnection (socket) { // When we open a WS connection, send the list of ports

  connections.push(socket);

  g.list().then(function(results) {
    console.log(util.inspect(results));
    socket.emit("ports", results);
  }).catch(function(err) { 
    //couldnt_list(err); 
  });
	
  socket.on('firstLoad', function(data) {
    socket.emit('config', config);
  });

  socket.on('stop', function(data) {
    socket.emit("connectStatus", 'stopped:'+port.path);
    gcodeQueue.length = 0; // dump the queye
    if (data !== 0) {
      port.write(data+"\n"); // Ui sends the Laser Off command to us if configured, so lets turn laser off before unpausing... Probably safer (;
      console.log('PAUSING:  Sending Laser Off Command as ' + data);
    } else {
      port.write("M5\n");  //  Hopefully M5!
      console.log('PAUSING: NO LASER OFF COMMAND CONFIGURED. PLEASE CHECK THAT BEAM IS OFF!  We tried the detault M5!  Configure your settings please!');
    }
  });

  socket.on('pause', function(data) {
    console.log(chalk.red('PAUSE'));
    if (data !== 0) {
      port.write(data+"\n"); // Ui sends the Laser Off command to us if configured, so lets turn laser off before unpausing... Probably safer (;
      console.log('PAUSING:  Sending Laser Off Command as ' + data);
    } else {
      port.write("M5\n");  //  Hopefully M5!
      console.log('PAUSING: NO LASER OFF COMMAND CONFIGURED. PLEASE CHECK THAT BEAM IS OFF!  We tried the detault M5!  Configure your settings please!');
    }
    socket.emit("connectStatus", 'paused:'+port.path);
    paused = true;
  });

  socket.on('unpause', function(data) {
    console.log(chalk.red('UNPAUSE'));
    if (data !== 0) {
      port.write(data+"\n");
    } else {
      port.write("M3\n");
	}
    socket.emit("connectStatus", 'unpaused:'+port.path);
    paused = false;
    send1Q();
  });

  socket.on('serialSend', function(data) {
    data = data.split('\n');
    for (var i=0; i<data.length; i++) {
      var line = data[i].split(';'); // Remove everything after ; = comment
	  var tosend = line[0];
      if (tosend.length > 0) {
        g.write(tosend);
      }
    }
  });

  socket.on('feedOverride', function(data) {
	var code;
    switch (data) {
      case 0:
        code = 144;	// set to 100%
        break;
      case 10:
        code = 145;	// +10%
        break;
      case -10:
        code = 146;	// -10%	
        break;
      case 1:
        code = 147;	// +1%
        break;
      case -1:
        code = 148;	// -1%
        break;
    }
    if (code) {
      jumpQ(String.fromCharCode(parseInt(code)));
    }
  });

  socket.on('spindleOverride', function(data) {
	var code;
    switch (data) {
      case 0:
        code = 153;	// set to 100%
        break;
      case 10:
        code = 154;	// +10%
        break;
      case -10:
        code = 155;	// -10%
        break;
      case 1:
        code = 156;	// +1%
        break;
      case -1:
        code = 157;	// -1%
        break;
    }
    if (code) {
      jumpQ(String.fromCharCode(parseInt(code)));
    }
  });

  socket.on('getFirmware', function(data) { // Deliver Firmware to Web-Client
    socket.emit("firmware", firmware);
  });
  
  socket.on('refreshPorts', function(data) { // Or when asked
    console.log(chalk.yellow('WARN:'), chalk.blue('Requesting Ports Refresh '));
    g.list().then(function(results) {
      console.log(util.inspect(results));
      socket.emit("ports", results);
    }).catch(function(err) { 
      //couldnt_list(err); 
	});
  });

  socket.on('closePort', function(data) { // If a user picks a port to connect to, open a Node SerialPort Instance to it
    console.log(chalk.yellow('WARN:'), chalk.blue('Closing Port ' + port.path));
    socket.emit("connectStatus", 'closed:'+port.path);
    g.close();
  });

  socket.on('areWeLive', function(data) { // If a user picks a port to connect to, open a Node SerialPort Instance to it
    socket.broadcast.emit("activePorts", port.path + ',' + port.options.baudRate);
  });

  socket.on('connectTo', function(data) { // If a user picks a port to connect to, open a Node SerialPort Instance to it
    data = data.split(',');
    console.log(chalk.yellow('WARN:'), chalk.blue('Connecting to Port ' + data));
    if (!isConnected) {
      port = new SerialPort(data[0], {  parser: serialport.parsers.readline("\n"), baudrate: parseInt(data[1]) });
      socket.emit("connectStatus", 'opening:'+port.path);

      port.on('open', function() {
        socket.broadcast.emit("activePorts", port.path + ',' + port.options.baudRate);
        socket.emit("connectStatus", 'opened:'+port.path);
        port.write("?"); // Lets check if its Grbl?
        //port.write("?\n"); // Lets check if its LasaurGrbl?
        // port.write("M115\n"); // Lets check if its Marlin?
        //port.write("version\n"); // Lets check if its Smoothieware?
        // port.write("$fb\n"); // Lets check if its TinyG
        console.log('Connected to ' + port.path + 'at ' + port.options.baudRate);
        isConnected = true;
        connectedTo = port.path;
        queryLoop = setInterval(function() {
          // console.log('StatusChkc')
          //port.write('?');
          send1Q();
        }, 1000);
        infoLoop = setInterval(function() {
          port.write('?');
          //send1Q();
        }, 250);
        queueCounter = setInterval(function(){
          for (var i in connections) {   // iterate over the array of connections
            connections[i].emit('qCount', gcodeQueue.length);
          }
        },500);
        for (var i in connections) {   // iterate over the array of connections
          connections[i].emit("activePorts", port.path + ',' + port.options.baudRate);
        }
      });

      port.on('close', function(err) { // open errors will be emitted as an error event
        clearInterval(queueCounter);
        clearInterval(queryLoop);
		clearInterval(infoLoop);
        socket.emit("connectStatus", 'closed:'+port.path);
        isConnected = false;
        connectedTo = false;
      });

      port.on('error', function(err) { // open errors will be emitted as an error event
        console.log('Error: ', err.message);
        socket.broadcast.emit("data", data);
      });

      port.on("data", function (data) {
		var i;
        console.log('Recv: ' + data);
        if(data.indexOf("ok") != -1 || data == "start\r" || data.indexOf('<') == 0 || data.indexOf("$") == 0){
          if (data.indexOf("ok") == 0) { // Got an OK so we are clear to send
            blocked = false;
          }
          for (i in connections) {   // iterate over the array of connections
            connections[i].emit("data", data);
          }
          // setTimeout(function(){
          if(paused !== true){
            send1Q();
          } else {
            for (i in connections) {   // iterate over the array of connections
              connections[i].emit("data", 'paused...');
            }
          }
          //  },1);
        } else {
          for (i in connections) {   // iterate over the array of connections
            connections[i].emit("data", data);
		  }
        }
      });
    } else {
      socket.emit("connectStatus", 'resume:'+port.path);
      port.write("?\n"); // Lets check if its LasaurGrbl?
      port.write("M115\n"); // Lets check if its Marlin?
      port.write("version\n"); // Lets check if its Smoothieware?
      port.write("$fb\n"); // Lets check if its TinyG
    }
  });
}
// End Websocket <-> Serial


// Setup an error handler for TinyG
g.on('error', function(error) {
  // ...
});

// Open the first connected device found
g.openFirst();
// OR: Open a specific device with one serial ports:
//    g.open(portPath);
// OR: Open a specific G2 Core device with two virtual serial ports:
//    g.open(portPath,
//            {dataPortPath : dataPortPath});

// Make a status handler
var statusHandler = function(st) {
  process.stdout.write(
    util.inspect(status) + "\n"
  );
};

// Make a close handler
var closeHandler = function() {
  // Stop listening to events when closed
  // This is only necessary for programs that don't exit.
  g.removeListener('statusChanged', statusHandler);
  g.removeListener('close', closeHandler);
}


// Setup an open handler, that will then setup all of the other handlers
g.on('open', function() {
  // Handle status reports ({"sr":{...}})
  g.on('statusChanged', statusHandler);
  // handle 'close' events
  g.on('close', closeHandler);

  // We now have an active connection to a tinyg.
  // We can use g.set(...) to set parameters on the tinyg,
  // and g.get() to read parameters (returns a promise, BTW).

  // We can also use g.sendFile() to handle sending a file.
});

// Queue
function addQ(gcode) {
  gcodeQueue.push(gcode);
}

function jumpQ(gcode) {
  gcodeQueue.unshift(gcode);
}

function send1Q() {
  if (gcodeQueue.length > 0 && !blocked && !paused) {
    var gcode = gcodeQueue.shift();
    console.log('Sent: '  + gcode + ' Q: ' + gcodeQueue.length);
    lastSent = gcode;
    port.write(gcode + '\n');
    blocked = true;
  }
}
