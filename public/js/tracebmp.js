function tracebmp(index, filename) {
	$("#tracingmodal").modal('show');
	var seq = objectsInScene[index].userData.seq;
	var toTrace = 'origImage'+seq;
	Potrace.loadImageFromUrl(objectsInScene[index].userData.imgdata);
	Potrace.process(function(){
		settings = {};
		settings.scale = objectsInScene[index].scale.x;
		svg2three(Potrace.getSVG(1), "trace"+filename+".svg", settings );
		fillLayerTabs();
		fillTree();
		$("#tracingmodal").modal('hide');
	});
}
