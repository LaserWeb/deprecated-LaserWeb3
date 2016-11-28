// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Mode switch modal template
    lw.templates['mode-switch-modal'] = `

        <div id="mode-switch-modal" class="modal fade" role="dialog">
            <div class="modal-dialog">
                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">
                            <span class="cncMode">CNC Mode Activated</span>
                            <span class="laserMode">Laser Mode Activated</span>
                        </h4>
                    </div>
                    <div class="modal-body">
                        <div class="cncMode">
                            <p>Note: You have activated <b>CNC mode</b> from <kbd>Settings</kbd> -> <kbd>Tools</kbd> -> <kbd>Enable CNC Cam</kbd></p>
                            <p>While in CNC mode, Laser Raster Engraving is not enabled. Please only open GCODE, DXF or SVG files.</p>
                            <hr />
                            <p>To revert to Laser Mode, go to <kbd>Settings</kbd> -> <kbd>Tools</kbd> -> <kbd>Enable CNC Cam</kbd>, and change it to <kbd>Disable</kbd></p>
                            <hr />
                            <p>Please help us improve this experimental feature by giving feedback, asking for improvements, sharing ideas and posting bugs in the <a class='btn btn-sm btn-success' target='_blank' href='https://plus.google.com/communities/115879488566665599508'>Support Community</a></p>
                        </div>
                        <div class="laserMode">
                            <p>Note: You have activated <b>Laser mode</b> from <kbd>Settings</kbd> -> <kbd>Tools</kbd> -> <kbd>Enable CNC Cam</kbd></p>
                            <hr />
                            <p>To revert to CNC Mode, go to <kbd>Settings</kbd> -> <kbd>Tools</kbd> -> <kbd>Enable CNC Cam</kbd>, and change it to <kbd>Enable</kbd></p>
                        </div>
                    </div>
                    <div class="modal-footer"></div>
                </div>
            </div>
        </div><!-- #mode-switch-modal -->

    `;

})();
