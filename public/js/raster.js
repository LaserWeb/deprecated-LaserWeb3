var minpwr;
var maxpwr;
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

function drawRaster() {

    // Remove the UI elements from last run
    cleanupThree();


    $('#rasterProgressShroud').hide();
    $('#rasterparams').show();
    $("body").trigger("click") // close dropdown menu

    if ($('#useRasterBlackWhiteSpeeds').prop('checked')) {
        $("#blackwhitespeedsection").show();
    } else {
        $("#blackwhitespeedsection").hide();
    }
};

function rasterInit() {
    // printLog('Raster module Activated', msgcolor)

    // Raster support
    var paperscript = {};

    $("#laserpwrslider").slider({
        range: true,
        min: 0,
        max: 100,
        values: [0, 100],
        slide: function(event, ui) {
            minpwr = [ui.values[0]];
            maxpwr = [ui.values[1]];
            $('#rasterNow').removeClass('disabled');
            $('#laserpwr').html($("#laserpwrslider").slider("values", 0) + '% - ' + $("#laserpwrslider").slider("values", 1) + '%');
            setImgDims()
        }
    });
    $('#laserpwr').html($("#laserpwrslider").slider("values", 0) + '% - ' + $("#laserpwrslider").slider("values", 1) + '%');
    minpwr = $("#laserpwrslider").slider("values", 0);
    maxpwr = $("#laserpwrslider").slider("values", 1);

    $("#laservariablespeedslider").slider({
        range: true,
        min: 0,
        max: 100,
        values: [20, 80],
        slide: function(event, ui) {
            $('#rasterNow').removeClass('disabled');
            laserRapid = $('#rapidRate').val();
            $('#laservariablespeed').html($("#laservariablespeedslider").slider("values", 0) * laserRapid / 100.0 + ' - ' + $("#laservariablespeedslider").slider("values", 1) * laserRapid / 100.0);
        }
    });
    $('#laservariablespeed').html($("#laservariablespeedslider").slider("values", 0) * $('#rapidRate').val() / 100.0 + ' - ' + $("#laservariablespeedslider").slider("values", 1) * $('#rapidRate').val() / 100.0);

    $("#useRasterBlackWhiteSpeeds").change(function() {
        if ($('#useRasterBlackWhiteSpeeds').prop('checked')) {
            $("#blackwhitespeedsection").show();
        } else {
            $("#blackwhitespeedsection").hide();
        }
    });

    $("#rapidRate").change(function() {
        $('#laservariablespeed').html($("#laservariablespeedslider").slider("values", 0) * $('#rapidRate').val() / 100.0 + ' - ' + $("#laservariablespeedslider").slider("values", 1) * $('#rapidRate').val() / 100.0);
    });

    // $('#spotsize').html(':  ' + ($("#spotsizeslider").slider("values", 0) / 100) + 'mm ');
    // spotSizeMul = $("#spotsizeslider").slider("values", 0) / 100;
    spotSizeMul = parseFloat($('#spotSize').val()) / 100;

    $('#rasterNow').on('click', function() {
        // $('#rasterWidgetSendRasterToLaser').addClass('disabled');
        // var spotSize = $("#spotsizeslider").slider("values", 0) / 100;

        dpival = parseFloat($('#rasterDPI').val()) * 0.03937007874016;
        var img = document.getElementById('origImage');
        width = img.naturalWidth;
        var physheight = (height / dpival)
        var physwidth = (width / dpival) ;
        var spotSize = (physwidth / width);
        var spotSizeMul = parseFloat($('#spotSize').val());
        var laserFeed = $('#feedRate').val();
        var laserRapid = $('#rapidRate').val();
        var blackspeed = $("#laservariablespeedslider").slider("values", 0) * laserRapid / 100.0;
        var whitespeed = $("#laservariablespeedslider").slider("values", 1) * laserRapid / 100.0;
        var useVariableSpeed = $('#useRasterBlackWhiteSpeeds').prop('checked');
        $('#rasterProgressShroud').hide();
        var xoffset = parseFloat($('#rasterxoffset').val());
        var yoffset = parseFloat($('#rasteryoffset').val());
        var imagePosition = $('#imagePosition').val()

        paper.RasterNow({
            completed: gcodereceived,
            minIntensity: [minpwr],
            maxIntensity: [maxpwr],
            spotSize1: [spotSize],
            beamSize1: [spotSizeMul],
            imgheight: [height],
            imgwidth: [width],
            feedRate: [laserFeed],
            blackRate: [blackspeed],
            whiteRate: [whitespeed],
            useVariableSpeed: [useVariableSpeed],
            rapidRate: [laserRapid],
            xOffset: [xoffset],
            yOffset: [yoffset],
            imagePos: [imagePosition],
            physicalHeight: [physheight]
        });
    });

    $('#rasterDPI').bind('input propertychange change paste keyup', function() {
        if (this.value.length) {
            setImgDims();
        }
    });

    $('#rasterxoffset').bind('input propertychange change paste keyup', function() {
        if (this.value.length) {
            setImgDims();
        }
    });

    $('#rasteryoffset').bind('input propertychange change paste keyup', function() {
        if (this.value.length) {
            setImgDims();
        }
    });
}



