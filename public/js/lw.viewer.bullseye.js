// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Viewer Bullseye 3D object
    lw.viewer.Bullseye = function() {
        // Call parent constructor
        THREE.Object3D.call(this);

        // Set object name
        this.name = 'bullseye';

        // Create cone object
        var cone = new THREE.Mesh(
            new THREE.CylinderGeometry(0, 5, 40, 15, 1, false),
            new THREE.MeshPhongMaterial({
                color    : 0x0000ff,
                specular : 0x0000ff,
                shininess: 100
            })
        );

        cone.overdraw             = true;
        cone.castShadow           = false;
        cone.rotation.x           = -90 * Math.PI / 180;
        cone.position.z           = 20;
        cone.material.opacity     = 0.6;
        cone.material.transparent = true;

        this.add(cone);
    };

    // Extends THREE.Object3D
    lw.viewer.Bullseye.prototype             = Object.create(THREE.Object3D.prototype);
    lw.viewer.Bullseye.prototype.constructor = lw.viewer.Bullseye;

    // Move cursor at new position (x can be an Vector3D)
    lw.viewer.Bullseye.prototype.moveTo = function(x, y, z) {
        if (typeof x === 'object') {
            z = x.z;
            y = x.y;
            x = x.x;
        }

        this.position.set(x, y, z);
    };

// End viewer scope
})();
