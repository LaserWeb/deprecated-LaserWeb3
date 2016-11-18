// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // SVG scope
    lw.svg = {};

    // -------------------------------------------------------------------------

    lw.svg.drawFile = function(file, name, settings) {
        // Default settings
        settings          = settings          || {};
        settings.onObject = settings.onObject || null;
        settings.onError  = settings.onError  || null;

        // Register settings
        this.settings = settings;

        try {
            // Parse the SVG file (raw XML)
            var parser = new lw.svg.Parser();
            var svg    = parser.parse(file);
            var object = new THREE.Object3D();

            console.log('parser:', parser);
        }
        catch (error) {
            // Call user callback
            if (this.settings.onError) {
                this.settings.onError(error);

                // Return error object
                return error;
            }

            // Else throw error
            throw error;
        }

        // Call user callback
        if (this.settings.onObject) {
            this.settings.onObject(object);
        }

        // Return object
        return object;
    };

    // -------------------------------------------------------------------------

    // End svg scope
})();
