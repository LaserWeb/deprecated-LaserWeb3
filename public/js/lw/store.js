// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Store scope
    lw.store = {
        name   : 'store',
        logging: true
    };

    // Store settings
    // [paramName, required]
    lw.store.params = [
        ['rapidspeed'        , true],
        ['subnet1'           , false],
        ['subnet2'           , false],
        ['subnet3'           , false],
        ['wifisubnet1'       , false],
        ['wifisubnet2'       , false],
        ['wifisubnet3'       , false],
        ['smoothieIp'        , false],
        ['laserXMax'         , true],
        ['laserYMax'         , true],
        ['spotSize'          , true],
        ['startgcode'        , false],
        ['laseron'           , false],
        ['laseroff'          , false],
        ['lasermultiply'     , true],
        ['homingseq'         , true],
        ['endgcode'          , false],
        ['imagePosition'     , true],
        ['useNumPad'         , true],
        ['useVideo'          , true],
        ['videoWidth'        , false],
        ['cncMode'           , true],
        ['webcamUrl'         , false],
        ['defaultDPI'        , true],
        ['illustratorDPI'    , false],
        ['inkscapeDPI'       , false],
        ['defaultBitmapDPI'  , true],
        ['safetyLockDisabled', false],
        ['optimisegcode'     , false]
    ];

    // Callbacks collection
    lw.store.callbacks = [];

    // -------------------------------------------------------------------------

    // Store initialization
    lw.store.init = function() {
        // Bind logging methods
        lw.log.bind(this);

        // Load all settings from local storage
        this.refreshForm();

        // Check if all required settings are loaded
        lw.store.checkParams();

        // Register event handler
        $('#jsonFile').on('change', function(event) {
            lw.store.loadFile(event.target.files[0]);
        });
    };

    // -------------------------------------------------------------------------

    // Register an callback
    lw.store.on = function(event, callback, context) {
        // Create event callbacks collection
        if (! this.callbacks[event]) {
            this.callbacks[event] = [];
        }

        var callbacks = this.callbacks[event];
            callback  = [callback, context || null];

        // If not already registered
        if (callbacks.indexOf(callback) === -1) {
            callbacks.push(callback);
        }
    };

    // Trigger an event
    lw.store.trigger = function(event, data) {
        // If event defined
        if (this.callbacks[event]) {
            // For each callback
            this.callbacks[event].forEach(function(callback) {
                callback[0].call(callback[1] || lw.store, data);
            });
        }
    };

    // -------------------------------------------------------------------------

    // Set setting item in local storage
    lw.store.set = function(name, value) {
        var oldValue = this.get(name, undefined);
        this.trigger('set', { name: name, value: value, oldValue: oldValue });
        if (oldValue !== value) {
            this.trigger('change', { name: name, value: value, oldValue: oldValue });
        }
        localStorage.setItem(name, value);
    };

    // Get setting item from local storage or default value if provided
    // Optionally set the default value if provided and not already defined
    lw.store.get = function(name, defaultValue, setDefaultValue) {
        var value = localStorage.getItem(name);

        if (value === null) {
            value = defaultValue;

            if (setDefaultValue && value !== undefined) {
                this.set(name, value);
            }
        }

        return value;
    };

    // -------------------------------------------------------------------------

    // (Re)load all settings from local storage and populate the form
    lw.store.refreshForm = function() {
        this.logStart('Loading settings from LocalStorage');

        // Param
        var name, value;

        // For each declared param
        this.params.forEach(function(param) {
            // Get param name and value
            name  = param[0];
            value = this.get(name);

            if (value) {
                $('#' + name).val(value);
                this.info(name + ':', value);
            }
            else {
                this.warning(name + ':', 'undefined');
            }
        }, this);

        this.logEnd();
    };

    // (Re)load all settings from the form and populate the localStorage
    lw.store.refreshStore = function() {
        this.logStart('Saving settings to LocalStorage');

        // Param
        var name, value;

        // For each declared param
        this.params.forEach(function(param) {
            // Get param name and value
            name  = param[0];
            value = $('#' + name).val();

            // Update store value
            this.set(name, value);

            this.log('Saving: ' + name + ' : ' + value);
            lw.log.print('Saving: ' + name + ' : ' + value, 'success');
        }, this);

        this.logEnd();
        lw.log.print('<b>Saved Settings: <br>NB:</b> Please refresh page for settings to take effect', 'error', 'settings');
    };

    // -------------------------------------------------------------------------

    // (Re)load settings from JSON file
    lw.store.loadFile = function(file) {
        this.log('Restore settings from ' + file.name);

        // Create file reader
        var reader = new FileReader();

        // On file loaded
        reader.onload = function(event) {
            // Get and parse JSON text
            var text = event.target.result;
            var json = JSON.parse(text);

            // Param
            var name, value;

            // For each declared param
            lw.store.params.forEach(function(param) {
                // Get param name
                name = param[0];

                // If defined in JSON object
                if (json.hasOwnProperty(name)) {
                    // Update local setting
                    lw.store.set(name, json[name]);
                }
            });

            // Refresh the Form
            lw.store.refreshForm();
        };

        // Read the file as text
        reader.readAsText(file);
    };

    // Make and download a backup file
    lw.store.saveFile = function() {
        var json = JSON.stringify(localStorage, null, '  ');
        var blob = new Blob([json], {type: 'application/json'});
        lw.file.saveAs(blob, 'laserweb-settings-backup.json');
    };

    // -------------------------------------------------------------------------

    // Check if all required settings are loaded
    lw.store.checkParams = function() {
        lw.log.print('<b>Checking whether you have configured LaserWeb :</b><p>', 'message', 'settings');

        var anyissues = false;
        $('#settingsstatus').hide();

        // Param
        var name, required, value;

        // For each declared param
        lw.store.params.forEach(function(param) {
            // Get param name, value and if required
            name     = param[0];
            required = param[1];
            value    = $('#' + name).val();

            if (! value) {
                if (required) {
                    anyissues = true;
                    lw.log.print('Missing required setting: ' + name, 'error', 'settings');
                }
                else {
                    lw.log.print('Missing optional setting: ' + name, 'warning', 'settings');
                }
            }
            else {
                lw.log.print('Found setting: ' + name + ' : ' + value, 'message', 'settings');
            }
        });

        if (anyissues) {
            lw.log.print('<b>MISSING CONFIG: You need to configure LaserWeb for your setup. </b>. Click <kbd>Settings <i class="fa fa-cogs"></i></kbd> on the left, and work through all the options', 'error', 'settings');
            $('#settingsstatus').show();
            lw.menu.show('settings');
        }
    };

// End menu scope
})();

// FIXME
// A way to access all of the settings
// $('#settings-menu-panel input, #settings-menu-panel textarea, #settings-menu-panel select, #ethernetConnect input').each(function() {console.log(this.id + ': ' + $(this).val())});
