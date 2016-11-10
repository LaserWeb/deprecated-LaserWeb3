// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Gcode menu panel template
    lw.templates['gcode-menu-panel'] = `

        <div id="gcode-menu-panel" class="mobtab" style="display: none;">
            <h4>G-CODE</h4>
            <button class="btn btn-lg btn-default btn-file" title="Export GCODE to a file" onclick="saveFile()">
                <i class="fa fa-save fa-fw"></i> Export to File
            </button>
            <form class="form-horizontal">
                <label for="startgcodefinal" class="control-label">Start GCODE</label>
                <textarea id="startgcodefinal" spellcheck="false" style="width: 100%; height: 80px;" disabled></textarea>
            </form>
            <form id="gcodefile" class="form-horizontal" style="display: none;">
                <label for="gcodepreview" class="control-label">GCODE opened from File</label>
                <textarea id="gcodepreview" spellcheck="false" style="width: 100%; height: 80px;" disabled></textarea>
            </form>
            <div id="gcodejobs"></div>
            <form class="form-horizontal">
                <label for="endgcodefinal" class="control-label">End GCODE</label>
                <textarea id="endgcodefinal" spellcheck="false" style="width: 100%; height: 80px;" disabled></textarea>
            </form>
            <nav>
                <ul class="pager">
                    <li class="previous">
                        <a href="#" onclick="$('#cam-menu').click();"><span>&larr;</span> Revise</a>
                    </li>
                    <li class="next">
                        <a href="#" onclick="$('#quote-menu').click();">Costing <span>&rarr;</span></a>
                    </li>
                    <li class="next">
                        <a href="#" onclick="$('#jog-menu').click();">Process <span>&rarr;</span></a>
                    </li>
                </ul>
            </nav>
        </div><!-- #gcode-menu-panel -->

    `;

})();
