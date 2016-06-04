// colors for the consolelog
var msgcolor = '#000000';
var successcolor = '#00aa00';
var errorcolor = '#cc0000';
var warncolor = '#ff6600';

var debug = false;

var useNumPad;
var activeObject, fileName

// Place all document.ready tasks into functions and ONLY run the functions from doument.ready
$(document).ready(function() {

    // Intialise
    loadSettingsLocal();
    initLocalStorage();
    init3D();
    animate();
    filePrepInit();
    initJog();
    errorHandlerJS();
    var paperscript = {};
    rasterInit();
    macrosInit();
    svgInit();
    initSocket();
    initTour();

    // grbl = new Grbl();

    // Responsive Sidebar width
    if ( screen.width < 800) {
      $('#maincolumn').addClass('col-md-offset-3');
      $('#maincolumn').addClass('col-md-10');
      $('#sidebarcolumn').addClass('col-md-2');
    } else
      $('#maincolumn').addClass('col-md-offset-3');
      $('#maincolumn').addClass('col-md-9');
      $('#sidebarcolumn').addClass('col-md-3');


    // Tooltips
    $(document).tooltip();
    $(document).click(function() {
        $(this).tooltip("option", "hide", {
            effect: "clip",
            duration: 500
        }).off("focusin focusout");
    });

    $('#inflateVal').change(onInflateChange.bind(this));


    $('#g-open').on('click', function() {
      $('#googledrive').modal('show');
    });
    // Top toolbar Menu

    //File -> Open
    var fileOpen = document.getElementById('file');
    fileOpen.addEventListener('change', readFile, false);

    // Fix for opening same file from http://stackoverflow.com/questions/32916687/uploading-same-file-into-text-box-after-clearing-it-is-not-working-in-chrome?lq=1
    $('#file').bind('click', function() {
      $('#file').val(null);
    });

    // File -> Save
    $('#save').on('click', function() {
        saveFile();
    });

    // View -> reset
    $('#viewReset').on('click', function() {
        resetView();
    });


    $('#savesettings').on('click', function() {
        saveSettingsLocal();
    });

    //$('#macroEdit').editableTableWidget();

    // // Show/Hide Macro Pad
    // $('#togglemacro').on('click', function() {
    //   printLog('Toggling Button Pad', msgcolor);
    //   $('#macro_container').toggle();
    //   $('#viewer_container').toggle();
    //   $('#renderArea').toggle();
    //   if ($( "#togglemacro" ).hasClass( "btn-primary" )) {
    //     $( "#togglemacro" ).removeClass( "btn-primary" )
    //     $( "#togglemacro" ).addClass( "btn-default" )
    //   } else {
    //     $( "#togglemacro" ).removeClass( "btn-default" )
    //     $( "#togglemacro" ).addClass( "btn-primary" )
    //   }
    // });

    // Tabs on right side
    $('#drotabtn').on('click', function() {
      $('#drotab').show();
      $('#gcodetab').hide();
      $("#drotabtn").addClass("active");
      $("#gcodetabbtn").removeClass("active");
    });


    $('#gcodetabbtn').on('click', function() {
      $('#drotab').hide();
      $('#gcodetab').show();
      $("#drotabtn").removeClass("active");
      $("#gcodetabbtn").addClass("active");
    });





    // Show/Hide Macro Pad
    $('#toggleviewer').on('click', function() {
      if ($( "#toggleviewer" ).hasClass( "active" )) {

      } else {
        $('#hometab').show();
        $('#camleftcol').hide();
        $('#settingscol').hide();
        $("#toggleviewer").addClass("active");
        $("#togglefile").removeClass("active");
        $("#togglesettings").removeClass("active");
      }
    });

    $('#togglefile').on('click', function() {
      if ($( "#togglefile" ).hasClass( "active" )) {

      } else {
        $('#hometab').hide();
        $('#camleftcol').show();
        $('#settingscol').hide();
        $("#toggleviewer").removeClass("active");
        $("#togglefile").addClass("active");
        $("#togglesettings").removeClass("active");
      }
    });

    $('#togglesettings').on('click', function() {
      if ($( "#togglesettings" ).hasClass( "active" )) {

      } else {
        $('#hometab').hide();
        $('#camleftcol').hide();
        $('#settingscol').show();
        $("#toggleviewer").removeClass("active");
        $("#togglefile").removeClass("active");
        $("#togglesettings").addClass("active");
      }
    });


    // Viewer
    var viewer = document.getElementById('renderArea');


    // Progressbar
    //NProgress.configure({ parent: '#consolemodule' });
    NProgress.configure({
        showSpinner: false
    });

checkNumPad();

checkSettingsLocal();

});
// End of document.ready

