/*

  AUTHOR:  John Lauer
  -- S??? (laser intensity) Parameter Handling added by AUTHOR: Peter van der Walt
  v19/6/2016

*/

// This is a simplified and updated version of http://gcode.joewalnes.com/ that works with the latest version of Three.js (v68).
// Updated with code from http://chilipeppr.com/tinyg's 3D viewer to support more CNC type Gcode
var totaltimemax = '';
totaltimemax = 0;

var lineObjects = new THREE.Object3D();
lineObjects.name = 'LineObjects'

function GCodeParser(handlers) {
    handlers = handlers || {};

    lastArgs = {cmd: null};
    lastFeedrate = null;
    isUnitsMm = true;

    parseLine = function (text, info) {
        // console.log('Parsing: ',text)
        var origtext = text;

        if (text.match(/^N/i)) {                   // remove line numbers if exist
            text = text.replace(/^N\d+\s*/ig, ""); // yes, there's a line num
        }

	var isG7 = text.match(/^G7/);              // Is is G7 raster command?
        if (!isG7) {                               // G7 D-data need to be untouched
            text = text.replace(/G00/i, 'G0');     // collapse leading zero g cmds to no leading zero
            text = text.replace(/G0(\d)/i, 'G$1'); // add spaces before g cmds and xyzabcijkf params
	    text = text.replace(/([gmtxyzabcijkfst])/ig, " $1"); // remove spaces after xyzabcijkf params because a number should be directly after them
            text = text.replace(/([xyzabcijkfst])\s+/ig, "$1");  // remove front and trailing space
	}
        text = text.trim();

        var isComment = false;
        if (text.match(/^(;|\(|<)/)) {             // see if comment
            text = origtext;
            isComment = true;
        } else {                                   // make sure to remove inline comments
	    if (!isG7)
		text = text.replace(/\(.*?\)/g, "");
        }

        if (text && !isComment) {
            if (!isG7)
		text = text.replace(/(;|\().*$/, ""); // strip off end of line comment ; or () trailing

            var tokens = text.split(/\s+/);
            if (tokens) {
                var cmd = tokens[0];               // check if a g or m cmd was included in gcode line
                cmd = cmd.toUpperCase();           // you are allowed to just specify coords on a line
                ;                                  // and it should be assumed that the last specified gcode
                ;                                  // cmd is what's assumed
                isComment = false;
                if (!cmd.match(/^(G|M|T)/i)) {
                    cmd = this.lastArgs.cmd;       // we need to use the last gcode cmd
                    tokens.unshift(cmd);           // put at spot 0 in array
                } else {
                    ;                              // we have a normal cmd as opposed to just an xyz pos where
                    ;                              // it assumes you should use the last cmd
                    ;                              // however, need to remove inline comments (TODO. it seems parser works fine for now)
                }
                var args = {
                    'cmd': cmd,
                    'text': text,
                    'origtext': origtext,
                    'indx': info,
                    'isComment': isComment,
                    'feedrate': null,
                    'plane': undefined
                };

                if (tokens.length > 1  && !isComment) {
                    tokens.splice(1).forEach(function (token) {
                        if (token && token.length > 0) {
                            var key = token[0].toLowerCase();
			    if (!isG7) {
				var value = parseFloat(token.substring(1));
				if (isNaN(value)) {
				    value=0;
				}
				args[key] = value;
			    } else {                             // Special treatment for G7 with D-data
				if (key == '$') key = 'dollar';  // '$' doesn't work so well, use 'dollar'
				var value = token.substring(1);  // Don't convert values to float, need the D-data
				args[key] = value;
                            }
                        } else {
                            //console.log("couldn't parse token in foreach. weird:", token);
                        }
                    });
                }
                var handler = handlers[cmd] || handlers['default'];

                if (!args.isComment) {                           // don't save if saw a comment
                    lastArgs = args;
                }

                if (handler) {
                    // do extra check here for units. units are
                    // specified via G20 or G21. We need to scan
                    // each line to see if it's inside the line because
                    // we were only catching it when it was the first cmd
                    // of the line.
                    if (args.text.match(/\bG20\b/i)) {
                        console.log("SETTING UNITS TO INCHES from pre-parser!!!");
                        this.isUnitsMm = false; // false means inches cuz default is mm
                    } else if (args.text.match(/\bG21\b/i)) {
                        console.log("SETTING UNITS TO MM!!! from pre-parser");
                        this.isUnitsMm = true; // true means mm
                    }


                    if (args.text.match(/F([\d.]+)/i)) {           // scan for feedrate
                        var feedrate = parseFloat(RegExp.$1);      // we have a new feedrate
                        args.feedrate = feedrate;
                        this.lastFeedrate = feedrate;
                    } else {
                        args.feedrate = this.lastFeedrate;         // use feedrate from prior lines
                    }

                    return handler(args, info, this);
                } else {
                    console.error("No handler for gcode command!!!");
                }
            }
        } else {
            // it was a comment or the line was empty
            // we still need to create a segment with xyz in p2
            // so that when we're being asked to /gotoline we have a position
            // for each gcode line, even comments. we just use the last real position
            // to give each gcode line (even a blank line) a spot to go to

	    // REMOVE THIS ?

            var args = {
                'cmd': 'empty or comment',
                'text': text,
                'origtext': origtext,
                'indx': info,
                'isComment': isComment
            };
            var handler = handlers['default'];
            return handler(args, info, this);
        }
    }

    this.parse = function(gcode) {
        console.log('inside this.parse')
        object = null;
        var lines = gcode.split(/\r{0,1}\n/);
        var count = lines.length;
        var maxTimePerChunk = 500;
        var index = 0;

        function now() {
            return new Date().getTime();
        }

        var tbody = '';

        function doChunk() {
            var progress = (index / count);
            NProgress.set(progress);
            var startTime = now();
            while (index < count && (now() - startTime) <= maxTimePerChunk) {
                // console.log('parsing ' + lines[index])
                parseLine(lines[index], index);
                // tbody += '<tr id="tr'+[index]+'"><td>'+[index]+'</td><td>'+lines[index]+'</td></tr>';//code here using lines[i] which will give you each line
                ++index;
            }
	          closeLineSegment();
            // console.log('done parsing ')
            if (index < count) {
                setTimeout(doChunk, 1);  // set Timeout for async iteration
                // console.log('[GCODE PARSE] ' + (index / count ) * 100 + "%");
            } else {
                NProgress.done();
                NProgress.remove();
                // console.log('[GCODE PARSE] Done  ');
                $('#renderprogressholder').hide();
                object =  drawobject();
		            object.add(lineObjects);
                // console.log('Line Objects', lineObjects)
                object.translateX(laserxmax /2 * -1);
                object.translateY(laserymax /2 * -1);
                object.name = 'object';
                console.log('adding to scene')
                scene.add(object);
                // objectsInScene.push(object)
            }
        }
        doChunk();
    }
};
colorG0: 0x00ff00;
colorG1: 0x0000ff;
colorG2: 0x999900;

createObjectFromGCode = function (gcode, indxMax) {

    console.group("Generating GCODE Preview");

    // console.group("Rendering GCODE Preview")
    //debugger;
    // Credit goes to https://github.com/joewalnes/gcode-viewer
    // for the initial inspiration and example code.
    //
    // GCode descriptions come from:
    //    http://reprap.org/wiki/G-code
    //    http://en.wikipedia.org/wiki/G-code
    //    SprintRun source code

    // these are extra Object3D elements added during
    // the gcode rendering to attach to scene
    this.extraObjects = [];
    this.extraObjects["G17"] = [];
    this.extraObjects["G18"] = [];
    this.extraObjects["G19"] = [];
    this.offsetG92 = {x:0, y:0, z:0, a:0, e:0};

    var lastLine = {
        x: 0,
        y: 0,
        z: 0,
        a: 0,
        e: 0,
        f: 0,
        feedrate: null,
        extruding: false,
    };

    // we have been using an approach where we just append
    // each gcode move to one monolithic geometry. we
    // are moving away from that idea and instead making each
    // gcode move be it's own full-fledged line object with
    // its own userData info
    // G2/G3 moves are their own child of lots of lines so
    // that even the simulator can follow along better
    var new3dObj = new THREE.Group();
    new3dObj.name = 'newobj';
    plane = "G17"; //set default plane to G17 - Assume G17 if no plane specified in gcode.
    layers3d = [];
    layer = undefined;
    lines = [];
    totalDist = 0;
    bbbox = {
        min: {
            x: 100000,
            y: 100000,
            z: 100000
        },
        max: {
            x: -100000,
            y: -100000,
            z: -100000
        }
    };
    bbbox2 = {
        min: {
            x: 100000,
            y: 100000,
            z: 100000
        },
        max: {
            x: -100000,
            y: -100000,
            z: -100000
        }
    };

    newLayer = function (line) {
        //console.log("layers3d:", layers3d, "layers3d.length", layers3d.length);
        layer = {
            type: {},
            layer: layers3d.length,
            z: line.z,
        };
        layers3d.push(layer);
    };

    getLineGroup = function (line, args) {
        console.log("getLineGroup:", line);
        if (layer == undefined) newLayer(line);
        var speed = Math.round(line.e / 1000);
        var opacity = line.s;
        var tool = parseInt(line.t, 10);
        // /console.log('Speed: ' , speed , '  opacity: ', opacity);
        var grouptype = speed + opacity;
        var color = null;
        //var color = new THREE.Color(0x990000);

        if(typeof line.s === 'undefined'){
            opacity = 0.3;
        } else {
            var lasermultiply = $("#lasermultiply").val() || 100;
            opacity = line.s / lasermultiply;
            console.log(opacity+', '+line.x);
            // }
        }
        //console.log(opacity);
        // LaserWeb 3D Viewer Colors
        // LaserWeb 3D Viewer Colors
        if(typeof line.extruding === 'undefined' && typeof line.s === 'undefined'){
            //console.log('G1 without extrude', line);
 	    grouptype =  "g0";
	    opacity = 0.3;
	    color = new THREE.Color(0x00ff00);
        } else {
            //console.log('G1 with extrude', line);
            if (line.g0) {
                grouptype =  "g0";
                //color = new THREE.Color(0x00ff00);
                opacity = 0.3;
                color = new THREE.Color(0x00ff00);
            } else if (line.g2) {
                grouptype = "g2";
                //color = new THREE.Color(0x999900);
                color = new THREE.Color(0x990000);
            } else if (line.t == 0) {
                grouptype = "t0";
                //color = new THREE.Color(0x999900);
                color = new THREE.Color(0x0000ff);
            } else if (line.t == 1) {
                grouptype = "t1";
                //color = new THREE.Color(0x999900);
                color = new THREE.Color(0xff00ff);
            } else if (line.arc) {
                grouptype = "arc";
                color = new THREE.Color(0x990000);
            } else {
                color = new THREE.Color(0x990000);
            }
        }

        // see if we have reached indxMax, if so draw, but
        // make it ghosted
        //if (args.indx > indxMax) {
        //    grouptype = "ghost";
        //    //console.log("args.indx > indxMax", args, indxMax);
        //    color = new THREE.Color(0x000000);
        // }
        //if (line.color) color = new THREE.Color(line.color);
        if (layer.type[grouptype] == undefined) {
            layer.type[grouptype] = {
                type: grouptype,
                feed: line.e,
                extruding: line.extruding,
                color: color,
                segmentCount: 0,
                material: new THREE.LineBasicMaterial({
                    opacity: opacity,
                    //opacity: line.extruding ? 0.5: line.g2 ? 0.2 : 0.3,
                    transparent: true,
                    linewidth: 1,
                    vertexColors: THREE.FaceColors
                }),
                geometry: new THREE.Geometry(),
            }
            //if (args.indx > indxMax) {
            //   layer.type[grouptype].material.opacity = 0.05;
            //}
        }
        return layer.type[grouptype];
    };

    drawArc = function(aX, aY, aZ, endaZ, aRadius, aStartAngle, aEndAngle, aClockwise, plane) {
        //console.log("drawArc:", aX, aY, aZ, aRadius, aStartAngle, aEndAngle, aClockwise);
        var ac = new THREE.ArcCurve(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise);
        //console.log("ac:", ac);
        var acmat = new THREE.LineBasicMaterial({
            color: 0x00aaff,
            opacity: 0.5,
            transparent: true
        });
        var acgeo = new THREE.Geometry();
        var ctr = 0;
        var z = aZ;
        ac.getPoints(20).forEach(function (v) {
            //console.log(v);
            z = (((endaZ - aZ) / 20) * ctr) + aZ;
            acgeo.vertices.push(new THREE.Vector3(v.x, v.y, z));
            ctr++;
        });
        var aco = new THREE.Line(acgeo, acmat);
        //aco.position.set(pArc.x, pArc.y, pArc.z);
        //console.log("aco:", aco);
        this.extraObjects[plane].push(aco);
        return aco;
    };

    this.drawArcFrom2PtsAndCenter = function(vp1, vp2, vpArc, args) {
        //console.log("drawArcFrom2PtsAndCenter. vp1:", vp1, "vp2:", vp2, "vpArc:", vpArc, "args:", args);

        //var radius = vp1.distanceTo(vpArc);
        //console.log("radius:", radius);

        // Find angle
        var p1deltaX = vpArc.x - vp1.x;
        var p1deltaY = vpArc.y - vp1.y;
        var p1deltaZ = vpArc.z - vp1.z;

        var p2deltaX = vpArc.x - vp2.x;
        var p2deltaY = vpArc.y - vp2.y;
        var p2deltaZ = vpArc.z - vp2.z;

        switch(args.plane){
        case "G18":
            var anglepArcp1 = Math.atan(p1deltaZ / p1deltaX);
            var anglepArcp2 = Math.atan(p2deltaZ / p2deltaX);
            break;
        case "G19":
            var anglepArcp1 = Math.atan(p1deltaZ / p1deltaY);
            var anglepArcp2 = Math.atan(p2deltaZ / p2deltaY);
            break;
        default:
            var anglepArcp1 = Math.atan(p1deltaY / p1deltaX);
            var anglepArcp2 = Math.atan(p2deltaY / p2deltaX);
        }

        // Draw arc from arc center
        var radius = vpArc.distanceTo(vp1);
        var radius2 = vpArc.distanceTo(vp2);
        //console.log("radius:", radius);

        if (Number((radius).toFixed(2)) != Number((radius2).toFixed(2))) console.log("Radiuses not equal. r1:", radius, ", r2:", radius2, " with args:", args, " rounded vals r1:", Number((radius).toFixed(2)), ", r2:", Number((radius2).toFixed(2)));

        // arccurve
        var clwise = true;
        if (args.clockwise === false) clwise = false;
        //if (anglepArcp1 < 0) clockwise = false;

        switch(args.plane){
        case "G19":
            if (p1deltaY >= 0) anglepArcp1 += Math.PI;
            if (p2deltaY >= 0) anglepArcp2 += Math.PI;
            break;
        default:
            if (p1deltaX >= 0) anglepArcp1 += Math.PI;
            if (p2deltaX >= 0) anglepArcp2 += Math.PI;
        }

        if (anglepArcp1 === anglepArcp2 && clwise === false)
            // Draw full circle if angles are both zero,
            // start & end points are same point... I think
            switch(args.plane){
            case "G18":
                var threeObj = this.drawArc(vpArc.x, vpArc.z, (-1*vp1.y), (-1*vp2.y), radius, anglepArcp1, (anglepArcp2 + (2*Math.PI)), clwise, "G18");
                break;
            case "G19":
                var threeObj = this.drawArc(vpArc.y, vpArc.z, vp1.x, vp2.x, radius, anglepArcp1, (anglepArcp2 + (2*Math.PI)), clwise, "G19");
                break;
            default:
                var threeObj = this.drawArc(vpArc.x, vpArc.y, vp1.z, vp2.z, radius, anglepArcp1, (anglepArcp2 + (2*Math.PI)), clwise, "G17");
            }
        else
            switch(args.plane){
            case "G18":
                var threeObj = this.drawArc(vpArc.x, vpArc.z, (-1*vp1.y), (-1*vp2.y), radius, anglepArcp1, anglepArcp2, clwise, "G18");
                break;
            case "G19":
                var threeObj = this.drawArc(vpArc.y, vpArc.z, vp1.x, vp2.x, radius, anglepArcp1, anglepArcp2, clwise, "G19");
                break;
            default:
                var threeObj = this.drawArc(vpArc.x, vpArc.y, vp1.z, vp2.z, radius, anglepArcp1, anglepArcp2, clwise, "G17");
            }
        return threeObj;
    };

    addSegment = function (p1, p2, args) {
	     closeLineSegment();
        //console.log("");
        //console.log("addSegment p2:", p2);
        // add segment to array for later use
        var group = getLineGroup(p2, args);
        var geometry = group.geometry;

        group.segmentCount++;
        // see if we need to draw an arc
        if (p2.arc) {
            //console.log("");
            //console.log("drawing arc. p1:", p1, ", p2:", p2);

            //var segmentCount = 12;
            // figure out the 3 pts we are dealing with
            // the start, the end, and the center of the arc circle
            // radius is dist from p1 x/y/z to pArc x/y/z
            //if(args.clockwise === false || args.cmd === "G3"){
            //    var vp2 = new THREE.Vector3(p1.x, p1.y, p1.z);
            //    var vp1 = new THREE.Vector3(p2.x, p2.y, p2.z);
            //}
            //else {
            var vp1 = new THREE.Vector3(p1.x, p1.y, p1.z);
            var vp2 = new THREE.Vector3(p2.x, p2.y, p2.z);
            //}
            var vpArc;

            // if this is an R arc gcode command, we're given the radius, so we
            // don't have to calculate it. however we need to determine center
            // of arc
            if (args.r != null) {
                //console.log("looks like we have an arc with R specified. args:", args);
                //console.log("anglepArcp1:", anglepArcp1, "anglepArcp2:", anglepArcp2);

                radius = parseFloat(args.r);

                // First, find the distance between points 1 and 2.  We'll call that q,
                // and it's given by sqrt((x2-x1)^2 + (y2-y1)^2).
                var q = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2));

                // Second, find the point halfway between your two points.  We'll call it
                // (x3, y3).  x3 = (x1+x2)/2  and  y3 = (y1+y2)/2.
                var x3 = (p1.x + p2.x) / 2;
                var y3 = (p1.y + p2.y) / 2;
                var z3 = (p1.z + p2.z) / 2;

                // There will be two circle centers as a result of this, so
                // we will have to pick the correct one. In gcode we can get
                // a + or - val on the R to indicate which circle to pick
                // One answer will be:
                // x = x3 + sqrt(r^2-(q/2)^2)*(y1-y2)/q
                // y = y3 + sqrt(r^2-(q/2)^2)*(x2-x1)/q
                // The other will be:
                // x = x3 - sqrt(r^2-(q/2)^2)*(y1-y2)/q
                // y = y3 - sqrt(r^2-(q/2)^2)*(x2-x1)/q
                var pArc_1 = undefined;
                var pArc_2 = undefined;
                var calc = Math.sqrt((radius * radius) - Math.pow(q / 2, 2));
                var angle_point = undefined;

                switch(args.plane){
                case "G18":
                    pArc_1 = {
                        x: x3 + calc * (p1.z - p2.z) / q,
                        y: y3 + calc * (p2.y - p1.y) / q,
                        z: z3 + calc * (p2.x - p1.x) / q };
                    pArc_2 = {
                        x: x3 - calc * (p1.z - p2.z) / q,
                        y: y3 - calc * (p2.y - p1.y) / q,
                        z: z3 - calc * (p2.x - p1.x) / q };
                    angle_point = Math.atan2(p1.z, p1.x) - Math.atan2(p2.z, p2.x);
                    if(((p1.x-pArc_1.x)*(p1.z+pArc_1.z))+((pArc_1.x-p2.x)*(pArc_1.z+p2.z)) >=
                       ((p1.x-pArc_2.x)*(p1.z+pArc_2.z))+((pArc_2.x-p2.x)*(pArc_2.z+p2.z))){
                        var cw = pArc_1;
                        var ccw = pArc_2;
                    }
                    else{
                        var cw = pArc_2;
                        var ccw = pArc_1;
                    }
                    break;
                case "G19":
                    pArc_1 = {
                        x: x3 + calc * (p1.x - p2.x) / q,
                        y: y3 + calc * (p1.z - p2.z) / q,
                        z: z3 + calc * (p2.y - p1.y) / q };
                    pArc_2 = {
                        x: x3 - calc * (p1.x - p2.x) / q,
                        y: y3 - calc * (p1.z - p2.z) / q,
                        z: z3 - calc * (p2.y - p1.y) / q };

                    if(((p1.y-pArc_1.y)*(p1.z+pArc_1.z))+((pArc_1.y-p2.y)*(pArc_1.z+p2.z)) >=
                       ((p1.y-pArc_2.y)*(p1.z+pArc_2.z))+((pArc_2.y-p2.y)*(pArc_2.z+p2.z))){
                        var cw = pArc_1;
                        var ccw = pArc_2;
                    }
                    else{
                        var cw = pArc_2;
                        var ccw = pArc_1;
                    }
                    break;
                default:
                    pArc_1 = {
                        x: x3 + calc * (p1.y - p2.y) / q,
                        y: y3 + calc * (p2.x - p1.x) / q,
                        z: z3 + calc * (p2.z - p1.z) / q };
                    pArc_2 = {
                        x: x3 - calc * (p1.y - p2.y) / q,
                        y: y3 - calc * (p2.x - p1.x) / q,
                        z: z3 - calc * (p2.z - p1.z) / q };
                    if(((p1.x-pArc_1.x)*(p1.y+pArc_1.y))+((pArc_1.x-p2.x)*(pArc_1.y+p2.y)) >=
                       ((p1.x-pArc_2.x)*(p1.y+pArc_2.y))+((pArc_2.x-p2.x)*(pArc_2.y+p2.y))){
                        var cw = pArc_1;
                        var ccw = pArc_2;
                    }
                    else{
                        var cw = pArc_2;
                        var ccw = pArc_1;
                    }
                }

                if((p2.clockwise === true && radius >= 0) || (p2.clockwise === false && radius < 0)) vpArc = new THREE.Vector3(cw.x, cw.y, cw.z);
                else vpArc = new THREE.Vector3(ccw.x, ccw.y, ccw.z);

            } else {
                // this code deals with IJK gcode commands
                /*if(args.clockwise === false || args.cmd === "G3")
                  var pArc = {
                  x: p2.arci ? p1.x + p2.arci : p1.x,
                  y: p2.arcj ? p1.y + p2.arcj : p1.y,
                  z: p2.arck ? p1.z + p2.arck : p1.z,
		  ¨              };
                  else*/
                var pArc = {
                    x: p2.arci ? p1.x + p2.arci : p1.x,
                    y: p2.arcj ? p1.y + p2.arcj : p1.y,
                    z: p2.arck ? p1.z + p2.arck : p1.z,
                };
                //console.log("new pArc:", pArc);
                vpArc = new THREE.Vector3(pArc.x, pArc.y, pArc.z);
                //console.log("vpArc:", vpArc);
            }

            var threeObjArc = this.drawArcFrom2PtsAndCenter(vp1, vp2, vpArc, args);

            // still push the normal p1/p2 point for debug
            p2.g2 = true;
            p2.threeObjArc = threeObjArc;
            group = this.getLineGroup(p2, args);
            // these golden lines showing start/end of a g2 or g3 arc were confusing people
            // so hiding them for now. jlauer 8/15/15
            /*
              geometry = group.geometry;
              geometry.vertices.push(
              new THREE.Vector3(p1.x, p1.y, p1.z));
              geometry.vertices.push(
              new THREE.Vector3(p2.x, p2.y, p2.z));
              geometry.colors.push(group.color);
              geometry.colors.push(group.color);
            */
        } else {
            geometry.vertices.push(
                new THREE.Vector3(p1.x, p1.y, p1.z));
            geometry.vertices.push(
                new THREE.Vector3(p2.x, p2.y, p2.z));
            geometry.colors.push(group.color);
            geometry.colors.push(group.color);
        }

        if (p2.extruding) {
            bbbox.min.x = Math.min(bbbox.min.x, p2.x);
            bbbox.min.y = Math.min(bbbox.min.y, p2.y);
            bbbox.min.z = Math.min(bbbox.min.z, p2.z);
            bbbox.max.x = Math.max(bbbox.max.x, p2.x);
            bbbox.max.y = Math.max(bbbox.max.y, p2.y);
            bbbox.max.z = Math.max(bbbox.max.z, p2.z);
        }
        if (p2.g0) {
            // we're in a toolhead move, label moves
            /*
              if (group.segmentCount < 2) {
              makeSprite(scene, "webgl", {
              x: p2.x,
              y: p2.y,
              z: p2.z + 0,
              text: group.segmentCount,
              color: "#ff00ff",
              size: 3,
              });
              }
            */
        }
        // global bounding box calc
        bbbox2.min.x = Math.min(bbbox2.min.x, p2.x);
        bbbox2.min.y = Math.min(bbbox2.min.y, p2.y);
        bbbox2.min.z = Math.min(bbbox2.min.z, p2.z);
        bbbox2.max.x = Math.max(bbbox2.max.x, p2.x);
        bbbox2.max.y = Math.max(bbbox2.max.y, p2.y);
        bbbox2.max.z = Math.max(bbbox2.max.z, p2.z);

        // NEW METHOD OF CREATING THREE.JS OBJECTS
        // create new approach for three.js objects which is
        // a unique object for each line of gcode, including g2/g3's
        // make sure userData is good too
        var gcodeObj;

        if (p2.arc) {
            // use the arc that already got built
            gcodeObj = p2.threeObjArc;
        } else {
            // make a line
            var color = 0X0000ff;

            if (p2.extruding) {
                color = 0xff00ff;
            } else if (p2.g0) {
                color = 0x00ff00;
            } else if (p2.g2) {
                //color = 0x999900;
            } else if (p2.arc) {
                color = 0x0033ff;
            }

            var material = new THREE.LineBasicMaterial({
                color: color,
                opacity: 0.5,
                transparent: true
            });

            //var geometry = new THREE.Geometry();
            //geometry.vertices.push(
            //new THREE.Vector3( p1.x, p1.y, p1.z ),
            //ew THREE.Vector3( p2.x, p2.y, p2.z )
            //);

	    var line = new THREE.Line( geometry, material );
	    gcodeObj = line;
	}
	gcodeObj.userData.p2 = p2;
	gcodeObj.userData.args = args;
	new3dObj.add(gcodeObj);

	// DISTANCE CALC
	// add distance so we can calc estimated time to run
	// see if arc
	var dist = 0;
	if (p2.arc) {
	    // calc dist of all lines
	    //console.log("this is an arc to calc dist for. p2.threeObjArc:", p2.threeObjArc, "p2:", p2);
	    var arcGeo = p2.threeObjArc.geometry;
	    //console.log("arcGeo:", arcGeo);

	    var tad2 = 0;
	    for (var arcLineCtr = 0; arcLineCtr < arcGeo.vertices.length - 1; arcLineCtr++) {
		tad2 += arcGeo.vertices[arcLineCtr].distanceTo(arcGeo.vertices[arcLineCtr+1]);
	    }
	    //console.log("tad2:", tad2);


	    // just do straight line calc
	    var a = new THREE.Vector3( p1.x, p1.y, p1.z );
	    var b = new THREE.Vector3( p2.x, p2.y, p2.z );
	    var straightDist = a.distanceTo(b);

	    //console.log("diff of straight line calc vs arc sum. straightDist:", straightDist);

	    dist = tad2;

	} else {
	    // just do straight line calc
	    var a = new THREE.Vector3( p1.x, p1.y, p1.z );
	    var b = new THREE.Vector3( p2.x, p2.y, p2.z );
	    dist = a.distanceTo(b);
	}

	if (dist > 0) {
	    totalDist += dist;
	}

	// time to execute this move
	// if this move is 10mm and we are moving at 100mm/min then
	// this move will take 10/100 = 0.1 minutes or 6 seconds
	var timeMinutes = 0;
	if (dist > 0) {
	    var fr;
	    if (args.feedrate > 0) {
		fr = args.feedrate
	    } else {
		fr = 100;
	    }
	    timeMinutes = dist / fr;

	    // adjust for acceleration, meaning estimate
	    // this will run longer than estimated from the math
	    // above because we don't start moving at full feedrate
	    // obviously, we have to slowly accelerate in and out
	    timeMinutes = timeMinutes * 1.32;
	}

	// Handle Laser Sxxx parameter
	sv = args.s;
	//console.log(sv);

	totalTime += timeMinutes;

	p2.feedrate = args.feedrate;
	p2.dist = dist;
	p2.distSum = totalDist;
	p2.timeMins = timeMinutes;
	p2.timeMinsSum = totalTime;

	//console.log('Total Time'+totalTime);
	totaltimemax += (timeMinutes * 60);
	//console.log("calculating distance. dist:", dist, "totalDist:", totalDist, "feedrate:", args.feedrate, "timeMinsToExecute:", timeMinutes, "totalTime:", totalTime, "p1:", p1, "p2:", p2, "args:", args);
    }


    var bufSize=10000; // Arbitrary - play around with!
    var lineObject = {active:    false,
		      vertexBuf: new Float32Array(6*bufSize), // Start with bufSize line segments
		      colorBuf:  new Float32Array(6*bufSize), // Start with bufSize line segments
		      nLines:    0,
		     };
    var material = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors,
						opacity:      0.8,
						transparent:  true,
						linewidth:    1,
					       });
    addLineSegment = function (p1, p2) {

	var i = lineObject.nLines*6;
        // lineObject.vertexBuf[i+0] = p1.x;  // Vertices
        // lineObject.vertexBuf[i+1] = p1.y;
        // lineObject.vertexBuf[i+2] = p1.z;
        // lineObject.vertexBuf[i+3] = p2.x;
        // lineObject.vertexBuf[i+4] = p2.y;
        // lineObject.vertexBuf[i+5] = p2.z;

        if (p1.a != 0 || p2.a != 0) { // A axis: rotate around X
          var R1 = Math.sqrt(p1.y*p1.y+p1.z*p1.z);
          var R2 = Math.sqrt(p2.y*p2.y+p2.z*p2.z);
          var a1 = p1.y == 0 ? Math.sign(p1.z)*90 : Math.atan2(p1.z, p1.y)*180.0/Math.PI;
          var a2 = p2.y == 0 ? Math.sign(p2.z)*90 : Math.atan2(p2.z, p2.y)*180.0/Math.PI;
          lineObject.vertexBuf[i+0] = p1.x;
          lineObject.vertexBuf[i+1] = R1*Math.cos((-p1.a+a1)*Math.PI/180.0);
          lineObject.vertexBuf[i+2] = R1*Math.sin((-p1.a+a1)*Math.PI/180.0);
          lineObject.vertexBuf[i+3] = p2.x;
          lineObject.vertexBuf[i+4] = R2*Math.cos((-p2.a+a2)*Math.PI/180.0);
          lineObject.vertexBuf[i+5] = R2*Math.sin((-p2.a+a2)*Math.PI/180.0);
        } else {
          //  Vertice code for A Axis as submitted by HakanBasted - commented out by PvdW else normal gcode only renders in a single Y line.
          // lineObject.vertexBuf[i+0] = p1.x;  // Vertices
          // lineObject.vertexBuf[i+1] = 0.1*p1.a;
          // lineObject.vertexBuf[i+2] = p1.z;
          // lineObject.vertexBuf[i+3] = p2.x;
          // lineObject.vertexBuf[i+4] = 0.1*p2.a;
          // lineObject.vertexBuf[i+5] = p2.z;

          lineObject.vertexBuf[i+0] = p1.x;  // Vertices
          lineObject.vertexBuf[i+1] = p1.y;
          lineObject.vertexBuf[i+2] = p1.z;
          lineObject.vertexBuf[i+3] = p2.x;
          lineObject.vertexBuf[i+4] = p2.y;
          lineObject.vertexBuf[i+5] = p2.z;

        }
        // console.log("Segment " + p1);

	var dist = Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y)+(p1.z-p2.z)*(p1.z-p2.z));
	totalDist += dist;
	timeMinutes = dist / p2.f;
	totalTime += timeMinutes;
	totaltimemax = totalTime * 60;

	var col;
	var intensity;
  var lasermultiply = $("#lasermultiply").val() || 100;
	if (p2.g0) {          // g0
	    col = {r: 0, g:1, b:0};
	    intensity = 1.0-p2.s/lasermultiply; // lasermultiply
	} else if (p2.g1) {   // g1
	    col = {r: 0.7, g:0, b:0};
	    intensity = 1.0-p2.s/lasermultiply; // lasermultiply
	} else if (p2.g7) {   // g7
	    col = {r: 0, g:0, b:1};
	    intensity = 1.0-p2.s/lasermultiply; // lasermultiply
	} else {
	    col = {r: 0, g:1, b:1};
	    intensity = 1.0-p2.s/lasermultiply; // lasermultiply
	}

        lineObject.colorBuf[i+0] = col.r + (1-col.r)*intensity;        // Colors
        lineObject.colorBuf[i+1] = col.g + (1-col.g)*intensity;
        lineObject.colorBuf[i+2] = col.b + (1-col.b)*intensity;
        lineObject.colorBuf[i+3] = col.r + (1-col.r)*intensity;
        lineObject.colorBuf[i+4] = col.g + (1-col.g)*intensity;
        lineObject.colorBuf[i+5] = col.b + (1-col.b)*intensity;

	lineObject.nLines++;

	if (lineObject.nLines == bufSize)
	    closeLineSegment();
    };

    closeLineSegment = function () {
	if (lineObject.nLines == 0)
	    return;

	var vertices = new Float32Array(6*lineObject.nLines);
	var colors   = new Float32Array(6*lineObject.nLines);
	vertices.set(lineObject.vertexBuf.subarray(0,lineObject.nLines*6));
	colors.set(lineObject.colorBuf.subarray(0,lineObject.nLines*6));

	var geometry = new THREE.BufferGeometry();

	geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3 ) );
	geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3 ) );

	var lines = new THREE.Line(geometry, material);
	lineObjects.add(lines); // Feed the objects to "object" in doChunk()

	lineObject.nLines = 0;
    };

    totalDist = 0;
    totalTime = 0;

    var relative = false;
    var tool = null;

    delta = function (v1, v2) {
	return relative ? v2 : v2 - v1;
    }

    absolute = function (v1, v2) {
	return relative ? v1 + v2 : v2;
    }

    addFakeSegment = function(args) {
	closeLineSegment();
	//line.args = args;
	var arg2 = {
            isFake : true,
            text : args.text,
            indx : args.indx
	};
	if (arg2.text.match(/^(;|\(|<)/)) arg2.isComment = true;
	lines.push({
            p2: lastLine,    // since this is fake, just use lastLine as xyz
            'args': arg2
	});
    }

    var cofg = this;

    parser = new GCodeParser({
	//set the g92 offsets for the parser - defaults to no offset
	// When doing CNC, generally G0 just moves to a new location
	// as fast as possible which means no milling or extruding is happening in G0.
	// So, let's color it uniquely to indicate it's just a toolhead move.
	G0: function (args, indx) {
            var newLine = {
		x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
		y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
		z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
    a: args.a !== undefined ? cofg.absolute(lastLine.a, args.a) + cofg.offsetG92.a : lastLine.a,
		e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
		f: args.f !== undefined ? args.f : lastLine.f,
		s: 100,
            };
            newLine.g0 = true;
            cofg.addLineSegment(lastLine, newLine);
            lastLine = newLine;
	},
	G1: function (args, indx) {
            // Example: G1 Z1.0 F3000
            //          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
            //          G1 E104.25841 F1800.0
            // Go in a straight line from the current (X, Y) point
            // to the point (90.6, 13.8), extruding material as the move
            // happens from the current extruded length to a length of
            // 22.4 mm.

            var newLine = {
		x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
		y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
		z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
    a: args.a !== undefined ? cofg.absolute(lastLine.a, args.a) + cofg.offsetG92.a : lastLine.a,
		e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
		f: args.f !== undefined ? args.f : lastLine.f,
		s: args.s !== undefined ? args.s : lastLine.s,
		t: args.t !== undefined ? args.t : lastLine.t,
            };
            /* layer change detection is or made by watching Z, it's made by
               watching when we extrude at a new Z position */
            if (cofg.delta(lastLine.e, newLine.e) > 0) {
		newLine.extruding = cofg.delta(lastLine.e, newLine.e) > 0;
		if (layer == undefined || newLine.z != layer.z) cofg.newLayer(newLine);
            }
            newLine.g1 = true;
            cofg.addLineSegment(lastLine, newLine);
            lastLine = newLine;
	},
	G2 : function (args, indx, gcp) {
            // this is an arc move from lastLine's xy to the new xy. we'll
            // show it as a light gray line, but we'll also sub-render the
            // arc itself by figuring out the sub-segments

            args.plane = plane; //set the plane for this command to whatever the current plane is

            var newLine = {
		x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
		y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
		z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
    a: args.a !== undefined ? cofg.absolute(lastLine.a, args.a) + cofg.offsetG92.a : lastLine.a,
		e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
		f: args.f !== undefined ? args.f : lastLine.f,
		s: args.s !== undefined ? args.s : lastLine.s,
		t: args.t !== undefined ? args.t : lastLine.t,
		arci: args.i ? args.i : null,
		arcj: args.j ? args.j : null,
		arck: args.k ? args.k : null,
		arcr: args.r ? args.r : null,
            };
            newLine.arc = true;
            newLine.clockwise = true;
            if (args.clockwise === false) newLine.clockwise = args.clockwise;
            cofg.addSegment(lastLine, newLine, args);
            lastLine = newLine;
	},
	G3: function (args, indx, gcp) {
            // this is an arc move from lastLine's xy to the new xy. same
            // as G2 but reverse
            args.arc = true;
            args.clockwise = false;
            args.plane = plane; //set the plane for this command to whatever the current plane is

            var newLine = {
		x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
		y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
		z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
    a: args.a !== undefined ? cofg.absolute(lastLine.a, args.a) + cofg.offsetG92.a : lastLine.a,
		e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
		f: args.f !== undefined ? args.f : lastLine.f,
		s: args.s !== undefined ? args.s : lastLine.s,
		t: args.t !== undefined ? args.t : lastLine.t,
		arci: args.i ? args.i : null,
		arcj: args.j ? args.j : null,
		arck: args.k ? args.k : null,
		arcr: args.r ? args.r : null,
            };
            newLine.arc = true;
            newLine.clockwise = true;
            if (args.clockwise === false) newLine.clockwise = args.clockwise;
            cofg.addSegment(lastLine, newLine, args);
            lastLine = newLine;
	},

	dirG7: 0,

	G7: function (args, indx) {
	    // Example: G7 L68 D//////sljasflsfagdxsd,.df9078rhfnxm (68 of em)
	    //          G7 $1 L4 DAAA=
	    //          G7 $0 L4 D2312
	    // Move right (if $1) or left (if $0) 51 steps (from L68)
	    // (the number of steps is found when decoding the data)
	    // and burn the laser with the intensity in the base64-encoded
	    // data in D. Data in D is 51 base64-encoded bytes with grayscale
	    // intensity. When base64-encoded the string becomes 68 bytes long.
	    //
	    // SpotSize comes from a previous M649 S100 R0.1
	    // where S is intensity (100 is max) and R gives spotsize in mm.
	    // Actual laser power is then D-value * S-value in every pixel
	    // A direction change with $0/$1 gives a spotSize long movement in Y
	    // for the next row.

	    var buf = atob(args.d);

	    if (typeof args.dollar !== "undefined") { // Move Y, change direction
		this. dirG7 = args.dollar;
		var newLine = {
		    x: lastLine.x,
		    y: lastLine.y + cofg.spotSizeG7,
		    z: lastLine.z,
        a: lastLine.a,
		    e: lastLine.e,
		    f: lastLine.f,
		    s: 100,
		    t: lastLine.t,
		};
		newLine.g0 = true;
		cofg.addLineSegment(lastLine, newLine);
		lastLine = newLine;
	    }
	    for (var i=0; i < buf.length; i++) { // Process a base64-encoded chunk
		var intensity = 255-buf.charCodeAt(i); // 255 - 0
		var newLine = {
		    x: lastLine.x + cofg.spotSizeG7*(this.dirG7 == 1 ? 1 : -1),
		    y: lastLine.y,
		    z: lastLine.z,
        a: lastLine.a,
		    e: lastLine.e,
		    f: lastLine.f,
		    s: intensity,
		    t: lastLine.t,
		};
		newLine.g7 = true;
		cofg.addLineSegment(lastLine, newLine);
		lastLine = newLine;
	    }
	},

	G17: function (args){
            console.log("SETTING XY PLANE");
            plane = "G17";
            cofg.addFakeSegment(args);
	},

	G18: function (args){
            console.log("SETTING XZ PLANE");
            plane = "G18";
            cofg.addFakeSegment(args);
	},

	G19: function (args){
            console.log("SETTING YZ PLANE");
            plane = "G19";
            cofg.addFakeSegment(args);
	},

	G20: function (args) {
            // G21: Set Units to Inches
            // We don't really have to do anything since 3d viewer is unit agnostic
            // However, we need to set a global property so the trinket decorations
            // like toolhead, axes, grid, and extent labels are scaled correctly
            // later on when they are drawn after the gcode is rendered
            //console.log("SETTING UNITS TO INCHES!!!");
            cofg.isUnitsMm = false; // false means inches cuz default is mm
            cofg.addFakeSegment(args);

	},

	G21: function (args) {
            // G21: Set Units to Millimeters
            // Example: G21
            // Units from now on are in millimeters. (This is the RepRap default.)
            //console.log("SETTING UNITS TO MM!!!");
            cofg.isUnitsMm = true; // true means mm
            cofg.addFakeSegment(args);

	},

	G73: function(args, indx, gcp) {
            // peck drilling. just treat as g1
            console.log("G73 gcp:", gcp);
            gcp.handlers.G1(args);
	},
	G90: function (args) {
            // G90: Set to Absolute Positioning
            // Example: G90
            // All coordinates from now on are absolute relative to the
            // origin of the machine. (This is the RepRap default.)

            relative = false;
            cofg.addFakeSegment(args);
	},

	G91: function (args) {
            // G91: Set to Relative Positioning
            // Example: G91
            // All coordinates from now on are relative to the last position.

            // TODO!
            relative = true;
            cofg.addFakeSegment(args);
	},

	G92: function (args) { // E0
            // G92: Set Position
            // Example: G92 E0
            // Allows programming of absolute zero point, by reseting the
            // current position to the values specified. This would set the
            // machine's X coordinate to 10, and the extrude coordinate to 90.
            // No physical motion will occur.

            // TODO: Only support E0
            var newLine = lastLine;

            cofg.offsetG92.x = (args.x !== undefined ? (args.x === 0 ? newLine.x : newLine.x - args.x) : 0);
            cofg.offsetG92.y = (args.y !== undefined ? (args.y === 0 ? newLine.y : newLine.y - args.y) : 0);
            cofg.offsetG92.z = (args.z !== undefined ? (args.z === 0 ? newLine.z : newLine.z - args.z) : 0);
            cofg.offsetG92.a = (args.a !== undefined ? (args.a === 0 ? newLine.a : newLine.a - args.a) : 0);
            cofg.offsetG92.e = (args.e !== undefined ? (args.e === 0 ? newLine.e : newLine.e - args.e) : 0);

            //newLine.x = args.x !== undefined ? args.x + newLine.x : newLine.x;
            //newLine.y = args.y !== undefined ? args.y + newLine.y : newLine.y;
            //newLine.z = args.z !== undefined ? args.z + newLine.z : newLine.z;
            //newLine.e = args.e !== undefined ? args.e + newLine.e : newLine.e;

            //console.log("G92", lastLine, newLine, args, cofg.offsetG92);

            //lastLine = newLine;
            cofg.addFakeSegment(args);
	},
	M30: function (args) {
            cofg.addFakeSegment(args);
	},
	M82: function (args) {
            // M82: Set E codes absolute (default)
            // Descriped in Sprintrun source code.

            // No-op, so long as M83 is not supported.
            cofg.addFakeSegment(args);
	},

	M84: function (args) {
            // M84: Stop idle hold
            // Example: M84
            // Stop the idle hold on all axis and extruder. In some cases the
            // idle hold causes annoying noises, which can be stopped by
            // disabling the hold. Be aware that by disabling idle hold during
            // printing, you will get quality issues. This is recommended only
            // in between or after printjobs.

            // No-op
            cofg.addFakeSegment(args);
	},

	M649: function (args) {
            // M649: Laser options for Marlin
	    //  M649 S<Intensity> R<Spotsize> B2
	    // Intensity = lasermultiply?
	    if (typeof args.r !== "undefined") { cofg.spotSizeG7 = args.r;}

	},

	// Dual Head 3D Printing Support
	T0: function (args) {
            //console.log('Found Tool: ', args);
            lastLine.t = 0;
            cofg.addFakeSegment(args);
	},

	T1: function (args) {
            //console.log('Found Tool: ', args);
            lastLine.t = 1;
            cofg.addFakeSegment(args);
	},

	'default': function (args, info) {
            //if (!args.isComment)
            //    console.log('Unknown command:', args.cmd, args, info);
            cofg.addFakeSegment(args);
	},
    });
    // console.log("Just before parser.parse: "+ gcode)
    parser.parse(gcode);
};

