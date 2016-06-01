// NOTE:  Unused since 0 May 2016 - replaced with SVGReader

var options = {};
var shape = null;
var fileParentGroup;
var yflip = false;

drawSvg = function(file) {

    yflip = true;
    // Remove the UI elements from last run
    cleanupThree();


    // see if file is valid
    if (file.length == 0) return;

    var error = this.extractSvgPathsFromSVGFile(file);
    if (error) {
        // do nothing
        printLog("There was an error with svg file", warncolor);
    } else {
        fileObject = this.svgParentGroup;
        //this.sceneReAddMySceneGroup();
        //fileObject.translateX((laserxmax / 2) * -1);
        //fileObject.translateY((laserymax / 2) * -1);
        fileObject.name = 'fileObject';
        //scene.add(fileObject)
        fileParentGroup = new THREE.Group();
        fileParentGroup.name = "fileParentGroup";
        fileParentGroup.add(fileObject);
        //fileParentGroup.translateX((laserxmax / 2) * -1);
        //fileParentGroup.translateY((laserymax / 2) * -1);
        scene.add(fileParentGroup);

        // Empty File Prep table
        $("#layers").empty();

        viewExtents(fileParentGroup)
        $('#layers').append('<form class="form-horizontal"><label class="control-label">SVG</label><div class="input-group"><input class="form-control numpad" name=sp0 id=sp0 value=3200><span class="input-group-addon">mm/m</span></div><div class="input-group"><input class="form-control numpad" name=pwr0 id=pwr0 value=100><span class="input-group-addon">%</span></div></form>');

        //scene.add(  this.mySceneGroup)
        // get the new 3d viewer object centered on camera
        //chilipeppr.publish('/com-chilipeppr-widget-3dviewer/viewextents' );

        // make sure camera change triggers
        //setTimeout(this.onCameraChange.bind(this), 50);
        //this.onCameraChange(); //.bind(this);

        //this.generateGcode();
    }
    checkNumPad(); // Make newly added rows also numpad if configured
};
extractSvgPathsFromSVGFile = function(file) {

    var fragment = Snap.parse(file);
    console.log("fragment:", fragment);

    // make sure we get 1 group. if not there's an error
    var g = fragment.select("g");
    console.log("g:", g);
    if (g == null) {

        // before we give up if there's not one group, check
        // if there are just paths inlined
        var pathSet = fragment.selectAll("path");
        if (pathSet == null) {

            printLog('Error Parsing SVG! No Paths Found', errorcolor)
            return true;

        } else {
            console.log("No groups, but we have some paths so proceeding");
        }

    }

    var groups = fragment.selectAll("g");
    console.log("groups:", groups);

    if (groups.length > 1) {
        printLog("Too many groups in svg. Found " + groups.length + " We need a flattened svg file with only one Group", errorcolor);
        //return true;
    }


    var svgGroup = new THREE.Group();
    svgGroup.name = "svgpath";

    var that = this;

    var opts = that.options;
    console.log("opts:", opts);

    var pathSet = fragment.selectAll("path");

    console.log('Path Set: ', pathSet)

    // pathSet.forEach(function(path, i) {

    for (i = 0; i < pathSet.length; i++) {

        var path = pathSet[i];
        //if (i > 4) return;
        console.log('Doing Path: ', path)

        // handle transforms
        //var path = p1.transform(path.matrix);
        //
        // printLog("working on path:" + path, successcolor);
        // printLog("length:" + path.getTotalLength(), successcolor);
        // printLog("path.parent:" + path.parent(), successcolor);

        // if the parent path is a clipPath, then toss it
        if (path.parent().type.match(/clippath/i)) {
            printLog("found a clippath. skipping. path:" + path, errorcolor);
            return;
        }

        // use Snap.svg to translate path to a global set of coordinates
        // so the xy values we get are in global values, not local
        // see if there is a parent transform

        if (path.parent().type == "g" || path.parent().type == "M" ) {
            console.log("there is a parent. see if transform. path.parent().transform()", path);
            path = path.transform(path.parent().transform().global);
            path = path.transform(path.transform().global);
        } else {
          path = path.transform(path.transform().global);
          console.log("Transformed Path: ", path)
        }


        var material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });


        // use transformSVGPath
        //printLog("Transform working on path: " + path, successcolor);
        //debugger;
        var paths = that.transformSVGPath(path.realPath);
        console.log("Path after transformSVGPath", paths)
            // var paths = that.transformSVGPath(path.attr('d'));
            //for (var pathindex in paths) {
            //printLog('Number of Paths ' + paths.length, successcolor)
        for (pathindex = 0; pathindex < paths.length; pathindex++) {
            console.log('Path Index: ', pathindex, '/', paths.length);

            var shape = paths[pathindex];

            shape.autoClose = true;
            console.log("shape: Number", pathindex, "Value: ", shape);
0
            // solid line
            if (shape.curves.length != 0) {
                //printLog('Generating Shape' + shape, successcolor)
                var geometry = new THREE.ShapeGeometry(shape);
                var lineSvg = new THREE.Line(geometry, material);
                svgGroup.add(lineSvg);
            } else {
                printLog('Skipped path: ' + shape, errorcolor)
            }

            // var particles = new THREE.Points( geometry, new THREE.PointsMaterial( {
            //     color: 0xff0000,
            //     size: 1,
            //     opacity: 0.5,
            //     transparent: true
            // } ) );
            //   //particles.position.z = 1;
            //   //svgGroup.add(particles);



        }
      };


    // since svg has top left as 0,0 we need to flip
    // the whole thing on the x axis to get 0,0
    // on the lower left like gcode uses
    svgGroup.scale.y = -1;
    // svgGroup.scale.x = 0.2;
    // svgGroup.scale.z = 0.2;

    // shift whole thing so it sits at 0,0

    var bbox = new THREE.Box3().setFromObject(svgGroup);

    // console.log("bbox for shift:", bbox);
    // svgGroup.translateX( - (bbox.min.x + (laserxmax / 2))  );
    // svgGroup.translateY( - (bbox.min.y + (laserymax / 2))  );
    // svgxpos = bbox.min.x;
    // svgypos = bbox.min.y;

    // now that we have an svg that we have flipped and shifted to a zero position
    // create a parent group so we can attach some point positions for width/height
    // handles for the floating textboxes and a marquee
    var svgParentGroup = new THREE.Group();
    svgParentGroup.name = "SvgParentGroup";
    svgParentGroup.add(svgGroup);


    this.svgParentGroup = svgParentGroup;
    this.svgGroup = svgGroup;

    // now create our floating menus
    //this.createFloatItems();

    return false;

};

