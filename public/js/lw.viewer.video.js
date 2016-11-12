// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Viewer video scope
    lw.viewer.video = {
        mode   : 'local', // [local, remote]
        enabled: false,
        monitor: null,
        canvas : null,
        context: null,
        texture: null
    };

    // -------------------------------------------------------------------------

    // Test and find user media feature
    navigator.getUserMedia = navigator.getUserMedia
                          || navigator.mozGetUserMedia
                          || navigator.webkitGetUserMedia;

    // Test and find URL feature
    var URL = window.URL || window.webkitURL;

    // -------------------------------------------------------------------------

    // Init the video
    lw.viewer.video.init = function() {
        // Get video usage
        var useVideo = lw.store.get('useVideo', 'Disable');

        // Disabled video ?
        this.enabled = useVideo !== 'Disable';

        if (! this.enabled) {
            return false;
        }

        // Get video mode
        this.mode = useVideo === 'Remote' ? 'remote' : 'local';

        if (this.mode == 'local') {
            this.initLocal();
        }
        else if (this.mode == 'remote') {
            this.initRemote();
        }
    };

    // -------------------------------------------------------------------------

    // On error
    lw.viewer.video.error = function(message) {
        if (typeof message !== 'string') {
            if (! message) {
                message = 'Sorry. WebRTC is not available.';
            }
            else if (message.code == 1) {
                message = 'User denied access to use camera. Please refresh the page, and click Allow on the permission request at the top of the browser window, to use Video Overlay.  Or Disable Video Overlay from <kbd>Settings <i class="fa fa-cogs"></i></kbd>';
            }
            else {
                message = 'No camera available. You have Video Overlay enabled in <kbd>Settings <i class="fa fa-cogs"></i></kbd>, but WebRTC could not locate a device.  Please plug in a webcam, and position the camera to look at your cutting bed';
            }
        }

        lw.log.print(message, 'error', 'viewer');
    };

    // -------------------------------------------------------------------------

    // Create and add video overlay 3D object to the viewer
    lw.viewer.video.createObject = function(width, height) {
        // Create mesh plan to handle the video
        var material = new THREE.MeshBasicMaterial({ map: this.texture, overdraw: true, side:THREE.DoubleSide });
        var geometry = new THREE.PlaneGeometry(width, height, 1, 1);
        var mesh     = new THREE.Mesh(geometry, material);

        // Get the grid size
        var gridWidth  = lw.viewer.grid.userData.size.x;
        var gridHeight = lw.viewer.grid.userData.size.y;

        // Get the desired video width
        var meshWidth  = parseInt(lw.store.get('videoWidth', 200));
        var meshScale  = meshWidth / width;
        var meshHeight = height * meshScale;

        // Scale the mesh holder
        mesh.scale.x = meshScale;
        mesh.scale.y = meshScale;

        // Set mesh position (top/right)
        var position = {
            x: gridWidth  - meshWidth,
            y: gridHeight - meshHeight,
            z: 0
        };

        // Add the mesh
        lw.viewer.addObject(mesh, {
            name     : 'video',
            target   : 'workspace',
            cartesian: true,
            position : position
        });
    };

    // -------------------------------------------------------------------------

    // Init local video
    lw.viewer.video.initLocal = function() {
        // WebRTC is not available
        if (! navigator.getUserMedia) {
            return onGetUserMediaError();
        }

        // Create main objects
        this.monitor = document.createElement('video');
        this.canvas  = document.createElement('canvas');
        this.texture = new THREE.Texture(this.canvas);
        this.context = this.canvas.getContext('2d');

        // Set texture filters
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;

        // Ask the user to use the video media
        navigator.getUserMedia({ video: true },
            function(stream) { lw.viewer.video.onStream(stream); },
            function(event)  { lw.viewer.video.error(event); }
        );
    };

    // On got stream
    lw.viewer.video.onStream = function(stream) {
        // Bind video stream with the video element
        stream.onended = function(event) {
            lw.viewer.video.error(event);
        };

        // On video playing
        var self = this;

        this.monitor.onplaying = function() {
            // Set canvas size
            self.canvas.width  = this.videoWidth;
            self.canvas.height = this.videoHeight;

            // background color if no video present
            self.context.fillStyle = '#ffffff';
            self.context.fillRect(0, 0, self.canvas.width, self.canvas.height);

            // Create and add video overlay 3D object to the viewer
            self.createObject(self.canvas.width, self.canvas.height);
        };

        // Load and "play" video stream
        this.monitor.onerror = function() { stream.stop(); };
        this.monitor.src     = URL ? URL.createObjectURL(stream) : stream;

        this.monitor.play();
    };

    // -------------------------------------------------------------------------

    // Init remote video
    lw.viewer.video.initRemote = function() {
        var url = lw.store.get('webcamUrl', null);

        if (! url) { // TODO better notice
            console.error('No video URL...');
            return;
        }

        // Create image
        var image         = document.createElement('img');
        image.crossOrigin = 'Anonymous';

        // Create texture from the image
        this.texture = new THREE.Texture(image);

        // Set texture filters
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;

        // On video playing
        image.onload = function() {
            // Create and add video overlay 3D object to the viewer
            lw.viewer.video.createObject(this.width, this.height);
        };

        // Load stream
        image.src = './?url=' + url;
    };

    // -------------------------------------------------------------------------

    // Refresh video
    lw.viewer.video.refresh = function() {
        if (! this.enabled) {
            return;
        }

        if (this.mode === 'local' && this.monitor.readyState === this.monitor.HAVE_ENOUGH_DATA) {
            this.context.drawImage(this.monitor, 0, 0, this.canvas.width, this.canvas.height);
        }

        this.texture.needsUpdate = true;
    };

    // End viewer scope
})();
