module.exports = function (io) {
    const rooms = new Map(); // Store room participants

    io.on('connection', socket => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join-room', ({ roomId, userName }) => {
            // Join the socket room
            socket.join(roomId);
            
            // Initialize room if it doesn't exist
            if (!rooms.has(roomId)) {
                rooms.set(roomId, new Set());
            }
            
            // Add user to room participants
            rooms.get(roomId).add(socket.id);
            
            // Notify others in the room
            socket.to(roomId).emit('user-joined', { userId: socket.id, userName });
            
            // Send list of existing participants to the new user
            const participants = Array.from(rooms.get(roomId));
            socket.emit('existing-participants', { participants });
            
            console.log(`User ${socket.id} joined room ${roomId}`);
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
        socket.on('leave-room', ({ roomId }) => {
            handleUserLeaving(socket, roomId);
        });

        // Handle disconnection
        socket.on('disconnecting', () => {
            // Find and leave all rooms the user was in
            for (const [roomId, participants] of rooms.entries()) {
                if (participants.has(socket.id)) {
                    handleUserLeaving(socket, roomId);
                }
            }
            console.log(`User disconnected: ${socket.id}`);
        });

        function handleUserLeaving(socket, roomId) {
            if (rooms.has(roomId)) {
                // Remove user from room participants
                rooms.get(roomId).delete(socket.id);
                
                // If room is empty, delete it
                if (rooms.get(roomId).size === 0) {
                    rooms.delete(roomId);
                }
                
                // Notify others in the room
                socket.to(roomId).emit('user-left', { userId: socket.id });
                socket.leave(roomId);
                
                console.log(`User ${socket.id} left room ${roomId}`);
            }
        }
    });
};