// Written by Sebastien Mischler https://github.com/lautr3k/SLAcer.js/tree/master/js/slacer
var shapes = null;;
var group = null;;
var slicegroup;

function hidestl() {
    $('#hidestl').addClass('disabled');
    $('#showstl').removeClass('disabled');
    scene.remove(stl);
}

function showstl() {
    $('#showstl').addClass('disabled');
    $('#hidestl').removeClass('disabled');
    scene.add(stl);
}


//start stl parsing functions
parseStlBinary = function(stl) { //this is from jsstl.  we have a failure on the new DataView
    var geo = new THREE.Geometry();
    var dv = new DataView(stl, 80); // 80 == unused header
    var isLittleEndian = true;
    var triangles = dv.getUint32(0, isLittleEndian);

    // console.log('arraybuffer length:  ' + stl.byteLength);
    // console.log('number of triangles: ' + triangles);

    var offset = 4;
    for (var i = 0; i < triangles; i++) {
        // Get the normal for this triangle
        var normal = new THREE.Vector3(
            dv.getFloat32(offset, isLittleEndian),
            dv.getFloat32(offset + 4, isLittleEndian),
            dv.getFloat32(offset + 8, isLittleEndian)
        );
        offset += 12;

        // Get all 3 vertices for this triangle
        for (var j = 0; j < 3; j++) {
            geo.vertices.push(
                new THREE.Vector3(
                    dv.getFloat32(offset, isLittleEndian),
                    dv.getFloat32(offset + 4, isLittleEndian),
                    dv.getFloat32(offset + 8, isLittleEndian)
                )
            );
            offset += 12
        }

        // there's also a Uint16 "attribute byte count" that we
        // don't need, it should always be zero.
        offset += 2;

        // Create a new face for from the vertices and the normal
        geo.faces.push(new THREE.Face3(i * 3, i * 3 + 1, i * 3 + 2, normal));
    }

    // The binary STL I'm testing with seems to have all
    // zeroes for the normals, unlike its ASCII counterpart.
    // We can use three.js to compute the normals for us, though,
    // once we've assembled our geometry. This is a relatively
    // expensive operation, but only needs to be done once.
    geo.computeFaceNormals();

    var mesh = new THREE.Mesh(
        geo,
        // new THREE.MeshNormalMaterial({
        //     overdraw:true
        // }
        new THREE.MeshLambertMaterial({
            overdraw: true,
            color: 0xaa0000,
            shading: THREE.FlatShading
        }));
    //scene.add(mesh);
    scene.add(mesh);

    stl = null;
};
//end stl parsing functions



// Start SLAcer.js - slice functions
var slicer = new SLAcer.Slicer();
console.log()
var shapes;
var group;

var fileObject = new THREE.Group();


function generateSlices() {
    var layerheight = parseFloat($('#layerheight').val());
    slicegrid(layerheight);
}

