// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // pozwala na żądania z innych domen (np. localhost:5173)
app.use(express.json()); // żeby móc czytać JSON z req.body

// Ładowanie danych z plików (mock)
const DATA_DIR = path.join(__dirname, 'data');

function readData(filename) {
  const data = fs.readFileSync(path.join(DATA_DIR, filename), 'utf8');
  return JSON.parse(data);
}

function writeData(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// Przykład: zapisz funkcje ładowania do globalnej przestrzeni (tymczasowo)
app.get('/api/test', (req, res) => {
  res.json({ message: "Serwer działa ✅", time: new Date().toISOString() });
});

// Routing — za chwilę dodasz tu pliki z routes/
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Middleware do obsługi błędów
const errorHandler = require('./middleware/errorHandler');

// Obsługa błędów 404 - musi być na końcu, po wszystkich routach
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', message: `Ścieżka ${req.path} nie istnieje` });
});

// Middleware obsługi błędów - MUSI być ostatni
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na http://localhost:${PORT}`);
  console.log(`📝 API dostępne pod: http://localhost:${PORT}/api`);
});