var toolpathsInScene = [];

function scaleSVGObject(obj, scale) {
    obj.scale.x = scale;
    obj.scale.y = scale;
    obj.scale.z = scale;
    putFileObjectAtZero(obj);
    //attachBB(obj);
}

function initTree() {
    $('#filetree').on('keyup change','input', function() {
        var inputVal = $(this).val();
        var newval = parseFloat(inputVal, 3)
        var id = $(this).attr('id');
        var objectseq = $(this).attr('objectseq');
        if (!id) {
            return;
        }
        // console.log('Value for ' +id+ ' changed to ' +newval+ ' for object ' +objectseq );
        if ( id.indexOf('xoffset') == 0 ) {
            objectsInScene[objectseq].position.x = objectsInScene[objectseq].userData.offsetX + newval;
            // console.log('Moving ' +objectsInScene[objectseq].name+ ' to X: '+newval);
            attachBB(objectsInScene[objectseq]);
        } else if ( id.indexOf('yoffset') == 0 ) {
            objectsInScene[objectseq].position.y = objectsInScene[objectseq].userData.offsetY + newval;
            // console.log('Moving ' +objectsInScene[objectseq].name+ ' to Y: '+newval);
            attachBB(objectsInScene[objectseq]);
        } else if ( id.indexOf('rasterDPI') == 0 ) {
            var bboxpre = new THREE.Box3().setFromObject(objectsInScene[objectseq]);
            // console.log('bbox for BEFORE SCALE: Min X: ', (bboxpre.min.x + (laserxmax / 2)), '  Max X:', (bboxpre.max.x + (laserxmax / 2)), 'Min Y: ', (bboxpre.min.y + (laserymax / 2)), '  Max Y:', (bboxpre.max.y + (laserymax / 2)));
            // console.log('Scaling ' +objectsInScene[objectseq].name+ ' to: '+scale);
            var scale = (25.4 / newval);
            objectsInScene[objectseq].scale.x = scale;
            objectsInScene[objectseq].scale.y = scale;
            objectsInScene[objectseq].scale.z = scale;
            putFileObjectAtZero(objectsInScene[objectseq]);
            attachBB(objectsInScene[objectseq]);
            $("#rasterxoffset"+objectseq).val('0')
            $("#rasteryoffset"+objectseq).val('0')
        } else if ( id.indexOf('svgresol') == 0 ) {
            var svgscale = (25.4 / newval );
            scaleSVGObject(objectsInScene[objectseq], svgscale);
            // objectsInScene[objectseq].scale.x = svgscale;
            // objectsInScene[objectseq].scale.y = svgscale;
            // objectsInScene[objectseq].scale.z = svgscale;
            // putFileObjectAtZero(objectsInScene[objectseq]);
            attachBB(objectsInScene[objectseq]);
        }
    });

    $('#statusBody2').on('keyup change','input', function() {
        var inputVal = $(this).val();
        var newval = parseFloat(inputVal, 3)
        var id = $(this).attr('id');
        var objectseq = $(this).attr('objectseq');
        console.log('Value for ' +id+ ' changed to ' +newval+ ' for object ' +objectseq );
        if ( id.indexOf('tzstep') == 0 ) {
            var numPass = Math.floor((parseFloat($('#tzdepth'+objectseq).val()) / parseFloat(newval)))

            if ((parseFloat($('#tzdepth'+objectseq).val()) / parseFloat(newval)) - Math.floor(parseFloat($('#tzdepth'+objectseq).val()) / parseFloat(newval)) != 0) {
                var finalPass = parseFloat($('#tzdepth'+objectseq).val()) - (newval * numPass);
                $('#svgZDepth').text( numPass + ' x ' + newval + 'mm + 1 x ' + finalPass + 'mm');
            } else {
                $('#svgZDepth').text( numPass + ' x ' + newval + 'mm');
            }
            updateCamUserData(objectseq);
        } else if ( id.indexOf('tzdepth') == 0 ) {
            $('#svgZFinal').text(newval + 'mm');
            var numPass = Math.floor((parseFloat(newval) / parseFloat($('#tzstep'+objectseq).val())))
            if ((parseFloat(newval) / parseFloat($('#tzstep'+objectseq).val())) - Math.floor(parseFloat(newval) / parseFloat($('#tzstep'+objectseq).val())) != 0) {
                var finalPass = parseFloat(newval) - ($('#tzstep'+objectseq).val() * numPass);
                $('#svgZDepth').text( numPass + ' x ' + $('#tzstep'+objectseq).val() + 'mm + 1 x ' + finalPass + 'mm');
            } else {
                $('#svgZDepth').text( numPass + ' x ' + $('#tzstep'+objectseq).val() + 'mm');
            }
            updateCamUserData(objectseq);
        } else if ( id.indexOf('tspeed') == 0 ) {
            updateCamUserData(objectseq);
        } else if ( id.indexOf('tplungespeed') == 0 ) {
            updateCamUserData(objectseq);
        } else if ( id.indexOf('ttooldia') == 0 ) {
            $('#svgToolDia').text(newval + 'mm');
            updateCamUserData(objectseq);
        } else if ( id.indexOf('tclearanceHeight') == 0 ) {
            $('#svgZClear-8').text(newval + 'mm');
            updateCamUserData(objectseq);
        } else if ( id.indexOf('tdragoffset') == 0 ) {
            $('#dragKnifeRadius').text(newval + 'mm');
            updateCamUserData(objectseq);
        } else if ( id.indexOf('tspotsize') == 0 ) {
            $('#svgToolDia-4').text(newval + 'mm');
            updateCamUserData(objectseq);
        } else if ( id.indexOf('tvbitangle') == 0 ) {
            $('#svgVbitAngle').text(newval + 'deg');
            updateCamUserData(objectseq);
        } else if ( id.indexOf('tvbitdia') == 0 ) {
            $('#svgVbitDia').text(newval + 'mm');
            updateCamUserData(objectseq);
        } else if ( id.indexOf('tvbitheight') == 0 ) {
            $('#svgVbitHeight').text(newval + 'mm');
            updateCamUserData(objectseq);
        }

        if ( id.indexOf('tminpwr') == 0 ) {
            updateRasterUserData(objectseq);
        } else if ( id.indexOf('tmaxpwr') == 0 ) {
            updateRasterUserData(objectseq);
        } else if ( id.indexOf('tfeedRateW') == 0 ) {
            updateRasterUserData(objectseq);
        } else if ( id.indexOf('tfeedRateB') == 0 ) {
            updateRasterUserData(objectseq);
        }


    });

    $('#statusBody2').on('keyup change','select', function() {
        var newval = $(this).val();
        var id = $(this).attr('id');
        var objectseq = $(this).attr('objectseq');
        console.log('Value for ' +id+ ' changed to ' +newval+ ' for object ' +objectseq );
        if ( id.indexOf('toperation') == 0 ) {
            if (newval == "Laser: Vector (no path offset)") {
                laserMode();
                updateCamUserData(objectseq);
            } else if (newval == "Laser: Vector (no path offset)") {
                laserMode();
                updateCamUserData(objectseq);
            } else if (newval == "Laser: Vector (path inside)") {
                laserInsideMode();
                updateCamUserData(objectseq);
            } else if (newval == "Laser: Vector (path outside)") {
                laserOutsideMode();
                updateCamUserData(objectseq);
            } else if (newval == "CNC: Outside") {
                cncOutsideMode();
                updateCamUserData(objectseq);
            } else if (newval == "CNC: Inside") {
                cncInsideMode();
                updateCamUserData(objectseq);
            } else if (newval == "CNC: Pocket") {
                cncPocketMode();
                updateCamUserData(objectseq);
            } else if (newval == "CNC: V-Engrave") {
                cncVEngMode();
                updateCamUserData(objectseq);
            } else if (newval == "Drag Knife: Cutout") {
                dragKnifeMode();
                updateCamUserData(objectseq);
            }
        };

        if ( id.indexOf('roperation') == 0 ) {
            if (newval == "Laser: Engrave") {
                laserRasterMode();
                updateRasterUserData(objectseq);
            } else if (newval == "CNC: V Peck") {
                cncVRasterMode();
                updateRasterUserData(objectseq);
            }
        };
    });

    // Fill it up as empty
    fillTree()

}

