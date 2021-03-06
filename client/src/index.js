const { app, BrowserWindow, session, ipcMain } = require('electron');
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
        },
    });
    // win.setMenu(null);
    win.loadFile('index.html');
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

app.on('web-contents-created', (event, contents) => {
    contents.on('will-attach-webview', (event, webPreferences, params) => {
        if (!params.src.startsWith('https://linushche.github.io/')) {
            event.preventDefault();
            delete webPreferences.preload;
            delete webPreferences.preloadURL;
            webPreferences.nodeIntegration = false;
        }
    });
});
