// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Status modal template
    lw.templates['status-modal'] = `

        <div id="statusmodal" class="modal fade" role="dialog">
            <div class="modal-dialog">
                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title" id="statusTitle">Status Title</h4>
                    </div>
                    <div class="modal-body">
                        <div id="statusBody"></div>
                        <div id="statusBody2"></div>
                    </div>
                    <div class="modal-footer"></div>
                </div>
            </div>
        </div><!-- #statusmodal -->

    `;

})();
