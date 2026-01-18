// routes/users.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { validateUserUpdate } = require('../models/User');
const { authenticate } = require('../middleware/auth');

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

// GET /api/users — lista użytkowników z filtrowaniem, sortowaniem i paginacją
router.get('/', (req, res, next) => {
  try {
    let users = readData('users.json');
    
    // FILTROWANIE
    // ?search=tekst - wyszukaj w username/displayName
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      users = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm) ||
        (u.displayName && u.displayName.toLowerCase().includes(searchTerm))
      );
    }
    
    // ?minFollowing=5 - minimum obserwowanych
    if (req.query.minFollowing) {
      const minFollowing = parseInt(req.query.minFollowing);
      users = users.filter(u => (u.following?.length || 0) >= minFollowing);
    }
    
    // SORTOWANIE
    // ?sort=username:asc lub ?sort=following:desc
    const sortParam = req.query.sort || 'id:asc';
    const [sortField, sortOrder] = sortParam.split(':');
    const order = sortOrder === 'asc' ? 1 : -1;
    
    users.sort((a, b) => {
      let aVal, bVal;
      
      if (sortField === 'following') {
        aVal = a.following?.length || 0;
        bVal = b.following?.length || 0;
      } else if (sortField === 'username' || sortField === 'displayName') {
        aVal = (a[sortField] || '').toLowerCase();
        bVal = (b[sortField] || '').toLowerCase();
      } else {
        aVal = a[sortField] || 0;
        bVal = b[sortField] || 0;
      }
      
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
    
    // PAGINACJA
    // ?page=1&limit=10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    // Nie zwracaj hasła
    const sanitizedUsers = paginatedUsers.map(({ password, ...user }) => user);
    
    res.json({
      data: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
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
router.put('/:id', authenticate, (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, email, displayName } = req.body;

    if (req.user.id !== userId) {
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
router.post('/:id/follow', authenticate, (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const followerId = req.user.id;

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