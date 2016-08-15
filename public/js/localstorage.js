function initLocalStorage() {
    var settingsOpen = document.getElementById('jsonFile');
    settingsOpen.addEventListener('change', restoreSettingsLocal, false);
}

// FIXME
// A way to access all of the settings
// $("#settings-menu-panel input, #settings-menu-panel textarea, #settings-menu-panel select, #ethernetConnect input").each(function() {console.log(this.id + ": " + $(this).val())});

localParams = [
  // [paramName, required]
  ['rapidspeed', true],
  ['subnet1', false],
  ['subnet2', false],
  ['subnet3', false],
  ['smoothieIp', false],
  ['laserXMax', true],
  ['laserYMax', true],
  ['spotSize', true],
  ['startgcode', true],
  ['laseron', false],
  ['laseroff', false],
  ['lasermultiply', true],
  ['homingseq', true],
  ['endgcode', true],
  ['imagePosition', true],
  ['useNumPad', true],
  ['useVideo', true],
  ['cncMode', true],
  ['webcamUrl', false],
  ['defaultDPI', false],
  ['illustratorDPI', false],
  ['inkscapeDPI', false]
];

function saveSettingsLocal() {
  console.group("Saving settings to LocalStorage");
  for (i = 0; i < localParams.length; i++) {
      var localParam = localParams[i];
      var paramName = localParam[0];
      var val = $('#' + paramName).val(); // Read the value from form
      console.log('Saving: ' + paramName + ' : ' + val);
      printLog('Saving: ' + paramName + ' : ' + val, successcolor);
      localStorage.setItem(paramName, val);
  }
  printLog('<b>Saved Settings: <br>NB:</b> Please refresh page for settings to take effect', errorcolor, "settings");
  console.groupEnd();
};

function loadSettingsLocal() {
  console.group("Loading settings from LocalStorage")
  for (i = 0; i < localParams.length; i++) {
    var localParam = localParams[i];
    var paramName = localParam[0];
    var val = localStorage.getItem(paramName);

    if (val) {
      console.log('Loading: ' + paramName + ' : ' + val);
      $('#' + paramName).val(val);// Set the value to Form from Storage
    } else {
      console.log('Not in local storage: ' +  paramName);
    }
  }
  console.groupEnd();
};

function backupSettingsLocal() {
  var json = JSON.stringify(localStorage)
  var blob = new Blob([json], {type: "application/json"});
  invokeSaveAsDialog(blob, 'laserweb-settings-backup.json');
};

function checkSettingsLocal() {
  $("#settingsstatus").hide();
  var anyissues = false;
  printLog('<b>Checking whether you have configured LaserWeb :</b><p>', msgcolor, "settings");
  for (i = 0; i < localParams.length; i++) {
    var localParam = localParams[i];
    var paramName = localParam[0];
    var paramRequired = localParam[1];
    var val = $('#' + localParams[i]).val(); // Read the value from form

    if (!val && paramRequired) {
      printLog('Missing required setting: ' + paramName, errorcolor, "settings");
      anyissues = true;
    
    } else if (!val && !paramRequired) {
      printLog('Missing optional setting: ' + paramName, warncolor, "settings");
    } else {
      printLog('Found setting: ' + paramName + " : " + val, msgcolor, "settings");
    }
  }


  if (anyissues) {
    printLog('<b>MISSING CONFIG: You need to configure LaserWeb for your setup. </b>. Click <kbd>Settings <i class="fa fa-cogs"></i></kbd> on the left, and work through all the options', errorcolor, "settings");
    $("#togglesettings").click();
    $("#settingsstatus").show();
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
};

function receivedText(e) {
  lines = e.target.result;
  var o = JSON.parse(lines);
  for (var property in o) {
    if (o.hasOwnProperty(property)) {
     localStorage.setItem(property, o[property]);
    } else {
      // I'm not sure this can happen... I want to log this if it does!
      console.log("Found a property " + property + " which does not belong to iteself.");
    }
  }
  loadSettingsLocal();
};

