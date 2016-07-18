function initTabs() {

  $('#layerprep').on('keyup change','input', function() {
    var newval = $(this).val();
    var newval = parseFloat(newval, 3)
    var id = $(this).attr('id');
    var objectseq = $(this).attr('objectseq');
    console.log('Value for ' +id+ ' changed to ' +newval+ ' for object ' +objectseq );
    if ( id.indexOf('rasterxoffset') == 0 ) {
      objectsInScene[objectseq].position.x = objectsInScene[objectseq].userData.offsetX + parseFloat(newval, 3);
      console.log('Moving ' +objectsInScene[objectseq].name+ ' to X: '+newval);
      attachBB(objectsInScene[objectseq]);
    } else if ( id.indexOf('rasteryoffset') == 0 ) {
      objectsInScene[objectseq].position.y = objectsInScene[objectseq].userData.offsetY + parseFloat(newval, 3);
      console.log('Moving ' +objectsInScene[objectseq].name+ ' to Y: '+newval);
      attachBB(objectsInScene[objectseq]);
    } else if ( id.indexOf('rasterDPI') == 0 ) {
      var bboxpre = new THREE.Box3().setFromObject(objectsInScene[objectseq]);
      console.log('bbox for BEFORE SCALE: Min X: ', (bboxpre.min.x + (laserxmax / 2)), '  Max X:', (bboxpre.max.x + (laserxmax / 2)), 'Min Y: ', (bboxpre.min.y + (laserymax / 2)), '  Max Y:', (bboxpre.max.y + (laserymax / 2)));
      console.log('Scaling ' +objectsInScene[objectseq].name+ ' to: '+scale);
      var scale = (25.4 / parseFloat(newval, 3) );
      objectsInScene[objectseq].scale.x = scale;
      objectsInScene[objectseq].scale.y = scale;
      objectsInScene[objectseq].scale.z = scale;
      putFileObjectAtZero(objectsInScene[objectseq]);
      attachBB(objectsInScene[objectseq]);
      $("#rasterxoffset"+objectseq).val('0')
      $("#rasteryoffset"+objectseq).val('0')
    } else if ( id.indexOf('svgdpi') == 0 ) {
      var svgscale = (25.4 / parseFloat(newval, 3) );
      objectsInScene[objectseq].scale.x = svgscale;
      objectsInScene[objectseq].scale.y = svgscale;
      objectsInScene[objectseq].scale.z = svgscale;
      putFileObjectAtZero(objectsInScene[objectseq]);
      attachBB(objectsInScene[objectseq]);
    }


  });


  $('#tabsLayers').on('click','.close',function(){
     var tabID = $(this).parents('a').attr('href');
     $(this).parents('li').remove();
     $(tabID).remove();

     //display first tab
     var tabFirst = $('#tabsLayers a:first');
     tabFirst.tab('show');

     var layerIndex = $(this).parents('a').attr('layerindex');
     console.log('dumping ' + layerIndex + ' from objectsInScene')
     objectsInScene.splice(layerIndex, 1)
     fillLayerTabs();
  });

  $('#tabsLayers').on('click','a',function(){
    console.log("selected object id: " + $(this).attr('layerindex'));
    console.log("selected tab name: " + $(this).parents('li').attr('id'));

    var tabName = $(this).parents('li').attr('id')

    $(".layertab").removeClass('active');
    $(this).parents('li').addClass('active');
    if (tabName == "allView") {
      for (var j = 0; j < objectsInScene.length; j++) {
        console.log('added object ' + j)
        scene.add(objectsInScene[j]);
        if (objectsInScene[j].userData) {
          if (objectsInScene[j].userData.inflated) {
            scene.add(objectsInScene[j].userData.inflated);
          }
        };
      }
      if (typeof(object) != 'undefined') {
          scene.add(object);
      }
      scene.remove(boundingBox)
    } else if (tabName == "gCodeView") {
      if (objectsInScene.length > 0) {
        console.log('L: ', scene.children.length)
        if (typeof(boundingBox) != 'undefined') {
            scene.remove(boundingBox);
        }
        var total = scene.children.length
        for (var j = 6; j < total; j++) {
          scene.remove(scene.children[j]);
        }
          if (typeof(object) != 'undefined') {
          scene.add(object);
          attachBB(object);
        } else {
          if (typeof(boundingBox) != 'undefined') {
              scene.remove(boundingBox);
          }
        }
      }
    } else {
      var total = scene.children.length
      for (var j = 6; j < total; j++) {
        scene.remove(scene.children[j]);
      }
      var i = parseInt($(this).attr('layerindex'));
      scene.add(objectsInScene[i]);
      attachBB(objectsInScene[i]);
      if (typeof(objectsInScene[i].userData) !== 'undefined') {
        if (objectsInScene[i].userData.inflated) {
          scene.add(objectsInScene[i].userData.inflated);
        }
      };
    };
  });
} // End init


