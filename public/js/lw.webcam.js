// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Webcam scope
    lw.webcam = {};

    // Test and find user media feature
    navigator.getUserMedia = navigator.getUserMedia
                          || navigator.mozGetUserMedia
                          || navigator.webkitGetUserMedia;

    // Test and find URL feature
    var URL = window.URL || window.webkitURL;

    // Video DOM element
    var monitor = document.getElementById('monitor');

    // On error
    function onError(event) {
        var message;

        if (! event) {
            message = 'Sorry. WebRTC is not available.';
        }
        else if (event.code == 1) {
            message = 'User denied access to use camera. Please refresh the page, and click Allow on the permission request at the top of the browser window, to use Video Overlay.  Or Disable Video Overlay from <kbd>Settings <i class="fa fa-cogs"></i></kbd>';
        }
        else {
            message = 'No camera available. You have Video Overlay enabled in <kbd>Settings <i class="fa fa-cogs"></i></kbd>, but WebRTC could not locate a device.  Please plug in a webcam, and position the camera to look at your cutting bed';
        }

        printLog(message, errorcolor, 'viewer');
        lw.viewer.scene.remove(movieScreen);
    }

    // On got stream
    function onStream(stream) {
        stream.onended  = onError;
        monitor.onerror = stream.stop;
        monitor.src     = URL ? URL.createObjectURL(stream) : stream;
    }

    // Init the webcam
    lw.webcam.init = function() {
        // WebRTC is not available
        if (! navigator.getUserMedia) {
            return onError();
        }

        // Ask the user to use the video media
        navigator.getUserMedia({ video: true }, onStream, onError);
    };

    // End webcam scope
})();
