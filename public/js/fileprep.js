var Xtofix;
var Ytofix;
var oldxscale = 0;
var oldyscale = 0;

function attachTransformWidget() {
    $("#transformcontrols").show();
    if (rastermesh) {
        control.attach(rastermesh);
        control.setMode("translate");
        $("#resizeBtn").hide();
        $("#linkAspectBtn").hide();
    } else {
        control.attach(fileParentGroup);
        control.setMode("translate");
        $("#resizeBtn").show();
        $("#linkAspectBtn").show();
    }
    control.addEventListener('change', currentWorld);

};

function filePrepInit() {
  // SVG DPI
  $('#90dpi').on('click', function() {
  	svgscale = ((25.4/90) )
  	$('#scaleFactor').val(svgscale*100);
    scaleChange();

  });

  $('#72dpi').on('click', function() {
  	svgscale = ((25.4/72) )
  	$('#scaleFactor').val(svgscale*100);
    scaleChange();

  });

  $('#customdpi').on('click', function() {
    dpival = $('#dpiVal').val();
    svgscale = ((25.4/dpival) )
    $('#scaleFactor').val(svgscale*100);
    scaleChange();

  });


  $("#dpiVal").change(function() {
    dpival = $('#dpiVal').val();
    svgscale = ((25.4/dpival) )
    $('#scaleFactor').val(svgscale*100);
    scaleChange();

  });
  // End Svg DPI

  // Raster DPI
  $('#ras72dpi').on('click', function() {
    $('#rasterDPI').val('72');
    setImgDims();
  });

  $('#ras150dpi').on('click', function() {
    $('#rasterDPI').val('150');
    setImgDims();
  });

  $('#ras300dpi').on('click', function() {
    $('#rasterDPI').val('300');
    setImgDims();
  });

  $('#ras600dpi').on('click', function() {
    $('#rasterDPI').val('600');
    setImgDims();
  });

  $('#customrasdpi').on('click', function() {
    $('#rasterDPI').val($("#rasterdpiVal").val());
    setImgDims();
  });


  $("#rasterdpiVal").change(function() {
    $('#rasterDPI').val($("#rasterdpiVal").val());
    setImgDims();
  });
  // End Raster DPI


  $('#rotLeftBtn').on('click', function() {
    if (fileParentGroup) {
      fileObject.rotateZ(Math.PI / 4);
      putFileObjectAtZero();
    }
  });

  $('#rotRightBtn').on('click', function() {
    if (fileParentGroup) {
      fileObject.rotateZ(Math.PI / -4);
      putFileObjectAtZero();
    }
  });

  $('#resetRot').on('click', function() {
    if (fileParentGroup) {
      fileObject.rotation.z = 0;
      putFileObjectAtZero();
    }
  });

  $("#rotationval").change(function() {
      var rotation = $(this).val();
      console.log('Rotating from ', ((fileObject.rotation.z / Math.PI * 180).toFixed(0) * -1 ), ' to ', rotation);
      fileObject.rotateZ((rotation * Math.PI/ 180) * -1);
      putFileObjectAtZero();
  });


  $('#translateBtn').on('click', function() {
      if ($("#translateBtn").hasClass("btn-primary")) {
          $("#translateBtn").removeClass("btn-primary")
          $("#translateBtn").addClass("btn-default")
          scene.remove(control);
          controls.enableZoom = true; // optional
          controls.enablePan = true;
          controls.enableRotate = true;
      } else {
          $("#translateBtn").removeClass("btn-default")
          $("#resizeBtn").removeClass("btn-primary")
          $("#resizeBtn").addClass("btn-default")
          $("#translateBtn").addClass("btn-primary")
          control.setMode("translate");
          scene.add(control);
          controls.enableZoom = false; // optional
          controls.enablePan = false;
          controls.enableRotate = false;
      };
  });

  $('#resizeBtn').on('click', function() {
      if ($("#resizeBtn").hasClass("btn-primary")) {
          $("#resizeBtn").removeClass("btn-primary")
          $("#resizeBtn").addClass("btn-default")
          scene.remove(control);
          controls.enableZoom = true; // optional
          controls.enablePan = true;
          controls.enableRotate = true;
      } else {
          $("#resizeBtn").removeClass("btn-default")
          $("#translateBtn").removeClass("btn-primary")
          $("#translateBtn").addClass("btn-default")
          $("#resizeBtn").addClass("btn-primary")
          control.setMode("scale");
          scene.add(control);
          controls.enableZoom = false; // optional
          controls.enablePan = false;
          controls.enableRotate = false;
      }
  });

  $('#linkAspectBtn').on('click', function() {
      if ($("#linkAspect").hasClass("fa-link")) {
          // $( "#linkAspectBtn" ).removeClass( "btn-primary" )
          // $( "#linkAspectBtn" ).addClass( "btn-default" )
          $('#linkAspect').removeClass('fa-link');
          $('#linkAspect').addClass('fa-unlink');
          $("#linkval").html('Unlinked');
      } else {
          // $( "#linkAspectBtn" ).removeClass( "btn-default" )
          // $( "#linkAspectBtn" ).removeClass( "btn-primary" )
          // $( "#linkAspectBtn" ).addClass( "btn-default" )
          // $( "#linkAspectBtn" ).addClass( "btn-primary" )
          $('#linkAspect').removeClass('fa-unlink');
          $('#linkAspect').addClass('fa-link');
          $("#linkval").html('Linked');
      }
  });

  $('#stepinfup').on('click', function() {
    var oldValue = parseFloat($('#inflateVal').val());
    var newVal = oldValue + 0.1;
    var newVal = newVal.toFixed(1)
    $("#inflateVal").val(newVal);
    onInflateChange();
  });

  $('#stepinfdn').on('click', function() {
    var oldValue = parseFloat($('#inflateVal').val());
    var newVal = oldValue - 0.1;
    var newVal = newVal.toFixed(1)
    $("#inflateVal").val(newVal);
    onInflateChange();
  });

  $('#stepscaleup').on('click', function() {
    var oldValue = $("#scaleFactor").val();
    var newVal = parseFloat(oldValue) + 1;
    var newVal = newVal.toFixed(0)
    $("#scaleFactor").val(newVal);
    scaleChange();
  });

  $('#stepscaledn').on('click', function() {
    var oldValue = $("#scaleFactor").val();
    var newVal = parseFloat(oldValue) - 1;
    var newVal = newVal.toFixed(0)
    $("#scaleFactor").val(newVal);
    scaleChange();
  });

  $('#panleft').on('click', function() {
    var oldValue = controls.target.x
    var newVal = oldValue + 20;
    TweenMax.to(controls.target,0.25,{x:newVal,onUpdate:function(){
                        controls.update();
                         }});
    // controls.target.x = newVal
    //controls.object.position.x = newVal;
    // controls.update();
  });

  $('#panright').on('click', function() {
    var oldValue = controls.target.x
    var newVal = oldValue - 20;
    TweenMax.to(controls.target,0.25,{x:newVal,onUpdate:function(){
                        controls.update();
                         }});
    // controls.target.x = newVal
    // controls.object.position.x = newVal;
    // controls.update();
  });

  $('#panup').on('click', function() {
    var oldValue = controls.target.y
    var newVal = oldValue - 20;
    TweenMax.to(controls.target,0.25,{y:newVal,onUpdate:function(){
                        controls.update();
                         }});
    // controls.target.y = newVal
    // controls.object.position.y = newVal;
    // controls.update();
  });

  $('#pandown').on('click', function() {
    var oldValue = controls.target.y
    var newVal = oldValue + 20;
    TweenMax.to(controls.target,0.25,{y:newVal,onUpdate:function(){
                        controls.update();
                         }});
    // controls.target.y = newVal
    // controls.object.position.y = newVal;
    // controls.update();
  });

  $('#zoomout').on('click', function() {
    // var oldValue = controls.target.y
    // var newVal = oldValue + 20;
    // controls.target.y = newVal
    TweenMax.to(camera,0.25,{fov:"+=5",onUpdate:function(){
                        camera.updateProjectionMatrix();
                         }});
    controls.update();
  });

  $('#zoomin').on('click', function() {
    // var oldValue = controls.target.y
    // var newVal = oldValue + 20;
    // controls.target.y = newVal
    TweenMax.to(camera,0.25,{fov:"-=5",onUpdate:function(){
                        camera.updateProjectionMatrix();
                         }});
    controls.update();
  });


    useOffset = $('#useOffset').val()
    if (useOffset.indexOf('Disable') == 0) {
        $('#inflateFeature').hide();
    }

function scaleChange() {
  if (typeof(object) != 'undefined') {
      scene.remove(object);
  }
  var hScale = ($("#scaleFactor").val() / 100);
  console.log('Scaling to ', hScale);
  fileParentGroup.scale.x = hScale;
  fileParentGroup.scale.y = hScale;
  fileParentGroup.updateMatrix();
  fileParentGroup.updateMatrixWorld();
  putFileObjectAtZero();
  currentWorld();
}


    $("#scaleFactor").change(function() {
      scaleChange();
    });

    $("#xpos").change(function() {
        if (typeof(object) != 'undefined') {
            scene.remove(object);
        }
        var hPosX = $(this).val();
        console.log('Moving X from ', fileObject.position.x, ' to ', (hPosX - (laserxmax / 2)));
        fileParentGroup.position.x = (hPosX - (laserxmax / 2));
        currentWorld();
    });

    $("#ypos").change(function() {
        if (typeof(object) != 'undefined') {
            scene.remove(object);
        }
        var hPosY = $(this).val();
        console.log('Moving X from ', fileObject.position.y, ' to ', (hPosY - (laserymax / 2)));
        fileParentGroup.position.y = (hPosY - (laserymax / 2));
        currentWorld();
    });

    $('#removeInflateGrp').on('click', function() {
        scene.remove(inflateGrp);
        inflateGrp = null;
    });

}

