// Console header
console.log("%c%s","color: #000; background: green; font-size: 12px;", "STARTING LASERWEB");

// Intialise
lw.init();

var objectsInScene = []; //array that holds all objects we added to the lw.viewer.scene.
//initTabs();

initJog();
var paperscript = {};
rasterInit();
macrosInit();
initSocket();
initTour();
initSmoothie();
initEsp8266();
initTree();
