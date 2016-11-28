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

        // Init progressbar
        NProgress.configure({ showSpinner: false });

        // Init fullscreen toggle
        $('#toggleFullScreen').on('click', lw.toggleFullScreen);
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
