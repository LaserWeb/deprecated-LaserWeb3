/*

    AUTHOR:  Andrew Hodel with additional functionality by Peter van der Walt

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
var SerialPort = serialport.SerialPort; // localize object constructor
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

// Debug Parameters in command line
args = process.argv.slice(2);
if (args[0]) {
  if (args[0].indexOf('--debug') == 0) { // add --debug <firmwarestring>
      console.log(chalk.yellow('WARN:'), chalk.blue('Forcing debug testing with specific Firmware String: '), chalk.yellow(args[1]));
      var debugfirmware = args[1];
  };
};

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


io.sockets.on('connection', function (socket) {

  // When we open a WS connection, send the list of ports
  serialport.list(function (err, ports) {
    socket.emit("ports", ports);
  });

  // Or when asked
  socket.on('refreshPorts', function(data) {
    console.log(chalk.yellow('WARN:'), chalk.blue('Requesting Ports Refresh '));
    serialport.list(function (err, ports) {
      socket.emit("ports", ports);
    });
  });

  // If a user picks a port to connect to, open a Node SerialPort Instance to it
    socket.on('connectTo', function(data) {

      data = data.split(',');
    console.log(chalk.yellow('WARN:'), chalk.blue('Connecting to Port ' + data));
        port = new SerialPort(data[0], {
  			parser: serialport.parsers.readline("\n"),
  			baudrate: parseInt(data[1])
  		});

      port.on('open', function() {
        port.write("?\n"); // Lets check if its LasaurGrbl?
  			port.write("M115\n"); // Lets check if its Marlin?
  			port.write("version\n"); // Lets check if its Smoothieware?
        port.write("$fb\n"); // Lets check if its TinyG
      });

      // open errors will be emitted as an error event
      port.on('error', function(err) {
        console.log('Error: ', err.message);
      })

      port.on("data", function (data) {
  				socket.emit("data", data);
  		});
    });


  socket.on('firstLoad', function(data) {
		socket.emit('config', config);
    // if (args[0]) {
    //   if (args[0].indexOf('--debug') == 0) {
    //     socket.emit('firmware', debugfirmware);
    //     console.log(chalk.yellow('WARN:'), chalk.blue('Forcing debug testing with specific Firmware String: '), chalk.yellow(args[1]));
    //   };
    // };
	});

  socket.on('serialSend', function(data) {
		port.write(data + '\n');
    // if (args[0]) {
    //   if (args[0].indexOf('--debug') == 0) {
    //     socket.emit('firmware', debugfirmware);
    //     console.log(chalk.yellow('WARN:'), chalk.blue('Forcing debug testing with specific Firmware String: '), chalk.yellow(args[1]));
    //   };
    // };
	});


});
