/*
    Based on code from:  John Lauer, Todd Fleming
    -- changes by AUTHOR: Peter van der Walt
*/
var inflateGrp, fileParentGroup, fileParentGroupOriginal, fileObjectOriginal, fileGroup, svgPath, fileInflatePath, i, il, y, yl, shape, lines, line;
var options = {};

$(document).ready(function() {

    $('#generategcode').on('click', function() { // DXF job Params to MC
        if (typeof(fileObject) == 'undefined') {
            printLog('No file loaded. do, File -> Open, first!', errorcolor)
        };
        // Lets get the machine specific Gcode from the settings Modal (:
        var startgcode = document.getElementById('startgcode').value;
        var laseron = document.getElementById('laseron').value;
        var laseroff = document.getElementById('laseroff').value;
        var lasermultiply = document.getElementById('lasermultiply').value;
        var homingseq = document.getElementById('homingseq').value;
        var endgcode = document.getElementById('endgcode').value;
        cncMode = $('#cncMode').val()
        if (cncMode == "Enable") {
          var clearanceHeight = document.getElementById('clearanceHeight').value;
        } else {
          var clearanceHeight = 0
        }

        // Remove old Gcode
        // document.getElementById('gcodepreview').value = "";
        $('#gcodejobs').empty();
        lineObjects = null;
        lineObjects = new THREE.Object3D();
        var total = scene.children.length
        for (var j = 6; j < total; j++) {
          console.log('Removed ', scene.children[j].name);
          scene.remove(scene.children[j]);
        }
        for (var j = 0; j < objectsInScene.length; j++) {
          console.log('added object ' + j)
          scene.add(objectsInScene[j]);
        }




        scene.updateMatrixWorld();

        scene.updateMatrixWorld();
        pwr = [];
        cutSpeed = [];
        for (j = 0; j < objectsInScene.length; j++) {
            printLog('Processing ' + objectsInScene[j].name, msgcolor)
            // This step converts each object in objectsInScene, to gcode and puts that gcode into objectsInScene[j].userData.gcode - to be later assembled into a gcode file with proper sequence
            objectsInScene[j].updateMatrix();
            if (objectsInScene[j].name != 'object') {
              if (objectsInScene[j].type == "Mesh") {
                console.log('Object '+j+' is a Raster')
                runRaster(j)
              } else {
                console.log('Object '+j+' is a Vector')
                var cutSpeed0 = parseFloat( $("#speed"+(j)).val() ) * 60;
                var pwr0 = parseFloat( $("#power"+(j)).val() );
                var plungeSpeed0 = parseFloat( $("#plungespeed"+(j)).val() ) * 60;
                rapidSpeed = parseFloat(document.getElementById('rapidspeed').value) * 60;
                if (objectsInScene[j].userData.inflated) {
                  // g += generateGcode(objectsInScene[j].userData.inflated, j, cutSpeed0, plungeSpeed0, pwr0, rapidSpeed, laseron, laseroff, clearanceHeight);
                  objectsInScene[j].userData.gcode = generateGcode(objectsInScene[j].userData.inflated, j, cutSpeed0, plungeSpeed0, pwr0, rapidSpeed, laseron, laseroff, clearanceHeight);
                } else {
                  // g += generateGcode(objectsInScene[j], j, cutSpeed0, plungeSpeed0 ,pwr0, rapidSpeed, laseron, laseroff, clearanceHeight);
                  objectsInScene[j].userData.gcode = generateGcode(objectsInScene[j], j, cutSpeed0, plungeSpeed0 ,pwr0, rapidSpeed, laseron, laseroff, clearanceHeight);

                  var template = `
                  <form class="form-horizontal">
                    <label for="startgcodefinal" class="control-label">`+objectsInScene[j].name+`</label>
                    <textarea id="gcode`+i+`" spellcheck="false" style="width: 100%; height: 80px;" placeholder="processing..."></textarea>
                  </form>`

                  $('#gcodejobs').append(template);

                  $('#gcode'+i).val(objectsInScene[j].userData.gcode);

                  var startgcode = document.getElementById('startgcode').value;
                  var endgcode = document.getElementById('endgcode').value;

                  $('#startgcodefinal').val(startgcode)
                  $('#endgcodefinal').val(endgcode);

                  printLog('Gcode Generated for ' +objectsInScene[j].name , successcolor);
                  // prepgcodefile();
                }
              }
            }
        }
        scene.remove(inflateGrp);

        $('#gcode-menu').click();
        openGCodeFromText();
    });
});