function fillLayerTabs() {
  $("#tabsLayers").empty();
  $("#layerprep").empty();
  $("#tooloptions").empty();

  // Instead of appending for each, we build a string and append at the end
  var layerprep = `<hr><div class="panel-group" id="accordion">`


  $("#tabsLayers").append('<li role="presentation" class="active layertab" id="allView"><a href="#">All Layers</a></li><li role="presentation" class="layertab" id="gCodeView"><a href="#">GCODE View</a></li>');
  for (j = 6; j < scene.children.length+1; j++) {
    scene.remove(scene.children[j])
  }
  var hasTools = false;
  for (i = 0; i < objectsInScene.length; i++) {

    var pwr = objectsInScene[i].pwr
    var speed = objectsInScene[i].speed
    if (!pwr) {
      pwr = 100;
    }
    if (!speed) {
      speed = 20;
    }

    if (objectsInScene[i].userData.operation) {
      var template = `
      <li role="presentation" class="dropdown layertab" id="`+objectsInScene[i].name+`'">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown" layerindex="`+i+`">`+objectsInScene[i].name+`<button class="close" type="button" title="Remove this page">×</button></a>
        <ul class="dropdown-menu">
          <li id="`+objectsInScene[i].name+`'"><a href="#" layerindex="`+i+`">`+objectsInScene[i].name+`-`+objectsInScene[i].userData.operation+`</a></li>

        </ul>
      </li>
      `
    } else {
      var template = `
      <li role="presentation" class="layertab" id="`+objectsInScene[i].name+`'">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown" layerindex="`+i+`">`+objectsInScene[i].name+`<button class="close" type="button" title="Remove this page">×</button></a>
      </li>
      `
    }

    $("#tabsLayers").append(template);



    if (objectsInScene[i].type == 'Group') {
      var xoffset = objectsInScene[i].userData.offsetX;
      var yoffset = objectsInScene[i].userData.offsetY;
      var xpos = objectsInScene[i].position.x;
      var ypos = objectsInScene[i].position.y;
      var zstep = objectsInScene[i].userData.zstep;
      var zdepth = objectsInScene[i].userData.zdepth;
      if (!zstep) {
        zstep = 1;
      };
      if (!zdepth) {
        zdepth = 1;
      };
      cncMode = $('#cncMode').val()
      if (cncMode == "Enable") {
        var cnctemplate = `
        <div class="panel panel-default">
        <div class="panel-heading">
          <h4 class="panel-title">
            <a class="accordion-toggle"  data-toggle="collapse" data-parent="#accordion" href="#collapse`+i+`">`+objectsInScene[i].name+`</a>
          </h4>
        </div>
        <div id="collapse`+i+`" class="panel-collapse collapse">
          <div class="panel-body" id="panel`+i+`">
            <div class="form-group">
              <label >Position Offset</label>
              <div class="input-group">
                <span class="input-group-addon">X</span>
                <input type="number" class="form-control" xoffset="`+xoffset+`" value="`+ -(xoffset - xpos)+`"  id="rasterxoffset`+i+`" objectseq="`+i+`">
                <span class="input-group-addon">Y</span>
                <input type="number" class="form-control" yoffset="`+yoffset+`" value="`+ -(yoffset - ypos)+`"  id="rasteryoffset`+i+`" objectseq="`+i+`">
                <span class="input-group-addon">mm</span>
              </div>
            </div>
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
                  <input type="number" class="form-control" value="`+zstep+`"  id="zstep`+i+`">
                  <span class="input-group-addon">mm</span>
                </div>
                <label>Final Depth</label>
                <div class="input-group">
                  <input type="number" class="form-control" value="`+zdepth+`"  id="zdepth`+i+`">
                  <span class="input-group-addon">mm</span>
                </div>
              </div>
              <div class="form-group">
                <label>Feedrate: Cut</label>
                <div class="input-group">
                  <input type="number" class="form-control" value="`+speed+`" id="speed`+i+`" objectseq="`+i+`">
                  <span class="input-group-addon">mm/s</span>
                </div>
                <label>Feedrate: Plunge</label>
                <div class="input-group">
                  <input type="number" class="form-control" value="20" id="plungespeed`+i+`" objectseq="`+i+`">
                  <span class="input-group-addon">mm/s</span>
                </div>
              </div>
              <div class="form-group">
                <label >Tool</label>
                  <select class="form-control" id="tool`+i+`">
                    <option>default</option>
                  </select>
                <div class="form-group">
                  <label >Spindle RPM (0-100%)</label>
                  <div class="input-group">
                  <input type="number" class="form-control" value="`+pwr+`" id="power`+i+`" objectseq="`+i+`">
                  <span class="input-group-addon">RPM %</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>





        `
        //$("#layerprep").append(cnctemplate);
        layerprep += cnctemplate
        if (objectsInScene[i].userData.operation) {
            $("#operation"+i).val(objectsInScene[i].userData.operation);
          }
        hasTools = true;
      } else {
        var template = `
        <div class="panel panel-default">
        <div class="panel-heading">
          <h4 class="panel-title">
            <a class="accordion-toggle"  data-toggle="collapse" data-parent="#accordion" href="#collapse`+i+`">`+objectsInScene[i].name+`</a>
          </h4>
        </div>
        <div id="collapse`+i+`" class="panel-collapse collapse">
          <div class="panel-body" id="panel`+i+`">
            <div class="form-group">
              <label >Laser Power (0-100%)</label>
              <div class="input-group">
              <input type="number" class="form-control" value="`+pwr+`" id="power`+i+`" objectseq="`+i+`">
              <span class="input-group-addon">%</span>
            </div>
            <div class="form-group">
              <label>Feedrate: Cut</label>
              <div class="input-group">
                <input type="number" class="form-control" value="`+speed+`" id="speed`+i+`" objectseq="`+i+`">
                <span class="input-group-addon">mm/s</span>
              </div>
            </div>
            <div class="form-group">
              <label >Position Offset</label>
              <div class="input-group">
                <span class="input-group-addon">X</span>
                <input type="number" class="form-control" xoffset="`+xoffset+`" value="`+ -(xoffset - xpos)+`"  id="rasterxoffset`+i+`" objectseq="`+i+`">
                <span class="input-group-addon">Y</span>
                <input type="number" class="form-control" yoffset="`+yoffset+`" value="`+ -(yoffset - ypos)+`"  id="rasteryoffset`+i+`" objectseq="`+i+`">
                <span class="input-group-addon">mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
        `
        // $("#layerprep").append(template);
        layerprep += template;
      }
    } else if (objectsInScene[i].type == 'Mesh') {
      var xoffset = objectsInScene[i].userData.offsetX
      var yoffset = objectsInScene[i].userData.offsetY
      var xpos = objectsInScene[i].position.x
      var ypos = objectsInScene[i].position.y
      // var seq = objectsInScene[i].userData.seq;
      var scale = objectsInScene[i].scale.y;
      var template = `
      <div class="panel panel-default">
      <div class="panel-heading">
        <h4 class="panel-title">
          <a class="accordion-toggle"  data-toggle="collapse" data-parent="#accordion" href="#collapse`+i+`">`+objectsInScene[i].name+`</a>
        </h4>
      </div>
      <div id="collapse`+i+`" class="panel-collapse collapse">
        <div class="panel-body" id="panel`+i+`">
          <label >Copy image to a traced vector for cutting use </label>
          <div class="btn-group btn-group-justified" role="group" aria-label="tracegcode">
              <div class="btn-group" role="group">
                  <a class="btn btn-warning btn-block" href="#" onclick="tracebmp(`+i+`, '`+objectsInScene[i].name+`')">Trace to Vector</a>
              </div>
          </div>
          <div class="form-group">
            <label >Raster: Proportional Feedrate</label>
            <div class="input-group">
              <span class="input-group-addon">Light</span>
              <input type="number" class="form-control"  value="20" id="feedRateW`+i+`" objectseq="`+i+`">
              <span class="input-group-addon">mm/s</span>
            </div><br>
            <div class="input-group">
              <span class="input-group-addon">Dark</span>
              <input type="number" class="form-control"  value="20" id="feedRateB`+i+`" objectseq="`+i+`">
              <span class="input-group-addon">mm/s</span>
            </div>
          </div>
          <div class="form-group">
            <label>Laser Power Contraints</label>
            <div class="input-group">
              <span class="input-group-addon">Min</span>
              <input type="number" class="form-control" value="0" id="minpwr`+i+`" objectseq="`+i+`">
              <span class="input-group-addon">Max</span>
              <input type="number" class="form-control" value="100" id="maxpwr`+i+`" objectseq="`+i+`">
              <span class="input-group-addon">%</span>
            </div>
          </div>
          <div class="form-group">
            <label >Position Offset</label>
            <div class="input-group">
              <span class="input-group-addon">X</span>
              <input type="number" class="form-control" xoffset="`+xoffset+`" value="`+ -(xoffset - xpos)+`"  id="rasterxoffset`+i+`" objectseq="`+i+`">
              <span class="input-group-addon">Y</span>
              <input type="number" class="form-control" yoffset="`+yoffset+`" value="`+ -(yoffset - ypos)+`"  id="rasteryoffset`+i+`" objectseq="`+i+`">
              <span class="input-group-addon">mm</span>
            </div>
          </div>
          <div class="form-group">
            <label>Bitmap Resolution</label>
            <div class="input-group">
              <input type="number" class="form-control" value="`+(25.4/scale)+`" id="rasterDPI`+i+`" objectseq="`+i+`">
              <span class="input-group-addon">DPI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
      `;
      // $("#layerprep").append(template);
      layerprep += template;
    };
    scene.add(objectsInScene[i])
    if (objectsInScene[i].userData) {
      if (objectsInScene[i].userData.inflated) {
        scene.add(objectsInScene[i].userData.inflated);
      }
    };
  }


  if (cncMode == "Enable") {
    if (hasTools) {
      var tools = `
      <label class="control-label">Tool Options</label>
      <div class="input-group">
        <span class="input-group-addon">Tool Diameter</span>
        <input type="number" class="form-control" value="3.175" id="tooldia">
        <span class="input-group-addon">mm</span>

      </div>
      <div class="input-group">
        <span class="input-group-addon">Z Safe Height</span>
        <input type="number" class="form-control" value="10" id="clearanceHeight">
        <span class="input-group-addon">mm</span>

      </div>
      `
      $("#tooloptions").append(tools);
    }
  }


  layerprep += "</div>"
  $("#layerprep").append(layerprep);

  for (i = 0; i < objectsInScene.length; i++) {
    var objname = objectsInScene[i].name
    if (objname.indexOf('.svg') != -1) {
      var svgscale = objectsInScene[i].scale.x
      var templatedpi = `
      <div class="form-group">
        <label>SVG Resolution</label>
        <div class="input-group">
          <input type="number" class="form-control" value="`+(25.4/svgscale)+`" id="svgdpi`+i+`" objectseq="`+i+`">
          <span class="input-group-addon">DPI</span>

        </div>
      </div>
      `
      $("#panel"+i).prepend(templatedpi);
      // layerprep += templatedpi
    }
  };

};
