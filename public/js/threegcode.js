/*
    AUTHOR: Peter van der Walt
    Based on code from:  John Lauer, Todd Fleming, Nicholas Raynaud and others
*/
var inflateGrp, fileParentGroup, svgPath, y, shape, lines, line;
var options = {};

$(document).ready(function() {


    $('#generategcode').on('click', function() {

        // FIXME
        // What is this check for?
        if (typeof(fileObject) == 'undefined') {
            printLog('No file loaded. do, File -> Open, first!', errorcolor, "file")
        };

        console.group("Generating GCode");

        console.log("Removing any existing GCode");
        for (j = 0; j < objectsInScene.length; j++) {
          // Cleanup Existing GCode
          objectsInScene[j].userData.gcode = "";
        }

        // Remove old Gcode
        // document.getElementById('gcodepreview').value = "";
        $('#gcodejobs').empty();
        lineObjects = null;
        lineObjects = new THREE.Object3D();
        var total = scene.children.length
        for (var j = 6; j < total; j++) {
          scene.remove(scene.children[j]);
        }
        for (var j = 0; j < objectsInScene.length; j++) {
          // console.log('added object ' + j)
          scene.add(objectsInScene[j]);
        }

        scene.updateMatrixWorld();

        for (j = 0; j < objectsInScene.length; j++) {
            printLog('Processing ' + objectsInScene[j].name, msgcolor, "file");
            // This step converts each object in objectsInScene, to gcode and puts that gcode into objectsInScene[j].userData.gcode - to be later assembled into a gcode file with proper sequence
            objectsInScene[j].updateMatrix();
            if (objectsInScene[j].name != 'object') {
              if (objectsInScene[j].type == "Mesh") {
                console.log('Object: '+objectsInScene[j].name+' is a Raster')
                runRaster(j)
              } else {
                console.log('Object: '+objectsInScene[j].name+' is a Vector');

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



                var cutSpeed0 = parseFloat( $("#speed"+(j)).val() ) * 60;
                var pwr0 = parseFloat( $("#power"+(j)).val() );
                var plungeSpeed0 = parseFloat( $("#plungespeed"+(j)).val() ) * 60;
                var passes = parseInt( $("#passes"+(j)).val() );
                var passdepth = parseFloat( $("#depth"+(j)).val() );
                var rapidSpeed = parseFloat($("#rapidspeed").val() ) * 60;
                if (objectsInScene[j].userData.inflated) {
                  // g += generateGcode(objectsInScene[j].userData.inflated, j, cutSpeed0, plungeSpeed0, pwr0, rapidSpeed, laseron, laseroff, clearanceHeight);
                  printLog('Separate Operation for ' + objectsInScene[j].name, msgcolor, "file")
                  objectsInScene[j].userData.gcode = generateGcode(objectsInScene[j].userData.inflated, j, cutSpeed0, plungeSpeed0, pwr0, rapidSpeed, laseron, laseroff, clearanceHeight);
                } else {
                  // g += generateGcode(objectsInScene[j], j, cutSpeed0, plungeSpeed0 ,pwr0, rapidSpeed, laseron, laseroff, clearanceHeight);
                  if (passes > 1) {
                    console.log("Mulipass Layers to generate: " + passes);
                    var gcodewithmultipass = "";
                    for (m = 0; m < passes; m++) {
                      console.log("Mulipass Layer: " + m);
                      var zoffset = passdepth * m;
                       gcodewithmultipass += generateGcode(objectsInScene[j], j, cutSpeed0, plungeSpeed0, pwr0, rapidSpeed, laseron, laseroff, clearanceHeight, zoffset);
                    }
                    objectsInScene[j].userData.gcode = gcodewithmultipass;
                  } else {
                    objectsInScene[j].userData.gcode = generateGcode(objectsInScene[j], j, cutSpeed0, plungeSpeed0, pwr0, rapidSpeed, laseron, laseroff, clearanceHeight, 0);
                  }

                }
                  var template = `
                  <form class="form-horizontal">
                    <label for="gcode`+i+`" class="control-label">`+objectsInScene[j].name+`</label>
                    <textarea id="gcode`+i+`" spellcheck="false" style="width: 100%; height: 80px;" placeholder="processing..." disabled></textarea>
                  </form>`

                  $('#gcodejobs').append(template);

                  $('#gcode'+i).val(objectsInScene[j].userData.gcode);

                  var startgcode = document.getElementById('startgcode').value;
                  var endgcode = document.getElementById('endgcode').value;

                  $('#startgcodefinal').val(startgcode)
                  $('#endgcodefinal').val(endgcode);

                  printLog('Gcode Data Generated for ' +objectsInScene[j].name , successcolor, "file");
                  // prepgcodefile();

              }
            }
        }
        scene.remove(inflateGrp);

        $('#gcode-menu').click();
        console.groupEnd();
        console.log('running openGCodeFromText')
        openGCodeFromText();
    });
});

