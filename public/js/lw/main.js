// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // -------------------------------------------------------------------------

    lw.init = function() {
        lw.log.init();
        lw.store.init();
        lw.file.init();
        lw.menu.init();
        lw.quote.init();
        lw.numpad.init();
        lw.viewer.init();
        lw.dxf.loadFonts();

        // Check if update available
        this.checkUpdate();

        // Init progressbar
        NProgress.configure({ showSpinner: false });

        // Enable CNC mode
        this.enableCNCMode();

        // Enable machine control
        this.initMachineControl();

        // On mode change
        lw.store.on('change', function(item) {
            if (item.name === 'cncMode') {
                this.enableCNCMode(item.value !== 'Disable', true);
            }
        }, this);

        // Init tooltips
        $(document).tooltip();
        $(document).click(function() {
            $(this).tooltip("option", "hide", { effect: "clip", duration: 500 })
            .off("focusin focusout");
        });

        // Command Console History
        $("#command").inputHistory({ enter: function () {
            sendGcode($('#command').val());
        }});

        // Init some UI events handlers
        $('#viewReset').on('click', function() {
            lw.viewer.reset();
        });

        $('#savesettings').on('click', function() {
            lw.store.refreshStore();
        });

        $('#backup').on('click', function() {
            lw.store.saveFile();
        });

        $('#toggleFullScreen').on('click', function() {
            lw.toggleFullScreen();
        });
    };

    // -------------------------------------------------------------------------

    lw.enableMachineControl = function(enable) {
        if (! arguments.length) {
            enable = lw.store.get('safetyLockDisabled', 'Disable') !== 'Disable';
        }

        $('#controlmachine').toggle(! enable);
        $('#armmachine').toggle(enable);

        return enable;
    };

    // -------------------------------------------------------------------------

    lw.initMachineControl = function() {
        // Init arm machine control
        this.enableMachineControl();

        lw.store.on('refreshStore', function(item) {
            this.enableMachineControl();
        }, this);

        $('#armpin').pincodeInput({
            inputs    : 4,
            hideDigits: true,
            complete  : function(value) {
                if (value !== lw.store.get('armpin',  '1234')) {
                    $("#armerror").html("Code incorrect");
                }
                else {
                    $('#controlmachine').toggle(true);
                    $('#armmachine').toggle(false);
                }
            }
        });

        $('#setarmpin').pincodeInput({
            inputs    : 4,
            hideDigits: false,
            complete  : function(value) {
                lw.store.set('armpin', value);
                $("#setpinmsg").html("<h3>Pin set to " + value + "</h3>");
                setTimeout(function(){ $('#pinresetmodal').modal('hide') }, 1500);
            }
        });
    };

    // -------------------------------------------------------------------------

    lw.enableCNCMode = function(enable, show) {
        if (! arguments.length) {
            enable = lw.store.get('cncMode', 'Disable') !== 'Disable';
        }

        document.title = enable ? 'CNCWeb' : 'LaserWeb';

        var $modal = $("#mode-switch-modal");

        $modal.find('.laserMode').toggle(! enable);
        $modal.find('.cncMode').toggle(enable);
        show && $modal.modal('show');
    };

    // -------------------------------------------------------------------------

    lw.checkUpdate = function() {
        var version = $('meta[name=version]').attr("content");

        $.get("https://raw.githubusercontent.com/openhardwarecoza/LaserWeb3/master/version.txt", function(data) {
            lw.log.print("Version currently Installed : " + version , 'message', "git")
            lw.log.print("Version available online on Github : " + data , 'message', "git")
            if (parseInt(version) < parseInt(data)) {
                lw.log.print("<b><u>NB:  UPDATE AVAILABLE!</u></b>  - Execute 'git pull' from your laserweb terminal " , 'error', "git")
            }
            else {
                lw.log.print("Your version of LaserWeb is Up To Date! " , 'success', "git")
            }
        });
    };

    // -------------------------------------------------------------------------

    lw.toggleFullScreen = function() {
        if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
            if (document.documentElement.requestFullScreen) {
                document.documentElement.requestFullScreen();
            }
            else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            }
            else if (document.documentElement.webkitRequestFullScreen) {
                document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }

            lw.log.print('Going Fullscreen', 'success', "fullscreen");
        }
        else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }

            lw.log.print('Exiting Fullscreen', 'success', "fullscreen");
        }
    }

})();
