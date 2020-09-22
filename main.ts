import {app, BrowserWindow} from 'electron';
import * as path from 'path';
import {expressServer} from './server/server-app';
import {NEW_CONFIG_PATH} from "./server/persistence";

var fs = require("fs");

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

var initPath = path.join(NEW_CONFIG_PATH, "init.json");
var data = { bounds: { width: 800, height: 600 }};
try {
  data = JSON.parse(fs.readFileSync(initPath, 'utf8'));
}
catch(e) {
}

function createWindow(): BrowserWindow {
  // Create the browser window.
  win = new BrowserWindow({
    ...data.bounds,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
    },
  });

  if (serve) {

    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/../node_modules/electron`),
      argv: ['--serve']
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(  `http://localhost:${expressServer.get('port')}`);
  }

  win.on("close", function() {
    var data = {
      bounds: win.getBounds()
    };
    fs.writeFileSync(initPath, JSON.stringify(data));
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {

app.allowRendererProcessReuse = true;

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  throw e;
}
