const { insertMessage, getMessagesByRoom } = require('../db/sqlite');

class ChatController {
    constructor() {}

    async createRoom(req, res) {
        // Simule la création d'une room avec un code unique
        const roomCode = Math.random().toString(36).substring(2, 8);
        res.status(201).json({ roomCode });
    }

    async joinRoom(req, res) {
        const roomId = req.params.roomId;
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        // Ici tu peux ajouter une logique de suivi des utilisateurs
        res.status(200).json({ message: `User ${username} joined room ${roomId}` });
    }

    async sendMessage(req, res) {
        const roomId = req.params.roomId;
        const { username, message } = req.body;

        if (!username || !message) {
            return res.status(400).json({ error: 'Username and message are required' });
        }

        try {
            const result = await insertMessage(roomId, username, message);
            res.status(201).json({ id: result.id });
        } catch (error) {
            res.status(500).json({ error: 'Failed to send message' });
        }
    }

    async getMessages(req, res) {
        const roomId = req.params.roomId;

        try {
            const messages = await getMessagesByRoom(roomId);
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    }

    async getUsers(req, res) {
        const roomId = req.params.roomId;
        // Tu peux implémenter une vraie logique plus tard
        res.status(200).json({ users: [`user1`, `user2`] });
    }
}

module.exports = ChatController;
