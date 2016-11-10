// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Menu scope
    lw.menu = {};

    // Local vars
    var $mobtab       = $('.mobtab');
    var $leftmenuitem = $('.leftmenuitem');

    // Menu Initialization
    lw.menu.init = function() {
        // For each menu item
        $leftmenuitem.each(function(i, item) {
            // Get and set item name from id
            item.name = item.id.substr(0, item.id.length - 5);

            // Register event handler
            $('#' + item.name + '-menu').click(function() {
                lw.menu.show(this.name);
            });
        });
    }

    // Make tab active and disable all others
    lw.menu.show = function(itemName) {
        // Get item menu and panel ids
        var itemId  = '#' + itemName + '-menu';
        var panelId = itemId + '-panel';

        // Desactivate all
        $mobtab.hide();
        $leftmenuitem.removeClass('active');

        // Activate selected
        $(itemId).addClass('active');
        $(panelId).show();
    }

// End menu scope
})();
