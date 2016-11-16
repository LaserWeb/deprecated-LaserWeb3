// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // SVG scope
    lw.svg = {};

    // -----------------------------------------------------------------------------

    lw.svg.draw = function(file, name, settings) {
        // Default settings
        settings          = settings || {};
        settings.onObject = settings.onObject || null;

        // Parse the SVG file
        var parser = new lw.svg.Parser();
        var svg    = parser.parse(file);

        console.groupCollapsed("SVG File:" + name);
        var SVGObject = lw.svg.drawSVGTag(svg);
        console.groupEnd();

        // Call user callback
        if (settings.onObject) {
            settings.onObject(SVGObject);
        }

        // Return object
        return SVGObject;
    };

    // -----------------------------------------------------------------------------

    // Finding the nearest colour from the palette
    // http://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-1-finding-nearest-colour/
    lw.svg.getNearestColour = function(color) {
        var minimumDistance = (255 * 255) + (255 * 255) + (255 * 255) + 1;
        var paletteColour   = [
            [255, 0, 0],
            [0, 255, 0],
            [0, 0, 255],
            [255, 255, 255]
        ];

        var paletteColor, rDiff, gDiff, bDiff, distance, nearestColour;

        for (var i = 0, il = paletteColour.length; i < il; i++) {
            paletteColor = paletteColour[i];
            rDiff        = color[0] - paletteColor[0];
            gDiff        = color[1] - paletteColor[1];
            bDiff        = color[2] - paletteColor[2];
            distance     = rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;

            if (distance < minimumDistance) {
                minimumDistance = distance;
                nearestColour   = paletteColor;
            }
        }

        return nearestColour || color;
    };

    lw.svg.createColor = function(color) {
        // Possible: none, inherit ?
        if (typeof color === 'string') {
            color = [204, 204, 204]; // #ccc
        }

        // Darken too light colors...
        var luma, lumaLimit = 200;

        while (true) {
            luma = (color[0] * 0.3) + (color[1] * 0.59) + (color[2] * 0.11);

            if (luma <= lumaLimit) {
                break;
            }

            color[0] > 0 && (color[0] -= 1);
            color[1] > 0 && (color[1] -= 1);
            color[2] > 0 && (color[2] -= 1);
        }

        // Create color object ([0-255] to [0-1] range)
        color = new THREE.Color(color[0] / 255, color[1] / 255, color[2] / 255);


        // Return the color object
        return color;
    };

    lw.svg.createLineMaterial = function(tag) {
        return new THREE.LineBasicMaterial({ color: this.createColor(
            tag.getAttr('stroke', tag.getAttr('color', tag.getAttr('fill')))
        ) });
    };

    lw.svg.createSolidMaterial = function(tag) {
        return new THREE.MeshBasicMaterial({ color: this.createColor(
            tag.getAttr('fill', tag.getAttr('color', tag.getAttr('stroke')))
        ) });
    };

    // -----------------------------------------------------------------------------

    lw.svg.drawLine = function(tag, closePath) {
        var geometry = new THREE.Geometry();
        var material = this.createLineMaterial(tag);

        // create geometry
        var i, il, v1, v2;
        var vertices = tag.vertices;

        for(i = 0, il = vertices.length; i < il; i++) {
            v1 = vertices[i];
            geometry.vertices.push(new THREE.Vector3(v1.x, v1.y, 0));
        }

        if (closePath) {
            geometry.vertices.push(geometry.vertices[0]);
        }

        return new THREE.Line(geometry, material);
    };

    lw.svg.drawSolid = function(tag) {
        var geometry = new THREE.Geometry();
        var material = this.createSolidMaterial(tag);

        // create geometry
        var i, il, v1, v2;
        var vertices = tag.vertices;

        for(i = 0, il = vertices.length; i < il; i++) {
            v1 = vertices[i];
            geometry.vertices.push(new THREE.Vector3(v1.x, v1.y, 0));
        }

        // Close path
        geometry.vertices.push(geometry.vertices[0]);

        // Add faces
        for (var face = 0, length = vertices.length - 2; face < length; face++) {
            geometry.faces.push(new THREE.Face3(0, face + 1, face + 2));
        }

        return new THREE.Mesh(geometry, material);
    };

    // -----------------------------------------------------------------------------

    lw.svg.drawSVGTag = function(tag) {
        console.log('draw:', tag);
        var object = new THREE.Object3D();

        // Draw object
        var isSolid = ['polygon', 'rect', 'circle', 'ellipse'].indexOf(tag.name) !== -1;
        var hasLine = isSolid || ['line', 'polyline'].indexOf(tag.name) !== -1;

        if (hasLine) {
            if (isSolid && tag.getAttr('fill', 'none') !== 'none') {
                object.add(this.drawSolid(tag));
            }

            object.add(this.drawLine(tag, isSolid));

            return object;
        }

        // Draw children
        for (var tag, i = 0, il = tag.children.length; i < il; i++) {
            object.add(this.drawSVGTag(tag.children[i]));
        }

        return object;
    };

    // End svg scope
})();
