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

    lw.svg.createColor = function(color) {
        if (typeof color === 'string' || color.length < 3) {
            color = [0, 0, 0];
        }

        // TODO darken too light colors...

        return new THREE.Color(color[0], color[1], color[2]);
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
            isSolid && object.add(this.drawSolid(tag));
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
