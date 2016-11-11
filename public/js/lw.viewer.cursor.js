// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Viewer Cursor 3D object
    lw.viewer.Cursor = function(radius, segments) {
        // Call parent constructor
        THREE.Object3D.call(this);

        // Set object name
        this.name = 'cursor';

        // Main circle
        radius   = radius   || 3.5;
        segments = segments || 32;

        var material = new THREE.LineBasicMaterial({ color: 0xFF0000 });
        var geometry = new THREE.CircleGeometry(radius, segments);

        this.add(new THREE.Line(geometry, material));

        // Line X
        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(-6, 0, 0),
            new THREE.Vector3(6, 0, 0)
        );

        this.add(new THREE.Line(geometry, material));

        // Line Y
        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(0, -6, 0),
            new THREE.Vector3(0, 6, 0)
        );

        this.add(new THREE.Line(geometry, material));
    };

    // Extends THREE.Object3D
    lw.viewer.Cursor.prototype             = Object.create(THREE.Object3D.prototype);
    lw.viewer.Cursor.prototype.constructor = lw.viewer.Cursor;

    // Move cursor at new position (x can be an Vector3D)
    lw.viewer.Cursor.prototype.moveTo = function(x, y, z) {
        if (typeof x === 'object') {
            z = x.z;
            y = x.y;
            x = x.x;
        }

        this.position.set(x, y, z);
    };

// End viewer scope
})();
