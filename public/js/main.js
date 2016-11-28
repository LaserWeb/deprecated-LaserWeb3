// Console header
console.log("%c%s","color: #000; background: green; font-size: 12px;", "STARTING LASERWEB");

// Intialise
lw.init();

init3D();
filePrepInit();
initTabs();
initJog();
var paperscript = {};
rasterInit();
macrosInit();
initSocket();
initTour();
initSmoothie();
initEsp8266();
initTree();

// Bind Quote System
$('.quoteVar').keyup(function(){
    var setupfee = ( parseFloat($("#setupcost").val()) ).toFixed(2);
    var materialcost = ( parseFloat($("#materialcost").val()) * parseFloat($("#materialqty").val()) ).toFixed(2);
    var timecost = ( parseFloat($("#lasertime").val()) * parseFloat($("#lasertimeqty").val()) ).toFixed(2);
    var unitqty = ( parseFloat($("#qtycut").val()) ).toFixed(2);
    var grandtot = (materialcost*unitqty) + (timecost*unitqty) + parseFloat(setupfee);
    var grandtotal = grandtot.toFixed(2);
    $("#quoteprice").empty();
    $("#quoteprice").html('<div class="table-responsive"><table class="table table-condensed"><thead><tr><td class="text-center"><strong>Qty</strong></td><td class="text-center"><strong>Description</strong></td><td class="text-right"><strong>Unit</strong></td><td class="text-right"><strong>Total</strong></td></tr></thead><tbody><tr><td>1</td><td>Setup Cost</td><td class="text-right">'+setupfee+'</td><td class="text-right">'+setupfee+'</td></tr><tr><td>'+unitqty+'</td><td>Material</td><td class="text-right">'+materialcost+'</td><td class="text-right">'+(materialcost*unitqty).toFixed(2)+'</td></tr><tr><td>'+unitqty+'</td><td>Laser Time</td><td class="text-right">'+timecost+'</td><td class="text-right">'+(timecost*unitqty).toFixed(2)+'</td></tr><tr><td class="thick-line"></td><td class="thick"></td><td class="thick-line text-center"><strong>Total</strong></td><td class="thick-line text-right">'+ grandtotal +'</td></tr></tbody></table></div>' );
});
