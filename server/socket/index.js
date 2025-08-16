module.exports = function (io) {
    const rooms = new Map(); // Store room participants by room code
    const userRooms = new Map(); // Store which room each user is in

    io.on('connection', socket => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join-room', ({ roomCode, userName }) => {
            // Join the socket room using room code
            socket.join(roomCode);
            
            // Initialize room if it doesn't exist
            if (!rooms.has(roomCode)) {
                rooms.set(roomCode, new Set());
            }
            
            // Add user to room participants
            rooms.get(roomCode).add(socket.id);
            userRooms.set(socket.id, roomCode);
            
            // Notify others in the room
            socket.to(roomCode).emit('user-joined', { userId: socket.id, userName });
            
            // Send list of existing participants to the new user
            const participants = Array.from(rooms.get(roomCode));
            socket.emit('existing-participants', { participants });
            
            console.log(`User ${socket.id} joined room ${roomCode}`);
        });

        // Handle call initiation
        socket.on('call-user', ({ to, offer }) => {
            console.log(`Call request from ${socket.id} to ${to}`);
            io.to(to).emit('call-user', {
                from: socket.id,
                offer
            });
        });

        // Handle call answer
        socket.on('make-answer', ({ to, answer }) => {
            console.log(`Answer from ${socket.id} to ${to}`);
            io.to(to).emit('answer-made', {
                from: socket.id,
                answer
            });
        });

        // Handle ICE candidates
        socket.on('ice-candidate', ({ to, candidate }) => {
            console.log(`ICE candidate from ${socket.id} to ${to}`);
            io.to(to).emit('ice-candidate', {
                from: socket.id,
                candidate
            });
        });

        // Handle room leaving
        socket.on('leave-room', ({ roomCode }) => {
            handleUserLeaving(socket, roomCode);
        });

        // Handle disconnection
        socket.on('disconnecting', () => {
            // Find and leave the room the user was in
            const roomCode = userRooms.get(socket.id);
            if (roomCode) {
                handleUserLeaving(socket, roomCode);
            }
            console.log(`User disconnected: ${socket.id}`);
        });

        function handleUserLeaving(socket, roomCode) {
            if (rooms.has(roomCode)) {
                // Remove user from room participants
                rooms.get(roomCode).delete(socket.id);
                userRooms.delete(socket.id);
                
                // If room is empty, delete it
                if (rooms.get(roomCode).size === 0) {
                    rooms.delete(roomCode);
                }
                
                // Notify others in the room
                socket.to(roomCode).emit('user-left', { userId: socket.id });
                socket.leave(roomCode);
                
                console.log(`User ${socket.id} left room ${roomCode}`);
            }
        }
    });
};