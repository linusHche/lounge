import io from 'socket.io-client';
import { host } from '../constants';
import { inputUrl, changeCalibrationStatus } from './Actions/topBarActions';

class Socket {
    constructor(room, store) {
        this.room = room;
        this.store = store;
        this.socket = io(host);
        this.init();
    }

    init() {
        const { socket, room, store } = this;
        const {
            addFunctionToMapping,
            sendToBrowserView,
            updateUrl: browserViewUpdateUrl,
        } = window.electronapi;
        addFunctionToMapping('time-update', (time) =>
            socket.emit('time-update', { time, room })
        );
        addFunctionToMapping('play-video', () =>
            socket.emit('play-video-server', room)
        );
        addFunctionToMapping('pause-video', () =>
            socket.emit('pause-video-server', room)
        );

        socket.on('update-time', (time) => {
            sendToBrowserView('self-update', time);
        });

        socket.on('play-video-client', () => {
            sendToBrowserView('self-play');
        });

        socket.on('pause-video-client', () => {
            sendToBrowserView('self-pause');
        });

        socket.on('update-url', (url) => {
            console.log('here');
            browserViewUpdateUrl('send-to-browserview', url).then((result) => {
                if (result) {
                    this.store.dispatch(
                        changeCalibrationStatus('Not Calibrated')
                    );
                }
            });
        });
    }
    changeUrl(url) {
        console.log(this.room);
        this.socket.emit('change-url', { room: this.room, url });
    }
    retryJoinSocket(name, room) {
        this.socket.on('provide-id', () => {
            this.socket.emit('join', { name, room }, () => {});
        });
    }
    joinRoom(name, room) {
        this.socket.emit('join', { name, room }, () => {});
        this.retryJoinSocket(name, room);
    }
}
let socket = null;
export default function (room, store) {
    if (!socket) socket = new Socket(room, store);
    return socket;
}
