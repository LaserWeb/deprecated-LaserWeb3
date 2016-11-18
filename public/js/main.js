// Console header
console.log("%c%s","color: #000; background: green; font-size: 12px;", "STARTING LASERWEB");

// ????
var useNumPad, activeObject, fileName;

// Intialise
lw.menu.init();
lw.store.init();
lw.viewer.init();
lw.dxf.loadFonts();

init3D();
filePrepInit();
initTabs();
initJog();
//errorHandlerJS();
var paperscript = {};
rasterInit();
macrosInit();
//svgInit();
initSocket();
initTour();
initSmoothie();
initEsp8266();
initTree();
initDragDrop();


// Tooltips
$(document).tooltip();
$(document).click(function() {
    $(this).tooltip("option", "hide", {
        effect: "clip",
        duration: 500
    }).off("focusin focusout");
});

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
    lw.store.refreshStore();
});

$('#backup').on('click', function() {
    lw.store.saveFile();
});

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
//var viewer = document.getElementById('renderArea');


// Progressbar
// NProgress.configure({ parent: '#gcode-menu-panel' });
NProgress.configure({
    showSpinner: false
});

checkNumPad();

// Check if all required settings are loaded
lw.store.checkParams();

// Bind Quote System
$('.quoteVar').keyup(function(){
    var setupfee = ( parseFloat($("#setupcost").val()) ).toFixed(2);
    var materialcost = ( parseFloat($("#materialcost").val()) * parseFloat($("#materialqty").val()) ).toFixed(2);
    var timecost = ( parseFloat($("#lasertime").val()) * parseFloat($("#lasertimeqty").val()) ).toFixed(2);
    var unitqty = ( parseFloat($("#qtycut").val()) ).toFixed(2);
    var grandtot = (materialcost*unitqty) + (timecost*unitqty) + parseFloat(setupfee);
    var grandtotal = grandtot.toFixed(2);
    $("#quoteprice").empty();
    $("#quoteprice").html('<div class="table-responsive"><table class="table table-condensed"><thead><tr><td class="text-center"><strong>Qty</strong></td><td class="text-center"><strong>Description</strong></td><td class="text-right"><strong>Unit</strong></td><td class="text-right"><strong>Total</strong></td></tr></thead><tbody><tr><td>1</td><td>Setup Cost</td><td class="text-right">'+setupfee+'</td><td class="text-right">'+setupfee+'</td></tr><tr><td>'+unitqty+'</td><td>Material</td><td class="text-right">'+materialcost+'</td><td class="text-right">'+(materialcost*unitqty).toFixed(2)+'</td></tr><tr><td>'+unitqty+'</td><td>Laser Time</td><td class="text-right">'+timecost+'</td><td class="text-right">'+(timecost*unitqty).toFixed(2)+'</td></tr><tr><td class="thick-line"></td><td class="thick"></td><td class="thick-line text-center"><strong>Total</strong></td><td class="thick-line text-right">'+ grandtotal +'</td></tr></tbody></table></div>' );
});


$('#controlmachine').hide();
$('#armmachine').show();
$('#armpin').pincodeInput({
    // 4 input boxes = code of 4 digits long
    inputs:4,
    // hide digits like password input
    hideDigits:true,
    // keyDown callback
    keydown : function(e){},
    // callback when all inputs are filled in (keyup event)
    complete : function(value, e, errorElement){
        var val = lw.store.get(armpin);
        if (val) {

        } else {
            val = "1234"
        }
        if ( value != val ){
            $("#armerror").html("Code incorrect");
            // $("#armButton").addClass('disabled');
        } else {
            $("#armerror").html("Code correct");
            $('#controlmachine').show();
            $('#armmachine').hide();
            // $("#armButton").removeClass('disabled');
        }
    }
});
$('#setarmpin').pincodeInput({
    // 4 input boxes = code of 4 digits long
    inputs:4,
    // hide digits like password input
    hideDigits:false,
    // keyDown callback
    keydown : function(e){},
    // callback when all inputs are filled in (keyup event)
    complete : function(value, e, errorElement){
        lw.store.set(armpin, value);
        $("#setpinmsg").html("<h3>Pin set to "+value+"</h3>");
        setTimeout(function(){ $('#pinresetmodal').modal('hide') }, 500);
        // $('#pinresetmodal').modal('hide');
    }
});

