/**
SVG parser for the Lasersaur.
Converts SVG DOM to a flat collection of paths.

Copyright (c) 2011 Nortd Labs
Open Source by the terms of the Gnu Public License (GPL3) or higher.

Code inspired by cake.js, canvg.js, svg2obj.py, and Squirtle.
Thank you for open sourcing your work!

Usage:
var boundarys = SVGReader.parse(file)

Features:
* <svg> width and height, viewBox clipping.
* paths, rectangles, ellipses, circles, lines, polylines and polygons
* nested transforms
* transform lists (transform="rotate(30) translate(2,2) scale(4)")
* non-pixel units (cm, mm, in, pt, pc)
* 'style' attribute and presentation attributes
* curves, arcs, cirles, ellipses tesellated according to tolerance

Intentinally not Supported:
* markers
* masking
* em, ex, % units
* text (needs to be converted to paths)
* raster images
* style sheets

ToDo:
* check for out of bounds geometry
*/

/* Rewrite by skarab */

// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // SVG Reader class
    lw.SVGReader = function(svg, settings) {
        // Defaults settings
        settings           = settings           || {};
        settings.tolerance = settings.tolerance || 0.05;

        // Init properties
        this.svg       = null;
        this.editor    = null;
        this.tolerance = null;
        this.paths     = null;

        // Set the tolerance
        this.setTolerance(settings.tolerance);

        // Load SVG contents
        svg && this.load(svg);
    };

    // -------------------------------------------------------------------------

    // Set the max tollerance when tesselating curvy shapes
    lw.SVGReader.prototype.setTolerance = function(tolerance) {
        this.tolerance = Math.pow(tolerance, 2);
    };

    // -------------------------------------------------------------------------

    // Try to get the file editor
    lw.SVGReader.prototype.fingerprint = function() {
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

    lw.SVGReader.prototype.load = function(svg) {
        // Reset SVG property
        this.svg = null;

        // Clean off any preceding whitespace
        svg = svg.replace(/^[\n\r \t]+/gm, '');

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

    lw.SVGReader.prototype.parse = function(svg) {
        // Reset paths collection
        this.paths = [];

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

        // Let the fun begin
        this.parseNode(rootNode);

        // return paths collection
        return this.paths;
    };

    // -------------------------------------------------------------------------

    // Parse SVG node
    lw.SVGReader.prototype.parseNode = function(node) {
        var i, il, child, parser, data;
        var parser = new TagParser();

        // For each children node
        for (i = 0, il = node.childNodes.length; i < il; i++) {
            // Current child node
            child  = node.childNodes[i];
            data   = parser.parse(child);

            // Unsupported tag
            if (! data) {
                continue;
            }

            // Parse node...
            console.log('-----------------------');
            console.log('node:', i, child);
            console.log('-----------------------');
            console.log('attrs:', parser.attrs);
            console.log('paths:', parser.paths);
            console.log('-----------------------');
        }
    };

    // -------------------------------------------------------------------------

    var TagParser = function(node) {
        // Init properties
        this.node  = null;
        this.attrs = null;
        this.paths = null;

        // Parse node if provided
        node && this.parse(node);
    };

    TagParser.prototype.parse = function(node) {
        // Set new node
        this.node  = node;
        this.attrs = null;
        this.paths = null;

        // Normalize attributes
        this.getAttrs();
        this.getPaths();

        // Return paths
        return this.paths;
    };

    // -------------------------------------------------------------------------

    TagParser.prototype.normalizeAttrName = function(attrName) {
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

    TagParser.prototype.normalizeUnit = function(value) {
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

    TagParser.prototype.normalizeAttrValue = function(attrName, attrValue) {
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

            default:
            break;
        }

        // Return normalized value
        return attrValue;
    };

    // -------------------------------------------------------------------------

    // Try to normalize the color and return an array of int -> [r, g, b, a]
    // Else return the color as text (inherit, none, etc...)
    TagParser.prototype.normalizeColor = function(color) {
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

    TagParser.prototype.getAttrs = function() {
        // ...
        if (! this.node || ! this.node.attributes) {
            return null;
        }

        // Reset attributes
        this.attrs = {};

        // For each attribute
        var i, il, attr, attrName, attrValue, attrStyle;
        var attrs = this.node.attributes;

        for (i = 0, il = attrs.length; i < il; i++) {
            // Current attribute
            attr = attrs[i];

            // Normalize attribute name
            attrName = this.normalizeAttrName(attr.nodeName);

            // Normalize attribute value
            attrValue = this.normalizeAttrValue(attrName, attr.nodeValue);

            // Special case
            if (attrName === 'style') {
                attrStyle = attrValue;
            }
            else {
                // Set new attribute name/value
                this.attrs[attrName] = attrValue;
            }
        }

        // If style attribute (override tag attributes)
        // TODO get/parse global style and override this one...
        if (attrStyle) {
            var style, styles = attrStyle.split(';');

            for (i = 0, il = styles.length; i < il; i++) {
                // Current style
                attr = styles[i].split(':');

                // Normalize attribute name
                attrName = this.normalizeAttrName(attr[0]);

                // Normalize attribute value
                attrValue = this.normalizeAttrValue(attrName, attr[1]);

                // Set new attribute name/value
                this.attrs[attrName] = attrValue;
            }
        }
    };

    // -------------------------------------------------------------------------

    TagParser.prototype.getPaths = function() {
        // ...
        if (! this.node || ! this.node.tagName) {
            return null;
        }

        // Get internal parser
        var parser = this['_' + this.node.tagName.toLowerCase()];

        if (parser) {
            // Reset paths
            this.paths = [];

            // Parse
            parser.call(this);
        }
    };

    // -------------------------------------------------------------------------

    TagParser.prototype.getAttr = function(name, defaultValue) {
        return this.attrs[name] !== undefined ? this.attrs[name]
            : (defaultValue !== undefined ? defaultValue : null);
    };

    // Tags parsers ------------------------------------------------------------

    TagParser.prototype._svg = function() {};

    TagParser.prototype._title = function() {};

    TagParser.prototype._desc = function() {};

    TagParser.prototype._metadata = function() {};

    TagParser.prototype._defs = function() {};

    TagParser.prototype._style = function() {};

    TagParser.prototype._g = function() {};

    TagParser.prototype._line = function() {
        // http://www.w3.org/TR/SVG11/shapes.html#LineElement
        // has transform and style attributes
        var x1 = this.getAttr('x1');
        var x2 = this.getAttr('x2');
        var y1 = this.getAttr('y1');
        var y2 = this.getAttr('y2');

        console.log([x1, x2, y1, y2]);
    };

    TagParser.prototype._polyline = function() {};

    TagParser.prototype._polygon = function() {};

    TagParser.prototype._path = function() {};

    TagParser.prototype._rect = function() {};

    TagParser.prototype._circle = function() {};

    TagParser.prototype._ellipse = function() {};

    TagParser.prototype._text = function() {};

    TagParser.prototype._image = function() {};

    // End svg scope
})();
