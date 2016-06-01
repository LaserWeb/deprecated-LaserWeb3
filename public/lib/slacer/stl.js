// Written by Sebastien Mischler https://github.com/lautr3k/SLAcer.js/tree/master/js/slacer`

// namespace
var MeshesJS = MeshesJS || {};
var stl;
var mesh;
var stlxsize, stlysize, stlzsize;
;(function() {



    // Constructor
    function STLLoader() {}

    STLLoader.prototype.ColorLuminance = function(hex, lum) {

    	// validate hex string
    	hex = String(hex).replace(/[^0-9a-f]/gi, '');
    	if (hex.length < 6) {
    		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    	}
    	lum = lum || 0;

    	// convert to decimal and change luminosity
    	var rgb = "#", c, i;
    	for (i = 0; i < 3; i++) {
    		c = parseInt(hex.substr(i*2,2), 16);
    		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    		rgb += ("00"+c).substr(c.length);
    	}

    	return rgb;
    };

    // methods
    STLLoader.prototype.onGeometry = function(geometry, number, mainScope, fileInfo) {
        console.log("Geometry dropped STL no: ", number);
        console.log ("geometry:  ", geometry);
        var self = this;

        console.log ("self inside onGeometry:  ", self);

        //render here,

        stl = new THREE.Group();
        var material = new THREE.MeshPhongMaterial( {ambient: 0xffffff, color: 0xff5533, specular: 0x111111, shininess: 200 } );  //taken from slotted disk example of STLLoader.  Bright orange!  Gets your attention!

        //var colorrandom = '#' + Math.floor(Math.random()*16777215).toString(16);
        var colorrandom = '#ff5533'
        //var material = new THREE.MeshPhongMaterial( { color: colorrandom, specular: 0x111111, shininess: 60 } );  //taken from slotted disk example of STLLoader.  Bright orange!  Gets your attention!
        //var material = new THREE.MeshBasicMaterial({color: colorrandom});

        //return three mesh here
        mesh = new THREE.Mesh( geometry, material );    //THIS MESH
        stl.add(mesh);
        console.log ("mesh:  ", mesh);
        slicer.loadMesh(mesh);

        var bbox = new THREE.BoundingBoxHelper(mesh, boxColor);
        bbox.update();
        //stl.add(bbox);
        //object.add(stl);

        // Calculate position
        console.log('Object no: ', number, ' Min: ', bbox.box.min);
        console.log('Object no: ', number, ' Max: ', bbox.box.max);

        // Put object on Z=0
        mesh.translateX(bbox.box.min.x * -1)
        bbox.translateX(bbox.box.min.x * -1)

        mesh.translateY(bbox.box.min.y * -1)
        bbox.translateY(bbox.box.min.y * -1)

        mesh.translateZ(bbox.box.min.z * -1)
        bbox.translateZ(bbox.box.min.z * -1)

        mesh.translateX(- laserxmax / 2)
        bbox.translateX(- laserxmax / 2)

        mesh.translateY(- laserymax / 2)
        bbox.translateY(- laserymax / 2)

        stlxsize = (bbox.box.max.x - bbox.box.min.x);
        stlysize = (bbox.box.max.y - bbox.box.min.y);
        stlzsize = (bbox.box.max.z - bbox.box.min.z);




        //return Edge Helper
        var edgecolor = self.ColorLuminance(colorrandom, -0.05);	// -5% darker colorrandom
        var edges = new THREE.EdgesHelper(mesh, edgecolor);      //ray changed edges from black to soft grey color // peter changed to shades (;)   //ray wins
        stl.add(edges);

        var boxColor = self.ColorLuminance(colorrandom, 0.4); // 40% lighter colorrandom

        //console.log ("ray mainscope:  ", mainScope);      //Getting back the scope of the main widget (ie "this" inside cpdefine)

        //chilipeppr.publish("/com-chilipeppr-widget-3dviewer/sceneadd", stl);
        //chilipeppr.publish("/com-chilipeppr-widget-3dviewer/sceneadd", object);

        //mainScope.onGotNewStlFile(geometry, mesh, stl, fileInfo);
        scene.add(stl);
        showstl();

        viewExtents(stl)
        $('#layers > tbody:last-child').append('<tr><td>STL</td><td>  <div class="input-group" style="margin-bottom:5px; width: 100%;"><input class="form-control" name=sp0 id=sp0 value=3200><span class="input-group-addon"  style="width: 30px;">mm/m</span><input class="form-control" name=pwr0 id=pwr0 value=100><span class="input-group-addon"  style="width: 30px;">%</span></div></td></tr>');

    };
    STLLoader.prototype.onError = function(error) {};

    STLLoader.prototype.loadFile = function(file, number, mainScope) {
        console.log("Inside STL.js loadFile");
        console.log("Working with STL no: ", number);
        // self alias
        var self = this;

        var fileInfo = {
            name: file.name,
            size: file.size
        };

        console.log ("name: ", file.name);
        // file reader instance
        var reader = new FileReader();

        // on file loaded
        reader.onloadend = function(event) {
            console.log("Inside STL.js loadFile:onLoadend");
            // if error/abort
            if (this.error) {
                self.onError(this.error);
                return;
            }

            // Parse ASCII STL
            if (typeof this.result === 'string' ) {
                console.log("Inside STL.js Found ASCII");
                self.loadString(this.result, number, mainScope, fileInfo);
                return;
            }

            // buffer reader
            var view = new DataView(this.result);

            // get faces number
            try {
                var faces = view.getUint32(80, true);
            }
            catch(error) {
                self.onError(error);
                return;
            }

            // is binary ?
            var binary = view.byteLength == (80 + 4 + 50 * faces);

            if (! binary) {
                // get the file contents as string
                // (faster than convert array buffer)
                reader.readAsText(file);
                return;
            }

            // parse binary STL
            console.log("Inside STL.js Binary STL");
            self.loadBinaryData(view, faces, number, mainScope, fileInfo);
        };

        // start reading file as array buffer
        reader.readAsArrayBuffer(file);
    };

    STLLoader.prototype.loadString = function(data, number, mainScope, fileInfo) {
        var length, normal, patternNormal, patternVertex, result, text;
        var geometry = new THREE.Geometry();
        var patternFace = /facet([\s\S]*?)endfacet/g;

        while((result = patternFace.exec(data)) !== null) {
            text = result[0];

            patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
            patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

            while((result = patternNormal.exec(text)) !== null) {
                normal = new THREE.Vector3(
                    parseFloat(result[1]),
                    parseFloat(result[3]),
                    parseFloat(result[5])
                );
            }

            while((result = patternVertex.exec(text)) !== null) {
                geometry.vertices.push(new THREE.Vector3(
                    parseFloat(result[1]),
                    parseFloat(result[3]),
                    parseFloat(result[5])
                ));
            }

            length = geometry.vertices.length;

            geometry.faces.push(new THREE.Face3(length-3, length-2, length-1, normal));
        }

        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        this.onGeometry(geometry, number, mainScope, fileInfo);
    };

    STLLoader.prototype.loadBinaryData = function(view, faces, number, mainScope, fileInfo) {
        console.log('Yay We are inside loadBinaryData:   Face:', faces, ', View: ', view, ' Number: ', number );
        if (! view instanceof DataView) {
            var view = new DataView(view);
        }

        if (! faces) {
            try {
                var faces = view.getUint32(80, true);
            }
            catch(error) {
                this.onError(error);
                return;
            }
        }

        var dataOffset = 84;
        var faceLength = 12 * 4 + 2;
        var offset = 0;
        var geometry = new THREE.BufferGeometry();

        var vertices = new Float32Array( faces * 3 * 3 );
        var normals = new Float32Array( faces * 3 * 3 );

        for ( var face = 0; face < faces; face ++ ) {
            var start = dataOffset + face * faceLength;
            var normalX = view.getFloat32( start, true );
            var normalY = view.getFloat32( start + 4, true );
            var normalZ = view.getFloat32( start + 8, true );

            for (var i = 1; i <= 3; i ++) {
                var vertexstart = start + i * 12;

                normals[ offset ] = normalX;
                normals[ offset + 1 ] = normalY;
                normals[ offset + 2 ] = normalZ;

                vertices[ offset ] = view.getFloat32( vertexstart, true );
                vertices[ offset + 1 ] = view.getFloat32( vertexstart + 4, true );
                vertices[ offset + 2 ] = view.getFloat32( vertexstart + 8, true );

                offset += 3;
            }
        }

        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));

        var geometry2 = new THREE.Geometry();
        geometry2 = new THREE.Geometry().fromBufferGeometry(geometry);
        geometry2.computeBoundingBox();
        geometry2.computeBoundingSphere();

        this.onGeometry(geometry2, number, mainScope, fileInfo);
    };

    // export module
    MeshesJS.STLLoader = STLLoader;

})();
