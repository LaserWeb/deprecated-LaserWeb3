// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    var _PI2_        = 2 * Math.PI;
    var _DEG_TO_RAD_ = Math.PI / 180;

    // -------------------------------------------------------------------------

    lw.svg.Point = function(x, y) {
        // Init properties
        this.x = x;
        this.y = y;
    };

    // -------------------------------------------------------------------------

    lw.svg.Point.prototype.isEqual = function(point) {
        return this.x === point.x && this.y === point.y;
    };

    // =========================================================================

    lw.svg.Path = function(x, y) {
        // Init properties
        this.points   = [];
        this.length   = 0;
        this.relative = false;

        // Add point(s)
        if (arguments.length === 1) {
            this.addPoints(x);
        }
        else if (arguments.length === 2) {
            this.addPoint(x, y);
        }
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.setRelative = function(relative) {
        this.relative = !! relative;
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.getPoint = function(i) {
        i = i < 0 ? this.points.length + i : i;
        return this.points[i] || null;
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.addPoint = function(x, y) {
        // Add relative offsets
        if (this.relative && this.length) {
            var lastPoint = this.getPoint(-1);
            x += lastPoint.x;
            y += lastPoint.y;
        }

        // Add new point and compute new path length
        this.points.push(new lw.svg.Point(x, y));
        this.length = this.points.length;
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.addPoints = function(points) {
        // Bad points number count
        if (! points || ! points.length || points.length % 2) {
            throw new Error('The number of points must be even');
        }

        // Normalize points to float value
        points = points.map(parseFloat);

        if (points.some(isNaN)) {
            throw new Error('Only numeric values are allowed');
        }

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
        this.setRelative(false);

        if (! this.isClosed()) {
            var firstPoint = this.getPoint(0);
            this.addPoint(firstPoint.x, firstPoint.y);
            return true;
        }

        return false;
    };

    // =========================================================================

    lw.svg.Tag = function(node, parent) {
        // Init properties
        this.node     = node;
        this.name     = node.nodeName.toLowerCase();
        this.parent   = parent || null;
        this.attrs    = {};
        this.children = [];

        this.paths       = [];
        this.currentPath = new lw.svg.Path();

        this.matrix        = null;
        this.matrixApplied = false;

        // Reset transform matrix
        this.setMatrix(this.parent && this.parent.matrix);

        // Clone group parent attributes
        if (this.parent && this.parent.name === 'g') {
            var protectedAttrs = ['id', 'transform'];

            Object.keys(this.parent.attrs).forEach(function(attrName) {
                // Do not copy protected properties
                if (protectedAttrs.indexOf(attrName) === -1) {
                    this.setAttr(attrName, this.parent.attrs[attrName]);
                }
            }, this);
        }
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
        angle = (angle || 0) * _DEG_TO_RAD_;

        (x && y) && this.addMatrix([1, 0, 0, 1, x, y]);
        this.addMatrix([Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0]);
        (x && y) && this.addMatrix([1, 0, 0, 1, -x, -y]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.scale = function(x, y) {
        this.addMatrix([(x || 0), 0, 0, (y || x || 0), 0, 0]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.skewX = function(angle) {
        this.addMatrix([1, 0, Math.tan((angle || 0) * _DEG_TO_RAD_), 1, 0, 0]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.skewY = function(angle) {
        this.addMatrix([1, Math.tan((angle || 0) * _DEG_TO_RAD_), 0, 1, 0, 0]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.applyMatrix = function() {
        if (this.matrixApplied) {
            return null;
        }

        this.paths.map(function(path) {
            path.points = path.points.map(function(point) {
                return new lw.svg.Point(
                    this.matrix[0] * point.x + this.matrix[2] * point.y + this.matrix[4],
                    this.matrix[1] * point.x + this.matrix[3] * point.y + this.matrix[5]
                );
            }, this);
        }, this);

        this.matrixApplied = true;
        this.setMatrix(null);
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

    lw.svg.Tag.prototype.setRelative = function(relative) {
        this.currentPath.setRelative(relative);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.addPoint = function(x, y) {
        this.currentPath.addPoint(x, y);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.traceLine = function(points) {
        this.currentPath.addPoints(points);
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.closePath = function() {
        this.currentPath.close();
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.endPath = function() {
        if (this.currentPath.length) {
            this.paths.push(this.currentPath);
            this.currentPath = new lw.svg.Path();
            return true;
        }
        return false;
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag.prototype.openPath = function(points) {
        // End openned path (if any)
        this.endPath();

        // Add points
        if (arguments.length === 1) {
            this.traceLine(points);
        }
    };

    // =========================================================================

    // SVG Parser class
    lw.svg.Parser = function(svg, settings) {
        // Defaults settings
        var settings = settings || {};

        // Init properties
        this.settings = settings;
        this.name     = 'svg.Parser';
        this.logging  = true;
        this.svg      = null; // Raw XML string
        this.editor   = null; // Editor info { name, version, fingerprint }
        this.document = null; // SVG document info { width, height, viewBox }
        this.tags     = null; // lw.svg.Tag objects hierarchy

        // Bind logging methods
        lw.log.bind(this);

        // Load SVG contents
        svg && this.load(svg);
    };

    // -------------------------------------------------------------------------

    // Try to get the file editor
    lw.svg.Parser.prototype.parseEditor = function() {
        // Reset editor
        this.editor = {
            name       : 'unknown',
            version    : null,
            fingerprint: null
        };

        // Fingerprint matches
        var fingerprint;

        // Inkscape
        fingerprint = this.svg.match(/<!-- Created with Inkscape .*-->/i);

        if (fingerprint) {
            this.editor.name        = 'inkscape';
            this.editor.fingerprint = fingerprint[0];
            return this.editor;
        }

        // Illustrator
        fingerprint = this.svg.match(/<!-- Generator: Adobe Illustrator ([0-9\.]+), .*-->/i);

        if (fingerprint) {
            this.editor.name        = 'illustrator';
            this.editor.version     = fingerprint[1];
            this.editor.fingerprint = fingerprint[0];
            return this.editor;
        }

        // Return default
        return this.editor;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.load = function(svg) {
        // Reset SVG property
        this.svg = null;

        // Empty SVG contents
        if (typeof svg !== 'string') {
            throw new Error('Param "svg" must be a string');
        }

        // Normalize whitespaces
        svg = svg.replace(/[\r\n]+/gm, ' '); // Remove all new line chars
        svg = svg.replace(/\s+/gm, ' ');     // Reduce multiple whitespaces

        // Empty SVG contents
        if (! svg || ! svg.length) {
            throw new Error('Empty SVG contents');
        }

        // Set SVG contents
        this.svg = svg;

        // Try to get the file editor
        this.parseEditor();
    };

    // -------------------------------------------------------------------------

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

    lw.svg.Parser.prototype.normalizeTagAttr = function(attr) {
        // Remove trailing spaces
        var attrValue = attr.nodeValue.trim();

        // Filters
        switch (attr.nodeName) {
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
                //attrValue = this.normalizeColor(attrValue);
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

    lw.svg.Parser.prototype.parseTransformAttr = function(tag) {
        // Get transform attribute
        var transformAttr = tag.getAttr('transform');

        // No transformation...
        if (! transformAttr) {
            return false;
        }

        // Empty transform attribute
        if (! transformAttr.length) {
            this.warning('Empty transform attribute:', tag.name, tag);
            return false;
        }

        // Parse attribute (split group on closing parenthesis)
        var transformations = transformAttr.split(')');

        // Remove last entry due to last ")" found
        transformations.pop();

        // For each transformation
        var transform, type, params, matrix;

        transformations.some(function(raw) {
            // Split name and value on opening parenthesis
            transform = raw.split('(');

            // Invalid parts number
            if (transform.length !== 2) {
                this.warning('Malformed transform attribute:', raw, tag);
                return false;
            }

            // Parse attribute (split group on closing parenthesis)
            var transformations = transformAttr.split(')');

            // Remove last entry due to last ")" found
            transformations.pop();

            type   = transform[0].trim();
            params = transform[1].trim();

            // Skip empty value
            if (! params.length) {
                this.warning('Malformed transform attribute value:', raw, tag);
                return false;
            }

            // Split value on spaces and commas and filter as float value
            params = params.split(/[\s,]+/).map(parseFloat);

            // Check params values validity
            if (params.filter(isNaN).length) {
                this.warning('Only numeric values are allowed:', raw, tag);
                return false;
            }

            //this.addTransformMatrix(tag, type, params);
            var tagTransform = tag[type];

            if (typeof tagTransform !== 'function') {
                this.warning('Undefined transformation:', type, raw, tag);
                return false;
            }

            tagTransform.apply(tag, params);

        }, this);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.parseTagAttrs = function(tag) {
        // Get tag attributes
        var attrs = tag.node.attributes;

        if (! attrs) {
            return null;
        }

        // For each attribute
        for (var attr, value, style, i = 0, il = attrs.length; i < il; i++) {
            // Current attribute
            attr = attrs[i];

            // Normalize attribute value
            value = this.normalizeTagAttr(attr);

            // Special case
            if (attr.nodeName === 'style') {
                style = value;
            }
            else {
                // Set new attribute name/value
                tag.setAttr(attr.nodeName, value);
            }
        }

        // If style attribute (override tag attributes)
        // TODO get/parse global style and override this one...
        if (style) {
            style = style.split(';');

            for (i = 0, il = style.length; i < il; i++) {
                // Current style
                attr = style[i].split(':');
                attr = { nodeName: attr[0], nodeValue: attr[1] };

                // Normalize attribute value
                value = this.normalizeTagAttr(attr);

                // Set new attribute name/value
                tag.setAttr(attr.nodeName, value);
            }
        }

        // Set inherited color
        ['fill', 'stroke', 'color'].forEach(function(attrName) {
            if (tag.getAttr(attrName) === 'inherit') {
                tag.setAttr(attrName, tag.parent.getAttr(attrName, 'none'));
            }
        })

        // Parse transform attribute
        this.parseTransformAttr(tag);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.parseTag = function(tag) {
        // Parse tag attributes
        this.parseTagAttrs(tag);

        // Get internal parser from node name (_svg, _g, etc...)
        var parser = this['_' + tag.name.replace(/^#/, '_')];

        // No parser...
        if (! parser) {
            return null;
        }

        // Parse tag and return true if done
        return !! parser.call(this, tag);
    };

    // -------------------------------------------------------------------------

    // Parse SVG node (recursive)
    lw.svg.Parser.prototype.parseNode = function(node, parent) {
        // Create base tag
        var tag = new lw.svg.Tag(node, parent);

        // Unsupported tag ?
        if (! this.parseTag(tag)) {
            this.warning('Unsupported tag:', tag.name, tag);
            return null;
        }

        this.info('Parse tag:', tag.name, tag);

        // Parse children nodes
        var childTag;
        node.childNodes.forEach(function(childNode) {
            childTag = this.parseNode(childNode, tag);
            childTag && tag.addChild(childTag);
        }, this);

        // Apply matrix
        tag.applyMatrix();

        // Return tag object
        return tag;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.parse = function(svg) {
        // Reset tags collection
        this.tags = [];

        // Load SVG contents
        svg && this.load(svg);

        // Parse as XML
        var isBrowserEnv = typeof window !== 'undefined';
        var rootNode;

        if (! isBrowserEnv || window.DOMParser) {
            var DOMParser = isBrowserEnv ? window.DOMParser : require('xmldom').DOMParser;
            var parser    = new DOMParser();
                rootNode  = parser.parseFromString(this.svg, 'text/xml').documentElement;
        }
        else {
            var xml          = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
            var xmlDoc       = new ActiveXObject('Microsoft.XMLDOM');
                xmlDoc.async = 'false';

            xmlDoc.loadXML(this.svg);
            rootNode = xmlDoc.documentElement;
        }

        // Parsing error ?
        if (rootNode.nodeName === 'parsererror') { // FF
            throw new Error(rootNode.textContent);
        }
        else if (rootNode.nodeName === 'html') { // Chrome
            throw new Error(rootNode.getElementsByTagName('parsererror')[0].textContent);
        }

        // Parse SVG node (recursive)
        this.tags = this.parseNode(rootNode);

        // return tags collection
        return this.tags;
    };

    // Tags parsers ------------------------------------------------------------
    // SVG specs at https://www.w3.org/TR/SVG11/

    lw.svg.Parser.prototype._svg = function(tag) {
        // Get the document size
        var width  = tag.getAttr('width');
        var height = tag.getAttr('height');

        // Invalid size
        if (! width || ! height) {
            throw new Error('Invalid document size: ' + width + ' / ' + height);
        }

        // Set document size
        this.document = {
            width : width,
            height: height
        };

        // Get and set document viewBox
        this.document.viewBox = {
            x     : tag.getAttr('x', 0),
            y     : tag.getAttr('y', 0),
            width : tag.getAttr('width', width),
            height: tag.getAttr('height', height)
        };

        // Check inkscape version
        if (this.editor.name === 'inkscape') {
            this.editor.version = tag.getAttr('inkscape:version', null);
        }

        // Debug
        this.info('editor:', this.editor);
        this.info('document:', this.document);

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.__text = function(tag) {
        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.__comment = function(tag) {
        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._g = function(tag) {
        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_M = function(tag, points) {
        this.info('Open path:', points);
        tag.openPath(points);

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_L = function(tag, points) {
        this.info('Trace line:', points);
        tag.traceLine(points);

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_Z = function(tag) {
        this.info('Close path!');
        tag.closePath();
        tag.endPath();

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path = function(tag) {
        // Get the paths data attribute value
        var dAttr = tag.getAttr('d');

        // Split on each commands
        var commands = dAttr.match(/([M|Z|L|H|V|C|S|Q|T|A]+([^M|Z|L|H|V|C|S|Q|T|A]+)?)/gi);

        if (! commands) {
            this.warning('Empty path data:', tag.name, tag);
            return null;
        }

        // Debug...
        // this.debug('dAttr:', dAttr);
        // this.debug('commands:', commands);

        // For each command...
        var commandParser = null;
        var commandChar   = null;
        var commandParams = null;
        var isRelative    = null;

        commands.some(function(command) {
            // Remove trailing whitespaces
            command = command.trim();

            // Extract command char and params
            commandChar   = command[0].toUpperCase();
            commandParams = command.substr(1).trim();

            // Get internal parser from command char (_path_M, _path_Z, etc...)
            commandParser = this['_path_' + commandChar];

            // No parser...
            if (! commandParser) {
                this.warning('Unsupported command:', commandChar, tag);
                return false;
            }

            // Set tag move mode
            tag.setRelative(commandChar !== command[0]);

            // Split command string on whitespaces or commas
            commandParams = commandParams.split(/[\s,]+/);

            // Call command parser
            //this.debug(commandChar, commandParams);
            commandParser.call(this, tag, commandParams);

        }, this);

        // Close last path
        tag.endPath();

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._line = function(tag) {
        // Trace path
        tag.openPath();
        tag.traceLine([
            tag.getAttr('x1'), tag.getAttr('y1'),
            tag.getAttr('x2'), tag.getAttr('y2')
        ]);
        tag.endPath();

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._polyline = function(tag, closePath) {
        // Get the points attribute value
        var pointsAttr = tag.getAttr('points');

        // Split points string on whitespaces or commas
        var points = pointsAttr.split(/[\s,]+/);

        // Trace path
        tag.openPath();
        tag.traceLine(points);
        closePath && tag.closePath();
        tag.endPath();

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._polygon = function(tag) {
        // Handled like polyline
        this._polyline(tag, true);

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._rect = function(tag) {
        // Get rectangle attributes
        var w  = tag.getAttr('width');
        var h  = tag.getAttr('height');
        var x  = tag.getAttr('x', 0);
        var y  = tag.getAttr('y', 0);
        var rx = tag.getAttr('rx', 0);
        var ry = tag.getAttr('ry', 0);

        // Simple rect
        if (!rx && !ry) {
            // Trace path
            tag.openPath();
            tag.traceLine([
                x    , y,
                x + w, y,
                x + w, y + h,
                x    , y + h
            ]);
            tag.closePath();
            tag.endPath();

            // Handled tag
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

    // -------------------------------------------------------------------------

    // End Parser
})();
