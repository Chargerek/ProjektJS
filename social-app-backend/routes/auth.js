// routes/auth.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { validateUserRegistration } = require('../models/User');

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

// POST /api/auth/register
router.post('/register', (req, res, next) => {
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

    const users = readData('users.json');

    // Sprawdź czy użytkownik już istnieje
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Konflikt',
        message: 'Użytkownik o tym email/username już istnieje' 
      });
    }

    // Utwórz nowego użytkownika
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      username,
      email,
      password, // W produkcji: hash hasła (bcrypt)
      displayName: username,
      following: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData('users.json', users);

    res.status(201).json({
      message: 'Zarejestrowano pomyślnie',
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email,
        displayName: newUser.displayName
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Podstawowa walidacja
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: ['Email i hasło są wymagane'] 
      });
    }

    const users = readData('users.json');

    // Znajdź użytkownika
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ 
        error: 'Nieautoryzowany',
        message: 'Niepoprawny email lub hasło' 
      });
    }

    res.json({
      message: 'Zalogowano',
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        displayName: user.displayName || user.username
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;