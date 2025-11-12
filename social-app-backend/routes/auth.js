// routes/auth.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

function readData(filename) {
  const data = fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8');
  return JSON.parse(data);
}

function writeData(filename, data) {
  fs.writeFileSync(path.join(__dirname, '../data', filename), JSON.stringify(data, null, 2));
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
  }

  const users = readData('users.json');

  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) {
    return res.status(409).json({ error: 'Użytkownik o tym email/username już istnieje' });
  }

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username,
    email,
    password,
    displayName: username,
    following: []
  };

  users.push(newUser);
  writeData('users.json', users);

  res.status(201).json({
    message: 'Zarejestrowano pomyślnie',
    user: { id: newUser.id, username: newUser.username, email: newUser.email }
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = readData('users.json');

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Niepoprawny email lub hasło' });
  }

  res.json({
    message: 'Zalogowano',
    user: { id: user.id, username: user.username, email: user.email }
  });
});

module.exports = router;