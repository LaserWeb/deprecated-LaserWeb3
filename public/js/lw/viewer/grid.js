// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Viewer Grid 3D object
    lw.viewer.Grid = function(x, y, size) {
        // Size limits
        x = parseInt(x);
        y = parseInt(y);
        x = (isNaN(x) || x < 10) ? 200 : x;
        y = (isNaN(y) || y < 10) ? 200 : y;

        // Call parent constructor
        THREE.GridHelper.call(this, x, y, size || 10);

        // Set object name
        this.name = 'grid';

        // Set grid color (centerLine, grid)
        this.setColors(0xcccccc, 0xeeeeee);

        // Save grid size in user data
        this.userData.size = { x: x, y: y };
    };

    // Extends THREE.GridHelper
    lw.viewer.Grid.prototype             = Object.create(THREE.GridHelper.prototype);
    lw.viewer.Grid.prototype.constructor = lw.viewer.Grid;

// End viewer scope
})();