function prepgcodefile() {
  var startgcode = document.getElementById('startgcode').value;
  var endgcode = document.getElementById('endgcode').value;
  var g = ""
  g += startgcode;
  var externalgcode = document.getElementById('gcodepreview').value;
  if (externalgcode) {
    g += externalgcode;
  }

  for (j = 0; j < objectsInScene.length; j++) {
      printLog('Processing ' + objectsInScene[j].name, msgcolor)
      // document.getElementById('gcodepreview').value = "";
      if (typeof(objectsInScene[j].userData.gcode) != "undefined") {
       g += objectsInScene[j].userData.gcode
     } else {
       console.log(objectsInScene[j].name + ' does not have valid gcode yet')
     }
  }
  g += endgcode;
  return g;
}

function generateGcode(threeGroup, objectseq, cutSpeed, plungeSpeed, laserPwr, rapidSpeed, laseron, laseroff, clearanceHeight) {

    var laserPwrVal = 0.0;
    console.log('inside generateGcode')
    console.log('Group', threeGroup);
    console.log('CutSpeed', cutSpeed);
    console.log('plungeSpeed', plungeSpeed);
    console.log('Laser Power %', laserPwr);
    var lasermultiply = $('#lasermultiply').val();
    console.log('Laser Multiplier', lasermultiply);

    if (lasermultiply <= 1) {
        var laserPwrVal = laserPwr / 100;
        laserPwrVal = parseFloat(laserPwrVal).toFixed(2);
    } else {
        var laserPwrVal = laserPwr * (lasermultiply / 100);
        laserPwrVal = laserPwrVal.toFixed(0);
    }
    console.log('Laser Power Value', laserPwrVal, ' type of ', typeof(laserPwrVal));

    var g = "";
    // get the THREE.Group() that is the txt3d

    var grp = threeGroup;
    var txtGrp = threeGroup;
    var that = this;
    var isLaserOn = false;
    var isAtClearanceHeight = false;
    var isFeedrateSpecifiedAlready = false;
    var isSeekrateSpecifiedAlready = false;
    // var subj_path2 = [];
    // var subj_paths = [];
    console.log(txtGrp);
    console.log(rapidSpeed)
    console.log(cutSpeed);

    // txtGrp.updateMatrixWorld();

    txtGrp.traverse(function(child) {
        console.log(child);
        if (child.type == "Line") {
            // let's create gcode for all points in line
            for (i = 0; i < child.geometry.vertices.length; i++) {

                // Convert to World Coordinates
                var localPt = child.geometry.vertices[i];
                var worldPt = grp.localToWorld(localPt.clone());
                // if (stl) {
                //     var xpos = (parseFloat(worldPt.x.toFixed(3)) + (parseFloat(laserxmax) / 2) + child.parent.position.x).toFixed(3);
                //     var ypos = (parseFloat(worldPt.y.toFixed(3)) + (parseFloat(laserymax) / 2) + child.parent.position.y).toFixed(3);
                // } else if (yflip == true && !inflateGrp) {
                //     var xpos = (parseFloat(worldPt.x.toFixed(3)) + (parseFloat(laserxmax) / 2)).toFixed(3);
                //     var ypos = (-1 * parseFloat(worldPt.y.toFixed(3)) + (parseFloat(laserymax) / 2)).toFixed(3);
                // } else {
                var xpos_offset = (parseFloat(child.position.x.toFixed(3)));
                var ypos_offset = (parseFloat(child.position.y.toFixed(3)));
                var xpos = parseFloat((parseFloat(worldPt.x.toFixed(3)) + (parseFloat(laserxmax) / 2)).toFixed(3));
                var ypos = parseFloat((parseFloat(worldPt.y.toFixed(3)) + (parseFloat(laserymax) / 2)).toFixed(3));
                // };

                if (child.geometry.type == "CircleGeometry") {

                  // console.log("Type Check:  xpos_offset:" + typeof(xpos_offset) + " xpos:" + typeof(xpos));
                  // console.log("Type Check:  ypos_offset:" + typeof(xpos_offset) + " ypos:" + typeof(xpos));
                  // console.log("Found Segment of circle - adjusting by parent position: X:" + xpos_offset + " Y:" + ypos_offset )
                  // console.log("Before Move: X:" + xpos + " Y:" + ypos);
                  xpos = (xpos + xpos_offset);
                  ypos = (ypos + ypos_offset);
                  // console.log("After Move: X:" + xpos + " Y:" + ypos);
                }


                var zpos = parseFloat(worldPt.z.toFixed(3));

                // First Move To
                if (i == 0) {
                    // first point in line where we start lasering/milling
                    var seekrate;
                    if (isSeekrateSpecifiedAlready) {
                        seekrate = "";
                    } else {
                        console.log('Rapid Speed: ', rapidSpeed);
                        if (rapidSpeed) {
                            seekrate = " F" + rapidSpeed;
                            isSeekrateSpecifiedAlready = true;
                        } else {
                            seekrate = "";
                        }

                    }
                    cncMode = $('#cncMode').val()
                    if (cncMode == "Enable") {
                      if (!isAtClearanceHeight) {
                        g += "G0 Z" + clearanceHeight + "\n"; // Position Before Plunge!
                      }
                    };
                    g += "G0" + seekrate;
                    g += " X" + xpos + " Y" + ypos + "\n";
                    if (cncMode == "Enable") {
                      g += "G0 Z1\n";  // G0 to Z0 then Plunge!
                      g += "G1 F"+plungeSpeed+" Z" + zpos + "\n";  // Plunge!!!!
                    } else {
                      if (isFeedrateSpecifiedAlready) {
                      } else {
                          console.log('Cut Speed: ', cutSpeed);
                          if (cutSpeed) {
                              feedrate = " F" + cutSpeed;
                              isFeedrateSpecifiedAlready = true;
                          } else {
                              feedrate = "";
                          }
                      }
                      g +=  "G1" + feedrate + " X" + xpos + " Y" + ypos + " Z" + zpos + "\n";
                    };
                    isAtClearanceHeight = false;
                // Else Cut move
                } else {
                    // we are in a non-first line so this is normal moving
                    // if the laser is not on, we need to turn it on
                    if (!isLaserOn) {
                        if (laseron) {
                            g += laseron
                            g += '\n'
                        } else {
                            // Nothing - most of the firmware used G0 = move, G1 = cut and doesnt need a laseron/laseroff command
                        };
                        isLaserOn = true;
                    }

                    // do normal feedrate move
                    var feedrate;
                    if (isFeedrateSpecifiedAlready) {
                    } else {
                        console.log('Cut Speed: ', cutSpeed);
                        if (cutSpeed) {
                            feedrate = " F" + cutSpeed;
                            isFeedrateSpecifiedAlready = true;
                        } else {
                            feedrate = "";
                        }
                    }
                    g += "G1" + feedrate;
                    g += " X" + xpos;
                    g += " Y" + ypos;
                    g += " Z" + zpos;
                    g += " S" + laserPwrVal + "\n";
                    // var xpos = parseFloat(worldPt.x.toFixed(3));
                    // var ypos = parseFloat(worldPt.y.toFixed(3));
                    // subj_paths.push({
                    //     X: xpos,
                    //     Y: ypos
                    // });
                }
            }



            // make feedrate have to get specified again on next line if there is one
            isFeedrateSpecifiedAlready = false;
            isLaserOn = false;
            // if (firmware.indexOf('Grbl') == 0) {
            if (laseroff) {
                g += laseroff
                g += '\n'
            } else {
                // Nothing - most of the firmware used G0 = move, G1 = cut and doesnt need a laseron/laseroff command
            }
        }
    });
    console.log("generated gcode. length:", g.length);
    isGcodeInRegeneratingState = false;
    return g;
};

