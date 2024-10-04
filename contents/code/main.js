// initialization
const config = {
    classList: [] /*readConfig("classList", "")
        .toLowerCase()
        .split("\n")
        .map((s) => s.trim())*/,
    allowMode: true, //readConfig("allowMode", true),
    denyMode: false, //readConfig("denyMode", false),
    debugMode: true, //readConfig("debugMode", true)
};

function debug(...args) {
    if (config.debugMode) console.debug("owac:", ...args);
}
debug("initializing");
debug("config:", config.allowMode ? "allow" : "deny", "list", config.classList);

function geomcontains (geom, pos) {
    return pos.x >= geom.x && pos.x <= geom.x + geom.width
        && pos.y >= geom.y && pos.y <= geom.y + geom.height;
}

// when a window is added
workspace.windowAdded.connect(window => {
    
    // get active screen
    var activeScreen = workspace.activeScreen;
    
    // abort conditions
    if (!window // null
        || (config.allowMode && config.classList.includes(String(window.resourceClass))) // using allowmode and window class is in list
        || (config.denyMode && !config.classList.includes(String(window.resourceClass))) // using denymode and window class is not in list
        || !(window.resizeable && window.moveable && window.moveableAcrossScreens) // not regeomtrizable
        || window.screen == activeScreen) // already on right screen
        return;
    
    
    
    // scann all workspace.screens to match mouse position storen into workspace.cursorPos
    let mouseposscreen = workspace.screens.find(screen => geomcontains(screen.geometry,workspace.cursorPos));
        
    debug("window", JSON.stringify(window, undefined, 2));
    // debug("workspace", JSON.stringify(workspace, undefined, 0));
    // move window to active screen
    if (mouseposscreen) {
        debug("sending window", window.caption, "to MOUSEPOS active screen", mouseposscreen);
        workspace.sendClientToScreen(window, mouseposscreen);
    } else {
        debug("sending window", window.caption, "to active screen", activeScreen);
        workspace.sendClientToScreen(window, activeScreen);
    }

    // clip and move window into bounds of screen dimensions
    const area = workspace.clientArea(KWin.MaximizeArea, window);
    window.frameGeometry.width = Math.min(area.width, window.width);
    window.frameGeometry.height = Math.min(area.height, window.height);
    window.frameGeometry.x = Math.max(area.x, Math.min(area.x + area.width - window.width, window.x));
    window.frameGeometry.y = Math.max(area.y, Math.min(area.y + area.height - window.height, window.y));
});
