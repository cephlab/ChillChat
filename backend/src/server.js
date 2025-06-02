// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const setRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes'); // Import du routeur d'authentification
const socketHandler = require('./socket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Set up routes
setRoutes(app);
app.use('/api/auth', authRoutes);  // Montage des routes d'authentification

// Handle socket connections
socketHandler(io);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
