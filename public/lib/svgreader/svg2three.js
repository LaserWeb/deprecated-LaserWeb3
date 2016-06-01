// Author Jordan Sitkin https://github.com/dustMason/Machine-Art
 globalpaths = {};
 var hexvalue = [];
 var svgcolors = [];
 var svgcolorsoptions = [];
 var intensity = 100;
 var svglaserpwr = 0;
 var path, paths;
 var svgShape, svgGeom, svgLine;
 var gcode;
 var parsecolor;

  // Helper function
	Array.prototype.unique = function()
	{
		var n = {},r=[];
		for(var i = 0; i < this.length; i++)
		{
			if (!n[this[i]])
			{
				n[this[i]] = true;
				r.push(this[i]);
			}
		}
		return r;
	}

  // Helper function
  RGBToHex = function(r,g,b){
  var bin = r << 16 | g << 8 | b;
  return (function(h){
      return new Array(7-h.length).join("0")+h
  })(bin.toString(16).toUpperCase())
  }

	function pullcolors(svgfile) {
    var hexvalue = [];
    var svgcolors = [];
    var svgcolorsoptions = [];
    console.log('SVG File: ', svgfile)
		svgfile = svgfile.replace(/^[\n\r \t]/gm, '');
		var paths = SVGReader.preview(svg, {}).allcolors,
	      gcode,
	      path,
	      idx = paths.length,
	      minX = Infinity,
	      maxX = -Infinity,
	      minY = Infinity,
	      maxY = -Infinity;

	 //var svgcolorsoptions = [];

	 for (i = 0; i < paths.length; i++) {
	 	//onsole.log('PATH: '+i+', FILL: '+paths[i].node.fill+', STROKE: '+paths[i].node.stroke+', COLOR: '+paths[i].node.color+', OPACTITY: '+paths[i].node.opacity)
		//if (paths[i].node.fill) { svgcolors.push(paths[i].node.fill) };
		if (paths[i].node.stroke) { svgcolors.push(paths[i].node.stroke) };
		//if (paths[i].node.color) { svgcolors.push(paths[i].node.color) };
	 }
	//svgcolorsoptions = svgcolors.unique();
  //for (c = 0; c < svgcolorsoptions.length; c++) {
  //  var r = svgcolorsoptions[c][0];
  //  var g = svgcolorsoptions[c][1];
  //  var b = svgcolorsoptions[c][2];
  //  hexvalue.push('#'+RGBToHex(r, g, b));
  //};
	//console.log(svgcolors);
  return svgcolors;
	};


