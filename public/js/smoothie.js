function runCommand(cmd, silent) {

    var host = $('#spjsip').val();
    if (host) {
        console.log('Connecting Smoothie at ', host);
    } else {
        host = '127.0.0.1'
    }
    // Get some values from elements on the page:
    cmd += "\n";
    url = silent ? "http://" + host + "/command_silent" : "http://" + host + "/command";
    // Send the data using post
    var posting = $.post(url, cmd);
    // Put the results in a div
    if (!silent) {
        posting.done(function(data) {
            $("#result").empty();
            $.each(data.split('\n'), function(index) {
                printLog(this, msgcolor)
                    //$("#console").append(this + '<br/>');
            });
        });
    }
}

function getTemperature() {
    //runCommand("M105", false);
    var regex_temp = /(B|T(\d*)):\s*([+]?[0-9]*\.?[0-9]+)?/gi;

    //    var test_data = "ok T:23.3 /0.0 @0 T1:23.4 /0.0 @0 B:24.8 /0.0 @0 P:29.4 /0.0 @0";
    var posting = $.post("http://" + host + "/command", "M105\n");
    posting.done(function(data) {
        while ((result = regex_temp.exec(data)) !== null) {
            var tool = result[1];
            var value = result[3];

            if (tool == "T") {
                //$("#heat_actual_t0").html(value + "&deg;C");
            } else if (tool == "T1") {
                //$("#heat_actual_t1").html(value + "&deg;C");
            }
            if (tool == "B") {
                //$("#heat_actual_bed").html(value + "&deg;C");

            }
        }
    });
}
