var Xtofix;
var Ytofix;
var oldxscale = 0;
var oldyscale = 0;


function filePrepInit() {

    $('#panleft').on('click', function() {
        var oldValue = lw.viewer.viewControls.target.x
        var newVal = oldValue + 20;
        TweenMax.to(lw.viewer.viewControls.target,0.25,{x:newVal,onUpdate:function(){
            lw.viewer.viewControls.update();
        }});
    });

    $('#panright').on('click', function() {
        var oldValue = lw.viewer.viewControls.target.x
        var newVal = oldValue - 20;
        TweenMax.to(lw.viewer.viewControls.target,0.25,{x:newVal,onUpdate:function(){
            lw.viewer.viewControls.update();
        }});
    });

    $('#panup').on('click', function() {
        var oldValue = lw.viewer.viewControls.target.y
        var newVal = oldValue - 20;
        TweenMax.to(lw.viewer.viewControls.target,0.25,{y:newVal,onUpdate:function(){
            lw.viewer.viewControls.update();
        }});
    });

    $('#pandown').on('click', function() {
        var oldValue = lw.viewer.viewControls.target.y
        var newVal = oldValue + 20;
        TweenMax.to(lw.viewer.viewControls.target,0.25,{y:newVal,onUpdate:function(){
            lw.viewer.viewControls.update();
        }});
    });

    $('#zoomout').on('click', function() {
        TweenMax.to(lw.viewer.camera,0.25,{fov:"+=5",onUpdate:function(){
            lw.viewer.camera.updateProjectionMatrix();
        }});
        lw.viewer.viewControls.update();
    });

    $('#zoomin').on('click', function() {
        TweenMax.to(lw.viewer.camera,0.25,{fov:"-=5",onUpdate:function(){
            lw.viewer.camera.updateProjectionMatrix();
        }});
        lw.viewer.viewControls.update();
    });
}

function putFileObjectAtZero(object) {
    if (! object) return;
    var laserxmax = lw.viewer.grid.userData.size.x;
    var laserymax = lw.viewer.grid.userData.size.y;
    var bbox2 = new THREE.Box3().setFromObject(object);
    Xtofix = -(bbox2.min.x + (laserxmax / 2));
    imagePosition = $('#imagePosition').val()
    // console.log('ImagePosition', imagePosition)
    if (imagePosition == "TopLeft") {
        Ytofix = (laserymax / 2) - bbox2.max.y;
    } else {
        Ytofix = -(bbox2.min.y + (laserymax / 2));
    }
    object.translateX(Xtofix);
    object.translateY(Ytofix);
    calcZeroOffset(object);
}

function calcZeroOffset(object) {
    if (! object) return;
    var laserxmax = lw.viewer.grid.userData.size.x;
    var laserymax = lw.viewer.grid.userData.size.y;
    var bbox2 = new THREE.Box3().setFromObject(object);
    xfromzero = -(bbox2.min.x + (laserxmax / 2));
    imagePosition = $('#imagePosition').val()
    if (imagePosition == "TopLeft") {
        yfromzero = (laserymax / 2) - bbox2.max.y;
    } else {
        yfromzero = -(bbox2.min.y + (laserymax / 2));
    }
    var xoffset = ( object.position.x - xfromzero )
    var yoffset = ( object.position.y - yfromzero )
    object.userData.offsetX = xoffset
    object.userData.offsetY = yoffset
}
