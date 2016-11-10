// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Store scope
    lw.store = {
        debug: true
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
        ['cncMode'           , true],
        ['webcamUrl'         , false],
        ['defaultDPI'        , true],
        ['illustratorDPI'    , false],
        ['inkscapeDPI'       , false],
        ['defaultBitmapDPI'  , true],
        ['safetyLockDisabled', false],
        ['optimisegcode'     , false]
    ];

    // -------------------------------------------------------------------------

    // Store console log
    lw.store.log = function() {
        if (this.debug) {
            // Get arguments list as array
            var args = Array.prototype.slice.call(arguments);

            // Prefix with module name
            args.unshift('lw.store:');

            // Call the console log method
            console.log.apply(console, args);
        }
    };

    lw.store.logStart = function(title) {
        if (this.debug) {
            console.groupCollapsed(title);
        }
    };

    lw.store.logEnd = function() {
        if (this.debug) {
            console.groupEnd();
        }
    };

    // -------------------------------------------------------------------------

    // Store initialization
    lw.store.init = function() {
        // Load all settings from local storage
        this.refreshForm();

        // Register event handler
        $('#jsonFile').on('change', function(event) {
            lw.store.loadFile(event.target.files[0]);
        });
    };

    // Set setting item in local storage
    lw.store.set = function(setting, value) {
        localStorage.setItem(setting, value);
    };

    // Get setting item from local storage
    lw.store.get = function(setting) {
        return localStorage.getItem(setting);
    };

    // (Re)load all settings from local storage and populate the form
    lw.store.refreshForm = function() {
        this.logStart('Loading settings from LocalStorage');

        // Param
        var index, name, value;

        // For each declared param
        for (index in this.params) {
            if (! this.params.hasOwnProperty(index)) {
                continue;
            }

            name  = this.params[index][0];
            value = this.get(name);

            if (value) {
                this.log('Loading: ' + name + ' : ' + value);
                $('#' + name).val(value);
            }
            else {
                this.log('Undefined: ' +  name);
            }
        }

        this.logEnd();
    };

    // (Re)load all settings from the form and populate the localStorage
    lw.store.refreshStore = function() {
        this.logStart('Saving settings to LocalStorage');

        // Param
        var index, name, value;

        // For each declared param
        for (index in this.params) {
            if (! this.params.hasOwnProperty(index)) {
                continue;
            }

            name  = this.params[index][0];
            value = $('#' + name).val();

            this.set(name, value);

            this.log('Saving: ' + name + ' : ' + value);
            printLog('Saving: ' + name + ' : ' + value, successcolor);
        }

        this.logEnd();
        printLog('<b>Saved Settings: <br>NB:</b> Please refresh page for settings to take effect', errorcolor, 'settings');
    };

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
            var index, name;

            // For each declared param
            for (index in lw.store.params) {
                // Get param name
                name = lw.store.params[index][0];

                // If defined in JSON object
                if (json.hasOwnProperty(name)) {
                    // Update local setting
                    lw.store.set(name, json[name]);
                }
            }

            // Refresh the Form
            lw.store.refreshForm();
        };

        // Read the file as text
        reader.readAsText(file);
    };

    // Make and download a backup file
    lw.store.backupStore = function() {
        var json = JSON.stringify(localStorage, null, '  ');
        var blob = new Blob([json], {type: 'application/json'});
        invokeSaveAsDialog(blob, 'laserweb-settings-backup.json');
    };

    // Check if all required settings are loaded
    lw.store.checkParams = function() {
        printLog('<b>Checking whether you have configured LaserWeb :</b><p>', msgcolor, 'settings');

        var anyissues = false;
        $('#settingsstatus').hide();

        // Param
        var index, name, required, value;

        // For each declared param
        for (index in this.params) {
            if (! this.params.hasOwnProperty(index)) {
                continue;
            }

            name     = this.params[index][0];
            required = this.params[index][1];
            value    = $('#' + name).val();

            if (! value) {
                if (required) {
                    anyissues = true;
                    printLog('Missing required setting: ' + name, errorcolor, 'settings');
                }
                else {
                    printLog('Missing optional setting: ' + name, warncolor, 'settings');
                }
            }
            else {
                printLog('Found setting: ' + name + ' : ' + value, msgcolor, 'settings');
            }
        }

        if (anyissues) {
            printLog('<b>MISSING CONFIG: You need to configure LaserWeb for your setup. </b>. Click <kbd>Settings <i class="fa fa-cogs"></i></kbd> on the left, and work through all the options', errorcolor, 'settings');
            $('#togglesettings').click();
            $('#settingsstatus').show();
        }
    };

// End menu scope
})();

// FIXME
// A way to access all of the settings
// $('#settings-menu-panel input, #settings-menu-panel textarea, #settings-menu-panel select, #ethernetConnect input').each(function() {console.log(this.id + ': ' + $(this).val())});
