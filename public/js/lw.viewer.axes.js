// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Viewer Axes 3D object
    lw.viewer.Axes = function(x, y) {
        // Call parent constructor
        THREE.Object3D.call(this);

        // Set object name
        this.name = 'axes';

        // Size limits
        x = parseInt(x);
        y = parseInt(y);
        x = (isNaN(x) || x < 10) ? 200 : x;
        y = (isNaN(y) || y < 10) ? 200 : y;

        // Object usser data
        this.userData.size = { x: x, y: y };

        // Add axes steps number
        var i, steps = 50, temp = [];

        for (i = 0; i <= x; i += steps) {
            this.add(makeSprite(lw.viewer.scene, 'webgl', {
                x    : i,
                y    : -14,
                z    : 0,
                text : i,
                color: "#ff0000"
            }));
        }

        for (i = 0; i <= y; i += steps) {
            this.add(makeSprite(lw.viewer.scene, 'webgl', {
                x    : -14,
                y    : i,
                z    : 0,
                text : i,
                color: "#006600"
            }));
        }

        // Add axes labels
        this.add(makeSprite(lw.viewer.scene, 'webgl', {
            x    : x,
            y    : 0,
            z    : 0,
            text : "X",
            color: "#ff0000"
        }));

        this.add(makeSprite(lw.viewer.scene, 'webgl', {
            x    : 0,
            y    : y,
            z    : 0,
            text : "Y",
            color: "#006600"
        }));

        // Add axes lines
        var material = new THREE.LineBasicMaterial({ color: 0xcc0000 });
        var geometry = new THREE.Geometry();

        geometry.vertices.push(
            new THREE.Vector3(-0.1, 0, 0),
            new THREE.Vector3(-0.1, (y - 5), 0)
        );

        this.add(new THREE.Line(geometry, material));

        material = new THREE.LineBasicMaterial({ color: 0x00cc00 });
        geometry = new THREE.Geometry();

        geometry.vertices.push(
            new THREE.Vector3(0, -0.1, 0),
            new THREE.Vector3((x - 5), -0.1, 0)
        );

        this.add(new THREE.Line(geometry, material));
    };

    // Extends THREE.Object3D
    lw.viewer.Axes.prototype             = Object.create(THREE.Object3D.prototype);
    lw.viewer.Axes.prototype.constructor = lw.viewer.Axes;

// End viewer scope
})();
