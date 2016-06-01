// Written by Sebastien Mischler https://github.com/lautr3k/SLAcer.js/tree/master/js/slacer

// namespace
var SLAcer = SLAcer || {};

;(function() {

    // global settings
    var globalSettings = {
        color: 0xffff00
    };

    // -------------------------------------------------------------------------

    function Point(p) {
        this.x = p.x;
        this.y = p.y;
        this.s = p.x + ':' + p.y;
    }

    function Line(p1, p2) {
        this.p1 = new Point(p1);
        this.p2 = new Point(p2);
    }

    function isSameValue(v1, v2) {
        return Math.abs(v1 - v2) <= Number.EPSILON;
    }

    function isSamePoint(p1, p2) {
        return isSameValue(p1.x, p2.x) && isSameValue(p1.y, p2.y);
    }

    function linesToPolygons(lines) {
        var polygons = [];
        var polygon  = [];

        var firstLine, lastPoint, i, line;

        function getNextPoint() {
            var found = false;
            for (i = 0; i < lines.length; i++) {
                line = lines[i];
                if (isSamePoint(lastPoint, line.p1)) {
                    lines.splice(i, 1);
                    if (isSamePoint(firstLine.p1, line.p2)) {
                        //console.log('closed loop');
                        break;
                    }
                    polygon.push(line.p2);
                    lastPoint = line.p2;
                    found = true;
                }
                else if (isSamePoint(lastPoint, line.p2)) {
                    lines.splice(i, 1);
                    if (isSamePoint(firstLine.p1, line.p1)) {
                        //console.log('closed loop');
                        break;
                    }
                    polygon.push(line.p1);
                    lastPoint = line.p1;
                    found = true;
                }
            }
            return found;
        }

        while (lines.length) {
            firstLine = lines.shift();
            lastPoint = firstLine.p2;

            polygon.push(firstLine.p1);
            polygon.push(firstLine.p2);

            while (getNextPoint()) {}

            polygons.push(polygon);
            polygon = [];
        }

        return polygons;
    }

    function pointInPolygon(point, polygon) {
        // ray-casting algorithm based on
        // https://github.com/substack/point-in-polygon/blob/master/index.js
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        var inside = false;

        var il, j, pi, pj, intersect;

        for (i = 0, il = polygon.length, j = il - 1; i < il; j = i++) {
            pi = polygon[i];
            pj = polygon[j];

            (((pi.y > point.y) != (pj.y > point.y))
            && (point.x < (pj.x - pi.x) * (point.y - pi.y) / (pj.y - pi.y) + pi.x))
            && (inside = !inside);
        }

        return inside;
    };

    function makeNodes(polygons) {
        // single polygon...
        if (polygons.length == 1) {
            return { 0: { parents: [], isHole: false } };
        }

        // nodes collection
        var nodes = {};

        // variables
        var i, il, point, y, yl;

        // for each polygon extract parents and childs polygons
        for (i = 0, il = polygons.length; i < il; i++) {
            // only check for first point in polygon
            point = polygons[i][0];

            // not enough faces ( !!! investigation required !!!)
            if (polygons[i].length < 3) {
                //console.log('--------------------');
                //console.log(il, i, polygons[i]);
                continue;
            }

            // for each polygons
            for (y = 0, yl = il; y < yl; y++) {
                // do not check self intersection
                if (i == y) continue;

                // create default node
                nodes[i] || (nodes[i] = { parents: [], isHole: false });
                nodes[y] || (nodes[y] = { parents: [], isHole: false });

                // check if point in poylgon
                if (pointInPolygon(point, polygons[y])) {
                    // push parent and child
                    nodes[i].parents.push(y);

                    // odd parents number ==> hole
                    nodes[i].isHole = !! (nodes[i].parents.length % 2);
                    nodes[y].isHole = !! (nodes[y].parents.length % 2);
                }
            }
        }

        // return nodes collection
        return nodes;
    }

    function polygonsToShapes(polygons) {
        // shapes collection
        var shapes = [];

        // make the nodes collection
        var nodes = makeNodes(polygons);
        //console.log('nodes:', nodes);

        // variables
        var key, node, i, il, parentKey;

        // make base collection
        for (key in nodes) {
            node = nodes[key];
            if (! node.isHole) {
                shapes[key] = new THREE.Shape(polygons[key]);
            }
        }

        // push holes
        for (key in nodes) {
            node = nodes[key];
            if (node.isHole) {
                for (i = 0, il = node.parents.length; i < il; i++) {
                    parentKey = node.parents[i];
                    if ((il - 1) == nodes[parentKey].parents.length) {
                        shapes[parentKey].holes.push(new THREE.Path(polygons[key]));
                    }
                }
            }
        }

        // return shapes collection
        return shapes;
    }

    // -------------------------------------------------------------------------

    // Constructor
    function Slicer(settings) {
        // settings
        //this.settings = _.defaults({}, settings || {}, Slicer.globalSettings);

        // faces collection
        this.faces = [];

        // position
        this.zHeight = 0;
        this.zOffset = 0;

        // plane
        this.mesh  = null;
        this.plane = null;
        this.slice = null;
    }

    // -------------------------------------------------------------------------

    Slicer.prototype.loadMesh = function(mesh) {
        // mesh
        this.mesh = mesh;

        // slice
        this.slice = mesh.clone();

        console.log('SLICE!', this.slice);
        // bounding box
        var box = mesh.geometry.boundingBox.clone();

        // mesh size
        var size = box.size();

        // z height
        this.zHeight = size.z;
        this.zOffset = box.min.z;

        // min/max faces (z)
        this.facesMinMax = [];
        var i, length, face, v1, v2, v3;
        var geometry = this.slice.geometry;
        for (i = 0, length = geometry.faces.length; i < length; i++) {
            face = geometry.faces[i];
            v1 = geometry.vertices[face.a];
            v2 = geometry.vertices[face.b];
            v3 = geometry.vertices[face.c];
            this.facesMinMax.push({
                min: Math.min(v1.z, v2.z, v3.z),
                max: Math.max(v1.z, v2.z, v3.z)
            });
        }

        // plane
        this.plane = new SLAcer.Mesh(
            new THREE.PlaneGeometry(size.x, size.y, 1),
            new THREE.MeshBasicMaterial({
                color: 0xff0000, side: THREE.DoubleSide
            })
        );
    };

    Slicer.prototype.getFaces = function(zPosition) {
        var time = Date.now();

        zPosition += this.zOffset;

        var source = this.slice.geometry;
        var geometry = new THREE.Geometry();
        var plane  = new THREE.Plane(new THREE.Vector3(0, 0, 1), -zPosition);

        var i, length, minMax, face, vertices, v1, v2, v3, index, normal;

        var lines = [];
        var line, top, bot;

        function addLine(p1, p2) {
            lines.push(new Line(p1, p2));
        }

        for (i = 0, length = source.faces.length; i < length; i++) {
            minMax = this.facesMinMax[i];

            if (minMax.min <= zPosition && minMax.max >= zPosition) {
                face     = source.faces[i];
                vertices = source.vertices;

                v1 = vertices[face.a].clone();
                v2 = vertices[face.b].clone();
                v3 = vertices[face.c].clone();

                geometry.vertices.push(v1, v2, v3);

                index  = geometry.vertices.length;
                normal = face.normal.clone();

                geometry.faces.push(new THREE.Face3(
                    index-3, index-2, index-1, normal
                ));

                // slice...
                t1 = isSameValue(v1.z, zPosition);
                t2 = isSameValue(v2.z, zPosition);
                t3 = isSameValue(v3.z, zPosition);

                touch = 0;

                t1 && touch++;
                t2 && touch++;
                t3 && touch++;

                // all points on plane
                if (touch == 3) {
                    // skip since is shared with two points case
                    continue;
                }

                // two points on plane
                if (touch == 2) {
                    if (t1 && t2 && !t3) addLine(v1, v2);
                    else if (!t1 && t2 && t3) addLine(v2, v3);
                    else addLine(v3, v1);
                    continue;
                }

                // one point on plane
                if (touch == 1) {
                    // test if faces intersect the plane
                    if (t1 && ((v2.z > zPosition && v3.z < zPosition) || (v2.z < zPosition && v3.z > zPosition))) {
                        addLine(v1, plane.intersectLine(new THREE.Line3(v2, v3)));
                    }
                    else if (t2 && ((v3.z > zPosition && v1.z < zPosition) || (v3.z < zPosition && v1.z > zPosition))) {
                        addLine(v2, plane.intersectLine(new THREE.Line3(v3, v1)));
                    }
                    else if (t3 && ((v1.z > zPosition && v2.z < zPosition) || (v1.z < zPosition && v2.z > zPosition))) {
                        addLine(v3, plane.intersectLine(new THREE.Line3(v1, v2)));
                    }

                    // no intersection!
                    // skip since is shared with two points case
                    continue;
                }

                // no points on plane (need intersection)
                if (touch == 0) {
                    top = [];
                    bot = [];

                    v1.z > zPosition && top.push(v1) || bot.push(v1);
                    v2.z > zPosition && top.push(v2) || bot.push(v2);
                    v3.z > zPosition && top.push(v3) || bot.push(v3);

                    if (top.length == 1) {
                        addLine(
                            plane.intersectLine(new THREE.Line3(top[0], bot[0])),
                            plane.intersectLine(new THREE.Line3(top[0], bot[1]))
                        );
                    }
                    else {
                        addLine(
                            plane.intersectLine(new THREE.Line3(top[0], bot[0])),
                            plane.intersectLine(new THREE.Line3(top[1], bot[0]))
                        );
                    }
                }
            }
        }

        var polygons = linesToPolygons(lines);
        var shapes   = polygonsToShapes(polygons);

        var meshes = [];

        for (key in shapes) {
            try {
                var color = 0xff0000;
                var geo = new THREE.ShapeGeometry(shapes[key]);

                if (!geo.faces.length || !geo.vertices.length) {
                    delete shapes[key];
                    continue;
                }

                meshes.push(new THREE.Mesh(
                    geo,
                    new THREE.MeshBasicMaterial({
                        color: color, side: THREE.DoubleSide
                    })
                ));
            }
            catch(e) {
                console.error(e);
                console.log(shapes[key]);
            }
        }

        // remove empty shapes...
        shapes = shapes.filter(function(n){ return n != undefined });

        return {
            time    : Date.now() - time,
            geometry: geometry,
            polygons: polygons,
            shapes  : shapes,
            meshes  : meshes
        };
    };

    // -------------------------------------------------------------------------

    // global settings
    Slicer.globalSettings = globalSettings;

    // export module
    SLAcer.Slicer = Slicer;

})();
