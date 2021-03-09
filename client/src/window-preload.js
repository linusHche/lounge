const { contextBridge, ipcRenderer } = require('electron');

const functionMappings = {};
const handleFunctionsFromRenderer = (e, arg) => {
    const { channel, data } = arg;
    if (Object.keys(functionMappings).includes(channel)) {
        functionMappings[channel](data);
    }
};
const allowedChannels = ['send-to-main', 'send-to-browserview'];
contextBridge.exposeInMainWorld('electronapi', {
    initEnterFullScreen: (channel, func) => {
        if (allowedChannels.includes(channel))
            ipcRenderer.on('enter-fullscreen', func);
    },
    initExitFullScreen: (channel, func) => {
        if (allowedChannels.includes(channel))
            ipcRenderer.on('exit-fullscreen', func);
    },
    setBounds: (channel, data) => {
        ipcRenderer.invoke('build-browserview', data);
    },
    updateUrl: (channel, data) => {
        if (allowedChannels.includes(channel))
            return ipcRenderer.invoke('update-url', data);
    },
    addFunctionToMapping: (channel, func) => {
        functionMappings[channel] = func;
    },
    sendToBrowserView: (channel, data) => {
        ipcRenderer.invoke('send-to-browserview', { channel, data });
    },
});
ipcRenderer.on('send-from-main', handleFunctionsFromRenderer);
