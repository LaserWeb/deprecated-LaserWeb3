// Stats Panel needs the job time box populated
$('#stats-menu-panel').on('show', function(){
    var accumulatedJobTimeMS = parseInt((loadSetting("accumulatedJobTimeMS") || 0),  10);
    var displayString = (accumulatedJobTimeMS / 1000).toHHMMSS();
    $("#accumulatedtime").val(displayString);
});


// Functions to accumulate and clear total elapsed job time
function accumulateTime(elapsedTimeMS) {
	// Update accumulated job time
	var accumulatedJobTimeMS = parseInt((loadSetting("accumulatedJobTimeMS") || 0),  10);
	accumulatedJobTimeMS += elapsedTimeMS;
	saveSetting("accumulatedJobTimeMS", accumulatedJobTimeMS.toString());

	return accumulatedJobTimeMS;
}

// Handler called when Reset Accumulated Time is clicked
function resetAccumulatedTime() {
	saveSetting("accumulatedJobTimeMS", "0");
	var zero = 0;
	$("#accumulatedtime").val(zero.toHHMMSS());
}