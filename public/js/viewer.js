// Global Vars
var laserxmax;
var laserymax;

var imageDetect, video, videoImage, videoImageContext, videoTexture, useVideo, movieScreen;
var objectsInScene = []; //array that holds all objects we added to the lw.viewer.scene.

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

// Attach an bounding box to object
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

    if (typeof(boundingBox) != 'undefined') {
        lw.viewer.scene.remove(boundingBox);
    }

    boundingBox = new lw.viewer.BoundingBox(object);

    lw.viewer.scene.add(boundingBox);
}