function resetView() {
    if (activeObject) {
      viewExtents(activeObject);
    } else {
      if (typeof(object) != 'undefined') {
        viewExtents(object);
      } else if (typeof(rastermesh) != 'undefined') {
        viewExtents(rastermesh);
      } else if (typeof(inflateGrp) != 'undefined') {
        viewExtents(inflateGrp);
      } else if (typeof(fileParentGroup) != 'undefined') {
        viewExtents(fileParentGroup);
      } else {
        viewExtents(helper);
      };
    }
}


//' Sets the input boxes to the current real-world sizes.  But why, well maybe we arent only going to scale/position via the input boxes?
// in which case we want to update the textboxes to match what we did from some other function'
function currentWorld() {
    if (fileParentGroup) {
        if ($("#linkAspect").hasClass("fa-link")) {
            if (oldyscale != fileParentGroup.scale.y) {
                fileParentGroup.scale.x = fileParentGroup.scale.y;
            };
            if (oldxscale != fileParentGroup.scale.x) {
                fileParentGroup.scale.y = fileParentGroup.scale.x;
            };
        }

        $('#xpos').val(parseInt(fileParentGroup.position.x) + (laserxmax / 2));
        $('#ypos').val(parseInt(fileParentGroup.position.y) + (laserymax / 2));
        $('#scaleFactor').val((fileParentGroup.scale.x) * 100);
        fileParentGroup.position.z = 0.001;

        $('#rotationval').val((fileObject.rotation.z / Math.PI * 180).toFixed(0) * -1);

        oldscalex = fileParentGroup.scale.x;
        oldyscale = fileParentGroup.scale.y;
    }

}