transformSVGPath = function(pathStr) {

    // cleanup
    pathStr = pathStr.replace(/[\r\n]/g, " ");
    pathStr = pathStr.replace(/\s+/g, " ");

    // clean up scientific notation
    //pathStr = pathStr.replace(/\b([+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)\b/ig, parseFloat(RegExp.$1).toFixed(4));
    if (pathStr.match(/\b([+\-\d]+e[+\-\d]+)\b/i)) {
        console.warn("found scientific notation. $1", RegExp.$1);
        pathStr = pathStr.replace(/\b([+\-\d]+e[+\-\d]+)\b/ig, parseFloat(RegExp.$1).toFixed(4));
    }
    console.log("pathStr:", pathStr);


    const DIGIT_0 = 48,
        DIGIT_9 = 57,
        COMMA = 44,
        SPACE = 32,
        PERIOD = 46,
        MINUS = 45;

    var DEGS_TO_RADS = Math.PI / 180;

    var path = new THREE.Shape();

    // this is an array that if there is only one shape, meaning
    // the path only has one m, then we will leave this as null
    // however, if there are multiple moveto's in a path, we will
    // actually create a new path for each one and return an array
    // instead
    var paths = [];

    var idx = 1,
        len = pathStr.length,
        activeCmd,
        x = 0,
        y = 0,
        nx = 0,
        ny = 0,
        firstX = null,
        firstY = null,
        x1 = 0,
        x2 = 0,
        y1 = 0,
        y2 = 0,
        rx = 0,
        ry = 0,
        xar = 0,
        laf = 0,
        sf = 0,
        cx, cy;

    function eatNum() {
        var sidx, c, isFloat = false,
            s;
        // eat delims
        while (idx < len) {
            c = pathStr.charCodeAt(idx);
            if (c !== COMMA && c !== SPACE)
                break;
            idx++;
        }
        if (c === MINUS)
            sidx = idx++;
        else
            sidx = idx;
        // eat number
        while (idx <= len) {

            c = pathStr.charCodeAt(idx);
            if (DIGIT_0 <= c && c <= DIGIT_9) {
                idx++;
                continue;
            } else if (c === PERIOD) {
                idx++;
                isFloat = true;
                continue;
            }

            s = pathStr.substring(sidx, idx);
            return isFloat ? parseFloat(s) : parseInt(s);
        }

        s = pathStr.substring(sidx);
        return isFloat ? parseFloat(s) : parseInt(s);
    }

    function nextIsNum() {
        var c;
        // do permanently eat any delims...
        while (idx < len) {
            c = pathStr.charCodeAt(idx);
            if (c !== COMMA && c !== SPACE)
                break;
            idx++;
        }
        c = pathStr.charCodeAt(idx);
        return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
    }

    // keep track if we have already gotten an M (moveto)
    var isAlreadyHadMoveTo = false;

    var canRepeat;
    activeCmd = pathStr[0];
    while (idx <= len) {
        canRepeat = true;
        console.log("swich on activeCmd:", activeCmd);

        switch (activeCmd) {
            // moveto commands, become lineto's if repeated
            case ' ':
                console.warn("got space as activeCmd. skipping.");
                break;
            case 'M':
                x = eatNum();
                y = eatNum();
                if (isAlreadyHadMoveTo) {
                    console.warn("we had a moveto already. so creating new path.")
                    paths.push(path);
                    path = new THREE.Shape();
                    firstX = x;
                    firstY = y;
                }
                isAlreadyHadMoveTo = true; // track that we've had a moveto so next time in we create new path
                path.moveTo(x, y);
                activeCmd = 'L'; // do lineTo's after this moveTo
                break;
            case 'm':
                x += eatNum();
                y += eatNum();
                if (isAlreadyHadMoveTo) {
                    console.warn("we had a moveto already. so creating new path.")
                    paths.push(path);
                    path = new THREE.Shape();
                    firstX = x;
                    firstY = y;
                }
                isAlreadyHadMoveTo = true; // track that we've had a moveto so next time in we create new path
                path.moveTo(x, y);
                activeCmd = 'l'; // do lineTo's after this moveTo
                break;
            case 'Z':
            case 'z':
                canRepeat = false;
                if (x !== firstX || y !== firstY)
                    path.lineTo(firstX, firstY);
                break;
                // - lines!
            case 'L':
            case 'H':
            case 'V':
                nx = (activeCmd === 'V') ? x : eatNum();
                ny = (activeCmd === 'H') ? y : eatNum();
                path.lineTo(nx, ny);
                x = nx;
                y = ny;
                break;
            case 'l':
            case 'h':
            case 'v':
                nx = (activeCmd === 'v') ? x : (x + eatNum());
                ny = (activeCmd === 'h') ? y : (y + eatNum());
                path.lineTo(nx, ny);
                x = nx;
                y = ny;
                break;
                // - cubic bezier
            case 'C':
                x1 = eatNum();
                y1 = eatNum();
            case 'S':
                if (activeCmd === 'S') {
                    x1 = 2 * x - x2;
                    y1 = 2 * y - y2;
                }
                x2 = eatNum();
                y2 = eatNum();
                nx = eatNum();
                ny = eatNum();
                path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
                x = nx;
                y = ny;
                break;
            case 'c':
                x1 = x + eatNum();
                y1 = y + eatNum();
            case 's':
                if (activeCmd === 's') {
                    x1 = 2 * x - x2;
                    y1 = 2 * y - y2;
                }
                x2 = x + eatNum();
                y2 = y + eatNum();
                nx = x + eatNum();
                ny = y + eatNum();
                path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
                x = nx;
                y = ny;
                break;
                // - quadratic bezier
            case 'Q':
                x1 = eatNum();
                y1 = eatNum();
            case 'T':
                if (activeCmd === 'T') {
                    x1 = 2 * x - x1;
                    y1 = 2 * y - y1;
                }
                nx = eatNum();
                ny = eatNum();
                path.quadraticCurveTo(x1, y1, nx, ny);
                x = nx;
                y = ny;
                break;
            case 'q':
                x1 = x + eatNum();
                y1 = y + eatNum();
            case 't':
                if (activeCmd === 't') {
                    x1 = 2 * x - x1;
                    y1 = 2 * y - y1;
                }
                nx = x + eatNum();
                ny = y + eatNum();
                path.quadraticCurveTo(x1, y1, nx, ny);
                x = nx;
                y = ny;
                break;
                // - elliptical arc
            case 'a':
                // TODO make relative?
                nx = x + eatNum();
                ny = y + eatNum();
            case 'A':
                rx = eatNum();
                ry = eatNum();
                xar = eatNum() * DEGS_TO_RADS;
                laf = eatNum();
                sf = eatNum();
                if (activeCmd == 'A') nx = eatNum();
                if (activeCmd == 'A') ny = eatNum();
                if (rx !== ry) {
                    console.warn("Forcing elliptical arc to be a circular one :(",
                        rx, ry);
                }
                // SVG implementation notes does all the math for us! woo!
                // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
                // step1, using x1 as x1'
                x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
                y1 = -Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;
                // step 2, using x2 as cx'
                var norm = Math.sqrt(
                    (rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1) /
                    (rx * rx * y1 * y1 + ry * ry * x1 * x1));
                if (laf === sf)
                    norm = -norm;
                x2 = norm * rx * y1 / ry;
                y2 = norm * -ry * x1 / rx;
                // step 3
                cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
                cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;

                var u = new THREE.Vector2(1, 0),
                    v = new THREE.Vector2((x1 - x2) / rx,
                        (y1 - y2) / ry);
                var startAng = Math.acos(u.dot(v) / u.length() / v.length());
                if (u.x * v.y - u.y * v.x < 0)
                    startAng = -startAng;

                // we can reuse 'v' from start angle as our 'u' for delta angle
                u.x = (-x1 - x2) / rx;
                u.y = (-y1 - y2) / ry;

                var deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
                // This normalization ends up making our curves fail to triangulate...
                if (v.x * u.y - v.y * u.x < 0)
                    deltaAng = -deltaAng;
                if (!sf && deltaAng > 0)
                    deltaAng -= Math.PI * 2;
                if (sf && deltaAng < 0)
                    deltaAng += Math.PI * 2;

                path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
                x = nx;
                y = ny;
                break;
            default:
                throw new Error("weird path command: \"" + activeCmd + "\"");
        }
        if (firstX === null) {
            firstX = x;
            firstY = y;
        }
        // just reissue the command
        if (canRepeat && nextIsNum()) {
            console.log('we are repeating');
            continue;
        }
        activeCmd = pathStr[idx++];
    }

    // see if we need to return array of paths, or just a path
    //if (paths.length > 0) {
    // we have multiple paths we are returning
    paths.push(path);
    return paths;
    //} else {
    //return path;
    //}
};



