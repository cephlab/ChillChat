// Récupération des éléments du DOM
const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");
const messagesDiv = document.getElementById("messages");
const usernameInput = document.getElementById("username");
const roomInput = document.getElementById("room");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const joinBtn = document.getElementById("joinBtn");
const logoutBtn = document.getElementById("logout-btn");
const userListDiv = document.getElementById("user-list");
let currentUsername = localStorage.getItem("username") || "";
let currentRoom = localStorage.getItem("room") || "";
const socket = io();
// Si l'utilisateur est déjà connecté (pour les rooms), on passe directement au chat
if (currentUsername && currentRoom) {
  document.getElementById("room-name").innerText = currentRoom;
  loginContainer.style.display = "none";
  chatContainer.style.display = "block";
  socket.emit("joinRoom", { username: currentUsername, room: currentRoom });
}
// Rejoindre une room
joinBtn.onclick = () => {
  const username = usernameInput.value.trim();
  const room = roomInput.value.trim();
  if (!username || !room) return alert("Both fields required!");
  currentUsername = username;
  currentRoom = room;
  // Stockage dans le localStorage
  localStorage.setItem("username", currentUsername);
  localStorage.setItem("room", currentRoom);
  socket.emit("joinRoom", { username, room });
  document.getElementById("room-name").innerText = room;
  loginContainer.style.display = "none";
  chatContainer.style.display = "block";
};
// Bouton déconnexion (chat)
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("username");
  localStorage.removeItem("room");
  socket.disconnect();
  window.location.reload();
});
// Envoyer un message
sendBtn.onclick = () => {
  const message = messageInput.value.trim();
  if (message) {
    // Ajout immédiat du message dans l'interface (côté expéditeur)
    const div = document.createElement("div");
    div.classList.add("message", "sent");
    div.textContent = message;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    // Envoi du message au serveur
    socket.emit("chatMessage", { message });
    messageInput.value = "";
  }
};
// Permettre l'envoi avec la touche "Enter"
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendBtn.click();
  }
});
// Réception d’un message (NE PAS MODIFIER)
socket.on("message", (data) => {
  const div = document.createElement("div");
  // Message système
  if (typeof data === "string") {
    div.classList.add("message", "system");
    div.textContent = data;
  } else {
    // Ici on compare le username du message avec le currentUsername obtenu du localStorage
    if (data.username === currentUsername) {
      div.classList.add("message", "sent");
    } else {
      div.classList.add("message", "received");
    }
    // On peut aussi afficher l'expéditeur si besoin
    div.textContent = `${data.username}: ${data.message}`;
  }

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
// Affichage dynamique des utilisateurs connectés
socket.on("updateUsers", (users) => {
  userListDiv.innerHTML =
    "<strong>Utilisateurs en ligne :</strong><br>" +
    users.map((user) => `• ${user}`).join("<br>");
});
// Gestion du système "En train d'écrire"
const typingTimeouts = {};
messageInput.addEventListener("input", () => {
  socket.emit("typing", { username: currentUsername, room: currentRoom });
  if (typingTimeouts[currentUsername])
    clearTimeout(typingTimeouts[currentUsername]);
  typingTimeouts[currentUsername] = setTimeout(() => {
    socket.emit("stopTyping", { username: currentUsername, room: currentRoom });
  }, 2000); // Délai de 2 secondes
});
// Affichage dynamique dans le chat comme notification système
socket.on("userTyping", (username) => {
  if (username === currentUsername) return;
  // Ne pas afficher sa propre notification
  const existingTypingMessage = document.getElementById(`typing-${username}`);
  if (!existingTypingMessage) {
    const typingDiv = document.createElement("div");
    typingDiv.id = `typing-${username}`;
    typingDiv.classList.add("message", "system");
    typingDiv.textContent = `${username} est en train d'écrire...`;
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
});
// Suppression automatique de la notification lorsque l'utilisateur arrête de taper
socket.on("userStoppedTyping", (username) => {
  const typingDiv = document.getElementById(`typing-${username}`);
  if (typingDiv) typingDiv.remove();
});
// Gestion des erreurs et déconnexions
socket.on("connect_error", (err) => {
  alert("Erreur de connexion au serveur.");
  console.error("Socket connection error:", err.message);
});
socket.on("disconnect", (reason) => {
  alert("Déconnecté du serveur !");
  console.warn("Socket disconnected:", reason);
});
socket.on("error", (err) => {
  alert("Erreur socket: " + err.message);
  console.error("Socket error:", err);
});
/* --- Gestion de l'authentification sur la page d'accueil --- */ // Ici, nous n'affichons sur l'accueil que le bouton "Se connecter" qui redirige vers la page dédiée
const authContainer = document.getElementById("auth-container");
// const showLoginBtn = document.getElementById("show-login-btn");
// Bouton de redirection vers login.html
const logoutAccountBtn = document.getElementById("logout-account-btn");
// Au chargement, vérification du token d'authentification
const authToken = localStorage.getItem("authToken");
if (authToken) {
  fetch("/api/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${authToken}` },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        localStorage.removeItem("authToken");
        // Supprimer le token si invalide
        // showLoginBtn.style.display = "block";
        // Afficher le bouton pour se connecter
        logoutAccountBtn.style.display = "none";
      } else {
        // Si l'utilisateur est authentifié, on affiche le bouton de déconnexion et on cache le bouton "Se connecter"
        logoutAccountBtn.style.display = "block";
        // showLoginBtn.style.display = "none";
        // Optionnel : Affichage d'un message de bienvenue ou récupération de l'historique des rooms pour cet utilisateur
        alert(`Bienvenue, ${data.email}! Vous êtes connecté.`);
      }
    })
    .catch((err) =>
      console.error("Erreur de récupération des infos utilisateur", err)
    );
} else {
  logoutAccountBtn.style.display = "none";
  // showLoginBtn.style.display = "block";
}
// Redirection vers la page de connexion
const goToLoginBtn = document.getElementById("go-to-login-btn");
goToLoginBtn.addEventListener("click", () => {
  window.location.href = "login.html";
});
// Déconnexion du compte (auth)
logoutAccountBtn.addEventListener("click", () => {
  localStorage.removeItem("authToken");
  // Supprimer le token de session alert("Vous avez été déconnecté.");
  window.location.reload(); // Rafraîchir la page pour revenir à l'état initial
});
