// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // STL slice modal template
    lw.templates['stlslice-modal'] = `

        <div id="stlslice" class="modal fade" role="dialog">
            <div class="modal-dialog modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">STL: Convert to Layers</h4>
                    </div>
                    <div class="modal-body">
                        <p>Please specify thickness of layers to cut from this STL.</p>
                        <form class="form-horizontal">
                            <label for="inflateVal" class="control-label">Layer Height:</label>
                            <div class="btn-group btn-group-justified" role="group" aria-label="stltab">
                                <div class="input-group">
                                    <input id="layerheight" type="number" step="0.1" class="form-control  numpad input-sm" value="1.5" style="text-align:right;" />
                                    <span class="input-group-addon">mm</span>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <div class="btn-group" role="group">
                            <button id="generateslices" type="button" class="btn btn-success btn-block" onclick="generateSlices();">Slice STL</button>
                        </div>
                        <div class="btn-group" role="group">
                            <button id="generateslices" type="button" class="btn btn-default btn-block" onclick="$('#stlslice').modal('hide');">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div><!-- #stlslice -->

    `;

})();
