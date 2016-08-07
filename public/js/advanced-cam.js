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

}

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
            <a class="btn btn-xs btn-primary" onclick="$('#scale`+i+`').toggle(); $(this).toggleClass('active');"><i class="fa fa-expand" aria-hidden="true"></i></a>
            <a class="btn btn-xs btn-primary" onclick="$('#move`+i+`').toggle(); $(this).toggleClass('active');"><i class="fa fa-arrows" aria-hidden="true"></i></a>
            <a class="btn btn-xs btn-danger" onclick="objectsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
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
            <a class="btn btn-xs btn-danger" onclick="toolpathsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
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

  $('#statusBody').html('Configure the operation for the toolpath <b>' + toolpathsInScene[toolpathid].name + '</b><hr>' );
  var template2 = `
  <div class="form-group">
    <label>Operation</label>
      <div class="input-group" >
        <select class="form-control" id="operation`+i+`">
          <option>Laser (no path offset)</option>
          <option>Inside</option>
          <option>Outside</option>
          <option>Pocket</option>
          <option>Drag Knife</option>
        </select>
        <div class = "input-group-btn"><button class="btn btn-success" onclick="addOperation('`+i+`', $('#operation`+i+`').val(), $('#zstep`+i+`').val(), $('#zdepth`+i+`').val())">Add</button></div>
      </div>
    </div>
    <div class="form-group">
      <label >Cut Depth per pass</label>
      <div class="input-group">
        <input type="number" class="form-control" value=""  id="zstep`+i+`">
        <span class="input-group-addon">mm</span>
      </div>
      <label>Final Depth</label>
      <div class="input-group">
        <input type="number" class="form-control" value=""  id="zdepth`+i+`">
        <span class="input-group-addon">mm</span>
      </div>
    </div>
    <div class="form-group">
      <label>Feedrate: Cut</label>
      <div class="input-group">
        <input type="number" class="form-control" value="" id="speed`+i+`" objectseq="`+i+`">
        <span class="input-group-addon">mm/s</span>
      </div>
      <label>Feedrate: Plunge</label>
      <div class="input-group">
        <input type="number" class="form-control" value="20" id="plungespeed`+i+`" objectseq="`+i+`">
        <span class="input-group-addon">mm/s</span>
      </div>
    </div>


  <button type="button" class="btn btn-lg btn-success" data-dismiss="modal">Preview Toolpath </button>
  `
  $('#statusBody2').html(template2);

}


function setupRaster(toolpathid) {
  $('#statusmodal').modal('show');
  $('#statusTitle').empty();
  $('#statusTitle').html('Configure Toolpath');
  $('#statusBody').empty();
  $('#statusBody2').empty();

  $('#statusBody').html('Configure the operation for the toolpath <b>' + toolpathsInScene[toolpathid].name + '</b><hr>' );
  var template2 = `
  <label >Copy image to a traced vector for cutting use </label>
  <div class="btn-group btn-group-justified" role="group" aria-label="tracegcode">
      <div class="btn-group" role="group">
          <a class="btn btn-warning btn-block" href="#">Trace to Vector</a>
      </div>
  </div>
<div class="form-group">
    <label >Raster: Proportional Feedrate</label>
    <div class="input-group">
      <span class="input-group-addon">Light</span>
      <input type="number" class="form-control input-sm"  value="20" id="feedRateW`+i+`" objectseq="`+i+`">
      <span class="input-group-addon">mm/s</span>
    </div>
    <div class="input-group">
      <span class="input-group-addon">Dark</span>
      <input type="number" class="form-control input-sm"  value="20" id="feedRateB`+i+`" objectseq="`+i+`">
      <span class="input-group-addon">mm/s</span>
    </div>
  </div>
  <div class="form-group">
    <label>Laser Power Constraints</label>
    <div class="input-group">
      <span class="input-group-addon">Min</span>
      <input type="number"  min="0" max="100" class="form-control input-sm" value="0" id="minpwr`+i+`" objectseq="`+i+`">
      <span class="input-group-addon">%</span>
    </div>
    <div class="input-group">
      <span class="input-group-addon">Max</span>
      <input type="number"  min="0" max="100" class="form-control input-sm" value="100" id="maxpwr`+i+`" objectseq="`+i+`">
      <span class="input-group-addon">%</span>
    </div>
  </div>


  <button type="button" class="btn btn-lg btn-success" data-dismiss="modal">Preview Toolpath </button>
  `
  $('#statusBody2').html(template2);

}
