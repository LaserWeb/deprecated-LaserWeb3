"use strict";
/*

    AUTHOR:  Peter van der Walt openhardwarecoza.github.io/donate

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
var serialport = require("serialport");
var SerialPort = serialport;
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
var isConnected, connectedTo, port, isBlocked, lastSent = "", paused = false, blocked = false, statusLoop, queueCounter, connections = [];
var gcodeQueue; gcodeQueue = [];
var request = require('request'); // proxy for remote webcams
var firmware = 'grbl';


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
	if (queryData.url !== "") {
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

/*
function ConvChar( str ) {
  var c = {'<':'<', '>':'>', '&':'&', '"':'"', "'":"'", '#':'#' };
  return str.replace( /[<&>'"#]/g, function(s) { return c[s]; } );
}*/


// Websocket <-> Serial
io.sockets.on('connection', handleConnection);


function handleConnection (socket) { // When we open a WS connection, send the list of ports

  connections.push(socket);

  serialport.list(function (err, ports) {
    socket.emit("ports", ports);
  });

  socket.on('firstLoad', function(data) {
    socket.emit('config', config);
  });

  socket.on('stop', function(data) {
    gcodeQueue.length = 0;	// dump the queye
    console.log(chalk.red('STOP'));
    if (data !== 0) {
      port.write(data+"\n"); // Ui sends the Laser Off command to us if configured, so lets turn laser off before pausing... Probably safer (;
      console.log('STOPPING:  Sending Laser Off Command as ' + data);
    } else {
      port.write("M5\n");  //  Hopefully M5!
      console.log('STOPPING: NO LASER OFF COMMAND CONFIGURED. PLEASE CHECK THAT BEAM IS OFF!  We tried the detault M5!  Configure your settings please!');
    }
    io.sockets.emit("connectStatus", 'stopped:'+port.path);
  });

  socket.on('pause', function(data) {
    //port.write('!');	// Send feed hold to grbl => works when grbl stopps laser on feed hold (not jet)!!
    paused = true;
    console.log(chalk.red('PAUSE'));
    if (data !== 0) {
      port.write(data+"\n"); // Ui sends the Laser Off command to us if configured, so lets turn laser off before pausing... Probably safer (;
      console.log('PAUSING:  Sending Laser Off Command as ' + data);
    } else {
      port.write("M5\n");  //  Hopefully M5!
      console.log('PAUSING: NO LASER OFF COMMAND CONFIGURED. PLEASE CHECK THAT BEAM IS OFF!  We tried the detault M5!  Configure your settings please!');
    }
    io.sockets.emit("connectStatus", 'paused:'+port.path);
  });

  socket.on('unpause', function(data) {
    //port.write('~');	// Send feed hold to grbl
    console.log(chalk.red('UNPAUSE'));
    if (data !== 0) {
      port.write(data+"\n");
    } else {
      port.write("M3\n");	// Realy? This activates the Laser with the last S value, even if the Laser was off before pause!
	}
    io.sockets.emit("connectStatus", 'unpaused:'+port.path);
    paused = false;
    send1Q();
  });

  socket.on('serialSend', function(data) {
    data = data.split('\n');
    for (var i=0; i<data.length; i++) {
      var line = data[i].split(';'); // Remove everything after ; = comment
	  var tosend = line[0];
      if (tosend.length > 0) {
        addQ(tosend);
		send1Q();
      }
    }
  });

  socket.on('feedOverride', function(data) {
	var code;
    switch (data) {
      case 0:
        code = 144;	// set to 100%
        data = '100';
        break;
      case 10:
        code = 145;	// +10%
        data = '+' + data;
        break;
      case -10:
        code = 146;	// -10%	
        break;
      case 1:
        code = 147;	// +1%
        data = '+' + data;
        break;
      case -1:
        code = 148;	// -1%
        break;
    }
    if (code) {
      //jumpQ(String.fromCharCode(parseInt(code)));
      port.write(String.fromCharCode(parseInt(code)));
      console.log('Override feed: ' + data + '%');
    }
  });

  socket.on('spindleOverride', function(data) {
	var code;
    switch (data) {
      case 0:
        code = 153;	// set to 100%
        data = '100';
        break;
      case 10:
        code = 154;	// +10%
        data = '+' + data;
        break;
      case -10:
        code = 155;	// -10%
        break;
      case 1:
        code = 156;	// +1%
        data = '+' + data;
        break;
      case -1:
        code = 157;	// -1%
        break;
    }
    if (code) {
      //jumpQ(String.fromCharCode(parseInt(code)));
      port.write(String.fromCharCode(parseInt(code)));
      console.log('Override spindle: ' + data + '%');
    }
  });

  socket.on('getFirmware', function(data) {		// Report server version (firmware) to web-client
    socket.emit("firmware", firmware);
  });
  
  socket.on('refreshPorts', function(data) {	// Refresh serial port list
    console.log(chalk.yellow('WARN:'), chalk.blue('Requesting Ports Refresh '));
    serialport.list(function (err, ports) {
      socket.emit("ports", ports);
    });
  });

  socket.on('closePort', function(data) {		// Close serial port and dump queue
    console.log(chalk.yellow('WARN:'), chalk.blue('Closing Port ' + port.path));
    io.sockets.emit("connectStatus", 'closed:'+port.path);
    gcodeQueue.length = 0;	// dump the queye
	port.close();
	pause = false;
	blocked = false;
  });

  socket.on('areWeLive', function(data) { 		// Report active serial port to web-client
    socket.emit("activePorts", port.path + ',' + port.options.baudRate);
  });

  socket.on('connectTo', function(data) { // If a user picks a port to connect to, open a Node SerialPort Instance to it
    data = data.split(',');
    console.log(chalk.yellow('WARN:'), chalk.blue('Connecting to Port ' + data));
    if (!isConnected) {
      port = new SerialPort(data[0], {  parser: serialport.parsers.readline("\n"), baudrate: parseInt(data[1]) });
      io.sockets.emit("connectStatus", 'opening:'+port.path);

      port.on('open', function() {
        io.sockets.emit("activePorts", port.path + ',' + port.options.baudRate);
        io.sockets.emit("connectStatus", 'opened:'+port.path);
        port.write("?"); // Lets check if its Grbl?
        console.log('Connected to ' + port.path + 'at ' + port.options.baudRate);
        isConnected = true;
        connectedTo = port.path;

		// Start intervall for status queries to grbl
		statusLoop = setInterval(function() {
          port.write('?');
        }, 250);
        
		// Start interval for qCount messages to socket clients
		queueCounter = setInterval(function(){
          io.sockets.emit('qCount', gcodeQueue.length);
        },500);
        io.sockets.emit("activePorts", port.path + ',' + port.options.baudRate);
      });

      port.on('close', function() { // open errors will be emitted as an error event
        clearInterval(queueCounter);
		clearInterval(statusLoop);
        io.sockets.emit("connectStatus", 'closed:'+port.path);
        isConnected = false;
        connectedTo = false;
      });

      port.on('error', function(err) { // open errors will be emitted as an error event
        console.log('Error: ', err.message);
        io.sockets.emit("data", data);
      });

      port.on("data", function (data) {
        console.log('Recv: ' + data);
        if (data.indexOf("ok") === 0) { // Got an OK so we are clear to send
		  blocked = false;
          send1Q();
        }
        io.sockets.emit("data", data);
      });
    } else {
      io.sockets.emit("connectStatus", 'resume:'+port.path);
      port.write("?"); // Lets check if its Grbl?
    }
  });
}
// End Websocket <-> Serial


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
