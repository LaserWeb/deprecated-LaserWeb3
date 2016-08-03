function initTree() {
  $('#filetree').jstree({
      core: {
          "check_callback": true,
          "animation": 0
      },
      "html_data": {},
      "themes": {
          "icons": false
      },
      "types" : {
        "file" : {
          "icon" : "fa fa-file-text-o"
        }
      },
      "plugins" : ["themes","types"]
  });
  $('#filetree').on("changed.jstree", function (e, data) {
    var str = '';
    for (var p in data.selected) {
        if (data.selected.hasOwnProperty(p)) {
            str += data.selected[p];
        }
    }
    console.log(str)
    string = str.split(".")

    if (string[1]) {
      attachBB(objectsInScene[string[0]].children[0].children[string[1]]);
    } else {
      attachBB(objectsInScene[string[0]-10]);
    }
  });
}

function fillTree() {

    $('#filetree').jstree().delete_node($('#filetree').find('> ul > li'));
    for (i = 0; i < objectsInScene.length; i++) {
      var parent = '#';
      var index = i + 10;
      var name = objectsInScene[i].name;
      var node = { id:index,text:name, type:"file", opened:true};
      $('#filetree').jstree().create_node(parent, node, 'last');

      for (j = 0; j < objectsInScene[i].children[0].children.length; j++) {
        var parent = i + 10;
        var index = i + "." + j;
        var name = objectsInScene[i].children[0].children[j].name;
        var node = { id:index,text:name, type:"file", opened:true};
        $('#filetree').jstree().create_node(parent, node, 'last');
      }
    }
}
