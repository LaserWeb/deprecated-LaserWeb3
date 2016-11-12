// Global Vars
var laserxmax;
var laserymax;

var objectsInScene = []; //array that holds all objects we added to the lw.viewer.scene.

function init3D() {
    // LaserWEB UI Grids
    laserxmax = lw.viewer.grid.userData.size.x;
    laserymax = lw.viewer.grid.userData.size.y;
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
