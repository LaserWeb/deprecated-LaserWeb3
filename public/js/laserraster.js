'use strict';

/*

    AUTHOR:  Peter van der Walt
    Addional work by Nathaniel Stenzel and Sven Hecht

    LaserWeb Raster to GCODE Paperscript
    Copyright (C) 2015 Peter van der Walt

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

var startgcode;
var laseron;
var laseroff;
var lasermultiply;
var homingseq;
var endgcode;


// add MAP function to the Numbers function
Number.prototype.map = function(in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

function Rasterizer(config) {

    this.config = config;

    console.log('[Rasterizer] Width: ' + this.config.imgwidth + '  Height: ' + this.config.imgheight);
    console.log('[Rasterizer] Phys Width: ' + this.config.physicalHeight + '  Height: ' + this.config.physicalWidth);

    // Init some variables we'll be using in the process
    this.path = '';
    this.intensity = '';
    this.moveCount = 0; // Keep count of Gcode lines so we can optimise, lower = better
    this.skip = 0;
    this.dir = 1;
    this.megaPixel = 0;
    this.x = 0;
    this.grayLevel = 0;
    this.startTime = 0;
    this.rasterIntervalTimer = null;

    // GCODE Header
    // var useVariableSpeed = this.config.useVariableSpeed;

    startgcode = $('#startgcode').val();
    laseron = $('#laseron').val();
    laseroff = $('#laseroff').val();
    if ($('#lasermultiply').val()) {
      lasermultiply = $('#lasermultiply').val();
    } else {
      lasermultiply = 100;
      printLog('NB - generated with default value of S100 since you have not yet configured LaserWeb for your machine.  Click that settings button and configure the Max PWM S Value (and all the other settings please).... ', errorcolor, "raster")
    }
    homingseq = $('#homingseq').val();
    endgcode = $('#endgcode').val();

    this.result = [
        '; Raster:',
        // '; Firmware: {0}',
        '; Laser Min: {0}%',
        '; Laser Max: {1}%',
        '; Black Speed: {2}mm/s',
        '; White Speed: {3}mm/s',
        '; Resolution (mm per pixel): {4}mm',
        '; Laser Spot Size: {5}mm',
        '; X Offset: {8}mm',
        '; Y Offset: {9}mm \n',
        'G1 F{7}\n'
    ].join('\n').format(
        this.config.minIntensity,
        this.config.maxIntensity,
        this.config.blackRate,
        this.config.whiteRate,
        this.config.spotSize1,
        this.config.beamSize1,
        this.config.feedRate,
        this.config.rapidRate,
        this.config.xOffset,
        this.config.yOffset);
}

Rasterizer.prototype.figureIntensity = function() {
    var intensity = (1 - this.grayLevel) * 100; //  Also add out Firmware specific mapping using intensity (which is 0-100) and map it between minIntensity and maxIntensity variables above * firmware specific multiplier (grbl 0-255, smoothie 0-1, etc)
    //Constraining Laser power between minIntensity and maxIntensity
    //console.log('Constraining');

    if (parseFloat(intensity) > 0) {
        intensity = intensity.map(0, 100, parseInt(this.config.minIntensity, 10), parseInt(this.config.maxIntensity, 10));
    } else {
        intensity = 0;
    }

    if (parseInt(lasermultiply) <= 1) {
        var intensity = parseFloat(intensity) / 100;
        intensity = parseFloat(intensity).toFixed(2);
    } else {
        var intensity = parseFloat(intensity) * (parseInt(lasermultiply) / 100);
        intensity = intensity.toFixed(0);
    }
    // }

    return intensity;
};

Rasterizer.prototype.figureSpeed = function(passedGrey) {
    var calcspeed = passedGrey * 100;
    //console.log('Figure speed for brightness');

    calcspeed = calcspeed.map(0, 100, parseInt(this.config.blackRate, 10), parseInt(this.config.whiteRate, 10));
    calcspeed = calcspeed.toFixed(0);

    return calcspeed;
};

Rasterizer.prototype.init = function(div) {
    console.log('INIT Container: ', this.config.div)
    this.startTime = Date.now();

    // Initialise
    project.clear();

    // Create a raster item using the image tag 'origImage'
    var container = this.config.div;
    this.raster = new Raster(container);
    this.raster.visible = false;

    // Log it as a sanity check
    console.log('Constraining Laser power between {0}% and {1}%'.format(this.config.minIntensity, this.config.maxIntensity));
    console.log('Height: {0}px, Width: {1}px'.format(this.config.physHeight, this.config.physWidth));
    console.log('Spot Size: {0}mm'.format(this.config.spotSize1));
    console.log('Raster Width: {0} Height: {1}'.format(this.raster.width, this.raster.height));
    console.log('G0: {0}mm/s, G1: {1}mm/s'.format(this.config.rapidRate, this.config.feedRate));
    console.log('Black speed: {0} Whitespeed: {1}'.format(this.config.blackRate, this.config.whiteRate));
    // As the web is asynchronous, we need to wait for the raster to load before we can perform any operation on its pixels.
    this.raster.on('load', this.onRasterLoaded.bind(this));
    console.log('Raster: ', this.raster)
};


Rasterizer.prototype.rasterRow = function(y) {

  // // spotSize1 = size in mm that each physical pixel needs to fill
  // // beamSize1 = size of the laser beam
  // // Since the beam is a physical size, we need to adjust the raster to be more or less big that the actual pixels (either interpolated enlarge, or less detail) so that we have enough (and just enough) data to fill up the Beamsizes
  // // For example:  If I draw a square of 10x10mm at 72dpi,  it only has 28x28 pixels.  If I want to engrave that square with a beam size of 0.1mm I need 100x100 pixels.  So we need to resize the 28x28 raster to 100x100 raster using http://paperjs.org/reference/raster/#size as shown in the example on http://paperjs.org/tutorials/images/using-pixel-colors/
  // var ypixels = ( parseFloat(this.config.physicalHeight) * parseFloat(this.config.beamSize1) );
  // var xpixels = ( parseFloat(this.config.physicalWidth) * parseFloat(this.config.beamSize1) );
  // printLog("Raster needs " + xpixels + " x " + ypixels +  " px at " + parseFloat(this.config.beamSize1) , msgcolor, "raster")
  // this.raster.size = new Size(xpixels,ypixels);


    // console.log('[Rasterizer] rasterRow', y);

    // Calculate where to move to to start the first and next rows - G0 Yxx move between lines
    var posy = y;
    // posy = (posy * this.config.spotSize1) - parseFloat(this.config.yOffset);
    if (this.config.imagePos == "TopLeft") {
    //   posy = (posy * this.config.spotSize1) - parseFloat(this.config.yOffset) + ((laserymax / 2) + this.config.imgheight);
      posy = (posy * this.config.beamSize1) + parseFloat(this.config.yOffset) - parseFloat(laserymax) + parseFloat(this.config.physicalHeight);
    } else {
      posy = (posy * this.config.beamSize1) - parseFloat(this.config.yOffset);
    }
    posy = posy.toFixed(3);

    // Offset Y since Gcode runs from bottom left and paper.js runs from top left
    var gcodey = (this.config.imgheight * this.config.spotSize1) - posy;
    gcodey = gcodey.toFixed(3);
    this.result += 'G0 Y{0}\n'.format(gcodey);

    // Clear grayscale values on each line change
    var lastGrey = -1;
    var lastIntensity = -1;

    // Get a row of pixels to work with
    var ImgData = this.raster.getImageData(0, y, this.raster.width, 1);
    var pixels = ImgData.data;

    // Run the row:
    for (var px = 0; px <= this.raster.width; px++) {
        var x;
        var posx;
        if (this.dir > 0) { // Forward
            x = px;
            posx = x;
        } else { // Backward
            x = this.raster.width - px - 1;
            posx = x + 1;
        }

        // Convert Pixel Position to millimeter position
        posx = (posx * this.config.beamSize1 + parseFloat(this.config.xOffset));
        posx = posx.toFixed(3);
        // Keep some stats of how many pixels we've processed
        this.megaPixel++;

        // The Luma grayscale of the pixel
	var alpha = pixels[x*4+3]/255.0;                                                   // 0-1.0
  var lumaGray = (pixels[x*4]*0.3 + pixels[x*4+1]*0.59 + pixels[x*4+2]*0.11)/255.0;  // 0-1.0
	lumaGray = alpha * lumaGray + (1-alpha)*1.0;
	this.grayLevel = lumaGray.toFixed(3);
	this.graLevel = lumaGray.toFixed(1);

	var speed = this.config.feedRate;
        if (lastGrey != this.grayLevel) {
            intensity = this.figureIntensity();
            speed = this.figureSpeed(lastGrey);
            lastGrey = this.grayLevel;
        }

        // Can't miss the first pixel (;
        //if (px == 0) { this.lastPosx = posx; }

        //if we are on the last dot, force a chance for the last pixel while avoiding forcing a move with the laser off
        if (px == this.raster.width) {
            intensity = -1;
        }

        // If we dont match the grayscale, we need to write some gcode...
        if (intensity != lastIntensity) {
            this.moveCount++;

            //console.log('From: ' + this.lastPosx + ', ' + lastPosy + '  - To: ' + posx + ', ' + posy + ' at ' + lastIntensity + '%');
            if (lastIntensity > 0) {
              if (laseron) {
                  this.result += laseron
                  this.result += '\n'
              }
              this.result += 'G1 X{0} S{2} F{3}\n'.format(posx, gcodey, lastIntensity, speed);
              if (laseroff) {
                  this.result += laseroff
                  this.result += '\n'
              }
            } else {
              if ((intensity > 0) || (this.config.optimizelineends == false)) {
                this.result += 'G0 X{0} S0\n'.format(posx, gcodey);
              }
            }
        } else {
            this.skip++
        }
        // End of write a line of gcode
        //this.endPosx = posx;

        // Store values to use in next loop
        if (intensity != lastIntensity) {
            lastIntensity = intensity;
        }
    }

    this.dir = -this.dir; // Reverse direction for next row - makes us move in a more efficient zig zag down the image
};


Rasterizer.prototype.rasterInterval = function() {
    if (this.currentPosy < this.raster.height) {

        this.rasterRow(this.currentPosy);

        this.currentPosy++;
        var progress = Math.round((this.currentPosy / this.raster.height) * 100.0);
        $('#rasterProgressPerc').html(progress + "%");
        NProgress.set(progress / 100);
        printLog('[Rasterizer] ' + progress + '% done', msgcolor, "raster");
    } else {
        this.onFinish();
        NProgress.done();
        NProgress.remove();
        $('#rasterparams').show();
        $('#rasterProgressShroud').hide();
        window.clearInterval(this.rasterIntervalTimer);
    }
};

Rasterizer.prototype.onRasterLoaded = function() {
    console.log('[Rasterizer] onRasterLoaded');
    var rasterSendToLaserButton = document.getElementById("rasterWidgetSendRasterToLaser");
    $('#rasterparams').hide();
    $('#rasterProgressShroud').show();
    $('.progress').removeClass('active');
    $('#rasterProgressShroud .progress-bar').width(0);
    // Iterate through the Pixels asynchronously

        // spotSize1 = size in mm that each physical pixel needs to fill
        // beamSize1 = size of the laser beam
        // Since the beam is a physical size, we need to adjust the raster to be more or less big that the actual pixels (either interpolated enlarge, or less detail) so that we have enough (and just enough) data to fill up the Beamsizes
        // For example:  If I draw a square of 10x10mm at 72dpi,  it only has 28x28 pixels.  If I want to engrave that square with a beam size of 0.1mm I need 100x100 pixels.  So we need to resize the 28x28 raster to 100x100 raster using http://paperjs.org/reference/raster/#size as shown in the example on http://paperjs.org/tutorials/images/using-pixel-colors/
        var ypixels = ( parseFloat(this.config.physicalHeight) / parseFloat(this.config.beamSize1) );
        var xpixels = ( parseFloat(this.config.physicalWidth) / parseFloat(this.config.beamSize1) );
        printLog("Raster needs " + xpixels + " x " + ypixels +  " px at " + parseFloat(this.config.beamSize1) , msgcolor, "raster")
        this.raster.size = new Size(xpixels,ypixels);
        console.log('After Resize Raster: ', this.raster)


    this.currentPosy = 0;
    this.rasterIntervalTimer = window.setInterval(this.rasterInterval.bind(this), 10);
};

Rasterizer.prototype.onFinish = function() {
    // Populate the GCode textarea
    var seq = this.config.objectid;
    // console.log("%c%s","color: #000; background: green; font-size: 24px;",seq)
    objectsInScene[seq].userData.gcode = this.result;
    // var existinggcode =  document.getElementById('gcodepreview').value
    // document.getElementById('gcodepreview').value = existinggcode + this.result;
    console.log('Optimized by number of line: ', this.skip);
    // Some Post-job Stats and Cleanup
    console.log('Number of GCode Moves: ', this.moveCount);
    var pixeltotal = this.raster.width * this.raster.height;
    console.log('Pixels: {0} done, of {1}'.format(this.megaPixel, pixeltotal));

    console.timeEnd("Process Raster");
    var currentTime = Date.now();
    var elapsed = (currentTime - this.startTime);
    $('#console')
        .append('<p class="pf" style="color: #009900;"><b>Raster completed in {0}ms</b></p>'.format(elapsed))
        .scrollTop($("#console")[0].scrollHeight - $("#console").height());

    if (this.config.completed) {
        this.config.completed(this.config.objectid);
    }
};


this.RasterNow = function(config) {
    console.time("Process Raster");
    printLog('Process Raster', msgcolor, "raster")
    var div = config.div;
    var rasterizer = new Rasterizer(config);
    console.log('from Container: ', div)
    rasterizer.init(div);
};