function checkNumPad() {

  useNumPad = $('#useNumPad').val()
  if (useNumPad.indexOf('Enable') == 0) {
        $.fn.numpad.defaults.gridTpl = '<table class="table modal-content"></table>';
        $.fn.numpad.defaults.backgroundTpl = '<div class="modal-backdrop in"></div>';
        $.fn.numpad.defaults.displayTpl = '<input type="text" class="form-control" />';
        $.fn.numpad.defaults.dblCellTpl = '<td colspan="2"></td>',
        $.fn.numpad.defaults.buttonNumberTpl =  '<button type="button" class="btn btn-numpad btn-default" style="width: 100%;"></button>';
        $.fn.numpad.defaults.buttonFunctionTpl = '<button type="button" class="btn  btn-numpad" style="width: 100%;"></button>';
        //$.fn.numpad.defaults.onKeypadCreate = function(){$(this).find('.done').addClass('btn-primary');};
        $('.numpad').numpad({
        					decimalSeparator: '.',
                  gcode: false,
                  textDone: 'OK',
              		textDelete: 'Del',
              		textClear: 'Clear',
              		textCancel: 'Cancel',
                  headerText: 'Enter Number',
        				});

        $('.numpadgcode').numpad({
                  decimalSeparator: '.',
                  gcode: true,
                  textDone: 'OK',
              		textDelete: 'Del',
              		textClear: 'Clear',
              		textCancel: 'Cancel',
                  headerText: 'Enter GCODE',
                });


  }

}

// From here down we can have the actual functions

// Error handling
errorHandlerJS = function() {
    window.onerror = function(message, url, line) {
        message = message.replace(/^Uncaught /i, "");
        //alert(message+"\n\n("+url+" line "+line+")");
        console.log(message + "\n\n(" + url + " line " + line + ")");
        if (message.indexOf('updateMatrixWorld') == -1 ) { // Ignoring threejs/google api messages, add more || as discovered
            printLog(message + "\n(" + url + " on line " + line + ")", errorcolor);
        }

    };
};

// Function to execute when opening file (triggered by fileOpen.addEventListener('change', readFile, false); )


