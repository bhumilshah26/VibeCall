module.exports = function (io) {
    const rooms = new Map(); // Store room participants by room code
    const userRooms = new Map(); // Store which room each user is in
    const userNames = new Map(); // Store user names

    const emitRoomUpdate = (event, data) => {
        io.emit(event, data);
    };

    io.on('connection', socket => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join-room', ({ roomCode, userName }) => {
            console.log(`User ${socket.id} (${userName}) joining room ${roomCode}`);
            
            // Join the socket room using room code
            socket.join(roomCode);
            
            // Initialize room if it doesn't exist
            if (!rooms.has(roomCode)) {
                rooms.set(roomCode, new Set());
            }
            
            // Add user to room participants
            rooms.get(roomCode).add(socket.id);
            userRooms.set(socket.id, roomCode);
            userNames.set(socket.id, userName);
            
            // Notify others in the room
            socket.to(roomCode).emit('user-joined', { 
                userId: socket.id, 
                userName: userName 
            });
            
            // Send list of existing participants to the new user
            const participants = Array.from(rooms.get(roomCode));
            console.log(`Room ${roomCode} participants:`, participants);
            socket.emit('existing-participants', { participants });
            
            console.log(`User ${socket.id} (${userName}) joined room ${roomCode}. Total participants: ${rooms.get(roomCode).size}`);
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

        socket.on('leave-room', ({ roomCode }) => {
            console.log(1);
            handleUserLeaving(socket, roomCode);
        });

        socket.on('disconnecting', () => {
            console.log(2);
            const roomCode = userRooms.get(socket.id);
            if (roomCode) {
                console.log(3, roomCode);
                handleUserLeaving(socket, roomCode);
            }
            console.log(`User disconnected: ${socket.id}`);
        });

        function handleUserLeaving(socket, roomCode) {
            console.log(`User ${socket.id} leaving room ${roomCode}`);
            
            if (rooms.has(roomCode)) {
                // Remove user from room participants
                rooms.get(roomCode).delete(socket.id);
                userRooms.delete(socket.id);
                userNames.delete(socket.id);
                
                // If room is empty, delete it
                if (rooms.get(roomCode).size === 0) {
                    rooms.delete(roomCode);
                    console.log(`Room ${roomCode} deleted (no participants left)`);
                } else {
                    console.log(`Room ${roomCode} remaining participants: ${rooms.get(roomCode).size}`);
                }
                
                // Notify others in the room
                socket.to(roomCode).emit('user-left', { 
                    userId: socket.id,
                    userName: userNames.get(socket.id) || 'Unknown'
                });
                socket.leave(roomCode);
                
                console.log(`User ${socket.id} left room ${roomCode}`);
            }
        }

        // Debug endpoint to see current room state
        socket.on('get-room-info', ({ roomCode }) => {
            if (rooms.has(roomCode)) {
                const participants = Array.from(rooms.get(roomCode));
                socket.emit('room-info', { 
                    roomCode, 
                    participantCount: participants.length,
                    participants: participants.map(id => ({
                        id,
                        name: userNames.get(id) || 'Unknown'
                    }))
                });
            }
        });
    });
};