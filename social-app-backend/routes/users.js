// routes/users.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

function readData(filename) {
  const data = fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8');
  return JSON.parse(data);
}

// GET /api/users — lista użytkowników
router.get('/', (req, res) => {
  try {
    const users = readData('users.json');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Nie udało się wczytać użytkowników' });
  }
});

// PUT /api/users/:id — edycja profilu
router.put('/:id', (req, res) => {
  res.json({ message: 'Edycja profilu — wkrótce...' });
});

// POST /api/users/:id/follow — obserwowanie
router.post('/:id/follow', (req, res) => {
  res.json({ message: 'Obserwowanie użytkownika — wkrótce...' });
});

module.exports = router;