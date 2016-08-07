var toolpathsInScene = [];

function initTree() {
  $('#filetree').on('keyup change','input', function() {
    var inputVal = $(this).val();
    var newval = parseFloat(inputVal, 3)
    var id = $(this).attr('id');
    var objectseq = $(this).attr('objectseq');
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
      objectsInScene[objectseq].scale.x = svgscale;
      objectsInScene[objectseq].scale.y = svgscale;
      objectsInScene[objectseq].scale.z = svgscale;
      putFileObjectAtZero(objectsInScene[objectseq]);
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
  });

  $('#statusBody2').on('keyup change','select', function() {
    var newval = $(this).val();
    var id = $(this).attr('id');
    var objectseq = $(this).attr('objectseq');
    console.log('Value for ' +id+ ' changed to ' +newval+ ' for object ' +objectseq );
    if ( id.indexOf('roperation') == 0 ) {
      if (newval == "Laser: Engrave") {
        laserRasterMode();
        updateCamUserData(objectseq);
      } else if (newval == "CNC: V Peck") {
        cncVRasterMode();
        updateCamUserData(objectseq);
      } else if (newval == "CNC: V Wave") {
        cncVRasterMode();
        updateCamUserData(objectseq);
      }
    };
  });

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
  toolpathsInScene[i].userData.camOperation = "Raster";
  toolpathsInScene[i].userData.rasterMinPwr = $('#tminpwr'+i).val();
  toolpathsInScene[i].userData.rasterMaxPwr = $('#tmaxpwr'+i).val();
  toolpathsInScene[i].userData.rasterBlackFeedrate = $('#tfeedRateB'+i).val();
  toolpathsInScene[i].userData.rasterWhiteFeedrate = $('#tfeedRateW'+i).val();
};

