function initJog() {

  $('body').on('keydown', function(ev) {
		if (ev.keyCode === 17) {
			//CTRL key down > set override stepping to 10
			ovStep = 10;
		}
	});

	$('body').on('keyup', function(ev) {
		if (ev.keyCode === 17) {
			//CTRL key released-> reset override stepping to 1
			ovStep = 1;
		}
	});


  $('#bounding').on('click', function() {
    var bbox2 = new THREE.Box3().setFromObject(object);
    console.log('bbox for Draw Bounding Box: '+ object +' Min X: ', (bbox2.min.x + (laserxmax / 2)), '  Max X:', (bbox2.max.x + (laserxmax / 2)), 'Min Y: ', (bbox2.min.y + (laserymax / 2)), '  Max Y:', (bbox2.max.y + (laserymax / 2)));
    printLog("Drawing Bounding Box...", msgcolor, "jog");
    var feedrate = $('#jogfeedxy').val() * 60;
    var moves = `
    G90\n
    G0 X`+(bbox2.min.x + (laserxmax / 2))+` Y`+(bbox2.min.y + (laserymax / 2))+` F`+feedrate+`\n
    G0 X`+(bbox2.max.x + (laserxmax / 2))+` Y`+(bbox2.min.y + (laserymax / 2))+` F`+feedrate+`\n
    G0 X`+(bbox2.max.x + (laserxmax / 2))+` Y`+(bbox2.max.y + (laserymax / 2))+` F`+feedrate+`\n
    G0 X`+(bbox2.min.x + (laserxmax / 2))+` Y`+(bbox2.max.y + (laserymax / 2))+` F`+feedrate+`\n
    G0 X`+(bbox2.min.x + (laserxmax / 2))+` Y`+(bbox2.min.y + (laserymax / 2))+` F`+feedrate+`\n
    G90\n`;
    sendGcode(moves);
  });

  $('#homeAll').on('click', function(ev) {
      var homecommand = document.getElementById('homingseq').value;
      sendGcode(homecommand);
  });

  $('#homeX').on('click', function(ev) {
      var homecommand = document.getElementById('homingseq').value;
      sendGcode(homecommand + "X");
  });
  $('#homeY').on('click', function(ev) {
      var homecommand = document.getElementById('homingseq').value;
      sendGcode(homecommand + "Y");
  });
  $('#homeZ').on('click', function(ev) {
      var homecommand = document.getElementById('homingseq').value;
      sendGcode(homecommand + "Z");
  });

  $('#gotoXZero').on('click', function(ev) {
    var feedrate = $('#jogfeedxy').val() * 60;
    sendGcode('G0 X0 F' + feedrate);
  });

  $('#gotoYZero').on('click', function(ev) {
    var feedrate = $('#jogfeedxy').val() * 60;
    sendGcode('G0 Y0 F' + feedrate);
  });

  $('#gotoZZero').on('click', function(ev) {
    var feedrate = $('#jogfeedz').val() * 60;
    sendGcode('G0 Z0 F' + feedrate);
  });

  $('#XProbeMin').on('click', function(ev) {
    sendGcode('G38.2 X20');
  });

  $('#XProbeMax').on('click', function(ev) {
    sendGcode('G38.2 X-20');
  });

  $('#YProbeMin').on('click', function(ev) {
    sendGcode('G38.2 Y20');
  });

  $('#YProbeMax').on('click', function(ev) {
    sendGcode('G38.2 Y-20');
  });

  $('#ZProbeMin').on('click', function(ev) {
    sendGcode('G38.2 Z-20');
  });

  // zero x axes
  $('#zeroX').on('click', function(ev) {
    console.log("X zero");
    sendGcode('G10 L20 P0﻿ X0\n');
  });

  // zero y axes
  $('#zeroY').on('click', function(ev) {
    console.log("Y zero");
    sendGcode('G10 L20 P0﻿ Y0\n');
  });

  // zero z axes
  $('#zeroZ').on('click', function(ev) {
    console.log("Z zero");
    sendGcode('G10 L20 P0﻿ Z0\n');
  });

  // zero all axes
  $('#zeroAll').on('click', function(ev) {
    console.log("Z zero");
    sendGcode('G10 L20 P0﻿ X0 Y0 Z0');
  });


  // increase feed override
  $('#iF').on('mousedown', function(ev) {
    console.log("F+ mousedown");
    override('F', ovStep);
    ovLoop = setInterval(function() {
      override('F', ovStep);
    }, 300);
  });

  $('#iF').on('mouseup', function(ev) {
    console.log("F+ mouseup");
    clearInterval(ovLoop);
  });

  $('#iF').on('mouseout', function(ev) {
    console.log("F+ mouseout");
    clearInterval(ovLoop);
  });

  // decrease feed override
  $('#dF').on('mousedown', function(ev) {
    console.log("F- mousedown");
    override('F', -ovStep);
    ovLoop = setInterval(function() {
      override('F', -ovStep);
    }, 300);
  });

  $('#dF').on('mouseup', function(ev) {
    console.log("F- mouseup");
    clearInterval(ovLoop);
  });

  $('#dF').on('mouseout', function(ev) {
    console.log("F- mouseout");
    clearInterval(ovLoop);
  });

  // reset feed override
  $('#rF').on('click', function(ev) {
    console.log("F reset");
    override('F', 0);
  });

  // increase spindle override
  $('#iS').on('mousedown', function(ev) {
    console.log("S+ mousedown");
    override('S', ovStep);
    ovLoop = setInterval(function() {
      override('S', ovStep);
    }, 300);
  });

  $('#iS').on('mouseup', function(ev) {
    console.log("S+ mouseup");
    clearInterval(ovLoop);
  });

  $('#iS').on('mouseout', function(ev) {
    console.log("S+ mouseout");
    clearInterval(ovLoop);
  });

  // decrease spindle override
  $('#dS').on('mousedown', function(ev) {
    console.log("S- mousedown");
    override('S', -ovStep);
    ovLoop = setInterval(function() {
      override('S', -ovStep);
    }, 300);
  });

  $('#dS').on('mouseup', function(ev) {
    console.log("S- mouseup");
    clearInterval(ovLoop);
  });

  $('#dS').on('mouseout', function(ev) {
    console.log("S- mouseout");
    clearInterval(ovLoop);
  });

  // reset spindle override
  $('#rS').on('click', function(ev) {
    console.log("S reset");
    override('S', 0);
  });

  $('#lT').on('click', function() {
    if (isConnected) {
      var power = $('#lasertestpower').val();
      var duration = $('#lasertestduration').val();
      console.log('Laser Test', power + ', ' + duration);
      laserTest(power, duration);
    }
  });

  $('#motorsOff').on('click', function() {
    if (isConnected) {
      console.log('Turning Off Motor Power');
      sendGcode('M84\n');
    }
  });

  $('#xP').on('click', function() {
     if (isConnected) {
       var dist = $('input[name=stp]:checked', '#stepsize').val();
       var feedrate = $('#jogfeedxy').val() * 60;
       console.log('Jog Distance', dist);
       sendGcode('G91\nG0 F'+ feedrate +' X'+ dist + '\nG90\n');
     }
  });

  $('#yP').on('click', function() {
     if (isConnected) {
       var dist = $('input[name=stp]:checked', '#stepsize').val();
       var feedrate = $('#jogfeedxy').val() * 60;
       console.log('Jog Distance', dist);
       sendGcode('G91\nG0 F'+ feedrate +' Y'+ dist + '\nG90\n');
     }
  });

  $('#zP').on('click', function() {
     if (isConnected) {
       var dist = $('input[name=stp]:checked', '#stepsize').val();
       var feedrate = $('#jogfeedz').val() * 60;
       console.log('Jog Distance', dist);
       sendGcode('G91\nG0 F'+ feedrate +' Z'+ dist + '\nG90\n');
     }
  });

  $('#xM').on('click', function() {
     if (isConnected) {
       var dist = $('input[name=stp]:checked', '#stepsize').val();
       var feedrate = $('#jogfeedxy').val() * 60;
       console.log('Jog Distance', dist);
       sendGcode('G91\nG0 F'+ feedrate +' X-'+ dist + '\nG90\n');
     }
  });

  $('#yM').on('click', function() {
     if (isConnected) {
       var dist = $('input[name=stp]:checked', '#stepsize').val();
       var feedrate = $('#jogfeedxy').val() * 60;
       console.log('Jog Distance', dist);
       sendGcode('G91\nG0 F'+ feedrate +' Y-'+ dist + '\nG90\n');
     }
  });

  $('#zM').on('click', function() {
     if (isConnected) {
       var dist = $('input[name=stp]:checked', '#stepsize').val();
       var feedrate = $('#jogfeedz').val() * 60;
       console.log('Jog Distance', dist);
       sendGcode('G91\nG0 F'+ feedrate +' Z-'+ dist + '\nG90\n');
     }
  });

  // Jog Widget
  var lastJogSize = parseFloat(localStorage.getItem("lastJogSize") || 10);

  $('#stepsize input').on('change', function() {
    var newJogSize = $('input[name=stp]:checked', '#stepsize').val();
     printLog('Jog will use ' + newJogSize + ' mm per click', successcolor, "jog");

     $(".stepsizeval").empty();
     $(".stepsizeval").html(newJogSize + 'mm');
     // Save the setting to local storage once it's been set.
     localStorage.setItem("lastJogSize", newJogSize.toString());
  });

  // Now set the initial setting from the saved settings
  $("input[name=stp][value='"+lastJogSize+"']").click();

  var jogfeedxy = parseFloat(localStorage.getItem("jogFeedXY") || 30);
  var jogfeedz = parseFloat(localStorage.getItem("jogFeedZ") || 5);
  $("#jogfeedxy").val(jogfeedxy);
  $("#jogfeedz").val(jogfeedz);

  $("#jogfeedxy").on('change', function() {
    var jogfeedxy = parseFloat($("#jogfeedxy").val());
    localStorage.setItem("jogFeedXY", jogfeedxy.toString());
    printLog('Jog xy speed settings saved', successcolor, "jog");
  });

  $("#jogfeedz").on('change', function() {
    var jogfeedz = parseFloat($("#jogfeedz").val());
    localStorage.setItem("jogFeedZ", jogfeedz.toString());
    printLog('Jog z speed settings saved', successcolor, "jog");
  });
}

function saveJogSpeeds() {
  var jogfeedxy = parseFloat($("#jogfeedxy").val());
  var jogfeedz = parseFloat($("#jogfeedz").val());

  localStorage.setItem("jogFeedXY", jogfeedxy.toString());
  localStorage.setItem("jogFeedZ", jogfeedz.toString());

  printLog('Jog speed settings saved', successcolor, "jog");

}
