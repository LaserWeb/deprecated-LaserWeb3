// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Viewer container template
    lw.templates['viewer-container'] = `

        <div id="viewer_container">

            <table style="width: 100%">
                <tr>
                    <td style="width: 100px;">
                        <div id="transformcontrols" class="btn-group" role="group" style="vertical-align: bottom; margin-left: 18px; display: none;">
                            <div class="btn-group input-group  btn-group-vertical" role="group" style="vertical-align: bottom;">
                                <button id="rotLeftBtn" type="button" data-title="Move Object" class="btn btn-lg btn-default">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-undo fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">Rotate</strong>
                                        <strong class="fa-stack-1x rotsizeval icon-bot-text">45&deg;</strong>
                                    </span>
                                </button>
                                <button id="translateBtn" type="button" data-title="Move Object" class="btn btn-lg btn-default">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-arrows fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">Move</strong>
                                    </span>
                                </button>
                            </div>
                            <div class="btn-group input-group  btn-group-vertical" role="group" style="vertical-align: bottom;">
                                <button id="rotRightBtn" type="button" data-title="Move Object" class="btn btn-lg btn-default">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-repeat fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">Rotate</strong>
                                        <strong class="fa-stack-1x rotsizeval icon-bot-text">45&deg;</strong>
                                    </span>
                                </button>
                                <button id="resizeBtn" type="button" data-title="Resize Object" class="btn btn-lg btn-default">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-expand fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">Resize</strong>
                                    </span>
                                </button>
                            </div>
                            <div class="btn-group input-group  btn-group-vertical" role="group" style="vertical-align: bottom;">
                                <button id="resetRot" type="button" data-title="Link Aspect" class="btn btn-lg btn-default">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-circle-o-notch fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">Reset</strong>
                                        <strong class="fa-stack-1x icon-bot-text">Rotation</strong>
                                    </span>
                                </button>
                                <button id="linkAspectBtn" type="button" data-title="Link Aspect" class="btn btn-lg btn-default">
                                    <span class="fa-stack fa-1x">
                                        <i id='linkAspect' class="fa fa-link fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">Aspect</strong>
                                        <strong id="linkval" class="fa-stack-1x icon-bot-text">Linked</strong>
                                    </span>
                                </button>
                            </div>
                        </div><!-- #transformcontrols -->

                        <div id="viewcontrols" class="btn-group" role="group" style="vertical-align: bottom; margin-left: 18px;">
                            <div class="btn-group input-group  btn-group-vertical" role="group" style="vertical-align: bottom;">
                                <button id="togglemacro" type="button" data-title="Link Aspect" class="btn btn-lg btn-default">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-th fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">Macro</strong>
                                        <strong class="fa-stack-1x icon-bot-text">Panel</strong>
                                    </span>
                                </button>
                                <button id="viewReset" type="button" data-title="Link Aspect" class="btn btn-lg btn-default">
                                    <span class="fa-stack fa-1x">
                                        <i class="fa fa-search fa-stack-1x"></i>
                                        <strong class="fa-stack-1x icon-top-text">Reset</strong>
                                        <strong id="linkval" class="fa-stack-1x icon-bot-text">View</strong>
                                    </span>
                                </button>
                            </div>
                        </div><!-- #viewcontrols -->

                    </td>
                    <td style="width: 160px;">

                        <table>
                            <tr>
                                <td>
                                    <div class="checkbox">
                                        <label><input id="3dview" type="checkbox" value="" />Enable 3D View</label>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div id="pancontrols" class="btn-group" role="group" style="vertical-align: bottom; margin-left: 18px;">
                                        <div class="btn-group input-group  btn-group-vertical" role="group" style="vertical-align: bottom;">
                                            <button id="zoomout" onclick='jQuery.Event( "DOMMouseScroll",{delta: -650} );' type="button" data-title="Zoom Out" class="btn btn-view btn-lg btn-default">
                                                <i class="fa fa-search-minus"></i>
                                            </button>
                                            <button id="panleft" type="button" data-title="Pan Left" class="btn btn-view  btn-lg btn-default">
                                                <i class="fa fa-arrow-left"></i>
                                            </button>
                                        </div>
                                        <div class="btn-group input-group  btn-group-vertical" role="group" style="vertical-align: bottom;">
                                            <button id="panup" type="button" data-title="Pan Up" class="btn btn-view  btn-lg btn-default">
                                                <i class="fa fa-arrow-up"></i>
                                            </button>
                                            <button id="pandown" type="button" data-title="Pan Down" class="btn btn-view  btn-lg btn-default">
                                                <i class="fa fa-arrow-down"></i>
                                            </button>
                                        </div>
                                        <div class="btn-group input-group  btn-group-vertical" role="group" style="vertical-align: bottom;">
                                            <button id="zoomin" onclick='jQuery.Event( "DOMMouseScroll",{delta: +650} );' type="button" data-title="Zoom In" class="btn btn-view  btn-lg btn-default">
                                                <i class="fa fa-search-plus"></i>
                                            </button>
                                            <button id="panright" type="button" data-title="Pan Right" class="btn btn-view  btn-lg btn-default">
                                                <i class="fa fa-arrow-right"></i>
                                            </button>
                                        </div>
                                    </div><!-- #pancontrols -->
                                </td>
                            </tr>
                        </table>

                    </td>
                    <td align="right">
                        <div class="rotate">SysLog</div>
                    </td>
                    <td>
                        <div id="console"></div><!-- console -->
                        <div class="input-group btn-group" style="margin-left: 10px;">
                            <span class="input-group-addon"><i class="fa fa-terminal fa-lg"></i></span>
                            <input id="command" type="text" autocomplete="on" class="form-control numpadgcode" />
                            <span class="input-group-btn">
                                <button id="sendCommand" class="btn btn-default" type="button">
                                    <i class="fa fa-play" style="margin-right: 10px;"></i> Send
                                </button>
                                <button class="emptylog btn btn-default" type="button" onclick="$('#console').empty();">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </span>
                        </div>
                    </td>
                </tr>
            </table>

        </div><!-- #viewer_container -->

    `;

})();
