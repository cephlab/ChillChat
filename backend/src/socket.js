const { insertMessage, getMessagesByRoom } = require("./db/sqlite");

// Objet pour stocker les utilisateurs connectés par room
const connectedUsers = {};

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Gestion de l'entrée d'un utilisateur dans une room
    socket.on("joinRoom", async ({ username, room }) => {
      socket.join(room);
      console.log(`${username} joined room: ${room}`);

      // Stocker username et room dans socket.data pour une utilisation ultérieure
      socket.data = { username, room };

      // Ajout de l'utilisateur à la liste des utilisateurs connectés pour la room
      connectedUsers[room] = connectedUsers[room] || [];
      if (!connectedUsers[room].includes(username)) {
        connectedUsers[room].push(username);
      }
      // Mise à jour de la liste pour tous dans la room
      io.to(room).emit("updateUsers", connectedUsers[room]);

      // Envoi des anciens messages à l'utilisateur qui vient de rejoindre
      const previousMessages = await getMessagesByRoom(room);
      previousMessages.forEach((msg) => {
        socket.emit("message", {
          username: msg.username,
          message: msg.message,
        });
      });

      // Notifier les autres que l'utilisateur a rejoint (message système)
      socket.to(room).emit("message", {
        username: "system",
        message: `${username} has joined the chat.`,
      });
    });

    // Gestion de l'envoi d'un message
    socket.on("chatMessage", async (data) => {
      const { username, room } = socket.data;

      if (!username || !room) {
        return socket.emit("message", "Error: Invalid session context.");
      }
      if (!data || typeof data !== "object") {
        return socket.emit("message", "Error: Invalid message format.");
      }
      const { message } = data;
      if (typeof message !== "string" || message.trim().length === 0) {
        return socket.emit("message", "Error: Message cannot be empty.");
      }
      try {
        await insertMessage(room, username, message.trim());
        // Diffuser le message uniquement aux autres (pas à l'expéditeur)
        socket.broadcast.to(room).emit("message", {
          username,
          message: message.trim(),
        });
      } catch (err) {
        console.error("Message DB insert failed:", err);
        socket.emit("message", "Error: Message failed to send.");
      }
    });

    // Gestion de l'utilisateur qui tape
    socket.on("typing", ({ username, room }) => {
      socket.broadcast.to(room).emit("userTyping", username);
    });
    socket.on("stopTyping", ({ username, room }) => {
      socket.broadcast.to(room).emit("userStoppedTyping", username);
    });

    // Gestion de la déconnexion
    socket.on("disconnect", () => {
      const { username, room } = socket.data || {};
      if (room && username) {
        // Retirer l'utilisateur de la liste des connectés
        if (connectedUsers[room]) {
          connectedUsers[room] = connectedUsers[room].filter(
            (user) => user !== username
          );
          io.to(room).emit("updateUsers", connectedUsers[room]);
        }
        // Notifier les autres membres de la déconnexion
        socket.to(room).emit("message", {
          username: "system",
          message: `${username} has left the chat.`,
        });
      }
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = socketHandler;
