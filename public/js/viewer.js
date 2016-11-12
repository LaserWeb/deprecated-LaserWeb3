// Global Vars
var geometry, material, mesh;
var mouseVector, containerWidth, containerHeight;

var container, stats;

var marker;
var laserxmax;
var laserymax;

var imageDetect, video, videoImage, videoImageContext, videoTexture, useVideo, movieScreen;
var objectsInScene = []; //array that holds all objects we added to the lw.viewer.scene.

containerWidth  = window.innerWidth;
containerHeight = window.innerHeight;

function init3D() {

    // LaserWEB UI Grids
    laserxmax = lw.viewer.grid.userData.size.x;
    laserymax = lw.viewer.grid.userData.size.y;

    // Webcam Texture
    useVideo = $('#useVideo').val()
    if (useVideo) {
        if (useVideo.indexOf('Enable') == 0) {
            lw.webcam.init();
            video = document.getElementById( 'monitor' );

            videoImage = document.getElementById( 'videoImage' );
            videoImageContext = videoImage.getContext( '2d' );
            // background color if no video present
            videoImageContext.fillStyle = '#ffffff';
            videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
            videoTexture = new THREE.Texture( videoImage );
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;

            var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
            // the geometry on which the movie will be displayed;
            // 		movie image will be scaled to fit these dimensions.
            var movieGeometry = new THREE.PlaneGeometry( laserxmax, laserymax, 1, 1 );
            movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
            movieScreen.position.set(0,0,-0.2);
            movieScreen.name ="Video Overlay WebRTC"
            lw.viewer.workspace.add(movieScreen);
            videoTexture.needsUpdate = true;
        }

        if (useVideo.indexOf('Remote') == 0) {
            // initWebcam();
            imageDetect = document.createElement('img');
            imageDetect.crossOrigin = 'Anonymous';
            // imageDetect.src = $('#webcamUrl').val()
            imageDetect.src = './?url=' + $('#webcamUrl').val();
            videoTexture = new THREE.Texture( imageDetect );
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;

            var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
            // the geometry on which the movie will be displayed;
            // 		movie image will be scaled to fit these dimensions.
            var movieGeometry = new THREE.PlaneGeometry( laserxmax, laserymax, 1, 1 );
            movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
            movieScreen.position.set(0,0,-0.2);
            movieScreen.name ="Video Overlay MJPG"
            lw.viewer.workspace.add(movieScreen);
            videoTexture.needsUpdate = true;

            setInterval(function(){
                imageDetect.onload = function () {
                    videoTexture.needsUpdate = true;
                }
                imageDetect.crossOrigin = 'Anonymous';
                imageDetect.src = './?url=' + $('#webcamUrl').val();
            }, 250);

        }
    }

}

function animate() {
    if (useVideo) {
        if (useVideo.indexOf('Enable') == 0) {
            if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
                videoImageContext.drawImage( video, 0, 0, videoImage.width, videoImage.height );
                if ( videoTexture ) {
                    videoTexture.needsUpdate = true;
                }
            }
        }
    }

    requestAnimationFrame(animate);

    lw.viewer.renderer.render(lw.viewer.scene, lw.viewer.camera);
    sceneWidth = document.getElementById("renderArea").offsetWidth,
    sceneHeight = document.getElementById("renderArea").offsetHeight;
    lw.viewer.camera.aspect = sceneWidth / sceneHeight;
}

