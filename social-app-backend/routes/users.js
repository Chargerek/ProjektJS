// routes/users.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { validateUserUpdate } = require('../models/User');

function readData(filename) {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Błąd odczytu pliku ${filename}:`, err);
    throw new Error(`Nie udało się odczytać danych z pliku ${filename}`);
  }
}

function writeData(filename, data) {
  try {
    fs.writeFileSync(path.join(__dirname, '../data', filename), JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Błąd zapisu do pliku ${filename}:`, err);
    throw new Error(`Nie udało się zapisać danych do pliku ${filename}`);
  }
}

// GET /api/users — lista użytkowników
router.get('/', (req, res, next) => {
  try {
    const users = readData('users.json');
    // Nie zwracaj hasła
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id — pojedynczy użytkownik
router.get('/:id', (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const users = readData('users.json');
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'Nie znaleziono',
        message: 'Użytkownik o podanym ID nie istnieje' 
      });
    }

    // Nie zwracaj hasła
    const { password, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id — edycja profilu
router.put('/:id', (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { currentUserId, username, email, displayName } = req.body;

    if (!currentUserId || parseInt(currentUserId) !== userId) {
      return res.status(403).json({ 
        error: 'Brak dostępu',
        message: 'Możesz edytować tylko swój profil' 
      });
    }

    // Walidacja
    const validation = validateUserUpdate({ username, email, displayName });
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: validation.errors 
      });
    }

    const users = readData('users.json');
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ 
        error: 'Nie znaleziono',
        message: 'Użytkownik o podanym ID nie istnieje' 
      });
    }

    // Sprawdź czy email/username nie są zajęte przez innego użytkownika
    if (email) {
      const existingUser = users.find(u => u.id !== userId && u.email === email);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Konflikt',
          message: 'Email jest już zajęty' 
        });
      }
    }

    if (username) {
      const existingUser = users.find(u => u.id !== userId && u.username === username);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Konflikt',
          message: 'Username jest już zajęty' 
        });
      }
    }

    // Aktualizuj dane
    if (username) users[userIndex].username = username;
    if (email) users[userIndex].email = email;
    if (displayName) users[userIndex].displayName = displayName;

    writeData('users.json', users);

    const { password, ...updatedUser } = users[userIndex];
    res.json({
      message: 'Profil zaktualizowany',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/:id/follow — obserwuj/odobserwuj użytkownika
router.post('/:id/follow', (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const { userId } = req.body; // ID użytkownika, który chce obserwować

    if (!userId) {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: ['userId jest wymagany'] 
      });
    }

    const followerId = parseInt(userId);

    if (followerId === targetUserId) {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        message: 'Nie możesz obserwować samego siebie' 
      });
    }

    const users = readData('users.json');
    const followerIndex = users.findIndex(u => u.id === followerId);
    const targetUserIndex = users.findIndex(u => u.id === targetUserId);

    if (followerIndex === -1 || targetUserIndex === -1) {
      return res.status(404).json({ 
        error: 'Nie znaleziono',
        message: 'Użytkownik nie istnieje' 
      });
    }

    const follower = users[followerIndex];

    // Upewnij się, że following to tablica
    if (!Array.isArray(follower.following)) {
      follower.following = [];
    }

    // Toggle follow (jeśli już obserwuje, przestań obserwować)
    const followIndex = follower.following.indexOf(targetUserId);
    if (followIndex !== -1) {
      follower.following.splice(followIndex, 1);
      writeData('users.json', users);
      return res.json({
        message: 'Przestano obserwować użytkownika',
        following: false,
        followingCount: follower.following.length
      });
    } else {
      follower.following.push(targetUserId);
      writeData('users.json', users);
      return res.json({
        message: 'Zaczęto obserwować użytkownika',
        following: true,
        followingCount: follower.following.length
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;