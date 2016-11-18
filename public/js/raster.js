 // see main.js - image shown on three canvas of raster
 // This global rastermesh may be set here, and is referenced in viewer.js and gcode-parser.js
var rastermesh;

function rasterInit() {
  // printLog('Raster module Activated', msgcolor)

  // Raster support
  var paperscript = {};
}



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

function drawRaster(name, data) {

  console.group('Raster File');

  // console.log(data);

  var img = new Image();
  img.title = name;
  img.style.display = 'none';
  // All of this will happen after the image is loaded.
  // The actual load happens after this def.
  img.onload = function() {

    if (name.match(/.svg$/i)) {
      var canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // document.body.appendChild(img);
      var imgwidth = img.naturalWidth;
      var imgheight = img.naturalHeight;
      $("body").trigger("click") // close dropdown menu

      printLog('Bitmap Opened', msgcolor, "raster");
      //tbfleming's threejs texture code
      var geometry = new THREE.PlaneBufferGeometry(imgwidth, imgheight, 1);
      var texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      texture.minFilter = THREE.LinearFilter;
      var material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
      });
      rastermesh = new THREE.Mesh(geometry, material);
    } else {
      // document.body.appendChild(img);
      var imgwidth = img.naturalWidth;
      var imgheight = img.naturalHeight;
      $("body").trigger("click") // close dropdown menu

      printLog('Bitmap Opened', msgcolor, "raster");
      //tbfleming's threejs texture code
      var geometry = new THREE.PlaneBufferGeometry(imgwidth, imgheight, 1);
      var texture = new THREE.TextureLoader().load(data);
      texture.minFilter = THREE.LinearFilter
      var material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
      });
      rastermesh = new THREE.Mesh(geometry, material);
    }

    rastermesh.position.x = -(laserxmax / 2) + (imgwidth / 2);
    rastermesh.position.y = -(laserymax / 2) + (imgheight / 2);
    rastermesh.position.z = -0.01;
    rastermesh.name = name;
    rastermesh.userData.imgdata = data;  // store B64 image data in the userData for later use

    var defaultBitmapDPI = loadSetting('defaultBitmapDPI') || 25.4;
    var scale = 25.4/defaultBitmapDPI;
    rastermesh.scale.x = scale;
    rastermesh.scale.y = scale;

    scene.add(rastermesh);
    // Apply scaling to the mesh before placing at 0.

    putFileObjectAtZero(rastermesh);

    rastermesh.userData.color = rastermesh.material.color.getHex();
    objectsInScene.push(rastermesh)
  };
  // This actually loads the image, and fires the onload above.

  if (name.match(/.svg$/i)) {
    img.src = 'data:image/svg+xml;utf8,' + data;
    // console.log(img)
  } else {
    img.src = data;
    // console.log(img)
  }
  console.log("Raster Opened")

  console.groupEnd();

};

function runRaster(index) {
  console.log("Preparing Raster..")
  var threejsobject = objectsInScene[index];
  var spotSizeMul = parseFloat($('#spotSize').val());
  var laserRapid = parseFloat($('#rapidspeed').val()) * 60;
  // console.log("RAPIDSPEED", laserRapid)
  var imagePosition = $('#imagePosition').val()

  // var laserFeed = $('#feedRate'+index).val() * 60;
  var rasterDPI = parseFloat($('#rasterDPI'+index).val());
  var whitespeed = $("#feedRateW"+index).val() * 60;
  var blackspeed = $("#feedRateB"+index).val() * 60;
  // var useVariableSpeed = $('#useRasterBlackWhiteSpeeds'+index).prop('checked');
  var xoffset = parseFloat($('#rasterxoffset'+index).val());
  var yoffset = parseFloat($('#rasteryoffset'+index).val());
  var minpwr = $("#minpwr"+index).val();
  var maxpwr = $("#maxpwr"+index).val();

  // FIXME material
  // This might need to go into common code
  var zHeightRaw = (parseFloat($('#cuttingMatThickness').val() || 0) +
                parseFloat($('#materialThickness').val() || 0));

  // FIXME
  // The clamp assumes material can go up to 50mm high -- this assumption might be bad.
  var zHeight = zHeightRaw.clamp(0,50) +
                parseFloat($('zFocusHeight').val() || 0);
  var optimisegcode = $('#optimisegcode').val()



  var img = new Image();
  // This is deferred until the image is loaded, then the actual raster is run.
  img.onload = function() {
    console.log("IMG onloaded");
    var height = img.naturalHeight;
    var width = img.naturalWidth;

    var physheight = (height / rasterDPI) * 25.4;
    var physwidth = (width / rasterDPI) * 25.4;
    var spotSize = (physwidth / width);

    //
      console.log("IMG onloaded");
      var canvas = document.createElement("canvas");
      // canvas.setAttribute("id", "rastercanv");
      // document.body.appendChild(img);
      // document.body.appendChild(canvas);
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      // self.raster = new Raster(canvas);
      // console.log(self)
      // self.raster.visible = false;
      // self.raster.on('load', self.onRasterLoaded.bind(self));
      // self.raster.on('load', console.log("Event Fires!"));
    //

    paper.RasterNow({
        object: threejsobject,
        objectid: index,
        completed: gcodereceived,
        minIntensity: [minpwr],
        maxIntensity: [maxpwr],
        spotSize1: [spotSize],
        beamSize1: [spotSizeMul],
        imgheight: [height],
        imgwidth: [width],
        blackRate: [blackspeed],
        whiteRate: [whitespeed],
        rapidRate: [laserRapid],
        xOffset: [xoffset],
        yOffset: [yoffset],
        zHeight: [zHeight],
        imagePos: [imagePosition],
        physicalHeight: [physheight],
        physicalWidth: [physwidth],
        optimiseGcode: [optimisegcode]
    });
  };


  // Loading the image, which will cause the onload callback
  if (threejsobject.name.match(/.svg$/i)) {
    img.src = 'data:image/svg+xml;utf8,' + threejsobject.userData.imgdata;
  } else {
    img.src = threejsobject.userData.imgdata;
  }
};


function gcodereceived(i) {

  printLog('Raster Completed for <b>' + objectsInScene[i].name + '</b>' , msgcolor, "raster")
  var template = `
  <form class="form-horizontal">
    <label for="startgcodefinal" class="control-label">`+objectsInScene[i].name+`</label>
    <textarea id="gcode`+i+`" spellcheck="false" style="width: 100%; height: 80px;" placeholder="processing..." disabled></textarea>
  </form>`

  $('#gcodejobs').prepend(template);

  $('#gcode'+i).val(objectsInScene[i].userData.gcode);

  var startgcode = document.getElementById('startgcode').value;
  var endgcode = document.getElementById('endgcode').value;

  $('#startgcodefinal').val(startgcode)
  $('#endgcodefinal').val(endgcode);


  console.groupEnd();

  openGCodeFromText();
};