var overridePinCode = lw.store.get('safetyLockDisabled');
if (overridePinCode == 'Enable') {
    $('#controlmachine').show();
    $('#armmachine').hide();
}

cncMode = $('#cncMode').val()
if (cncMode == "Enable") {
    document.title = "CNCWeb";
    $("#statusmodal").modal('show');
    $("#statusTitle").html("<h4>CNC Mode Activated</h4>");
    $("#statusBody").html("Note: You have activated <b>CNC mode</b> from <kbd>Settings</kbd> -> <kbd>Tools</kbd> -> <kbd>Enable CNC Cam</kbd>");
    $("#statusBody2").html("While in CNC mode, Laser Raster Engraving is not enabled.  Please only open GCODE, DXF or SVG files.<hr>To revert to Laser Mode, go to <kbd>Settings</kbd> -> <kbd>Tools</kbd> -> <kbd>Enable CNC Cam</kbd>, and change it to <kbd>Disabled</kbd><hr>Please help us improve this experimental feature by giving feedback, asking for improvements, sharing ideas and posting bugs in the <a class='btn btn-sm btn-success' target='_blank' href='https://plus.google.com/communities/115879488566665599508'>Support Community</a>");
};

// Command Console History
$("#command").inputHistory({
    enter: function () {
        var commandValue = $('#command').val();
        sendGcode(commandValue);
    }
});

setTimeout(function(){ $('#viewReset').click(); }, 100);


// Version check

var version = $('meta[name=version]').attr("content");
$.get( "https://raw.githubusercontent.com/openhardwarecoza/LaserWeb3/master/version.txt", function( data ) {
    lw.log.print("Version currently Installed : " + version , 'message', "git")
    lw.log.print("Version available online on Github : " + data , 'message', "git")
    if ( parseInt(version) < parseInt(data) ) {
        lw.log.print("<b><u>NB:  UPDATE AVAILABLE!</u></b>  - Execute 'git pull' from your laserweb terminal " , 'error', "git")
    } else {
        lw.log.print("Your version of LaserWeb is Up To Date! " , 'success', "git")
    }

});

// A few gcode input fields need to be caps for the firmware to support it
$('.uppercase').keyup(function() {
    // this.value = this.value.toLocaleUpperCase();
});





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

// Error handling
function errorHandlerJS() {
    window.onerror = function(message, url, line) {
        message = message.replace(/^Uncaught /i, "");
        //alert(message+"\n\n("+url+" line "+line+")");
        console.log(message + "\n\n(" + url + " line " + line + ")");
        if (message.indexOf('updateMatrixWorld') == -1 ) { // Ignoring threejs/google api messages, add more || as discovered
            lw.log.print(message + "\n(" + url + " on line " + line + ")", 'error');
        }
    };
};

// Function to execute when opening file (triggered by fileOpen.addEventListener('change', readFile, false); )
function readFile(evt) {
    console.log('readFile:', evt);
    // Close the menu
    $("#drop1").dropdown("toggle");

    // Files
    var files = evt.target.files || evt.dataTransfer.files;

    for (var i = 0; i < files.length; i++) {
        loadFile(files[i]);
    }
}

// drag/drop
function initDragDrop() {
    var dropTarget = document.getElementById('container1');

    var onDragLeave = function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('#draganddrop').hide();
    }

    var onDragOver = function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('#draganddrop').show();
    }

    var onDrop = function(e) {
        onDragLeave(e);
        readFile(e);
    }


    dropTarget.addEventListener('drop', onDrop, false);
    dropTarget.addEventListener('dragover', onDragOver, false);
    dropTarget.addEventListener('dragleave', onDragLeave, false);
}

