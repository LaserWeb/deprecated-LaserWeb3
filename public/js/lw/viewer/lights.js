// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Viewer Lights 3D object
    lw.viewer.Lights = function() {
        // Call parent constructor
        THREE.Object3D.call(this);

        // Set object name
        this.name = 'lights';

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(-500, -500, 1).normalize();
        this.add(light);

        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 0, 1).normalize();
        this.add(light);
    };

    // Extends THREE.Object3D
    lw.viewer.Lights.prototype             = Object.create(THREE.Object3D.prototype);
    lw.viewer.Lights.prototype.constructor = lw.viewer.Lights;

// End viewer scope
})();
