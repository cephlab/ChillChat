document.addEventListener('DOMContentLoaded', () => {
  // Récupération des éléments du DOM dans login.html
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginSubmit = document.getElementById('login-submit');
  const registerSection = document.getElementById('register-section');
  const registerEmail = document.getElementById('register-email');
  const registerPassword = document.getElementById('register-password');
  const registerConfirm = document.getElementById('register-confirm');
  const registerSubmit = document.getElementById('register-submit');
  const showRegisterLink = document.getElementById('show-register-link');
  const showLoginLink = document.getElementById('show-login-link');
  
  // Basculement vers l'inscription
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.style.display = 'block';
    loginSubmit.style.display = 'none';
  });
  
  // Basculement vers la connexion
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.style.display = 'none';
    loginSubmit.style.display = 'block';
  });
  
  // Gérer la connexion
  loginSubmit.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    if (!email || !password) {
      alert('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Erreur lors de la connexion.');
        return;
      }
      // Stocker le token d'authentification dans localStorage
      localStorage.setItem('authToken', data.token);
      alert('Connexion réussie !');
      // Rediriger vers la page d'accueil
      window.location.href = 'index.html';
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la connexion.');
    }
  });
  
  // Gérer l'inscription
  registerSubmit.addEventListener('click', async () => {
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    const confirmPassword = registerConfirm.value.trim();
    if (!email || !password || !confirmPassword) {
      alert('Tous les champs sont obligatoires.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Erreur lors de l'inscription.");
        return;
      }
      alert('Inscription réussie ! Vous pouvez désormais vous connecter.');
      // Passage à l'interface de connexion
      registerSection.style.display = 'none';
      loginSubmit.style.display = 'block';
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'inscription.");
    }
  });
});
