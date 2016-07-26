function initLocalStorage() {
  var settingsOpen = document.getElementById('jsonFile');
  settingsOpen.addEventListener('change', restoreSettingsLocal, false);
}


localParams = ['rapidspeed', 'autoClose', 'subnet1', 'subnet2', 'subnet3',  'smoothieIp', 'laserXMax', 'laserYMax', 'spotSize', 'startgcode', 'laseron', 'laseroff', 'lasermultiply', 'homingseq', 'endgcode', 'imagePosition', 'useNumPad', 'useVideo', 'cncMode'];

function saveSettingsLocal() {
    for (i = 0; i < localParams.length; i++) {
        var val = $('#' + localParams[i]).val(); // Read the value from form
        console.log('Saving: ', localParams[i], ' : ', val);
        printLog('Saving: ' + localParams[i] + ' : ' + val, successcolor);
        localStorage.setItem(localParams[i], val);
    };
    printLog('<b>Saved Settings: <br>NB:</b> Please refresh page for settings to take effect', errorcolor, "settings");
};

function loadSettingsLocal() {
    for (i = 0; i < localParams.length; i++) {
        var val = localStorage.getItem(localParams[i]);
        if (val) {
            console.log('Loading: ', localParams[i], ' : ', val);
            $('#' + localParams[i]).val(val) // Set the value to Form from Storage
        };
    };
};

function backupSettingsLocal() {
  var json = JSON.stringify(localStorage)
  var blob = new Blob([json], {type: "application/json"});
    invokeSaveAsDialog(blob, 'laserweb-settings-backup.json');

};

function checkSettingsLocal() {
  $("#settingsstatus").hide();
  var anyissues = false;
  var anywarn = false;
  printLog('<b>Checking whether you have configured LaserWeb :</b><p>', msgcolor, "settings");
  for (i = 0; i < localParams.length; i++) {
    field = localParams[i]
    var val = $('#' + localParams[i]).val(); // Read the value from form
    if(val) {
      if (field.indexOf('subnet1') == 0 || field.indexOf('subnet2') == 0 || field.indexOf('subnet3') == 0 || field.indexOf('smoothieIp') == 0) {
        // Dont print these, just saved as easy reference, not critical in the least
      } else {
        // printLog('Checking : ' + localParams[i] + ' : ' + val, successcolor, "settings");
      };
    } else {
      if (field.indexOf('subnet1') == 0 || field.indexOf('subnet2') == 0 || field.indexOf('subnet3') == 0 || field.indexOf('smoothieIp') == 0) {
        // printLog('Checking : ' + localParams[i] + ' : OPTIONAL ' + val, warncolor, "settings");
        // anywarn = true;
      } else if (field.indexOf('laseron') == 0 || field.indexOf('laseroff') == 0 || field.indexOf('subnet1') == 0 || field.indexOf('subnet2') == 0 || field.indexOf('subnet3') == 0 || field.indexOf('smoothieIp') == 0  || field.indexOf('startgcode') == 0  || field.indexOf('endgcode') == 0) {
        printLog('Checking : ' + localParams[i] + ' : OPTIONAL ' + val, warncolor, "settings");
        anywarn = true;
      } else if (field.indexOf('subnet1') == 0 || field.indexOf('subnet2') == 0 || field.indexOf('subnet3') == 0 || field.indexOf('smoothieIp') == 0) {
        printLog('Checking : ' + localParams[i] + ' : Optional ETHERNET ' + val, warncolor, "settings");
        anywarn = true;
      } else {
        printLog('Checking : ' + localParams[i] + ' : NOT SET ' + val, errorcolor, "settings");
        anyissues = true;
      }
    }
  };
  if (anyissues) {
    printLog('<b>MISSING CONFIG: You need to configure LaserWeb for your setup. </b>. Click <kbd>Settings <i class="fa fa-cogs"></i></kbd> on the left, and work through all the options', errorcolor, "settings");
    $("#togglesettings").click();
    $("#settingsstatus").show();
  }

  if (!anyissues && anywarn) {
    printLog('<b>WARNINGS in Config: You might need to configure LaserWeb for your setup, depending on your controller.</b>  Click <kbd>Settings <i class="fa fa-cogs"></i></kbd> on the left.  If you already did, then ignore this warning, its probably related to one of the Optional Settings which you then probably dont need anyway (: ', warncolor, "settings");
    $("#settingsstatus").hide();
  }

  // Check from version 20160726 - new spotsize feature
  var spotsize2 = localStorage.getItem("spotSize")
  if (spotsize2 == "0.1") {
    $('#statusmodal').modal('show');
    $('#statusTitle').empty();
    $('#statusTitle').html('New feature needs configuration!');
    $('#statusBody').empty();
    $('#statusBody2').empty();
    $('#statusBody').html('In this version of LaserWeb, we added a new function that actually matches raster engraving resolution to the size of your laser beam (in previous version it matched image resolution)  Most of you have the laserbeam set as 0.1mm in <kbd>Settings <i class="fa fa-cogs"></i></kbd>.  However, most lasers actually work better with a slightly defocussed spot for engraving.  Thus a 0.5mm spot size for example, may work better.  It is up to you to determine the best value for your machine, but note that very small spot sizes needs a LOT more memory/time/data/gcode/machine-time to process. ' );
    var template2 = `
    <hr>Enter a Laser Beam Diameter below:

      <div class="form-group">
        <label for="SpotSize" class="control-label">Laser Beam Diameter <span style="color:red;">(Required)</span></label>
        <div class="input-group">
          <input type="text" class="form-control numpad" id="spotSize2" placeholder="0.5">
          <span class="input-group-addon">mm</span>
        </div>
      </div>

    <button type="button" class="btn btn-lg btn-success" data-dismiss="modal" id="savespotsize">Save</button>
    <hr>
    Note: We'll only ask on startup until you set it to something other than the default.  In future, adjust it from <kbd>Settings <i class="fa fa-cogs"></i></kbd> on the left
    `
    $('#statusBody2').html(template2);

    $('#savespotsize').on('click', function() {
      printLog("Updating Spot Size", msgcolor, "settings")
      localStorage.setItem("spotSize", $('#spotSize2').val());
      $('#spotSize').val($('#spotSize2').val())
    });

  }

};

function restoreSettingsLocal(evt) {
  console.log('Inside Restore');
   var input, file, fr;

    console.log('event ', evt)
     file = evt.target.files[0];
     fr = new FileReader();
     fr.onload = receivedText;
     fr.readAsText(file);
   }

   function receivedText(e) {
     lines = e.target.result;
     var o = JSON.parse(lines);
     for (var property in o) {
       if (o.hasOwnProperty(property)) {
           localStorage.setItem(property, o[property]);
       }
   }
   loadSettingsLocal();
   }
