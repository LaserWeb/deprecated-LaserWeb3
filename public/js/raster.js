var dpival;
var laserRapid;
var width;
var height;
var rectWidth;
var rectHeight;
var boundingBox;
var BBmaterial;
var BBgeometry;
var intensity;
var rastermesh; // see main.js - image shown on three canvas of raster


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

    console.log('inside drawRaster')

    var currentIdx = objectsInScene.length + 100;

    var div = document.createElement("img");
    div.style.display = "none";
    div.id = "origImage"+currentIdx;
    document.body.appendChild(div);

    var imgtag = document.getElementById("origImage"+currentIdx);

    imgtag.title = name;
    imgtag.src = data;
    setImgDims();

    $('#rasterProgressShroud').hide();
    $('#rasterparams').show();
    $("body").trigger("click") // close dropdown menu

    if ($('#useRasterBlackWhiteSpeeds').prop('checked')) {
        $("#blackwhitespeedsection").show();
    } else {
        $("#blackwhitespeedsection").hide();
    }

    printLog('Bitmap Opened', successcolor);
    //tbfleming's threejs texture code

    var img = document.getElementById('origImage'+currentIdx);
    var imgwidth = img.naturalWidth;
    var imgheight = img.naturalHeight;
    console.log('Sanity Check', img, imgwidth, imgheight)

    var geometry = new THREE.PlaneBufferGeometry(imgwidth, imgheight, 1);

    var texture = new THREE.TextureLoader().load(data);
    texture.minFilter = THREE.LinearFilter

    var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });

    rastermesh = new THREE.Mesh(geometry, material);

    rastermesh.position.x = -(laserxmax / 2) + (imgwidth / 2);
    rastermesh.position.y = -(laserymax / 2) + (imgheight / 2);
    rastermesh.position.z = -0.9;
    rastermesh.name = name

    scene.add(rastermesh);
    putFileObjectAtZero(rastermesh);
    calcZeroOffset(rastermesh)
    rastermesh.userData.seq = currentIdx;
    objectsInScene.push(rastermesh)
    // resetView();
    // setImgDims(currentIdx);
    $('#rasterresize').modal('show')
};

function rasterInit() {
    // printLog('Raster module Activated', msgcolor)

    // Raster support
    var paperscript = {};
}

function runRaster(index) {
  var seq = objectsInScene[index].userData.seq;
  var toRaster = 'origImage'+seq;
  var spotSizeMul = parseFloat($('#spotSize').val());
  var laserRapid = $('#rapidRate').val() * 60;
  var imagePosition = $('#imagePosition').val()

  // var laserFeed = $('#feedRate'+index).val() * 60;
  var rasterDPI = parseFloat($('#rasterDPI'+index).val());
  var blackspeed = $("#feedRateW"+index).val() * 60;
  var whitespeed = $("#feedRateB"+index).val() * 60;
  var useVariableSpeed = $('#useRasterBlackWhiteSpeeds'+index).prop('checked');
  var xoffset = parseFloat($('#rasterxoffset'+index).val());
  var yoffset = parseFloat($('#rasteryoffset'+index).val());
  var minpwr = $("#minpwr"+index).val();;
  var maxpwr = $("#maxpwr"+index).val();;
  rasterNow(toRaster, rasterDPI, spotSizeMul, laserRapid, blackspeed, whitespeed, xoffset, yoffset, imagePosition, minpwr, maxpwr )
}