function updateCamUserData(i) {
    toolpathsInScene[i].userData.camOperation = $('#toperation'+i).val();
    toolpathsInScene[i].userData.camToolDia = $('#ttooldia'+i).val();
    toolpathsInScene[i].userData.camZClearance = $('#tclearanceHeight'+i).val();
    toolpathsInScene[i].userData.camDragOffset = $('#tdragoffset'+i).val();
    toolpathsInScene[i].userData.camLaserPower = $('#tpwr'+i).val();
    toolpathsInScene[i].userData.camZStep = $('#tzstep'+i).val();
    toolpathsInScene[i].userData.camZDepth = $('#tzdepth'+i).val();
    toolpathsInScene[i].userData.camFeedrate = $('#tspeed'+i).val();
    toolpathsInScene[i].userData.camPlungerate = $('#tplungespeed'+i).val();
    toolpathsInScene[i].userData.camVAngle = $('#tvbitangle'+i).val();
    toolpathsInScene[i].userData.camVHeight = $('#tvbitheight'+i).val();
    toolpathsInScene[i].userData.camVDia = $('#tvbitdia'+i).val();
};

function updateRasterUserData(i) {
    toolpathsInScene[i].userData.camOperation = $('#roperation'+i).val();
    toolpathsInScene[i].userData.rasterMinPwr = $('#tminpwr'+i).val();
    toolpathsInScene[i].userData.rasterMaxPwr = $('#tmaxpwr'+i).val();
    toolpathsInScene[i].userData.rasterBlackFeedrate = $('#tfeedRateB'+i).val();
    toolpathsInScene[i].userData.rasterWhiteFeedrate = $('#tfeedRateW'+i).val();
    toolpathsInScene[i].userData.camVAngle = $('#tvbitangle'+i).val();
    toolpathsInScene[i].userData.camVHeight = $('#tvbitheight'+i).val();
    toolpathsInScene[i].userData.camVDia = $('#tvbitdia'+i).val();
    toolpathsInScene[i].userData.camFeedrate = $('#tspeed'+i).val();
    toolpathsInScene[i].userData.camPlungerate = $('#tplungespeed'+i).val();

};

var collapsedGroups = {};