getSettings = function() {
    // get text
    //  this.options["svg"] = $('#' + this.id + ' .input-svg').val();
    //  this.options["pointsperpath"] = parseInt($('#' + this.id + ' .input-pointsperpath').val());
    //
    //  this.options["holes"] = $('#' + this.id + ' .input-holes').is(":checked");
    //  this.options["cut"] = $('#' + this.id + ' input[name=com-chilipeppr-widget-svg2gcode-cut]:checked').val();
    //  this.options["dashPercent"] = $('#' + this.id + ' .input-dashPercent').val();
    //  this.options["mode"] = $('#' + this.id + ' input[name=com-chilipeppr-widget-svg2gcode-mode]:checked').val();
    //  this.options["laseron"] = $('#' + this.id + ' input[name=com-chilipeppr-widget-svg2gcode-laseron]:checked').val();
    //  this.options["lasersvalue"] = $('#' + this.id + ' .input-svalue').val();
    //  this.options["millclearanceheight"] = parseFloat($('#' + this.id + ' .input-clearance').val());
    //  this.options["milldepthcut"] = parseFloat($('#' + this.id + ' .input-depthcut').val());
    //  this.options["millfeedrateplunge"] = $('#' + this.id + ' .input-feedrateplunge').val();
    //  this.options["inflate"] = parseFloat($('#' + this.id + ' .input-inflate').val());
    //  this.options["feedrate"] = $('#' + this.id + ' .input-feedrate').val();
    //console.log("settings:", this.options);

    options["pointsperpath"] = 1;
    options["holes"] = 0;
    options["cut"] = 'solid';
    options["dashPercent"] = 20;
    options["mode"] = 'laser';
    options["laseron"] = 'M3';
    options["lasersvalue"] = 255;
    options["millclearanceheight"] = 5.00;
    options["milldepthcut"] = 3.00;
    options["millfeedrateplunge"] = 200.00;
    options["feedrate"] = 300;

    //this.saveOptionsLocalStorage();
};
