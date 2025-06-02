// backend/src/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../db/sqlite');

const router = express.Router();

// Clé secrète du JWT (à stocker idéalement dans une variable d'environnement)
const JWT_SECRET = 'your_jwt_secret';

// Endpoint d'inscription
router.post('/register', (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
  }

  // Vérifier si l'utilisateur existe déjà
  const sqlSelect = 'SELECT * FROM users WHERE email = ?';
  db.get(sqlSelect, [email], async (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (row) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    } else {
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sqlInsert = 'INSERT INTO users (email, password) VALUES (?, ?)';
        db.run(sqlInsert, [email, hashedPassword], function(err) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de l'inscription." });
          }
          return res.status(201).json({ message: "Inscription réussie." });
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur lors du hachage du mot de passe." });
      }
    }
  });
});

// Endpoint de connexion
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const sqlSelect = 'SELECT * FROM users WHERE email = ?';
  db.get(sqlSelect, [email], async (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    if (!row) {
      return res.status(400).json({ error: "Email ou mot de passe invalide." });
    }
    try {
      const isValid = await bcrypt.compare(password, row.password);
      if (!isValid) {
        return res.status(400).json({ error: "Email ou mot de passe invalide." });
      }
      // Création du token JWT, valable par exemple 1 jour
      const token = jwt.sign({ userId: row.id, email: row.email }, JWT_SECRET, { expiresIn: '1d' });
      return res.status(200).json({ token, message: "Connexion réussie." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erreur lors de la vérification." });
    }
  });
});

module.exports = router;
