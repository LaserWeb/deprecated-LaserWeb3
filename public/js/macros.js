function macrosInit() {

  $('#macroEdit').editableTableWidget({
      preventColumns: [1, 4, 5, 6]
  });


  // Show/Hide Macro Pad
  $('#togglemacro').on('click', function() {
    if ($( "#togglemacro" ).hasClass( "btn-primary" )) {
      $('#macro_container').hide();
      $('#renderArea').show();
      $('#viewer_container').show();
      $("#togglemacro").removeClass("btn-primary");
      $("#togglemacro").addClass("btn-default");
    } else {
      $('#macro_container').show();
      $('#renderArea').hide();
      $('#viewer_container').hide();
      $("#togglemacro").addClass("btn-primary");
      $("#togglemacro").removeClass("btn-default");
    }
  });

  $('#closemacro').on('click', function() {
    if ($( "#togglemacro" ).hasClass( "btn-primary" )) {
      $('#macro_container').hide();
      $('#renderArea').show();
      $('#viewer_container').show();
      $("#togglemacro").removeClass("btn-primary");
      $("#togglemacro").addClass("btn-default");
    } else {
      $('#macro_container').show();
      $('#renderArea').hide();
      $('#viewer_container').hide();
      $("#togglemacro").addClass("btn-primary");
      $("#togglemacro").removeClass("btn-default");
    }
  });

  // Show/Hide Macro Pad
  $('#editmacro').on('click', function() {
      $('#macrostatus').hide();
      printLog('Editing Macros', msgcolor, "macro");
      $("#macrostbody").empty();
      readMacros();
      $('#macro_pad').toggle();
      $('#macro_settings').toggle();
      $('#editmacro').hide();
      $('#savemacro').show();
      // $('#viewer_container').toggle();
      // $('#renderArea').toggle();
  });

  $('#addrow').on('click', function() {
      var oTable = document.getElementById('macroEdit');
      //gets rows of table
      var rowLength = oTable.rows.length;
      var nextNum = rowLength + 0; // (not +1 since rows.length includes the header anyway (; )
      $('#macroEdit > tbody:last-child').append('<tr><td></td><td>...Label...</td><td>G0 X100 (for example)</td><td><select id="colorselector'+ nextNum+'"><option value="#DC143C" data-color="#DC143C">crimson</option><option value="#FF8C00" data-color="#FF8C00">darkorange</option><option value="#FFD700" data-color="#FFD700">gold</option><option value="#6495ED" data-color="#6495ED">cornflowerblue</option><option value="#87CEFA" data-color="#87CEFA">lightskyblue</option><option value="#32CD32" data-color="#32CD32">limegreen</option></select></td><td><span id="colorValue'+nextNum+'">#DC143C</span></td><td><button type="button" class="btn btn-sm btn-default" onclick="deleteRow(this);"><i class="fa fa-times"></i></button></td></tr>');
      $('#macroEdit').editableTableWidget({
          preventColumns: [1, 4, 5, 6]
      });
       console.log('Setting button ', i)
       $('#colorselector'+nextNum).colorselector({
       callback: function (value, color, title) {
           console.log('Setting Color ', nextNum, value, color, title);
           $("#colorValue"+nextNum).html(value);
       }
      });
  });

  $('#savemacro').on('click', function() {
    saveMacros();
  });



readMacros();
}


// Table Auto Numbering Helper from http://jsfiddle.net/DominikAngerer/yx275pyd/2/
function runningFormatter(value, row, index) {
    return index;
}

// Table Delete row with onclick="deleteRow(this)
function deleteRow(t) {
    var row = t.parentNode.parentNode;
    document.getElementById("macroEdit").deleteRow(row.rowIndex);
    console.log(row);
}

function saveMacros() {
  printLog('Saving Macros', msgcolor, "macro");
  $('#macro_pad').toggle();
  $('#macro_settings').toggle();
  $('#savemacro').hide();
  $('#editmacro').show();
  // Cleanup
  for (i = 1; i < 24; i++) {
      var name = 'macro' + i;
      localStorage.removeItem(name);
  };
  //gets table
  var oTable = document.getElementById('macroEdit');

  //gets rows of table
  var rowLength = oTable.rows.length;

  //loops through rows
  for (i = 1; i < rowLength; i++) {
      var macro = [];
      //gets cells of current row
      var oCells = oTable.rows.item(i).cells;

      //gets amount of cells of current row
      var cellLength = oCells.length;

      //loops through each cell in current row
      for (var j = 0; j < 3; j++) {

          // get your cell info here

          var cellVal = oCells.item(j).innerHTML;
          console.log(cellVal);
          macro.push(cellVal);
      };

      var colorVal = $("#colorValue"+i).html();
      macro.push(colorVal);
      var name = 'macro' + i;
      saveSetting(name, macro);
  };

  // Lets fire off initial Populate
  readMacros();
}

function readMacros() {
    $("#macro_pad").empty();
    $('#macro_pad').append('<h4 >Macro Buttons</h4>');
    for (i = 1; i < 24; i++) {
        var name = 'macro' + i;
        var val = loadSetting(name);
        if (val) {
            // Found a macro, so lets hide the error message
            $('#macrostatus').hide();
            var details = val.split(',');
            var label = details[1];
            var gcode = String(details[2]);
            var color = String(details[3]);
            console.log('Setting button ', i)
            $('#macroEdit > tbody:last-child').append('<tr><td></td><td>' + details[1] + '</td><td>' + details[2] + '</td><td><select id="colorselector'+ i +'"><option value="#DC143C" data-color="#DC143C">crimson</option><option value="#FF8C00" data-color="#FF8C00">darkorange</option><option value="#FFD700" data-color="#FFD700">gold</option><option value="#6495ED" data-color="#6495ED">cornflowerblue</option><option value="#87CEFA" data-color="#87CEFA">lightskyblue</option><option value="#32CD32" data-color="#32CD32">limegreen</option></select></td><td><span id="colorValue'+i+'"></span></td><td><button type="button" class="btn btn-sm btn-default" onclick="deleteRow(this);"><i class="fa fa-times"></i></button></td></tr>');
            $("#colorValue"+i).html(color);
            var valname = '#colorValue' + i;
            $('#colorselector'+i).colorselector({
              callback: function (value, color, title) {
                var va = 'macro' + i;
                console.log('Setting Color ', valname, value, color, title);
                $(valname).html(value);
              }
           });
           $('#colorselector'+i).colorselector("setColor", color);
              if (i == 1) {
                  $('#macro_pad').append('<button type="button" class="btn btn-lg btn-default" id="macro' + i + '" style="background-color: '+color+';" onclick="sendGcode(' + '\'' + gcode + '\'' + ')">' + label + '</button>');
              } else if (i == 6 || i == 12 || i == 18) {
                  $('#macro_pad').append('<button type="button" class="btn btn-lg btn-default" id="macro' + i + '" style="background-color: '+color+';"  onclick="sendGcode(' + '\'' + gcode + '\'' + ')">' + label + '</button>');
              } else {
                  $('#macro_pad').append('<button type="button" class="btn btn-lg btn-default" id="macro' + i + '" style="background-color: '+color+';"  onclick="sendGcode(' + '\'' + gcode + '\'' + ')">' + label + '</button>');
              }
            $('#macro_pad').append('</div>'); // close the last row
        };
        $('#macroEdit').editableTableWidget({
            preventColumns: [1, 4, 5, 6]
        });
    };
}