function prepgcodefile() {

  console.group("Consolidating GCode file");
  var startgcode = document.getElementById('startgcode').value;
  var endgcode = document.getElementById('endgcode').value;
  var g = ""
  if (startgcode)  {
    g += startgcode;
    g += "\n";
  }
  var externalgcode = document.getElementById('gcodepreview').value;
  if (externalgcode) {
    g += externalgcode;
  }

  for (j = 0; j < objectsInScene.length; j++) {
      printLog('Preparing Gcode File: ' + objectsInScene[j].name, msgcolor, "file");
      console.log('Preparing Gcode File: ' + objectsInScene[j].name);
      // document.getElementById('gcodepreview').value = "";
      if (typeof(objectsInScene[j].userData.gcode) != "undefined") {
       g += objectsInScene[j].userData.gcode;
     } else {
       console.log(objectsInScene[j].name + ' does not have valid gcode yet');
     }
  }
  g += "\n";
  if (endgcode) {
    g += endgcode;
  }
  console.groupEnd();
  return g;
}

function generateGcode(threeGroup, objectseq, cutSpeed, plungeSpeed, laserPwr, rapidSpeed, laseron, laseroff, clearanceHeight, zoffset) {

    var laserPwrVal = 0.0;
    // console.log('inside generateGcode')
    // console.log('Group', threeGroup);
    // console.log('CutSpeed', cutSpeed);
    // console.log('plungeSpeed', plungeSpeed);
    // console.log('Laser Power %', laserPwr);
    var lasermultiply = $('#lasermultiply').val();
    // console.log('Laser Multiplier', lasermultiply);

    if (lasermultiply <= 1) {
        var laserPwrVal = laserPwr / 100;
        laserPwrVal = parseFloat(laserPwrVal).toFixed(2);
    } else {
        var laserPwrVal = laserPwr * (lasermultiply / 100);
        laserPwrVal = laserPwrVal.toFixed(0);
    }
    // console.log('Laser Power Value', laserPwrVal, ' type of ', typeof(laserPwrVal));

    var g = "";
    // get the THREE.Group() that is the txt3d

    var txtGrp = threeGroup;
    var that = this;
    var isLaserOn = false;
    var isAtClearanceHeight = false;
    var isFeedrateSpecifiedAlready = false;
    var isSeekrateSpecifiedAlready = false;


    var cncMode = false;

    if  ($('#cncMode').val() == "Enable") {
      cncMode = true;
    }

    var airAssist = $('#airAssistAttached').val() == "Enable";
    // var subj_path2 = [];
    // var subj_paths = [];
    // console.log(txtGrp);
    // console.log(rapidSpeed)
    // console.log(cutSpeed);

    // txtGrp.updateMatrixWorld();

    txtGrp.traverse(function(child) {
        // console.log(child);
        if (child.type == "Line") {

            var xpos_offset = child.position.x;
            var ypos_offset = child.position.y;


            // let's create gcode for all points in line
            for (i = 0; i < child.geometry.vertices.length; i++) {

                // Convert to World Coordinates
                var localPt = child.geometry.vertices[i];
                var worldPt = txtGrp.localToWorld(localPt.clone());
                var xpos = worldPt.x + (parseFloat(laserxmax) / 2);
                var ypos = worldPt.y + (parseFloat(laserymax) / 2);


                if (child.geometry.type == "CircleGeometry") {
                  xpos = (xpos + xpos_offset);
                  ypos = (ypos + ypos_offset);
                }


                // For any ordinary loaded 2D image, worldPt.z is 0 here.
                var zpos = worldPt.z + getBaseZHeight();

                // We now offset for multiple passes
                // If air assist is attached, maximum offset is 10mm (to preserve clearance over material)
                // Since we are subtracting the offset from the current Z height, we want the minimum offset of 
                // either the request pass offset, or 10 mm 
                if (zoffset) {
                  if (airAssist == true) {
                    zoffset = Math.min(zoffset, 10);
                  }
                  zpos = zpos - zoffset;
                }

                // First Move To
                if (i == 0) {
                    // first point in line where we start lasering/milling
                    var seekrate;
                    if (isSeekrateSpecifiedAlready) {
                        seekrate = "";
                    } else {
                        // console.log('Rapid Speed: ', rapidSpeed);
                        if (rapidSpeed) {
                            seekrate = " F" + rapidSpeed;
                            isSeekrateSpecifiedAlready = true;
                        } else {
                            seekrate = "";
                        }

                    }
                    if (cncMode) {
                      if (!isAtClearanceHeight) {
                        g += "\nG0 Z" + clearanceHeight + "\n"; // Position Before Plunge!
                      }
                    };
                    g += "G0" + seekrate;
                    g += " X" + xpos.toFixed(4) + " Y" + ypos.toFixed(4) + "\n";
                    if (cncMode) {
                      g += "\nG0 Z1\n";  // G0 to Z0 then Plunge!
                      g += "G1 F"+plungeSpeed+" Z" + zpos.toFixed(4) + "\n";  // Plunge!!!!
                    } else {
                      if (isFeedrateSpecifiedAlready) {
                      } else {
                          // console.log('Cut Speed: ', cutSpeed);
                          if (cutSpeed) {
                              feedrate = " F" + cutSpeed;
                              isFeedrateSpecifiedAlready = true;
                          } else {
                              feedrate = "";
                          }
                      }
                      g +=  "G1" + feedrate + " X" + xpos.toFixed(4) + " Y" + ypos.toFixed(4) + " Z" + zpos.toFixed(4) + "\n";
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
                    g += " X" + xpos.toFixed(4);
                    g += " Y" + ypos.toFixed(4);
                    g += " Z" + zpos.toFixed(4);
                    g += " S" + laserPwrVal + "\n";
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
    console.log("Generated gcode. length:", g.length);
    console.log(" ");
    isGcodeInRegeneratingState = false;
    return g;
};

addOperation = function(index, operation, zstep, zdepth) {

  // This assumes that operation is one of a fixed set of values.
  halfToolDiameter = $("#tooldia").val()/2;

  if (operation == "Laser (no path offset)") {
    objectsInScene[index].userData.inflated = inflatePath(objectsInScene[index], 0, zstep, zdepth );
  } else if (operation == "Inside") {
    objectsInScene[index].userData.inflated = inflatePath(objectsInScene[index], -halfToolDiameter, zstep, zdepth );
  } else if (operation == "Outside") {
    objectsInScene[index].userData.inflated = inflatePath(objectsInScene[index], halfToolDiameter, zstep, zdepth );
  } else if (operation == "Pocket") {
    objectsInScene[index].userData.inflated = pocketPath(objectsInScene[index], halfToolDiameter, zstep, zdepth );
  } else if (operation == "Drag Knife") {
    objectsInScene[index].userData.inflated = dragknifePath(objectsInScene[index], halfToolDiameter, zstep, zdepth );
  }

  objectsInScene[index].userData.operation = operation;
  objectsInScene[index].userData.zstep = zstep;
  objectsInScene[index].userData.zdepth = zdepth;

  setTimeout(function(){ fillLayerTabs(); }, 100);
  setTimeout(function(){ fillTree(); }, 101);

};

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
                    var xpos = worldPt.x;
                    var ypos = worldPt.y;

                    var xpos_offset = (parseFloat(child.position.x.toFixed(3)));
                    var ypos_offset = (parseFloat(child.position.y.toFixed(3)));

                    if (child.geometry.type == "CircleGeometry") {
                     xpos = (xpos + xpos_offset);
                     ypos = (ypos + ypos_offset);
                    }

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
            printLog('Clipper Simplification Failed!', errorcolor, "viewer");
        }

        // get the inflated/deflated path
        var inflatedPaths = getInflatePath(newClipperPaths, inflateVal);

        for (i = 0; i < zdepth; i += zstep) {
            inflateGrp = drawClipperPaths(inflatedPaths, 0xff00ff, 0.8, -i, true, "inflatedGroup"); // (paths, color, opacity, z, zstep, isClosed, isAddDirHelper, name, inflateVal)
            inflateGrp.name = 'inflateGrp';
            if (inflateGrp.userData.color) {
              inflateGrp.userData.color = inflateGrp.material.color.getHex();
            }
            inflateGrp.position = infobject.position;
            console.log(i);
            inflateGrpZ.add(inflateGrp);
        }
        return inflateGrpZ;
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

                    var xpos_offset = (parseFloat(child.position.x.toFixed(3)));
                    var ypos_offset = (parseFloat(child.position.y.toFixed(3)));

                    if (child.geometry.type == "CircleGeometry") {
                     xpos = (xpos + xpos_offset);
                     ypos = (ypos + ypos_offset);
                    }



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
            printLog('Clipper Simplification Failed!', errorcolor, "viewer");
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
              // pocketGrp.userData.color = pocketGrp.material.color.getHex();
              pocketGrp.add(inflateGrp);
            } else {
              console.log('Pocket already done after ' + i + ' iterations');
              break;
            }
          }
        }
        return pocketGrp;
    }
};

