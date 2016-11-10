// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Tree CAM menu panel template
    lw.templates['tree-cam-menu-panel'] = `

        <div id="tree-cam-menu-panel" class="mobtab" style="display: none; height: 98%;">
            <div class="panel panel-danger" style="height: 18%;">
                <div class="panel-heading"><label>Work In Progress</label></div>
                <div class="panel-body" style="height:calc(100% - 56px); overflow-y:scroll;">This Tree based CAM is not implemented yet. Check back soon, for now, use CAM menu on the left. See <a href="https://github.com/openhardwarecoza/LaserWeb3/issues/52" target="_blank">issue 52</a> for progress...</div>
            </div>
            <div class="panel panel-success" style="height: 38%;">
                <div id="filetreeheader" class="panel-heading"></div>
                <div id="filetree" class="panel-body" style="height:calc(100% - 56px); overflow-y:scroll;"></div>
            </div>
            <div class="panel panel-success" style="height: 38%;">
                <div id="toolpathtreeheader" class="panel-heading"></div>
                <div id="toolpathtree" class="panel-body" style="height:calc(100% - 56px); overflow-y:scroll;"></div>
            </div>
        </div><!-- #tree-cam-menu-panel -->

    `;

})();
