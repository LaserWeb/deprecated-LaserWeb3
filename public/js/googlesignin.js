var googleUser = {};

var startApp = function() {
    console.log('Starting GSingIn')
    if (typeof(gapi) !== "undefined")  {
      gapi.load('auth2', function(){
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        auth2 = gapi.auth2.init({
          client_id: '1086441811451-4nmidqbqq8tve1qqa592uq1hs04kl5sl.apps.googleusercontent.com',
          cookiepolicy: 'single_host_origin',
          // Request scopes in addition to 'profile' and 'email'
          scope: 'https://www.googleapis.com/auth/drive'
        });

        attachSignin(document.getElementById('g-login'));
        printLog('Enabled Google Drive integration', successcolor);

      });
      gapi.load('picker', {'callback': onPickerApiLoad});
    } else {
      printLog('Could not enable Google Drive Integration: Does this device have working internet access?', warncolor);
      $('#g-login').addClass('disabled');
    }

};

var appId = "laserweb2";
var scope = ['https://www.googleapis.com/auth/drive'];
var pickerApiLoaded = false;
var oauthToken;
var clientId = "1086441811451-4nmidqbqq8tve1qqa592uq1hs04kl5sl.apps.googleusercontent.com"

function onPickerApiLoad() {
      pickerApiLoaded = true;
      createPicker();
}



function createPicker() {
      if (pickerApiLoaded && oauthToken) {
        // var view = new google.picker.View(google.picker.ViewId.DOCS)
        //     .setIncludeFolders(true)
        // view.setQuery('owner:me');
        var view = new google.picker.DocsView()
            .setIncludeFolders(true)
        var picker = new google.picker.PickerBuilder()
            .setAppId(appId)
            .setOAuthToken(oauthToken)
            .addView(view)
            .addView(new google.picker.DocsUploadView())
            .setCallback(pickerCallback)
            .build();
         picker.setVisible(true);
      }
    }

    function pickerCallback(data) {
     if (data.action == google.picker.Action.PICKED) {
       var fileId = data.docs[0].id;
       var fileName = data.docs[0].name;
      //  alert('The user selected: ' + fileId);
      getFileContent(fileId, fileName)
     }
   }

function attachSignin(element) {
    console.log(element.id);
    auth2.attachClickHandler(element, {},
        function(googleUser) {
          $('#g-login').hide();
          $('#g-logout').show();
          $('#g-refresh').show();
          $('#g-open').show();
          $('#fullname').html( 'Logged in as:<br> <b>' + googleUser.getBasicProfile().getName() + '</b>');
          $("#userpic").attr("src", googleUser.getBasicProfile().getImageUrl());
          gapi.client.load('drive', 'v3', function(){
             console.log('Drive Loaded');
            //  listFiles();
          });
          // $('#googledrive').modal('show');
          oauthToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
          createPicker();
        }, function(error) {
          console.log(JSON.stringify(error, undefined, 2));
        });
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
  $('#g-login').show();
  $('#g-logout').hide();
  $('#g-refresh').hide();
  $('#g-open').hide();
  $('#fullname').html('Please Sign In:');
  $("#userpic").attr("src", 'css/user64.gif');
}

