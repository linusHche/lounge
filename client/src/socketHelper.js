import { host } from '../constants';
import { changeCalibrationStatus } from './Actions/roomActions';
import { updateRoomState } from './Actions/roomActions';

class Socket {
    constructor(room, store) {
        this.room = room;
        this.store = store;
        // this.socket = io(host);
        this.socket = new WebSocket(host.wsURL);
        this.init();
    }

    init() {
        const { socket, room, store, send, sendValue } = this;
        const {
            addFunctionToMapping,
            sendToBrowserView,
            updateUrl: browserViewUpdateUrl,
        } = window.electronapi;
        let user = this.store.getState().room.mainUser;

        let interval = setInterval(() => {
            if (this.socket.readyState == this.socket.OPEN) {
                this.sendValue('register-user', user.username);
                clearInterval(interval);
            }
        }, 1000);

        addFunctionToMapping(
            'time-update',
            (time) => sendValue.call(this, 'time-update', time)
            // socket.emit('time-update', { time, roomId: room })
        );
        addFunctionToMapping(
            'play-video',
            () => send.call(this, 'play-video')
            // socket.emit('play-video-server', room)
        );
        addFunctionToMapping(
            'pause-video',
            () => {
                send.call(this, 'pause-video')
            }
            // socket.emit('pause-video-server', room)
        );

        fetch(host.httpURL + '/room/adduser', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)
        })
            .then((res) => res.json())
            .then((data) => store.dispatch(updateRoomState(data)));
        //     store.dispatch(updateRoomState(roomState));

        socket.onmessage = function (e) {
            const message = JSON.parse(e.data);
            switch (message.Event) {
                case 'time-update':
                    sendToBrowserView('self-update', message.Value);
                    break;
                case 'play-video':
                    sendToBrowserView('self-play');
                    break;
                case 'pause-video':
                    sendToBrowserView('self-pause');
                    break;
                case 'change-url':
                    browserViewUpdateUrl(
                        'send-to-browserview',
                        message.Value
                    ).then((result) => {
                        if (result) {
                            store.dispatch(changeCalibrationStatus(false));
                        }
                    });
                case 'update-room-state':
                    let roomState = JSON.parse(message.Value);
                    store.dispatch(updateRoomState(roomState));
                    break;
            }
        };
    }
    changeUrl(url) {
        this.sendValue('change-url', url);
    }
    retryJoinSocket(user, room) {
        const { socket, store } = this;
        // socket.on('provide-id', () => {
        //     socket.emit('join', { roomId: room, user }, () => {});
        // });
    }
    joinRoom(room) {
        // let user = this.store.getState().room.mainUser;
        // this.socket.emit('join', { roomId: room, user }, () => {});
        // this.retryJoinSocket(user, room);
    }

    updateUser(user) {
        this.sendValue('update-user', JSON.stringify(user))
        // this.socket.emit('update-user', { roomId: this.room, user });
    }

    send(event) {
        this.sendValue(event, '');
    }

    sendValue(event, value) {
        this.socket.send(JSON.stringify({ event, value }));
        // this.socket.send(JSON.stringify({ XD: 'change-url' }));
    }
}
let socket = null;
export default function (room, store) {
    if (!socket) socket = new Socket(room, store);
    return socket;
}