function readFile(evt) {
  console.log(evt);
    // Close the menu
    $("#drop1").dropdown("toggle");
    cleanupThree();
    if (typeof(fileName) !== 'undefined' ) {
      axesgrp.remove(fileName)
    }

    fileName = makeSprite(scene, "webgl", {
        x: (laserxmax / 2),
        y: -30,
        z: 0,
        text: 'Filename : ' + evt.target.files[0].name,
        color: "#000000"
    });

    $('#tabsLayers').append('<li role="presentation" class="layerth" id="'+evt.target.files[0].name+'-tab"><a href="#">'+evt.target.files[0].name+'</a></li>')
    axesgrp.add(fileName);
    // Filereader
    var f = evt.target.files[0];
    if (f) {
        var r = new FileReader();
        if (f.name.match(/.dxf$/i)) {
            console.log(f.name + " is a DXF file");
            console.log('Reader: ', r)
            r.readAsText(evt.target.files[0]);
            r.onload = function(e) {
                dxf = r.result
                $('#togglefile').click();
                $('#cammodule').show();
                // $('#svgnewway').hide();
                $('#rastermodule').hide();
                getSettings();
                drawDXF(dxf);
                currentWorld();
                printLog('DXF Opened', successcolor);
                $('#cammodule').show();
                putFileObjectAtZero();
                resetView()
                $('#stlopt').hide();
                $('#prepopt').show();
                $('#prepopt').click();
                attachTransformWidget();
                activeObject = fileParentGroup
            };

        } else if (f.name.match(/.svg$/i)) {
            console.log(f.name + " is a SVG file");
            r.readAsText(evt.target.files[0]);
            r.onload = function(event) {
                svg = r.result
                var svgpreview = document.getElementById('svgpreview');
                svgpreview.innerHTML = r.result;
                    // /console.log(svg);
                $('#togglefile').click();
                $('#cammodule').show();
                // $('#svgnewway').show();
                $('#rastermodule').hide();
                getSettings();
                var svgfile = $('#svgpreview').html();
                // var colors = pullcolors(svgfile).unique();
                // var layers = []
                // for (i = 0; i < colors.length; i++) {
                //   // var r = colors[i][0];
                //   // var g = colors[i][1];
                //   // var b = colors[i][2];
                //   //var colorval = RGBToHex(r, g, b)
                //   layers.push(colors[i]);
                // };
                svg2three(svgfile);
                currentWorld();
                printLog('SVG Opened', successcolor);
                $('#cammodule').show();
                putFileObjectAtZero();
                resetView()
                $('#stlopt').show();
                $('#prepopt').show();
                $('#prepopt').click();
                $('#svgresize').modal('show');
                attachTransformWidget();
                activeObject = fileParentGroup
            };
            $('#svgresize').modal('show');

        } else if (f.name.match(/.gcode$/i)) {
            cleanupThree();
            r.readAsText(evt.target.files[0]);
            r.onload = function(event) {
                cleanupThree();
                document.getElementById('gcodepreview').value = this.result;
                openGCodeFromText();
                printLog('GCODE Opened', successcolor);
                $('#toggleviewer').click();
                $('#cammodule').hide();
                $('#rastermodule').hide();
                //  putFileObjectAtZero();
                resetView()
                $('#stlopt').hide();
                $('#prepopt').hide();
                $("#transformcontrols").hide();
                activeObject = object
            };
        } else if (f.name.match(/.stl$/i)) {
            //r.readAsText(evt.target.files[0]);
            // Remove the UI elements from last run
            cleanupThree();
            var stlloader = new MeshesJS.STLLoader;
            r.onload = function(event) {
                cleanupThree();
                // Parse ASCII STL
                if (typeof r.result === 'string') {
                    console.log("Inside STL.js Found ASCII");
                    stlloader.loadString(r.result);
                    return;
                }

                // buffer reader
                var view = new DataView(this.result);

                // get faces number
                try {
                    var faces = view.getUint32(80, true);
                } catch (error) {
                    self.onError(error);
                    return;
                }

                // is binary ?
                var binary = view.byteLength == (80 + 4 + 50 * faces);

                if (!binary) {
                    // get the file contents as string
                    // (faster than convert array buffer)
                    r.readAsText(evt.target.files[0]);
                    return;
                }

                // parse binary STL
                console.log("Inside STL.js Binary STL");
                cleanupThree();
                stlloader.loadBinaryData(view, faces, 100, window, evt.target.files[0]);
            };
            // start reading file as array buffer
            r.readAsArrayBuffer(evt.target.files[0]);
            printLog('STL Opened', successcolor);
            //$('#cammodule').hide();
            $('#cammodule').show();
            $('#rastermodule').hide();
            $('#togglefile').click();
            $('#stlopt').show();
            $('#prepopt').hide();
            $('#stlopt').click();
            $("#transformcontrols").hide();
            activeObject = fileParentGroup
        } else {
            console.log(f.name + " is probably a Raster");
            $('#origImage').empty();
            r.readAsDataURL(evt.target.files[0]);
            r.onload = function(event) {
                var imgtag = document.getElementById("origImage");
                imgtag.title = evt.target.files[0].name;
                imgtag.src = event.target.result;
                setImgDims();
                drawRaster();
                printLog('Bitmap Opened', successcolor);
                $('#cammodule').hide();
                $('#rastermodule').show();
                // putFileObjectAtZero();
                $('#togglefile').click();
                $('#stlopt').hide();
                $('#prepopt').hide();
                $("#transformcontrols").hide();

                //tbfleming's threejs texture code
                var img = document.getElementById('origImage');
                var imgwidth = img.naturalWidth;
                var imgheight = img.naturalHeight;

                var geometry = new THREE.PlaneBufferGeometry(imgwidth, imgheight, 1);

                var texture = new THREE.TextureLoader().load(event.target.result);
                texture.minFilter = THREE.LinearFilter

                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true
                });

                rastermesh = new THREE.Mesh(geometry, material);

                rastermesh.position.x = -(laserxmax / 2) + (imgwidth / 2);
                rastermesh.position.y = -(laserymax / 2) + (imgheight / 2);
                rastermesh.name = "rastermesh"

                scene.add(rastermesh);
                //  attachTransformWidget();
                resetView();
                setImgDims();
                $('#rasterresize').modal('show')
                activeObject = rastermesh
            };
        }
    }
    $('#filestatus').hide();
    if ($( "#togglefile" ).hasClass( "btn-default" )) {
      $('#togglefile').click();
    }


};