function fillTree() {
    $('#filetreeheader').empty();
    $('#filetree').empty();
    $('#toolpathtreeheader').empty();
    $('#toolpathtree').empty();

    var header = `
    <table style="width: 100%">
    <tr class="jobsetupfile">
    <td>
    <label for="filetreetable">Objects</label>
    </td>
    <td>
    <a class="btn btn-xs btn-success disabled" onclick="addJob();" id="tpaddpath"><i class="fa fa-plus" aria-hidden="true"></i> Add selection to Job</a>
    </td>
    </tr>
    </table>
    `

    $('#filetreeheader').append(header);

    if (objectsInScene.length > 0) {

        $('#tpaddpath').removeClass('disabled');

        var table = `<table class="jobsetuptable" style="width: 100%" id="filetreetable">`
        $('#filetree').append(table);


        var currentObject, currentObjectData;

        for (i = 0; i < objectsInScene.length; i++) {

            currentObject = objectsInScene[i];
            currentObjectData = currentObject.userData;

            var xoffset = currentObjectData.offsetX.toFixed(1);
            var yoffset = currentObjectData.offsetY.toFixed(1);
            var xpos = currentObject.position.x.toFixed(1);
            var ypos = currentObject.position.y.toFixed(1);
            var scale = currentObject.scale.y;

            var svgscale = null;

            if (currentObject.name.indexOf('.svg') != -1) {
                if (currentObjectData.editor) {
                    var localKey = currentObjectData.editor.name + 'DPI';
                    var dpi = loadSetting(localKey) || loadSetting('defaultDPI') || 24;
                    svgscale = 25.4 / parseFloat(dpi);
                    scaleSVGObject(currentObject, svgscale);
                }
                else {
                    svgscale = currentObject.scale.x
                }
            }

            if (objectsInScene[i].type != "Mesh") {
                var file = `
                <tr class="jobsetupfile topborder">
                <td class="filename">
                <i class="fa fa-fw fa-file-text-o" aria-hidden="true"></i>&nbsp;
                <a class="entity" href="#" onclick="attachBB(objectsInScene[`+i+`]);"><b>` + objectsInScene[i].name + `</b></a>
                </td>
                <td id="buttons`+i+`">
                <a class="btn btn-xs btn-primary" onclick="$('#move`+i+`').toggle(); $(this).toggleClass('active');"><i class="fa fa-arrows" aria-hidden="true"></i></a>
                <a class="btn btn-xs btn-danger remove" onclick="objectsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
                </td>
                <td>
                <input type="checkbox" value="" onclick=" $('.chkchildof`+i+`').prop('checked', $(this).prop('checked'));" id="selectall`+i+`" />
                </td>
                </tr>
                <tr class="jobsetupfile" id="move`+i+`" style="display: none;">
                <td colspan="3">
                <label >Position Offset</label>
                <table><tr><td>
                <div class="input-group">
                <span class="input-group-addon input-group-addon-xs">X:</span>
                <input type="number" class="form-control input-xs" xoffset="`+xoffset+`" value="`+ -(xoffset - xpos)+`"  id="xoffset`+i+`" objectseq="`+i+`" step="1"><br>
                <span class="input-group-addon input-group-addon-xs">mm</span>
                </div></td><td>
                <div class="input-group">
                <span class="input-group-addon input-group-addon-xs">Y:</span>
                <input type="number" class="form-control input-xs" yoffset="`+yoffset+`" value="`+ -(yoffset - ypos)+`"  id="yoffset`+i+`" objectseq="`+i+`" step="1">
                <span class="input-group-addon input-group-addon-xs">mm</span>
                </div></td></tr></table>
                </td>
                </tr>
                `
            } else {
                var file = `
                <tr class="jobsetupfile topborder">
                <td class="filename">
                <i class="fa fa-fw fa-file-photo-o" aria-hidden="true"></i>&nbsp;
                <a class="entity" href="#" onclick="attachBB(objectsInScene[`+i+`]);"><b>` + objectsInScene[i].name + `</b></a>
                </td>
                <td>
                <a class="btn btn-xs btn-warning" onclick="tracebmp(`+i+`, '`+objectsInScene[i].name+`')"><i class="fa fa-scissors" aria-hidden="true"></i></a>
                <a class="btn btn-xs btn-primary" onclick="$('#scale`+i+`').toggle(); $(this).toggleClass('active');"><i class="fa fa-expand" aria-hidden="true"></i></a>
                <a class="btn btn-xs btn-primary" onclick="$('#move`+i+`').toggle(); $(this).toggleClass('active');"><i class="fa fa-arrows" aria-hidden="true"></i></a>
                <a class="btn btn-xs btn-danger"  onclick="objectsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
                </td>
                <td>
                <input type="checkbox" value="" class="chkaddjob" id="child.`+i+`" />
                </td>
                </tr>
                <tr class="jobsetupfile" id="move`+i+`" style="display: none;">
                <td colspan="3">
                <label >Position Offset</label>
                <table><tr><td>
                <div class="input-group">
                <span class="input-group-addon input-group-addon-xs">X:</span>
                <input type="number" class="form-control input-xs" xoffset="`+xoffset+`" value="`+ -(xoffset - xpos)+`"  id="rasterxoffset`+i+`" objectseq="`+i+`" step="1"><br>
                <span class="input-group-addon input-group-addon-xs">mm</span>
                </div></td><td>
                <div class="input-group">
                <span class="input-group-addon input-group-addon-xs">Y:</span>
                <input type="number" class="form-control input-xs" yoffset="`+yoffset+`" value="`+ -(yoffset - ypos)+`"  id="rasteryoffset`+i+`" objectseq="`+i+`" step="1">
                <span class="input-group-addon input-group-addon-xs">mm</span>
                </div></td></tr></table>
                </td>
                </tr>
                <tr class="jobsetupfile" id="scale`+i+`" style="display: none;">
                <td colspan="3">
                <label>Bitmap Resolution</label>
                <div class="input-group">
                <input type="number" class="form-control input-xs" value="`+(25.4/scale).toFixed(1)+`" id="rasterDPI`+i+`" objectseq="`+i+`">
                <span class="input-group-addon input-group-addon-xs">DPI</span>
                </div>
                </td>
                </tr>
                `
            }

            $('#filetreetable').append(file);

            if (svgscale) {
                var svgfile =`
                <tr class="jobsetupfile" id="scale`+i+`" style="display: none;">
                <td colspan="3">
                <label>SVG Resolution</label>
                <div class="input-group">
                <input type="number" class="form-control input-xs" value="`+(25.4/svgscale).toFixed(1)+`" id="svgresol`+i+`" objectseq="`+i+`">
                <span class="input-group-addon input-group-addon-xs">DPI</span>
                </div>
                </td>
                </tr>`
                $('#filetreetable').append(svgfile)

                var scalebtn = `<a class="btn btn-xs btn-primary" onclick="$('#scale`+i+`').toggle(); $(this).toggleClass('active');"><i class="fa fa-expand" aria-hidden="true"></i></a>`
                $('#buttons'+i).prepend(scalebtn)
            }

            $('#filetreetable').append(`
            <tr>
            <td colspan="3" class="jobsetupgroup">
            <ul id="jobsetupgroup`+i+`"></ul>
            </td>
            </tr>
            <tr class="filespacer"><td colspan="3"><hr /></td></tr>
            `);

            var currentChildren = currentObject.children;
            var currentChildrenLength = currentChildren.length;

            var $childGroup = $('#jobsetupgroup' + i);

            var $parentGroup = null;
            var $currentTable = null;
            var currentTable = null;
            var currentChild = null;
            var childTemplate = null;
            var childData = null;
            var groupName = null;
            var groupId = null;

            for (var j = 0; j < currentChildrenLength; j++) {
                currentChild = currentChildren[j];
                childData = currentChild.userData;
                childData.link = "link"+i+"_"+j;
                childLayer = childData.layer;

                $parentGroup = $childGroup;

                childTemplate = `
                <li class="item children`+i+`">
                <input type="checkbox" value="" class="fr chkaddjob chkchildof`+i+`" id="child.`+i+`.`+j+`" />
                <a class="fr remove btn btn-xs btn-danger"><i class="fa fa-times" aria-hidden="true"></i></a>
                <i class="fa fa-fw fa-sm fa-object-ungroup" aria-hidden="true"></i>&nbsp;
                <a class="entity" href="#" onclick="attachBB(objectsInScene[`+i+`].children[`+j+`])" id="link`+i+`_`+j+`">`+currentChild.name+`</a>
                </li>
                `;

                if (! childLayer) {
                    $childGroup.append(childTemplate);
                }
                else {
                    if (childLayer.parent) {
                        $parentGroup = $('#' + childLayer.parent.id);

                        if (! $parentGroup.length) {
                            currentTable = `
                            <li class="group">
                                <input type="checkbox" value="" class="fr chkaddjob chkchildof`+i+`" />
                                <a class="fr remove btn btn-xs btn-danger"><i class="fa fa-times" aria-hidden="true"></i></a>
                                <span class="fr counter label label-info">0</span>
                                <i class="fa fa-fw fa-sm fa-object-group" aria-hidden="true"></i>&nbsp;
                                <a class="entity toggle" href="#" onclick="return false;">`+childLayer.parent.label+`</a>
                                <ul id="`+childLayer.parent.id+`"></ul>
                            </li>
                            `;

                            $childGroup.append(currentTable);
                            $parentGroup = $('#' + childLayer.parent.id);
                        }
                    }

                    $currentTable = $('#' + childLayer.id);

                    if (! $currentTable.length) {
                        currentTable = `
                        <li class="group">
                            <input type="checkbox" value="" class="fr chkaddjob chkchildof`+i+`" />
                            <a class="fr remove btn btn-xs btn-danger"><i class="fa fa-times" aria-hidden="true"></i></a>
                            <span class="fr counter label label-info">0</span>
                            <i class="fa fa-fw fa-sm fa-object-group" aria-hidden="true"></i>&nbsp;
                            <a class="entity toggle" href="#">`+childLayer.label+`</a>
                            <ul id="`+childLayer.id+`"></ul>
                        </li>
                        `;

                        $parentGroup.append(currentTable);
                        $currentTable = $('#' + childLayer.id);
                    }

                    $currentTable.append(childTemplate);
                }

                if (childData.selected) {
                    attachBB(currentChild);
                }
            }

        }

        function updateTreeSelection() {
            $('.jobsetuptable .chkaddjob').each(function(n, input) {
                var $input = $(input);
                var $parent = $input.parent();

                if (! $parent.hasClass('item')) {
                    var items = $parent.find('.item').length;
                    var checkedItems = $parent.find('.item > input:checked').length;

                    $input.prop('checked', items == checkedItems);
                }
            });
        }

        updateTreeSelection();

        $('.jobsetuptable').on('lw:attachBB', function(e, $target) {
            updateTreeSelection();
        });

        $('.jobsetuptable .toggle').on('click', function() {
            var $label = $(this);
            var $group = $label.parent().children('ul');
            var groupId = $group.attr('id');

            $label.toggleClass('italic');
            $group.toggleClass('hidden');

            collapsedGroups[groupId] = $group.hasClass('hidden');
        });

        $('.jobsetuptable .group').each(function(n, group) {
            var $group = $(group);
            var $items = $group.find('.item');
            var $counter = $group.children('.counter');
            var groupId = $group.children('ul').attr('id');

            $counter.html($items.length);

            if (collapsedGroups[groupId]) {
                $group.children('.toggle').trigger('click');
            }
        });

        $('.jobsetuptable .chkaddjob').on('change', function(e) {
            var $input = $(this);
            var $parent = $input.parent();
            var checked = $input.prop('checked');
            var idx, i, j;

            if ($parent.hasClass('item')) {
                if (checked == $input.prop('checked')) {
                    $input.prop('checked', !checked);
                }

                idx = $parent.children('input').attr('id').split('.');
                i = parseInt(idx[1]);
                j = parseInt(idx[2]);

                attachBB(objectsInScene[i].children[j]);
                updateTreeSelection();
                return false;
            }

            $input.parent().find('ul .chkaddjob').each(function(n, input) {
                $input = $(input);
                $parent = $input.parent();

                if ($parent.hasClass('item')) {
                    if (checked == $input.prop('checked')) {
                        $input.prop('checked', !checked);
                    }

                    idx = $parent.children('input').attr('id').split('.');
                    i = parseInt(idx[1]);
                    j = parseInt(idx[2]);

                    attachBB(objectsInScene[i].children[j]);
                }
                else {
                    $input.prop('checked', checked);
                }
            });
        });

        $('.jobsetupgroup .remove').on('click', function() {
            var $parent = $(this).parent();
            var idx, i, j;

            if ($parent.hasClass('item')) {
                idx = $parent.children('input').attr('id').split('.');
                i = parseInt(idx[1]);
                j = parseInt(idx[2]);
                objectsInScene[i].remove(objectsInScene[i].children[j]);
            }
            else {
                var children = [];

                $parent.find('.item input').each(function(n, input) {
                    idx = $(input).attr('id').split('.');
                    i = parseInt(idx[1]);
                    j = parseInt(idx[2]);
                    children.push(objectsInScene[i].children[j]);
                });

                for (var n = 0; n < children.length; n++) {
                    objectsInScene[i].remove(children[n]);
                }
            }

            fillTree();

        });

        var tableend = `
        </table>
        `
        $('#filetree').append(tableend)
    } else {
        var instructions = `Please open a file from the <kbd>Open</kbd> button...`
        $('#filetree').append(instructions)

    }// End of if (objectsInScene.length > 0)

    var toolpatheader = `
    <table style="width: 100%">
    <tr class="jobsetupfile">
    <td>
    <label for="toolpathstable">Toolpaths</label>
    </td>
    <td>
    <a class="btn btn-xs btn-success disabled" id="generatetpgcode"><i class="fa fa-cubes" aria-hidden="true"></i> Generate G-Code</a>
    </td>
    </tr>
    </table>`
    $('#toolpathtreeheader').append(toolpatheader)

    if (toolpathsInScene.length > 0) {

        $('#generatetpgcode').removeClass('disabled');

        var table = `<table class="jobsetuptable" style="width: 100%" id="toolpathstable">`

        $('#toolpathtree').append(table)
        for (i = 0; i < toolpathsInScene.length; i++) {
            if (toolpathsInScene[i].type != "Mesh") {
                var toolp = `<tr class="jobsetupfile">
                <td>
                <i class="fa fa-fw fa-object-group" aria-hidden="true"></i>&nbsp;
                <span class="entity-job" contenteditable="true" data-id="`+i+`">`+toolpathsInScene[i].name+`</span>
                </td>
                <td>

                </td>
                <td>
                <a class="btn btn-xs btn-default" onclick="viewToolpath('`+i+`', 1);"><i class="fa fa-eye" aria-hidden="true"></i></a>
                <a class="btn btn-xs btn-danger" onclick="toolpathsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
                <a class="btn btn-xs btn-primary" onclick="setupJob(`+i+`);"><i class="fa fa-fw fa-sliders" aria-hidden="true"></i></a>
                </td>
                </tr>
                `
            } else {
                var toolp = `<tr class="jobsetupfile">
                <td>
                <i class="fa fa-fw fa-picture-o" aria-hidden="true"></i>&nbsp;
                <span class="entity-job" contenteditable="true" data-id="`+i+`">`+toolpathsInScene[i].name+`</span>
                </td>
                <td>

                </td>
                <td>
                <a class="btn btn-xs btn-default" onclick="viewToolpath('`+i+`', 1);"><i class="fa fa-eye" aria-hidden="true"></i></a>
                <a class="btn btn-xs btn-danger"  onclick="toolpathsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
                <a class="btn btn-xs btn-primary" onclick="setupRaster(`+i+`);"><i class="fa fa-fw fa-sliders" aria-hidden="true"></i></a>
                </td>
                </tr>
                `
            }

            $('#toolpathstable').append(toolp);
        }

        $('#toolpathstable .entity-job').on('input', function() {
            var $this = $(this);
            var data = $this.data();

            toolpathsInScene[data.id].name = $this.text();
        });

    } else {
        var instructions = `Please select some entities from the <b>Objects</b> above and add them to a toolpath using the <br><kbd><i class="fa fa-plus" aria-hidden="true"></i> Add selection to Job</kbd> button...`
        $('#toolpathtree').append(instructions)

    }  // End of if (toolpathsInScene.length > 0)
    var tableend = `
    </table>
    `
    $('#toolpathstable').append(tableend)
}



