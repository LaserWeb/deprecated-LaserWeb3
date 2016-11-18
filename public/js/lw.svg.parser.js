// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // -------------------------------------------------------------------------

    // SVG Parser class
    lw.svg.Parser = function(svg, settings) {
        // Defaults settings
        var settings = settings || {};

        // Init properties
        this.settings = settings;
        this.svg      = null;
        this.editor   = null;
        this.tags     = null;

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

    // Parse SVG node (recursive)
    lw.svg.Parser.prototype.parseNode = function(node, parent) {
        console.log('parseNode:', node, parent);
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

        // Parse SVG node (recursive)
        this.tags = this.parseNode(rootNode);

        // return tags collection
        return this.tags;
    };

    // -------------------------------------------------------------------------

    // End Parser
})();
