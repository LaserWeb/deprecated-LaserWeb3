// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Templates scope
    lw.templates = {};

    // Init all templates
    lw.templates.init = function() {
        for (var id in lw.templates) {
            if (lw.templates.hasOwnProperty(id)) {
                $('[data-template="' + id + '"]').replaceWith(lw.templates[id]);
            }
        }
    };

})();
