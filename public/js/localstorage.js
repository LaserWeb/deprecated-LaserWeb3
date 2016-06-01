function initLocalStorage() {
  var settingsOpen = document.getElementById('jsonFile');
  settingsOpen.addEventListener('change', restoreSettingsLocal, false);
}


localParams = ['spjsip', 'laserXMax', 'laserYMax', 'spotSize', 'rapidspeed', 'startgcode', 'laseron', 'laseroff', 'lasermultiply', 'homingseq', 'endgcode', 'useOffset', 'imagePosition', 'useNumPad', 'useVideo'];

function saveSettingsLocal() {
    for (i = 0; i < localParams.length; i++) {
        var val = $('#' + localParams[i]).val(); // Read the value from form
        console.log('Saving: ', localParams[i], ' : ', val);
        printLog('Saving: ' + localParams[i] + ' : ' + val, successcolor);
        localStorage.setItem(localParams[i], val);
    };
    printLog('<b>Saved Settings: <br>NB:</b> Please refresh page for settings to take effect', errorcolor);
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
  printLog('<hr><b>Checking whether you have configured LaserWeb :</b><p>', msgcolor);
  for (i = 0; i < localParams.length; i++) {
    var val = $('#' + localParams[i]).val(); // Read the value from form
    if(val) {
      printLog('Checking : ' + localParams[i] + ' : ' + val, successcolor);
    } else {
      field = localParams[i]
      if (field.indexOf('laseron') == 0 || field.indexOf('laseroff') == 0 ) {
        printLog('Checking : ' + localParams[i] + ' : OPTIONAL ' + val, warncolor);
        anywarn = true;
      } else {
        printLog('Checking : ' + localParams[i] + ' : NOT SET ' + val, errorcolor);
        anyissues = true;
      }
    }
  };
  if (anyissues) {
    printLog('<b>MISSING CONFIG: You need to configure LaserWeb for your setup. </b><hr>', errorcolor);
    $("#togglesettings").click();
    $("#settingsstatus").show();
  }

  if (!anyissues && anywarn) {
    printLog('<b>WARNINGS in Config: You might need to configure LaserWeb for your setup, depending on your controller.</b><hr>', warncolor);
    $("#settingsstatus").hide();
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
