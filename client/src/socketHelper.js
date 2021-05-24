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
            () => send.call(this, 'pause-video')
            // socket.emit('pause-video-server', room)
        );

        addFunctionToMapping('closing-window', () => {
            fetch(host.httpURL + '/room/removeuser', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user)
            })
            socket.close();
            // socket.disconnect();
        });

        let user = this.store.getState().room.mainUser;
        console.log(user);
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
            console.log(message);
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
                    break;
            }
        };
        // socket.on('update-time', (time) => {
        //     sendToBrowserView('self-update', time);
        // });

        // socket.on('play-video-client', () => {
        //     sendToBrowserView('self-play');
        // });

        // socket.on('pause-video-client', () => {
        //     sendToBrowserView('self-pause');
        // });

        // socket.on('update-url', (url) => {
        //     browserViewUpdateUrl('send-to-browserview', url).then((result) => {
        //         if (result) {
        //             this.store.dispatch(changeCalibrationStatus(false));
        //         }
        //     });
        // });

        // socket.on('update-room-state', (roomState) => {
        //     store.dispatch(updateRoomState(roomState));
        // });
    }
    changeUrl(url) {
        this.sendValue('change-url', url);
        // this.socket.emit('change-url', { room: this.room, url });
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