function svg2gcode(svg, settings) {
  // clean off any preceding whitespace
  svg = svg.replace(/^[\n\r \t]/gm, '');
  settings = settings || {};
  settings.scale = settings.scale || -1;
  settings.cutZ = settings.cutZ || 0; // cut z
  settings.safeZ = settings.safeZ || 90;   // safe z
  settings.feedRate = settings.feedRate || 1400;
  settings.seekRate = settings.seekRate || 1100;
  settings.bitWidth = settings.bitWidth || 1; // in mm
  settings.verticalSlices = settings.verticalSlices || 1;
  settings.horizontalSlices = settings.horizontalSlices || 1;
  settings.offsetX = settings.offsetX || 0;
  settings.offsetY = settings.offsetY || 0;
  settings.laserpwr = settings.laserpwr || 100;
  settings.gcodePreamble = settings.gcodePreamble || [
    'G90',
    'G21',
    'G0 Z' + settings.safeZ

  ];
  settings.gcodePostamble = settings.gcodePostamble || [];

  console.log('SVG Laser Power:  '+settings.laserpwr+'%');
  var svglaserpwr = parseInt(settings.laserpwr, 10)

  var scale = function(val) {
    return val * settings.scale;
  };

  var paths = SVGReader.parse(svg, {}).allcolors,
      gcode,
      path,
      idx = paths.length,
      minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

 //console.log(paths);
 globalpaths = paths;

 //for (i = 0; i < paths.length; i++) {
 //	 console.log('PATH: '+i+', FILL: '+paths[i].node.fill+', STROKE: '+paths[i].node.stroke+', COLOR: '+paths[i].node.color+', OPACTITY: '+paths[i].node.opacity)
 //}

  while(idx--) {
    var subidx = paths[idx].length;
    var bounds = { x : Infinity , y : Infinity, x2 : -Infinity, y2: -Infinity, area : 0};

    // find lower and upper bounds
    while(subidx--) {
      if (paths[idx][subidx].x < bounds.x)
        bounds.x = paths[idx][subidx].x;
      if (paths[idx][subidx].x < minX)
        minX = paths[idx][subidx].x;

      if (paths[idx][subidx].y < bounds.y)
        bounds.y = paths[idx][subidx].y;
      if (paths[idx][subidx].y < minY)
        minY = paths[idx][subidx].y;

      if (paths[idx][subidx].x > bounds.x2)
        bounds.x2 = paths[idx][subidx].x;
      if (paths[idx][subidx].x > maxX)
        maxX = paths[idx][subidx].x;

      if (paths[idx][subidx].y > bounds.y2)
        bounds.y2 = paths[idx][subidx].y;
      if (paths[idx][subidx].y > maxY)
        maxY = paths[idx][subidx].y;
    }

    // calculate area
    bounds.area = (1 + bounds.x2 - bounds.x) * (1 + bounds.y2-bounds.y);
    paths[idx].bounds = bounds;
  }

    if (settings.verticalSlices > 1 || settings.horizontalSlices > 1) {
    // break the job up into slices, work in small chunks
    var columnWidth = totalWidth / settings.verticalSlices;
    var rowHeight = totalHeight / settings.horizontalSlices;
    var sortedPaths = [];
    // create empty data structure
    for (i = 0; i < settings.horizontalSlices; i++) {
      sortedPaths[i] = [];
      for (j = 0; j < settings.verticalSlices; j++) {
        sortedPaths[i][j] = [];
      }
    }
    // populate it with paths
    paths.forEach(function(path) {
      var rowIndex = Math.floor((path[0].y + (totalHeight/2)) / rowHeight);
      var colIndex = Math.floor((path[0].x + (totalWidth/2)) / columnWidth);
      // console.log(rowIndex-2, colIndex-2);
      if (rowIndex < settings.verticalSlices && colIndex < settings.horizontalSlices) {
        sortedPaths[rowIndex][colIndex].push(path);
      } else {
        console.log("warning: skipped path");
      }
    });
    // concatenate all the paths together
    paths = sortedPaths.map(function(row, i) {
      if ((i % 2) == 1) row.reverse();
      return [].concat.apply([], row);
    });
    paths = [].concat.apply([], paths);
  }

  gcode = settings.gcodePreamble.slice(0);

  if (firmware.indexOf('Lasaur') == 0) {
		  gcode.push('M80'); // Air Assist on
	};

  // Firmware Specific Gcode Output
	if (firmware.indexOf('Grbl') == 0) {
		intensity = svglaserpwr.map(0, 100, 0, 255);
		//console.log('Mapping Intensity range for Grbl S0-S255');
		intensity = intensity.toFixed(0);
	} else if (firmware.indexOf('Smooth') == 0) {
		intensity = svglaserpwr.map(0, 100, 0, 1);
		//console.log('Mapping Intensity range for Smoothieware S0-S1');
		intensity = intensity.toFixed(2);
	} else if (firmware.indexOf('Lasaur') == 0) {
		intensity = svglaserpwr.map(0, 100, 0, 255);
		//console.log('Mapping Intensity range for Smoothieware S0-S1');
		intensity = intensity.toFixed(0);
	} else {
		intensity = svglaserpwr.map(0, 100, 0, 100);
		//console.log('Mapping Intensity range for S0-S100');
		intensity = intensity.toFixed(0);
	}


  for (var pathIdx = 0, pathLength = paths.length; pathIdx < pathLength; pathIdx++) {
    path = paths[pathIdx];

    // seek to index 0
    gcode.push(['G0',
      'X' + scale(path[0].x + settings.offsetX),
      'Y' + scale(-path[0].y + settings.offsetY),
      'F' + settings.seekRate,
			'; Seek to 0'
    ].join(' '));


    // begin the cut by dropping the tool to the work
    gcode.push(['G0',
      'Z' + (settings.cutZ),
      'F' + settings.feedRate
    ].join(' '));

    // keep track of the current path being cut, as we may need to reverse it
    // var localPath = [];
    for (var segmentIdx=0, segmentLength = path.length; segmentIdx<segmentLength; segmentIdx++) {
      var segment = path[segmentIdx];

      var localSegment = ['G1',
        'X' + scale(segment.x + settings.offsetX),
        'Y' + scale(-segment.y + settings.offsetY),
        'F' + settings.feedRate,
        'S' + intensity
      ].join(' ');

      // feed through the material
			if (firmware.indexOf('Grbl') == 0) {
				gcode.push('M3');
			};

      gcode.push(localSegment);

			if (firmware.indexOf('Grbl') == 0) {
				gcode.push('M5');
			};
      // localPath.push(localSegment);

      // if the path is not closed, reverse it, drop to the next cut depth and cut
      // this handles lines
      // if (segmentIdx === segmentLength - 1 && (segment.x !== path[0].x || segment.y !== path[0].y)) {
      //   // begin the cut by dropping the tool to the work
      //   gcode.push(['G1',
      //     'Z' + (settings.cutZ),
      //     'F' + '200'
      //   ].join(' '));
      //   Array.prototype.push.apply(gcode, localPath.reverse());
      // }

    }

    // go safe
    gcode.push(['G0',
      'Z' + settings.safeZ,
      'F' + settings.feedRate
    ].join(' '));
  }

  // just wait there for a second
  //gcode.push('G4 P1');

  // turn off the spindle
  // gcode.push('M5');
  if (firmware.indexOf('Lasaur') == 0) {
		  gcode.push('M81'); // Air Assist off
	};

  // go home
  // gcode.push('G1 Z0 F300');
  //
  gcode.push('G0 Z' + settings.safeZ);

  gcode = gcode.concat(settings.gcodePostamble);

  return gcode.join('\n');
}