function setImgDims() {
    // Rate of inch to mm = 0.03937007874016 from http://www.translatorscafe.com/cafe/EN/units-converter/digital-image-resolution/3-2/dot%2Finch-dot%2Fmillimeter/
    printLog('Changing size: Clearing GCODE', msgcolor)
    if (typeof(object) !== 'undefined') {
      scene.remove(object)
    }
    document.getElementById('gcodepreview').value = '';
    dpival = parseFloat($('#rasterDPI').val()) * 0.03937007874016;
    minpwr = $("#laserpwrslider").slider("values", 0);
    maxpwr = $("#laserpwrslider").slider("values", 1);
    var img = document.getElementById('origImage');
    width = img.naturalWidth;
    height = img.naturalHeight;
    $("#dims").text(width + 'px x ' + height + 'px');
    $('#canvas-1').prop('width', (width * 2));
    $('#canvas-1').prop('height', (height * 2));
    var physwidth = (width / dpival) ;
    var physheight = (height / dpival ) ;
    $("#physdims").text(physwidth.toFixed(1) + 'mm x ' + physheight.toFixed(1) + 'mm');
    var xoffset = parseFloat($('#rasterxoffset').val());
    var yoffset = parseFloat($('#rasteryoffset').val()) * -1;
    if (rastermesh) {
        rastermesh.scale.x = (physwidth / width)  ;
        rastermesh.scale.y = (physheight / height) ;

        var bbox2 = new THREE.Box3().setFromObject(rastermesh);
        console.log('bbox for rastermesh: Min X: ', (bbox2.min.x + (laserxmax / 2)), '  Max X:', (bbox2.max.x + (laserxmax / 2)), 'Min Y: ', (bbox2.min.y + (laserymax / 2)), '  Max Y:', (bbox2.max.y + (laserymax / 2)));
        var Xtofix = -(bbox2.min.x + (laserxmax / 2)) + xoffset;
        var imagePosition = $('#imagePosition').val()
        console.log('ImagePosition', imagePosition)

        imagePosition = $('#imagePosition').val()
        if (imagePosition == "TopLeft") {
            Ytofix = (laserymax / 2) - bbox2.max.y + yoffset;
        } else {
            Ytofix = -(bbox2.min.y + (laserymax / 2) + yoffset);
        }
        console.log('X Offset', Xtofix)
        console.log('Y Offset', Ytofix)
        rastermesh.translateX(Xtofix);
        rastermesh.translateY(Ytofix);
        currentWorld();

    }
};

function gcodereceived() {
    printLog('Raster Completed', msgcolor)
    $('#rasterProgressShroud').hide();
    $('#rasterparams').show();
    console.log('New Gcode');
    openGCodeFromText();
    gCodeToSend = document.getElementById('gcodepreview').value;
    $('#viewReset').click();

};