function slicegrid(step) {
    var numx = Math.floor(laserxmax / (stlxsize + 3));
    var numy = Math.floor(laserymax / (stlysize + 3));
    var numlayers = Math.floor(stlzsize / parseFloat($('#layerheight').val()))
    console.log('Will be able to fit ', numx, ' on X, and ', numy, 'on Y. ', 'We will need space for ', numlayers)

    // var rectShape = new THREE.Shape();
    // rectShape.moveTo( 0,0 );
    // rectShape.lineTo( 0, stlysize );
    // rectShape.lineTo( stlxsize, stlysize );
    // rectShape.lineTo( stlxsize, 0 );
    // rectShape.lineTo( 0, 0 );
    // rectShape.autoClose = true;
    //
    // var rectGeom = new THREE.ShapeGeometry( rectShape );

    slicegroup = new THREE.Group();
    var i = 0;
    for (col = 0; col < numy; col++) {
        for (row = 0; row < numx; row++) {
            // var rectMesh = new THREE.Line( rectGeom, new THREE.LineBasicMaterial( { color: 0xcccccc, opacity: 0.6 } ) ) ;
            // rectMesh.position.x = ((- laserxmax / 2) + (stlxsize * row) );
            // rectMesh.position.y = ((- laserymax / 2) + (stlysize * col) ) ;
            // scene.add( rectMesh );
            group = new THREE.Group();
            //for(var i = 0; i < stlzsize; i+= step) {
            (function(i) {
                drawSlice(i);
            })(i);
            i++
            //}
            group.translateX(((stlxsize + 3) * row));
            group.translateY(((stlysize + 3) * col));
            slicegroup.add(group);
        }
    }

    var bbox = new THREE.BoundingBoxHelper(slicegroup, 0x000000);
    bbox.update();
    //stl.add(bbox);
    //object.add(stl);

    // Calculate position
    console.log(' Min: ', bbox.box.min);
    console.log(' Max: ', bbox.box.max);

    slicegroup.position.z = 0;
    slicegroup.translateX(-bbox.box.min.x);
    slicegroup.translateY(-bbox.box.min.y);
    slicegroup.translateX(-laserxmax / 2)
    slicegroup.translateY(-laserymax / 2)

    scene.add(slicegroup);
    fileParentGroup = slicegroup;
    fileobject = slicegroup;
    viewExtents(slicegroup);
}

function allSlice(maxheight, step) {
    NProgress.set(0.2);
    group = new THREE.Group();
    for (var i = 0; i < maxheight; i += step) {
        (function(i) {
            drawSlice(i);
            var progress = (i / maxheight);
            NProgress.set(progress);
        })(i);
    }
    scene.add(group);
    NProgress.done();
    NProgress.remove();

    var bbox = new THREE.BoundingBoxHelper(group, 0x000000);
    bbox.update();
    //stl.add(bbox);
    //object.add(stl);

    // Calculate position
    console.log(' Min: ', bbox.box.min);
    console.log(' Max: ', bbox.box.max);

    group.position.z = 0;
    group.translateX(-bbox.box.min.x);
    group.translateY(-bbox.box.min.y);
    group.translateX(-laserxmax / 2)
    group.translateY(-laserymax / 2)
}

function drawSlice(zheight) {
    //group  = new THREE.Group();
    var shapes = slicer.getFaces(zheight).shapes;


    var i, il, y, yl, hole, line;

    for (i = 0, il = shapes.length; i < il; i++) {
        shape = shapes[i];

        if (shape.holes && shape.holes.length) {
            for (y = 0, yl = shape.holes.length; y < yl; y++) {
                hole = new THREE.Shape(shape.holes[y].getPoints());
                hole.autoClose = true;
                group.add(new THREE.Line(new THREE.ShapeGeometry(hole), new THREE.LineBasicMaterial({
                    color: 0x0000ff,
                    opacity: 1.0
                })));
            }
        }

        shape.holes = [];
        shape.autoClose = true;
        group.add(new THREE.Line(new THREE.ShapeGeometry(shape), new THREE.LineBasicMaterial({
            color: 0x0000ff,
            opacity: 1.0
        })));
    }

    //group.position.z = 0;
    //scene.add(group);
}

/*
function drawSlice(zheight) {
  var faces = slicer.getFaces(zheight);
  console.log('Faces:', faces)
  var svgGroup = new THREE.Group();
  var fileObject = new THREE.Group();
  //var stlslice = new Three.Group();

  for (i = 0; i< faces.shapes.length; i++) {
    // current shape
         var shape = faces.shapes[i];
         console.log('Current Shape:', shape)

         // solid line
         //if (shape.curves.length != 0) {
           console.log('Generating Shape', shape)
           shape.autoClose = true;
           var geometry = new THREE.ShapeGeometry( shape );
           var lineSvg = new THREE.Line( geometry, material );
           svgGroup.add(lineSvg);
         //} else {
//           console.log('Skipped path: ', shape)
         //}
  }
  svgGroup.position.z = zheight;
  scene.add(svgGroup);
  //fileObject.add(stlslice);


}
*/
