// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Stats menu panel template
    lw.templates['stats-menu-panel'] = `

        <div id="stats-menu-panel" class="mobtab" style="display: none;">
            <h4>Statistics</h4>
            <form class="form-horizontal">
                <label for="accumulatedtime" class="control-label">Accumulated Job Time</label>
                <div class="input-group">
                    <input id="accumulatedtime" type="text" class="form-control" value="0" readonly />
                    <span class="input-group-addon">HH:MM:SS</span>
                </div>
                <hr />
                <div class="btn-group" role="group">
                    <a id="resetAccumulatedTime" class="btn btn-md btn-warning" onclick="resetAccumulatedTime()">
                        <i class="fa fa-clock-o"></i> Reset Accumulated Time
                    </a>
                </div>

            </form>
            <br />
        </div><!-- #stats-menu-panel -->

    `;

})();
