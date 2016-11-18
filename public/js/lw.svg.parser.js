// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // -------------------------------------------------------------------------

    lw.svg.Tag = function(node, parent) {
        // Init properties
        this.node     = node;
        this.name     = node.nodeName.toLowerCase();
        this.parent   = parent || null;
        this.attrs    = {};
        this.children = [];
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
        var parser = this['_' + tag.name];

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

        // Handled tag
        return true;
    };

    // -------------------------------------------------------------------------

    // End Parser
})();
