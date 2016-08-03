function tracebmp(index, filename) {
  var seq = objectsInScene[index].userData.seq;
  var toTrace = 'origImage'+seq;
  var traceimgtag = document.getElementById("origImage"+seq);
  Potrace.loadImageFromUrl(traceimgtag.src);
  Potrace.process(function(){svg2three(Potrace.getSVG(1), "trace"+filename+".svg" ); fillLayerTabs(); fillTree(); });
}
