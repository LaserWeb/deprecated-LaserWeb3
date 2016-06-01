/*

    AUTHOR:  John Lauer
    -- Significant UI changes by AUTHOR: Peter van der Walt

*/


function createObject(gcode) {
  if (typeof(object) != 'undefined') {
        scene.remove(object);
    }

	//Create the object
	createObjectFromGCode(gcode);
//  object =  drawobject();

	//object.translateX(laserxmax /2 * -1);
	//object.translateY(laserymax /2 * -1);

    //scene.add(object);
		//console.log('[VIEWER] - added Object');
	}

function openGCodeFromText() {
	$('#renderprogressholder .progress-bar').width(0);
	//console.log('Starting Gcode Render');
	var startTime = Date.now();
	var gcode = $('#gcodepreview').val();
	//if (document.hasFocus()) {
	createObject(gcode);
        //console.log('adding object with existing focus');
  //  } else {
        // wait for focus, then render
        //console.log('waiting for focus');
	//$(window).bind('focus', function(event) {
	//    createObject(gcode);
  //          //console.log('focus exists');
  //          // unbind for next object load
          //  $(this).unbind(event);
  //      });
  //  }
	console.timeEnd("Process 3D View");
	var currentTime = Date.now();
	var elapsed = (currentTime - startTime);

  printLog('3D Render completed in '+elapsed, successcolor)

	// Pretty Gcode Viewer
	//$("#gcodelinestbody").empty();

  // rest of gcodelinestbody is written by the doChunk on gcode-parser

}
