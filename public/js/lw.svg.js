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

    lw.svg.createLineMaterial = function(tag) {
        var color = tag.getAttr('stroke', tag.getAttr('color', tag.getAttr('fill')));

        if (typeof color === 'string') {
            color = [0, 0, 0];
        }

        color = new THREE.Color(color[0], color[1], color[2]);

        if (color.r > 250 && color.g > 250 && color.b > 250) {
            color = [0, 0, 0];
        }

        return new THREE.LineBasicMaterial({ color: color, transparent: true });
    };

    // -----------------------------------------------------------------------------

    lw.svg.drawLine = function(tag) {
        var geometry = new THREE.Geometry();
        var material = this.createLineMaterial(tag);

        // create geometry
        var i, il, v1, v2;
        var vertices = tag.vertices;

        for(i = 0, il = vertices.length; i < il; i++) {
            v1 = vertices[i];
            geometry.vertices.push(new THREE.Vector3(v1.x, v1.y, 0));
        }

        if (['polygon', 'rect', 'circle', 'ellipse'].indexOf(tag.name) !== -1) {
            geometry.vertices.push(geometry.vertices[0]);
        }

        return new THREE.Line(geometry, material);
    };

    // -----------------------------------------------------------------------------

    lw.svg.drawSVGTag = function(tag) {
        console.log('draw:', tag);
        var object = new THREE.Object3D();

        // Draw path
        if (['line', 'polyline', 'polygon', 'rect', 'circle', 'ellipse'].indexOf(tag.name) !== -1) {
            return this.drawLine(tag);
        }

        // Draw children
        for (var tag, i = 0, il = tag.children.length; i < il; i++) {
            object.add(this.drawSVGTag(tag.children[i]));
        }

        return object;
    };

    // End svg scope
})();
