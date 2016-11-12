// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Viewer BoundingBox 3D object
    lw.viewer.BoundingBox = function(object) {
        // Call parent constructor
        THREE.Object3D.call(this);

        // Set object name
        this.name = 'boundingbox';

        // Get object bounding box size
        var bbox = new THREE.Box3().setFromObject(object);

        // Create bounding box object
        var material = new THREE.LineDashedMaterial({ color: 0xaaaaaa, dashSize: 5, gapSize: 4, linewidth: 2 });
        var geometry = new THREE.Geometry();

        geometry.vertices.push(
            new THREE.Vector3((bbox.min.x - 1), (bbox.min.y - 1), 0),
            new THREE.Vector3((bbox.min.x - 1), (bbox.max.y + 1), 0),
            new THREE.Vector3((bbox.max.x + 1), (bbox.max.y + 1), 0),
            new THREE.Vector3((bbox.max.x + 1), (bbox.min.y - 1), 0),
            new THREE.Vector3((bbox.min.x - 1), (bbox.min.y - 1), 0)
        );

        geometry.computeLineDistances(); //  NB If not computed, dashed lines show as solid

        // Add line contour
        this.add(new THREE.Line(geometry, material));

        // Create and add size labels
        var width  = parseFloat(bbox.max.x - bbox.min.x);
        var height = parseFloat(bbox.max.y - bbox.min.y);

        this.add(new lw.viewer.Label({
            x    : bbox.max.x + 30,
            y    : bbox.max.y - (height / 2) + 10,
            z    : 0,
            text : "W: " + width.toFixed(2) + "mm",
            color: "#aaaaaa",
            size : 6
        }));

        this.add(new lw.viewer.Label({
            x    : bbox.max.x - (width / 2) + 10,
            y    : bbox.max.y + 10,
            z    : 0,
            text : "H: " + height.toFixed(2) + "mm",
            color: "#aaaaaa",
            size : 6
        }));
    };

    // Extends THREE.Object3D
    lw.viewer.BoundingBox.prototype             = Object.create(THREE.Object3D.prototype);
    lw.viewer.BoundingBox.prototype.constructor = lw.viewer.BoundingBox;

// End viewer scope
})();
