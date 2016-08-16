function initTabs() {

  $('#layerprep').on('keyup change','input', function() {
    var inputVal = $(this).val();
    var newval = parseFloat(inputVal, 3)
    var id = $(this).attr('id');
    var objectseq = $(this).attr('objectseq');
    // console.log('Value for ' +id+ ' changed to ' +newval+ ' for object ' +objectseq );
    if ( id.indexOf('rasterxoffset') == 0 ) {
      objectsInScene[objectseq].position.x = objectsInScene[objectseq].userData.offsetX + newval;
      // console.log('Moving ' +objectsInScene[objectseq].name+ ' to X: '+newval);
      if (typeof(object) != 'undefined') {
        scene.remove(object);
      };
      attachBB(objectsInScene[objectseq]);

    } else if ( id.indexOf('rasteryoffset') == 0 ) {
      objectsInScene[objectseq].position.y = objectsInScene[objectseq].userData.offsetY + newval;
      // console.log('Moving ' +objectsInScene[objectseq].name+ ' to Y: '+newval);
      if (typeof(object) != 'undefined') {
        scene.remove(object);
      };
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
      if (typeof(object) != 'undefined') {
        scene.remove(object);
      };
      attachBB(objectsInScene[objectseq]);
      $("#rasterxoffset"+objectseq).val('0')
      $("#rasteryoffset"+objectseq).val('0')
    } else if ( id.indexOf('svgdpi') == 0 ) {
      if (typeof(object) != 'undefined') {
        scene.remove(object);
      };
      var svgscale = (25.4 / newval );
      objectsInScene[objectseq].scale.x = svgscale;
      objectsInScene[objectseq].scale.y = svgscale;
      objectsInScene[objectseq].scale.z = svgscale;
      putFileObjectAtZero(objectsInScene[objectseq]);
      attachBB(objectsInScene[objectseq]);
    }

  });


  $('#tabsLayers').on('click','.close',function(e){
     e.stopPropagation();
     var tabID = $(this).parents('a').attr('href');
     $(this).parents('li').remove();
     $(tabID).remove();

     //display first tab
     var tabFirst = $('#tabsLayers a:first');
     tabFirst.tab('show');

     var layerIndex = $(this).parents('a').attr('layerindex');
     console.log('dumping ' + layerIndex + ' from objectsInScene')
     var seq = objectsInScene[layerIndex].userData.seq
     if (objectsInScene[layerIndex].type == "Mesh") {
       $("#origImage"+seq).remove();
     }
     objectsInScene.splice(layerIndex, 1)
     fillLayerTabs();
     fillTree();
  });

  $('#tabsLayers').on('click','a',function(){
    // console.log("selected object id: " + $(this).attr('layerindex'));
    // console.log("selected tab name: " + $(this).parents('li').attr('id'));
    clearScene();

    var tabName = $(this).parents('li').attr('id')
    $(".layertab").removeClass('active');
    $(this).parents('li').addClass('active');
    if (tabName == "allView") {
      clearScene();
      for (var j = 0; j < objectsInScene.length; j++) {
        // console.log('added object ' + j)
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
      resetColors()
    } else if (tabName == "jobView") {
      clearScene();
      for (var j = 0; j < toolpathsInScene.length; j++) {
        // console.log('added object ' + j)
        scene.add(toolpathsInScene[j]);
        if (toolpathsInScene[j].userData) {
          if (toolpathsInScene[j].userData.inflated) {
            scene.add(toolpathsInScene[j].userData.inflated);
          }
        };
      }
      if (typeof(boundingBox) != 'undefined') {
          scene.remove(boundingBox);
      }
    } else if (tabName == "gCodeView") {
      clearScene();
      if (objectsInScene.length > 0 || toolpathsInScene.length > 0) {
        // console.log('L: ', scene.children.length)
        if (typeof(boundingBox) != 'undefined') {
            scene.remove(boundingBox);
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
      clearScene();
      var i = parseInt($(this).attr('layerindex'));
      if (objectsInScene.length > 0) {
        scene.add(objectsInScene[i]);
        attachBB(objectsInScene[i]);
        if (typeof(objectsInScene[i].userData) !== 'undefined') {
          if (objectsInScene[i].userData.inflated) {
            scene.add(objectsInScene[i].userData.inflated);
          }
        };
      };
    };
  });
} // End init
