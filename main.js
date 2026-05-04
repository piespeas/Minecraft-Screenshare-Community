const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 620,
    frame: false,
    transparent: true,
    resizable: false,
    backgroundColor: "#00000000",
    icon: path.join(__dirname, "assets/logo.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("renderer/index.html");

  global.win = win;
}

app.whenReady().then(createWindow);