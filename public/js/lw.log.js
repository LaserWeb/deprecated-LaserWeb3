// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // -------------------------------------------------------------------------

    // log scope
    lw.log = {
        name    : 'log',
        $console: null,
        $items  : null
    };

    // Log colors
    lw.log.colors = {
        message: '#000000',
        success: '#00aa00',
        warning: '#ff6600',
        error  : '#cc0000'
    };

    // Icons
    lw.log.icons = {
        settings  : 'cogs',
        file      : 'file-text-o',
        google    : 'google',
        jog       : 'arrows',
        macro     : 'th-large',
        fullscreen: 'fullscreen',
        raster    : 'file-image-o',
        usb       : 'usb',
        wifi      : 'wifi',
        viewer    : 'search',
        git       : 'github',
    };

    // -------------------------------------------------------------------------

    // Logging initialization
    lw.log.init = function() {
        // Get the console elements
        this.$console = $('#console');
        this.$items   = this.$console.children('p');
    };

    // -------------------------------------------------------------------------

    // Print log...
    lw.log.print = function(text, type, logclass) {
        // Trim and replace new line chars with "br" HTML tag
        text = text.trim().replace(/\n/g, "<br />");

        // If log lines limit reached...
        if (this.$items.length > 300) {
            // remove oldest if already at 300 lines
            this.$items.first().remove();
        }

        // Start line template
        var color    = this.colors[type] || this.colors.message;
        var template = '<p class="pf" style="color: ' + color + ';">';

        // Append icon if defined
        if (logclass && this.icons[logclass]) {
            template += '<i class="fa fa-' + this.icons[logclass] + ' fa-fw" aria-hidden="true"></i>:&nbsp;';
        }

        // Append text
        template += text + '</p>';

        // Add new log line
        this.$console.append(template);

        // Scroll to line
        this.$console.scrollTop(this.$console[0].scrollHeight - this.$console.height());
    };

    // -------------------------------------------------------------------------

    // Add logging methods to target object
    lw.log.bind = function(object) {
        // Set logging Prefix
        object.loggingPrefix = object.loggingPrefix || object.name || 'log';

        // Console log
        object.console = function(type, args) {
            if (this.logging) {
                // Prepend logging message prefix
                args.unshift('lw.' + this.loggingPrefix + ':');

                // Call the console method
                console[type].apply(console, args);
            }
        };

        // Console methods
        object.log = function() {
            this.console('log', Array.prototype.slice.call(arguments));
        };

        object.debug = function() {
            this.console('debug', Array.prototype.slice.call(arguments));
        };

        object.info = function() {
            this.console('info', Array.prototype.slice.call(arguments));
        };

        object.warning = function() {
            this.console('warn', Array.prototype.slice.call(arguments));
        };

        object.error = function() {
            this.console('error', Array.prototype.slice.call(arguments));
        };

        // Group start
        object.logStart = function(title) {
            if (this.logging) {
                if (console.groupCollapsed) {
                    console.groupCollapsed(title);
                }
                else {
                    console.group(title);
                }
            }
        };

        // Group end
        object.logEnd = function() {
            if (this.logging) {
                console.groupEnd();
            }
        };
    };

// End menu scope
})();