// load file
function loadFile(f) {
    // No file...
    if (! (f && f instanceof File)) {
        throw new Error(f + ' is not an instance of File.');
    }

    // File reader object
    var r = new FileReader();

    // DXF file
    if (f.name.match(/\.dxf$/i)) {
        // On file loaded
        r.onload = function(event) {
            // Parse and create DXF 3D object
            lw.dxf.draw(r.result, f.name, {
                // On 3D object created
                onObject: function(object) {
                    // Add object to viewer
                    lw.viewer.addObject(object, {
                        name  : f.name,
                        target: 'objects'
                    });
                }
            });
        };

        // Read the file as text
        r.readAsText(f);

        // File handled
        return;
    }

    if (f.name.match(/\.svg$/i)) {
        // On file loaded
        r.onload = function(event) {
            // Parse and create SVG 3D object
            lw.svg.drawFile(r.result, f.name, {
                // On 3D object created
                onObject: function(object) {
                    // Add object to viewer
                    lw.viewer.addObject(object, {
                        name  : f.name,
                        target: 'objects'
                    });
                },
                // On error
                onError: function(error) {
                    console.error(error);
                }
            });
        };

        // Read the file as text
        r.readAsText(f);

        // File handled
        return;
    }

    /*
    else if (f.name.match(/\.svg$/i)) {
        // console.log(f.name + " is a SVG file");
        r.readAsText(f);
        r.onload = function(event) {
            svg = r.result
            var svgpreview = document.getElementById('svgpreview');
            svgpreview.innerHTML = r.result;
            var svgfile = $('#svgpreview').html();
            svg2three(svgfile, f.name);
            lw.log.print('SVG Opened', 'message', "file");
            resetView()
        };
    }
    else if (f.name.match(/\.(gcode|gc|nc)$/i)) {
        r.readAsText(f);
        r.onload = function(event) {
            // cleanupThree();
            $("#gcodefile").show();
            document.getElementById('gcodepreview').value = this.result;
            lw.log.print('GCODE Opened', 'message', "file");
            resetView()
            setTimeout(function(){   openGCodeFromText(); }, 500);
        };
    }
    else if (f.name.match(/\.stl$/i)) {
        //r.readAsText(f);
        // Remove the UI elements from last run
        console.group("STL File");
        var stlloader = new MeshesJS.STLLoader;
        r.onload = function(event) {
            // cleanupThree();
            // Parse ASCII STL
            if (typeof r.result === 'string') {
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
                r.readAsText(f);
                return;
            }
            // parse binary STL
            stlloader.loadBinaryData(view, faces, 100, window, f);
        };
        // start reading file as array buffer
        r.readAsArrayBuffer(f);
        lw.log.print('STL Opened', 'message', "file");
        console.log("Opened STL, and asking user for Slice settings")
        console.groupEnd();
        $('#stlslice').modal('show')
    }
    else {
        console.log(f.name + " is probably a Raster");
        $('#origImage').empty();
        r.readAsDataURL(f);
        r.onload = function(event) {
            var name = f.name;
            var data = event.target.result;
            drawRaster(name, data);
        };
    }

    $('#filestatus').hide();
    $('#cam-menu').click();

    setTimeout(function(){ fillTree(); }, 250);
    setTimeout(function(){ fillLayerTabs(); }, 300);
    setTimeout(function(){ lw.viewer.extendsViewToObject(objectsInScene[objectsInScene.length - 1]); }, 300);
    */
};

function saveFile() {
    var textToWrite = prepgcodefile();
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
        lw.log.print('Going Fullscreen', 'success', "fullscreen");
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        lw.log.print('Exiting Fullscreen', 'success', "fullscreen");
    }
}
