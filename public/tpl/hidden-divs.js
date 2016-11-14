// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Empty template
    lw.templates['hidden-divs'] = `

        <div id="draganddrop" style="display: none;">
            <div class="well">Drop File(s) Here!</div>
            <img src="images/draganddrop.svg" />
        </div><!-- #draganddrop -->

        <div class="canvas" id="rasterOutput" style="display: none;">
            <canvas id="canvas-1"></canvas>
        </div>

    `;

})();
