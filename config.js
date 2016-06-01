require('dotenv').load({ silent: true });

var config = {};

config.webPort = process.env.WEB_PORT || 8000;
config.serialBaudRate = process.env.SERIAL_BAUD_RATE || 115200;
config.webcamPort = process.env.WEBCAM_PORT || 8080;  // expects a webcam stream from mjpg_streamer
config.xmax = process.env.X_MAX || 600 // Max length of X Axis in mm
config.ymax = process.env.Y_MAX || 400 // Max length of Y Axis in mm

module.exports = config;
