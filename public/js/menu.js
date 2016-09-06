// Common Menu Initialization
var appMenus = [
    "cam",
    "settings",
    "gcode",
    "quote",
    "tree-cam",
    "jog",
    "stats"
];

function makeTabActive(tabname) {
    var menuName = "#" + tabname + "-menu";
    var panelName = menuName + "-panel";
    $('.mobtab').hide();
    $('.leftmenuitem').removeClass('active');
    $(panelName).show();
    $(menuName).addClass('active');
}

// Each menu name gets an id handler of this pattern: #[menuname]-menu 
appMenus.forEach(function(menu) {
    console.log("Adding menu handler for " + menu);
    $("#" + menu + "-menu").click(function() {
        makeTabActive(menu);
    });
}, this);



// Additional custom menu handlers to fire when each panel is shown

$('#stats-menu-panel').on('show', function(){
    var accumulatedJobTimeMS = parseInt((localStorage.getItem("accumulatedJobTimeMS") || 0),  10);
    var displayString = (accumulatedJobTimeMS / 1000).toHHMMSS();
    $("#accumulatedtime").val(displayString);
});