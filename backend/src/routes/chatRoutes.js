const express = require('express');
const ChatController = require('../controllers/chatController');

const setRoutes = (app) => {
    const chatController = new ChatController();

    app.post('/api/chat/rooms', chatController.createRoom.bind(chatController));
    app.post('/api/chat/rooms/:roomId/join', chatController.joinRoom.bind(chatController));
    app.post('/api/chat/rooms/:roomId/messages', chatController.sendMessage.bind(chatController));
    app.get('/api/chat/rooms/:roomId/messages', chatController.getMessages.bind(chatController));
    app.get('/api/chat/rooms/:roomId/users', chatController.getUsers.bind(chatController));
};

module.exports = setRoutes;