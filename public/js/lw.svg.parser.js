// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    var _PI2_        = 2 * Math.PI;
    var _DEG_TO_RAD_ = Math.PI / 180;

    // -------------------------------------------------------------------------

    lw.svg.Vertex = function(x, y) {
        this.x = x;
        this.y = y;
    };

    lw.svg.Vertex.prototype.isEqual = function(vertex) {
        return this.x === vertex.x && this.y === vertex.y;
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag = function(node, parent, matrix) {
        this.node     = node;
        this.name     = node.nodeName.toLowerCase();
        this.parent   = parent || null;
        this.children = [];
        this.attrs    = {};
        this.vertices = [];

        // Transformation matrix
        this.matrix        = matrix || [1, 0, 0, 1, 0, 0];
        this.matrixApplied = false;

        if (this.parent) {
            // Inherit matrix from parent
            this.matrix = this.parent.matrix;

            // Clone parent attributes
            var parentAttrs = this.parent.attrs;

            for (var attrName in parentAttrs) {
                if (parentAttrs.hasOwnProperty(attrName)) {
                    // Do not copy some properties
                    if (['id', 'transform'].indexOf(attrName) !== -1) {
                        continue;
                    }

                    // Set attribute value
                    this.setAttr(attrName, parentAttrs[attrName]);
                }
            }
        }
    };

    lw.svg.Tag.prototype.getAttr = function(name, defaultValue) {
        return this.attrs[name] !== undefined ? this.attrs[name]
        : (defaultValue !== undefined ? defaultValue : null);
    };

    lw.svg.Tag.prototype.setAttr = function(name, value) {
        this.attrs[name] = value;
    };

    lw.svg.Tag.prototype.addVertex = function(x, y) {
        this.vertices.unshift(new lw.svg.Vertex(x, y));
    };

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

    lw.svg.Tag.prototype.translate = function(x, y) {
        this.addMatrix([1, 0, 0, 1, x || 0, y || 0]);
    };

    lw.svg.Tag.prototype.rotate = function(angle, x, y) {
        angle = (angle || 0) * _DEG_TO_RAD_;

        (x && y) && this.addMatrix([1, 0, 0, 1, x, y]);
        this.addMatrix([Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0]);
        (x && y) && this.addMatrix([1, 0, 0, 1, -x, -y]);
    };

    lw.svg.Tag.prototype.scale = function(x, y) {
        this.addMatrix([(x || 0), 0, 0, (y || x || 0), 0, 0]);
    };

    lw.svg.Tag.prototype.skewX = function(angle) {
        this.addMatrix([1, 0, Math.tan((angle || 0) * _DEG_TO_RAD_), 1, 0, 0]);
    };

    lw.svg.Tag.prototype.skewY = function(angle) {
        this.addMatrix([1, Math.tan((angle || 0) * _DEG_TO_RAD_), 0, 1, 0, 0]);
    };

    lw.svg.Tag.prototype.applyMatrix = function() {
        if (this.matrixApplied) {
            return null;
        }

        this.vertices = this.vertices.map(function(vertex) {
            return new lw.svg.Vertex(
                this.matrix[0] * vertex.x + this.matrix[2] * vertex.y + this.matrix[4],
                this.matrix[1] * vertex.x + this.matrix[3] * vertex.y + this.matrix[5]
            );
        }, this);

        this.matrixApplied = true;
    };

    // -------------------------------------------------------------------------

    // SVG Reader class
    lw.svg.Parser = function(svg, settings) {
        // Defaults settings
        var settings = settings || {};

        // Minimum segment length (+/- not accurate) (arc only for now)
        // Used to calculated the number of segments for arc's
        settings.minSegmentLength = settings.minSegmentLength || 0.1;  // mm

        // Fixed number of segments for arc's
        // If not defined, null, or <= 0, calculated from (arc perimeter / minSegmentLength)
        settings.arcSegments = settings.arcSegments || null;

        // Init properties
        this.settings  = settings;
        this.svg       = null;
        this.editor    = null;
        this.tolerance = null;
        this.entities  = null;

        // Load SVG contents
        svg && this.load(svg);
    };

    // -------------------------------------------------------------------------

    // Try to get the file editor
    lw.svg.Parser.prototype.fingerprint = function() {
        // Reset editor
        this.editor = null;

        // Parse editor vendor/version/etc...
        // Editor tag stay on line 2
        var fingerprint = this.svg.split('\n')[1];

        if (fingerprint) {
            var inkscape    = fingerprint.match(/^<!-- Created with Inkscape/i);
            var illustrator = fingerprint.match(/^<!-- Generator: Adobe Illustrator ([^,]+),/i);

            if (inkscape) {
                this.editor = {
                    name       : 'inkscape',
                    version    : null,
                    fingerprint: fingerprint.substring(18, fingerprint.length-4).trim()
                };
            }
            else if (illustrator) {
                this.editor = {
                    name       : 'illustrator',
                    version    : illustrator[1],
                    fingerprint: fingerprint.substring(16, fingerprint.length-4).trim()
                };
            }
        }
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.load = function(svg) {
        // Reset SVG property
        this.svg = null;

        // Normalize whitespaces and trim whitespace on each line
        svg = svg.replace(/\s+/gm, ' ').replace(/^\s+|\s+$/gm, '');

        // If no SVG contents
        if (! svg || ! svg.length) {
            throw new Error('Empty SVG contents');
        }

        // Set SVG contents
        this.svg = svg;

        // Try to get the file editor
        this.fingerprint();
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.parse = function(svg) {
        // Reset entities collection
        this.entities = [];

        // Load SVG contents
        this.load(svg || this.svg);

        // Parse as XML
        var isBrowserEnv = typeof window !== 'undefined';
        var rootNode;

        if (! isBrowserEnv || window.DOMParser) {
            var DOMParser  = isBrowserEnv ? window.DOMParser : require('xmldom').DOMParser;
            var parser     = new DOMParser();
            rootNode       = parser.parseFromString(this.svg, 'text/xml').documentElement;
        }
        else {
            var xml      = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
            var xmlDoc   = new ActiveXObject('Microsoft.XMLDOM');
            xmlDoc.async = 'false';

            xmlDoc.loadXML(this.svg);
            rootNode = xmlDoc.documentElement;
        }

        // Flip Y coords and move UP by document height
        // (to set origin at bottom/left corners)
        var matrix = null;

        if (rootNode.attributes.height) {
            matrix = [1, 0, 0, -1, 0, parseFloat(rootNode.attributes.height.value)];
        }

        // Let the fun begin
        this.entities = this.parseNode(rootNode, null, matrix);

        // return entities collection
        return this.entities;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.normalizeTagAttrName = function(attrName) {
        // Remove trailing spaces
        attrName = attrName.trim();

        // Remove vendor()s prefix
        attrName = attrName.replace(/^inkscape:/, '');

        // 'snake-case' to 'camelCase'
        attrName = attrName.replace(/^[_.\- ]+/, '').toLowerCase();
        attrName = attrName.replace(/[_.\- ]+(\w|$)/g, function(i, word) {
            return word.toUpperCase();
        });

        // Return normalized name
        return attrName;
    };

    lw.svg.Parser.prototype.normalizeUnit = function(value) {
        var stringValue = (value + "").toLowerCase();
        var floatValue  = parseFloat(stringValue);

        if (stringValue.indexOf('mm') !== -1) {
            return floatValue * 3.5433070869;
        }

        if (stringValue.indexOf('cm') !== -1) {
            return floatValue * 35.433070869;
        }

        if (stringValue.indexOf('in') !== -1) {
            return floatValue * 90.0;
        }

        if (stringValue.indexOf('pt') !== -1) {
            return floatValue * 1.25;
        }

        if (stringValue.indexOf('pc') !== -1) {
            return floatValue * 15.0;
        }

        return floatValue;
    };

    // -------------------------------------------------------------------------

    // Try to normalize the color and return an array of int -> [r, g, b, a]
    // Else return the color as text (inherit, none, etc...)
    lw.svg.Parser.prototype.normalizeColor = function(color) {
        // Lowecased color
        color = color.toLowerCase();

        // Try to get named color as HEX
        if (lw.colors.named[color]) {
            color = lw.colors.named[color];
        }

        // HEX color (#222222)
        if (color[0] == '#') {
            // Short to long (#123 -> #112233)
            if (color.length === 4) {
                color = color.replace(/([^#])/g, '$1$1');
            }

            if (color.length !== 7) {
                //console.error('Invalid color');
                return null;
            }

            // Map the color -> [r, g, b]
            color = color.slice(1).match(/../g).map(function(i) {
                return parseInt(i, 16);
            });

            // Add alpha chanel
            color.push(1);

            // Return the color
            return color;
        }

        // RGB(A) color : rgb(127, 0, 0) - rgb(50%, 0, 0) - rgba(255, 0, 0, 0.8)
        var matches = color.match(/^rgb[a]?\(([^\)]+)\)/);

        if (matches && matches[1]) {
            // Split match on comma
            color = matches[1].split(',');

            if (color.length < 3) {
                //console.error('Invalid color');
                return null;
            }

            // Map the color -> [r, g, b(, a)]
            color = color.map(function(c, i) {
                // Remove trailing spaces
                c = c.trim();

                // Expressed as percentage
                if (c.indexOf('%') !== -1) {
                    c = c.replace('%', '').trim();
                    c = Math.round(parseFloat(c) * 2.55);
                }

                // Integer for RGB values and float for alpha chanel
                return i < 3 ? parseInt(c) : parseFloat(c);
            });

            // Add alpha chanel if not defined
            if (color.length < 4) {
                color.push(1);
            }

            // Return the color
            return color;
        }

        // Return input color
        // (inherit, none, etc...)
        return color;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.normalizeTagAttrValue = function(attrName, attrValue) {
        // Remove trailing spaces
        attrValue = attrValue.trim();

        // Filters
        switch (attrName) {
            // Range limit to [0 - 1]
            case 'opacity'      :
            case 'fillOpacity'  :
            case 'strokeOpacity':
                attrValue = Math.min(1, Math.max(0, parseFloat(attrValue)));
            break;

            // Normalize color to RGBA int array -> [r, g, b, a]
            // Or leave input -> 'inherit', 'none', etc...
            case 'fill'  :
            case 'stroke':
            case 'color' :
                attrValue = this.normalizeColor(attrValue);
            break;

            // Normalize size unit -> to px
            case 'x'  :
            case 'y'  :
            case 'x1'  :
            case 'y1'  :
            case 'x2'  :
            case 'y2'  :
            case 'r'  :
            case 'rx'  :
            case 'ry'  :
            case 'cx'  :
            case 'cy'  :
            case 'width' :
            case 'height' :
            case 'fontSize' :
            case 'strokeWidth' :
                attrValue = this.normalizeUnit(attrValue);
            break;
        }

        // Return normalized value
        return attrValue;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.parseTagAttrs = function(tag) {
        // For each attribute
        var i, il, attr, attrName, attrValue, styleAttrValue;
        var attrs = tag.node.attributes;

        // Tag without attributes
        if (! attrs) {
            return;
        }

        for (i = 0, il = attrs.length; i < il; i++) {
            // Current attribute
            attr = attrs[i];

            // Normalize attribute name
            attrName = this.normalizeTagAttrName(attr.nodeName);

            // Normalize attribute value
            attrValue = this.normalizeTagAttrValue(attrName, attr.nodeValue);

            // Special case
            if (attrName === 'style') {
                styleAttrValue = attrValue;
            }
            else {
                // Set new attribute name/value
                tag.setAttr(attrName, attrValue);
            }
        }

        // If style attribute (override tag attributes)
        // TODO get/parse global style and override this one...
        if (styleAttrValue) {
            var style, styles = styleAttrValue.split(';');

            for (i = 0, il = styles.length; i < il; i++) {
                // Current style
                attr = styles[i].split(':');

                // Normalize attribute name
                attrName = this.normalizeTagAttrName(attr[0]);

                // Normalize attribute value
                attrValue = this.normalizeTagAttrValue(attrName, attr[1]);

                // Set new attribute name/value
                tag.setAttr(attrName, attrValue);
            }
        }

        // Set inherited color
        ['fill', 'stroke', 'color'].map(function(attrName) {
            if (tag.getAttr(attrName) === 'inherit') {
                tag.setAttr(attrName, tag.parent.getAttr(attrName));
            }
        })

        // Parse transformation attribute
        this.parseTransformAttr(tag);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.addTransformMatrix = function(tag, type, params) {
        if (typeof tag[type] !== 'function') {
            console.log('Undefined transformation:', type);
            return null;
        }

        tag[type].apply(tag, params);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.parseTransformAttr = function(tag) {
        // Get transform attribute
        var transformAttr = tag.getAttr('transform', '').trim();

        // No transformation...
        if (! transformAttr || ! transformAttr.length) {
            return null;
        }

        // Parse attribute (split group on closing parenthesis)
        var transformations = transformAttr.split(')');

        // Remove last entry due to last ")" found
        transformations.pop();

        // For each transformation
        var i, il, transform, transformType, transformParams, transformMatrix;

        //console.log('transformAttr:', transformAttr);

        for (i = 0, il = transformations.length; i < il; i++) {
            // Split name and value on opening parenthesis
            transform = transformations[i].split('(');

            // Invalid parts number
            if (transform.length !== 2) {
                continue;
            }

            transformType   = transform[0].trim();
            transformParams = transform[1].trim();

            // Skip empty value
            if (! transformParams.length) {
                continue;
            }

            // Split value on spaces and commas and filter as float value
            transformParams = transformParams.split(/[\s,]+/).map(parseFloat);

            // Check params values validity
            if (transformParams.filter(isNaN).length) {
                continue;
            }

            this.addTransformMatrix(tag, transformType, transformParams);

            //console.log('transform:', transformType, transformParams, tag.matrix);
        }
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.parseTag = function(tag) {
        // Get internal parser from node name (_svg, _g, etc...)
        var parse = this['_' + tag.name];

        // Not supported
        if (! parse) {
            return null;
        }

        // Parse tag and return true if done
        return !!parse.call(this, tag);
    };

    // -------------------------------------------------------------------------

    // Parse SVG node
    lw.svg.Parser.prototype.parseNode = function(node, parent, matrix) {
        // Create base tag
        var tag = new lw.svg.Tag(node, parent, matrix);

        // Parse tag attributes
        this.parseTagAttrs(tag);

        // Unsupported tag ?
        if (! this.parseTag(tag)) {
            return null;
        }

        // Apply matrix
        if (tag.vertices.length) {
            tag.applyMatrix();
        }

        // Parse tag children
        for (var childTag, i = 0, il = node.childNodes.length; i < il; i++) {
            childTag = this.parseNode(node.childNodes[i], tag);
            childTag && tag.children.push(childTag);
        }

        // Return tag object
        return tag;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.getArcSegments = function(radius) {
        // Fixed number of segments provided by user
        var segments  = this.settings.arcSegments || 0;

        // Calculate number of segments from perimeter and minSegmentLength
        if (! segments || segments <= 0) {
            var perimeter = _PI2_ * radius;
            var minLength = this.settings.minSegmentLength;
                segments  = perimeter / minLength;
        }

        // Return the number of segments
        return segments;
    };

    // Tags parsers ------------------------------------------------------------
    // This part come mainly from the SVG parser for the Lasersaur.
    // SVG specs at https://www.w3.org/TR/SVG11/

    lw.svg.Parser.prototype._svg = function(tag) {
        // Supported tag
        return true;
    };

    lw.svg.Parser.prototype._g = function(tag) {
        // Supported tag
        return true;
    };

    // Basic Shapes

    lw.svg.Parser.prototype._rect = function(tag) {
        var w  = tag.getAttr('width');
        var h  = tag.getAttr('height');
        var x  = tag.getAttr('x');
        var y  = tag.getAttr('y');
        var rx = tag.getAttr('rx');
        var ry = tag.getAttr('ry');

        // Add vertices
        if (!rx && !ry) {
            tag.addVertex(x, y);
            tag.addVertex(x + w, y);
            tag.addVertex(x + w, y + h);
            tag.addVertex(x, y + h);

            // Supported tag
            return true;
        }

        // TODO rounded corners
        return false;

        // A negative value is an error
        if (rx < 0 || ry < 0) {
            // Skip tag
            return false;
        }

        // If a properly specified value is provided for ‘rx’, but not for ‘ry’,
        // then set both rx and ry to the value of ‘rx’ and vis-vera...
        if (rx === null) rx = ry;
        if (ry === null) ry = rx;

        // If rx is greater than half of ‘width’, then set rx to half of ‘width’.
        // If ry is greater than half of ‘height’, then set ry to half of ‘height’.
        if (rx > w / 2) rx = w / 2;
        if (ry > h / 2) ry = h / 2;

    };

    lw.svg.Parser.prototype._circle = function(tag) {
        // Circle radius
        var r = tag.getAttr('r');

        // Negative value
        if (! r || r <= 0) {
            // Skip tag
            return false;
        }

        // Coordinate of the center of the circle
        var cx = tag.getAttr('cx', 0);
        var cy = tag.getAttr('cy', 0);

        // Compute circle vertices
        var segments = this.getArcSegments(r);
        var step     = _PI2_ / segments;

        for (var theta = _PI2_; theta > 0; theta -= step) {
            tag.addVertex(
                cx + r * Math.cos(theta),
                cy - r * Math.sin(theta)
            );
        }

        // Supported tag
        return true;
    };

    lw.svg.Parser.prototype._ellipse = function(tag) {
        // Ellipse radius
        var rx = tag.getAttr('rx');
        var ry = tag.getAttr('ry');

        // Negative value
        if (! rx || ! ry || rx <= 0 || ry <= 0) {
            // Skip tag
            return false;
        }

        // Coordinate of the center of the circle
        var cx = tag.getAttr('cx', 0);
        var cy = tag.getAttr('cy', 0);

        // Compute circle vertices
        var segments = this.getArcSegments(Math.min(rx, ry));
        var step     = _PI2_ / segments;

        for (var theta = _PI2_; theta > 0; theta -= step) {
            tag.addVertex(
                cx + rx * Math.cos(theta),
                cy - ry * Math.sin(theta)
            );
        }

        // Supported tag
        return true;
    };

    lw.svg.Parser.prototype._line = function(tag) {
        // Add vertices
        tag.addVertex(tag.getAttr('x1'), tag.getAttr('y1'));
        tag.addVertex(tag.getAttr('x2'), tag.getAttr('y2'));

        // Supported tag
        return true;
    };

    lw.svg.Parser.prototype._polyline = function(tag) {
        // Get the points attribute value
        var points = tag.getAttr('points').trim();

        // Split on spaces and commas
        points = points.split(/[\s,]+/).map(parseFloat);

        // Bad points number count
        if (points.length % 2) {
            // Skip tag
            return false;
        }

        // For each couple of points
        for (var i = 0; i < points.length; i += 2) {
            tag.addVertex(points[i], points[i + 1]);
        }

        // Supported tag
        return true;
    };

    lw.svg.Parser.prototype._polygon = function(tag) {
        // Handled like polyline
        return this._polyline(tag);
    };

    // -------------------------------------------------------------------------

    lw.svg.Path = function(x, y) {
        this.origin   = new lw.svg.Vertex(x, y);
        this.vertices = [this.origin];
        this.length   = 0;
    };

    lw.svg.Path.prototype.addVertex = function(x, y) {
        this.vertices.unshift(new lw.svg.Vertex(x, y));
        this.length = this.vertices.length;
    };

    lw.svg.Path.prototype.getVertex = function(i) {
        i = i < 0 ? this.vertices.length + i : i;
        return this.vertices[i] || null;
    };

    lw.svg.Path.prototype.isClosed = function() {
        var lastVertex = this.getVertex(-1);
        return lastVertex && lastVertex.isEqual(this.getVertex(0));
    };

    lw.svg.Path.prototype.close = function() {
        if (! this.isClosed()) {
            var lastVertex = this.getVertex(-1);
            this.addVertex(lastVertex.x, lastVertex.y);
        }
    };

    lw.svg.Path.prototype.addPoints = function(points, absolute) {
        // Bad points number count
        if (points.length % 2) {
            return null;
        }

        // Relative offset ?
        var offset = absolute ? new lw.svg.Vertex(0, 0) : this.origin;

        // For each couple of points
        for (var i = 0, il = points.length; i < il; i += 2) {
            this.addVertex(points[i] + offset.x, points[i + 1] + offset.y);
        }
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path = function(tag) {
        // Get the paths attribute value
        var dAttr = tag.getAttr('d').trim();

        // Split commands
        var origin  = new lw.svg.Vertex(0, 0);
        var matches = dAttr.split(/([a-z]+[^a-z]+)/gi);
        var vertex, params, command, absolute, path, paths = [];

        matches.map(function(match) {
            match  = match.trim();
            params = match.match(/([a-z]+|[0-9\.]+)/gi);

            // Empty params; skip...
            if (! params) {
                return null;
            }

            // Extract command char
            command  = params.shift();
            absolute = command === command.toUpperCase();
            command  = command.toUpperCase();

            // Normalize params
            params = params.map(parseFloat);

            console.log(absolute, command, params);

            // Line
            if (command === 'L') {
                // Add points and return
                return path.addPoints(params, absolute);
            }

            // Start a new sub-path
            if (command === 'M') {
                // The "moveto" commands (M or m) establish a new current point
                origin.x = params.shift();
                origin.y = params.shift();

                // Create new path
                path = new lw.svg.Path(origin.x, origin.y);

                // If a moveto is followed by multiple pairs of coordinates,
                // the subsequent pairs are treated as implicit lineto commands.
                if (params.length) {
                    path.addPoints(params, absolute);
                }

                // Add path and return
                return paths.push(path);
            }

            // Close path
            if (command === 'Z') {
                return path.close();
            }
        });

        console.log(paths);
    };


    lw.svg.Parser.prototype.__path = function(tag) {
        // Get the paths attribute value
        var dAttr = tag.getAttr('d').trim();

        var matches = dAttr.split(/([a-z]+[^a-z]+)/gi);
        var command, params, absolute, path;
        var point = { x: 0, y: 0 };
        var paths = [];

        matches.map(function(match) {
            match  = match.trim();
            params = match.match(/([a-z]+|[0-9\.]+)/gi);

            // Empty params; skip...
            if (! params) {
                return null;
            }

            // Extract command char
            command  = params.shift();
            absolute = command === command.toUpperCase();
            command  = command.toUpperCase();

            // Normalize params
            params = params.map(parseFloat);

            console.log(absolute, command, params);

            // Start a new sub-path
            if (command === 'M') {
                // New current point
                point.x = params.shift();
                point.y = params.shift();

                // Create new path
                path = new lw.svg.Path();

                // Add path
                paths.push(path);

                // If a moveto is followed by multiple pairs of coordinates,
                // the subsequent pairs are treated as implicit lineto commands.
                if (params.length > 2) {
                    command = 'L';
                }

                // Done...
                else {
                    return null;
                }
            }

            // Close path
            if (command === 'Z') {
                // Clone first point as last point if not the same
                var las
                if (path.getVertex(0) !== path.getVertex(-1)) {
                    path.addVertex(path.getVertex(-1));
                }

                // Done...
                return null;
            }

            // Line
            if (command === 'L') {
                // Start of the line
                if (! path.length) {
                    path.addVertex(point.x, point.y);
                }

                // Add points
                path.addPoints(params);

                // Done...
                return null;
            }
        });

        console.info('paths:', paths);
    };

    /*
    lw.svg.Path = function(command, absolute) {
        this.command  = command;
        this.absolute = absolute;
        this.closed   = false;
        this.params   = [];
    };

    lw.svg.Path.prototype.addParam = function(param) {
        this.params.push(parseFloat(param));
    };

    lw.svg.Parser.prototype._path = function(tag) {
        // Get the paths attribute value
        var dAttr = tag.getAttr('d').trim();

        // Split paths
        var paths    = [];
        var path     = null;
        var absolute = null;
        var origin   = { x: 0, y: 0 };

        dAttr.replace(/([a-z]+)|([0-9\.]+)/gi, function(value, command, param) {
            if (param) {
                // Add param to current path
                return path.addParam(param);
            }

            // Get command
            command  = command.toLowerCase();
            absolute = command !== value;

            if (command === 'm') {
                path = new lw.svg.Path(command, absolute);
            }
        });

        // Add last path
        if (path && path.params.length) {
            paths.push(path);
        }

        //console.log(pathData);
        console.log(paths);
    };
    */

    /*
    lw.svg.Parser.prototype._title = function(tag) {};

    lw.svg.Parser.prototype._desc = function(tag) {};

    lw.svg.Parser.prototype._metadata = function(tag) {};

    lw.svg.Parser.prototype._defs = function(tag) {};

    lw.svg.Parser.prototype._style = function(tag) {};

    lw.svg.Parser.prototype._text = function(tag) {};

    lw.svg.Parser.prototype._image = function(tag) {};
    */

    // End svg scope
})();