/**
* Print files.
*/
// function listFiles() {
//  $('#fileList').empty();
//  var request = gapi.client.drive.files.list({
//      'fields': "nextPageToken, files(id, name)"
//    });
//
//    request.execute(function(resp) {
//
//     //  $('#fileList').append('<B>Google Drive Files:</b><p>');
//      var files = resp.files;
//      if (files && files.length > 0) {
//        for (var i = 0; i < files.length; i++) {
//          var file = files[i];
//          console.log('GDrive: Found ', file)
//          if (file.name.match(/.dxf$/i) || file.name.match(/.svg$/i) || file.name.match(/.gcode$/i) || file.name.match(/.png$/i) || file.name.match(/.jpg$/i) || file.name.match(/.jpeg$/i) || file.name.match(/.bmp$/i)  || file.name.match(/.jpg$/i) ) {
//            var idstring = String(file.id)
//            // Filetype Icons
//            if (file.name.match(/.dxf$/i)) {
//               $('#fileList').append("<span class='fa-stack'><i class='fa fa-file-o fa-stack-1x'></i><strong class='fa-stack-1x icon-text'>DX</strong></span>");
//            } else if (file.name.match(/.svg$/i)) {
//               $('#fileList').append("<span class='fa-stack'><i class='fa fa-file-o fa-stack-1x'></i><strong class='fa-stack-1x icon-text'>SV</strong></span>");
//            } else if (file.name.match(/.gcode$/i)) {
//               $('#fileList').append("<span class='fa-stack'><i class='fa fa-file-o fa-stack-1x'></i><strong class='fa-stack-1x icon-text'>GC</strong></span>");
//            } else if (file.name.match(/.png$/i) || file.name.match(/.jpg$/i) || file.name.match(/.jpeg$/i) || file.name.match(/.bmp$/i)  || file.name.match(/.jpg$/i)) {
//               $('#fileList').append("<span class='fa-stack'><i class='fa fa-file-image-o fa-stack-1x'></i></span>");
//            }
//            $('#fileList').append("<a href='#' onclick='getFileContent(\""+file.id+"\",\""+file.name+"\")'>"+file.name+"</a><br/>");
//            $('#fileList').scrollTop($("#console")[0].scrollHeight - $("#console").height());
//          }
//
//          //appendPre(file.name + ' (' + file.id + ')<br>');
//         //  getFileContent(file.id);
//        }
//      } else {
//        printLog('No files found.', warncolor);
//      }
//    });
// }


