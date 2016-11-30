var tour;

function initTour() {
  tour = new Tour({
    smartPlacement: true,
    container: "body",
    steps: [
    {
      element: "#connect",
      title: "Setup connection",
      content: "Connects this instance of LaserWeb to your Smoothieware powered controller.  Note, as of July 2016, ethernet support is not yet fully implemented. "
    },
    {
      element: "#openbutton",
      title: "Open Files",
      content: "Use this button to open DXF or SVG files for cutting,  and Bitmap files (JPG, GIF, PNG, BMP) for Engraving"
    },
    {
      element: "#mPosition",
      title: "Digital Read Out",
      content: "Shows current Machine Position",
      onShow: function (tour) { $('#jog-menu').click()}
    },
    {
      element: "#armmachine",
      title: "Pin Controller Disarming",
      content: "Set/Enter a PIN to enable the Laser Controls #safety",
    },
    {
      element: "#yP",
      title: "Jog Buttons",
      content: "Used for manual positioning",
    },
    {
      element: "#cam-menu",
      title: "CAM / Convert to GCode",
      content: "Used to configure feeds, speeds, operations for jobs",
      onShow: function (tour) { $('#cam-menu').click()},
      onHide: function (tour) { $('#jog-menu').click()}
    },
    {
      element: "#gcode-menu",
      title: "GCode Preview and Export",
      content: "Checking and Exporting GCode",
      onShow: function (tour) { $('#gcode-menu').click()},
      onHide: function (tour) { $('#jog-menu').click()},
    },
    {
      element: "#quote-menu",
      title: "Costing / Quote Estimate",
      content: "Help you determine laser time and material cost",
      onShow: function (tour) { $('#quote-menu').click()},
      onHide: function (tour) { $('#jog-menu').click()},
    },
    {
      element: "#settings-menu",
      title: "Settings Menu",
      content: "NB:  Make sure you configure LaserWeb according to your specific needs first!",
      onShow: function (tour) { $('#settings-menu').click()},
      onHide: function (tour) { $('#jog-menu').click()},
    },
    {
      element: "#togglemacro",
      title: "Macro Panel",
      content: "Macro mode allows you configure a few custom buttons",
    },
    {
      element: "#viewcontrols",
      title: "View Controls",
      content: "Reset View zooms the loaded file into view"
    },
    {
      element: "#pancontrols",
      title: "Pan / Zoom controls",
      content: "Adjust your viewpoint"
    },
    {
      element: "#console",
      title: "Log / Console",
      content: "Displays feedback from the machine, as well as log output from LaserWeb itself",
      placement: 'left'
    },
    {
      element: "#command",
      title: "Manual Commands",
      content: "Use to send custom M and G code commands to your machine.  Press <kbd>up</kbd> and <kbd>down</kbd> to access command history",
      placement: 'left'
    },
    {
      element: "#allView",
      title: "File/Layer Tabs",
      content: "Manage individual files, remove layers from job.  Each file is seen as one layer/tab"
    },
    {
      element: "#renderArea",
      title: "The Viewer",
      content: "Here you'll see your files opened as well as preview GCode and machine moves"
    },
    {
      element: "#dropdownMenu1",
      title: "Need Help?",
      content: "Opens a menu with links to the Support Community and Bug Reports"
    },
  ]});

  // Initialize the tour
  tour.init();

  // Start the tour
  tour.start();
}
