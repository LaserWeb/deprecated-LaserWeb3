// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Jog menu panel template
    lw.templates['jog-menu-panel'] = `

        <div id="jog-menu-panel" class="mobtab">
            <span class="badge badge-default badge-warn" title="Items in Queue" id="syncstatus" style="margin-right: 5px;">Socket Closed</span>
            <span class="badge badge-default badge-notify" title="Items in Queue" id="machineStatus" style="margin-right: 5px;">Not Connected</span>
            <span class="badge badge-default badge-notify" title="Items in Queue" id="queueCnt" style="margin-right: 5px;">Queued: 0</span>

            <div id="mPosition" style="padding: 5px;">
                <div class="drolabel">X:</div><div id="mX" class="dro">0.000</div><br />
                <div class="drolabel">Y:</div><div id="mY" class="dro">0.000</div><br />
                <div class="drolabel">Z:</div><div id="mZ" class="dro">0.000</div><br />
            </div>

            <div id="armmachine" class="bs-callout bs-callout-danger">
                <h4><i class="fa fa-fw fa-exclamation"></i>Machine Control Disabled</h4>
                <table>
                    <tr>
                        <td style="width: 250px;">
                            Enter <kbd>PIN</kbd> to unlock:
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span id="armerror" style="color: red;"></span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div id="armpin" style="margin: 5px;"><input type="text" /></div>
                            <br />
                            <a href="#" onclick="javascript:$('#armpin').pincodeInput().data('plugin_pincodeInput').clear()" class="btn btn-sm btn-danger">clear</a>
                            <a href="#" onclick="javascript:$('#pinresetmodal').modal('show')" class="btn btn-sm btn-warning">set pin</a><br />
                        </td>
                    </tr>
                </table>
            </div><!-- #armmachine -->

            <table id="controlmachine">
                <tr>
                    <td colspan="5">
                        <div class="btn-group" role="group" aria-label="controljob">
                            <div class="btn-group">
                                <button id="homeBtn" type="button" class="btn btn-ctl btn-default" onclick="homeMachine();">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-home fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">home</strong>
                                        <strong class="fa-stack-1x icon-bot-text">laser</strong>
                                    </span>
                                </button>
                            </div>
                            <div class="btn-group">
                                <button id="playBtn" type="button" class="btn btn-ctl btn-default" onclick="playpauseMachine();">
                                    <span class="fa-stack fa-1x">
                                        <i id="playicon" class="fa fa-play fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">run</strong>
                                        <strong class="fa-stack-1x icon-bot-text">gcode</strong>
                                    </span>
                                </button>
                            </div>
                            <div class="btn-group">
                                <button id="uploadBtn" type="button" class="btn btn-ctl btn-default" onclick="$('#sdupload').modal('show');" style="display:none;">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-hdd-o fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">upload</strong>
                                        <strong class="fa-stack-1x icon-bot-text">to SD</strong>
                                    </span>
                                </button>
                            </div>
                            <div class="btn-group">
                                <button id="stopBtn" type="button" class="btn btn-ctl btn-default" onclick="stopMachine();">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-stop fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">abort</strong>
                                        <strong class="fa-stack-1x icon-bot-text">job</strong>
                                    </span>
                                </button>
                            </div>
                            <div class="btn-group">
                                <button id="zeroBtn" type="button" class="btn btn-ctl btn-default" onclick="sendGcode('G92 X0 Y0 Z0');">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-bullseye fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">set</strong>
                                        <strong class="fa-stack-1x icon-bot-text">zero</strong>
                                    </span>
                                </button>
                            </div>
                            <div class="btn-group">
                                <button id="bounding" type="button" class="btn btn-ctl btn-default">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-square-o fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">check</strong>
                                        <strong class="fa-stack-1x icon-bot-text">outline</strong>
                                    </span>
                                </button>
                            </div>
                        </div><!-- controlmachine -->
                    </td>
                </tr>
                <tr>
                    <td colspan="5">&nbsp;</td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        <button id="yP" type="button" data-title="Jog Y+" class="btn btn-ctl btn-default">
                            <span class="fa-stack fa-1x">
                                <i class="fa fa-arrow-up fa-stack-1x"></i>
                                <strong class="fa-stack-1x icon-top-text">Y+</strong>
                                <strong class="fa-stack-1x stepsizeval icon-bot-text">10mm</strong>
                            </span>
                        </button>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <button id="zP" type="button" data-title="Jog X+" class="btn btn-ctl btn-default">
                            <span class="fa-stack fa-1x"><i class="fa fa-arrow-up fa-stack-1x"></i>
                                <strong class="fa-stack-1x icon-top-text">Z+</strong>
                                <strong class="fa-stack-1x stepsizeval icon-bot-text">10mm</strong>
                            </span>
                        </button>
                    </td>
                </tr>
                <tr>
                    <td>
                        <button id="xM" type="button" data-title="Jog X-" class="btn btn-ctl btn-default">
                            <span class="fa-stack fa-1x">
                                <i class="fa fa-arrow-left fa-stack-1x"></i>
                                <strong class="fa-stack-1x icon-top-text">X-</strong>
                                <strong class="fa-stack-1x stepsizeval icon-bot-text">10mm</strong>
                            </span>
                        </button>
                    </td>
                    <td>
                        <button id="yM" type="button" data-title="Jog Y-" class="btn btn-ctl btn-default">
                            <span class="fa-stack fa-1x">
                                <i class="fa fa-arrow-down fa-stack-1x"></i>
                                <strong class="fa-stack-1x icon-top-text">Y-</strong>
                                <strong class="fa-stack-1x stepsizeval icon-bot-text">10mm</strong>
                            </span>
                        </button>
                    </td>
                    <td>
                        <button id="xP" type="button" data-title="Jog X+" class="btn btn-ctl btn-default">
                            <span class="fa-stack fa-1x">
                                <i class="fa fa-arrow-right fa-stack-1x"></i>
                                <strong class="fa-stack-1x icon-top-text">X+</strong>
                                <strong class="fa-stack-1x stepsizeval icon-bot-text">10mm</strong>
                            </span>
                        </button>
                    </td>
                    <td>
                        <div style="width: 8px;"></div>
                    </td>
                    <td>
                        <button id="zM" type="button" data-title="Jog X+" class="btn btn-ctl btn-default">
                            <span class="fa-stack fa-1x">
                                <i class="fa fa-arrow-down fa-stack-1x"></i>
                                <strong class="fa-stack-1x icon-top-text">Z-</strong>
                                <strong class="fa-stack-1x stepsizeval icon-bot-text">10mm</strong>
                            </span>
                        </button>
                    </td>
                </tr>
                <tr>
                    <td colspan="5">
                        <br />
                        <div class="input-group">
                            <span class="input-group-addon">X/Y</span>
                            <input id="jogfeedxy" type="text" class="form-control numpad input-sm" value="30" />
                            <span class="input-group-addon">Z</span>
                            <input id="jogfeedz" type="text" class="form-control numpad  input-sm" value="5" />
                            <span class="input-group-addon">mm/s</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="5">
                        <br />
                        <form id="stepsize">
                            <div data-toggle="buttons">
                                <label class="btn btn-jog btn-default">
                                    <input type="radio" name="stp" value="0.1" />
                                    <span class="fa-stack fa-1x"><i class="fa fa-arrows-h fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">jog by</strong>
                                        <strong class="fa-stack-1x icon-bot-text">0.1mm</strong>
                                    </span>
                                </label>
                                <label class="btn btn-jog btn-default">
                                    <input type="radio" name="stp" value="1" />
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-arrows-h fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">jog by</strong>
                                        <strong class="fa-stack-1x icon-bot-text">1mm</strong>
                                    </span>
                                </label>
                                <label class="btn btn-jog btn-default">
                                    <input type="radio" name="stp" value="10" />
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-arrows-h fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">jog by</strong>
                                        <strong class="fa-stack-1x icon-bot-text">10mm</strong>
                                    </span>
                                </label>
                                <label class="btn btn-jog btn-default">
                                    <input type="radio" name="stp" value="100" />
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-arrows-h fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">jog by</strong>
                                        <strong class="fa-stack-1x icon-bot-text">100mm</strong>
                                    </span>
                                </label>
                            </div>
                        </form><!-- #stepsize -->
                    </td>
                </tr>
            </table>
        </div><!-- #jog-menu-panel -->

    `;

})();
