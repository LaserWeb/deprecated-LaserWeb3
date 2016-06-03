/*

    AUTHOR:  Peter van der Walt openhardwarecoza.github.io/donate

    RepRapWeb - A Web Based 3d Printer Controller
    Copyright (C) 2015 Andrew Hodel

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
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');
var static = require('node-static');
var EventEmitter = require('events').EventEmitter;
var url = require('url');
var qs = require('querystring');
var util = require('util');
var http = require('http');
var chalk = require('chalk');
var isConnected, port, isBlocked, lastsent = "", paused = false;

console.log(chalk.green('***************************************************************'));
console.log(chalk.green('*                        Notice:                              *'));
console.log(chalk.green('***************************************************************'));
console.log(chalk.green('*'),chalk.white('    Remember to update (: !!!                              '), chalk.green('*'));
console.log(chalk.green('* 1.  Run ./update.sh or git pull                             *'));
console.log(chalk.green('* 2.  or check the commit log on                              *'));
console.log(chalk.green('*'), chalk.yellow('https://github.com/openhardwarecoza/LaserWeb/commits/master'), chalk.green('*'));
console.log(chalk.green('***************************************************************'));


// Lets add a message so users know where to point their browser
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log(chalk.green('*'),chalk.white('Access the LaserWeb User Interface:                        '), chalk.green('*'));
    console.log(chalk.green('* 1. Open Chrome                                              *'));
    console.log(chalk.green('* 2. Go to :                                                  *'));
    console.log(chalk.green('*'), chalk.yellow('   http://'+add+':'+config.webPort+'/                                  '), chalk.green('*'));
    console.log(chalk.green('***************************************************************'));
    console.log(chalk.green(' '));
    console.log(chalk.green(' '));
})


// Webserver
app.listen(config.webPort);
var fileServer = new static.Server('./public');
function handler (req, res) {
  	fileServer.serve(req, res, function (err, result) {
  		if (err) {
  			console.error(chalk.red('ERROR:'), chalk.yellow(' fileServer error:'+req.url+' : '), err.message);
  		}
  	});
}
function ConvChar( str ) {
  c = {'<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#039;',
       '#':'&#035;' };
  return str.replace( /[<&>'"#]/g, function(s) { return c[s]; } );
}


// Websocket <-> Serial
io.sockets.on('connection', function (socket) { // When we open a WS connection, send the list of ports
  serialport.list(function (err, ports) {
    socket.emit("ports", ports);
  });
  socket.on('refreshPorts', function(data) { // Or when asked
    console.log(chalk.yellow('WARN:'), chalk.blue('Requesting Ports Refresh '));
    serialport.list(function (err, ports) {
      socket.emit("ports", ports);
    });
  });
  socket.on('connectTo', function(data) { // If a user picks a port to connect to, open a Node SerialPort Instance to it
    data = data.split(',');
    console.log(chalk.yellow('WARN:'), chalk.blue('Connecting to Port ' + data));
    if (!isConnected) {
      port = new serialport(data[0], {  parser: serialport.parsers.readline("\n"), baudrate: parseInt(data[1]) });
    } else {
      socket.emit("connectStatus", 'Already Connected');
      port.write("?\n"); // Lets check if its LasaurGrbl?
      port.write("M115\n"); // Lets check if its Marlin?
      port.write("version\n"); // Lets check if its Smoothieware?
      port.write("$fb\n"); // Lets check if its TinyG
    }

    port.on('open', function() {
      socket.emit("connectStatus", 'Connected');
      port.write("?\n"); // Lets check if its LasaurGrbl?
			port.write("M115\n"); // Lets check if its Marlin?
			port.write("version\n"); // Lets check if its Smoothieware?
      port.write("$fb\n"); // Lets check if its TinyG
      isConnected = true;
      setInterval(function() {
          port.write('?');
          send1Q()
		  }, 100);
      setInterval(function(){
               socket.emit('qCount', gcodeQueue.length)
       },500);
    });

    port.on('error', function(err) { // open errors will be emitted as an error event
      console.log('Error: ', err.message);
      socket.emit("data", data);
    })
    port.on("data", function (data) {
      console.log('Recv: ' + data)
      if(data.indexOf("ok") != -1 || data == "start\r" || data.indexOf('<') == 0){
          socket.emit("data", data);
          setTimeout(function(){
               if(paused !== true){
                   send1Q()
               }
           },50);


       } else {
           console.log("Nope")
       }
		});
  });
  socket.on('firstLoad', function(data) {
		socket.emit('config', config);
	});
  socket.on('serialSend', function(data) {
    data = data.split('\n')
    for (i=0; i<data.length; i++) {
      addQ(data[i])
    }

	});
// End Websocket <-> Serial

// Queue

gcodeQueue = [];

function addQ(gcode) {
  gcodeQueue.push(gcode);
}

function jumpQ(gcode) {
  gcodeQueue.unshift(gcode)
}

function runQ() {

}

function send1Q() {
  if (gcodeQueue.length > 0) {
    var gcode = gcodeQueue.shift()
    console.log('Sent: '  + gcode + ' Q: ' + gcodeQueue.length)
    lastSent = gcode
    port.write(gcode + '\n');
  }
}


// End Queue


});
