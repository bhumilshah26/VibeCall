module.exports = function (io) {
    io.on('connection', socket => {
        console.log(`User connect to ${socket.id}`);

        socket.on('join-room', ({ roomCode, userName }) => {
            socket.join(roomCode);
            socket.to(roomCode).emit('user-joined', { userName, id: socket.id });
        });

        socket.on('send-signal', ({ userToSignal, callerId, signal }) => {
            io.to(userToSignal).emit('receive-signal', { signal, callerId });
        });

        socket.on('return-signal', ({ callerId, signal }) => {
            io.to(callerId).emit('receive-returned-signal', { signal, id:socket.id });
        });

        socket.on('disconnecting', () => {
            console.log(`User is disconnected ${socket.id}`);
        });
    });
};