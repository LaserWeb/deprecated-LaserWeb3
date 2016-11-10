// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // PIN reset modal template
    lw.templates['pinreset-modal'] = `

        <div id="pinresetmodal" class="modal fade" role="dialog">
            <div class="modal-dialog modal-sm">
                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Reset Arm/Disarm Pin</h4>
                    </div>
                    <div class="modal-body">
                        Enter the new PIN<br />
                        <input type="text" id="setarmpin" /><br />
                        <span id="setpinmsg"></span>
                    </div>
                    <div class="modal-footer"></div>
                </div>
            </div>
        </div><!-- #pinresetmodal -->

    `;

})();
