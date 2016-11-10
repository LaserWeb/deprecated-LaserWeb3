// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // CAM menu panel template
    lw.templates['cam-menu-panel'] = `

        <div id="cam-menu-panel" class="mobtab" style="display: none;">
            <div id="filestatus" class="bs-callout bs-callout-danger">
                <h4>CAM: Convert to G-CODE</h4>
                <h3><i class="fa fa-fw fa-exclamation"></i> No File to work with</h3>
                <p>
                    Please <a href="#" onclick="$('#file').click()">open a file from the "Open" button</a>:<br />
                    SVG (Paths only, single group), DXF (R14 Lines/Polylines/Circles), BMP/PNG/JPEG (Raster Engraving) and GCODE (External CAM) are all supported.
                </p>
            </div>
            <div class="btn-group btn-group-justified" role="group" aria-label="gengcode">
                <div class="btn-group" role="group">
                    <button id="generategcode" type="button" class="btn btn-success btn-block">Generate G-Code</button>
                </div>
            </div>
            <div id="tooloptions"></div>
            <div id="layerprep"></div>
        </div><!-- #cam-menu-panel -->

    `;

})();
