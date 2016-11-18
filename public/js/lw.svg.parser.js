// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

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
        this.points = [];
        this.length = 0;

        // Add point(s)
        if (arguments.length === 1) {
            this.addPoints(x);
        }
        else if (arguments.length === 2) {
            this.addPoint(x, y);
        }
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.getPoint = function(i) {
        i = i < 0 ? this.points.length + i : i;
        return this.points[i] || null;
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.addPoint = function(x, y) {
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
        var lastPoint = this.getPoint(-1);
        return lastPoint && lastPoint.isEqual(this.getPoint(0));
    };

    // -------------------------------------------------------------------------

    lw.svg.Path.prototype.close = function() {
        if (! this.isClosed()) {
            var lastPoint = this.getPoint(-1);
            this.addPoint(lastPoint.x, lastPoint.y);
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

    lw.svg.Parser.prototype.parseTagAttrs = function(tag) {
        // Get tag attributes
        var attrs = tag.node.attributes;

        if (! attrs) {
            return null;
        }

        // For each attribute
        for (var attr, value, i = 0, il = attrs.length; i < il; i++) {
            // Current attribute
            attr = attrs[i];

            // Normalize attribute value
            value = this.normalizeTagAttr(attr);

            // Set new attribute name/value
            tag.setAttr(attr.nodeName, value);
        }
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype.parseTag = function(tag) {
        // Parse tag attributes
        this.parseTagAttrs(tag);

        // Get internal parser from node name (_svg, _g, etc...)
        var parser = this['_' + tag.name.replace(/^#/, '_')];

        // Not parser...
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
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_L = function(tag, points) {
        this.info('Trace line:', points);
        tag.traceLine(points);
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path_Z = function(tag) {
        this.info('Close path!');
        tag.closePath();
        tag.endPath();
    };

    // -------------------------------------------------------------------------

    lw.svg.Parser.prototype._path = function(tag) {
        // Get the paths data attribute value
        var dAttr = tag.getAttr('d').trim();

        // Split on each commands
        var commands = dAttr.match(/([M|Z|L|H|V|C|S|Q|T|A]+([^M|Z|L|H|V|C|S|Q|T|A]+)?)/gi);

        if (! commands) {
            this.warning('Empty path data:', tag.name, tag);
            return null;
        }

        // Debug...
        this.debug('dAttr:', dAttr);
        this.debug('commands:', commands);

        // For each command...
        var commandParser = null;
        var commandChar   = null;
        var commandParams = null;

        commands.some(function(command) {
            // Remove trailing whitespaces
            command = command.trim();

            // Extract command chars
            commandChar = command[0];
            command     = command.substr(1).trim();

            // Get internal parser from node name (_svg, _g, etc...)
            commandParser = this['_path_' + commandChar];

            // Not parser...
            if (! commandParser) {
                this.warning('Unsupported command:', commandChar, tag);
                return false;
            }

            // Split command string on whitespaces or commas
            commandParams = command.split(/[\s,]/);

            // Call command parser
            //this.debug(commandChar, commandParams);
            commandParser.call(this, tag, commandParams);

        }, this);

        // Close last path
        tag.endPath();

        this.debug(tag);
    };

    // -------------------------------------------------------------------------

    // End Parser
})();
