// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Quote menu panel template
    lw.templates['quote-menu-panel'] = `

        <div id="quote-menu-panel" class="mobtab" style="display: none;">
            <h4>Cost Estimate</h4>
            <div id="quote warning" class="bs-callout bs-callout-warning">
                <h4>
                    <i class="fa fa-fw fa-exclamation-triangle"></i>
                    NB First load/refresh GCode
                </h4>
                <p>The cost calculator uses the final gcode length to calculate machine time.</p>
            </div>
            <form class="form-horizontal">
                <label for="setupcost" class="control-label">Setup Cost (Once off)</label>
                <div class="input-group">
                    <span class="input-group-addon">$</span>
                    <input id="setupcost" type="text" class="form-control quoteVar" value="0.00" />
                    <span class="input-group-addon">=</span>
                </div>
                <label for="materialcost" class="control-label">Material Cost per cm<sup>2</sup> (each):</label>
                <div class="input-group">
                    <span class="input-group-addon">$</span>
                    <input id="materialcost" type="text" class="form-control quoteVar" value="0.00" />
                    <span class="input-group-addon">x</span>
                    <input id="materialqty" type="text" class="form-control" value="0" disabled />
                    <span class="input-group-addon">cm<sup>2</sup></span>
                </div>
                <label for="lasertime" class="control-label">Machine moves (G0 + G1) per cm:</label>
                <div class="input-group">
                    <span class="input-group-addon">$</span>
                    <input id="lasertime" type="text" class="form-control quoteVar" value="0.05" />
                    <span class="input-group-addon">x</span>
                    <input id="lasertimeqty" type="text" class="form-control" value="0" disabled />
                    <span class="input-group-addon">cm</span>
                </div>
                <label for="qtycut" class="control-label">Quantity</label>
                <div class="input-group">
                    <input id="qtycut" type="text" class="form-control quoteVar" value="1" />
                    <span class="input-group-addon">units</span>
                </div>
            </form>
            <br />
            <div id="quoteprice">
                <div class="table-responsive">
                    <table class="table table-condensed">
                        <thead>
                            <tr>
                                <td class="text-center"><strong>Qty</strong></td>
                                <td class="text-center"><strong>Description</strong></td>
                                <td class="text-right"><strong>Unit</strong></td>
                                <td class="text-right"><strong>Total</strong></td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Setup Cost</td>
                                <td class="text-right setupfee"></td>
                                <td class="text-right setupfee"></td>
                            </tr>
                            <tr>
                                <td class="unitqty"></td>
                                <td>Material</td>
                                <td class="text-right materialcost"></td>
                                <td class="text-right materialcosttotal"></td>
                            </tr>
                            <tr>
                                <td class="unitqty"></td>
                                <td>Laser Time</td>
                                <td class="text-right timecost"></td>
                                <td class="text-right timecosttotal"></td>
                            </tr>
                            <tr>
                                <td class="thick-line"></td>
                                <td class="thick"></td>
                                <td class="thick-line text-center"><strong>Total</strong></td>
                                <td class="thick-line text-right grandtotal"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <nav>
                <ul class="pager">
                    <li class="previous"><a href="#" onclick="$('#cam-menu').click();">
                        <span>&larr;</span> Revise</a>
                    </li>
                    <li class="next">
                        <a href="#" onclick="$('#jog-menu').click();">Process <span>&rarr;</span></a>
                    </li>
                </ul>
            </nav>
        </div><!-- #quote-menu-panele -->

    `;

})();