function rasterNow(toRaster, rasterDPI, spotSizeMul, laserRapid, blackspeed, whitespeed, xoffset, yoffset, imagePosition, minpwr, maxpwr ) {

    dpival = rasterDPI * 0.03937007874016;
    var img = document.getElementById(toRaster);
    console.log(toRaster)
    height = img.naturalHeight;
    width = img.naturalWidth;
    var physheight = (height / dpival)
    var physwidth = (width / dpival) ;
    var spotSize = (physwidth / width);

    $('#rasterProgressShroud').hide();


    paper.RasterNow({
        completed: gcodereceived,
        minIntensity: [minpwr],
        maxIntensity: [maxpwr],
        spotSize1: [spotSize],
        beamSize1: [spotSizeMul],
        imgheight: [height],
        imgwidth: [width],
        // feedRate: [laserFeed],
        blackRate: [blackspeed],
        whiteRate: [whitespeed],
        // useVariableSpeed: [useVariableSpeed],
        rapidRate: [laserRapid],
        xOffset: [xoffset],
        yOffset: [yoffset],
        imagePos: [imagePosition],
        physicalHeight: [physheight],
        div: toRaster // Div Containing the image to raster
    });
};

function setImgDims(index) {
    // Rate of inch to mm = 0.03937007874016 from http://www.translatorscafe.com/cafe/EN/units-converter/digital-image-resolution/3-2/dot%2Finch-dot%2Fmillimeter/
    // printLog('Changing size: Clearing GCODE', msgcolor)
    // if (typeof(object) !== 'undefined') {
    //   scene.remove(object)
    // }
    // document.getElementById('gcodepreview').value = '';
    // dpival = parseFloat($('#rasterDPI').val()) * 0.03937007874016;
    // minpwr = $("#laserpwrslider").slider("values", 0);
    // maxpwr = $("#laserpwrslider").slider("values", 1);
    // var img = document.getElementById('origImage'+index);
    // width = img.naturalWidth;
    // height = img.naturalHeight;
    // $("#dims").text(width + 'px x ' + height + 'px');
    // $('#canvas-1').prop('width', (width * 2));
    // $('#canvas-1').prop('height', (height * 2));
    // var physwidth = (width / dpival) ;
    // var physheight = (height / dpival ) ;
    // $("#physdims").text(physwidth.toFixed(1) + 'mm x ' + physheight.toFixed(1) + 'mm');
    // var xoffset = parseFloat($('#rasterxoffset').val());
    // var yoffset = parseFloat($('#rasteryoffset').val()) * -1;
    // if (rastermesh) {
    //     rastermesh.scale.x = (physwidth / width)  ;
    //     rastermesh.scale.y = (physheight / height) ;
    //
    //     var bbox2 = new THREE.Box3().setFromObject(rastermesh);
    //     console.log('bbox for rastermesh: Min X: ', (bbox2.min.x + (laserxmax / 2)), '  Max X:', (bbox2.max.x + (laserxmax / 2)), 'Min Y: ', (bbox2.min.y + (laserymax / 2)), '  Max Y:', (bbox2.max.y + (laserymax / 2)));
    //     var Xtofix = -(bbox2.min.x + (laserxmax / 2)) + xoffset;
    //     var imagePosition = $('#imagePosition').val()
    //     console.log('ImagePosition', imagePosition)
    //
    //     imagePosition = $('#imagePosition').val()
    //     if (imagePosition == "TopLeft") {
    //         Ytofix = (laserymax / 2) - bbox2.max.y + yoffset;
    //     } else {
    //         Ytofix = -(bbox2.min.y + (laserymax / 2) + yoffset);
    //     }
    //     console.log('X Offset', Xtofix)
    //     console.log('Y Offset', Ytofix)
    //     rastermesh.translateX(Xtofix);
    //     rastermesh.translateY(Ytofix);
    //     currentWorld();
    //
    // }
};

function gcodereceived() {
    printLog('Raster Completed', msgcolor)
    $('#rasterProgressShroud').hide();
    $('#rasterparams').show();
    console.log('New Gcode');
    var total = scene.children.length
    for (var j = 5; j < total; j++) {
      console.log('Removed ', scene.children[5].name);
      scene.remove(scene.children[5]);
    }
    openGCodeFromText();
    // gCodeToSend = document.getElementById('gcodepreview').value;
    // $('#viewReset').click();
    // $('#gcode-menu').click();

};
