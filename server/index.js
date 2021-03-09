const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const router = require('./router');
const cors = require('cors');
const PORT = process.env.PORT || 5000;

const app = express();

const server = http.createServer(app);
const io = socketio(server);

io.on('connect', (socket) => {
    console.log('New connection');

    socket.emit('provide-id');

    socket.on('disconnect-chat', () => {
        console.log('Disconnected');
    });

    socket.on('join', ({ name, room }) => {
        if (!socket.rooms.has(room)) {
            socket.join(room);
        }
    });

    socket.on('time-update', ({ room, time }) => {
        verifyInRoom(socket, room);
        console.log('Time changed to ' + time + ' in Room: ' + room);
        socket.broadcast.to(room).emit('update-time', time);
    });
    socket.on('play-video-server', (room) => {
        verifyInRoom(socket, room);
        console.log('Video played in Room: ' + room);
        socket.broadcast.to(room).emit('play-video-client');
    });
    socket.on('pause-video-server', (room) => {
        verifyInRoom(socket, room);
        console.log('Video paused in Room: ' + room);
        socket.broadcast.to(room).emit('pause-video-client');
    });

    socket.on('change-url', ({ room, url }) => {
        console.log('l');
        socket.broadcast.to(room).emit('update-url', url);
    });

    socket.on('disconnect', () => {
        try {
            console.log(user.name + ' left');
        } catch (e) {}
    });

    const verifyInRoom = (socket, room) => {
        if (!socket.rooms.has(room)) {
            socket.join(room);
        }
    };
});

// app.use(cors());
app.use(router);

server.listen(PORT, () => console.log(`Server has started`));
