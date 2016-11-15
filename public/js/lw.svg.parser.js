// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    var _PI2_ = 2 * Math.PI;

    // -------------------------------------------------------------------------

    lw.svg.Vertex = function(x, y) {
        this.x = x;
        this.y = y;
    };

    // -------------------------------------------------------------------------

    lw.svg.Tag = function(node, parent) {
        this.node     = node;
        this.name     = node.nodeName.toLowerCase();
        this.parent   = parent || null;
        this.children = [];
        this.attrs    = {};
        this.vertices = [];

        // Clone parent attributes
        if (this.parent) {
            var parentAttrs = this.parent.attrs;

            for (var attrName in parentAttrs) {
                if (parentAttrs.hasOwnProperty(attrName)) {
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
        this.vertices.push(new lw.svg.Vertex(x, y));
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

        // Let the fun begin
        this.entities = this.parseNode(rootNode);

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
    lw.svg.Parser.prototype.parseNode = function(node, parent) {
        // Create base tag
        var tag = new lw.svg.Tag(node, parent);

        // Parse tag attributes
        this.parseTagAttrs(tag);

        // Unsupported tag ?
        if (! this.parseTag(tag)) {
            return null;
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

        // TODO...
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

        for (var theta = 0; theta < _PI2_; theta += step) {
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

        for (var theta = 0; theta < _PI2_; theta += step) {
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

    /*
    lw.svg.Parser.prototype._title = function(tag) {};

    lw.svg.Parser.prototype._desc = function(tag) {};

    lw.svg.Parser.prototype._metadata = function(tag) {};

    lw.svg.Parser.prototype._defs = function(tag) {};

    lw.svg.Parser.prototype._style = function(tag) {};

    lw.svg.Parser.prototype._path = function(tag) {};

    lw.svg.Parser.prototype._text = function(tag) {};

    lw.svg.Parser.prototype._image = function(tag) {};
    */

    // End svg scope
})();