function svg2three(svgfile, settings) {

  if (typeof(fileParentGroup) !== 'undefined') {
    scene.remove(fileParentGroup);
  };
  fileParentGroup = new THREE.Group();
  fileParentGroup.name = "fileParentGroup";

  if (typeof(fileObject) !== 'undefined') {
    scene.remove(fileObject);
  };
  fileObject = new THREE.Group();

  $('#layers').empty

  // clean off any preceding whitespace
  svgfile = svgfile.replace(/^[\n\r \t]/gm, '');
  settings = settings || {};
  settings.scale = settings.scale || -1;


  var scale = function(val) {
    return val * settings.scale;
  };

  var paths = SVGReader.parse(svgfile, {}).allcolors,
      path,
      idx = paths.length,
      minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;


 globalpaths = paths;


 for (i = 0; i < paths.length; i++) {
 console.log('PATH: '+i+', FILL: '+paths[i].node.fill+', STROKE: '+paths[i].node.stroke+', COLOR: '+paths[i].node.color+', OPACTITY: '+paths[i].node.opacity, ' Path ', paths)
 }

 while(idx--) {

   var subidx = paths[idx].length;
   var bounds = { x : Infinity , y : Infinity, x2 : -Infinity, y2: -Infinity, area : 0};

   // find lower and upper bounds
   while(subidx--) {
     if (paths[idx][subidx].x < bounds.x)
       bounds.x = paths[idx][subidx].x;
     if (paths[idx][subidx].x < minX)
       minX = paths[idx][subidx].x;

     if (paths[idx][subidx].y < bounds.y)
       bounds.y = paths[idx][subidx].y;
     if (paths[idx][subidx].y < minY)
       minY = paths[idx][subidx].y;

     if (paths[idx][subidx].x > bounds.x2)
       bounds.x2 = paths[idx][subidx].x;
     if (paths[idx][subidx].x > maxX)
       maxX = paths[idx][subidx].x;

     if (paths[idx][subidx].y > bounds.y2)
       bounds.y2 = paths[idx][subidx].y;
     if (paths[idx][subidx].y > maxY)
       maxY = paths[idx][subidx].y;
   }

   // calculate area
   bounds.area = (1 + bounds.x2 - bounds.x) * (1 + bounds.y2-bounds.y);
   paths[idx].bounds = bounds;
 }

   if (settings.verticalSlices > 1 || settings.horizontalSlices > 1) {
   // break the job up into slices, work in small chunks
   var columnWidth = totalWidth / settings.verticalSlices;
   var rowHeight = totalHeight / settings.horizontalSlices;
   var sortedPaths = [];
   // create empty data structure
   for (i = 0; i < settings.horizontalSlices; i++) {
     sortedPaths[i] = [];
     for (j = 0; j < settings.verticalSlices; j++) {
       sortedPaths[i][j] = [];
     }
   }
   // populate it with paths
    paths.forEach(function(path) {
      var rowIndex = Math.floor((path[0].y));
      var colIndex = Math.floor((path[0].x));
      // console.log(rowIndex-2, colIndex-2);
      if (rowIndex < settings.verticalSlices && colIndex < settings.horizontalSlices) {
        sortedPaths[rowIndex][colIndex].push(path);
      } else {
        console.log("warning: skipped path");
      }
    });

    // concatenate all the paths together
    var paths = sortedPaths.map(function(row, i) {
      if ((i % 2) == 1) row.reverse();
      return [].concat.apply([], row);
    });
    paths = [].concat.apply([], paths);

  }

  for (var pathIdx = 0, pathLength = paths.length; pathIdx < pathLength; pathIdx++) {
    path = paths[pathIdx];


    // seek to index 0
    // gcode.push(['G0',
    //   'X' + scale(path[0].x + settings.offsetX),
    //   'Y' + scale(-path[0].y + settings.offsetY),
    //   'F' + settings.seekRate,
		// 	'; Seek to 0'
    // ].join(' '));
	  svgShape = new THREE.Shape();
    svgShape.moveTo( path[0].x,(path[0].y * -1));

    var pathcolor = paths[pathIdx].node.stroke;
    var r = pathcolor[0] / 255;
    var g = pathcolor[1] / 255;
    var b = pathcolor[2] / 255;
    var colorval = new THREE.Color().setRGB(r, g, b);

    console.log('Color Value', colorval);
    if (colorval) {
      var svgMaterial = new THREE.MeshBasicMaterial( { color: colorval } )
    } else {
      var svgMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } )
    }


    // keep track of the current path being cut, as we may need to reverse it
    // var localPath = [];
    for (var segmentIdx=0, segmentLength = path.length; segmentIdx<segmentLength; segmentIdx++) {
      var segment = path[segmentIdx];

      // var localSegment = ['G1',
      //   'X' + scale(segment.x + settings.offsetX),
      //   'Y' + scale(-segment.y + settings.offsetY),
      //   'F' + settings.feedRate,
      //   'S' + intensity
      // ].join(' ');
      //
      // gcode.push(localSegment);

      svgShape.lineTo( segment.x, (segment.y * -1) );
      // localPath.push(localSegment);

      // if the path is not closed, reverse it, drop to the next cut depth and cut
      // this handles lines
      // if (segmentIdx === segmentLength - 1 && (segment.x !== path[0].x || segment.y !== path[0].y)) {
      //   // begin the cut by dropping the tool to the work
      //   gcode.push(['G1',
      //     'Z' + (settings.cutZ),
      //     'F' + '200'
      //   ].join(' '));
      //   Array.prototype.push.apply(gcode, localPath.reverse());
      // }

    }
    //svgShape.autoClose = true;
    svgGeom = new THREE.ShapeGeometry( svgShape );
    window["svgEntity" + pathIdx] = new THREE.Line( svgGeom, svgMaterial ) ;

    fileObject.add(window["svgEntity" + pathIdx]);

}
fileParentGroup.add(fileObject);
fileParentGroup.translateX((laserxmax / 2) * -1);
fileParentGroup.translateY((laserymax / 2) * -1);
scene.add(fileParentGroup);
$('#layers').append('<form class="form-horizontal"><label class="control-label">SVG</label><div class="input-group"><input class="form-control numpad" name=sp0 id=sp0 value=3200><span class="input-group-addon">mm/m</span></div><div class="input-group"><input class="form-control numpad" name=pwr0 id=pwr0 value=100><span class="input-group-addon">%</span></div></form>');

}
