// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // File scope
    lw.file = {
        name   : 'file',
        logging: true
    };

    // Bind logging methods
    lw.log.bind(lw.file);

    // -------------------------------------------------------------------------

    lw.file.init = function() {
        initDragDrop();
        $('#file').on('change', function(e) { lw.file.onOpen(e); });
        $('#saveGCodeFile').on('click', function(e) { lw.file.saveGCode(); });
    };

    // -------------------------------------------------------------------------

    function initDragDrop() {
        var $dropTarget = $('#container1');

        var onDragLeave = function(e) {
            e.stopPropagation();
            e.preventDefault();
            $('#draganddrop').hide();
        }

        var onDragOver = function(e) {
            e.stopPropagation();
            e.preventDefault();
            $('#draganddrop').show();
        }

        var onDrop = function(e) {
            onDragLeave(e);
            lw.file.onOpen(e.originalEvent);
        }

        $dropTarget.on('drop'     , onDrop);
        $dropTarget.on('dragover' , onDragOver);
        $dropTarget.on('dragleave', onDragLeave);
    }

    // -----------------------------------------------------------------------------

    lw.file.addFileObject = function(file, object) {
        // Add layer tab [id, label, [active, [removable=true]]]
        lw.tabs.add(object.uuid, file.name, true, true);

        // Add object to viewer
        lw.viewer.addObject(object, {
            name  : file.name,
            target: 'objects'
        });
    };

    // -----------------------------------------------------------------------------

    lw.file.load = function(file) {
        // No file...
        if (! (file && file instanceof File)) {
            throw new Error(file + ' is not an instance of File.');
        }

        // File reader object
        var reader = new FileReader();

        // DXF file
        if (file.name.match(/\.dxf$/i)) {
            // On file loaded
            reader.onload = function(event) {
                // Parse and create DXF 3D object
                lw.dxf.draw(reader.result, file.name, {
                    // On 3D object created
                    onObject: function(object) {
                        lw.file.addFileObject(file, object);
                    }
                });
            };

            // Read the file as text
            reader.readAsText(file);

            // File handled
            return;
        }

        if (file.name.match(/\.svg$/i)) {
            // On file loaded
            reader.onload = function(event) {
                // Parse and create SVG 3D object
                lw.svg.drawFile(reader.result, file.name, {
                    // On 3D object created
                    onObject: function(object) {
                        lw.file.addFileObject(file, object);
                    },
                    // On error
                    onError: function(error) {
                        console.error(error);
                    }
                });
            };

            // Read the file as text
            reader.readAsText(file);

            // File handled
            return;
        }

        /*

        else if (f.name.match(/\.(gcode|gc|nc)$/i)) {
            r.readAsText(f);
            r.onload = function(event) {
                // cleanupThree();
                $("#gcodefile").show();
                document.getElementById('gcodepreview').value = this.result;
                lw.log.print('GCODE Opened', 'message', "file");
                resetView()
                setTimeout(function(){   openGCodeFromText(); }, 500);
            };
        }
        else if (f.name.match(/\.stl$/i)) {
            //r.readAsText(f);
            // Remove the UI elements from last run
            console.group("STL File");
            var stlloader = new MeshesJS.STLLoader;
            r.onload = function(event) {
                // cleanupThree();
                // Parse ASCII STL
                if (typeof r.result === 'string') {
                    stlloader.loadString(r.result);
                    return;
                }
                // buffer reader
                var view = new DataView(this.result);
                // get faces number
                try {
                    var faces = view.getUint32(80, true);
                } catch (error) {
                    self.onError(error);
                    return;
                }
                // is binary ?
                var binary = view.byteLength == (80 + 4 + 50 * faces);
                if (!binary) {
                    // get the file contents as string
                    // (faster than convert array buffer)
                    r.readAsText(f);
                    return;
                }
                // parse binary STL
                stlloader.loadBinaryData(view, faces, 100, window, f);
            };
            // start reading file as array buffer
            r.readAsArrayBuffer(f);
            lw.log.print('STL Opened', 'message', "file");
            console.log("Opened STL, and asking user for Slice settings")
            console.groupEnd();
            $('#stlslice').modal('show')
        }
        else {
            console.log(f.name + " is probably a Raster");
            $('#origImage').empty();
            r.readAsDataURL(f);
            r.onload = function(event) {
                var name = f.name;
                var data = event.target.result;
                drawRaster(name, data);
            };
        }

        $('#filestatus').hide();
        $('#cam-menu').click();

        setTimeout(function(){ fillTree(); }, 250);
        setTimeout(function(){ fillLayerTabs(); }, 300);
        setTimeout(function(){ lw.viewer.extendsViewToObject(objectsInScene[objectsInScene.length - 1]); }, 300);
        */
    };

    // -----------------------------------------------------------------------------

    /**
    * @param {Blob} file - File or Blob object. This parameter is required.
    * @param {string} fileName - Optional file name e.g. "image.png"
    */
    lw.file.saveAs = function(file, fileName) {
        if (! file) {
            throw 'Blob object is required.';
        }

        if (! file.type) {
            file.type = 'text/plain';
        }

        var fileExtension = file.type.split('/')[1];

        if (fileName && fileName.indexOf('.') !== -1) {
            var splitted  = fileName.split('.');
            fileName      = splitted[0];
            fileExtension = splitted[1];
        }

        var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

        if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
            return navigator.msSaveOrOpenBlob(file, fileFullName);
        }
        else if (typeof navigator.msSaveBlob !== 'undefined') {
            return navigator.msSaveBlob(file, fileFullName);
        }

        var hyperlink          = document.createElement('a');
            hyperlink.href     = URL.createObjectURL(file);
            hyperlink.target   = '_blank';
            hyperlink.download = fileFullName;

        if (!! navigator.mozGetUserMedia) {
            hyperlink.onclick = function() {
                (document.body || document.documentElement).removeChild(hyperlink);
            };

            (document.body || document.documentElement).appendChild(hyperlink);
        }

        var event = new MouseEvent('click', {
            view      : window,
            bubbles   : true,
            cancelable: true
        });

        hyperlink.dispatchEvent(event);

        if (! navigator.mozGetUserMedia) {
            URL.revokeObjectURL(hyperlink.href);
        }
    }

    // -------------------------------------------------------------------------

    lw.file.saveGCode = function() {
        this.saveAs(
            new Blob([prepgcodefile()], { type: "text/plain" }), 'file.gcode'
        );
    }

    // -------------------------------------------------------------------------

    lw.file.onOpen = function(event) {
        this.info('open:', event);

        // Close the menu
        $("#drop1").dropdown("toggle");

        // Files
        var files = event.target.files || event.dataTransfer.files;

        for (var i = 0; i < files.length; i++) {
            this.load(files[i]);
        }

        // Fix for opening same file...
        $('#file').val(null);
    }

})();