addOperation = function(index, operation, zstep, zdepth) {

  if (operation == "Laser (no path offset)") {
    objectsInScene[index].userData.inflated = inflatePath(objectsInScene[index], 0, zstep, zdepth );
    objectsInScene[index].userData.operation = operation;
    objectsInScene[index].userData.zstep = zstep;
    objectsInScene[index].userData.zdepth = zdepth;
  }

  if (operation == "Inside") {
    objectsInScene[index].userData.inflated = inflatePath(objectsInScene[index], -($("#tooldia").val()/2), zstep, zdepth );
    objectsInScene[index].userData.operation = operation;
    objectsInScene[index].userData.zstep = zstep;
    objectsInScene[index].userData.zdepth = zdepth;
  }

  if (operation == "Outside") {
    objectsInScene[index].userData.inflated = inflatePath(objectsInScene[index], ($("#tooldia").val()/2), zstep, zdepth );
    objectsInScene[index].userData.operation = operation;
    objectsInScene[index].userData.zstep = zstep;
    objectsInScene[index].userData.zdepth = zdepth;
  }

  if (operation == "Pocket") {
    objectsInScene[index].userData.inflated = pocketPath(objectsInScene[index], ($("#tooldia").val()/2), zstep, zdepth );
    objectsInScene[index].userData.operation = operation;
    objectsInScene[index].userData.zstep = zstep;
    objectsInScene[index].userData.zdepth = zdepth;
  }

  setTimeout(function(){ fillLayerTabs(); }, 100);

}

