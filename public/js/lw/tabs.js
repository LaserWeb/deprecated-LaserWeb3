// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Tabs scope
    lw.tabs = {
        items: {}
    };

    // -----------------------------------------------------------------------------

    lw.tabs.init = function() {
        this.$tabs = $('#tabsLayers');
        this.clear();
    };

    // -----------------------------------------------------------------------------

    lw.tabs.clear = function() {
        this.items = {};
        this.$tabs.empty();
        this.add('allView', 'All Layers', true, false);
        this.add('gCodeView', 'GCODE View', false, false);
    };

    // -----------------------------------------------------------------------------

    lw.tabs.add = function(id, label, active, removable) {
        // Create tab item
        var $tab  = $('<li id="' + id + '" class="layertab"></li>');
        var $link = $('<a href="#">' + label + '</a>');

        if (removable || removable === undefined) {
            var $close = $('<button class="close" type="button" title="Remove this page">×</button></a>');

            $close.data('target', id);

            $close.on('click', function(event) {
                lw.tabs.remove($(this).data('target'));
            });

            $link.append($close);
        }

        $tab.append($link);

        // Add tab item
        this.items[id] = $tab;
        this.$tabs.append($tab);

        // Select tab item
        active && this.select(id);

        // Register events handlers
        $tab.on('click', function() {
            lw.tabs.select(this.id);
        });
    };

    // -----------------------------------------------------------------------------

    lw.tabs.remove = function(id) {
        // Get the item
        var $item = this.items[id];

        // Not found
        if (! $item) {
            return;
        }

        // Remove object from scene
        lw.viewer.removeObject(id);

        // Remove item
        delete this.items[id];
        $item.remove();

        // Select last item if removed is active
        if ($item.hasClass('active')) {
            this.select();
        }
    };

    // -----------------------------------------------------------------------------

    lw.tabs.select = function(id) {
        // Get the item
        var $item = this.items[id];

        // Not found
        if (! $item) {
            var items = Object.values(this.items);
            var item  = items[items.length - 1];
            this.select(item[0].id);
            return;
        }

        // Show only this object
        if (id !== 'allView') {
            lw.viewer.showObjectAlone(id);
        }
        else {
            lw.viewer.showAllObjects();
        }

        // Desactivate all
        this.$tabs.find('.layertab').removeClass('active');

        // Activate item
        $item.addClass('active');
    };

    // End tabs scope
})();
