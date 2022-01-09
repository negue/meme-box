import * as electron from 'electron';
import {app, BrowserWindow, dialog, ipcMain, Menu, MessageBoxSyncOptions, nativeImage, shell, Tray} from 'electron';
import * as path from 'path';
import {join} from 'path';
import {NEW_CONFIG_PATH} from "./server/path.utils";
import {bootstrapTsED} from "./server/server.bootstrap";
import {getAppRootPath, getElectronPath, isInElectron} from "./server/file.utilts";

// TODO Refactor / Abstract the electron usages

app.disableHardwareAcceleration();

var fs = require("fs");

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve')
    && !args.some(val => val === '--built-serve');

// todo add electron "dev"-mode to not use "--serve"

// Starts the Backend and gets the port to use it
const portPromise = bootstrapTsED().then(({expressServer}) => {
  return expressServer.get('port');
});

// fix https://github.com/electron/electron/issues/1344#issuecomment-464480796
const openExternalLinksInOSBrowser = (event, url) => {
  if (url.match(/.*localhost.*/gi) === null && (url.startsWith('http:') || url.startsWith('https:'))) {
    event.preventDefault();
    shell.openExternal(url);
  }
};

var initPath = path.join(NEW_CONFIG_PATH, "init.json");
var data = { bounds: { width: 800, height: 600 }};
try {
  data = JSON.parse(fs.readFileSync(initPath, 'utf8'));
}
catch(e) {
}

let alreadyAllowedToBeHidden = false;
let tray;
function createTray () {
  function toggle () {
    if (win !== null) {
      win.close();
    } else {
      createWindow();
    }
  }


  const appRootPath = getAppRootPath();

  const trayIcon = join(appRootPath, 'assets/icons/favicon.256x256.png');
  const trayIconNativeImage = nativeImage.createFromPath(
    trayIcon
  );

  const resized = trayIconNativeImage.resize({ width: 16, height: 16 });

  tray = new Tray(resized);

  let template = [{
    label: 'Toggle',
    click: () => {
      // when that option is pressed, you don't need another question if hide / quit
      alreadyAllowedToBeHidden = true;
      toggle();
    }
  },
    {
      label: 'Quit',
      click: () => {
        // when that option is pressed, you don't need another question if hide / quit
        alreadyAllowedToBeHidden = true;
        app.quit();
      }
    }];

  var trayMenu = Menu.buildFromTemplate(template);
  tray.setContextMenu(trayMenu);
  tray.setToolTip('Meme-Box');
  tray.addListener('double-click',  (event: KeyboardEvent) => {
    alreadyAllowedToBeHidden = true;
    toggle();
  });
}

function createWindow(): BrowserWindow {
  const {width, height} = data.bounds;

  const electronPath = getElectronPath();

  console.info({ isInElectron, __dirname });

  // Create the browser window.
  win = new BrowserWindow({
    width, height,
    webPreferences: {
      // Disabled Node integration
      nodeIntegration: false,
      // protect against prototype pollution
      contextIsolation: true,
      // turn off remote
      enableRemoteModule: false,
      // Preload script
      preload: path.join(electronPath, 'preload.js'),

      nativeWindowOpen: true
    },
  });

  portPromise.then((port) => {
    if (serve) {
      win.webContents.openDevTools();

      require('electron-reload')(__dirname, {
        electron: electron,
        argv: ['--serve']
      });
      win.loadURL(`http://localhost:4200?port=${port}`);
    } else {
      win.loadURL(  `http://localhost:${port}`);
    }
  });

  win.on("close", function(e) {
    var data = {
      bounds: win.getBounds()
    };
    fs.writeFileSync(initPath, JSON.stringify(data));

    // ask it hide or close if its triggered from the Electron Window
  if (!alreadyAllowedToBeHidden) {
    const result = dialog.showMessageBoxSync(win, {
      message: 'Hide to tray or quit?',
      buttons: [
        'To Tray',
        'Quit Meme-Box'
      ]
    } as MessageBoxSyncOptions);

    if (result === 0) {
      // do nothing :)
      alreadyAllowedToBeHidden = true;
    }

    if (result === 1) {
      app.quit();
    }
  }
  });

  const ipcSelectDirEvent = async (event) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    console.log('directories selected', result.filePaths);

    const arg =  result.filePaths?.[0] ?? '';

    event.sender.send('dir-selected', arg);
  };

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;

    ipcMain.off('select-dirs', ipcSelectDirEvent);
  });


  win.webContents.on('new-window', openExternalLinksInOSBrowser);
  win.webContents.on('will-navigate', openExternalLinksInOSBrowser);

  ipcMain.on('select-dirs', ipcSelectDirEvent);

  return win;
}



try {

  app.allowRendererProcessReuse = true;

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {

    // create the first window on startup
    setTimeout(createWindow, 400)

    createTray();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      // app.quit();
      // TODO check if it still works with Cmd Q on Mac - because of the tray icon
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