inflatePath = function(infobject, inflateVal, zstep, zdepth) {
    var zstep = parseFloat(zstep, 2);
    var zdepth = parseFloat(zdepth, 2);
    var inflateGrpZ = new THREE.Group();
    if (typeof(inflateGrp) != 'undefined') {
        scene.remove(inflateGrp);
        inflateGrp = null;
    }
    // if (inflateVal != 0) {
        console.log("user wants to inflate. val:", inflateVal);
        infobject.updateMatrix();
        var grp = infobject;
        var clipperPaths = [];
        grp.traverse(function(child) {
            console.log('Traverse: ', child)
            if (child.name == "inflatedGroup") {
                console.log("this is the inflated path from a previous run. ignore.");
                return;
            } else if (child.type == "Line") {
                // let's inflate the path for this line. it may not be closed
                // so we need to check that.
                var clipperArr = [];
                // Fix world Coordinates
                for (i = 0; i < child.geometry.vertices.length; i++) {
                    var localPt = child.geometry.vertices[i];
                    var worldPt = grp.localToWorld(localPt.clone());
                    var xpos = (parseFloat(worldPt.x.toFixed(3)));
                    var ypos = (parseFloat(worldPt.y.toFixed(3)));

                    clipperArr.push({
                        X: xpos,
                        Y: ypos
                    });
                }
                clipperPaths.push(clipperArr);
            } else if (child.type == "Points") {
                child.visible = false;
            } else {
                console.log("type of ", child.type, " being skipped");
            }
        });

        console.log("clipperPaths:", clipperPaths);

        // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
        var newClipperPaths = simplifyPolygons(clipperPaths);

        if (newClipperPaths.length < 1) {
            console.error("Clipper Simplification Failed!:");
            printLog('Clipper Simplification Failed!', errorcolor)
        }

        // get the inflated/deflated path
        var inflatedPaths = getInflatePath(newClipperPaths, inflateVal);

        for (i = 0; i < zdepth; i += zstep) {
            inflateGrp = drawClipperPaths(inflatedPaths, 0xff00ff, 0.8, -i, true, "inflatedGroup"); // (paths, color, opacity, z, zstep, isClosed, isAddDirHelper, name, inflateVal)
            inflateGrp.name = 'inflateGrp';
            inflateGrp.position = infobject.position;
            console.log(i)
            inflateGrpZ.add(inflateGrp)
        }
        return inflateGrpZ
    // }
};


