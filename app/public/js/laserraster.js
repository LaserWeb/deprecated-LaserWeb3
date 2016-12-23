'use strict';

/*

    AUTHOR:  Peter van der Walt
    Addional work by Nathaniel Stenzel and Sven Hecht

    LaserWeb Raster to GCode Paperscript
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
var isLaserOn = false;
var speed;
var IsG1FSet = false;

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

    // console.log('[Rasterizer] Width: ' + this.config.imgwidth + '  Height: ' + this.config.imgheight);
    // console.log('[Rasterizer] Phys Width: ' + this.config.physicalHeight + '  Height: ' + this.config.physicalWidth);

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

    // GCode Header
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
        '; Black Speed: {2}mm/m',
        '; White Speed: {3}mm/m',
        '; Resolution (mm per pixel): {4}mm',
        '; Laser Spot Size: {5}mm',
        '; X Offset: {7}mm',
        '; Y Offset: {8}mm',
        '; Z Height: {9}mm\n',
        'G0 Z{9} F{6}\n'
    ].join('\n').format(
        this.config.minIntensity,
        this.config.maxIntensity,
        this.config.blackRate,
        this.config.whiteRate,
        this.config.spotSize1,
        this.config.beamSize1,
        this.config.rapidRate,
        this.config.xOffset,
        this.config.yOffset,
        this.config.zHeight);

      if (this.config.optimiseGcode == "Enable") {
        console.log("Raster:  GCODE Concatenation is Enabled")
      } else {
        console.log("Raster:  GCODE Concatenation is Disabled")
      }
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

Rasterizer.prototype.init = function(object) {
    // console.log('INIT Container: ', this.config.div)
    this.startTime = Date.now();
    // console.log("Inside SVG Raster: Init")
    project.clear();


      if (object.name.match(/.svg$/i)) {
        // console.log("Inside SVG Raster")
        var img = new Image();
        var self = this; // hold parent scope
        // console.log("Inside SVG Raster: Setup")
        img.onload = function() {
          // console.log("Inside SVG Raster: Onload")
          var canvas = document.createElement("canvas");
          // canvas.setAttribute("id", "rastercanv");
          // document.body.appendChild(img);
          // document.body.appendChild(canvas);
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          self.raster = new Raster(canvas);
          console.log(self)
          self.raster.visible = false;
          self.raster.on('load', self.onRasterLoaded(self));
          // self.raster.on('load', console.log("Event Fires!"));
        }
        img.src = 'data:image/svg+xml;utf8,' + object.userData.imgdata;
      } else {
        console.log("Inside Bitmap Raster")
        this.raster = new Raster({
            source: object.userData.imgdata
        });
        console.log(this)
        this.raster.visible = false;
        this.raster.on('load', this.onRasterLoaded.bind(this));
      }



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
      posy = (posy * this.config.beamSize1) - parseFloat(this.config.yOffset) - parseFloat(laserymax) + parseFloat(this.config.physicalHeight);
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
    var lastFeed = -1;

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
        if ((intensity != lastIntensity) || (this.config.optimiseGcode != "Enable")) {

            this.moveCount++;

            //console.log('From: ' + this.lastPosx + ', ' + lastPosy + '  - To: ' + posx + ', ' + posy + ' at ' + lastIntensity + '%');
            if (lastIntensity > 0.05) {
              if (!isLaserOn) {
                if (laseron) {
                    this.result += laseron
                    this.result += '\n'
                }
                isLaserOn = true;
              }
              if (lastFeed != speed || IsG1FSet != true) {
                // console.log("DIFF " + lastFeed + " " + speed)
                this.result += 'G1 X{0} S{2} F{3}\n'.format(posx, gcodey, lastIntensity, speed);
                IsG1FSet = true;
              } else {
                // console.log("SAME " + lastFeed + " " + speed)
                this.result += 'G1 X{0} S{2}\n'.format(posx, gcodey, lastIntensity);
              }
              // if (laseroff) {
              //     this.result += laseroff
              //     this.result += '\n'
              // }
            } else {
              if ((intensity > 0.05) || (this.config.optimizelineends == false)) {
                if (isLaserOn) {
                  if (laseroff) {
                      this.result += laseroff
                      this.result += '\n'
                  }
                  isLaserOn = false;
                }
                this.result += 'G0 X{0} S0\n'.format(posx, gcodey);

              }
            }
        } else {
            console.log("Skipped")
            this.skip++
        }
        // End of write a line of gcode
        //this.endPosx = posx;

        // Store values to use in next loop
        if (intensity != lastIntensity) {
            lastIntensity = intensity;
            lastFeed = speed;
        }
    }
    isLaserOn = false;
    if (laseroff) {
        this.result += laseroff
        this.result += '\n'
    }
    isLaserOn = false;
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
        console.log("Inside onRasterLoaded")
        console.log(this)
        // Iterate through the Pixels asynchronously

        // spotSize1 = size in mm that each physical pixel needs to fill
        // beamSize1 = size of the laser beam
        // Since the beam is a physical size, we need to adjust the raster to be more or less big that the actual pixels (either interpolated enlarge, or less detail) so that we have enough (and just enough) data to fill up the Beamsizes
        // For example:  If I draw a square of 10x10mm at 72dpi,  it only has 28x28 pixels.  If I want to engrave that square with a beam size of 0.1mm I need 100x100 pixels.  So we need to resize the 28x28 raster to 100x100 raster using http://paperjs.org/reference/raster/#size as shown in the example on http://paperjs.org/tutorials/images/using-pixel-colors/
        var ypixels = ( parseFloat(this.config.physicalHeight) / parseFloat(this.config.beamSize1) );
        var xpixels = ( parseFloat(this.config.physicalWidth) / parseFloat(this.config.beamSize1) );
        printLog("Raster needs " + xpixels + " x " + ypixels +  " px at " + parseFloat(this.config.beamSize1) , msgcolor, "raster")
        this.raster.size = new Size(xpixels,ypixels);
        // console.log('After Resize Raster: ', this.raster)


    this.currentPosy = 0;
    this.rasterIntervalTimer = window.setInterval(this.rasterInterval.bind(this), 10);
};

Rasterizer.prototype.onFinish = function() {
    console.group("Raster Completed");
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
    printLog('<p class="pf" style="color: #009900;"><b>Raster completed in '+elapsed+'ms</b></p>', msgcolor, "viewer");

    if (this.config.completed) {
        this.config.completed(this.config.objectid);
    }
    console.groupEnd()
    IsG1FSet = false;
};

// This is evaluated inside the paperscript scope, so this
// becomes paper.RasterNow
this.RasterNow = function(config) {
    console.time("Process Raster");
    printLog('Process Raster', msgcolor, "raster")
    var object = config.object;
    var rasterizer = new Rasterizer(config);
    // console.log('from Container: ', div)
    rasterizer.init(object);
};
