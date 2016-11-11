// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // log scope
    lw.log = {};

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

    // Get the console elements
    var $console      = $('#console');
    var $consoleItems = $console.children('p');

    // Print log...
    lw.log.print = function(text, type, logclass) {
        // Trim and replace new line chars with "br" HTML tag
        text = text.trim().replace(/\n/g, "<br />");

        // If log lines limit reached...
        if ($consoleItems.length > 300) {
            // remove oldest if already at 300 lines
            $consoleItems.first().remove();
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
        $console.append(template);

        // Scroll to line
        $console.scrollTop($console[0].scrollHeight - $console.height());
    };

// End menu scope
})();
