// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Numpad scope
    lw.numpad = {};

    lw.numpad.init = function() {
        // Template
        $.fn.numpad.defaults.gridTpl           = '<table class="table modal-content"></table>';
        $.fn.numpad.defaults.backgroundTpl     = '<div class="modal-backdrop in"></div>';
        $.fn.numpad.defaults.displayTpl        = '<input type="text" class="form-control" />';
        $.fn.numpad.defaults.dblCellTpl        = '<td colspan="2"></td>',
        $.fn.numpad.defaults.buttonNumberTpl   = '<button type="button" class="btn btn-numpad btn-default" style="width: 100%;"></button>';
        $.fn.numpad.defaults.buttonFunctionTpl = '<button type="button" class="btn  btn-numpad" style="width: 100%;"></button>';

        // Enabled at startup ?
        this.enable(lw.store.get('useNumPad') === 'Enable');

        // Enable/Disable on store value change
        lw.store.on('change', function(item) {
            if (item.name === 'useNumPad') {
                this.enable(item.value === 'Enable');
            }
        }, this);
    }

    var disable = function(selector) {
        $(selector).unbind('click')
            .data('numpad', null)
            .attr('data-numpad', null)
            .removeClass('nmpd-target');
    };

    lw.numpad.enable = function(enable) {
        if (! enable) {
            disable('.numpad');
            disable('.numpadgcode');
            return null;
        }

        $('.numpad').numpad({
            decimalSeparator: '.',
            gcode           : false,
            textDone        : 'OK',
            textDelete      : 'Del',
            textClear       : 'Clear',
            textCancel      : 'Cancel',
            headerText      : 'Enter Number',
        });

        $('.numpadgcode').numpad({
            decimalSeparator: '.',
            gcode           : true,
            textDone        : 'OK',
            textDelete      : 'Del',
            textClear       : 'Clear',
            textCancel      : 'Cancel',
            headerText      : 'Enter GCODE',
        });
    };

// End numpad scope
})();