function addJob() {
    var toolpath = new THREE.Group();
    $(".chkaddjob").each(function(){

        resetColors() // Set all colors back to original

        var $this = $(this);

        if($this.is(":checked")){
            // console.log($this.attr("id"));
            var id = $this.attr("id");
            if (!id) return true;
            var id = id.split(".");
            if (id[2]) {
                var child = objectsInScene[id[1]].children[id[2]];
                var copy = child.clone()
                copy.translateX( child.parent.position.x );
                copy.translateY( child.parent.position.y );
                toolpath.add(copy);
            } else {
                var child = objectsInScene[id[1]];
                var copy = child.clone()
                copy.translateX( child.parent.position.x );
                copy.translateY( child.parent.position.y );
                toolpathsInScene.push(copy)
            }
        }else{
            // console.log($this.attr("id")) // Is not ticked

        }
    });
    if (toolpath.children.length > 0) {
        toolpath.name = "Vector-"+(toolpathsInScene.length)
        toolpathsInScene.push(toolpath)
    }
    fillTree();
}

function viewToolpath(i) {
    clearScene()
    $(".layertab").removeClass('active');
    $('#jobView').addClass('active');
    clearScene()
    scene.add(toolpathsInScene[i]);
    var tpath = toolpathsInScene[i];
    makeRed(tpath);
    if (toolpathsInScene[i].userData) {
        if (toolpathsInScene[i].userData.inflated) {
            scene.add(toolpathsInScene[i].userData.inflated);
            toolpathsInScene[i].userData.inflated.translateX(toolpathsInScene[i].parent.position.x)
            toolpathsInScene[i].userData.inflated.translateY(toolpathsInScene[i].parent.position.y)
        }
    };
    if (typeof(boundingBox) != 'undefined') {
        scene.remove(boundingBox);
    }
}

