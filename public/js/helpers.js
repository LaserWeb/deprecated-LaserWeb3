//  Functions to extend prototypes
// Other useful helper functions

// Helper to generate hours:minutes:seconds for accumulated job time
// Adapted from StackOverflow
// http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss/6313008#6313008
Number.prototype.toHHMMSS = function () {
  var sec_num = Math.round(this);
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  return hours+':'+minutes+':'+seconds;
}

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};


//JQuery extension to add additional event triggers
// This assumes JQuery has been loaded first!
!function ($) {

	$.each(['show', 'hide'], function (i, ev) {
		var el = $.fn[ev];
		$.fn[ev] = function () {
			this.trigger(ev);
			return el.apply(this, arguments);
		};
	});
} (jQuery);


function getBaseZHeight() {
  // Z Height is expected to be around 0, plus or minus the focusins offset (zFocusHeight)
  // cutting mat thickness is added if cutting mat is used, and material thickness is added.
  var zHeightRaw = (parseFloat($('#cuttingMatThickness').val() || 0) +
                parseFloat($('#materialThickness').val() || 0));

  // FIXME focus
  // The clamp assumes material can go up to 50mm high -- this assumption might be bad.
  var zHeight = zHeightRaw.clamp(0,50) +
                parseFloat($('zFocusHeight').val() || 0);


  return zHeight;
};
