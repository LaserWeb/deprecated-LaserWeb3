// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Layers tabs template
    lw.templates['layers-tabs'] = `

        <table>
            <tr>
                <td>
                    <span id="openbutton" class="btn btn-primary btn-lg btn-file" title="Open a png, .jpg, .jpeg, .bmp, .gcode, .tap, .nc, .gc, .svg, .dxf, or .stl file">
                        <i class="fa fa-folder-open fa-fw"></i> Open
                        <input id="file" type="file" accept=".png,.jpg,.jpeg,.bmp,.gcode,.g,.svg,.dxf,.stl,.tap,.gc,.nc" multiple />
                    </span>
                </td>
                <td>
                    <ul id="tabsLayers" class="nav nav-tabs" accesskey="">
                        <li id="allView" role="presentation" class="active layertab">
                            <a href="#">All Layers</a>
                        </li>
                        <li id="gCodeView" role="presentation" class="layertab">
                            <a href="#">GCODE View</a>
                        </li>
                    </ul>
                </td>
            </tr>
        </table> <!-- layers tabs -->

    `;

})();
