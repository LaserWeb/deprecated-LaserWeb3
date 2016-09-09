function tracebmp(index, filename) {
	$("#tracingmodal").modal('show');
	var seq = objectsInScene[index].userData.seq;
	var toTrace = 'origImage'+seq;
	Potrace.loadImageFromUrl(objectsInScene[index].userData.imgdata);
	Potrace.process(function(){
		svg2three(Potrace.getSVG(1), "trace"+filename+".svg" );
		fillLayerTabs();
		fillTree();
		$("#tracingmodal").modal('hide');
	});
}
