// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Viewer scope
    lw.viewer = {
        scene: null
    };

    // Init the viewer
    lw.viewer.init = function() {
        // Create the scene
        this.scene = new THREE.Scene();
    };

// End viewer scope
})();
