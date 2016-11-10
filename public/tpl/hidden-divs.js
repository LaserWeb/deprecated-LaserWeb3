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

        <video id="monitor" autoplay width="160" height="120" style="display: none; visibility: hidden; float:left;"></video>

        <canvas id="videoImage" width="160" height="120" style="display: none; visibility: hidden; float:left;"></canvas>

        <img id="imageDetect" crossOrigin width="160" height="120" style="display: none; visibility: hidden; float:left;" /></canvas>

        <div id="work-area" style="display: none; visibility: hidden; float:left;">
            <div id="svgpreview"></div>
        </div>

        <div class="canvas" id="rasterOutput" style="display: none;">
            <canvas id="canvas-1"></canvas>
        </div>

    `;

})();
