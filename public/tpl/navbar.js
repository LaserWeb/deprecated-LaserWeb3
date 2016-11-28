// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Navigation bar template
    lw.templates['navbar'] = `

        <nav class="navbar navbar-inverse navbar-fixed-top">
            <div class="container-fluid">
                <div class="navbar-header">

                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button><!-- .navbar-toggle -->

                    <form class="navbar-form navbar-left" role="form">
                        <label for="connectVia" class="control-label  icon-white"><i class="fa fa-2x fa-plug"></i></label>
                        <select id="connectVia" class="form-control">
                            <option>USB</option>
                            <option>Ethernet</option>
                            <option>ESP8266</option>
                        </select>
                    </form><!-- .navbar-form -->

                    <div class="navbar-form navbar-left" id="usbConnect">
                        <form role="form"> <!-- USB -->
                            <label for="port" class="control-label  icon-white"><i class="fa fa-2x fa-usb"></i></label>
                            <select id="port" class="form-control">
                                <option value="no">Select port</option>
                            </select>
                            <label for="baud" class="control-label  icon-white"><i class="fa fa-2x fa-tty"></i></label>
                            <select id="baud" class="form-control">
                                <option value="250000">250000</option>
                                <option value="230400">230400</option>
                                <option value="115200" selected="selected">115200</option>
                                <option value="57600">57600</option>
                                <option value="38400">38400</option>
                                <option value="19200">19200</option>
                                <option value="9600">9600</option>
                            </select>
                            <a id="connect" class="btn btn-success disabled" href="#"><span id="connectStatus">Connect</span></a>
                            <a id="closePort" class="btn btn-danger disabled" href="#"><span id="closePort"><i class="fa fa-times"></i></span></a>
                            <a id="refreshPort" class="btn btn-default" href="#"><i class="fa fa-refresh"></i></a>
                        </form>
                    </div><!-- #usbConnect.navbar-form -->

                    <div id="ethernetConnect" class="navbar-form navbar-left" style="display: none;">
                        <form role="form"><!-- Smoothie Ethernet -->
                            <label for="smoothieIp" class="control-label  icon-white"><i class="fa fa-2x fa-wifi"></i></label>
                            <input id="smoothieIp" type="text" class="form-control" maxlength="16" placeholder="192.168.137.22" style="width: 140px;" />
                            <div class="btn-group">
                                <a id="ethConnect" class="btn btn-success" href="#"><span id="ethConnectStatus">Connect</span></a>
                                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Scan <span class="caret"></span>
                                </button>
                                <div class="dropdown-menu dropdown-menu-right form-scan stop-propagation" role="menu" style="width: 350px;">
                                    <div class="form-group">
                                        <h4>Scan network</h4>
                                        <p>Specify the subnet in <code>0.0.0.*</code> format</p>
                                        <div class="input-group" style="width: 95%;">
                                            <input id="subnet1" style="border-right: none;" type="text" class="form-control" maxlength="16" placeholder="192" style="width: 60px;" />
                                            <span id="basic-addon2" style="border-left: none; border-right: none; background: #fff; cursur: arrow;" class="input-group-addon">.</span>
                                            <input id="subnet2" style="border-left: none; border-right: none;" type="text" class="form-control" maxlength="16" placeholder="168" style="width: 60px;" />
                                            <span id="basic-addon2" style="border-left: none; border-right: none; background: #fff; cursur: arrow;" class="input-group-addon">.</span>
                                            <input id="subnet3" style="border-left: none; border-right: none;" type="text" class="form-control" maxlength="16" placeholder="137" style="width: 60px;" />
                                            <span id="basic-addon2" style="border-left: none;  background: #fff; cursur: arrow;" class="input-group-addon">. &nbsp; <b>*</b></span>
                                        </div>
                                        <button id="scansubnet" class="btn btn-default">Scan</button>
                                        <div id="scannumber"></div>
                                        <hr />
                                        <div id="foundIp"></div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div><!-- ethernetConnect -->

                    <div id="espConnect" class="navbar-form navbar-left" style="display: none;">
                        <form role="form"><!-- Smoothie Wifi -->
                            <label for="espIp" class="control-label  icon-white"><i class="fa fa-2x fa-wifi"></i></label>
                            <input id="espIp" type="text" class="form-control" maxlength="16" placeholder="192.168.137.22" style="width: 140px;" />
                            <div class="btn-group">
                                <a id="espConnectBtn" class="btn btn-success" href="#"><span id="espConnectStatus">Connect</span></a>
                                <a id="espDisconnectBtn" class="btn btn-danger" href="#" style="display: none;" onclick="stopWS();">Disconnect</a>
                                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Scan <span class="caret"></span>
                                </button>
                                <div class="dropdown-menu dropdown-menu-right form-scan stop-propagation" role="menu" style="width: 350px;">
                                    <div class="form-group">
                                        <h4>Scan Wifi</h4>
                                        <p>Specify the subnet in <code>0.0.0.*</code> format</p>
                                        <div class="input-group" style="width: 95%;">
                                            <input id="wifisubnet1" style="border-right: none;" type="text" class="form-control" maxlength="16" placeholder="192" style="width: 60px;" />
                                            <span id="basic-addon2" style="border-left: none; border-right: none; background: #fff; cursur: arrow;" class="input-group-addon">.</span>
                                            <input id="wifisubnet2" style="border-left: none; border-right: none;" type="text" class="form-control" maxlength="16" placeholder="168" style="width: 60px;" />
                                            <span id="basic-addon2" style="border-left: none; border-right: none; background: #fff; cursur: arrow;" class="input-group-addon">.</span>
                                            <input id="wifisubnet3" style="border-left: none; border-right: none;" type="text" class="form-control" maxlength="16" placeholder="137" style="width: 60px;" />
                                            <span id="basic-addon2" style="border-left: none;  background: #fff; cursur: arrow;" class="input-group-addon">. &nbsp; <b>*</b></span>
                                        </div>
                                        <button id="scanwifi" class="btn btn-default">Scan</button>
                                        <div id="scannumberwifi"></div>
                                        <hr />
                                        <div id="foundIpwifi"></div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div><!-- espConnect -->

                    <form class="navbar-form navbar-right" role="form">
                        <a id="toggleFullScreen" data-placement="bottom" data-original-title="Fullscreen" data-toggle="tooltip" class="btn btn-default">
                            <i class="fa fa-desktop"></i>
                        </a>
                    </form><!-- toggle fullscreen -->

                    <form class="navbar-form navbar-right" role="form">
                        <div id="support" class="btn-group  input-group" role="group" aria-label="Support" style="vertical-align: bottom;">
                            <div class="btn-group" role="group">
                                <button id="dropdownMenu1" class="btn btn-danger dropdown-toggle btn-sm" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                    <i class="fa fa-info fa-fw"></i> Support
                                    <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                                    <li><a target="_blank" href="https://plus.google.com/communities/115879488566665599508">Support Community</a></li>
                                    <li><a target="_blank" href="https://github.com/openhardwarecoza/LaserWeb3/issues">Open a Bug Report</a></li>
                                    <li><a href="#" onclick="tour.restart()">Take a Tour of LaserWeb</a></li>
                                    <li><a target="_blank" href="https://github.com/openhardwarecoza/LaserWeb3/wiki">Instruction / Wiki</a></li>
                                    <li role="separator" class="divider"></li>
                                    <li><a target="_blank" href="https://github.com/openhardwarecoza/LaserWeb3">Fork Me!</a></li>
                                </ul>
                            </div>
                        </div><!-- #support -->
                    </form><!-- .navbar-form -->

                </div><!-- .navbar-header -->
            </div><!-- .container-fluid -->
        </nav><!-- .navbar -->

    `;

})();