dragknifePath = function(infobject, inflateVal, zstep, zdepth) {
    var zstep = parseFloat(zstep, 2);
    var zdepth = parseFloat(zdepth, 2);
    var dragknifeGrp = new THREE.Group();
    if (typeof(inflateGrp) != 'undefined') {
        scene.remove(inflateGrp);
        inflateGrp = null;
    }

    // if (inflateVal != 0) {
        console.log("user wants to create Drag Knife Path. val:", inflateVal);
        infobject.updateMatrix();
        var grp = infobject;
        var clipperPaths = [];
        grp.traverse(function(child) {
            // console.log('Traverse: ', child)
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
                    var xpos = worldPt.x;
                    var ypos = worldPt.y;

                    var xpos_offset = child.position.x;
                    var ypos_offset = child.position.y;

                    if (child.geometry.type == "CircleGeometry") {
                     xpos = (xpos + xpos_offset);
                     ypos = (ypos + ypos_offset);
                    }

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
            printLog('Clipper Simplification Failed!', errorcolor, "viewer")
        }



        for (j = 0; j < zdepth; j += zstep) {
            var polygons = newClipperPaths;
            polygons = polygons.map(function (poly) {
              // return addCornerActions(poly, Math.pow(2, 20) * 5, 20 / 180 * Math.PI);
              return addCornerActions(poly, inflateVal, 20 / 180 * Math.PI);
            });
            inflateGrp = drawClipperPaths(polygons, 0xff00ff, 0.8, -j, true, "inflatedGroup"); // (paths, color, opacity, z, zstep, isClosed, isAddDirHelper, name, inflateVal)
            if (inflateGrp.children.length) {
              inflateGrp.name = 'dragknifeGrp';
              inflateGrp.position = infobject.position;
              dragknifeGrp.userData.color = dragknifeGrp.material.color.getHex();
              dragknifeGrp.add(inflateGrp)
            } else {
              console.log('Dragknife Operation Failed')
              break;
            }
        }
        return dragknifeGrp
};

addCornerActions = function (clipperPolyline, clipperRadius, toleranceAngleRadians) {
  // var previousPoint = null;
  // var point = [];
    console.log("clipperPolyline Starting :  ", clipperPolyline);
    if (clipperRadius == 0 || clipperPolyline.length == 0)
        return clipperPolyline;
    var result = [];
    result.push(clipperPolyline[0]);
    //previous point is not always at i-1, because repeated points in the polygon are skipped
    // var previousPoint = clipperPolyline[0];
    var previousPoint = new Point(clipperPolyline[0].X, clipperPolyline[0].Y, 0); //clipperPolyline[i - 1];
    for (var i = 1; i < clipperPolyline.length - 1; i++) {
        previousPoint = new Point(clipperPolyline[i - 1].X, clipperPolyline[i - 1].Y, 0); //clipperPolyline[i - 1];
        var point = new Point(clipperPolyline[i].X, clipperPolyline[i].Y, 0); //clipperPolyline[i];
        if (previousPoint.sqDistance(point) == 0)
         continue;
        // you don't want to play with atan2() if a point is repeated
        var incomingVector = point.sub(previousPoint);
        var nextPoint = new Point(clipperPolyline[i + 1].X, clipperPolyline[i + 1].Y, 0) //clipperPolyline[i + 1];
        var angle = point.angle(previousPoint, nextPoint);
        var overshoot = point.add(incomingVector.normalized().scale(clipperRadius));
        result.push(overshoot);
        if (Math.abs(angle) > toleranceAngleRadians) {

            var arcPoints = 100 / (2 * Math.PI) * Math.abs(angle);
            var incomingAngle = incomingVector.atan2();
            for (var j = 0; j <= arcPoints; j++) {
                var a = incomingAngle + angle / arcPoints * j;
                var pt = point.add(polarPoint(clipperRadius, a));
                result.push(pt);
            }
        }
        previousPoint = point;
    }
    if (clipperPolyline.length > 1)
        result.push(clipperPolyline[clipperPolyline.length - 1]);
    return result;
 }

 function Point(X, Y, Z) {
        this.X = X;
        this.Y = Y;
        this.Z = Z === undefined ? 0 : Z;
 }

 Point.prototype = {
   sqDistance: function (p) {
    var d = p == null ? this : this.sub(p);
    return d.X * d.X + d.Y * d.Y + d.Z * d.Z;
  },
  sub: function (p) {
      //  console.log("sub.x: ", this.x, " p.x ", p.x)
       return new Point(this.X - p.X, this.Y - p.Y, this.Z - p.Z);
  },
  angle: function (fromPoint, toPoint) {
       var toPoint2 = new Point(toPoint.X, toPoint.Y, toPoint.Z);
       var v1 = this.sub(fromPoint);
       var v2 = toPoint2.sub(this);
       var dot = v1.X * v2.X + v1.Y * v2.Y;
       var cross = v1.X * v2.Y - v1.Y * v2.X;
       var res = Math.atan2(cross, dot);
       var twoPi = 2 * Math.PI;
       if (res < -twoPi)
           return res + twoPi;
       if (res > twoPi)
           return res - twoPi;
       return res;
  },
  normalized: function () {
      // console.log("normalized.distance: ", this.distance())
       return this.scale(1 / this.distance());
       console.log("normalized: ", this.scale(1 / this.distance()))
  },
  scale: function (val) {
       return new Point(this.X * val, this.Y * val, this.Z * val);
  },
  distance: function (p) {
       return Math.sqrt(this.sqDistance(p));
  },
  add: function (p) {
       return new Point(this.X + p.X, this.Y + p.Y, this.Z + p.Z);
  },
  atan2: function () {
       return Math.atan2(this.Y, this.Y);
  },
};

polarPoint = function (r, theta) {
  return new Point(r * Math.cos(theta), r * Math.sin(theta));
};


simplifyPolygons = function(paths) {
    console.log('Simplifying: ', paths);
    var scale = 10000;
    ClipperLib.JS.ScaleUpPaths(paths, scale);
    var newClipperPaths = ClipperLib.Clipper.SimplifyPolygons(paths, ClipperLib.PolyFillType.pftEvenOdd);
    console.log('Simplified: ', newClipperPaths);
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
    joinType = joinType ? joinType : ClipperLib.JoinType.jtRound;
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
    console.log("drawClipperPaths", paths);

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
        if (isClosed) {
          lineUnionGeo.vertices.push(new THREE.Vector3(paths[i][0].X, paths[i][0].Y, z));
        }
        var lineUnion = new THREE.Line(lineUnionGeo, lineUnionMat);
        if (name) {
          lineUnion.name = name;
        }
        group.add(lineUnion);
    }
    return group;
};
