// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    var MATH_PI_2  = 2 * Math.PI;
    var DEG_TO_RAD = Math.PI / 180;

    // =========================================================================

    lw.svg.Point = function(x, y) {
        // Init properties
        this.x = parseFloat(x);
        this.y = parseFloat(y);
    };

    // -------------------------------------------------------------------------

    lw.svg.Point.prototype.isEqual = function(point) {
        return this.x === point.x && this.y === point.y;
    };

    // =========================================================================

    lw.svg.Path = function() {
        this.points = [];
        this.length = 0;
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.getPoint = function(i) {
        return this.points[i < 0 ? this.length + i : i] || null;
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.addPoint = function(x, y) {
        this.points.push(new lw.svg.Point(x, y));
        this.length = this.points.length;
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.addPoints = function(points) {
        // For each couple of points
        for (var i = 0, il = points.length; i < il; i += 2) {
            this.addPoint(points[i], points[i + 1]);
        }
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.isClosed = function() {
        var firstPoint = this.getPoint(0);
        return firstPoint && firstPoint.isEqual(this.getPoint(-1));
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.close = function() {
        if (! this.isClosed() && this.length > 2) {
            var firstPoint = this.getPoint(0);
            this.addPoint(firstPoint.x, firstPoint.y);
            return true;
        }

        return false;
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.transform = function(matrix) {
        this.points = this.points.map(function(point) {
            return new lw.svg.Point(
                matrix[0] * point.x + matrix[2] * point.y + matrix[4],
                matrix[1] * point.x + matrix[3] * point.y + matrix[5]
            );
        });
    };

    // =========================================================================

    lw.svg.Tag = function(node, parent) {
        // Init properties
        this.node     = node;
        this.name     = node.nodeName.toLowerCase();
        this.parent   = parent || null;
        this.attrs    = {};
        this.children = [];

        this.paths = [];                     // Paths collection
        this.path  = new lw.svg.Path();      // Current path
        this.point = new lw.svg.Point(0, 0); // Current point

        this.paths.push(this.path);

        // Reset/Set transform matrix
        this.matrix        = null;
        this.matrixApplied = false;

        this.setMatrix(this.parent && this.parent.matrix);

        // Clone parent attributes
        if (this.parent) {
            var protectedAttrs = ['id', 'transform', 'width', 'height', 'version', 'xmlns'];

            Object.keys(this.parent.attrs).forEach(function(attrName) {
                // Do not copy protected properties
                if (protectedAttrs.indexOf(attrName) === -1) {
                    this.setAttr(attrName, this.parent.attrs[attrName]);
                }
            }, this);
        }
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.setAttr = function(name, value) {
        this.attrs[name] = value;
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.getAttr = function(name, defaultValue) {
        return this.attrs[name] !== undefined ? this.attrs[name]
        : (defaultValue !== undefined ? defaultValue : null);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.addChild = function(childTag) {
        this.children.push(childTag);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.clearPath = function() {
        this.path = new lw.svg.Path();
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.newPath = function() {
        if (this.path.length > 0) {
            this.clearPath();
            this.paths.push(this.path);
        }
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.addPoint = function(x, y, relative) {
        // Relative from the last point
        if (relative) {
            x += this.point.x;
            y += this.point.y;
        }

        // Add current point
        this.path.addPoint(x, y);

        // Update current point
        this.point = this.path.getPoint(-1);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.addPoints = function(points, relative) {
        // For each couple of points
        for (var i = 0, il = points.length; i < il; i += 2) {
            this.addPoint(points[i], points[i + 1], relative);
        }
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.closePath = function() {
        return this.path.close();
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.setMatrix = function(matrix) {
        this.matrix = matrix || [1, 0, 0, 1, 0, 0];
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.addMatrix = function(matrix) {
        this.matrixApplied = false;
        this.matrix        = [
            this.matrix[0] * matrix[0] + this.matrix[2] * matrix[1],
            this.matrix[1] * matrix[0] + this.matrix[3] * matrix[1],
            this.matrix[0] * matrix[2] + this.matrix[2] * matrix[3],
            this.matrix[1] * matrix[2] + this.matrix[3] * matrix[3],
            this.matrix[0] * matrix[4] + this.matrix[2] * matrix[5] + this.matrix[4],
            this.matrix[1] * matrix[4] + this.matrix[3] * matrix[5] + this.matrix[5]
        ];
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.translate = function(x, y) {
        this.addMatrix([1, 0, 0, 1, x || 0, y || 0]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.rotate = function(angle, x, y) {
        angle = angle * DEG_TO_RAD;
        (arguments.length == 2) && this.addMatrix([1, 0, 0, 1, x, y]);
        this.addMatrix([Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0]);
        (arguments.length == 2) && this.addMatrix([1, 0, 0, 1, -x, -y]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.scale = function(x, y) {
        this.addMatrix([x, 0, 0, (y || x || 0), 0, 0]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.skewX = function(angle) {
        this.addMatrix([1, 0, Math.tan(angle * DEG_TO_RAD), 1, 0, 0]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.skewY = function(angle) {
        this.addMatrix([1, Math.tan(angle * DEG_TO_RAD), 0, 1, 0, 0]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.applyMatrix = function() {
        if (this.matrixApplied) {
            return null;
        }

        this.paths.every(function(path) {
            path.transform(this.matrix);
        }, this);

        this.matrixApplied = true;
        this.setMatrix(null);

        this.children.forEach(function(tag) {
            tag.applyMatrix();
        });
    };

    // -------------------------------------------------------------------------

    // End SVG Tag
})();
