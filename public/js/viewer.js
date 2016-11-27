// Global Vars
var scene, camera, renderer;
var geometry, material, mesh, helper, axes, axesgrp, light, bullseye, cursor;
var projector, mouseVector, containerWidth, containerHeight;
var raycaster = new THREE.Raycaster();

var container, stats;
var camera, controls, control, scene, renderer;
var clock = new THREE.Clock();

var marker;
var laserxmax;
var laserymax;
var lineincrement = 50
var camvideo;
var imageDetect, video, videoImage, videoImageContext, videoTexture, useVideo, movieScreen;
var objectsInScene = []; //array that holds all objects we added to the scene.

var workspace = new THREE.Group();
workspace.name = "LaserWeb Workspace"

containerWidth = window.innerWidth;
containerHeight = window.innerHeight;

var camvideo = document.getElementById('monitor');

setBullseyePosition = function(x, y, z) {
    //console.log('Set Position: ', x, y, z)
    if (x) {
        bullseye.position.x = (parseInt(x, 10) - (laserxmax / 2));
    };
    if (y) {
        bullseye.position.y = (parseInt(y, 10) - (laserymax / 2));
    };
    if (z) {
        bullseye.position.z = (parseInt(z, 10) + 0.1);
    };
}

function initWebcam() {

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    window.URL = window.URL || window.webkitURL;

    camvideo = document.getElementById('monitor');

    if (!navigator.getUserMedia)
    {
        printLog('Sorry. WebRTC is not available.', errorcolor, "viewer");
        scene.remove(movieScreen);
    } else {
        navigator.getUserMedia({video: true}, gotStream, noStream);
    }
}

