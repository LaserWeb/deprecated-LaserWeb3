var inflateGrp;
var fileParentGroup;

function drawDXF(file) {
    yflip = false;
    Array.prototype.unique = function() {
        var n = {},
            r = [];
        for (var i = 0; i < this.length; i++) {
            if (!n[this[i]]) {
                n[this[i]] = true;
                r.push(this[i]);
            }
        }
        return r;
    }



    // Remove the UI elements from last run
    cleanupThree();

    // Empty File Prep Table
    $("#layers").empty();
    // if (typeof(showDxf) !== 'undefined') {
    //   scene.remove(showDxf);
    // };

    if (typeof(tool_offset) !== 'undefined') {
        scene.remove(tool_offset);
        toolPath = null;
    };
    fileObject = new THREE.Group();

    row = [];
    pwr = [];
    cutSpeed = [];

    // $('#console').append('<p class="pf" style="color: #000000;"><b>Parsing DXF:...</b></p>');
    // $('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());

    //NEW Dxf  -- experimental
    parser2 = new window.DxfParser();
    dxf2 = parser2.parseSync(file);
    //console.log('DXF Data', dxf2);
    //cadCanvas = new processDXF(dxf2);

    for (i = 0; i < dxf2.entities.length; i++) {
        //console.log('Layer: ', dxf2.entities[i].layer);
        row[i] = dxf2.entities[i].layer
        drawEntity(i, dxf2.entities[i]);
    };



    // Make the 'geometry' object disappear
    // for (i=0; i<fileObject.children.length; i++) {
    //     //fileObject.children[i].material.color.setHex(0x000000);
    //     fileObject.children[i].material.opacity = 0.3;
    // }

    // Sadly removing it from the scene makes gcode circles end up at 0,0 since localToWorld needs it in the scene
    // fileObject.translateX((laserxmax / 2) * -1);
    // fileObject.translateY((laserymax / 2) * -1);
    fileObject.name = 'fileObject';
    //scene.add(fileObject);
    fileParentGroup = new THREE.Group();
    fileParentGroup.name = "fileParentGroup";
    fileParentGroup.add(fileObject);
    fileParentGroup.translateX((laserxmax / 2) * -1);
    fileParentGroup.translateY((laserymax / 2) * -1);
    scene.add(fileParentGroup);

    // // Make a copy to show, because we need the original copy, untranslated, for the gcodewriter parsing
    // showDxf = fileObject.clone();
    // // And display the showpiece, translated to virtual 0,0
    // showDxf = fileObject.clone();
    // showDxf.translateX(laserxmax /2 * -1);
    // showDxf.translateY(laserymax /2 * -1);
    // scene.add(showDxf);

    layers = [];
    layers = row.unique();
    //console.log(layers);
    for (var c = 0; c < layers.length; c++) {
        $('#layers').append('<form class="form-horizontal"><label class="control-label">'+ layers[c] +'</label><div class="input-group"><input class="form-control numpad" name=sp' + c + ' id=sp' + c + ' value=3200><span class="input-group-addon">mm/m</span></div><div class="input-group"><input class="form-control numpad" name=pwr' + c + ' id=pwr' + c + ' value=100><span class="input-group-addon">%</span></div></form>');


    }

    // document.getElementById('fileInputGcode').value = '';
    // document.getElementById('fileInputDXF').value = '';
    // $('#generate').hide();
    // $('#dxfparamstomc').show();
    // $('#svgparamstomc').hide();
    // $('#cutParams').modal('toggle');
    // document.getElementById('fileName').value = fileName;
    viewExtents(fileParentGroup);
    checkNumPad(); // Make newly added rows also numpad if configured
    // clear SVG Invert + Move values if present
    svgxpos = 0;
    svgypos = 0;


};
