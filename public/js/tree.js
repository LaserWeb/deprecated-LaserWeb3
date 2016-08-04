var toolpathsInScene = [];

function initTree() {

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
          &nbsp;
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

      if (objectsInScene[i].type != "Mesh") {
        var file = `
        <tr class="jobsetupfile">
          <td>
            <i class="fa fa-fw fa-file-text-o" aria-hidden="true"></i>&nbsp;
            <a class="entity" href="#" onclick="attachBB(objectsInScene[`+i+`]); fillTree(); fillLayerTabs();"><b>` + objectsInScene[i].name + `</b></a>
          </td>
          <td>
            <a class="btn btn-xs btn-primary"><i class="fa fa-arrows" aria-hidden="true"></i></a>
            <a class="btn btn-xs btn-primary"><i class="fa fa-pencil" aria-hidden="true"></i></a>
            <a class="btn btn-xs btn-danger" onclick="objectsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
          </td>
          <td>
            <input type="checkbox" value="" onclick=" $('.chkchildof`+i+`').prop('checked', $(this).prop('checked'));" />
          </td>
        </tr>
        `
      } else {
        var file = `
        <tr class="jobsetupfile">
          <td>
            <i class="fa fa-fw fa-file-photo-o" aria-hidden="true"></i>&nbsp;
            <a class="entity" href="#" onclick="attachBB(objectsInScene[`+i+`]); fillTree(); fillLayerTabs();"><b>` + objectsInScene[i].name + `</b></a>
          </td>
          <td>
            <a class="btn btn-xs btn-primary"><i class="fa fa-arrows" aria-hidden="true"></i></a>
            <a class="btn btn-xs btn-primary"><i class="fa fa-pencil" aria-hidden="true"></i></a>
            <a class="btn btn-xs btn-danger" onclick="objectsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
          </td>
          <td>
            <input type="checkbox" value="" class="chkaddjob" id="child.`+i+`" />
          </td>
        </tr>
        `
      }


      $('#filetreetable').append(file)
      //  var name = objectsInScene[i].name;
       for (j = 0; j < objectsInScene[i].children.length; j++) {

         var child = `
         <tr class="jobsetupchild">
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
          &nbsp;
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
            <a class="entity-job" href="#">Vector-` +i + `</a>
          </td>
          <td>

          </td>
          <td>
            <a class="btn btn-xs btn-danger" onclick="toolpathsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
            <a class="btn btn-xs btn-primary"><i class="fa fa-fw fa-sliders" aria-hidden="true"></i></a>
          </td>
        </tr>
        `
      } else {
        var toolp = `<tr class="jobsetupfile">
          <td>
            <i class="fa fa-fw fa-picture-o" aria-hidden="true"></i>&nbsp;
            <a class="entity-job" href="#">Raster-` +i + `</a>
          </td>
          <td>

          </td>
          <td>
            <a class="btn btn-xs btn-danger" onclick="toolpathsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
            <a class="btn btn-xs btn-primary"><i class="fa fa-fw fa-sliders" aria-hidden="true"></i></a>
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

function resetColors() {
  for (i = 0; i < objectsInScene.length; i++) {
    for (j = 0; j < objectsInScene[i].children.length; j++) {
      objectsInScene[i].children[j].material.color.setHex(objectsInScene[i].children[j].userData.color);
    }
  }
}

function addJob() {
  var toolpath = new THREE.Group();
  $(".chkaddjob").each(function(){

    resetColors() // Set all colors back to original

      var $this = $(this);

      if($this.is(":checked")){
          console.log($this.attr("id"));
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
    toolpathsInScene.push(toolpath)
  }
  fillTree();
}
