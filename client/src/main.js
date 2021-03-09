const { app, BrowserWindow, ipcMain, BrowserView } = require('electron');
const path = require('path');
let view = null;
let win = null;
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'window-preload.js'),
            nodeIntegration: false,
            sandbox: true,
            enableRemoteModule: false,
        },
    });
    // win.setMenu(null);
    win.loadFile('build/index.html');
    win.on('enter-html-full-screen', () => {
        win.webContents.send('enter-fullscreen');
    });
    win.on('leave-html-full-screen', () => {
        win.webContents.send('exit-fullscreen');
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('build-browserview', (e, arg) => {
    if (!view) {
        view = new BrowserView({
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                preload: path.join(__dirname, 'browserview-preload.js'),
                sandbox: true,
                enableRemoteModule: false,
                allowPopups: false,
            },
        });
        view.webContents.loadURL('https://linushche.github.io');
        win.setBrowserView(view);
        view.webContents.on('enter-html-full-screen', () => {
            win.webContents.send('send-from-main', {
                channel: 'enter-full-screen',
            });
        });
        view.webContents.on('leave-html-full-screen', () => {
            win.webContents.send('send-from-main', {
                channel: 'leave-full-screen',
            });
        });
    }
    view.setBounds(arg);
});

ipcMain.handle('update-url', async (e, arg) => {
    try {
        await view.webContents.loadURL(arg);
        view.webContents.send('initalize-browserview');
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
});

ipcMain.handle('send-to-browserview', async (e, arg) => {
    const { channel, data } = arg;
    switch (channel) {
        case 'recalibrate':
            view.webContents.send('initalize-browserview');
            break;
        case 'update-url':
            try {
                await view.webContents.loadURL(arg);
                view.webContents.send('initalize-browserview');
                return true;
            } catch (e) {
                console.log(e);
                return false;
            }
        default:
            view.webContents.send('send-from-renderer', arg);
    }
});

ipcMain.handle('send-from-browserview', (e, arg) => {
    win.webContents.send('send-from-main', arg);
});
