// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // SD upload modal template
    lw.templates['sdupload-modal'] = `

        <div id="sdupload" class="modal fade" role="dialog">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">SD Card: Upload (and run File)</h4>
                    </div>
                    <div class="modal-body">
                        <form class="form-horizontal">
                            <label class="control-label">Filename to save-as on the SD Card:</label>
                            <div class="input-group">
                                <span class="input-group-addon">Filename: </span>
                                <input id="saveasname" type="text" class="form-control input-lg" value="job" style="text-align:right;" />
                                <span class="input-group-addon">.gcode</span>
                            </div>
                        </form>
                        <br />
                        <h4>NB:  Jul 2016: NOT IMPLEMENTED YET</h4>
                        <p>See: <a href="https://github.com/openhardwarecoza/LaserWeb3/issues/16">https://github.com/openhardwarecoza/LaserWeb3/issues/16</a></p>
                    </div>
                    <div class="modal-footer">
                        <div class="btn-group">
                            <button id="uploadsdbtn" type="button" class="btn btn-sd btn-default">
                                <span class="fa-stack fa-1x">
                                    <i class="fa fa-upload fa-stack-1x"></i>
                                    <strong class="fa-stack-1x icon-top-text">Upload</strong>
                                    <strong class="fa-stack-1x icon-bot-text">to SD</strong>
                                </span>
                            </button>
                        </div>
                        <div class="btn-group">
                            <button id="playsdbtn" type="button" class="btn btn-sd btn-default">
                                <span class="fa-stack fa-1x">
                                    <i class="fa fa-play fa-stack-1x"></i>
                                    <strong class="fa-stack-1x icon-top-text">Upload</strong>
                                    <strong class="fa-stack-1x icon-bot-text">and Run</strong>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div><!-- #sdupload -->

    `;

})();
