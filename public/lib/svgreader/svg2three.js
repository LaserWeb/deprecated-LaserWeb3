// Author Jordan Sitkin https://github.com/dustMason/Machine-Art
// Significant rewrite for LaserWeb by Peter van der Walt

// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // SVG scope
    lw.svg = {};

    // -----------------------------------------------------------------------------

    lw.svg.draw = function(svg, name, settings) {
        // Defaults settings
        settings       = settings || {};
        settings.scale = settings.scale || 1;

        // console.log(svg, name, settings);
        var SVGObject = new THREE.Object3D();

        // Parse the SVG contents
        var reader = new lw.SVGReader(svg);
        var paths  = reader.parse();

        console.info('reader:', reader);
        console.info('paths:', paths);
    };

    // End svg scope
})();
