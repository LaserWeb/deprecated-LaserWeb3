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
        lw.numpad.init();
        lw.viewer.init();
        lw.dxf.loadFonts();

        // Check if update available
        this.checkUpdate();

        // Init progressbar
        NProgress.configure({ showSpinner: false });

        // Init fullscreen toggle
        $('#toggleFullScreen').on('click', lw.toggleFullScreen);
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
