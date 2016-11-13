// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // DXF scope
    lw.dxf = {
        font: null
    };

    // -----------------------------------------------------------------------------

    lw.dxf.loadFonts = function() {
        var loader = new THREE.FontLoader();

        loader.load('fonts/json/helvetiker_regular.typeface.json', function(font) {
            //console.info('loaded:', font);
            lw.dxf.font = font;
        },
        function(e) {
            //console.info('progress:', e);
        },
        function(e) {
            console.error('error:', e);
        });
    };

    // -----------------------------------------------------------------------------

    lw.dxf.createLineMaterial = function(entity) {
        var color = entity.color;

        if (! color || color === 0xffffff) {
            color = 0x000000;
        }

        return new THREE.LineBasicMaterial({ color: color, transparent: true });
    };

    // -----------------------------------------------------------------------------

    lw.dxf.drawLine = function(entity) {
        var geometry = new THREE.Geometry();
        var material = this.createLineMaterial(entity);

        // create geometry
        var i, il, v1, v2, bulgeGeometry;
        var vertices = entity.vertices;

        for(i = 0, il = vertices.length; i < il; i++) {

            v1 = vertices[i];

            if (v1.bulge) {
                v2 = ((i + 1) < il) ? vertices[i + 1] : geometry.vertices[0];
                bulgeGeometry = new THREE.BulgeGeometry(v1, v2, v1.bulge);
                geometry.vertices.push.apply(geometry.vertices, bulgeGeometry.vertices);
            }
            else {
                geometry.vertices.push(new THREE.Vector3(v1.x, v1.y, 0));
            }

        }

        if (entity.shape) {
            geometry.vertices.push(geometry.vertices[0]);
        }

        return new THREE.Line(geometry, material);
    };

    // -----------------------------------------------------------------------------

    lw.dxf.drawCircle = function(entity) {
        // Laserweb - calc and draw gcode
        var radius = entity.radius;
        //console.log('Radius:'+radius+' and Center '+entity.center.x+','+entity.center.y+','+entity.center.z+',\n'); // Radius:220 and Center 0,0,0,

        var arcTotalDeg = entity.startAngleDeg - entity.endAngleDeg;
        //console.log('Start Angle: '+entity.startAngleDeg+', End Angle: '+entity.endAngleDeg+', thus spanning '+arcTotalDeg+'deg' );

        // Draw it since its cool to see (note this is a straigh three.js view of it, not via gcode.  Can be used in the Cutting Params view by coloring object/layers to change params)
        var material = this.createLineMaterial(entity);
        var geometry = new THREE.CircleGeometry(entity.radius, 128, entity.startAngle, entity.angleLength);

        geometry.vertices.shift();

        var object = new THREE.Line(geometry, material);

        object.translateX(entity.center.x);
        object.translateY(entity.center.y);
        object.translateZ(entity.center.z);

        return object;
    };

    // -----------------------------------------------------------------------------

    lw.dxf.drawSolid = function(entity) {
        var material = this.createLineMaterial(entity);
        var geometry = new THREE.Geometry();
        var verts    = geometry.vertices;

        verts.push(new THREE.Vector3(entity.points[0].x, entity.points[0].y, entity.points[0].z));
        verts.push(new THREE.Vector3(entity.points[1].x, entity.points[1].y, entity.points[1].z));
        verts.push(new THREE.Vector3(entity.points[2].x, entity.points[2].y, entity.points[2].z));
        verts.push(new THREE.Vector3(entity.points[3].x, entity.points[3].y, entity.points[3].z));

        // Calculate which direction the points are facing (clockwise or counter-clockwise)
        var vector1 = new THREE.Vector3();
        var vector2 = new THREE.Vector3();

        vector1.subVectors(verts[1], verts[0]);
        vector2.subVectors(verts[2], verts[0]);
        vector1.cross(vector2);

        // If z < 0 then we must draw these in reverse order
        if (vector1.z < 0) {
            geometry.faces.push(new THREE.Face3(2, 1, 0));
            geometry.faces.push(new THREE.Face3(2, 3, 0));
        }
        else {
            geometry.faces.push(new THREE.Face3(0, 1, 2));
            geometry.faces.push(new THREE.Face3(0, 3, 2));
        }

        return new THREE.Mesh(geometry, material);
    };

    // -----------------------------------------------------------------------------

    lw.dxf.drawText = function(entity) {
        var geometry = new THREE.TextGeometry(entity.text, {
            size: entity.textHeight || 12,
            font: this.font,
            height: 0
        });

        var material = this.createLineMaterial(entity);
        var object   = new THREE.Mesh(geometry, material);

        object.translateX(entity.startPoint.x);
        object.translateY(entity.startPoint.y);
        object.translateZ(entity.startPoint.z);

        return object;
    };

    // -----------------------------------------------------------------------------

    lw.dxf.drawPoint = function(entity) {
        // Not implemented (useless !?!)
        // Will be (re)added later if users request
    };

    // -----------------------------------------------------------------------------

    lw.dxf.drawEntity = function(entity) {
        if (entity.type === 'CIRCLE' || entity.type === 'ARC') {
            return this.drawCircle(entity);
        }

        if (entity.type === 'LWPOLYLINE' || entity.type === 'LINE' || entity.type === 'POLYLINE') {
            return this.drawLine(entity);
        }

        if (entity.type === 'TEXT') {
            return this.drawText(entity);
        }

        if (entity.type === 'SOLID') {
            return this.drawSolid(entity);
        }

        if (entity.type === 'POINT') {
            return this.drawPoint(entity);
        }
    };

    // -----------------------------------------------------------------------------

    lw.dxf.draw = function(file, name, onObject) {
        // Parse the DXF file
        var parser    = new DxfParser();
        var dxf       = parser.parseSync(file);
        var DXFObject = new THREE.Object3D();

        console.groupCollapsed("DXF File:" + name);

        var i, il, entity, object;

        for (i = 0, il = dxf.entities.length; i < il; i++) {
            // Current entity
            entity = dxf.entities[i];

            // Draw the entity
            console.log(entity.layer + '.' + entity.type + ': ' + i);
            object = this.drawEntity(dxf.entities[i]);
            object && DXFObject.add(object);
        }

        console.groupEnd();

        // Call user callback
        onObject(DXFObject);
    };

    // End dxf scope
})();