function clearScene() {
    var total = scene.children.length
    for (var x = 7; x < total; x++) {
        // console.log('Removing ' + scene.children[x].name + ' from scene')
        scene.remove(scene.children[x]);
    }
    var total = scene.children.length
    for (var x = 7; x < total; x++) {
        // console.log('Removing ' + scene.children[x].name + ' from scene')
        scene.remove(scene.children[x]);
    }
}

function resetColors() {
    // for (i = 0; i < objectsInScene.length; i++) {
    //     for (j = 0; j < objectsInScene[i].children.length; j++) {
    //         objectsInScene[i].children[j].material.color.setHex(objectsInScene[i].children[j].userData.color);
    //     }
    // }
}

function makeRed(tpath) {
    tpath.traverse( function ( child ) {
        if (child.type == "Line") {
            child.material.color.setRGB(1, 0.1, 0.1);
        }
    });
}

function setupJob(toolpathid) {
    $('#statusmodal').modal('show');
    $('#statusTitle').empty();
    $('#statusTitle').html('Configure Toolpath');
    $('#statusBody').empty();
    $('#statusBody2').empty();

    $('#statusBody').html('<br>Configure the operation for the toolpath <b>' + toolpathsInScene[toolpathid].name + '</b><hr>' );
    var template2 = `
    <div class="form-group">
    <label>Operation</label>
    <div class="input-group" >
    <span class="input-group-addon">Type of cut: </span>
    <select class="form-control" id="toperation`+toolpathid+`" objectseq="`+toolpathid+`">
    <option>Laser: Vector (no path offset)</option>
    <option>Laser: Vector (path inside)</option>
    <option>Laser: Vector (path outside)</option>
    <option>CNC: Inside</option>
    <option>CNC: Outside</option>
    <option>CNC: Pocket</option>
    <option>CNC: V-Engrave</option>
    <option>Drag Knife: Cutout</option>
    </select>
    </div>
    </div>

    <div class="form-group">
    <label class="control-label">Tool Options</label>

    <div class="input-group inputcnc">
    <span class="input-group-addon">Endmill Diameter</span>
    <input type="number" class="form-control input-sm" value="6.35" id="ttooldia`+toolpathid+`"  objectseq="`+toolpathid+`" min="0">
    <span class="input-group-addon">mm</span>
    </div>

    <div class="input-group inputcnc inputvbit">
    <span class="input-group-addon">Z Safe Height</span>
    <input type="number" class="form-control input-sm" value="10" id="tclearanceHeight`+toolpathid+`"  objectseq="`+toolpathid+`" min="1">
    <span class="input-group-addon">mm</span>
    </div>

    <div class="input-group inputdragknife">
    <span class="input-group-addon">Drag Knife: Center Offset</span>
    <input type="number" class="form-control input-sm" value="0.1" id="tdragoffset`+toolpathid+`"  objectseq="`+toolpathid+`" step="0.1" min="0">
    <span class="input-group-addon">mm</span>
    </div>


    <div class="input-group inputvbit">
    <span class="input-group-addon">V Bit: Diameter</span>
    <input type="number" class="form-control input-sm" value="10" id="tvbitdia`+toolpathid+`"  objectseq="`+toolpathid+`" min="0">
    <span class="input-group-addon">mm</span>
    </div>

    <div class="input-group inputvbit">
    <span class="input-group-addon">V Bit: Height</span>
    <input type="number" class="form-control input-sm" value="10" id="tvbitheight`+toolpathid+`"  objectseq="`+toolpathid+`" min="0">
    <span class="input-group-addon">mm</span>
    </div>

    <div class="input-group inputvbit">
    <span class="input-group-addon">V Bit: V Angle</span>
    <input type="number" class="form-control input-sm" value="90" id="tvbitangle`+toolpathid+`"  objectseq="`+toolpathid+`" min="0">
    <span class="input-group-addon">deg</span>
    </div>

    <div class="input-group inputlaser">
    <span class="input-group-addon">Laser: Power</span>
    <input type="number" class="form-control" value="100" id="tpwr`+toolpathid+`" objectseq="`+toolpathid+`" min="1" max="100">
    <span class="input-group-addon">%</span>
    </div>

    <div class="input-group inputlaser">
    <span class="input-group-addon">Laser: Diameter</span>
    <input type="number" class="form-control" value="0.1" id="tspotsize`+toolpathid+`" objectseq="`+toolpathid+`" min="0.1" max="5" step="0.1">
    <span class="input-group-addon">mm</span>
    </div>


    </div>

    <div class="form-group inputcnc inputlaser">
    <label>Operation Depth</label>

    <div class="input-group inputcnc inputlaser">
    <span class="input-group-addon">Cut Depth per pass</span>
    <input type="number" class="form-control" id="tzstep`+toolpathid+`" value="5" objectseq="`+toolpathid+`" min="0" step="1">
    <span class="input-group-addon">mm</span>
    </div>

    <div class="input-group inputcnc inputlaser">
    <span class="input-group-addon">Cut Depth Final</span>
    <input type="number" class="form-control" id="tzdepth`+toolpathid+`" value="25" objectseq="`+toolpathid+`" min="0" step="1">
    <span class="input-group-addon">mm</span>
    </div>

    </div>


    <div class="form-group">
    <label>Feedrate</label>

    <div class="input-group">
    <span class="input-group-addon">Feedrate: Cut</span>
    <input type="number" class="form-control" value="6" id="tspeed`+toolpathid+`" objectseq="`+toolpathid+`" min="0" step="1" >
    <span class="input-group-addon">mm/s</span>
    </div>

    <div class="input-group inputcnc">
    <span class="input-group-addon">Feedrate: Plunge</span>
    <input type="number" class="form-control" value="2" id="tplungespeed`+toolpathid+`" objectseq="`+toolpathid+`" min="0" step="1">
    <span class="input-group-addon">mm/s</span>
    </div>
    </div>


    <button type="button" class="btn btn-lg btn-success" data-dismiss="modal">Preview Toolpath </button>
    `
    $('#statusBody2').html(template2);
    $('#statusBody').prepend(svgcnctool);

    laserMode(); // Default to laser since the Select defaults to laser.  In near future I want to update this to keep last user Operation in localstorage and default to last used on when opening modal

}


