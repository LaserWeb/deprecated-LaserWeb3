var tour;

function initTour() {
  tour = new Tour({
    smartPlacement: true,
    container: "body",
    steps: [
    {
      element: "#connect",
      title: "Setup connection",
      content: "Note: You need Serial Port JSON Server running!<br>Select a Serial Port, Buffer and Baud rate, then connect.  "
    },
    {
      element: "#openbutton",
      title: "Open Files",
      content: "Use this button to open DXF or SVG files for cutting,  and Bitmap files (JPG, GIF, PNG, BMP) for Engraving"
    },
    {
      element: "#userpic",
      title: "Optional: Google Drive",
      content: "You can sign in to your Google Drive and load job files directly from Google Drive"
    },
    {
      element: "#toggleviewer",
      title: "Machine Control",
      content: "On this tab you can start/stop jobs, jog the machine, zero out work coordinates, etc",
      onShow: function (tour) { $('#toggleviewer').click()}
    },
    {
      element: "#togglefile",
      title: "CAM -> Gcode Generator",
      content: "On this tab, you convert an opened file, to GCODE that the machine can understand. Here you'll set per-job parameters like laser power, feedrate, etc",
      onShow: function (tour) { $('#togglefile').click()}
    },
    {
      element: "#togglesettings",
      title: "Configure LaserWeb",
      content: "NB: Don't forget to configure LaserWeb to your specific machine! From the bed size, to Gcode commands, enabling features like touchscreen support and tool offset, camera overlays, etc.  Also quite critical, provide the IP address of the machine/device where you are running Serial Port JSON Server",
      onShow: function (tour) { $('#togglesettings').click()}
    },
    {
      element: "#dropdownMenu1",
      title: "Help Me!",
      content: "When you feel stuck, just hit this button and we'll try and help you out!"
    },
    {
      element: "#transformcontrols",
      title: "Transform Controls",
      content: "Used for rotating, moving and scaling your files to prepare them for the job at hand"
    },
    {
      element: "#viewcontrols",
      title: "View Controls",
      content: "Macro mode allows you configure a few custom buttons, and Reset View zooms the loaded file into view"
    },
    {
      element: "#pancontrols",
      title: "Pan / Zoom controls",
      content: "Adjust your viewpoint"
    },
    {
      element: "#renderArea",
      title: "The Viewer",
      content: "Here you'll see your files opened as well as preview GCODE and machine moves"
    },
    {
      element: "#drotabtn",
      title: "DRO",
      content: "The DRO displays realtime position feedback from the machine.  Useful for setting offsets, monitoring jobs, etc",
      onShow: function (tour) { $('#drotabtn').click()},
      placement: 'left'
    },
    {
      element: "#gcodetabbtn",
      title: "G Code Tab",
      content: "View and Save the GCODE your generated",
      onShow: function (tour) { $('#gcodetabbtn').click()},
      onHide: function (tour) { $('#drotabtn').click()},
      placement: 'left'
    },
    {
      element: "#command",
      title: "Manual Commands",
      content: "Use to send custom M and G code commands to your machine",
      placement: 'left'
    },
    {
      element: "#console",
      title: "Log / Console",
      content: "Displays feedback from the machine, as well as log output from LaserWeb itself",
      placement: 'left'
    },
  ]});

  // Initialize the tour
  tour.init();

  // Start the tour
  tour.start();
}
