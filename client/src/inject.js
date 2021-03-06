const { ipcRenderer } = require('electron');

ipcRenderer.on('initialize', (e, arg) => {
    let videoPlayer = document.getElementsByTagName('video');
    let videoPlayers = document.getElementsByTagName('video');
    let timer = 3;
    let interval = setInterval(() => {
        if (videoPlayers.length) {
            for (let player of videoPlayers) {
                if (player.readyState === 4 && !isNaN(player.duration)) {
                    videoPlayer = player;
                    clearInterval(interval);
                    continueInitialization();
                    ipcRenderer.sendToHost('calibration-success');
                }
            }
        } else if (timer) {
            videoPlayers = document.getElementsByTagName('video');
            timer--;
        } else {
            clearInterval(interval);
        }
    }, 2000);

    const continueInitialization = () => {
        let externalControl = false;
        // videoPlayer.style.border = '3px solid green';
        // setTimeout(() => {
        //     videoPlayer.style.border = '';
        // }, 2000);
        videoPlayer.onplay = () => {
            if (!externalControl) ipcRenderer.sendToHost('play-video');
            externalControl = false;
        };
        videoPlayer.onpause = () => {
            if (!externalControl) ipcRenderer.sendToHost('pause-video');
            externalControl = false;
        };
        videoPlayer.addEventListener('waiting', () => {
            console.log('iswaiting');
        });
        let seeked = false;
        videoPlayer.onseeking = () => {
            if (!externalControl)
                ipcRenderer.sendToHost(
                    'time-update',
                    videoPlayer.currentTime.toString()
                );
            // videoPlayer.pause();
            externalControl = false;
        };

        ipcRenderer.on('self-play', (e, arg) => {
            externalControl = true;
            if (!seeked) videoPlayer.play();
        });

        ipcRenderer.on('self-pause', (e, arg) => {
            externalControl = true;
            videoPlayer.pause();
        });

        ipcRenderer.on('self-update', (e, arg) => {
            externalControl = true;
            videoPlayer.currentTime = parseFloat(arg);
            setTimeout(() => {
                seeked = false;
            }, 500);
        });
    };
});
