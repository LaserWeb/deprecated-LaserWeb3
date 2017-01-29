"use strict";
var config = require('./config');
var serialport = require("serialport");
var SerialPort = serialport;
var fs = require('fs');
var readline = require('readline');

var logFile;
var isConnected, connectedTo, port, lastSent = '';
var paused = false;
var blocked = false;
var statusLoop;
var gcodeQueue = [];
var firmware, fVersion, fDate;
var startTime;
var rd;
var queueLen;
var queuePos = 0;
var queuePointer = 0;

var GRBL_RX_BUFFER_SIZE = 128;      // 128 characters
var grblBufferSize = [];
var new_grbl_buffer = true;
                             
var SMOOTHIE_RX_BUFFER_SIZE = 128;  // max. length of one command line
var smoothie_buffer = true;

var TINYG_RX_BUFFER_SIZE = 4;       // max. lines of gcode to send before wait for ok
var tinygBufferSize = TINYG_RX_BUFFER_SIZE; // init space left
var jsObject;

var port = process.argv[2];
var file = process.argv[3];

port = new SerialPort(port, {
    parser: serialport.parsers.readline("\n"),
    baudrate: parseInt('115200')
});

port.on('open', function () {
    setTimeout(function() { //wait for controller to be ready
        if (!firmware) { // Grbl should be allready retected
            port.write('version\n'); // Check if it's Smoothieware?
            setTimeout(function() {  // Wait for Smoothie to answer
                if (!firmware) {     // If still not set
                    port.write('$fb\n'); // Check if it's TinyG
                }
            }, 500);
        }
    }, 500);
    isConnected = true;
    connectedTo = port.path;
});

port.on('close', function () { // open errors will be emitted as an error event
    clearInterval(statusLoop);
    isConnected = false;
    connectedTo = false;
    firmware = false;
    fVersion = false;
    fDate = false;
});

port.on('data', function (data) {
    //writeLog('Recv: ' + data);
    if (data.indexOf('ok') === 0) { // Got an OK so we are clear to send
        blocked = false;
        if (firmware === 'grbl') {
            var space = grblBufferSize.shift();
        }
        send1Q();
    } else if (data.indexOf('Grbl') === 0) { // Check if it's Grbl
        firmware = 'grbl';
        fVersion = data.substr(5, 4); // get version
        writeLog('GRBL detected (' + fVersion + ')');

        // Start intervall for status queries
        statusLoop = setInterval(function () {
            if (isConnected) {
                port.write('?');
            }
        }, 250);

        // Add file to queue and start sending
        rd = readline.createInterface({
            input: fs.createReadStream('./' + file),
            terminal: false
        });

        rd.on('line', function(line) {
            line = line.split(';'); // Remove everything after ; = comment
            line = line[0];
            if (line.length > 0) {
                if (line.indexOf('G0') === 0 || line.indexOf('G1') === 0) {
                    line = line.replace(/\s+/g, '');
                }
                //console.log(line);
                addQ(line);
            }
        });
        rd.on('close', function() {
//            queueLen = gcodeQueue.length;
            console.log('Queue: ' + queueLen); 
            startTime = new Date(Date.now());
            send1Q();
        });
    } else if (data.indexOf('LPC176') >= 0) { // LPC1768 or LPC1769 should be Smoothie
        //  Build version: edge-6ce309b, Build date: Jan 2 2017 23:50:57, MCU: LPC1768, System Clock: 100MHz
        firmware = 'smoothie';
        var startPos = data.search(/version:/i) + 9;
        fVersion = data.substr(startPos).split(/,/, 1);
        startPos = data.search(/Build date:/i) + 12;
        fDate = new Date(data.substr(startPos).split(/,/, 1));
        var dateString = fDate.toDateString();
        writeLog('Smoothieware detected (' + fVersion + ', ' + dateString + ')');

        // Start intervall for status queries
        statusLoop = setInterval(function () {
            if (isConnected) {
                port.write('?');
            }
        }, 250);
        
        // Add file to queue and start sending
        rd = readline.createInterface({
            input: fs.createReadStream('./' + file),
            terminal: false
        });

        rd.on('line', function(line) {
            line = line.split(';'); // Remove everything after ; = comment
            line = line[0];
            if (line.length > 0) {
                if (line.indexOf('G0') === 0 || line.indexOf('G1') === 0) {
                    line = line.replace(/\s+/g, '');
                }
                //console.log(line);
                addQ(line);
            }
        });
        rd.on('close', function() {
//            queueLen = gcodeQueue.length;
            console.log('Queue: ' + queueLen); 
            startTime = new Date(Date.now());
            send1Q();
        });
    } else if (data.indexOf('{') === 0) { // TinyG response
        jsObject = JSON.parse(data);
        if (jsObject.hasOwnProperty('r')) {
            writeLog('response ' + jsObject.r);
            jsObject = jsObject.r;
            tinygBufferSize++;
            blocked = false;
            send1Q();
        }

        if (jsObject.hasOwnProperty('fb')) { // Check TinyG Version
            firmware = 'tinyg';
            fVersion = jsObject.fb;
            writeLog('TinyG detected (' + fVersion + ')');

            // Start intervall for status queries
            statusLoop = setInterval(function () {
                if (isConnected) {
                    port.write('{"sr":null}');
                }
            }, 250);

            // Add file to queue and start sending
            rd = readline.createInterface({
                input: fs.createReadStream('./' + file),
                terminal: false
            });

            rd.on('line', function(line) {
                line = line.split(';'); // Remove everything after ; = comment
                line = line[0];
                if (line.length > 0) {
                    if (line.indexOf('G0') === 0 || line.indexOf('G1') === 0) {
                        line = line.replace(/\s+/g, '');
                    }
                    //console.log(line);
                    addQ(line);
                }
            });
            rd.on('close', function() {
//                queueLen = gcodeQueue.length;
                console.log('Queue: ' + queueLen); 
                startTime = new Date(Date.now());
                send1Q();
            });
        }
    } else if (data.indexOf('error') === 0) {
        if (firmware === 'grbl') {
            grblBufferSize.shift();
        }
    }
});


