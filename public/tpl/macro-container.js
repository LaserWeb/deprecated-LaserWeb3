// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    // Macro container template
    lw.templates['macro-container'] = `

        <div id="macro_container" style="display: none;">
            <div id="macrostatus" class="bs-callout bs-callout-danger">
                <h4>
                    <i class="fa fa-fw fa-exclamation"></i> No macros created yet
                </h4>
                <p>Please click Edit to start creating your own Macro buttons.</p>
                <ul>
                    <li>Maximum of 24 unique user assignable buttons.</li>
                    <li>Specify custom label text.</li>
                    <li>Specify the GCode/MCode to be sent to the machine when Macro button is pressed.</li>
                    <li>Specify a custom color for the button.</li>
                </ul>
            </div><!-- #macrostatus -->
            <div id="macro_settings" class="container-fluid" style="display: none;">
                <h4 >Edit Macro Buttons</h4>
                <p>Configure Labels and G-Code commands for up to 24 buttons:</p>
                <div class="table-responsive settingstable">
                    <table id="macroEdit" class="table">
                        <thead>
                            <tr>
                                <th data-formatter="runningFormatter">Button #</th>
                                <th>Label</th>
                                <th>G-Code</th>
                                <th>Color</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody id="macrostbody"></tbody>
                    </table><!-- #macroEdit -->
                    <button id="addrow" type="button" class="btn btn-sm btn-default">
                        <i class="fa fa-w fa-plus"></i>
                    </button>
                </div>
            </div><!-- #macro_settings -->

            <div id="macro_pad" class="container-fluid">
                <!-- Dynamically Populated by readMacros() -->
            </div><!-- #macro_pad -->

            <div class="row">
                <center>
                    <button id="savemacro" type="button" class="btn btn-lg btn-default" style="display: none;">
                        <i class="fa fa-w fa-floppy-o"></i> Save
                    </button>
                    <button id="editmacro" type="button" class="btn btn-lg btn-default">
                        <i class="fa fa-w fa-pencil-square-o"></i> Edit
                    </button>
                    <button id="closemacro" type="button" class="btn btn-lg btn-danger">
                        <i class="fa fa-w fa-times"></i> Close
                    </button>
                </center>
            </div>

        </div><!-- #macro_container -->

    `;

})();
