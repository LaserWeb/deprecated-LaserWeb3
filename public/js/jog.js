function initJog() {

    $('#bounding').on('click', function() {
        var laserxmax = lw.viewer.grid.userData.size.x;
        var laserymax = lw.viewer.grid.userData.size.y;
        var bbox2 = new THREE.Box3().setFromObject(object);
        console.log('bbox for Draw Bounding Box: '+ object +' Min X: ', (bbox2.min.x + (laserxmax / 2)), '  Max X:', (bbox2.max.x + (laserxmax / 2)), 'Min Y: ', (bbox2.min.y + (laserymax / 2)), '  Max Y:', (bbox2.max.y + (laserymax / 2)));
        lw.log.print("Drawing Bounding Box...", 'message', "jog");
        var moves = `
        G90\n
        G0 X`+(bbox2.min.x + (laserxmax / 2))+` Y`+(bbox2.min.y + (laserymax / 2))+` F2000\n
        G0 X`+(bbox2.max.x + (laserxmax / 2))+` Y`+(bbox2.min.y + (laserymax / 2))+` F2000\n
        G0 X`+(bbox2.max.x + (laserxmax / 2))+` Y`+(bbox2.max.y + (laserymax / 2))+` F2000\n
        G0 X`+(bbox2.min.x + (laserxmax / 2))+` Y`+(bbox2.max.y + (laserymax / 2))+` F2000\n
        G0 X`+(bbox2.min.x + (laserxmax / 2))+` Y`+(bbox2.min.y + (laserymax / 2))+` F2000\n
        G90\n`
        sendGcode(moves)
    });

    $('#xP').on('click', function() {
        if (isConnected) {
            var dist = $('input[name=stp]:checked', '#stepsize').val()
            var feedrate = $('#jogfeedxy').val() * 60
            console.log('Jog Distance', dist);
            sendGcode('G91\nG0 F'+ feedrate +' X'+ dist + '\nG90\n');
        }
    });

    $('#yP').on('click', function() {
        if (isConnected) {
            var dist = $('input[name=stp]:checked', '#stepsize').val()
            var feedrate = $('#jogfeedxy').val() * 60
            console.log('Jog Distance', dist);
            sendGcode('G91\nG0 F'+ feedrate +' Y'+ dist + '\nG90\n');
        }
    });

    $('#zP').on('click', function() {
        if (isConnected) {
            var dist = $('input[name=stp]:checked', '#stepsize').val()
            var feedrate = $('#jogfeedz').val() * 60
            console.log('Jog Distance', dist);
            sendGcode('G91\nG0 F'+ feedrate +' Z'+ dist + '\nG90\n');
        }
    });

    $('#xM').on('click', function() {
        if (isConnected) {
            var dist = $('input[name=stp]:checked', '#stepsize').val()
            var feedrate = $('#jogfeedxy').val() * 60
            console.log('Jog Distance', dist);
            sendGcode('G91\nG0 F'+ feedrate +' X-'+ dist + '\nG90\n');
        }
    });

    $('#yM').on('click', function() {
        if (isConnected) {
            var dist = $('input[name=stp]:checked', '#stepsize').val()
            var feedrate = $('#jogfeedxy').val() * 60
            console.log('Jog Distance', dist);
            sendGcode('G91\nG0 F'+ feedrate +' Y-'+ dist + '\nG90\n');
        }
    });

    $('#zM').on('click', function() {
        if (isConnected) {
            var dist = $('input[name=stp]:checked', '#stepsize').val()
            var feedrate = $('#jogfeedz').val() * 60
            console.log('Jog Distance', dist);
            sendGcode('G91\nG0 F'+ feedrate +' Z-'+ dist + '\nG90\n');
        }
    });

    // Jog Widget
    var lastJogSize = parseFloat(lw.store.get("lastJogSize") || 10);

    $('#stepsize input').on('change', function() {
        var newJogSize = $('input[name=stp]:checked', '#stepsize').val();
        lw.log.print('Jog will use ' + newJogSize + ' mm per click', 'success', "jog");

        $(".stepsizeval").empty();
        $(".stepsizeval").html(newJogSize + 'mm');
        // Save the setting to local storage once it's been set.
        lw.store.set("lastJogSize", newJogSize.toString());
    });

    // Now set the initial setting from the saved settings
    $("input[name=stp][value='"+lastJogSize+"']").click();

    var jogfeedxy = parseFloat(lw.store.get("jogFeedXY") || 30);
    var jogfeedz = parseFloat(lw.store.get("jogFeedZ") || 5);
    $("#jogfeedxy").val(jogfeedxy);
    $("#jogfeedz").val(jogfeedz);

    $("#jogfeedxy").on('change', function() {
        var jogfeedxy = parseFloat($("#jogfeedxy").val());
        lw.store.set("jogFeedXY", jogfeedxy.toString());
        lw.log.print('Jog xy speed settings saved', 'success', "jog");
    });

    $("#jogfeedz").on('change', function() {
        var jogfeedz = parseFloat($("#jogfeedz").val());
        lw.store.set("jogFeedZ", jogfeedz.toString());
        lw.log.print('Jog z speed settings saved', 'success', "jog");
    });

};

function saveJogSpeeds() {
    var jogfeedxy = parseFloat($("#jogfeedxy").val());
    var jogfeedz = parseFloat($("#jogfeedz").val());

    lw.store.set("jogFeedXY", jogfeedxy.toString());
    lw.store.set("jogFeedZ", jogfeedz.toString());

    lw.log.print('Jog speed settings saved', 'success', "jog");

};
