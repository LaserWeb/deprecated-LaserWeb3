function initSmoothie() {
  $('#connectVia').change(function() {
    var connectVia = $('#connectVia').val()
    if (connectVia == "USB") {
        $('#usbConnect').show();
        $('#ethernetConnect').hide();
    } else if (connectVia == "Ethernet") {
      $('#usbConnect').hide();
      $('#ethernetConnect').show();
    }
  });

  $('.stop-propagation').on('click', function (e) {
    e.stopPropagation();
});

};

function checkIsIPV4(entry) {
  var blocks = entry.split(".");
  if(blocks.length === 4) {
    return blocks.every(function(block) {
      return parseInt(block,10) >=0 && parseInt(block,10) <= 255;
    });
  }
  return false;
}

function scanSubnet() {
  $("#foundIp").empty();
  var subnet1 = $("#subnet1").val();
  var subnet2 = $("#subnet2").val();
  var subnet3 = $("#subnet3").val();
  if (!subnet1) {
    subnet1 = "192";
  }
  if (!subnet2) {
    subnet2 = "168";
  }
  if (!subnet3) {
    subnet3 = "137";
  }
  var subnet = subnet1 + '.' +  subnet2 + '.' + subnet3 + '.' ;

  for (var ctr = 1; ctr < 255; ctr++) {
    var ip = subnet + ctr
    var result = scanIP(ip)
  }
  saveSettingsLocal();

};

function  scanIP(ip) {
  printLog('Checking: '+ip, successcolor)
  var cmd = "version\n";
  var url = "http://" + ip + "/command";
  // Send the data using post
  var posting = $.post(url, cmd);
  // Put the results in a div
  posting.done(function(data) {

      $.each(data.split('\n'), function(index) {
          printLog(this, msgcolor)

          var pattern = /Build version: (.*), Build date: (.*), MCU: (.*), System Clock: (.*)/;

           // test the pattern
           var matches = this.match(pattern);

           if (matches) {
               // split branch-hash on dash
               var branchgit = matches[1].split('-');

               var branch = branchgit[0];
               var hash   = branchgit[1];
               var date   = matches[2];
               var mcu    = matches[3];
               var clock  = matches[4];
               $("#foundIp").append("<div class='panel panel-primary'><div class='panel-heading'><h3 class='panel-title'><a onclick='setIP(\""+ip+"\")' href='#'>"+ip+"</a></h3></div><div class='panel-body'>MCU: <kbd>"+mcu+ " @ " + clock + "</kbd><br>FW: <kbd>" + branch + " " + hash + "</kbd><br>FW date: <kbd>" + date + "</kbd></div></div>");

           }

              //$("#console").append(this + '<br/>');
      });
    });
  // $.ajax({
  //  type: 'POST',
  //     url: 'http://' +ip + '/command',
  //     data: "version",
  //     success: function(data, textStatus, XMLHttpRequest) {
  //       console.log(data, textStatus, XMLHttpRequest);
  //       if (textStatus = '200') {
  //         // alert('Found board at' + ip)
  //         printLog('Found '+ip, successcolor)
  //         $("#foundIp").append(ip);
  //       }
  //     },
  //     error: function(XMLHttpRequest, textStatus, errorThrown) {
  //       console.log(XMLHttpRequest, textStatus, errorThrown)
  //       printLog('Nothing on '+ip, errorcolor)
  //     }
  // });
}


function setIP(ipaddr) {
  $("#smoothieIp").val(ipaddr);
}


function runCommand(cmd, silent) {
  var host = $('#smoothieIp').val();

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
    var host = $('#smoothieIp').val();
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
