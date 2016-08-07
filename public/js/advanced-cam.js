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
      $('#svgZClear').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if ( id.indexOf('tdragoffset') == 0 ) {
      $('#dragKnifeRadius').text(newval + 'mm');
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
      if (newval == "Laser (no path offset)") {
        laserMode();
        updateCamUserData(objectseq);
      } else if (newval == "Inside") {
        cncInsideMode();
        updateCamUserData(objectseq);
      } else if (newval == "Outside") {
        cncOutsideMode();
        updateCamUserData(objectseq);
      } else if (newval == "Pocket") {
        cncPocketMode();
        updateCamUserData(objectseq);
      } else if (newval == "Drag Knife") {
        dragKnifeMode();
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
          <option>Laser (no path offset)</option>
          <option>Inside</option>
          <option>Outside</option>
          <option>Pocket</option>
          <option>Drag Knife</option>
        </select>
      </div>
    </div>

    <div class="form-group">r
      <label class="control-label">Tool Options</label>

      <div class="input-group cnconly">
        <span class="input-group-addon">Endmill Diameter</span>
        <input type="number" class="form-control input-sm" value="6.35" id="ttooldia`+toolpathid+`"  objectseq="`+toolpathid+`" min="0.1">
        <span class="input-group-addon">mm</span>
      </div>

      <div class="input-group cnconly">
        <span class="input-group-addon">Z Safe Height</span>
        <input type="number" class="form-control input-sm" value="10" id="tclearanceHeight`+toolpathid+`"  objectseq="`+toolpathid+`" min="1">
        <span class="input-group-addon">mm</span>
      </div>

      <div class="input-group dragknifeonly">
        <span class="input-group-addon">Drag Knife: Center Offset</span>
        <input type="number" class="form-control input-sm" value="0.1" id="tdragoffset`+toolpathid+`"  objectseq="`+toolpathid+`" step="0.1" min="0.001">
        <span class="input-group-addon">mm</span>
      </div>

      <div class="input-group laseronly">
        <span class="input-group-addon">Laser: Power</span>
        <input type="number" class="form-control" value="100" id="tpwr`+toolpathid+`" objectseq="`+toolpathid+`" min="1" max="100">
        <span class="input-group-addon">%</span>
      </div>

    </div>

    <div class="form-group cnconly laseronly">
      <label>Operation Depth</label>

      <div class="input-group cnconly laseronly">
        <span class="input-group-addon">Cut Depth per pass</span>
        <input type="number" class="form-control" id="tzstep`+toolpathid+`" value="1" objectseq="`+toolpathid+`" min="0.01">
        <span class="input-group-addon">mm</span>
      </div>

      <div class="input-group cnconly laseronly">
        <span class="input-group-addon">Cut Depth Final</span>
        <input type="number" class="form-control" id="tzdepth`+toolpathid+`" value="1" objectseq="`+toolpathid+`" min="0.01">
        <span class="input-group-addon">mm</span>
      </div>

    </div>

    <div class="form-group">
      <label>Feedrate</label>

      <div class="input-group">
        <span class="input-group-addon">Feedrate: Cut</span>
        <input type="number" class="form-control" value="6" id="tspeed`+toolpathid+`" objectseq="`+toolpathid+`" min="0.1">
        <span class="input-group-addon">mm/s</span>
      </div>

      <div class="input-group cnconly">
        <span class="input-group-addon">Feedrate: Plunge</span>
        <input type="number" class="form-control" value="2" id="tplungespeed`+toolpathid+`" objectseq="`+toolpathid+`" min="0.1">
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

  $('#statusBody').html('Configure the operation for the toolpath <b>' + toolpathsInScene[toolpathid].name + '</b><hr>' );
  var template2 = `

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
}


function laserMode() {
  $('#svgPocket').hide();
  $('#svgOutside').hide();
  $('#svgInside').hide();
  $('#svgLaserGrp').show();
  $('#svgCNCGrp').hide();
  $('#svgKnifeGrp').hide();
  $('#svgDepthGrp').show();
  $('#svgToolpath').show();
  $('#svgKnifeView').hide();
  $('.cnconly').hide();
  $('.laseronly').show();
  $('.dragknifeonly').hide();
  $('#svgOpName').text("Laser");
};

function cncInsideMode() {
  $('#svgPocket').hide();
  $('#svgOutside').hide();
  $('#svgInside').show();
  $('#svgLaserGrp').hide();
  $('#svgCNCGrp').show();
  $('#svgKnifeGrp').hide();
  $('#svgDepthGrp').show();
  $('#svgToolpath').show();
  $('#svgKnifeView').hide();
  $('.laseronly').hide();
  $('.cnconly').show();
  $('.dragknifeonly').hide();
  $('#svgOpName').text("Inside");
};

function cncOutsideMode() {
  $('#svgPocket').hide();
  $('#svgOutside').show();
  $('#svgInside').hide();
  $('#svgLaserGrp').hide();
  $('#svgCNCGrp').show();
  $('#svgKnifeGrp').hide();
  $('#svgDepthGrp').show();
  $('#svgToolpath').show();
  $('#svgKnifeView').hide();
  $('.laseronly').hide();
  $('.cnconly').show();
  $('.dragknifeonly').hide();
  $('#svgOpName').text("Outside");
};

function cncPocketMode() {
  $('#svgPocket').show();
  $('#svgOutside').hide();
  $('#svgInside').hide();
  $('#svgLaserGrp').hide();
  $('#svgCNCGrp').show();
  $('#svgKnifeGrp').hide();
  $('#svgDepthGrp').show();
  $('#svgToolpath').show();
  $('#svgKnifeView').hide();
  $('.laseronly').hide();
  $('.cnconly').show();
  $('.dragknifeonly').hide();
  $('#svgOpName').text("Pocket");
};

function dragKnifeMode() {
  $('#svgPocket').hide();
  $('#svgOutside').hide();
  $('#svgInside').hide();
  $('#svgLaserGrp').hide();
  $('#svgCNCGrp').hide();
  $('#svgKnifeGrp').show();
  $('#svgDepthGrp').hide();
  $('#svgToolpath').hide();
  $('#svgKnifeView').show();
  $('.laseronly').hide();
  $('.cnconly').hide();
  $('.dragknifeonly').show();
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
     inkscape:cx="294.12322"
     inkscape:cy="66.132736"
     inkscape:window-x="1912"
     inkscape:window-y="-8"
     inkscape:window-maximized="1"
     inkscape:current-layer="svg4163" />
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
        <dc:title></dc:title>
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
     id="svgDepthGrp"
     inkscape:label="#g4257"
     transform="translate(7.3470245,2.5538183)">
    <path
       id="path4871"
       d="m 99.345003,124.03067 -12.08162,-0.066"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       inkscape:connector-curvature="0" />
    <text
       id="svgZDepth"
       y="81.39711"
       x="150.9451"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       xml:space="preserve"
       sodipodi:linespacing="125%"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
         y="81.39711"
         x="150.9451"
         id="tspan4909">5mm per pass</tspan></text>
    <text
       id="svgZFinal"
       y="105.39705"
       x="150.9451"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       xml:space="preserve"
       sodipodi:linespacing="125%"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
         y="105.39705"
         x="150.9451"
         id="tspan4913">25mm</tspan></text>
    <path
       id="path4929"
       d="m 109.10628,93.74527 12.94046,0 0,42.9047 -13.07959,0"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:2.36754084;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       inkscape:connector-curvature="0" />
    <path
       id="path4931"
       d="m 99.804682,103.26677 0,-26.95315 46.093748,0"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       inkscape:connector-curvature="0" />
    <path
       id="path4933"
       d="m 121.69678,109.26677 0,-8.7891 23.82812,0"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       inkscape:connector-curvature="0" />
    <path
       id="path4865"
       d="m 87.263153,136.11787 12.29132,0.068 0.26164,-47.64617 -12.29131,-0.0675"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       inkscape:connector-curvature="0" />
    <path
       id="path4867"
       d="m 99.378473,99.07357 -11.98059,-0.066"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       inkscape:connector-curvature="0" />
    <path
       id="path4869"
       d="m 99.483443,111.39447 -12.36075,0"
       style="fill:none;fill-rule:evenodd;stroke:#0000ff;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       inkscape:connector-curvature="0" />
  </g>
  <g
     id="svgCNCGrp"
     inkscape:label="#g4298"
     transform="translate(3.5832614,189.54163)">
    <path
       inkscape:connector-curvature="0"
       id="path4823"
       d="m 10.233223,-97.01558 14.545236,0 -0.276215,44.66938 43.934106,-0.1381 0.27621,-44.71271 16.70604,-0.20971"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4849"
       d="m 23.252677,-161.30248 0.01373,16.38768 0.05613,12.55643 49.254118,-0.0642 0,-24.83493 -0.1381,-20.66349"
       style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4851"
       d="m 72.199883,-156.78232 76.101667,-0.0809"
       style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4891"
       d="m 75.01677,-100.9633 10.4442,0 0.0692,-42.68627 -10.30719,0"
       style="fill:none;fill-rule:evenodd;stroke:#008000;stroke-width:0.97431153px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <text
       sodipodi:linespacing="125%"
       id="svgToolDia"
       y="-152.21852"
       x="154.4913"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       xml:space="preserve"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
         y="-152.21852"
         x="154.4913"
         id="tspan4899">6.35mm</tspan><tspan
         id="tspan4182"
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
         y="-133.46852"
         x="154.4913" /></text>
    <path
       sodipodi:nodetypes="cc"
       inkscape:connector-curvature="0"
       id="path4901"
       d="m 85.117358,-132.56331 62.929432,0.0572"
       style="fill:none;fill-rule:evenodd;stroke:#008000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <text
       sodipodi:linespacing="125%"
       id="svgZClear"
       y="-128.21852"
       x="153.77353"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       xml:space="preserve"><tspan
         style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:15px;font-family:sans-serif;-inkscape-font-specification:sans-serif"
         y="-128.21852"
         x="153.77353"
         id="tspan4905">10mm</tspan></text>
    <path
       inkscape:connector-curvature="0"
       id="path4174"
       d="m 67.079101,-184.4459 0,42.99979 -38.727789,0 0.390625,-42.43636 9.07701,7.0511 5.882034,-7.07361 7.321206,7.63704 4.050223,-8.30309 4.734823,4.56964 z"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4176"
       d="M 28.104046,-149.88229 66.49773,-163.69297"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4178"
       d="m 43.019579,-142.70073 c 2.762136,0 23.478151,-9.11505 23.478151,-9.11505"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4180"
       d="M 28.932687,-164.52161 67.05016,-178.33229"
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
     transform="translate(102.43935,-174.59467)">
    <path
       inkscape:connector-curvature="0"
       id="path4195"
       d="m -93.548326,262.93461 113.96756,0"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       sodipodi:nodetypes="ccccscccccsccc"
       inkscape:connector-curvature="0"
       id="path4203"
       d="m -70.610476,180.98102 0.21338,42.30401 15.43135,8.16574 7.77818,0 15.01085,-7.86656 c 0.589139,-0.30875 0.280329,-43.13352 0.280329,-43.13352 l -6.540729,3.53554 -6.01041,-4.06587 -1.94455,5.65686 -7.42462,-6.36396 c 0,0 0,7.24784 -0.88388,7.42462 -0.88388,0.17677 -10.07627,-6.36396 -10.07627,-6.36396 l -2.2981,4.59619 z"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       sodipodi:nodetypes="cccc"
       inkscape:connector-curvature="0"
       id="path4205"
       d="m -54.894356,232.01955 0,16.65806 7.90041,-14.24569 0.0205,-2.42033"
       style="fill:#999999;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4207"
       d="m -55.761236,251.42653 0,4.41942 4.94975,0 0,-4.24264"
       style="fill:none;fill-rule:evenodd;stroke:#008000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4209"
       d="m -51.316326,255.8025 37.875009,0 0.125,-24.5 62.125001,0"
       style="fill:none;fill-rule:evenodd;stroke:#008000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <text
       inkscape:label="#text4211"
       sodipodi:linespacing="125%"
       id="dragKnifeRadius"
       y="235.61501"
       x="55.74617"
       style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:13.75px;line-height:125%;font-family:sans-serif;-inkscape-font-specification:'sans-serif, Normal';text-align:start;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       xml:space="preserve"><tspan
         style="font-size:15px"
         y="235.61501"
         x="55.74617"
         id="tspan4213"
         sodipodi:role="line">0.1mm</tspan></text>
    <path
       inkscape:connector-curvature="0"
       id="path4276"
       d="m -51.253426,249.21682 0.17677,-5.21491"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:0.25;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:0.25000001, 0.50000001;stroke-dashoffset:0;stroke-opacity:1" />
  </g>
  <g
     id="svgLaserGrp"
     transform="translate(218.00001,-0.5)">
    <path
       inkscape:connector-curvature="0"
       id="path4418"
       d="m -208.94407,91.21602 108.00782,0"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4420"
       d="m -186.42592,4.52096 0,43.94532 19.33594,17.96874 19.14062,-17.87109 0.19531,-43.65234"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4424"
       d="m -167.18764,69.07175 0,19.33594"
       style="fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:0.99999994;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:0.99999997, 0.99999997;stroke-dashoffset:0;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4278"
       d="m -186.26287,45.777024 38.00699,0"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4280"
       d="m -186.43966,37.998849 37.47667,0"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <path
       inkscape:connector-curvature="0"
       id="path4282"
       d="m -186,5.23228 2.875,-4.5 6.375,7.375 6.875,-7.375 8.375,8.75 5.5,-7.25 8.125,3.625"
       style="fill:none;fill-rule:evenodd;stroke:#000000;stroke-width:2.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
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
</svg>

`