viewExtents = function(objecttosee) {
    // lets override the bounding box with a newly generated one
    // get its bounding box
    if (objecttosee) {
        var helper = new THREE.BoundingBoxHelper(objecttosee, 0xff0000);
        helper.update();
        //if (this.bboxHelper)
        //    lw.viewer.scene.remove(this.bboxHelper);
        bboxHelper = helper;

        // If you want a visible bounding box
        //lw.viewer.scene.add(this.bboxHelper);
        // console.log("helper bbox:", helper);

        var minx = helper.box.min.x;
        var miny = helper.box.min.y;
        var maxx = helper.box.max.x;
        var maxy = helper.box.max.y;
        var minz = helper.box.min.z;
        var maxz = helper.box.max.z;


        lw.viewer.viewControls.reset();

        var lenx = maxx - minx;
        var leny = maxy - miny;
        var lenz = maxz - minz;
        var centerx = minx + (lenx / 2);
        var centery = miny + (leny / 2);
        var centerz = minz + (lenz / 2);


        // console.log("lenx:", lenx, "leny:", leny, "lenz:", lenz);
        var maxlen = Math.max(lenx, leny, lenz);
        var dist = 2 * maxlen;
        // center camera on gcode objects center pos, but twice the maxlen
        lw.viewer.viewControls.object.position.x = centerx;
        lw.viewer.viewControls.object.position.y = centery;
        lw.viewer.viewControls.object.position.z = centerz + dist;
        lw.viewer.viewControls.target.x = centerx;
        lw.viewer.viewControls.target.y = centery;
        lw.viewer.viewControls.target.z = centerz;
        // console.log("maxlen:", maxlen, "dist:", dist);
        var fov = 2.2 * Math.atan(maxlen / (2 * dist)) * (180 / Math.PI);
        // console.log("new fov:", fov, " old fov:", lw.viewer.viewControls.object.fov);
        if (isNaN(fov)) {
            console.log("giving up on viewing extents because fov could not be calculated");
            return;
        } else {
            lw.viewer.viewControls.object.fov = fov;
            //lw.viewer.viewControls.object.setRotationFromEuler(THREE.Euler(0.5,0.5,0.5));
            //lw.viewer.viewControls.object.rotation.set(0.5,0.5,0.5,"XYZ");
            //lw.viewer.viewControls.object.rotateX(2);
            //lw.viewer.viewControls.object.rotateY(0.5);

            var L = dist;
            //var camera = lw.viewer.viewControls.object;
            var vector = lw.viewer.viewControls.target.clone();
            var l = (new THREE.Vector3()).subVectors(lw.viewer.camera.position, vector).length();
            var up = lw.viewer.camera.up.clone();
            var quaternion = new THREE.Quaternion();

            // Zoom correction
            lw.viewer.camera.translateZ(L - l);
            // console.log("up:", up);
            up.y = 1;
            up.x = 0;
            up.z = 0;
            quaternion.setFromAxisAngle(up, 0);
            //camera.position.applyQuaternion(quaternion);
            up.y = 0;
            up.x = 1;
            up.z = 0;
            quaternion.setFromAxisAngle(up, 0);
            lw.viewer.camera.position.applyQuaternion(quaternion);
            up.y = 0;
            up.x = 0;
            up.z = 1;
            quaternion.setFromAxisAngle(up, 0);
            //lw.viewer.camera.position.applyQuaternion(quaternion);

            lw.viewer.camera.lookAt(vector);

            //lw.viewer.camera.rotateX(90);

            lw.viewer.viewControls.object.updateProjectionMatrix();
            containerWidth = window.innerWidth;
            containerHeight = window.innerHeight;
            //lw.viewer.viewControls.enabled = true;
            //this.scaleInView();
            //lw.viewer.viewControls.rotateCamera(0.5);
            //lw.viewer.viewControls.noRoll = true;
            //lw.viewer.viewControls.noRotate = true;
        }

    }
};

function colorobj(name) {
    var object = lw.viewer.scene.getObjectByName(name, true);
    console.log(object)
    // for (i=0; i<dxfObject.children.length; i++) {
    //     dxfObject.children[i].material.color.setHex(0x000000);
    //     dxfObject.children[i].material.opacity = 0.3;
    // }
    object.material.color.setHex(0xFF0000);
    object.material.needsUpdate = true;
}


