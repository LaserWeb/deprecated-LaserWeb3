// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // SVG scope
    lw.svg = {
        name   : 'svg',
        logging: true
    };

    // Bind logging methods
    lw.log.bind(lw.svg);

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
            this.logStart('Parsing SVG: ' + name);
            var parser = new lw.svg.Parser();
            var svg    = parser.parse(file);
            this.logEnd();

            this.debug('parser:', parser);

            this.logStart('Drawing SVG: ' + name);
            var object = new THREE.Object3D();
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
        finally {
            this.logEnd();
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
