const socketHelper = (socket, webview) => {
    socket.on('update-time', (time) => {
        webview.send('self-update', time);
    });

    socket.on('play-video-client', () => {
        webview.send('self-play');
    });

    socket.on('pause-video-client', () => {
        webview.send('self-pause');
    });

    socket.on('update-url', (url) => {
        webview
            .loadURL(url)
            .then(() => {
                afterURLLoad();
            })
            .catch((e) => console.error(e));
    });

    const afterURLLoad = () => {
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
        setTimeout(() => {
            webview.send('initialize');
        }, 2000);
    };

    const retryJoinSocket = (name, room) => {
        socket.on('provide-id', () => {
            socket.emit('join', { name, room }, () => {});
        });
    };

    const joinRoom = (name, room) => {
        socket.emit('join', { name, room }, () => {});
        retryJoinSocket(name, room);
    };

    const findAllPeopleInRoom = () => {
        socket.emit('');
    };

    return { joinRoom, findAllPeopleInRoom };
};

module.exports = socketHelper;
