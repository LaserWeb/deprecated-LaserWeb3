// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // SVG Parser class
    lw.svg.Parser = function(svg, settings) {
        // Init properties
        this.svg      = null; // Raw XML string
        this.editor   = null; // Editor info { name, version, fingerprint }
        this.document = null; // SVG document info { width, height, viewBox }
        this.tags     = null; // lw.svg.Tag objects hierarchy
        this.tag      = null; // Current lw.svg.Tag object
        this.defs     = null; // Defined (DOM) nodes list by id

        // Defaults settings
        this.settings          = settings          || {};
        this.settings.onParse  = settings.onParse  || null;
        this.settings.onError  = settings.onError  || null;
        this.settings.excludes = settings.excludes || ['#text', '#comment', 'title', 'desc', 'text'];

        // Load SVG contents
        svg && this.load(svg);
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

    lw.svg.Parser.prototype.parse = function(svg) {
        // Reset tags collection
        this.tags = null;
        this.defs = {};

        // No SVG contents
        if (! svg && ! this.svg) {
            throw new Error('First param "svg" must be specified');
        }

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

        if (! this.tags) {
            throw new Error('No supported tags found');
        }

        // Apply matrix (recursive)
        this.tags.applyMatrix();

        // return tags collection
        return this.tags;
    };

    // -------------------------------------------------------------------------

    // Parse error...
    lw.svg.Parser.prototype.error = function(message) {
        // Create error object
        var error = new Error(message);

        // Call user function if defined
        if (typeof this.settings.onError === 'function') {
            this.settings.onError(error, this.tag);
        }

        // Else log in browser console
        else {
            console.warn(error.message, error);
        }

        // Return false (for use with Array.some)
        return false;
    };

    // -------------------------------------------------------------------------

    // Parse SVG node (recursive)
    lw.svg.Parser.prototype.parseNode = function(node, parent) {
        // Create base tag
        var tag = new lw.svg.Tag(node, parent);

        // Parse the tag
        if (! this.parseTag(tag)) {
            return false;
        }

        // Parse children nodes
        var childTag;

        node.childNodes.forEach(function(childNode) {
            childTag = this.parseNode(childNode, tag);
            childTag && tag.addChild(childTag);
        }, this);

        // Update current tag
        this.tag = tag;

        if (tag.name === 'g' && ! tag.children.length) {
            return this.error('Empty group');
        }

        // Return tag object
        return tag;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.parseTag = function(tag) {
        // Excluded tag ?
        if (this.settings.excludes.indexOf(tag.name) !== -1) {
            return false;
        }

        // Set currrent tag
        this.tag = tag;

        // Call user callback
        if (typeof this.settings.onParse === 'function') {
            this.settings.onParse(this.tag);
        }

        // Get internal parser from node name (_svg, _g, etc...)
        var parser = this['_' + tag.name.replace(/^#/, '_')];

        // No parser...
        if (! parser || typeof parser !== 'function') {
            return this.error('Unsupported tag');
        }

        // Parse tag attributes
        this.parseTagAttrs();

        // Parse tag
        // return true if done
        // false if error
        return parser.call(this);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.parseTagAttrs = function() {
        // Get tag attributes
        var attrs = this.tag.node.attributes;

        if (! attrs) {
            return null;
        }

        // For each attribute
        var attr, value, style;

        Object.keys(attrs).some(function(i) {
            // Current attribute
            attr = attrs[i];

            // Normalize attribute value
            value = this.normalizeTagAttr(attr);

            if (value === false) {
                return false;
            }

            // Special case
            if (attr.nodeName === 'style') {
                style = value;
            }
            else {
                // Set new attribute name/value
                this.tag.setAttr(attr.nodeName, value);
            }
        }, this);

        // If style attribute (override tag attributes)
        // TODO get/parse global style and override this one...
        if (style) {
            style = style.split(';');

            style.some(function(attr) {
                // Current style
                attr = attr.split(':');
                attr = { nodeName: attr[0], nodeValue: attr[1] };

                // Normalize attribute value
                value = this.normalizeTagAttr(attr);

                if (value === false) {
                    return false;
                }

                // Set new attribute name/value
                this.tag.setAttr(attr.nodeName, value);
            }, this);
        }

        // Set inherited color
        ['fill', 'stroke', 'color'].forEach(function(attrName) {
            if (this.tag.getAttr(attrName) === 'inherit') {
                this.tag.setAttr(attrName, this.tag.parent.getAttr(attrName, 'none'));
            }
        }, this)

        // Parse transform attribute
        this.parseTransformAttr();
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.normalizeTagAttr = function(attr) {
        // Remove trailing spaces
        var attrValue = attr.nodeValue.trim();

        if (! attrValue.length) {
            return this.error('Empty "' + attr.nodeName + '" attribute');
        }

        // Filters
        switch (attr.nodeName) {
            // Range limit to [0 - 1]
            case 'opacity'      :
            case 'fillOpacity'  :
            case 'strokeOpacity':
                attrValue = this.normalizeTagAttrRange(attr, 0, 1);
            break;

            // Normalize points attribute
            case 'points' :
                attrValue = this.normalizeTagAttrPoints(attr);
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
                attrValue = this.normalizeTagAttrUnit(attr);
            break;
        }

        // Return normalized value
        return attrValue;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.attrError = function(attr, message) {
        return this.error(message + ' in ['  + attr.nodeName + ':' + attr.nodeValue + ']');
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.normalizeTagAttrRange = function(attr, min, max) {
        var attrValue = attr.nodeValue.trim();
        var value     = parseFloat(attrValue);

        if (isNaN(value)) {
            return this.attrError(attr, 'Only numeric values are allowed');
        }

        if (value < min || value > max) {
            return this.attrError(attr, 'Out of range [' + min + ', ' + max + ']');
        }

        return value;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.normalizeTagAttrPoints = function(attr) {
        var points = this.parseNumbers(attr.nodeValue);

        if (points === false) {
            return this.attrError(attr, 'Only numeric values are allowed');
        }

        if (! points.length) {
            return this.attrError(attr, 'Empty points list');
        }

        if (points.length % 0) {
            return this.attrError(attr, 'The number of points must be even');
        }

        return points;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.parseNumbers = function(points) {
        // http://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly
        if (typeof points === 'string') {
            points = points.split(/([+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?/g);
            points = points.filter(function(point) {
                return point && ['', ','].indexOf(point.trim()) === -1;
            });
        }

        // Normalize to float values
        points = points.map(parseFloat);

        // Test if all numbers is valid
        if (points.some(isNaN)) {
            return false;
        }

        return points;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.normalizeTagAttrUnit = function(attr) {
        var stringValue = attr.nodeValue.toLowerCase();
        var floatValue  = parseFloat(stringValue);

        if (isNaN(floatValue)) {
            return this.attrError(attr, 'Only numeric value allowed');
        }

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

    lw.svg.Parser.prototype.parseTransformAttr = function() {
        // Get transform attribute
        var transformAttr = this.tag.getAttr('transform', null);

        // No transformation...
        if (transformAttr === null) {
            return null;
        }

        // Empty transform attribute
        if (! transformAttr.length) {
            return this.error('Empty "transform" attribute');
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
                return this.error('Malformed transform attribute in [' + transformAttr + ']');
            }

            type = transform[0].trim();

            // Get tag transform method
            var tagTransform = this.tag[type];

            if (typeof tagTransform !== 'function') {
                return this.error('Unsupported transform type "' + type  + '" in [' + transformAttr + ']');
            }

            params = transform[1].trim();
            params = this.parseNumbers(params);

            // Skip empty value
            if (! params.length) {
                return this.error('Malformed  "' + type  + '" transform attribute value in [' + transformAttr + ']');
            }

            // Call tag transform method like "tag.translate(param1, ..., paramN)"
            tagTransform.apply(this.tag, params);

        }, this);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.newPath = function() {
        this.tag.newPath();
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.clearPath = function() {
        this.tag.clearPath();
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.addPoints = function(points, relative) {
        if (! points.length) {
            return this.error('Empty points list');
        }

        if (points.length % 0) {
            return this.error('The number of points must be even');
        }

        relative = arguments.length < 2 && this.currentCommand.relative;

        this.tag.addPoints(points, relative);

        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.closePath = function() {
        this.tag.closePath();
    };

    // Tags parsers ------------------------------------------------------------
    // SVG specs at https://www.w3.org/TR/SVG11/

    lw.svg.Parser.prototype._svg = function() {
        // Get the document size
        var width  = this.tag.getAttr('width');
        var height = this.tag.getAttr('height');

        // Invalid size
        if (! width || width < 0 || ! height || height < 0) {
            throw new Error('Invalid document size: ' + width + ' / ' + height);
        }

        // Set document size
        this.document = {
            width : width,
            height: height
        };

        // Get and set document viewBox
        this.document.viewBox = {
            x     : this.tag.getAttr('x', 0),
            y     : this.tag.getAttr('y', 0),
            width : this.tag.getAttr('width', width),
            height: this.tag.getAttr('height', height)
        };

        // Check inkscape version
        if (this.editor.name === 'inkscape') {
            this.editor.version = this.tag.getAttr('inkscape:version', null);
        }

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._defs = function() {
        this.tag.node.childNodes.forEach(function(childNode) {
            if (childNode.id) {
                this.defs[childNode.id] = childNode;
            }
        }, this);

        // Skipped tag
        return false;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._use = function() {
        var target = this.tag.getAttr('xlink:href').replace(/^#/, '');
        var node   = this.defs[target];

        if (! node) {
            return this.error('Undefined reference:' + target);
        }

        var parent = this.tag.parent;
        var matrix = this.tag.matrix;
        var tag    = this.parseNode(node, parent);

        if (! tag) {
            return this.error('Empty reference:' + target);
        }

        tag.addMatrix(matrix);
        parent.addChild(tag);

        // Skipped tag
        return false;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._g = function() {
        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._line = function() {
        // Handled tag
        return this._path([
            'M', this.tag.getAttr('x1'), this.tag.getAttr('y1'),
            'L', this.tag.getAttr('x2'), this.tag.getAttr('y2')
        ]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._polyline = function(close) {
        var points = this.tag.getAttr('points');
        var path   = ['M', points.shift(), points.shift(), 'L'];

        path = path.concat(points);
        close && path.push('Z');

        // Handled tag
        return this._path(path);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._polygon = function() {
        // Handled like polyline but closed
        return this._polyline(true);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._rect = function() {
        // Get rectangle attributes
        var w  = this.tag.getAttr('width');
        var h  = this.tag.getAttr('height');
        var x  = this.tag.getAttr('x', 0);
        var y  = this.tag.getAttr('y', 0);
        var rx = this.tag.getAttr('rx', null);
        var ry = this.tag.getAttr('ry', null);

        // Simple rect
        if (!rx && !ry) {
            // Handled tag
            return this._path(['M', x, y, 'h', w, 'v', h, 'h', -w, 'z']);
        }

        // If a properly specified value is provided for ‘rx’, but not for ‘ry’,
        // then set both rx and ry to the value of ‘rx’ and vis-vera...
        if (rx === null) rx = ry;
        if (ry === null) ry = rx;

        // A negative value is an error
        if (rx === null || rx === null || rx < 0 || ry < 0) {
            // Skip tag
            return this.error('Negative value for "rx/ry" not allowed');
        }

        // If rx is greater than half of ‘width’, then set rx to half of ‘width’.
        // If ry is greater than half of ‘height’, then set ry to half of ‘height’.
        if (rx > w / 2) rx = w / 2;
        if (ry > h / 2) ry = h / 2;

        var dx = rx * 2;
        var dy = ry * 2;

        // Handled tag
        return this._path([
            'M', x + rx, y,
            'h', w - dx,
            'c', rx, 0, rx, ry, rx, ry,
            'v', h - dy,
            'c', 0, ry, -rx, ry, -rx, ry,
            'h', -w + dx,
            'c', -rx, 0, -rx, -ry, -rx, -ry,
            'v', -h + dy,
            'c', 0, 0, 0, -ry, rx, -ry,
            'z'
        ]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._circle = function() {
        var r = this.tag.getAttr('r', 0);

        if (r <= 0) {
            // Skipped tag
            return false;
        }

        var cx = this.tag.getAttr('cx', 0);
        var cy = this.tag.getAttr('cy', 0);

        // Handled tag
        return this._path([
            'M', cx-r, cy,
            'A', r, r, 0, 0, 0, cx, cy+r,
            'A', r, r, 0, 0, 0, cx+r, cy,
            'A', r, r, 0, 0, 0, cx, cy-r,
            'A', r, r, 0, 0, 0, cx-r, cy,
            'Z'
        ]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._ellipse = function() {
        var rx = this.tag.getAttr('rx', 0);
        var ry = this.tag.getAttr('ry', 0);

        if (rx <= 0 || ry <= 0) {
            // Skipped tag
            return false;
        }

        var cx = this.tag.getAttr('cx', 0);
        var cy = this.tag.getAttr('cy', 0);

        // Handled tag
        return this._path([
            'M', cx-rx, cy,
            'A', rx, ry, 0, 0, 0, cx, cy+ry,
            'A', rx, ry, 0, 0, 0, cx+rx, cy,
            'A', rx, ry, 0, 0, 0, cx, cy-ry,
            'A', rx, ry, 0, 0, 0, cx-rx, cy,
            'Z'
        ]);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path = function(path) {
        // Provided path
        if (path && typeof path !== 'string') {
            path = path.join(' ');
        }

        // Get the paths data attribute value
        var dAttr = path || this.tag.getAttr('d', null);

        if (! dAttr) {
            // Skipped tag
            return false;
        }

        // Split on each commands
        var commands = dAttr.match(/([M|Z|L|H|V|C|S|Q|T|A]+([^M|Z|L|H|V|C|S|Q|T|A]+)?)/gi);

        if (! commands) {
            return this.error('Malformed "d" attribute');
        }

        // For each command...
        this.currentCommand = {
            raw     : null,
            type    : null,
            params  : null,
            relative: null
        };
        this.lastCommand = this.currentCommand;
        this.pathData    = {};

        var commandParser = null;
        var parseError    = false;

        commands.some(function(raw) {
            // Remove trailing whitespaces
            raw = raw.trim();

            // Extract command char and params
            this.currentCommand.raw      = raw;
            this.currentCommand.type     = raw[0].toUpperCase();
            this.currentCommand.params   = raw.substr(1).trim();
            this.currentCommand.relative = this.currentCommand.type !== raw[0];

            // Get internal parser from command char (_path_M, _path_Z, etc...)
            commandParser = this['_path_' + this.currentCommand.type];

            if (! commandParser || typeof commandParser !== 'function') {
                this.error('Unsupported command [' + raw[0] + ']');
                return parseError = true;
            }

            // Extract all numbers from arguments string
            this.currentCommand.params = this.parseNumbers(this.currentCommand.params);

            if (this.currentCommand.params === false) {
                this.error('Only numeric values are allowed in [' + this.currentCommand.raw + ']');
                return parseError = true;
            }

            // Execute command parser
            if (! commandParser.call(this, this.currentCommand.params)) {
                return parseError = true;
            }

            // Update last command
            this.lastCommand = {};
            Object.keys(this.currentCommand).forEach(function(key) {
                this.lastCommand[key] = this.currentCommand[key];
            }, this);

        }, this);

        // Skip tag
        if (parseError) {
            this.clearPath();
            return false;
        }

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_M = function(points) {
        // New path
        this.newPath();

        // Set the current point (start of new path)
        // If is followed by multiple pairs of coordinates,
        // the subsequent pairs are treated as implicit lineto commands.
        return this.addPoints(points);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_Z = function(tag) {
        this.closePath();

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_L = function(points) {
        return this.addPoints(points);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_H = function(points) {
        var y, done = points.every(function(x) {
            y = this.currentCommand.relative ? 0 : this.tag.point.y;
            return this.addPoints([x, y]);
        }, this);

        // Handled tag
        return done;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_V = function(points) {
        var x, done = points.every(function(y) {
            x = this.currentCommand.relative ? 0 : this.tag.point.x;
            return this.addPoints([x, y]);
        }, this);

        // Handled tag
        return done;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._paths = function(type, num, points) {
        if (points.length > num) {
            var result = true;

            while(result && points.length) {
                result = this['_path_' + type](points.splice(0, num));
            }

            return result;
        }

        return null;
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_C = function(points) {
        // Multiple paths
        var result = this._paths('C', 6, points);
        if (result !== null) {
            return result;
        }

        // Single path
        var p1 = this.tag.point;
        var rl = this.currentCommand.relative;

        var x1 = points[0] + (rl ? p1.x : 0);
        var y1 = points[1] + (rl ? p1.y : 0);
        var x2 = points[2] + (rl ? p1.x : 0);
        var y2 = points[3] + (rl ? p1.y : 0);
        var x  = points[4] + (rl ? p1.x : 0);
        var y  = points[5] + (rl ? p1.y : 0);

        this.pathData.x2 = x2;
        this.pathData.y2 = y2;

        var p2 = new lw.svg.Point(x1, y1);
        var p3 = new lw.svg.Point(x2, y2);
        var p4 = new lw.svg.Point(x, y);

        //console.log('C', p1, p2, p3, p4);

        // p1  : starting point
        // p2  : control point
        // p3  : control point
        // p4  : end point
        var bezier = new lw.svg.trace.CubicBezier({
            p1: p1, p2: p2, p3: p3, p4: p4
        });

        // Trace the line
        return this.addPoints(bezier.trace(), false);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_S = function(points) {
        // Multiple paths
        var result = this._paths('S', 4, points);
        if (result !== null) {
            return result;
        }

        // Single path
        var p1 = this.tag.point;
        var rl = this.currentCommand.relative;

        var x1 = p1.x;
        var y1 = p1.y;

        if (this.lastCommand.type === 'S' || this.lastCommand.type === 'C') {
            x1 -= this.pathData.x2 - x1;
            y1 -= this.pathData.y2 - y1;
        }

        var x2 = points[0] + (rl ? p1.x : 0);
        var y2 = points[1] + (rl ? p1.y : 0);
        var x  = points[2] + (rl ? p1.x : 0);
        var y  = points[3] + (rl ? p1.y : 0);

        this.pathData.x2 = x2;
        this.pathData.y2 = y2;

        var p2 = new lw.svg.Point(x1, y1);
        var p3 = new lw.svg.Point(x2, y2);
        var p4 = new lw.svg.Point(x, y);

        //console.log('S', p1, p2, p3, p4);

        // p1  : starting point
        // p2  : control point
        // p3  : control point
        // p4  : end point
        var bezier = new lw.svg.trace.CubicBezier({
            p1: p1, p2: p2, p3: p3, p4: p4
        });

        // Trace the line
        return this.addPoints(bezier.trace(), false);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_Q = function(points) {
        // Multiple paths
        var result = this._paths('Q', 4, points);
        if (result !== null) {
            return result;
        }

        // Single path
        var p1 = this.tag.point;
        var rl = this.currentCommand.relative;

        var x1 = points[0] + (rl ? p1.x : 0);
        var y1 = points[1] + (rl ? p1.y : 0);
        var x  = points[2] + (rl ? p1.x : 0);
        var y  = points[3] + (rl ? p1.y : 0);

        this.pathData.x1 = x1;
        this.pathData.y1 = y1;

        var p2 = new lw.svg.Point(x1, y1);
        var p3 = new lw.svg.Point(x, y);

        //console.log('C', p1, p2, p3, p4);

        // p1  : starting point
        // p2  : control point
        // p3  : end point
        var bezier = new lw.svg.trace.QuadricBezier({
            p1: p1, p2: p2, p3: p3
        });

        // Trace the line
        return this.addPoints(bezier.trace(), false);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_T = function(points) {
        // Multiple paths
        var result = this._paths('T', 2, points);
        if (result !== null) {
            return result;
        }

        // Single path
        var p1 = this.tag.point;
        var rl = this.currentCommand.relative;

        var x1 = p1.x;
        var y1 = p1.y;

        if (this.lastCommand.type === 'Q' || this.lastCommand.type === 'T') {
            x1 -= this.pathData.x1 - x1;
            y1 -= this.pathData.y1 - y1;
        }

        var x = points[0] + (rl ? p1.x : 0);
        var y = points[1] + (rl ? p1.y : 0);

        this.pathData.x1 = x1;
        this.pathData.y1 = y1;

        var p2 = new lw.svg.Point(x1, y1);
        var p3 = new lw.svg.Point(x, y);

        //console.log('C', p1, p2, p3, p4);

        // p1  : starting point
        // p2  : control point
        // p3  : end point
        var bezier = new lw.svg.trace.QuadricBezier({
            p1: p1, p2: p2, p3: p3
        });

        // Trace the line
        return this.addPoints(bezier.trace(), false);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_A = function(points) {
        // Multiple paths
        var result = this._paths('A', 7, points);
        if (result !== null) {
            return result;
        }

        // Single path
        // var p1    = this.tag.point;
        // var rx    = points[0];
        // var ry    = points[1];
        // var angle = points[2];
        // var large = !!points[3];
        // var sweep = !!points[4];
        // var p2    = new lw.svg.Point(points[5], points[6]);
        var rl  = this.currentCommand.relative;
        var p1  = this.tag.point;
        var arc = new lw.svg.trace.Arc({
            p1   : p1,
            rx   : points[0],
            ry   : points[1],
            angle: points[2],
            large: !!points[3],
            sweep: !!points[4],
            p2   : new lw.svg.Point(points[5] + (rl ? p1.x : 0), points[6] + (rl ? p1.y : 0))
        });

        // Trace the line
        return this.addPoints(arc.trace(), false);
    };

    // -------------------------------------------------------------------------

    // End SVG Parser
})();
