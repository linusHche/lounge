const { ipcRenderer } = require('electron');
const $ = require('jquery');
let host = require('./constants.js').host;
let recalibrate = document.getElementById('recalibrate-btn');
const webview = document.getElementById('embedded-player');
const socket = io(host);
let name = 'user' + Math.floor(Math.random() * 100 + 1);
let room = 'test';
const webviewHelper = require('./src/webviewHelper.js')(socket, webview, room);
const socketHelper = require('./src/socketHelper.js')(socket, webview);

socketHelper.joinRoom(name, room);
recalibrate.onclick = () => {
    webview.send('initialize');
};

let urlInput = document.getElementById('url-input');
urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') webviewHelper.loadURL(e.target.value);
});
let goSearch = document.getElementById('go-search');
goSearch.addEventListener('click', () => webviewHelper.loadURL(urlInput.value));

ipcRenderer.on('enter-fullscreen', () => {
    const view = document.getElementById('embedded-player');
    view.style.height = '100vh';
    view.style.width = '100vw';
    view.style.left = '0';
    view.style.top = '0';
});

ipcRenderer.on('exit-fullscreen', () => {
    const view = document.getElementById('embedded-player');
    view.style.height = '90vh';
    view.style.width = '90vw';
    view.style.left = '5vw';
    view.style.top = '5vh';
});
