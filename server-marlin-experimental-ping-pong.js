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
var isConnected, port, isBlocked, paused = false, blocked = false, queryLoop, queueCounter, feedAtWaitLoop;

var lastSentTime=0; // Really old.

sentGcodeQueue = [];
sentLen = 0;

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

	socket.on('closePort', function(data) { // If a user picks a port to connect to, open a Node SerialPort Instance to it
	    console.log(chalk.yellow('WARN:'), chalk.blue('Closing Port ' + port.path));
	    socket.emit("connectStatus", 'closed:'+port.path);
	    port.close();
	});

	port.on('open', function() {
	    socket.emit("connectStatus", 'opened:'+port.path);
	    isConnected = true;
	    connectedTo = port.path;
	    feedAtWaitLoop = setInterval(function() {
		var d = new Date();
		var now = d.getTime();
		if (now-lastSentTime > 1000){ // 2 sec
		    //		    console.log("Trigger push now=" + now + " lastTime=" + lastSentTime);
		    send1Q();
		}
	    }, 1000);
	    queryLoop = setInterval(function() {
		jumpQ("M114");
	    }, 1000);
	    queueCounter = setInterval(function(){
		socket.emit('qCount', gcodeQueue.length)
	    },500);
	});

	port.on('close', function(err) { // open errors will be emitted as an error event
	    clearInterval(queueCounter);
	    clearInterval(queryLoop);
	    clearInterval(feedAtWaitLoop);
	    socket.emit("connectStatus", 'closed:'+port.path);
	    isConnected = false;
	    connectedTo = false;
	})

	port.on('error', function(err) { // open errors will be emitted as an error event
	    console.log('Error: ', err.message);
	    socket.emit("data", data);
	})

	port.on("data", function (data) {
	    //console.log('Recv: ' + data)
	    if(data.indexOf("ok") != -1 || data == "start\r" || data.indexOf('<') == 0 || data.indexOf("X:") != -1){
		if (data.indexOf("ok") == 0) { // Got an OK so we are clear to send
		    if (sentGcodeQueue.length > 0) {
			var a = sentGcodeQueue.shift();
			var d = new Date();
			sentLen -= a;
//			console.log("Removed :" + a +  " queue is now: " + sentLen);
			if (tot() != sentLen)
			    console.log("Error in counting: tot()=" + tot() + " sentLen=" + sentLen);
		        send1Q();
		    } else {
//			console.log("BAD TOO LOW");
			sentLen = 0;
			sentGcodeQueue.shift();
			sentGcodeQueue.shift();
			sentGcodeQueue.shift();
			sentGcodeQueue.shift();
		    }
		}
		if (data.indexOf("X:") != -1) {
		    t = data.split(/ |:/);
		    // X:0.00 Y:0.00 Z:0.00 E:0.00 Count X: 0 Y:0 Z:0
		    statusMessage = "<Run,MPos:" + t[1] + "," + t[3] + "," + t[5] + ",WPos:" + t[1] + "," + t[3] + "," + t[5] + ">";
		    //<Idle,MPos:26.7550,0.0850,0.0000,WPos:26.7550,0.0850,0.0000>
//		    console.log("Status1:" + data)
		    data = statusMessage; // replace
//		    console.log("Status2:" + data)
		}
		socket.emit("data", data);
	    } else {
		console.log("Nope:" + data)
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

    txBufferSize = 110;
    function tot() {
	var sum=0;
	for (var i=0; i < sentGcodeQueue.length; i++) {
	    sum += sentGcodeQueue[i];
	}
	return sum;
    }


    function addQ(gcode) {
	gcodeQueue.push(gcode);
    }

    function jumpQ(gcode) {
	if (gcodeQueue.length > 0 &&  gcodeQueue[0] == gcode)
	    return; // Don't duplicate
	gcodeQueue.unshift(gcode)
    }

    function send1Q() {
	//  if (sentLen < 0) { console.log("Less than zero. BAD"); sentLen = 0; }
	// if (sentGcodeQueue.length > 1) {
	//     return false;
	// }
	if (gcodeQueue.length > 0) {
	    if (sentLen < 0) {
		console.log("< 0! SYNC.!" + sentLen);
		sentLen = 0;
		return false;
	    }
	    if (gcodeQueue[0].length == 0 || gcodeQueue[0].indexOf(";") == 0) { // Comment, skip
//		console.log("Empty line or comment, skip:" + gcodeQueue[0]);
		gcodeQueue.shift();
		return send1Q();
	    }
//	    if (gcodeQueue[0].length+1 < (txBufferSize - sentLen)) { // There is room
	    if (sentGcodeQueue.length == 0) {
		var gcode = gcodeQueue.shift() + '\n';
//		console.log('Sent: '  + gcode + ' L: ' + gcode.length + ' sentQ: ' + sentGcodeQueue.length + ' sentLen: ' + (sentLen+gcode.length))
		port.write(gcode+'\n');
		port.flush();
		sentGcodeQueue.push(gcode.length);
		sentLen += gcode.length;
		var d = new Date();
		lastSentTime = d.getTime();
		return true;
	    }
	}
	return false;
    }
    // End Queue
});