function setupRaster(toolpathid) {
    $('#statusmodal').modal('show');
    $('#statusTitle').empty();
    $('#statusTitle').html('Configure Toolpath');
    $('#statusBody').empty();
    $('#statusBody2').empty();

    $('#statusBody').html('<br>Configure the operation for the toolpath <b>' + toolpathsInScene[toolpathid].name + '</b><hr>' );
    var template2 = `
    <div class="form-group">
    <label>Operation</label>
    <div class="input-group" >
    <span class="input-group-addon">Type of raster: </span>
    <select class="form-control" id="roperation`+toolpathid+`" objectseq="`+toolpathid+`">
    <option>Laser: Engrave</option>
    <option>CNC: V Peck</option>
    </select>
    </div>
    </div>

    <div class="form-group">
    <label >Tool Options</label>
    <div class="input-group inputraster">
    <span class="input-group-addon">Laser: Diameter</span>
    <input type="number" class="form-control" value="0.1" id="tspotsize`+toolpathid+`" objectseq="`+toolpathid+`" min="0.1" max="5" step="0.1">
    <span class="input-group-addon">mm</span>
    </div>

    <div class="input-group inputvbit">
    <span class="input-group-addon">V Bit: Diameter</span>
    <input type="number" class="form-control input-sm" value="10" id="tvbitdia`+toolpathid+`"  objectseq="`+toolpathid+`" min="0">
    <span class="input-group-addon">mm</span>
    </div>

    <div class="input-group inputvbit">
    <span class="input-group-addon">V Bit: Height</span>
    <input type="number" class="form-control input-sm" value="10" id="tvbitheight`+toolpathid+`"  objectseq="`+toolpathid+`" min="0">
    <span class="input-group-addon">mm</span>
    </div>

    <div class="input-group inputvbit">
    <span class="input-group-addon">V Bit: V Angle</span>
    <input type="number" class="form-control input-sm" value="90" id="tvbitangle`+toolpathid+`"  objectseq="`+toolpathid+`" min="0">
    <span class="input-group-addon">deg</span>
    </div>

    </div>

    <div class="form-group inputraster" >
    <label >Raster: Proportional Feedrate</label>
    <div class="input-group">
    <span class="input-group-addon">Light</span>
    <input type="number" class="form-control input-sm"  value="20" id="tfeedRateW`+toolpathid+`" objectseq="`+toolpathid+`">
    <span class="input-group-addon">mm/s</span>
    </div>
    <div class="input-group">
    <span class="input-group-addon">Dark</span>
    <input type="number" class="form-control input-sm"  value="20" id="tfeedRateB`+toolpathid+`" objectseq="`+toolpathid+`">
    <span class="input-group-addon">mm/s</span>
    </div>
    </div>

    <div class="form-group inputraster">
    <label>Laser Power Constraints</label>
    <div class="input-group">
    <span class="input-group-addon">Min</span>
    <input type="number"  min="0" max="100" class="form-control input-sm" value="0" id="tminpwr`+toolpathid+`" objectseq="`+toolpathid+`">
    <span class="input-group-addon">%</span>
    </div>
    <div class="input-group">
    <span class="input-group-addon">Max</span>
    <input type="number"  min="0" max="100" class="form-control input-sm" value="100" id="tmaxpwr`+toolpathid+`" objectseq="`+toolpathid+`">
    <span class="input-group-addon">%</span>
    </div>
    </div>

    <div class="form-group inputvbit">
    <label>Feedrate</label>

    <div class="input-group">
    <span class="input-group-addon">Feedrate: Cut</span>
    <input type="number" class="form-control" value="6" id="tspeed`+toolpathid+`" objectseq="`+toolpathid+`" min="0" step="1" >
    <span class="input-group-addon">mm/s</span>
    </div>

    <div class="input-group">
    <span class="input-group-addon">Feedrate: Plunge</span>
    <input type="number" class="form-control" value="2" id="tplungespeed`+toolpathid+`" objectseq="`+toolpathid+`" min="0" step="1">
    <span class="input-group-addon">mm/s</span>
    </div>
    </div>

    <button type="button" class="btn btn-lg btn-success" data-dismiss="modal">Save Parameters </button>
    `
    $('#statusBody2').html(template2);
    $('#statusBody').prepend(svgcnctool);
    laserRasterMode();
}


