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
        printLog('<h5><i class="fa fa-search fa-fw" aria-hidden="true"></i>WebGL Support found!</h5><b>success:</b><br> Laserweb will work optimally on this device!<hr><p>', successcolor);
    }
    else if (canvasRenderer) {
        printLog('<h5><i class="fa fa-search fa-fw" aria-hidden="true"></i>No WebGL Support found!</h5><b>CRITICAL ERROR:</b><br> Laserweb may not work optimally on this device! <br>Try another device with WebGL support</p><br><u>Try the following:</u><br><ul><li>In the Chrome address bar, type: <b>chrome://flags</b> [Enter]</li><li>Enable the <b>Override software Rendering</b></li><li>Restart Chrome and try again</li></ul>Sorry! :(<hr><p>', errorcolor);
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
        this.$renderArea.html(this.renderer.domElement);

        // Update the camera
        this.camera.updateProjectionMatrix();
    };

// End viewer scope
})();
