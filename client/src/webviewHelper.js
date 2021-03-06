const webviewHelper = (socket, webview, room) => {
    let socketHelper = null;
    webview.addEventListener('ipc-message', (event) => {
        switch (event.channel) {
            case 'time-update':
                socket.emit('time-update', { time: event.args[0], room });
                break;
            case 'play-video':
                socket.emit('play-video-server', room);
                break;
            case 'pause-video':
                socket.emit('pause-video-server', room);
                break;
            case 'calibration-success':
                calibrationStatusUpdate(true);
                break;
        }
    });

    const calibrationStatusUpdate = (success) => {
        let calibrationStatus = $('#calibration-status');
        if (success) {
            anime({
                targets: '#calibration-status',
                width: '6vw',
                backgroundColor: '#33cc33',
                left: '3vw',
                duration: 2000,
            });
            calibrationStatus.text('Calibrated');
        }
    };

    const loadURL = (url) => {
        webview
            .loadURL(url)
            .then(() => {
                afterURLLoad(url);
            })
            .catch((e) => console.error(e));
    };

    const afterURLLoad = (url) => {
        let calibrationStatus = $('#calibration-status');
        anime({
            targets: '#calibration-status',
            width: '8vw',
            backgroundColor: '#ff0000',
            duration: 2000,
            left: '2vw',
        });
        calibrationStatus.text('Not Calibrated');
        urlInput.value = '';

        socket.emit('change-url', { room, url });
        setTimeout(() => {
            webview.send('initialize');
        }, 2000);
    };

    const setSocketHelper = (_socketHelper) => {
        socketHelper = _socketHelper;
    };

    const getWebView = () => {
        return webview;
    };

    return {
        calibrationStatusUpdate,
        loadURL,
        getWebView,
        setSocketHelper,
    };
};
module.exports = webviewHelper;