function laserMode() {
    $('#svgLaserGrp').show()
    $('#svgCNCFlatBit').hide()
    $('#svgCNCVbit').hide()
    $('#svgKnifeGrp').hide()
    $('#svgKnifeView').hide()
    $('#svgRasterPeck').hide()

    $('#svgOutside').hide()
    $('#svgInside').hide()
    $('#svgPocket').hide()
    $('#svgToolpath').show();
    $('#svgLaserRasterToolpath').hide()

    $('#svgZGrp').show();
    $('#svgzmulti').show();
    $('#svgzClearance').hide();

    $('.inputcnc').hide();
    $('.inputlaser').show();
    $('.inputdragknife').hide();
    $('.inputvbit').hide();
    $('#svgOpName').text("Laser");
};

function laserRasterMode() {
    $('#svgLaserGrp').show()
    $('#svgCNCFlatBit').hide()
    $('#svgCNCVbit').hide()
    $('#svgKnifeGrp').hide()
    $('#svgKnifeView').hide()
    $('#svgRasterPeck').show()

    $('#svgOutside').hide()
    $('#svgInside').hide()
    $('#svgPocket').hide()
    $('#svgToolpath').hide();

    $('#svgZGrp').hide();
    $('#svgzmulti').hide();
    $('#svgzClearance').hide();

    $('.inputcnc').hide();
    $('.inputlaser').hide();
    $('.inputdragknife').hide();
    $('.inputvbit').hide();
    $('.inputraster').show();
    $('#svgOpName').text("Laser Raster");
    $('#svgLaserRasterToolpath').show()
};


