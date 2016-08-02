/*

    AUTHOR:  John Lauer
    -- Significant UI changes by AUTHOR: Peter van der Walt

*/


function createObject(gcode) {
  if (typeof(object) != 'undefined') {
        scene.remove(object);
        object = null;
    }

	//Create the object
	createObjectFromGCode(gcode);
	}

function openGCodeFromText() {
	$('#renderprogressholder .progress-bar').width(0);
	//console.log('Starting Gcode Render');

  var gcode = prepgcodefile();

	createObject(gcode);
	
}
