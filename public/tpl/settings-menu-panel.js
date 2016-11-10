// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Settings menu panel template
    lw.templates['settings-menu-panel'] = `

        <div id="settings-menu-panel" class="mobtab" style="display: none;">

            <div id="settingsstatus" class="bs-callout bs-callout-danger">
                <h4><i class="fa fa-fw fa-exclamation"></i> Incomplete Config</h4>
                <p>Please complete configuration</p>
            </div>

            <ul class="nav nav-pills">
                <li class="active">
                    <a data-toggle="tab" href="#menu1">
                        <span class="fa-stack">
                            <i class="fa fa-line-chart fa-stack-1x"></i>
                            <strong class="fa-stack-1x icon-text" style="margin-left: -2px;">SIZE</strong>
                        </span>
                    </a>
                </li>
                <li>
                    <a data-toggle="tab" href="#menu2">
                        <span class="fa-stack">
                            <i class="fa fa-codepen fa-stack-1x"></i>
                            <strong class="fa-stack-1x icon-text" style="margin-left: -6px;">GCODE</strong>
                        </span>
                    </a>
                </li>
                <li>
                    <a data-toggle="tab" href="#menu3">
                        <span class="fa-stack">
                            <i class="fa fa-wrench fa-stack-1x"></i>
                            <strong class="fa-stack-1x icon-text" style="margin-left: -3px;">TOOL</strong>
                        </span>
                    </a>
                </li>
                <li>
                    <a data-toggle="tab" href="#menu4">
                        <span class="fa-stack">
                            <i class="fa fa-download fa-stack-1x"></i>
                            <strong class="fa-stack-1x icon-text" style="margin-left: -10px;">BACKUP</strong>
                        </span>
                    </a>
                </li>
            </ul>

            <br />

            <div class="tab-content">

                <div id="menu1" class="tab-pane fade in active">
                    <p>
                        Configure LaserWeb 3.0 to your machine specifics: <br />
                        <i>(NB: Page needs a refresh for these settings to take effect!)</i>
                    </p>
                    <form class="form-horizontal">
                        <label for="laserXMax" class="control-label">X-Length <span style="color:red;">(Required)</span></label>
                        <input id="laserXMax" type="text" class="form-control numpad" placeholder="600" />
                        <label for="laserYMax" class="control-label">Y-Length <span style="color:red;">(Required)</span></label>
                        <input id="laserYMax" type="text" class="form-control numpad" placeholder="400" />
                        <label for="SpotSize" class="control-label">Laser Beam Diameter <span style="color:red;">(Required)</span></label>
                        <input id="spotSize" type="text" class="form-control numpad" placeholder="0.5" />
                    </form>
                    <hr />
                    <form class="form-horizontal">
                        <h4>SVG defaults DPI</h4>
                        <label for="defaultDPI" class="control-label">Default <span style="color:red;">(Required)</span></label>
                        <input id="defaultDPI" type="text" class="form-control numpad" placeholder="24" />
                        <label for="inkscapeDPI" class="control-label">Inkscape</label>
                        <input id="inkscapeDPI" type="text" class="form-control numpad" placeholder="24" />
                        <label for="illustratorDPI" class="control-label">Illustrator</label>
                        <input id="illustratorDPI" type="text" class="form-control numpad" placeholder="24" />
                    </form>
                    <hr />
                    <form class="form-horizontal">
                        <h4>BMP defaults DPI</h4>
                        <label for="defaultBitmapDPI" class="control-label">Default <span style="color:red;">(Required)</span></label>
                        <input id="defaultBitmapDPI" type="text" class="form-control numpad" placeholder="24" />
                    </form>
                </div><!-- #menu1 -->

                <div id="menu2" class="tab-pane fade">
                    Configure pre/post/control GCode commands:
                    <form class="form-horizontal">
                        <label for="optimisegcode" class="control-label">Concatenate Raster X Moves <span style="color:#FFA500;">(Less serial, but more jerky movement on Smoothie)</span></label>
                        <select id="optimisegcode" class="form-control">
                            <option>Disable</option>
                            <option>Enable</option>
                        </select>
                        <label for="startgcode" class="control-label">Start G-Code <span style="color:#FFA500;">(Optional)</span></label>
                        <textarea id="startgcode" class="form-control numpadgcode uppercase" placeholder="For example G28 G90 M80 - supports multi line commands"></textarea>
                        <label for="laseron" class="control-label">Laser ON Command <span style="color:#FFA500;">(Optional)</span></label>
                        <input id="laseron" type="text" class="form-control numpadgcode uppercase" placeholder="For example M3 / blank for firmwares that support G1" />
                        <label for="laseroff" class="control-label">Laser OFF Command <span style="color:#FFA500;">(Optional)</span></label>
                        <input id="laseroff" type="text" class="form-control numpadgcode uppercase" placeholder="For example M5 / blank for firmwares that support G1" />
                        <label for="lasermultiply" class="control-label">PWM Max S value <span style="color:red;">(Required)</span></label>
                        <input id="lasermultiply" type="text" class="form-control numpad uppercase" placeholder="For example 255, 1, or 1000" />
                        <label for="homingseq" class="control-label">Homing Sequence <span style="color:red;">(Required)</span></label>
                        <input id="homingseq" type="text" class="form-control numpadgcode uppercase" placeholder="For example G28, or $H" />
                        <label for="endgcode" class="control-label">End G-Code <span style="color:#FFA500;">(Optional)</span></label>
                        <textarea id="endgcode" class="form-control numpadgcode uppercase" placeholder="For example M81 G28 - supports multi line commands"></textarea>
                        <label for="rapidspeed" class="control-label">Travel Moves (mm/s) <span style="color:red;">(Required)</span></label>
                        <input id="rapidspeed" class="form-control numpad uppercase" placeholder="For example 30" />
                    </form>
                </div><!-- #menu2 -->

                <div id="menu3" class="tab-pane fade">
                    <p>Configure how the application works, turn on/off features:</p>
                    <form class="form-horizontal">
                        <label for="safetyLockDisabled" class="control-label">Disable Safety Lock</label>
                        <select id="safetyLockDisabled" class="form-control">
                            <option>Disable</option>
                            <option>Enable</option>
                        </select>
                        <label for="cncMode" class="control-label">Enable CNC Cam <span style="color:#FFA500;">(CNCWeb Mode)</span></label>
                        <select id="cncMode" class="form-control">
                            <option>Disable</option>
                            <option>Enable</option>
                        </select>
                        <label for="imagePosition" class="control-label">Place uploaded image in quadrant <a target="_blank" href="https://github.com/openhardwarecoza/LaserWeb3/wiki/Settings:--Image-Position">(help)</a></label>
                        <select id="imagePosition" class="form-control">
                            <option>BottomLeft</option>
                            <option>TopLeft</option>
                        </select>
                        <label for="useNumPad" class="control-label">Use Touch Numpads <a target="_blank" href="https://github.com/openhardwarecoza/LaserWeb3/wiki/Settings:-Use-Touch-Num-Pads">(help)</a></label>
                        <select id="useNumPad" class="form-control">
                            <option>Disable</option>
                            <option>Enable</option>
                        </select>
                        <label for="useVideo" class="control-label">Use Webcam Video Overlay <a target="_blank" href="https://github.com/openhardwarecoza/LaserWeb3/wiki/Settings:-Webcam-Integration">(help)</a></label>
                        <select id="useVideo" class="form-control">
                            <option>Disable</option>
                            <option>Enable</option>
                            <option>Remote</option>
                        </select>
                        <label for="webcamUrl" class="control-label">Remote Webcam URL <a target="_blank" href="https://github.com/openhardwarecoza/LaserWeb3/wiki/Settings:-Remote-Webcam">(help)</a></label>
                        <input id="webcamUrl" type="text" class="form-control" placeholder="http://192.168.1.100:8080/?action=snapshot" />
                    </form>
                </div><!-- #menu3 -->

                <div id="menu4" class="tab-pane fade">
                    <p>Download a backup or restore settings from a backup file:</p>
                    <form class="form-horizontal">
                        <div id="jogx" class="btn-group input-group  btn-group-justified" role="group" aria-label="Backup">
                            <div class="btn-group" role="group">
                                <a id="backup" class="btn btn-lg btn-default btn-file" title="Take a backup">
                                    <i class="fa fa-download fa-fw"></i> Backup Settings
                                </a>
                            </div>
                        </div>
                        <div class="btn-group input-group  btn-group-justified" role="group" id="jogx" aria-label="Restore">
                            <div class="btn-group" role="group">
                                <span id="restore" href="#" class="btn btn-lg btn-default btn-file" title="Open a backup settings file">
                                    <i class="fa fa-upload  fa-fw"></i> Restore from file <input id="jsonFile" type="file" accept=".json" />
                                </span>
                            </div>

                        </div>
                    </form>
                </div><!-- #menu4 -->

                <hr />

                <button id="savesettings" type="button" class="btn btn-lg btn-success" data-dismiss="modal">Save</button>
                <button type="button" class="btn btn-lg btn-default" data-dismiss="modal">Cancel</button>

            </div><!-- .tab-content -->

        </div><!-- #settings-menu-panel -->

    `;

})();