function drawobject() {

    var newObject = false;
  // console.log("INSIDE DRAWOBJECT");
    // set what units we're using in the gcode
    isUnitsMm = parser.isUnitsMm;

    newObject = new THREE.Object3D();
    newObject.name = 'newObject'

    // old approach of monolithic line segment
    for (var lid in layers3d) {
      // console.log('processing Layer ' + lid)
        var layer = layers3d[lid];
        for (var tid in layer.type) {
            var type = layer.type[tid];
            var bufferGeo = convertLineGeometryToBufferGeometry( type.geometry, type.color );
	          newObject.add(new THREE.Line(bufferGeo, type.material, THREE.LinePieces));
        }
    }
    newObject.add(new THREE.Object3D());
    //XY PLANE
    extraObjects["G17"].forEach(function(obj) {

        var bufferGeo = convertLineGeometryToBufferGeometry( obj.geometry, obj.material.color );
        newObject.add(new THREE.Line(bufferGeo, obj.material));
    }, this);
    //XZ PLANE
    extraObjects["G18"].forEach(function(obj) {
        // buffered approach
        var bufferGeo = convertLineGeometryToBufferGeometry( obj.geometry, obj.material.color );
        var tmp = new THREE.Line(bufferGeo, obj.material)
        tmp.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI/2);
        newObject.add(tmp);
    }, this);
    //YZ PLANE
    extraObjects["G19"].forEach(function(obj) {
        // buffered approach
        var bufferGeo = convertLineGeometryToBufferGeometry( obj.geometry, obj.material.color );
        var tmp = new THREE.Line(bufferGeo, obj.material)
        tmp.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI/2);
        tmp.rotateOnAxis(new THREE.Vector3(0,1,0),Math.PI/2);
        newObject.add(tmp);
    }, this);

    // use new approach of building 3d object where each
    // gcode line is its own segment with its own userData
    //object = new3dObj;

    // Center
    var scale = 1; // TODO: Auto size

    var center = new THREE.Vector3(
        bbbox.min.x + ((bbbox.max.x - bbbox.min.x) / 2),
        bbbox.min.y + ((bbbox.max.y - bbbox.min.y) / 2),
        bbbox.min.z + ((bbbox.max.z - bbbox.min.z) / 2));

    var center2 = new THREE.Vector3(
        bbbox2.min.x + ((bbbox2.max.x - bbbox2.min.x) / 2),
        bbbox2.min.y + ((bbbox2.max.y - bbbox2.min.y) / 2),
        bbbox2.min.z + ((bbbox2.max.z - bbbox2.min.z) / 2));

    var dX = bbbox2.max.x-bbbox2.min.x;
    var dY = bbbox2.max.y-bbbox2.min.y;
    var dZ = bbbox2.max.z-bbbox2.min.z;

    function toTimeString(seconds) {
        // return (new Date(seconds * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
    }

    console.log(totaltimemax +'  seconds estimated');

    // printLog('Estimated Job Time: '+totaltimemax, successcolor)

    printLog('Estimated Distance: <b>' + (totalDist/1000).toFixed(1) + ' m</b>', msgcolor, "viewer");
    $("#lasertimeqty").val((totalDist.toFixed(1)) / 10)

    if (fileParentGroup) {
       var bbox2 = new THREE.Box3().setFromObject(fileParentGroup);
      //  console.log('bbox width: ', (bbox2.max.x - bbox2.min.x), 'height Y: ', (bbox2.max.y - bbox2.min.y) );
       width = (bbox2.max.x - bbox2.min.x);
       height = (bbox2.max.y - bbox2.min.y);
       $('#quoteresult').html('Job moves length: ' + totalDist.toFixed(1) + ' mm<br> Width: ' + width.toFixed(1) + ' mm<br>Height: ' + height.toFixed(1) + ' mm<br>Material: ' + ((width*height) / 1000).toFixed(3) + 'cm<sup>2</sup>' );
       $("#materialqty").val(((width*height) / 1000).toFixed(3));
    } else if (rastermesh) {
       var bbox2 = new THREE.Box3().setFromObject(rastermesh);
      //  console.log('bbox width: ', (bbox2.max.x - bbox2.min.x), 'height Y: ', (bbox2.max.y - bbox2.min.y) );
       width = (bbox2.max.x - bbox2.min.x);
       height = (bbox2.max.y - bbox2.min.y);
       $('#quoteresult').html('Job moves length: ' + totalDist.toFixed(1) + ' mm<br> Width: ' + width.toFixed(1) + ' mm<br>Height: ' + height.toFixed(1) + ' mm<br>Material: ' + ((width*height) / 1000).toFixed(3) + 'cm<sup>2</sup>' );
       $("#materialqty").val(((width*height) / 1000).toFixed(3));
    }

    console.groupEnd();
    return newObject;
    // console.groupEnd();

};

function convertLineGeometryToBufferGeometry(lineGeometry, color) {
    var positions = new Float32Array( lineGeometry.vertices.length * 3 );
    var colors = new Float32Array( lineGeometry.vertices.length * 3 );

    var geometry = new THREE.BufferGeometry();

    for (var i = 0; i < lineGeometry.vertices.length; i++) {
        var x = lineGeometry.vertices[i].x;
        var y = lineGeometry.vertices[i].y;
        var z = lineGeometry.vertices[i].z;

        // positions
        positions[ i * 3 ] = x;
        positions[ i * 3 + 1 ] = y;
        positions[ i * 3 + 2 ] = z;

        // colors
        colors[ i * 3 ] = color.r;
        colors[ i * 3 + 1 ] = color.g;
        colors[ i * 3 + 2 ] = color.b;
    }

    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

    geometry.computeBoundingSphere();

    return geometry;
};