function getFileContent(fileId, fileName) {
  console.log('fetching ', fileId)
  printLog('Fetching '+ fileName, msgcolor)
  $('#statusmodal').modal('show');
  $('#statusTitle').empty();
  $('#statusTitle').html('Fetching file');
  $('#statusBody').empty();
  $('#statusBody2').empty();
  $('#statusBody').html('Retrieving ' + fileName + 'from Google Drive<p>Please Wait....');
  gapi.client.request({
  'path': '/drive/v2/files/'+fileId,
  'method': 'GET',
  callback: function ( theResponseJS, theResponseTXT ) {
      var myToken = gapi.auth.getToken();
      var myXHR   = new XMLHttpRequest();
      myXHR.open('GET', theResponseJS.downloadUrl, true );
      if (fileName.match(/.png$/i) || fileName.match(/.jpg$/i) || fileName.match(/.jpeg$/i) || fileName.match(/.bmp$/i)  || fileName.match(/.jpg$/i)) {
        myXHR.responseType = 'blob';
      }
      //myXHR.responseType = 'blob';
      myXHR.setRequestHeader('Authorization', 'Bearer ' + gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token );
      myXHR.onreadystatechange = function( theProgressEvent ) {
          if (myXHR.readyState == 1) {
            $('#statusBody2').empty();
            $('#statusBody2').append('<p><pre>Connected...</pre>');
          }
          if (myXHR.readyState == 2) {
            $('#statusBody2').empty();
            $('#statusBody2').append('<p><pre>Request Sent...<pre>');
          }
          if (myXHR.readyState == 3) {
            $('#statusBody2').empty();
            $('#statusBody2').append('<p><pre>Downloading...</pre>');
          }
          if (myXHR.readyState == 4) {
            $('#statusBody2').empty();
            $('#statusBody2').append('<p><pre>Complete...</pre>');
//          1=connection ok, 2=Request received, 3=running, 4=terminated
              if ( myXHR.status == 200 ) {
//              200=OK
                  //console.log( myXHR.response );
                  printLog('Successfully Fetched '+ fileName, successcolor)
                  if (fileName.match(/.dxf$/i)) {
                    dxf = myXHR.response
                    $('#togglefile').click();
                    $('#cammodule').show();
                    // $('#svgnewway').hide();
                    $('#rastermodule').hide();
                    getSettings();
                    drawDXF(dxf);
                    currentWorld();
                    printLog('DXF Opened', successcolor);
                    $('#cammodule').show();
                    putFileObjectAtZero();
                    resetView()
                    $('#stlopt').hide();
                    $('#prepopt').show();
                    $('#prepopt').click();
                    attachTransformWidget();
                    printLog('Google Drive DXF File Opened', successcolor);
                  } else if (fileName.match(/.svg$/i)) {
                    svg = myXHR.response
                    var svgpreview = document.getElementById('svgpreview');
                    svgpreview.innerHTML = myXHR.response;
                        // /console.log(svg);
                    $('#togglefile').click();
                    $('#cammodule').show();
                    // $('#svgnewway').show();
                    $('#rastermodule').hide();
                    getSettings();
                    var svgfile = $('#svgpreview').html();
                    // var colors = pullcolors(svgfile).unique();
                    // var layers = []
                    // for (i = 0; i < colors.length; i++) {
                    //   // var r = colors[i][0];
                    //   // var g = colors[i][1];
                    //   // var b = colors[i][2];
                    //   //var colorval = RGBToHex(r, g, b)
                    //   layers.push(colors[i]);
                    // };
                    svg2three(svgfile);
                    currentWorld();
                    printLog('SVG Opened', successcolor);
                    $('#cammodule').show();
                    putFileObjectAtZero();
                    resetView()
                    $('#stlopt').show();
                    $('#prepopt').show();
                    $('#prepopt').click();
                    attachTransformWidget();
                    $('#svgresize').modal('show');
                    printLog('Google Drive SVG File Opened', successcolor);
                  } else if (fileName.match(/.gcode$/i)) {
                    cleanupThree();
                    document.getElementById('gcodepreview').value = myXHR.response;
                    openGCodeFromText();
                    printLog('GCODE Opened', successcolor);
                    $('#toggleviewer').click();
                    $('#cammodule').hide();
                    $('#rastermodule').hide();
                    //  putFileObjectAtZero();
                    resetView()
                    $('#stlopt').hide();
                    $('#prepopt').hide();
                    $("#transformcontrols").hide();
                    printLog('Google Drive GCODE File Opened', successcolor);
                  } else if (fileName.match(/.stl$/i)) {
                    printLog('STL not supported yet', errorcolor)
                  } else {
                    var imgtag = document.getElementById("origImage");
                    var imgwidth, imgheight;



                    // imgtag.title = fileName;
                    var blob = myXHR.response;
                    var bloburl = window.URL.createObjectURL(blob)
                    imgtag.src = bloburl;
                    setImgDims();
                    drawRaster();
                    $('#cammodule').hide();
                    $('#rastermodule').show();
                    // putFileObjectAtZero();
                    $('#togglefile').click();
                    $('#stlopt').hide();
                    $('#prepopt').hide();
                    $("#transformcontrols").hide();

                    imgtag.onload = function()
                    {
                      //tbfleming's threejs texture code
                      imgwidth = imgtag.naturalWidth;
                      imgheight = imgtag.naturalHeight;
                      //tbfleming's threejs texture code
                      // var imgwidth = imgtag.naturalWidth;
                      // var imgheight = imgtag.naturalHeight;

                      console.log('Trying to download texture ', bloburl, typeof(bloburl))
                      console.log('Params ', imgwidth, imgheight, bloburl)

                      var geometry = new THREE.PlaneBufferGeometry(imgwidth, imgheight, 1);

                      var texture = new THREE.TextureLoader().load(bloburl)
                      texture.minFilter = THREE.LinearFilter

                      var material = new THREE.MeshBasicMaterial({
                          map: texture,
                          transparent: true
                      });

                      rastermesh = new THREE.Mesh(geometry, material);

                      rastermesh.position.x = -(laserxmax / 2) + (imgwidth / 2);
                      rastermesh.position.y = -(laserymax / 2) + (imgheight / 2);
                      rastermesh.name = "rastermesh"

                      scene.add(rastermesh);
                    }


                    //  attachTransformWidget();
                    //resetView()
                    printLog('Google Drive RASTER File Opened', successcolor);
                  }
                  $('#filestatus').hide();
                  if ($( "#togglefile" ).hasClass( "btn-default" )) {
                    $('#togglefile').click();
                  }
              }
              $('#statusmodal').modal('hide');
              $('#statusmodal').modal('hide');
          }
      }
      myXHR.send();
  }
});
		};

$(document).ready(function() {
  startApp();
});
