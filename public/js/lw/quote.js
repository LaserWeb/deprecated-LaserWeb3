// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Quote scope
    lw.quote = {};

    // -------------------------------------------------------------------------

    lw.quote.init = function() {
        $('.quoteVar').keyup(function() {
            var unitqty      = parseFloat($("#qtycut").val());
            var setupfee     = parseFloat($("#setupcost").val());
            var timecost     = parseFloat($("#lasertime").val()) * parseFloat($("#lasertimeqty").val());
            var materialcost = parseFloat($("#materialcost").val()) * parseFloat($("#materialqty").val());

            var timecosttotal     = timecost * unitqty;
            var materialcosttotal = materialcost * unitqty;
            var grandtotal        = materialcosttotal + timecosttotal + setupfee;

            var $quoteprice  = $("#quoteprice");

            $quoteprice.find('.unitqty').html(unitqty.toFixed(2));
            $quoteprice.find('.setupfee').html(setupfee.toFixed(2));
            $quoteprice.find('.timecost').html(timecost.toFixed(2));
            $quoteprice.find('.timecosttotal').html(timecosttotal.toFixed(2));
            $quoteprice.find('.materialcost').html(materialcost.toFixed(2));
            $quoteprice.find('.materialcosttotal').html(materialcosttotal.toFixed(2));
            $quoteprice.find('.grandtotal').html(grandtotal.toFixed(2));
        });
    };

})();
