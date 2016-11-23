// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // SVG scope
    lw.svg = {
        name   : 'svg',
        logging: true,
        parser : null
    };

    // Bind logging methods
    lw.log.bind(lw.svg);

    // -------------------------------------------------------------------------

    lw.svg.createColor = function(color) {
        // TODO ...
        //return new THREE.Color('red');
        color = new THREE.Color(color);
        var r = color.r * 255;
        var g = color.g * 255;
        var b = color.b * 255;

        // Darken too light colors...
        var luma, lumaLimit = 200;

        while (true) {
            luma = (r * 0.3) + (g * 0.59) + (b * 0.11);

            if (luma <= lumaLimit) {
                break;
            }

            r > 0 && (r -= 1);
            g > 0 && (g -= 1);
            b > 0 && (b -= 1);
        }

        // Create color object ([0-255] to [0-1] range)
        color = new THREE.Color(r / 255, g / 255, b / 255);


        // Return the color object
        return color;
    };

    // -------------------------------------------------------------------------

    lw.svg.createLineMaterial = function(tag) {
        return new THREE.LineBasicMaterial({ color: this.createColor(
            tag.getAttr('stroke', tag.getAttr('fill', 'black'))
        ) });
    };

    // -------------------------------------------------------------------------

    lw.svg.createSolidMaterial = function(tag) {
        var opacity  = tag.getAttr('fillOpacity', 1);
        var material = new THREE.MeshBasicMaterial({
            color: tag.getAttr('fill', 'black')
        });

        if (opacity < 1) {
            material.transparent = true;
            material.opacity     = opacity;
        }

        return material;
    };

    // -------------------------------------------------------------------------

    lw.svg.drawLine = function(tag, path) {
        var geometry = new THREE.Geometry();
        var material = this.createLineMaterial(tag);

        path.points.forEach(function(point) {
            geometry.vertices.push(new THREE.Vector3(point.x, point.y, 0));
        });

        return new THREE.Line(geometry, material);
    };

    // -------------------------------------------------------------------------

    lw.svg.drawShape = function(tag, path) {
        var shape    = new THREE.Shape(path.points);
        var geometry = new THREE.ShapeGeometry(shape);
        var material = this.createSolidMaterial(tag);

        return new THREE.Mesh(geometry, material);
    };

    // -------------------------------------------------------------------------

    lw.svg.drawTag = function(tag) {
        // Create 3D object
        var object = new THREE.Object3D();

        // Draw object paths
        if (tag.paths.length) {
            this.info('draw:', tag);

            // Flip Y coords and move UP by document height
            // (to set origin at bottom/left corners)
            tag.addMatrix([1, 0, 0, -1, 0, this.parser.document.height]);
            tag.applyMatrix();

            var traceLine  = false;
            var traceShape = false;

            tag.paths.map(function(path) {
                traceLine  = path.length > 1;
                traceShape = path.length > 2;
                traceShape &= path.isClosed();
                traceShape &= tag.getAttr('fill', 'none') !== 'none';
                traceShape && object.add(this.drawShape(tag, path));
                traceLine  && object.add(this.drawLine(tag, path));
            }, this);
        }

        // Draw children
        tag.children.forEach(function(childTag) {
            object.add(this.drawTag(childTag));
        }, this);

        return object;
    };

    // -------------------------------------------------------------------------

    lw.svg.drawFile = function(file, name, settings) {
        // Default settings
        settings          = settings          || {};
        settings.onObject = settings.onObject || null;
        settings.onError  = settings.onError  || null;

        try {
            // Parse the SVG file (raw XML)
            this.logStart('Parsing SVG: ' + name);

            // Create parser object and register callbacks
            this.parser = new lw.svg.Parser(file, {
                onParse: function(tag) {
                    lw.svg.info('parse tag:', tag);
                },
                onError: function(error, tag) {
                    lw.svg.warning('parse error:', error.message, tag);
                }
            });

            // Run the parser
            var rootTag = this.parser.parse();

            this.logEnd();

            this.logStart('Drawing SVG: ' + name);
            var object = lw.svg.drawTag(rootTag);
        }
        catch (error) {
            // Call user callback
            if (settings.onError) {
                settings.onError(error);

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
        if (settings.onObject) {
            settings.onObject(object);
        }

        // Return object
        return object;
    };

    // -------------------------------------------------------------------------

    // End svg scope
})();
