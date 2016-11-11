// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Viewer scope
    lw.viewer = {
        scene : null,
        camera: null
    };

    // Init the viewer
    lw.viewer.init = function() {
        // Create the scene object
        this.scene = new THREE.Scene();

        // Create the camera object
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);

        // Set camera initial position
        this.camera.position.z = 295;
    };

// End viewer scope
})();
