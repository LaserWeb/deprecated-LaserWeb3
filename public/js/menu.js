// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Menu scope
    lw.menu = {};

    // Menu items
    lw.menu.items = [
        'cam',
        'settings',
        'gcode',
        'quote',
        'tree-cam',
        'jog',
        'stats'
    ];

    // Menu Initialization
    lw.menu.init = function() {
        // Each menu name gets an id handler of this pattern: #[menuname]-menu
        this.items.forEach(function(itemName) {
            $('#' + itemName + '-menu').click(function() {
                lw.menu.show(itemName);
            });
        });
    }

    // Make tab active and disable all others
    lw.menu.show = function(itemName) {
        var itemId  = '#' + itemName + '-menu';
        var panelId = itemId + '-panel';

        $('.mobtab').hide();
        $('.leftmenuitem').removeClass('active');
        $(itemId).addClass('active');
        $(panelId).show();
    }

// End menu scope
})();
