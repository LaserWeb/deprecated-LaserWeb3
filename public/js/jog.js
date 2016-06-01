function initJog() {

    $('#bounding').on('click', function() {
      $('#console').append('<span class="pf" style="color: #000000;"><b>Drawing Bounding Box...</b></span><br>');
      $('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());
      sendGcode('G90\nG0 X'+$('#BBXMIN').val()+' Y'+$('#BBYMIN').val()+' F2000\nG0 X'+$('#BBXMAX').val()+' Y'+$('#BBYMIN').val()+' F2000\nG0 X'+$('#BBXMAX').val()+' Y'+$('#BBYMAX').val()+' F2000\nG0 X'+$('#BBXMIN').val()+' Y'+$('#BBYMAX').val()+' F2000\nG0 X'+$('#BBXMIN').val()+' Y'+$('#BBYMIN').val()+' F2000\nG90');
    });



    $('#xP').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 X'+ dist + '\nG90\n');
       }
    });

    $('#yP').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 Y'+ dist + '\nG90\n');
       }
    });

    $('#zP').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 Z'+ dist + '\nG90\n');
       }
    });

    $('#xM').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 X-'+ dist + '\nG90\n');
       }
    });

    $('#yM').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 Y-'+ dist + '\nG90\n');
       }
    });

    $('#zM').on('click', function() {
       if (isConnected) {
         var dist = $('input[name=stp]:checked', '#stepsize').val()
         console.log('Jog Distance', dist);
         sendGcode('G91\nG0 Z-'+ dist + '\nG90\n');
       }
    });

    // Jog Widget
    $('#stepsize input').on('change', function() {
       printLog('Jog will use ' +$('input[name=stp]:checked', '#stepsize').val() + ' mm per click', successcolor);
       $(".stepsizeval").empty();
       $(".stepsizeval").html($('input[name=stp]:checked', '#stepsize').val() + 'mm');
    });



}
