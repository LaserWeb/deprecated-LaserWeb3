function initTree() {
  $('.tree').treegrid({
    expanderExpandedClass: 'fa fa-folder-open-o',
    expanderCollapsedClass: 'fa fa-folder-o'
  });
}

function fillTree() {
  $('#filetree').empty();

  var header = `<table class="table tree" style="width: 100%" id="filetreetable">`
  $('#filetree').append(header);
  for (i = 0; i < objectsInScene.length; i++) {

    var file = `
    <tr class="treegrid-1">
      <td>
        <i class="fa fa-fw fa-file-text-o" aria-hidden="true"></i>&nbsp;
        <a class="entity" href="#" onclick="attachBB(objectsInScene[`+i+`]); fillTree(); fillLayerTabs();">` + objectsInScene[i].name + `</a>
      </td>
      <td>
        <a class="btn btn-xs btn-danger" onclick="objectsInScene.splice('`+i+`', 1); fillTree(); fillLayerTabs();"><i class="fa fa-times" aria-hidden="true"></i></a>
      </td>
      <td>
        <a class="btn btn-xs btn-success" onclick="rotate(objectsInScene[`+i+`]); fillTree(); fillLayerTabs();"><i class="fa fa-undo" aria-hidden="true"></i></a>
      </td>
    </tr>
    `

    $('#filetreetable').append(file)
    //  var name = objectsInScene[i].name;
     for (j = 0; j < objectsInScene[i].children.length; j++) {

       var child = `
       <tr class="treegrid-2 treegrid-parent-1">
         <td style="background: url(css/tablebg.gif) 18px 54% no-repeat;">
          <i class="fa fa-fw fa-sm fa-object-group" aria-hidden="true"></i>&nbsp;
          <a class="entity" href="#" onclick="attachBB(objectsInScene[`+i+`].children[`+j+`])" id="link`+i+`_`+j+`">`+objectsInScene[i].children[j].name+`</a>
        </td>
        <td>
          <a class="btn btn-xs btn-danger" onclick="objectsInScene[`+i+`].remove(objectsInScene[`+i+`].children[`+j+`]); fillTree();"><i class="fa fa-times" aria-hidden="true"></i></a>
        </td>
        <td>
          <a class="btn btn-xs btn-primary"><i class="fa fa-pencil" aria-hidden="true"></i></a>
        </td>
       </tr>
       `
       $('#filetreetable').append(child)
      //  var name = objectsInScene[i].children[j].name;
      objectsInScene[i].children[j].userData.link = "link"+i+"_"+j
     }
     var tableend = `
     </table>
     `
     $('#filetreetable').append(tableend)
  }
  $('.tree').treegrid({
    expanderExpandedClass: 'fa fa-minus-square',
    expanderCollapsedClass: 'fa fa-plus-square'
  });
}

function resetColors() {
  for (i = 0; i < objectsInScene.length; i++) {
    for (j = 0; j < objectsInScene[i].children.length; j++) {
      objectsInScene[i].children[j].material.color.setHex(objectsInScene[i].children[j].userData.color);
    }
  }
}

function rotate(object) {
  object.rotateZ(Math.PI / 4);
}