// Queue
function addQ(gcode) {
    gcodeQueue.push(gcode);
    queueLen = gcodeQueue.length;
}

function grblBufferSpace() {
    var total = 0;
    var len = grblBufferSize.length;
    for (var i = 0; i < len; i++) {
        total += grblBufferSize[i];
    }
    return GRBL_RX_BUFFER_SIZE - total;
}


function send1Q() {
    var gcode;
    var gcodeLen = 0;
    var spaceLeft = 0;
    if (isConnected) {
        switch (firmware) {
            case 'grbl':
                if (new_grbl_buffer) {
                    var gcodeLine = '';
                    if (grblBufferSize.length === 0){
                        spaceLeft = GRBL_RX_BUFFER_SIZE;
                        while ((queueLen - queuePointer) > 0 && spaceLeft > 0 && !blocked && !paused) {
                            gcodeLen = gcodeQueue[queuePointer].length;
                            if (gcodeLen < spaceLeft) {
                                // Add gcode to send buffer
                                gcode = gcodeQueue[queuePointer];
                                queuePointer++;
                                grblBufferSize.push(gcodeLen + 1);
                                gcodeLine += gcode + '\n';
                                spaceLeft = GRBL_RX_BUFFER_SIZE - gcodeLine.length;
                            } else {
                                // Not enough space left in send buffer
                                blocked = true;
                            }
                        }
                        if (gcodeLine.length > 0) {
                            // Send the buffer
                            blocked = true;
                            port.write(gcodeLine);
                            lastSent = gcodeLine;
                            //writeLog('Sent: ' + gcodeLine + ' Q: ' + (queueLen - queuePointer));
                            gcodeLine = '';
                        }
                    }
                } else {
                    while ((queueLen - queuePointer) > 0 && !blocked && !paused) {
                        spaceLeft = grblBufferSpace();
                        gcodeLen = gcodeQueue[queuePointer].length;
                        if (gcodeLen < spaceLeft) {
                            gcode = gcodeQueue[queuePointer];
                            queuePointer++;
                            grblBufferSize.push(gcodeLen + 1);
                            port.write(gcode + '\n');
                            lastSent = gcode;
                            //writeLog('Sent: ' + gcode + ' Q: ' + gcodeQueue.length + ' Bspace: ' + (spaceLeft - gcodeLen - 1));
                        } else {
                            blocked = true;
                        }
                    }
                }
                break;
            case 'smoothie':
                if (smoothie_buffer) {
                    var gcodeLine = '';
                    spaceLeft = SMOOTHIE_RX_BUFFER_SIZE;
                    while ((queueLen - queuePointer) > 0 && spaceLeft > 0 && !blocked && !paused) {
                        gcodeLen = gcodeQueue[queuePointer].length;
                        if (gcodeLen < spaceLeft) {
                            // Add gcode to send buffer
                            gcode = gcodeQueue[queuePointer];
                            queuePointer++;
                            gcodeLine += gcode;
                            spaceLeft = SMOOTHIE_RX_BUFFER_SIZE - gcodeLine.length;
                        } else {
                            // Not enough space left in send buffer
                            blocked = true;
                        }
                    }
                    if (gcodeLine.length > 0) {
                        // Send the buffer
                        blocked = true;
                        port.write(gcodeLine + '\n');
                        lastSent = gcodeLine;
                        //writeLog('Sent: ' + gcodeLine + ' Q: ' + (queueLen - queuePointer));
                        gcodeLine = '';
                    }
                } else {
                    if ((queueLen - queuePointer) > 0 && !blocked && !paused) {
                        gcode = gcodeQueue[queuePointer];
                        queuePointer++;
                        blocked = true;
                        port.write(gcode + '\n');
                        lastSent = gcode;
                        //writeLog('Sent: ' + gcode + ' Q: ' + gcodeQueue.length);
                    }
                }
                break;
            case 'tinyg':
                while (tinygBufferSize > 0 && gcodeQueue.length > 0 && !blocked && !paused) {
                    gcode = gcodeQueue.shift();
                    port.write(gcode + '\n');
                    lastSent = gcode;
                    //writeLog('Sent: ' + gcode + ' Q: ' + gcodeQueue.length);
                    tinygBufferSize--;
                }
                break;
        }
        var finishTime, elapsedTimeMS, elapsedTime, speed;
        if ((queuePointer - queuePos) >= 100) {
            queuePos = queuePointer;
            if (startTime >= 0) {
                finishTime = new Date(Date.now());
                elapsedTimeMS = finishTime.getTime() - startTime.getTime();
                elapsedTime = Math.round(elapsedTimeMS / 1000);
                speed = (queuePointer / elapsedTime).toFixed(0);
                writeLog('Done: ' + queuePointer + '/' + queueLen + ' (ave. ' + speed + ' lines/s)');
            } else {
                writeLog('Done: ' + queuePointer + '/' + queueLen);
            }
        }
        if ((queueLen - queuePointer) === 0) {
            if (startTime >= 0) {
                finishTime = new Date(Date.now());
                elapsedTimeMS = finishTime.getTime() - startTime.getTime();
                elapsedTime = Math.round(elapsedTimeMS / 1000);
                speed = (queuePointer / elapsedTime).toFixed(0);
                writeLog("Job started at " + startTime.toString());
                writeLog("Job finished at " + finishTime.toString());
                writeLog("Elapsed time: " + elapsedTime + " seconds.");
                writeLog('Ave. Speed: ' + speed + ' lines/s');
                process.exit();
            }
        }
    }
}

function writeLog(line) {
    console.log(line);
    if (config.logFile) {
        if (!logFile) {
            logFile = fs.createWriteStream('logfile.txt');
        }
        var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        line = line.split(String.fromCharCode(0x1B) + '[31m').join('');
        line = line.split(String.fromCharCode(0x1B) + '[32m').join('');
        line = line.split(String.fromCharCode(0x1B) + '[33m').join('');
        line = line.split(String.fromCharCode(0x1B) + '[34m').join('');
        line = line.split(String.fromCharCode(0x1B) + '[35m').join('');
        line = line.split(String.fromCharCode(0x1B) + '[36m').join('');
        line = line.split(String.fromCharCode(0x1B) + '[37m').join('');
        line = line.split(String.fromCharCode(0x1B) + '[38m').join('');
        line = line.split(String.fromCharCode(0x1B) + '[39m').join('');
        line = line.split(String.fromCharCode(0x1B) + '[94m').join('');
        logFile.write(time + ' ' + line + '\r\n');
    }
}