function putFileObjectAtZero() {
    // var hex  = 0xff0000;
    // var bbox = new THREE.BoundingBoxHelper( fileParentGroup, hex );
    // bbox.update();
    // scene.add( bbox );
    if (fileParentGroup) {
        var bbox2 = new THREE.Box3().setFromObject(fileParentGroup);
        console.log('bbox for putFileObjectAtZero: Min X: ', (bbox2.min.x + (laserxmax / 2)), '  Max X:', (bbox2.max.x + (laserxmax / 2)), 'Min Y: ', (bbox2.min.y + (laserymax / 2)), '  Max Y:', (bbox2.max.y + (laserymax / 2)));
        Xtofix = -(bbox2.min.x + (laserxmax / 2));
        imagePosition = $('#imagePosition').val()
        console.log('ImagePosition', imagePosition)
        if (imagePosition == "TopLeft") {
            Ytofix = (laserymax / 2) - bbox2.max.y;
        } else {
            Ytofix = -(bbox2.min.y + (laserymax / 2));
        }
        console.log('X Offset', Xtofix)
        console.log('Y Offset', Ytofix)
        fileParentGroup.translateX(Xtofix);
        fileParentGroup.translateY(Ytofix);
        currentWorld();
    }

}

function putInflateGrpAtZero() {
    if (yflip == true) {
        inflateGrp.position.x = fileParentGroup.position.x
        inflateGrp.position.y = fileParentGroup.position.y
    } else {
        inflateGrp.position.x = fileParentGroup.position.x
        inflateGrp.position.y = fileParentGroup.position.y
    };
    currentWorld();

}