pocketPath = function(infobject, inflateVal, zstep, zdepth) {
    var zstep = parseFloat(zstep, 2);
    var zdepth = parseFloat(zdepth, 2);
    var pocketGrp = new THREE.Group();
    if (typeof(inflateGrp) != 'undefined') {
        scene.remove(inflateGrp);
        inflateGrp = null;
    }
    if (inflateVal != 0) {
        console.log("user wants to inflate. val:", inflateVal);
        infobject.updateMatrix();
        var grp = infobject;
        var clipperPaths = [];
        grp.traverse(function(child) {
            console.log('Traverse: ', child)
            if (child.name == "inflatedGroup") {
                console.log("this is the inflated path from a previous run. ignore.");
                return;
            } else if (child.type == "Line") {
                // let's inflate the path for this line. it may not be closed
                // so we need to check that.
                var clipperArr = [];
                // Fix world Coordinates
                for (i = 0; i < child.geometry.vertices.length; i++) {
                    var localPt = child.geometry.vertices[i];
                    var worldPt = grp.localToWorld(localPt.clone());
                    var xpos = (parseFloat(worldPt.x.toFixed(3)));
                    var ypos = (parseFloat(worldPt.y.toFixed(3)));

                    clipperArr.push({
                        X: xpos,
                        Y: ypos
                    });
                }
                clipperPaths.push(clipperArr);
            } else if (child.type == "Points") {
                child.visible = false;
            } else {
                console.log("type of ", child.type, " being skipped");
            }
        });

        console.log("clipperPaths:", clipperPaths);

        // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
        var newClipperPaths = simplifyPolygons(clipperPaths);

        if (newClipperPaths.length < 1) {
            console.error("Clipper Simplification Failed!:");
            printLog('Clipper Simplification Failed!', errorcolor)
        }

        for (j = 0; j < zdepth; j += zstep) {
            // get the inflated/deflated path

          for (i = 1; i < 100; i++) {  // Rather 100 than a while loop, just in case
            inflateValUsed = inflateVal * i;
            var inflatedPaths = getInflatePath(newClipperPaths, -inflateValUsed);
            inflateGrp = drawClipperPaths(inflatedPaths, 0xff00ff, 0.8, -j, true, "inflatedGroup"); // (paths, color, opacity, z, zstep, isClosed, isAddDirHelper, name, inflateVal)
            if (inflateGrp.children.length) {
              inflateGrp.name = 'inflateGrp';
              inflateGrp.position = infobject.position;
              pocketGrp.add(inflateGrp)
            } else {
              console.log('Pocket already done after ' + i + ' iterations')
              break;
            }
          }
        }
        return pocketGrp
    }
};


simplifyPolygons = function(paths) {
    console.log('Simplifying: ', paths)
    var scale = 10000;
    ClipperLib.JS.ScaleUpPaths(paths, scale);
    var newClipperPaths = ClipperLib.Clipper.SimplifyPolygons(paths, ClipperLib.PolyFillType.pftEvenOdd);
    console.log('Simplified: ', newClipperPaths)
    // scale back down
    ClipperLib.JS.ScaleDownPaths(newClipperPaths, scale);
    ClipperLib.JS.ScaleDownPaths(paths, scale);
    return newClipperPaths;
};

getInflatePath = function(paths, delta, joinType) {
    var scale = 10000;
    ClipperLib.JS.ScaleUpPaths(paths, scale);
    var miterLimit = 2;
    var arcTolerance = 10;
    joinType = joinType ? joinType : ClipperLib.JoinType.jtRound
    var co = new ClipperLib.ClipperOffset(miterLimit, arcTolerance);
    co.AddPaths(paths, joinType, ClipperLib.EndType.etClosedPolygon);
    //var delta = 0.0625; // 1/16 inch endmill
    var offsetted_paths = new ClipperLib.Paths();
    co.Execute(offsetted_paths, delta * scale);
    // scale back down
    ClipperLib.JS.ScaleDownPaths(offsetted_paths, scale);
    ClipperLib.JS.ScaleDownPaths(paths, scale);
    return offsetted_paths;
};

drawClipperPaths = function(paths, color, opacity, z, isClosed, name) {
    console.log("drawClipperPaths");

    var lineUnionMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
    });

    if (z === undefined || z == null)
        z = 0;

    if (isClosed === undefined || isClosed == null)
        isClosed = true;

    var group = new THREE.Object3D();
    if (name) group.name = name;

    for (var i = 0; i < paths.length; i++) {
        var lineUnionGeo = new THREE.Geometry();
        for (var j = 0; j < paths[i].length; j++) {
            lineUnionGeo.vertices.push(new THREE.Vector3(paths[i][j].X, paths[i][j].Y, z));
        }
        // close it by connecting last point to 1st point
        if (isClosed) lineUnionGeo.vertices.push(new THREE.Vector3(paths[i][0].X, paths[i][0].Y, z));
        var lineUnion = new THREE.Line(lineUnionGeo, lineUnionMat);
        if (name) lineUnion.name = name;
        group.add(lineUnion);
    }
    return group;
};
