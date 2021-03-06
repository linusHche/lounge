const { ipcRenderer } = require('electron');
const sendFromBrowserView = 'send-from-browserview';
ipcRenderer.on('initalize-browserview', () => {
    initalize();
});
const initalize = () => {
    let videoPlayers = document.getElementsByTagName('video');
    let timer = 3;
    let interval = setInterval(() => {
        if (videoPlayers.length) {
            for (let player of videoPlayers) {
                if (player.readyState === 4 && !isNaN(player.duration)) {
                    clearInterval(interval);
                    continueInitialization(player);
                    ipcRenderer.invoke(sendFromBrowserView, {
                        channel: 'handle-calibration',
                        data: true,
                    });
                }
            }
        } else if (timer) {
            videoPlayers = document.getElementsByTagName('video');
            timer--;
        } else {
            clearInterval(interval);
        }
    }, 2000);
};

const continueInitialization = (videoPlayer) => {
    videoPlayer.autoplay = false;
    let externalControl = false;
    let seeking = false;
    videoPlayer.addEventListener('play', () => {
        console.log(seeking + ' play');
        if (!externalControl) {
            ipcRenderer.invoke(sendFromBrowserView, { channel: 'play-video' });
        }
        externalControl = false;
    });
    videoPlayer.addEventListener('pause', () => {
        console.log(seeking + ' pause');
        if (!externalControl) {
            ipcRenderer.invoke(sendFromBrowserView, { channel: 'pause-video' });
        }
        externalControl = false;
    });
    videoPlayer.addEventListener('waiting', () => {
        console.log('iswaiting');
    });
    let count = 1;
    videoPlayer.addEventListener('seeking', () => {
        seeking = true;
        if (!externalControl) {
            if (count > 10) {
                return;
            }
            count++;
            setTimeout(() => {
                count = 0;
            }, 500);
            ipcRenderer.invoke(sendFromBrowserView, {
                channel: 'time-update',
                data: videoPlayer.currentTime.toString(),
            });
        }
        externalControl = false;
    });
    videoPlayer.addEventListener('seeked', () => {
        seeking = false;
    });

    ipcRenderer.on('send-from-renderer', (e, arg) => {
        const { channel, data } = arg;
        switch (channel) {
            case 'self-play':
                externalControl = true;
                videoPlayer.play();
                break;
            case 'self-pause':
                externalControl = true;
                videoPlayer.pause();
                break;
            case 'self-update':
                externalControl = true;
                videoPlayer.currentTime = parseFloat(data);
                setTimeout(() => {
                    seeked = false;
                }, 500);
        }
    });
};