function gotStream(stream)
{
    if (window.URL)
    {
        camvideo = document.getElementById('monitor');
        camvideo.src = window.URL.createObjectURL(stream);   }
        else // Opera
        {
            camvideo = document.getElementById('monitor');
            camvideo.src = stream;   }
            camvideo.onerror = function(e)
            {   stream.stop();   };
            stream.onended = noStream;
        }
        function noStream(e)
        {
            var msg = 'No camera available.  You have Video Overlay enabled in <kbd>Settings <i class="fa fa-cogs"></i></kbd>, but WebRTC could not locate a device.  Please plug in a webcam, and position the camera to look at your cutting bed';
            if (e.code == 1)
            {   msg = 'User denied access to use camera.  Please refresh the page, and click Allow on the permission request at the top of the browser window, to use Video Overlay.  Or Disable Video Overlay from <kbd>Settings <i class="fa fa-cogs"></i></kbd> ';   }
            printLog(msg, errorcolor, "viewer")
            scene.remove(movieScreen);
        }



        function init3D() {

            window.addEventListener('mousedown', onMouseClick, false);
            window.addEventListener('mousemove', onMouseMove, false);


            // ThreeJS Render/Control/Camera
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
            camera.position.z = 295;

            // var userAgent = navigator.userAgent || navigator.vendor || window.opera;
            //
            // if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) )
            // {
            //       console.log('Running on iOS');
            //       renderer = new THREE.WebGLRenderer();
            // }
            //     else if( userAgent.match( /Android/i ) )
            // {
            //     console.log('Running on Android');
            //     renderer = new THREE.CanvasRenderer();
            // }
            //   else
            // {
            //     console.log('Running on unknown/Desktop');
            //     renderer = new THREE.WebGLRenderer();
            // }

            var canvas = !!window.CanvasRenderingContext2D;
            var webgl = (function() {
                try {
                    return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
                } catch (e) {
                    return false;
                }
            })();

            if (webgl) {
                printLog('<h5><i class="fa fa-search fa-fw" aria-hidden="true"></i>WebGL Support found!</h5><b>success:</b><br> Laserweb will work optimally on this device!<hr><p>', successcolor);
                renderer = new THREE.WebGLRenderer({
                    autoClearColor: true,
                    antialias: false
                });

            } else if (canvas) {
                printLog('<h5><i class="fa fa-search fa-fw" aria-hidden="true"></i>No WebGL Support found!</h5><b>CRITICAL ERROR:</b><br> Laserweb may not work optimally on this device! <br>Try another device with WebGL support</p><br><u>Try the following:</u><br><ul><li>In the Chrome address bar, type: <b>chrome://flags</b> [Enter]</li><li>Enable the <b>Override software Rendering</b></li><li>Restart Chrome and try again</li></ul>Sorry! :(<hr><p>', errorcolor);
                renderer = new THREE.CanvasRenderer();
            };



            var userAgent = navigator.userAgent || navigator.vendor || window.opera;

            if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
                console.log('Running on iOS');
                // $('#viewermodule').show();
                // $('#mobileRenderArea').append(renderer.domElement);
                // renderer.setClearColor(0xffffff, 1); // Background color of viewer
                // renderer.setSize(1000, 1000);
                // renderer.clear();
                // camera.aspect = $('#mobileRenderArea').width() / $('#mobileRenderArea').height();
                // camera.updateProjectionMatrix();

            } else if (userAgent.match(/Android/i)) {
                console.log('Running on Android');
                // $('#viewermodule').show();
                // $('#mobileRenderArea').append(renderer.domElement);
                // renderer.setClearColor(0xffffff, 1); // Background color of viewer
                // renderer.setSize($('#mobileRenderArea').width(), $('#mobileRenderArea').height());
                // renderer.clear();
                // camera.aspect = $('#mobileRenderArea').width() / $('#mobileRenderArea').height();
                // camera.updateProjectionMatrix();

            } else {
                console.log('Running on unknown/Desktop');
                // $('#viewermodule').hide();
                // $('#renderArea').append(renderer.domElement);
                // renderer.setClearColor(0xffffff, 1); // Background color of viewer = transparent
                // // renderer.setSize(window.innerWidth - 10, window.innerHeight - 10);
                // renderer.clear();
                //
                // sceneWidth = document.getElementById("renderArea").offsetWidth,
                // sceneHeight = document.getElementById("renderArea").offsetHeight;
                // camera.aspect = sceneWidth / sceneHeight;
                // renderer.setSize(sceneWidth, sceneHeight)
                // camera.updateProjectionMatrix();
                // controls.reset();
                // $('#viewReset').click();

            }

            $('#viewermodule').hide();
            $('#renderArea').append(renderer.domElement);
            renderer.setClearColor(0xffffff, 1); // Background color of viewer = transparent
            // renderer.setSize(window.innerWidth - 10, window.innerHeight - 10);
            renderer.clear();

            sceneWidth = document.getElementById("renderArea").offsetWidth,
            sceneHeight = document.getElementById("renderArea").offsetHeight;
            camera.aspect = sceneWidth / sceneHeight;
            renderer.setSize(sceneWidth, sceneHeight)
            camera.updateProjectionMatrix();


            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.target.set(0, 0, 0); // view direction perpendicular to XY-plane

            cncMode = $('#cncMode').val()
            if (cncMode == "Enable") {
                controls.enableRotate = true;
                $('#3dview').prop('checked', true);
            } else {
                controls.enableRotate = false;
            }


            controls.enableZoom = true; // optional
            controls.enableKeys = false; // Disable Keyboard on canvas
            //controls.mouseButtons = { PAN: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, ORBIT: THREE.MOUSE.RIGHT }; // swapping left and right buttons
            // /var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

            control = new THREE.TransformControls(camera, renderer.domElement);

            workspace.add(control);
            control.setMode("translate");

            var light = new THREE.DirectionalLight(0xffffff);
            light.position.set(-500, -500, 1).normalize();
            light.name = "Light1;"
            workspace.add(light);

            var light2 = new THREE.DirectionalLight(0xffffff);
            light2.name = "Light2"
            light2.position.set(1, 0, 1).normalize();
            workspace.add(light2);

            // LaserWEB UI Grids
            if (helper) {
                workspace.remove(helper);
            }

            laserxmax = $('#laserXMax').val();
            laserymax = $('#laserYMax').val();

            if (!laserxmax) {
                laserxmax = 200;
            };

            if (!laserymax) {
                laserymax = 200;
            };

            helper = new THREE.GridHelper(laserxmax, laserymax, 10);
            helper.setColors(0x0000ff, 0x707070);
            helper.position.y = 0;
            helper.position.x = 0;
            helper.position.z = 0;
            //helper.rotation.x = 90 * Math.PI / 180;
            helper.material.opacity = 0.15;
            helper.material.transparent = true;
            helper.receiveShadow = false;
            //console.log("helper grid:", helper);
            this.grid = helper;
            //this.sceneAdd(this.grid);
            //console.log('[VIEWER] - added Helpert');
            helper.name = "GridHelper"
            workspace.add(helper);

            if (bullseye) {
                scene.remove(bullseye);
            }
            bullseye = new THREE.Object3D();

            var material = new THREE.LineBasicMaterial({
                color: 0xFF0000
            });

            var cone = new THREE.Mesh(new THREE.CylinderGeometry(0, 5, 40, 15, 1, false), new THREE.MeshPhongMaterial( {
                color: 0x0000ff,
                specular: 0x0000ff,
                shininess: 100
            } ) );
            cone.overdraw = true;
            cone.rotation.x = -90 * Math.PI / 180;
            cone.position.z = 20;
            //cylinder.position.z = 40;
            cone.material.opacity = 0.6;
            cone.material.transparent = true;
            cone.castShadow = false;

            bullseye.add(cone);

            bullseye.name = "Bullseye";

            workspace.add(bullseye);
            bullseye.position.x = -(laserxmax / 2);
            bullseye.position.y = -(laserymax / 2);


            if (cursor) {
                workspace.remove(cursor);
            }
            cursor = new THREE.Object3D();
            cursor.name ="cursor"

            // Mouse Cursor
            // var cursorshape = new THREE.Shape();
            // cursorshape.moveTo( 0,0 );
            // cursorshape.lineTo( 0,  -25);
            // cursorshape.lineTo( 5.5,  -18);
            // cursorshape.lineTo( 8,  -26);
            // cursorshape.lineTo( 12, -24.5 );
            // cursorshape.lineTo( 9,  -17);
            // cursorshape.lineTo( 17, -17.5 );
            // cursorshape.lineTo( 0,  0);
            // var cursorGeom = new THREE.ShapeGeometry( cursorshape );
            // var cursorArrow = new THREE.Mesh( cursorGeom, new THREE.MeshBasicMaterial( { color: 0xeeeeee } ) ) ;
            //
            // // cursor.add(cursorArrow);
            //
            // var edges = new THREE.EdgesHelper(cursorArrow , '#000000');
            // edges.material.linewidth = 3;
            // edges.matrixAutoUpdate = true;
            // cursor.add(edges);


            var cursormaterial = new THREE.MeshBasicMaterial({
                color: 0xFF0000
            });

            var radius = 3.5;
            var segments = 32;
            var circleGeometry = new THREE.CircleGeometry(radius, segments);
            var circle = new THREE.Line(circleGeometry, material);
            cursor.add(circle);

            var geometryx = new THREE.Geometry();
            geometryx.vertices.push(
                new THREE.Vector3(-6, 0, 0),
                new THREE.Vector3(6, 0, 0)
            );
            var linex = new THREE.Line(geometryx, material);
            linex.position = (0, 0, 0)
            cursor.add(linex);

            var geometryy = new THREE.Geometry();
            geometryy.vertices.push(
                new THREE.Vector3(0, -6, 0),
                new THREE.Vector3(0, 6, 0)
            );
            var liney = new THREE.Line(geometryy, material);
            liney.position = (0, 0, 0)
            cursor.add(liney);


            workspace.add(cursor)


            if (axesgrp) {
                scene.remove(axesgrp);
            }
            axesgrp = new THREE.Object3D();
            axesgrp.name = "Grid System"

            var x = [];
            var y = [];
            for (var i = 0; i <= laserxmax; i += lineincrement) {
                x[i] = this.makeSprite(this.scene, "webgl", {
                    x: i,
                    y: -14,
                    z: 0,
                    text: i,
                    color: "#ff0000"
                });
                axesgrp.add(x[i]);
            }

            for (var i = 0; i <= laserymax; i += lineincrement) {

                y[i] = this.makeSprite(this.scene, "webgl", {
                    x: -14,
                    y: i,
                    z: 0,
                    text: i,
                    color: "#006600"
                });
                axesgrp.add(y[i]);
            }
            // add axes labels
            var xlbl = this.makeSprite(this.scene, "webgl", {
                x: laserxmax,
                y: 0,
                z: 0,
                text: "X",
                color: "#ff0000"
            });
            var ylbl = this.makeSprite(this.scene, "webgl", {
                x: 0,
                y: laserymax,
                z: 0,
                text: "Y",
                color: "#006600"
            });
            var zlbl = this.makeSprite(this.scene, "webgl", {
                x: 0,
                y: 0,
                z: 125,
                text: "Z",
                color: "#0000ff"
            });


            axesgrp.add(xlbl);
            axesgrp.add(ylbl);
            //axesgrp.add(zlbl); Laser don't have Z - but CNCs do

            var materialX = new THREE.LineBasicMaterial({
                color: 0xcc0000
            });

            var materialY = new THREE.LineBasicMaterial({
                color: 0x00cc00
            });

            var geometryX = new THREE.Geometry();
            geometryX.vertices.push(
                new THREE.Vector3(-0.1, 0, 0),
                new THREE.Vector3(-0.1, (laserymax - 5), 0)
            );

            var geometryY = new THREE.Geometry();
            geometryY.vertices.push(
                new THREE.Vector3(0, -0.1, 0),
                new THREE.Vector3((laserxmax - 5), -0.1, 0)
            );

            var line1 = new THREE.Line(geometryX, materialY);
            var line2 = new THREE.Line(geometryY, materialX);
            axesgrp.add(line1);
            axesgrp.add(line2);

            axesgrp.translateX(laserxmax / 2 * -1);
            axesgrp.translateY(laserymax / 2 * -1);
            //console.log('[VIEWER] - added Axesgrp');
            workspace.add(axesgrp);

            // Picking stuff
            projector = new THREE.Projector();
            mouseVector = new THREE.Vector3();


            // Webcam Texture
            useVideo = $('#useVideo').val()
            if (useVideo) {
                if (useVideo.indexOf('Enable') == 0) {
                    initWebcam();
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
                    workspace.add(movieScreen);
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
                    workspace.add(movieScreen);
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

            $('#3dview').change(function() {
                if($(this).is(":checked")) {
                    controls.enableRotate = true;
                    resetView();
                } else {
                    controls.enableRotate = false;
                    resetView();
                }
            });

            scene.add(workspace)

        }

        function animate() {

            //useVideo = $('#useVideo').val()
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


            // mesh.rotation.x += 0.01;
            // mesh.rotation.y += 0.02;
            renderer.render(scene, camera);
            sceneWidth = document.getElementById("renderArea").offsetWidth,
            sceneHeight = document.getElementById("renderArea").offsetHeight;
            camera.aspect = sceneWidth / sceneHeight;
        }



        viewExtents = function(objecttosee) {
            //console.log("viewExtents. object.userData:", this.object.userData);
            // console.log("controls:", controls);
            //wakeAnimate();

            // lets override the bounding box with a newly
            // generated one
            // get its bounding box
            if (objecttosee) {
                var helper = new THREE.BoundingBoxHelper(objecttosee, 0xff0000);
                helper.update();
                //if (this.bboxHelper)
                //    this.scene.remove(this.bboxHelper);
                bboxHelper = helper;

                // If you want a visible bounding box
                //this.scene.add(this.bboxHelper);
                // console.log("helper bbox:", helper);

                var minx = helper.box.min.x;
                var miny = helper.box.min.y;
                var maxx = helper.box.max.x;
                var maxy = helper.box.max.y;
                var minz = helper.box.min.z;
                var maxz = helper.box.max.z;


                controls.reset();

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
                controls.object.position.x = centerx;
                controls.object.position.y = centery;
                controls.object.position.z = centerz + dist;
                controls.target.x = centerx;
                controls.target.y = centery;
                controls.target.z = centerz;
                // console.log("maxlen:", maxlen, "dist:", dist);
                var fov = 2.2 * Math.atan(maxlen / (2 * dist)) * (180 / Math.PI);
                // console.log("new fov:", fov, " old fov:", controls.object.fov);
                if (isNaN(fov)) {
                    console.log("giving up on viewing extents because fov could not be calculated");
                    return;
                } else {
                    controls.object.fov = fov;
                    //this.controls.object.setRotationFromEuler(THREE.Euler(0.5,0.5,0.5));
                    //this.controls.object.rotation.set(0.5,0.5,0.5,"XYZ");
                    //this.controls.object.rotateX(2);
                    //this.controls.object.rotateY(0.5);

                    var L = dist;
                    var camera = controls.object;
                    var vector = controls.target.clone();
                    var l = (new THREE.Vector3()).subVectors(camera.position, vector).length();
                    var up = camera.up.clone();
                    var quaternion = new THREE.Quaternion();

                    // Zoom correction
                    camera.translateZ(L - l);
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
                    camera.position.applyQuaternion(quaternion);
                    up.y = 0;
                    up.x = 0;
                    up.z = 1;
                    quaternion.setFromAxisAngle(up, 0);
                    //camera.position.applyQuaternion(quaternion);

                    camera.lookAt(vector);

                    //this.camera.rotateX(90);

                    controls.object.updateProjectionMatrix();
                    containerWidth = window.innerWidth;
                    containerHeight = window.innerHeight;
                    //this.controls.enabled = true;
                    //this.scaleInView();
                    //this.controls.rotateCamera(0.5);
                    //this.controls.noRoll = true;
                    //this.controls.noRotate = true;
                }

            }
        };

        function colorobj(name) {
            var object = scene.getObjectByName(name, true);
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

            //scene.add(textObject);
            return textObject;
        }


        // Global Function to keep three fullscreen
        $(window).on('resize', function() {
            //renderer.setSize(element.width(), element.height());

            sceneWidth = document.getElementById("renderArea").offsetWidth;
            sceneHeight = document.getElementById("renderArea").offsetHeight;
            renderer.setSize(sceneWidth, sceneHeight);
            //renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = sceneWidth / sceneHeight;
            camera.updateProjectionMatrix();
            controls.reset();
            setTimeout(function(){ $('#viewReset').click(); }, 100);
            // setTimeout(function(){ $('#tabsLayers a[href="#allView"]').trigger('click'); }, 100);


        });

        function onMouseClick(e) {

            //event.preventDefault();
            sceneWidth = document.getElementById("renderArea").offsetWidth;
            sceneHeight = document.getElementById("renderArea").offsetHeight;
            offset = $('#renderArea').offset();
            mouseVector.x = ( ( e.clientX - offset.left ) / sceneWidth ) * 2 - 1;
            mouseVector.y = - ( ( e.clientY - offset.top ) / sceneHeight ) * 2 + 1

            // mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
            // mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;




            // var vector = mouseVector.clone().unproject( camera );
            // var direction = new THREE.Vector3( 0, 0, -1 ).transformDirection( camera.matrixWorld );
            // raycaster.set( vector, direction );
            raycaster.setFromCamera(mouseVector, camera);
            var intersects = raycaster.intersectObjects(scene.children, true)

            for (var i = 0; i < intersects.length; i++) {

                var intersection = intersects[i],
                obj = intersection.object;

                if (obj.name && obj.name != "bullseye" && obj.name != "rastermesh" && obj.name != "XY" && obj.name != "GridHelper") {
                    printLog('Clicked on : ' + obj.name, successcolor, "viewer")
                    console.log('Clicked on : ' + obj.parent.name + '.' + obj.name);
                    // obj.material.color.setRGB(Math.random(), Math.random(), Math.random());
                    attachBB(obj)
                }

                cursor.position.set(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z);
                // bullseye.children[0].material.color.setRGB(1, 0, 0);
                // bullseye.children[1].material.color.setRGB(1, 0, 0);
                // bullseye.children[2].material.color.setRGB(1, 0, 0);

            }

        }
        function onMouseMove(e) {

            //event.preventDefault();
            sceneWidth = document.getElementById("renderArea").offsetWidth;
            sceneHeight = document.getElementById("renderArea").offsetHeight;
            offset = $('#renderArea').offset();
            mouseVector.x = ( ( e.clientX - offset.left ) / sceneWidth ) * 2 - 1;
            mouseVector.y = - ( ( e.clientY - offset.top ) / sceneHeight ) * 2 + 1


            raycaster.setFromCamera(mouseVector, camera);
            var intersects = raycaster.intersectObjects(scene.children, true)
            for (var i = 0; i < intersects.length; i++) {
                var intersection = intersects[i],
                obj = intersection.object;
                if (obj.name && obj.name != "bullseye" && obj.name != "rastermesh") {
                    // printLog('Clicked on : ' + obj.name, successcolor)
                    // obj.material.color.setRGB(Math.random(), Math.random(), Math.random());
                }

                cursor.position.set(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z);


            }


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
                scene.remove(boundingBox);
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

            widthlabel = this.makeSprite(this.scene, "webgl", {
                x: (bbox2.max.x + 30),
                y: ((bbox2.max.y - ((bbox2.max.y - bbox2.min.y) / 2)) + 10),
                z: 0,
                text: "W: " + bwidth + "mm",
                color: "#aaaaaa",
                size: 6
            });

            boundingBox.add(widthlabel)

            heightlabel = this.makeSprite(this.scene, "webgl", {
                x: ((bbox2.max.x - ((bbox2.max.x - bbox2.min.x) / 2)) + 10),
                y: (bbox2.max.y + 10),
                z: 0,
                text: "H: " + bheight + "mm",
                color: "#aaaaaa",
                size: 6
            });
            boundingBox.add(heightlabel)
            boundingBox.name = "Bounding Box"
            scene.add( boundingBox );
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
            scene.add(rotary);
        }
