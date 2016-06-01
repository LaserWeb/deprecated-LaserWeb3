function svgInit() {
  $('#pullcolors').on('click', function() {
    $("#svglinestbody").empty();
    $('#svgnewway').show();
    $('#svgoldway').hide();
    var svg2 = $('#svgpreview').html();
    svgrows = pullcolors(svg2).unique();
    for (c = 0; c < svgrows.length; c++) {

    };
    //console.log(svgrows.length);
    for (i = 0; i < svgrows.length; i++) {
      var r = svgrows[i][0];
      var g = svgrows[i][1];
      var b = svgrows[i][2];
      $('#svglinestable > tbody:last-child').append('<tr><td bgcolor="'+RGBToHex(r, g, b)+'"></td><td> <div class="input-group"><input style="text-align: right;" class ="form-control" name=svgf'+i+' id=sp'+i+' value=3200><span class="input-group-addon">mm/min</span></div><br><div class="input-group"><input style="text-align: right;" class=form-control name=svgpwr'+i+' id=pwr'+i+' value=100><span class="input-group-addon">%</span></div></td></tr>');
    };
    $('#processSVG').removeClass('disabled');
  });
}

// New SVG
function processSVG() {
  var s = '';
  var svg = $('#svgpreview').html();
  //console.log(svg);
  
  //console.log(svg);
  //var svgfile = XMLS.serializeToString(svg);
  SVGlaserRapid = $('#SVGrapidRate').val();
  //SVGlaserScale = svgscale * ($('#SVGscaleval').val() / 100);
  //SVGlaserFeed = $('#SVGfeedRate[i]').val();
  //SVGlaserPwr = $('#SVGlaserPwr[i]').val();
    for (i = 0; i < svgrows.length; i++) {
      SVGlaserFeed = $('#sp'+i).val();
      SVGlaserPwr = $('#pwr'+i).val();
      parsecolor = svgrows[i];
      console.log('Color to parse now: '+parsecolor);
      s += svg2gcode(svg, {
        feedRate: SVGlaserFeed,
        seekRate: SVGlaserRapid,
        bitWidth: 0.1,
    //    scale: SVGlaserScale,
        safeZ: 0.01,
        laserpwr: SVGlaserPwr,
        gcodePreamble: gcodePreamble,
        gcodePostamble: gcodePostamble
      })
    };
    document.getElementById("gcodepreview").value = s;
};
