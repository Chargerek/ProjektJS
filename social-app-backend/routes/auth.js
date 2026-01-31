// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateUserRegistration } = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-zmienic-w-produkcji';
const db = require('../database');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Walidacja danych
    const validation = validateUserRegistration({ username, email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Błąd walidacji',
        details: validation.errors
      });
    }

    // Sprawdź czy użytkownik już istnieje
    const existingUser = db.prepare(`
      SELECT * FROM users WHERE email = ? OR username = ?
    `).get(email, username);

    if (existingUser) {
      return res.status(409).json({
        error: 'Konflikt',
        message: 'Użytkownik o tym email/username już istnieje'
      });
    }

    // Hash hasła
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Utwórz nowego użytkownika
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password, displayName, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insertUser.run(
      username,
      email,
      hashedPassword,
      username,
      new Date().toISOString()
    );

    const newUserId = result.lastInsertRowid;

    // Generuj JWT token
    const token = jwt.sign(
      {
        id: newUserId,
        username: username,
        email: email,
        isAdmin: 0
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Zarejestrowano pomyślnie',
      token,
      user: {
        id: newUserId,
        username: username,
        email: email,
        displayName: username,
        isAdmin: 0,
        bio: null,
        avatar: null
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Podstawowa walidacja
    if (!email || !password) {
      return res.status(400).json({
        error: 'Błąd walidacji',
        details: ['Email i hasło są wymagane']
      });
    }

    // Znajdź użytkownika
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({
        error: 'Nieautoryzowany',
        message: 'Niepoprawny email lub hasło'
      });
    }

    // Sprawdź hasło
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Nieautoryzowany',
        message: 'Niepoprawny email lub hasło'
      });
    }

    // Generuj JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Zalogowano',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        isAdmin: user.isAdmin,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me - zwraca dane zalogowanego użytkownika
router.get('/me', require('../middleware/auth').authenticate, (req, res, next) => {
  try {
    const user = db.prepare('SELECT id, username, email, displayName, bio, avatar, avatarPosition, isAdmin, createdAt FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Użytkownik nie istnieje'
      });
    }

    // Pobierz listę obserwowanych użytkowników
    const following = db.prepare(`
      SELECT followingId FROM user_following WHERE followerId = ?
    `).all(req.user.id).map(row => row.followingId);

    res.json({
      ...user,
      following
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