function fillTree() {
  $('#filetree').empty();

  if (objectsInScene.length > 0) {

    var header = `
    <table style="width: 100%">
      <tr class="jobsetupfile">
        <td>
          <label for="filetreetable">Objects</label>
        </td>
        <td>
          <a class="btn btn-xs btn-success" onclick="addJob();"><i class="fa fa-plus" aria-hidden="true"></i> Add selection to Job</a>
        </td>
      </tr>
    </table>
    <table class="jobsetuptable" style="width: 100%" id="filetreetable">
    `

    $('#filetree').append(header);
    for (i = 0; i < objectsInScene.length; i++) {

      var xoffset = objectsInScene[i].userData.offsetX.toFixed(1);
      var yoffset = objectsInScene[i].userData.offsetY.toFixed(1);
      var xpos = objectsInScene[i].position.x.toFixed(1);
      var ypos = objectsInScene[i].position.y.toFixed(1);
      var scale = objectsInScene[i].scale.y;
      if (objectsInScene[i].name.indexOf('.svg') != -1) {
        var svgscale = objectsInScene[i].scale.x
      }

      if (objectsInScene[i].type != "Mesh") {
        var file = `
        <tr class="jobsetupfile topborder">
          <td>
            <i class="fa fa-fw fa-file-text-o" aria-hidden="true"></i>&nbsp;
            <a class="entity" href="#" onclick="attachBB(objectsInScene[`+i+`]);"><b>` + objectsInScene[i].name + `</b></a>
          </td>
          <td id="buttons`+i+`">
            <a class="btn btn-xs btn-primary" onclick="$('#move`+i+`').toggle(); $(this).toggleClass('active');"><i class="fa fa-arrows" aria-hidden="true"></i></a>
            <a class="btn btn-xs btn-danger" onclick="objectsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
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
          <td>
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
              <input type="number" class="form-control input-xs" value="`+(25.4/scale)+`" id="rasterDPI`+i+`" objectseq="`+i+`">
              <span class="input-group-addon input-group-addon-xs">DPI</span>
            </div>
          </td>
        </tr>
        `
      }


      $('#filetreetable').append(file)

      if (svgscale) {
        var svgfile =`
        <tr class="jobsetupfile" id="scale`+i+`" style="display: none;">
          <td colspan="3">
            <label>SVG Resolution</label>
            <div class="input-group">
              <input type="number" class="form-control input-xs" value="`+(25.4/svgscale)+`" id="svgresol`+i+`" objectseq="`+i+`">
              <span class="input-group-addon input-group-addon-xs">DPI</span>
            </div>
          </td>
        </tr>`
        $('#filetreetable').append(svgfile)

        var scalebtn = `<a class="btn btn-xs btn-primary" onclick="$('#scale`+i+`').toggle(); $(this).toggleClass('active');"><i class="fa fa-expand" aria-hidden="true"></i></a>`
        $('#buttons'+i).prepend(scalebtn)


      }

      //  var name = objectsInScene[i].name;
       for (j = 0; j < objectsInScene[i].children.length; j++) {

         var child = `
         <tr class="jobsetupchild children`+i+`">
           <td>
            <i class="fa fa-fw fa-sm fa-object-ungroup" aria-hidden="true"></i>&nbsp;
            <a class="entity" href="#" onclick="attachBB(objectsInScene[`+i+`].children[`+j+`])" id="link`+i+`_`+j+`">`+objectsInScene[i].children[j].name+`</a>
          </td>
          <td>
            <a class="btn btn-xs btn-danger" onclick="objectsInScene[`+i+`].remove(objectsInScene[`+i+`].children[`+j+`]); fillTree();"><i class="fa fa-times" aria-hidden="true"></i></a>
          </td>
          <td>
            <input type="checkbox" value="" class="chkaddjob chkchildof`+i+`" id="child.`+i+`.`+j+`" />
          </td>
         </tr>
         `
         $('#filetreetable').append(child)
        //  var name = objectsInScene[i].children[j].name;
        objectsInScene[i].children[j].userData.link = "link"+i+"_"+j
       }
    }
    var tableend = `
    </table>
    `
    $('#filetree').append(tableend)
  } // End of if (objectsInScene.length > 0)

  if (toolpathsInScene.length > 0) {
    var toolpatheader = `
    <hr>

    <table style="width: 100%">
      <tr class="jobsetupfile">
        <td>
          <label for="toolpathstable">Toolpaths</label>
        </td>
        <td>
          <a class="btn btn-xs btn-success"><i class="fa fa-cubes" aria-hidden="true"></i> Generate G-Code</a>
        </td>
      </tr>
    </table>
    <table class="jobsetuptable" style="width: 100%" id="toolpathstable">
    `
    $('#filetree').append(toolpatheader)
    for (i = 0; i < toolpathsInScene.length; i++) {
      if (toolpathsInScene[i].type != "Mesh") {
        var toolp = `<tr class="jobsetupfile">
          <td>
            <i class="fa fa-fw fa-object-group" aria-hidden="true"></i>&nbsp;
            <a class="entity-job" href="#">`+toolpathsInScene[i].name+`</a>
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
            <a class="entity-job" href="#">`+toolpathsInScene[i].name+`</a>
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
    var tableend = `
    </table>
    `
    $('#toolpathstable').append(tableend)
  } // End of if (toolpathsInScene.length > 0)

}



function addJob() {
  var toolpath = new THREE.Group();
  $(".chkaddjob").each(function(){

    resetColors() // Set all colors back to original

      var $this = $(this);

      if($this.is(":checked")){
          // console.log($this.attr("id"));
          var id = $this.attr("id");
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
  for (var x = 6; x < total; x++) {
    // console.log('Removing ' + scene.children[x].name + ' from scene')
    scene.remove(scene.children[x]);
  }
  var total = scene.children.length
  for (var x = 6; x < total; x++) {
    // console.log('Removing ' + scene.children[x].name + ' from scene')
    scene.remove(scene.children[x]);
  }
}

function resetColors() {
  for (i = 0; i < objectsInScene.length; i++) {
    for (j = 0; j < objectsInScene[i].children.length; j++) {
      objectsInScene[i].children[j].material.color.setHex(objectsInScene[i].children[j].userData.color);
    }
  }
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
        <input type="number" class="form-control" id="tzstep`+toolpathid+`" value="1" objectseq="`+toolpathid+`" min="0" step="1">
        <span class="input-group-addon">mm</span>
      </div>

      <div class="input-group inputcnc inputlaser">
        <span class="input-group-addon">Cut Depth Final</span>
        <input type="number" class="form-control" id="tzdepth`+toolpathid+`" value="1" objectseq="`+toolpathid+`" min="0" step="1">
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
          <option>CNC: V Wave</option>
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
  </div>

  <div class="form-group">
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
  <div class="form-group">
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

  $('#svgOutside').hide()
  $('#svgInside').hide()
  $('#svgPocket').hide()
  $('#svgToolpath').show();

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
  $('#svgOpName').text("");
};


function laserInsideMode() {
  $('#svgLaserGrp').show()
  $('#svgCNCFlatBit').hide()
  $('#svgCNCVbit').hide()
  $('#svgKnifeGrp').hide()
  $('#svgKnifeView').hide()

  $('#svgOutside').hide()
  $('#svgInside').show()
  $('#svgPocket').hide()
  $('#svgToolpath').show();

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

  $('#svgOutside').show()
  $('#svgInside').hide()
  $('#svgPocket').hide()
  $('#svgToolpath').show();

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

  $('#svgOutside').hide()
  $('#svgInside').show()
  $('#svgPocket').hide()
  $('#svgToolpath').show();

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

  $('#svgOutside').show()
  $('#svgInside').hide()
  $('#svgPocket').hide()
  $('#svgToolpath').show();

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

  $('#svgOutside').hide()
  $('#svgInside').hide()
  $('#svgPocket').show()
  $('#svgToolpath').show();

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

  $('#svgOutside').hide()
  $('#svgInside').hide()
  $('#svgPocket').hide()
  $('#svgToolpath').show();

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
  $('.inputvbit').show();
  $('#svgOpName').text("");
};

function dragKnifeMode() {
  $('#svgLaserGrp').hide()
  $('#svgCNCFlatBit').hide()
  $('#svgCNCVbit').hide()
  $('#svgKnifeGrp').show()
  $('#svgKnifeView').show()

  $('#svgOutside').hide()
  $('#svgInside').hide()
  $('#svgPocket').hide()
  $('#svgToolpath').hide();

  $('#svgZGrp').hide();
  $('#svgzmulti').hide();
  $('#svgzClearance').hide();

  $('.inputcnc').hide();
  $('.inputlaser').hide();
  $('.inputdragknife').show();
  $('.inputvbit').hide();
  $('#svgOpName').text("Drag Knife");
};

var svgcnctool = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   version="1.1"
   id="svg4163"
   viewBox="0 0 446.4567 141.73229"
   height="40mm"
   width="126mm"
   inkscape:version="0.91 r13725"
   sodipodi:docname="cnctoolpath.svg">
  <sodipodi:namedview
     pagecolor="#ffffff"
     bordercolor="#666666"
     borderopacity="1"
     objecttolerance="10"
     gridtolerance="10"
     guidetolerance="10"
     inkscape:pageopacity="0"
     inkscape:pageshadow="2"
     inkscape:window-width="1920"
     inkscape:window-height="1017"
     id="namedview61"
     showgrid="false"
     inkscape:zoom="2"
     inkscape:cx="2.4740211"
     inkscape:cy="67.11264"
     inkscape:window-x="1912"
     inkscape:window-y="-8"
     inkscape:window-maximized="1"
     inkscape:current-layer="g4235" />
  <defs
     id="defs4165">
    <marker
       refY="0"
       refX="0"
       style="overflow:visible"
       id="DistanceX"
       orient="auto">
      <path
         style="stroke:#000000;stroke-width:0.5"
         d="M 3,-3 -3,3 M 0,-5 0,5"
         id="path4801"
         inkscape:connector-curvature="0" />
    </marker>
    <pattern
       height="8"
       width="8"
       patternUnits="userSpaceOnUse"
       y="0"
       x="0"
       id="Hatch">
      <path
         linecap="square"
         stroke="#000000"
         stroke-width="0.25"
         d="M8 4 l-4,4"
         id="path4804" />
      <path
         linecap="square"
         stroke="#000000"
         stroke-width="0.25"
         d="M6 2 l-4,4"
         id="path4806" />
      <path
         linecap="square"
         stroke="#000000"
         stroke-width="0.25"
         d="M4 0 l-4,4"
         id="path4808" />
    </pattern>
  </defs>
  <metadata
     id="metadata4168">
    <rdf:RDF>
      <cc:Work
         rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
        <dc:title />
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <g
     id="g4810"
     transform="translate(0,-212.59843)" />
  <text
     sodipodi:linespacing="125%"
     xml:space="preserve"
     style="font-style:normal;font-weight:normal;font-size:40px;line-height:125%;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
     x="396.09375"
     y="-122.33018"
     id="text4893"><tspan
       id="tspan4895"
       x="396.09375"
       y="-122.33018" /></text>
  <g
     id="svgZGrp"
     transform="translate(228.3526,-110.26577)">
    <text
       id="svgZFinal"
       y="217.55241"
       x="-74.699562"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       xml:space="preserve"
       sodipodi:linespacing="125%"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
         y="217.55241"
         x="-74.699562"
         id="tspan4913">25mm</tspan></text>
    <path
       id="path4929"
       d="m -116.53838,205.90064 12.94046,0 0,42.9047 -13.07959,0"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:2.36754084;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       inkscape:connector-curvature="0" />
    <path
       id="path4933"
       d="m -103.94788,221.42214 0,-8.7891 23.828121,0"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       inkscape:connector-curvature="0" />
  </g>
  <g
     id="svgzmulti"
     transform="translate(483.61815,-112.13709)">
    <path
       id="path4871"
       d="m -381.91876,239.72157 -12.08162,-0.066"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       inkscape:connector-curvature="0" />
    <text
       id="svgZDepth"
       y="197.08801"
       x="-330.31866"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       xml:space="preserve"
       sodipodi:linespacing="125%"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
         y="197.08801"
         x="-330.31866"
         id="tspan4909">5mm per pass</tspan></text>
    <path
       id="path4931"
       d="m -381.45908,218.95767 0,-26.95315 46.09375,0"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       inkscape:connector-curvature="0" />
    <path
       id="path4865"
       d="m -394.00061,251.80877 12.29132,0.068 0.26164,-47.64617 -12.29131,-0.0675"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       inkscape:connector-curvature="0" />
    <path
       id="path4867"
       d="m -381.88529,214.76447 -11.98059,-0.066"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       inkscape:connector-curvature="0" />
    <path
       id="path4869"
       d="m -381.78032,227.08537 -12.36075,0"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       inkscape:connector-curvature="0" />
  </g>
  <g
     id="svgCNCFlatBit"
     transform="translate(380.52125,247.87751)">
    <path
       inkscape:connector-curvature="0"
       id="path4823"
       d="m -369.34499,-156.26431 14.54524,0 -0.27622,44.66938 43.93411,-0.1381 0.27621,-44.71271 16.70604,-0.20971"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4849"
       d="m -356.32553,-220.55121 0.0137,16.38768 0.0561,12.55643 49.25412,-0.0642 0,-24.83493 -0.1381,-20.66349"
       style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4851"
       d="m -307.37833,-216.03105 76.10167,-0.0809"
       style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <text
       sodipodi:linespacing="125%"
       id="svgToolDia"
       y="-211.46725"
       x="-225.0869"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       xml:space="preserve"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
         y="-211.46725"
         x="-225.0869"
         id="tspan4899">6.35mm</tspan><tspan
         id="tspan4182"
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
         y="-192.71725"
         x="-225.0869" /></text>
    <path
       inkscape:connector-curvature="0"
       id="path4174"
       d="m -312.49911,-243.69463 0,42.99979 -38.72779,0 0.39063,-42.43636 9.07701,7.0511 5.88203,-7.07361 7.32121,7.63704 4.05022,-8.30309 4.73482,4.56964 z"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4176"
       d="m -351.47416,-209.13102 38.39368,-13.81068"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4178"
       d="m -336.55863,-201.94946 c 2.76214,0 23.47815,-9.11505 23.47815,-9.11505"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4180"
       d="m -350.64552,-223.77034 38.11747,-13.81068"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
  </g>
  <rect
     style="fill:#ff0000;fill-opacity:0;stroke:#ff0000;stroke-width:1.84457076;stroke-miterlimit:4;stroke-dasharray:none"
     id="svgToolpath"
     width="114.21847"
     height="89.590302"
     x="308.72006"
     y="18.14473"
     ry="13.272638" />
  <rect
     style="fill:#ff0000;fill-opacity:0;stroke:#0000ff;stroke-width:2.23900008;stroke-miterlimit:4;stroke-dasharray:2.23900015, 2.23900015;stroke-dashoffset:0"
     id="svgOutside"
     width="138.17609"
     height="109.13578"
     x="297.19955"
     y="8.7037497"
     ry="16.168264" />
  <rect
     style="fill:#ff0000;fill-opacity:0;stroke:#0000ff;stroke-width:1.51533973;stroke-miterlimit:4;stroke-dasharray:1.51533978, 1.51533978;stroke-dashoffset:0"
     id="svgInside"
     width="95.214546"
     height="72.530975"
     x="318.30536"
     y="26.197523"
     ry="10.74533" />
  <g
     id="svgPocket"
     transform="matrix(1.0013674,0,0,0.84944881,-276.34691,-849.99524)">
    <g
       id="g4380"
       transform="translate(-4.9096098,90.563331)">
      <rect
         style="fill:#ff0000;fill-opacity:0;stroke:#0000ff;stroke-width:1.78147352;stroke-miterlimit:4;stroke-dasharray:1.78147351, 1.78147351;stroke-dashoffset:0"
         id="rect4184-5-0"
         width="95.084534"
         height="85.385933"
         x="598.74683"
         y="940.52863"
         ry="12.649768" />
      <rect
         style="fill:#ff0000;fill-opacity:0;stroke:#0000ff;stroke-width:1.57558465;stroke-miterlimit:4;stroke-dasharray:1.5755847, 1.5755847;stroke-dashoffset:0"
         id="rect4184-5-0-9"
         width="83.555679"
         height="76.005516"
         x="604.51123"
         y="944.92584"
         ry="11.260077" />
      <rect
         style="fill:#ff0000;fill-opacity:0;stroke:#0000ff;stroke-width:1.35175025;stroke-miterlimit:4;stroke-dasharray:1.35175022, 1.35175022;stroke-dashoffset:0"
         id="rect4184-5-0-9-7"
         width="72.043373"
         height="64.883835"
         x="610.46271"
         y="950.19373"
         ry="9.612421" />
      <rect
         style="fill:#ff0000;fill-opacity:0;stroke:#0000ff;stroke-width:1.13730586;stroke-miterlimit:4;stroke-dasharray:1.13730582, 1.13730582;stroke-dashoffset:0"
         id="rect4184-5-0-9-7-6"
         width="61.027447"
         height="54.220955"
         x="616.49939"
         y="956.07275"
         ry="8.0327358" />
      <rect
         style="fill:#ff0000;fill-opacity:0;stroke:#0000ff;stroke-width:0.91963297;stroke-miterlimit:4;stroke-dasharray:0.91963296, 0.91963296;stroke-dashoffset:0"
         id="rect4184-5-0-9-7-6-7"
         width="50.041553"
         height="43.235065"
         x="622.76917"
         y="961.41504"
         ry="6.4051967" />
      <rect
         style="fill:#ff0000;fill-opacity:0;stroke:#0000ff;stroke-width:0.31652647;stroke-miterlimit:4;stroke-dasharray:0.31652647, 0.31652647;stroke-dashoffset:0"
         id="rect4184-5-0-9-7-6-8"
         width="18.543131"
         height="13.822125"
         x="639.06384"
         y="975.91437"
         ry="2.0477226" />
      <rect
         style="fill:#ff0000;fill-opacity:0;stroke:#0000ff;stroke-width:0.46831697;stroke-miterlimit:4;stroke-dasharray:0.46831698, 0.46831698;stroke-dashoffset:0"
         id="rect4184-5-0-9-7-6-8-7"
         width="26.244591"
         height="21.378538"
         x="635.04993"
         y="971.84332"
         ry="3.1671915" />
      <rect
         style="fill:#ff0000;fill-opacity:0;stroke:#0000ff;stroke-width:0.59979939;stroke-miterlimit:4;stroke-dasharray:0.59979937, 0.59979937;stroke-dashoffset:0"
         id="rect4184-5-0-9-7-6-8-7-2"
         width="33.32164"
         height="27.620003"
         x="631.41028"
         y="968.73926"
         ry="4.0918531" />
      <rect
         style="fill:#ff0000;fill-opacity:0;stroke:#0000ff;stroke-width:0.74892002;stroke-miterlimit:4;stroke-dasharray:0.74892005, 0.74892005;stroke-dashoffset:0"
         id="rect4184-5-0-9-7-6-8-7-2-1"
         width="41.360172"
         height="34.691788"
         x="627.10986"
         y="965.41052"
         ry="5.1395249" />
    </g>
  </g>
  <text
     sodipodi:linespacing="125%"
     xml:space="preserve"
     x="343.36798"
     y="137.31038"
     id="svgOpName"
     inkscape:label="#text4368"><tspan
       id="tspan4370"
       x="343.36798"
       y="137.31038">Pocket</tspan></text>
  <g
     id="svgKnifeGrp"
     inkscape:label="#g4341"
     transform="translate(173.4606,-127.16365)">
    <path
       inkscape:connector-curvature="0"
       id="path4195"
       d="m -168.50164,219.09399 113.967555,0"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       sodipodi:nodetypes="ccccscccccsccc"
       inkscape:connector-curvature="0"
       id="path4203"
       d="m -145.56379,137.1404 0.21338,42.30401 15.43135,8.16574 7.77818,0 15.01085,-7.86656 c 0.58913,-0.30875 0.28032,-43.13352 0.28032,-43.13352 l -6.54072,3.53554 -6.01041,-4.06587 -1.94455,5.65686 -7.42462,-6.36396 c 0,0 0,7.24784 -0.88388,7.42462 -0.88388,0.17677 -10.07627,-6.36396 -10.07627,-6.36396 l -2.2981,4.59619 z"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       sodipodi:nodetypes="cccc"
       inkscape:connector-curvature="0"
       id="path4205"
       d="m -129.84767,188.17893 0,16.65806 7.90041,-14.24569 0.0205,-2.42033"
       style="fill:#999999;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4207"
       d="m -130.71455,207.58591 0,4.41942 4.94975,0 0,-4.24264"
       style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4209"
       d="m -126.26964,211.96188 37.875004,0 0.125,-24.5 62.125001,0"
       style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <text
       inkscape:label="#text4211"
       sodipodi:linespacing="125%"
       id="dragKnifeRadius"
       y="191.77438"
       x="-19.20715"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       xml:space="preserve"><tspan
         style="font-size:15px"
         y="191.77438"
         x="-19.20715"
         id="tspan4213"
         sodipodi:role="line">0.1mm</tspan></text>
    <path
       inkscape:connector-curvature="0"
       id="path4276"
       d="m -125.96832,206.68312 0.0749,-6.89125"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:0.88800001;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:0.888, 1.776;stroke-dashoffset:0;stroke-opacity:1"
       sodipodi:nodetypes="cc" />
  </g>
  <g
     id="svgKnifeView"
     inkscape:label="#g4402"
     transform="translate(135.50001,-165.5)">
    <rect
       ry="0"
       y="182.39397"
       x="172.71388"
       height="89.442963"
       width="114.54527"
       id="rect4386"
       style="fill:none;fill-opacity:1;stroke:#ff0000;stroke-width:2.00600004;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0" />
    <path
       sodipodi:nodetypes="ccccccccccccccccccccc"
       inkscape:connector-curvature="0"
       id="path4400"
       d="m 183.94828,180.25888 117.79332,0.36428 -0.76777,4.85507 -2.66942,4.0962 -5.20863,2.71599 -3.35875,0.53033 -1.00889,91.97198 -5.3033,-0.16422 -3.97119,-2.10875 -2.75,-3.89797 -1.59099,-4.78554 -117.3635,-0.0518 0.20711,-4.88541 3.0052,-4.80698 4.50153,-2.50521 4.77297,0 0.70711,-91.7471 4.82474,0.36244 4.4512,2.19324 2.88611,4.19584 0.75889,3.66942"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:2.50000007, 2.50000007;stroke-dashoffset:0;stroke-opacity:1" />
  </g>
  <g
     id="svgzClearance"
     transform="translate(306.39066,44.191344)">
    <g
       id="svgzC">
      <path
         style="fill:none;fill-rule:evenodd;stroke:#008000;stroke-width:0.97431153px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
         d="m -233.90621,48.51138 10.4442,0 0.0692,-42.68627 -10.30719,0"
         id="path4891-8"
         inkscape:connector-curvature="0" />
      <path
         style="fill:none;fill-rule:evenodd;stroke:#008000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
         d="m -223.80562,16.91137 62.92943,0.0572"
         id="path4901-8"
         inkscape:connector-curvature="0"
         sodipodi:nodetypes="cc" />
      <text
         xml:space="preserve"
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
         x="-155.14944"
         y="21.256159"
         id="svgZClear-8"
         sodipodi:linespacing="125%"><tspan
           id="tspan4905-6"
           x="-155.14944"
           y="21.256159"
           style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif">10mm</tspan></text>
    </g>
  </g>
  <g
     id="svgLaserGrp"
     inkscape:label="#g4259"
     transform="translate(-260.5,161.5)">
    <path
       inkscape:connector-curvature="0"
       id="path4418"
       d="m 263.01786,-70.0947 108.00782,0"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4420"
       d="m 285.53601,-156.78976 0,43.94532 19.33594,17.96874 19.14062,-17.87109 0.19531,-43.65234"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4424"
       d="m 304.77429,-92.23897 0,19.33594"
       style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:0.99999994;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:0.99999997, 0.99999997;stroke-dashoffset:0;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4278"
       d="m 285.69906,-115.5337 38.00699,0"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4280"
       d="m 285.52227,-123.31187 37.47667,0"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4282"
       d="m 285.96193,-156.07844 2.875,-4.5 6.375,7.375 6.875,-7.375 8.375,8.75 5.5,-7.25 8.125,3.625"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       sodipodi:nodetypes="cccc"
       inkscape:connector-curvature="0"
       id="path4404"
       d="m 306.07832,-81.01808 39.95153,0.17677 -0.35355,-40.48186 66.11448,0.70711"
       style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <text
       sodipodi:linespacing="125%"
       id="svgToolDia-4"
       y="-116.61823"
       x="412.74612"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       xml:space="preserve"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
         y="-116.61823"
         x="412.74612"
         id="tspan4899-6">0.12mm</tspan><tspan
         id="tspan4182-0"
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
         y="-97.868233"
         x="412.74612" /></text>
  </g>
  <g
     id="svgCNCVbit"
     transform="translate(-30.5,14.5)">
    <g
       id="g4235"
       inkscape:label="#svgCNCVbit"
       transform="translate(-234.75945,72.124887)">
      <g
         id="g4256"
         inkscape:label="#svgCNCVbit"
         transform="translate(286.5,82.5)">
        <path
           sodipodi:nodetypes="cccccc"
           inkscape:connector-curvature="0"
           id="path4823-9"
           d="m -8.76988,-76.6145 14.54524,0 21.22378,23.66938 1.18411,0.1119 21.52621,-23.96271 16.70604,-0.20971"
           style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <path
           inkscape:connector-curvature="0"
           id="path4849-3"
           d="m 4.24958,-140.9014 0.0137,16.38768 0.0561,12.55643 49.25412,-0.0642 0,-24.83493 -0.1381,-20.66349"
           style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <path
           inkscape:connector-curvature="0"
           id="path4851-4"
           d="m 53.19678,-156.38124 76.10167,-0.0809"
           style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <text
           sodipodi:linespacing="125%"
           id="svgVbitDia"
           y="-150.56744"
           x="131.2382"
           style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
           xml:space="preserve"><tspan
             style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
             y="-150.56744"
             x="131.2382"
             id="tspan4899-7">10.00mm</tspan><tspan
             id="tspan4182-8"
             style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
             y="-131.81744"
             x="131.2382" /></text>
        <path
           sodipodi:nodetypes="ccccccccccc"
           inkscape:connector-curvature="0"
           id="path4174-3"
           d="m 48.076,-164.04482 -0.5,25.74979 -18.65612,17.25 -19.07167,-17.5 -0.10937,-24.93636 9.07701,7.0511 5.88203,-7.07361 7.32121,7.63704 4.05022,-8.30309 4.73482,4.56964 z"
           style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <path
           sodipodi:nodetypes="ccc"
           inkscape:connector-curvature="0"
           id="path4338"
           d="m 7.96105,-103.30683 22.45064,23.68808 19.09188,-23.68808"
           style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <path
           sodipodi:nodetypes="ccccccccc"
           inkscape:connector-curvature="0"
           id="path4340"
           d="m 20.98238,-90.90381 1.4375,-1.4375 2.25,-1.4375 2.3125,-1.25 3.0625,-0.3125 3.0625,0.25 2.75,0.9375 2.1875,1.125 1.5,1.0625"
           style="fill:none;fill-rule:evenodd;stroke:#800000;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:1, 2;stroke-dashoffset:0;stroke-opacity:1" />
        <path
           inkscape:connector-curvature="0"
           id="path4344"
           d="m 81.32338,-135.12663 10.25305,0 0,19.79899 -10.96016,0"
           style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        <path
           inkscape:connector-curvature="0"
           id="path4346"
           d="m 92.42998,-132.17168 c 0.70711,0 35.88567,0 35.88567,0"
           style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
        <text
           inkscape:label="svgVbitAngle"
           sodipodi:linespacing="125%"
           id="svgVbitAngle"
           y="-85.131111"
           x="132.45406"
           style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
           xml:space="preserve">90deg</text>
        <text
           sodipodi:linespacing="125%"
           id="svgVbitHeight"
           y="-126.88111"
           x="130.95406"
           style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
           xml:space="preserve">10.00mm</text>
        <path
           inkscape:connector-curvature="0"
           id="path4446"
           d="m 18.52125,-131.8367 c 0,-1 25.25,-12.5 25.25,-12.5 l 3.25,-1.5"
           style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
        <path
           inkscape:connector-curvature="0"
           id="path4448"
           d="m 10.77125,-140.8367 36.5,-17.75"
           style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
        <path
           inkscape:connector-curvature="0"
           id="path4450"
           d="m 9.77125,-150.8367 19,-7.25"
           style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
        <path
           inkscape:connector-curvature="0"
           id="path4452"
           d="m 24.77125,-125.3367 c 1.25,-1.25 6.5,-8.75 6.5,-8.75 l 2.25,8.25"
           style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
        <path
           inkscape:connector-curvature="0"
           id="path4259"
           d="m 129.5,-90.767717 -89.75,0"
           style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
           sodipodi:nodetypes="cc" />
      </g>
    </g>
  </g>
</svg>

`