function makeSprite(scene, rendererType, vals) {
    var canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    metrics = null,
    textHeight = 100,
    textWidth = 0,
    actualFontSize = 10;
    var txt = vals.text;
    if (vals.size) actualFontSize = vals.size;

    context.font = "normal " + textHeight + "px Arial";
    metrics = context.measureText(txt);
    var textWidth = metrics.width;

    canvas.width = textWidth;
    canvas.height = textHeight;
    context.font = "normal " + textHeight + "px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    //context.fillStyle = "#ff0000";
    context.fillStyle = vals.color;

    context.fillText(txt, textWidth / 2, textHeight / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;

    var material = new THREE.SpriteMaterial({
        map: texture,
        // useScreenCoordinates: false,
        transparent: true,
        opacity: 0.6
    });
    material.transparent = true;
    //var textObject = new THREE.Sprite(material);
    var textObject = new THREE.Object3D();
    textObject.position.x = vals.x;
    textObject.position.y = vals.y;
    textObject.position.z = vals.z;
    var sprite = new THREE.Sprite(material);
    textObject.textHeight = actualFontSize;
    textObject.textWidth = (textWidth / textHeight) * textObject.textHeight;
    if (rendererType == "2d") {
        sprite.scale.set(textObject.textWidth / textWidth, textObject.textHeight / textHeight, 1);
    } else {
        sprite.scale.set(textWidth / textHeight * actualFontSize, actualFontSize, 1);
    }

    textObject.add(sprite);

    //lw.viewer.scene.add(textObject);
    return textObject;
}

function attachBB(object) {
    if (object.userData) {
        var $link = $('#'+object.userData.link);
        var $parent = $link.parent();
        var $input = $parent.children('input');

        if (object.material && object.type != "Mesh") {
            var checked = $input.prop('checked');

            if (checked) {
                object.material.color.setHex(object.userData.color);
                object.userData.selected = false;
                $input.prop('checked', false);
                $link.css('color', 'black');
                return;
            }

            object.material.color.setRGB(1, 0.1, 0.1);
        }

        $link.css('color', 'red');
        $input.prop('checked', true);

        object.userData.selected = true;
    }
    // console.log(object);
    // console.log(object.type);

    //  if (object.type == "Mesh" ) {
    // // dont  BB
    //  } else {
    if (typeof(boundingBox) != 'undefined') {
        lw.viewer.scene.remove(boundingBox);
    }

    var bbox2 = new THREE.Box3().setFromObject(object);
    // console.log('bbox for Clicked Obj: '+ object +' Min X: ', (bbox2.min.x + (laserxmax / 2)), '  Max X:', (bbox2.max.x + (laserxmax / 2)), 'Min Y: ', (bbox2.min.y + (laserymax / 2)), '  Max Y:', (bbox2.max.y + (laserymax / 2)));

    BBmaterial =  new THREE.LineDashedMaterial( { color: 0xaaaaaa, dashSize: 5, gapSize: 4, linewidth: 2 } );
    BBgeometry = new THREE.Geometry();
    BBgeometry.vertices.push(
        new THREE.Vector3(  (bbox2.min.x - 1), (bbox2.min.y - 1), 0 ),
        new THREE.Vector3(  (bbox2.min.x - 1), (bbox2.max.y + 1) , 0 ),
        new THREE.Vector3( (bbox2.max.x + 1), (bbox2.max.y + 1), 0 ),
        new THREE.Vector3( (bbox2.max.x + 1), (bbox2.min.y - 1), 0 ),
        new THREE.Vector3(  (bbox2.min.x - 1), (bbox2.min.y - 1), 0 )
    );
    BBgeometry.computeLineDistances();  //  NB If not computed, dashed lines show as solid
    boundingBoxLines= new THREE.Line( BBgeometry, BBmaterial );
    boundingBox = new THREE.Group();
    boundingBox.add(boundingBoxLines)

    var bwidth = parseFloat(bbox2.max.x - bbox2.min.x).toFixed(2);
    var bheight = parseFloat(bbox2.max.y - bbox2.min.y).toFixed(2);

    widthlabel = this.makeSprite(lw.viewer.scene, "webgl", {
        x: (bbox2.max.x + 30),
        y: ((bbox2.max.y - ((bbox2.max.y - bbox2.min.y) / 2)) + 10),
        z: 0,
        text: "W: " + bwidth + "mm",
        color: "#aaaaaa",
        size: 6
    });

    boundingBox.add(widthlabel)

    heightlabel = this.makeSprite(lw.viewer.scene, "webgl", {
        x: ((bbox2.max.x - ((bbox2.max.x - bbox2.min.x) / 2)) + 10),
        y: (bbox2.max.y + 10),
        z: 0,
        text: "H: " + bheight + "mm",
        color: "#aaaaaa",
        size: 6
    });
    boundingBox.add(heightlabel)
    boundingBox.name = "Bounding Box"
    lw.viewer.scene.add( boundingBox );
    // }

}

function drawRotary(radius) {
    var rotary = new THREE.Group();
    var lastz = 0; var lasty = 0;
    var rmat = new THREE.LineBasicMaterial({
        color: 0x888888,
        opacity: 0.5
    });
    var rgeo = new THREE.Geometry();
    rgeo.vertices.push(new THREE.Vector3(-(laserxmax / 2), 0, 0));
    rgeo.vertices.push(new THREE.Vector3((laserxmax / 2), 0, 0));
    for (r = 0; r < 360; r += 10) {
        var rline = new THREE.Line(rgeo, rmat);
        // x1 = x + radius * Math.Cos(angle * (Math.PI / 180));
        // y1 = y + radius * Math.Sin(angle * (Math.PI / 180));
        var y1 = 0 + radius * Math.cos(r * (Math.PI / 180));
        var z1 = 0 + radius * Math.sin(r * (Math.PI / 180));
        rline.position.y = y1
        rline.position.z = z1
        rotary.add (rline)
        for (i = -(laserxmax / 2); i < (laserxmax / 2); i+=10 ) {
            var rgeov = new THREE.Geometry();
            rgeov.vertices.push(new THREE.Vector3(i, lasty, lastz));
            rgeov.vertices.push(new THREE.Vector3(i, y1, z1));
            var rlinev = new THREE.Line(rgeov, rmat);
            // rlinev.position.y = x1
            // rlinev.position.z = z1
            rotary.add(rlinev)
        }
        lastz = z1;
        lasty = y1
    }
    lw.viewer.scene.add(rotary);
}
