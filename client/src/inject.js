const { ipcRenderer } = require('electron');

ipcRenderer.on('initialize', (e, arg) => {
    let videoPlayer = document.getElementsByTagName('video');
    let videoPlayers = document.getElementsByTagName('video');
    let timer = 3;
    let interval = setInterval(() => {
        if (videoPlayers.length > 0) {
            clearInterval(interval);
            continueInitialization();
            ipcRenderer.sendToHost('calibration-success');
        } else if (timer) {
            videoPlayers = document.getElementsByTagName('video');
            timer--;
        } else {
            clearInterval(interval);
        }
    }, 2000);

    const continueInitialization = () => {
        let externalControl = false;
        let videoPlayers = document.getElementsByTagName('video');
        for (let player of videoPlayers) {
            if (!isNaN(player.duration)) videoPlayer = player;
        }
        videoPlayer.style.border = '3px solid green';
        setTimeout(() => {
            videoPlayer.style.border = '';
        }, 2000);
        videoPlayer.onplay = () => {
            if (!externalControl) ipcRenderer.sendToHost('play-video');
            externalControl = false;
        };
        videoPlayer.onpause = () => {
            if (!externalControl) ipcRenderer.sendToHost('pause-video');
            externalControl = false;
        };
        let seeked = false;
        videoPlayer.onseeking = () => {
            if (!seeked) {
                seeked = true;
                videoPlayer.pause();
                if (!externalControl)
                    ipcRenderer.sendToHost(
                        'time-update',
                        videoPlayer.currentTime.toString()
                    );
            }
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
