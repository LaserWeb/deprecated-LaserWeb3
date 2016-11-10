// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Sidebar menu template
    lw.templates['sidebar-menu'] = `

        <div class="sidebar-menu">
            <div class="menu">
                <ul id="menu" >
                    <li id="jog-menu" class="leftmenuitem active">
                        <a href="#"><i class="fa fa-arrows-alt"></i><span>Jog</span></a>
                    </li>
                    <li id="cam-menu" class="leftmenuitem">
                        <a href="#"><i class="fa fa-pencil-square-o"></i><span>CAM</span></a>
                    </li>
                    <li id="tree-cam-menu" class="leftmenuitem">
                        <a href="#"><i class="fa fa-pencil"></i><span>Tree</span></a>
                    </li>
                    <li id="gcode-menu" class="leftmenuitem">
                        <a href="#"><i class="fa fa-file-code-o"></i><span>GCode</span></a>
                    </li>
                    <li id="quote-menu" class="leftmenuitem">
                        <a href="#"><i class="fa fa-money"></i><span>Quote</span></a>
                    </li>
                    <li id="stats-menu" class="leftmenuitem">
                        <a href="#"><i class="fa fa-info-circle"></i><span>Stats</span></a>
                    </li>
                    <li id="settings-menu" class="leftmenuitem">
                        <a href="#"><i class="fa fa-cogs"></i><span>Settings</span></a>
                    </li>

                </ul>
            </div>
        </div><!-- .sidebar-menu -->

    `;

})();
