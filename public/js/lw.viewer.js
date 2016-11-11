// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Viewer scope
    lw.viewer = {
        $render : $('#renderArea'),
        size    : { width: null, height: null, ratio: null },
        scene   : null,
        camera  : null,
        renderer: null,
    };

    // -------------------------------------------------------------------------

    // Rendering mode detection
    var canvasRenderer = !!window.CanvasRenderingContext2D;
    var webglRenderer  = (function() {
        try {
            return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
        }
        catch (e) {
            return false;
        }
    })();

    if (webglRenderer) {
        lw.log.print('<strong>WebGL Support found!</strong> Laserweb will work optimally on this device!', 'success', 'viewer');
    }
    else if (canvasRenderer) {
        var message = [
            '<strong>No WebGL Support found!</strong> Laserweb may not work optimally on this device!<br />',
            '<u>Try another device with WebGL supportor or try the following:</u><br />',
            '<ul>',
            '<li>In the Chrome address bar, type: <b>chrome://flags</b> [Enter]</li>',
            '<li>Enable the <b>Override software Rendering</b></li>',
            '<li>Restart Chrome and try again</li>',
            '</ul>',
            'Sorry! :( <hr />'
        ];

        lw.log.print(message.join('\n'), 'error', 'viewer');
    };

    // -------------------------------------------------------------------------

    // Init the viewer
    lw.viewer.init = function() {
        // Get render area size
        this.size.width  = this.$render.offsetWidth;
        this.size.height = this.$render.offsetHeight;
        this.size.ratio  = this.size.width / this.size.height;

        // Create the scene object
        this.scene = new THREE.Scene();

        // Create the camera object
        this.camera = new THREE.PerspectiveCamera(75, this.size.ratio, 1, 10000);

        // Set camera initial position
        this.camera.position.z = 295;

        // Create renderer object
        this.renderer = webglRenderer ? new THREE.WebGLRenderer({
            autoClearColor: true,
            antialias     : false
        }) : new THREE.CanvasRenderer();

        // Initialize the renderer
        this.renderer.setSize(this.size.width, this.size.height);
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.clear();

        // Add the renderer DOM element to target area
        this.$render.html(this.renderer.domElement);

        // Update the camera
        this.camera.updateProjectionMatrix();
    };

// End viewer scope
})();
