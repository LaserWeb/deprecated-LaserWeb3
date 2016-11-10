// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Status modal template
    lw.templates['tracing-modal'] = `

        <div id="tracingmodal" class="modal fade" role="dialog">
            <div class="modal-dialog modal-sm">
                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title">Please Wait</h4>
                    </div>
                    <div class="modal-body">
                        <i class="fa fa-cog fa-spin"></i>
                        Tracing outlines...
                    </div>
                    <div class="modal-footer"></div>
                </div>
            </div>
        </div><!-- tracing modal -->

    `;

})();