// Removed and null all object when a new file is loaded
function cleanupThree() {
    if (typeof(fileObject) !== 'undefined') {
        scene.remove(fileObject);
        fileObject = null;
    };

    if (typeof(rastermesh) !== 'undefined') {
        scene.remove(rastermesh);
        rastermesh = null;
    };

    if (typeof(inflateGrp) != 'undefined') {
        scene.remove(inflateGrp);
        inflateGrp = null;
    }

    if (typeof(slicegroup) != 'undefined') {
        scene.remove(slicegroup);
        slicegroup = null;
    }

    if (typeof(stl) != 'undefined') {
        scene.remove(stl);
        stl = null;
    }

    if (typeof(object) != 'undefined') {
        scene.remove(object);
        object = null;
    }

    if (typeof(fileParentGroup) != 'undefined') {
        scene.remove(fileParentGroup);
        fileParentGroup = null;
    }

    if (boundingBox) {
        scene.remove(boundingBox);
        boundingBox = null;
    }

    if (typeof(rastermesh) != 'undefined') {
        scene.remove(rastermesh);
        rastermesh = null;
    }

    if (control) {
        scene.remove(control);
        controls.reset();
        //  boundingBox = null;
    }


}


function saveFile() {
    var textToWrite = document.getElementById("gcodepreview").value;
    var blob = new Blob([textToWrite], {type: "text/plain"});
    invokeSaveAsDialog(blob, 'file.gcode');

};


/**
 * @param {Blob} file - File or Blob object. This parameter is required.
 * @param {string} fileName - Optional file name e.g. "image.png"
 */
function invokeSaveAsDialog(file, fileName) {
    if (!file) {
        throw 'Blob object is required.';
    }

    if (!file.type) {
        file.type = 'text/plain';
    }

    var fileExtension = file.type.split('/')[1];

    if (fileName && fileName.indexOf('.') !== -1) {
        var splitted = fileName.split('.');
        fileName = splitted[0];
        fileExtension = splitted[1];
    }

    var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
        return navigator.msSaveOrOpenBlob(file, fileFullName);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
        return navigator.msSaveBlob(file, fileFullName);
    }

    var hyperlink = document.createElement('a');
    hyperlink.href = URL.createObjectURL(file);
    hyperlink.target = '_blank';
    hyperlink.download = fileFullName;

    if (!!navigator.mozGetUserMedia) {
        hyperlink.onclick = function() {
            (document.body || document.documentElement).removeChild(hyperlink);
        };
        (document.body || document.documentElement).appendChild(hyperlink);
    }

    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    hyperlink.dispatchEvent(evt);

    if (!navigator.mozGetUserMedia) {
        URL.revokeObjectURL(hyperlink.href);
    }
}
function printLog(text, color) {
    $('#console').append('<p class="pf" style="color: ' + color + ';">' + text);
    $('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());
};


function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
    printLog('Going Fullscreen', successcolor);
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
    printLog('Exiting Fullscreen', successcolor);
  }
}