function laserInsideMode() {
    $('#svgLaserGrp').show()
    $('#svgCNCFlatBit').hide()
    $('#svgCNCVbit').hide()
    $('#svgKnifeGrp').hide()
    $('#svgKnifeView').hide()
    $('#svgRasterPeck').hide()

    $('#svgOutside').hide()
    $('#svgInside').show()
    $('#svgPocket').hide()
    $('#svgToolpath').show();
    $('#svgLaserRasterToolpath').hide()

    $('#svgZGrp').show();
    $('#svgzmulti').show();
    $('#svgzClearance').hide();

    $('.inputcnc').hide();
    $('.inputlaser').show();
    $('.inputdragknife').hide();
    $('.inputvbit').hide();  $('#svgOpName').text("Inside");
};

function laserOutsideMode() {
    $('#svgLaserGrp').show()
    $('#svgCNCFlatBit').hide()
    $('#svgCNCVbit').hide()
    $('#svgKnifeGrp').hide()
    $('#svgKnifeView').hide()
    $('#svgRasterPeck').hide()

    $('#svgOutside').show()
    $('#svgInside').hide()
    $('#svgPocket').hide()
    $('#svgToolpath').show();
    $('#svgLaserRasterToolpath').hide()

    $('#svgZGrp').show();
    $('#svgzmulti').show();
    $('#svgzClearance').hide();

    $('.inputcnc').hide();
    $('.inputlaser').show();
    $('.inputdragknife').hide();
    $('.inputvbit').hide();
    $('#svgOpName').text("Outside");
};

function cncInsideMode() {
    $('#svgLaserGrp').hide()
    $('#svgCNCFlatBit').show()
    $('#svgCNCVbit').hide()
    $('#svgKnifeGrp').hide()
    $('#svgKnifeView').hide()
    $('#svgRasterPeck').hide()

    $('#svgOutside').hide()
    $('#svgInside').show()
    $('#svgPocket').hide()
    $('#svgToolpath').show();
    $('#svgLaserRasterToolpath').hide()

    $('#svgZGrp').show();
    $('#svgzmulti').show();
    $('#svgzClearance').show();

    $('.inputlaser').hide();
    $('.inputcnc').show();
    $('.inputdragknife').hide();
    $('.inputvbit').hide();
    $('#svgOpName').text("Inside");
};

function cncOutsideMode() {
    $('#svgLaserGrp').hide()
    $('#svgCNCFlatBit').show()
    $('#svgCNCVbit').hide()
    $('#svgKnifeGrp').hide()
    $('#svgKnifeView').hide()
    $('#svgRasterPeck').hide()

    $('#svgOutside').show()
    $('#svgInside').hide()
    $('#svgPocket').hide()
    $('#svgToolpath').show();
    $('#svgLaserRasterToolpath').hide()

    $('#svgZGrp').show();
    $('#svgzmulti').show();
    $('#svgzClearance').show();

    $('.inputlaser').hide();
    $('.inputcnc').show();
    $('.inputdragknife').hide();
    $('.inputvbit').hide();
    $('#svgOpName').text("Outside");
};

function cncPocketMode() {
    $('#svgLaserGrp').hide()
    $('#svgCNCFlatBit').show()
    $('#svgCNCVbit').hide()
    $('#svgKnifeGrp').hide()
    $('#svgKnifeView').hide()
    $('#svgRasterPeck').hide()

    $('#svgOutside').hide()
    $('#svgInside').hide()
    $('#svgPocket').show()
    $('#svgToolpath').show();
    $('#svgLaserRasterToolpath').hide()

    $('#svgZGrp').show();
    $('#svgzmulti').show();
    $('#svgzClearance').show();

    $('.inputlaser').hide();
    $('.inputcnc').show();
    $('.inputdragknife').hide();
    $('.inputvbit').hide();
    $('#svgOpName').text("Pocket");
};


function cncVEngMode() {
    $('#svgLaserGrp').hide()
    $('#svgCNCFlatBit').hide()
    $('#svgCNCVbit').show()
    $('#svgKnifeGrp').hide()
    $('#svgKnifeView').hide()
    $('#svgRasterPeck').hide()

    $('#svgOutside').hide()
    $('#svgInside').hide()
    $('#svgPocket').hide()
    $('#svgToolpath').show();
    $('#svgLaserRasterToolpath').hide()

    $('#svgZGrp').show();
    $('#svgzmulti').hide();
    $('#svgzClearance').show();

    $('.inputcnc').hide();
    $('.inputlaser').hide();
    $('.inputdragknife').hide();
    $('.inputvbit').show();
    $('#svgOpName').text("V Cutter");
};

function cncVRasterMode() {
    $('#svgLaserGrp').hide()
    $('#svgCNCFlatBit').hide()
    $('#svgCNCVbit').show()
    $('#svgKnifeGrp').hide()
    $('#svgKnifeView').hide()
    $('#svgRasterPeck').show()

    $('#svgOutside').hide()
    $('#svgInside').hide()
    $('#svgPocket').hide()
    $('#svgToolpath').hide();
    $('#svgLaserRasterToolpath').hide()

    $('#svgZGrp').hide();
    $('#svgzmulti').hide();
    $('#svgzClearance').hide();

    $('.inputcnc').hide();
    $('.inputlaser').hide();
    $('.inputdragknife').hide();
    $('.inputvbit').show();
    $('.inputraster').hide();
    $('#svgOpName').text("V Peck");
};

function dragKnifeMode() {
    $('#svgLaserGrp').hide()
    $('#svgCNCFlatBit').hide()
    $('#svgCNCVbit').hide()
    $('#svgKnifeGrp').show()
    $('#svgKnifeView').show()
    $('#svgRasterPeck').hide()

    $('#svgOutside').hide()
    $('#svgInside').hide()
    $('#svgPocket').hide()
    $('#svgToolpath').hide();
    $('#svgLaserRasterToolpath').hide()

    $('#svgZGrp').hide();
    $('#svgzmulti').hide();
    $('#svgzClearance').hide();

    $('.inputcnc').hide();
    $('.inputlaser').hide();
    $('.inputdragknife').show();
    $('.inputvbit').hide();
    $('#svgOpName').text("Drag Knife");
};
