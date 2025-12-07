# Refaktoryzacja i rozwój projektu
_Exported on 12/7/2025 at 18:15:14 GMT+1 from Cursor (2.1.50)_

---

**User**

W tym projekcie wszystko działa fajnie ale jest zrobiony react a ma byc express.js wywal totalnie reacta. Jeśli jakaś bibliotek skróci kod i sprawi że będzie bardzije czytelny zaproponuj jakąś ale nie implementuj.

I zrób te zadanie:

Backend: rozwinięcie API o filtrowanie, sortowanie, paginację.



Frontend: routing, łączenie z backendem, interakcja z użytkownikiem.



Na koniec wypisz co sie zmieniło i jak przetestować

---

**Cursor**


Sprawdzanie struktury projektu, aby zrozumieć obecną implementację.



Przeglądanie kluczowych plików, aby zrozumieć obecną strukturę:



Sprawdzanie komponentów React, aby zrozumieć funkcjonalność:



Tworzenie planu zadań i rozpoczęcie konwersji:



Rozpoczynanie konwersji: aktualizowanie backendu i usuwanie Reacta.



Usuwanie React frontendu i rozpoczęcie budowy frontendu w Express.js:



Aktualizowanie backendu: dodawanie EJS i konfiguracja Express.


```json
{
  "name": "social-app-backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
},
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "cors": "^2.8.5",
    "ejs": "^3.1.10",
    "express": "^5.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}

```

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfiguracja EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors()); // pozwala na żądania z innych domen
app.use(express.json()); // żeby móc czytać JSON z req.body
app.use(express.urlencoded({ extended: true })); // dla formularzy
app.use(express.static(path.join(__dirname, 'public'))); // statyczne pliki (CSS, JS)

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
```

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfiguracja EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors()); // pozwala na żądania z innych domen
app.use(express.json()); // żeby móc czytać JSON z req.body
app.use(express.urlencoded({ extended: true })); // dla formularzy
app.use(express.static(path.join(__dirname, 'public'))); // statyczne pliki (CSS, JS)

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Frontend Routes
const frontendRoutes = require('./routes/frontend');
app.use('/', frontendRoutes);

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
```


Dodawanie filtrowania, sortowania i paginacji do API:


```javascript
// routes/posts.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { validatePostCreate, validatePostUpdate } = require('../models/Post');
const { validateCommentCreate } = require('../models/Comment');

// Funkcja pomocnicza do odczytu danych
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

// GET /api/posts — lista wszystkich postów z filtrowaniem, sortowaniem i paginacją
router.get('/', (req, res, next) => {
  try {
    let posts = readData('posts.json');
    
    // FILTROWANIE
    // ?userId=1 - filtruj po autorze
    if (req.query.userId) {
      const userId = parseInt(req.query.userId);
      posts = posts.filter(p => p.userId === userId);
    }
    
    // ?search=tekst - wyszukaj w treści posta
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      posts = posts.filter(p => 
        p.content.toLowerCase().includes(searchTerm)
      );
    }
    
    // ?minLikes=5 - minimum polubień
    if (req.query.minLikes) {
      const minLikes = parseInt(req.query.minLikes);
      posts = posts.filter(p => (p.likes?.length || 0) >= minLikes);
    }
    
    // SORTOWANIE
    // ?sort=createdAt:desc lub ?sort=likes:asc
    const sortParam = req.query.sort || 'createdAt:desc';
    const [sortField, sortOrder] = sortParam.split(':');
    const order = sortOrder === 'asc' ? 1 : -1;
    
    posts.sort((a, b) => {
      let aVal, bVal;
      
      if (sortField === 'createdAt') {
        aVal = new Date(a.createdAt || 0);
        bVal = new Date(b.createdAt || 0);
      } else if (sortField === 'likes') {
        aVal = a.likes?.length || 0;
        bVal = b.likes?.length || 0;
      } else if (sortField === 'userId') {
        aVal = a.userId || 0;
        bVal = b.userId || 0;
      } else {
        aVal = a[sortField] || '';
        bVal = b[sortField] || '';
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
    
    const total = posts.length;
    const totalPages = Math.ceil(total / limit);
    
    const paginatedPosts = posts.slice(startIndex, endIndex);
    
    res.json({
      data: paginatedPosts,
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

// GET /api/posts/:id — pojedynczy post
router.get('/:id', (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const posts = readData('posts.json');
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({ 
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje' 
      });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts — dodaj nowy post
router.post('/', (req, res, next) => {
  try {
    const { userId, content } = req.body;

    // Walidacja
    const validation = validatePostCreate({ userId, content });
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: validation.errors 
      });
    }

    const posts = readData('posts.json');
    const newPost = {
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      userId: parseInt(userId),
      content: content.trim(),
      likes: [],
      createdAt: new Date().toISOString()
    };

    posts.push(newPost);
    writeData('posts.json', posts);

    res.status(201).json({
      message: 'Post dodany',
      post: newPost
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/posts/:id — aktualizuj post
router.put('/:id', (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const { userId, content } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: ['userId jest wymagane'] 
      });
    }

    // Walidacja content
    const validation = validatePostUpdate({ content });
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: validation.errors 
      });
    }

    const posts = readData('posts.json');
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({ 
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje' 
      });
    }

    // Sprawdź uprawnienia
    if (posts[postIndex].userId !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'Brak dostępu',
        message: 'Możesz edytować tylko swoje posty' 
      });
    }

    // Aktualizuj post
    posts[postIndex].content = content.trim();
    posts[postIndex].updatedAt = new Date().toISOString();
    writeData('posts.json', posts);

    res.json({
      message: 'Post zaktualizowany',
      post: posts[postIndex]
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/like — lajkuj/odlajkuj post
router.post('/:id/like', (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: ['userId jest wymagany'] 
      });
    }

    const userIdNum = parseInt(userId);
    const posts = readData('posts.json');
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({ 
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje' 
      });
    }

    const post = posts[postIndex];

    // Upewnij się, że likes to tablica
    if (!Array.isArray(post.likes)) {
      post.likes = [];
    }

    // Toggle like (jeśli już polubił, odlajkuj)
    const likeIndex = post.likes.indexOf(userIdNum);
    if (likeIndex !== -1) {
      post.likes.splice(likeIndex, 1);
      writeData('posts.json', posts);
      return res.json({
        message: 'Post odlajkowany',
        post,
        liked: false
      });
    } else {
      post.likes.push(userIdNum);
      writeData('posts.json', posts);
      return res.json({
        message: 'Post polubiono',
        post,
        liked: true
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id/comments — komentarze do posta
router.get('/:id/comments', (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    
    // Sprawdź czy post istnieje
    const posts = readData('posts.json');
    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ 
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje' 
      });
    }

    const comments = readData('comments.json');
    const postComments = comments
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Od najstarszych

    res.json(postComments);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/comments — dodaj komentarz
router.post('/:id/comments', (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const { userId, content } = req.body;

    // Sprawdź czy post istnieje
    const posts = readData('posts.json');
    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ 
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje' 
      });
    }

    // Walidacja komentarza
    const validation = validateCommentCreate({ postId, userId, content });
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: validation.errors 
      });
    }

    const comments = readData('comments.json');
    const newComment = {
      id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
      postId,
      userId: parseInt(userId),
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    writeData('comments.json', comments);

    res.status(201).json({
      message: 'Komentarz dodany',
      comment: newComment
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:id — usuń post (tylko jeśli user to autor)
router.delete('/:id', (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const { userId } = req.body; // w praktyce: z tokena JWT, ale tu mock

    if (!userId) {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: ['userId jest wymagany'] 
      });
    }

    const posts = readData('posts.json');
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({ 
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje' 
      });
    }

    // Sprawdź, czy user jest właścicielem
    if (posts[postIndex].userId !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'Brak dostępu',
        message: 'Nie możesz usunąć cudzego posta' 
      });
    }

    // Usuń również komentarze związane z postem
    const comments = readData('comments.json');
    const updatedComments = comments.filter(c => c.postId !== postId);
    writeData('comments.json', updatedComments);

    // Usuń post
    posts.splice(postIndex, 1);
    writeData('posts.json', posts);

    res.json({
      message: 'Post usunięty',
      deletedId: postId
    });
  } catch (err) {
    next(err);
  }
});

// Eksportuj router — 🔑 to kluczowe!
module.exports = router;
```

```javascript
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
```


Tworzenie frontend routes i widoków:


```javascript
// routes/frontend.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

function readData(filename) {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Błąd odczytu pliku ${filename}:`, err);
    return [];
  }
}

// Strona główna - lista postów
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'createdAt:desc';
    const search = req.query.search || '';
    const userId = req.query.userId || '';
    
    // Pobierz dane z API (lub bezpośrednio)
    let posts = readData('posts.json');
    const users = readData('users.json');
    
    // Filtrowanie
    if (userId) {
      posts = posts.filter(p => p.userId === parseInt(userId));
    }
    if (search) {
      posts = posts.filter(p => 
        p.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sortowanie
    const [sortField, sortOrder] = sort.split(':');
    const order = sortOrder === 'asc' ? 1 : -1;
    posts.sort((a, b) => {
      let aVal, bVal;
      if (sortField === 'createdAt') {
        aVal = new Date(a.createdAt || 0);
        bVal = new Date(b.createdAt || 0);
      } else if (sortField === 'likes') {
        aVal = a.likes?.length || 0;
        bVal = b.likes?.length || 0;
      } else {
        aVal = a[sortField] || '';
        bVal = b[sortField] || '';
      }
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
    
    // Paginacja
    const total = posts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedPosts = posts.slice(startIndex, startIndex + limit);
    
    // Mapuj użytkowników
    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = { ...u };
      delete usersMap[u.id].password;
    });
    
    res.render('posts', {
      posts: paginatedPosts,
      users: usersMap,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        sort,
        search,
        userId
      },
      allUsers: users.map(u => ({ id: u.id, username: u.username, displayName: u.displayName }))
    });
  } catch (err) {
    next(err);
  }
});

// Strona użytkowników
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'id:asc';
    const search = req.query.search || '';
    
    let users = readData('users.json');
    
    // Filtrowanie
    if (search) {
      users = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Sortowanie
    const [sortField, sortOrder] = sort.split(':');
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
    
    // Paginacja
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedUsers = users.slice(startIndex, startIndex + limit);
    
    // Usuń hasła
    const sanitizedUsers = paginatedUsers.map(({ password, ...user }) => user);
    
    res.render('users', {
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        sort,
        search
      }
    });
  } catch (err) {
    next(err);
  }
});

// Pojedynczy post
router.get('/posts/:id', async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const posts = readData('posts.json');
    const users = readData('users.json');
    const comments = readData('comments.json');
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).render('error', { 
        message: 'Post nie został znaleziony',
        error: { status: 404 }
      });
    }
    
    const postComments = comments
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = { ...u };
      delete usersMap[u.id].password;
    });
    
    res.render('post-detail', {
      post,
      user: usersMap[post.userId],
      comments: postComments,
      commentUsers: usersMap
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

```


Tworzenie szablonów EJS i plików statycznych:


```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= typeof title !== 'undefined' ? title : 'Social App' %></title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header class="app-header">
        <h1>📱 Social App</h1>
        <nav class="main-nav">
            <a href="/" class="nav-link <%= typeof activeTab !== 'undefined' && activeTab === 'posts' ? 'active' : '' %>">Posty</a>
            <a href="/users" class="nav-link <%= typeof activeTab !== 'undefined' && activeTab === 'users' ? 'active' : '' %>">Użytkownicy</a>
        </nav>
    </header>
    <main class="app-main">

```

```html
    </main>
    <footer class="app-footer">
        <p>Social App - Projekt JS 2025</p>
    </footer>
    <script src="/js/app.js"></script>
</body>
</html>

```

```html
<%- include('partials/header', { title: 'Posty - Social App', activeTab: 'posts' }) %>

<div class="container">
    <div class="page-header">
        <h2>Posty</h2>
        
        <!-- Filtry i sortowanie -->
        <form method="GET" action="/" class="filters-form">
            <div class="filters-row">
                <input 
                    type="text" 
                    name="search" 
                    placeholder="Szukaj w postach..." 
                    value="<%= filters.search %>"
                    class="filter-input"
                >
                <select name="userId" class="filter-select">
                    <option value="">Wszyscy autorzy</option>
                    <% allUsers.forEach(user => { %>
                        <option value="<%= user.id %>" <%= filters.userId == user.id ? 'selected' : '' %>>
                            <%= user.displayName || user.username %>
                        </option>
                    <% }); %>
                </select>
                <select name="sort" class="filter-select">
                    <option value="createdAt:desc" <%= filters.sort === 'createdAt:desc' ? 'selected' : '' %>>Najnowsze</option>
                    <option value="createdAt:asc" <%= filters.sort === 'createdAt:asc' ? 'selected' : '' %>>Najstarsze</option>
                    <option value="likes:desc" <%= filters.sort === 'likes:desc' ? 'selected' : '' %>>Najbardziej polubione</option>
                    <option value="likes:asc" <%= filters.sort === 'likes:asc' ? 'selected' : '' %>>Najmniej polubione</option>
                </select>
                <button type="submit" class="btn btn-primary">Filtruj</button>
                <a href="/" class="btn btn-secondary">Wyczyść</a>
            </div>
        </form>
    </div>

    <!-- Lista postów -->
    <div class="posts-list">
        <% if (posts.length === 0) { %>
            <div class="empty-state">Brak postów do wyświetlenia</div>
        <% } else { %>
            <% posts.forEach(post => { %>
                <div class="post-card" data-post-id="<%= post.id %>">
                    <div class="post-header">
                        <div class="post-author">
                            <span class="author-name">
                                <%= users[post.userId] ? (users[post.userId].displayName || users[post.userId].username) : `Użytkownik #${post.userId}` %>
                            </span>
                            <span class="post-date"><%= new Date(post.createdAt).toLocaleString('pl-PL') %></span>
                        </div>
                    </div>
                    <div class="post-content"><%= post.content %></div>
                    <div class="post-actions">
                        <button class="like-btn" data-post-id="<%= post.id %>" data-user-id="1">
                            ❤️ <span class="like-count"><%= post.likes?.length || 0 %></span>
                        </button>
                        <a href="/posts/<%= post.id %>" class="comments-link">
                            💬 Komentarze
                        </a>
                    </div>
                </div>
            <% }); %>
        <% } %>
    </div>

    <!-- Paginacja -->
    <% if (pagination.totalPages > 1) { %>
        <div class="pagination">
            <% if (pagination.hasPrev) { %>
                <a href="?page=<%= pagination.page - 1 %><%= filters.search ? '&search=' + filters.search : '' %><%= filters.userId ? '&userId=' + filters.userId : '' %><%= filters.sort ? '&sort=' + filters.sort : '' %>" class="pagination-btn">← Poprzednia</a>
            <% } %>
            <span class="pagination-info">
                Strona <%= pagination.page %> z <%= pagination.totalPages %> (<%= pagination.total %> postów)
            </span>
            <% if (pagination.hasNext) { %>
                <a href="?page=<%= pagination.page + 1 %><%= filters.search ? '&search=' + filters.search : '' %><%= filters.userId ? '&userId=' + filters.userId : '' %><%= filters.sort ? '&sort=' + filters.sort : '' %>" class="pagination-btn">Następna →</a>
            <% } %>
        </div>
    <% } %>
</div>

<%- include('partials/footer') %>

```

```html
<%- include('partials/header', { title: 'Użytkownicy - Social App', activeTab: 'users' }) %>

<div class="container">
    <div class="page-header">
        <h2>Użytkownicy</h2>
        
        <!-- Filtry i sortowanie -->
        <form method="GET" action="/users" class="filters-form">
            <div class="filters-row">
                <input 
                    type="text" 
                    name="search" 
                    placeholder="Szukaj użytkowników..." 
                    value="<%= filters.search %>"
                    class="filter-input"
                >
                <select name="sort" class="filter-select">
                    <option value="id:asc" <%= filters.sort === 'id:asc' ? 'selected' : '' %>>ID (rosnąco)</option>
                    <option value="id:desc" <%= filters.sort === 'id:desc' ? 'selected' : '' %>>ID (malejąco)</option>
                    <option value="username:asc" <%= filters.sort === 'username:asc' ? 'selected' : '' %>>Username (A-Z)</option>
                    <option value="username:desc" <%= filters.sort === 'username:desc' ? 'selected' : '' %>>Username (Z-A)</option>
                    <option value="following:desc" <%= filters.sort === 'following:desc' ? 'selected' : '' %>>Najwięcej obserwowanych</option>
                    <option value="following:asc" <%= filters.sort === 'following:asc' ? 'selected' : '' %>>Najmniej obserwowanych</option>
                </select>
                <button type="submit" class="btn btn-primary">Filtruj</button>
                <a href="/users" class="btn btn-secondary">Wyczyść</a>
            </div>
        </form>
    </div>

    <!-- Lista użytkowników -->
    <div class="users-grid">
        <% if (users.length === 0) { %>
            <div class="empty-state">Brak użytkowników do wyświetlenia</div>
        <% } else { %>
            <% users.forEach(user => { %>
                <div class="user-card">
                    <div class="user-avatar">
                        <%= (user.displayName || user.username || 'U')[0].toUpperCase() %>
                    </div>
                    <div class="user-info">
                        <h3><%= user.displayName || user.username %></h3>
                        <p class="username">@<%= user.username %></p>
                        <% if (user.following) { %>
                            <p class="following">Obserwuje: <%= user.following.length %></p>
                        <% } %>
                    </div>
                </div>
            <% }); %>
        <% } %>
    </div>

    <!-- Paginacja -->
    <% if (pagination.totalPages > 1) { %>
        <div class="pagination">
            <% if (pagination.hasPrev) { %>
                <a href="?page=<%= pagination.page - 1 %><%= filters.search ? '&search=' + filters.search : '' %><%= filters.sort ? '&sort=' + filters.sort : '' %>" class="pagination-btn">← Poprzednia</a>
            <% } %>
            <span class="pagination-info">
                Strona <%= pagination.page %> z <%= pagination.totalPages %> (<%= pagination.total %> użytkowników)
            </span>
            <% if (pagination.hasNext) { %>
                <a href="?page=<%= pagination.page + 1 %><%= filters.search ? '&search=' + filters.search : '' %><%= filters.sort ? '&sort=' + filters.sort : '' %>" class="pagination-btn">Następna →</a>
            <% } %>
        </div>
    <% } %>
</div>

<%- include('partials/footer') %>

```

```html
<%- include('partials/header', { title: 'Post - Social App' }) %>

<div class="container">
    <a href="/" class="back-link">← Powrót do listy postów</a>
    
    <div class="post-card post-detail">
        <div class="post-header">
            <div class="post-author">
                <span class="author-name">
                    <%= user ? (user.displayName || user.username) : `Użytkownik #${post.userId}` %>
                </span>
                <span class="post-date"><%= new Date(post.createdAt).toLocaleString('pl-PL') %></span>
            </div>
        </div>
        <div class="post-content"><%= post.content %></div>
        <div class="post-actions">
            <button class="like-btn" data-post-id="<%= post.id %>" data-user-id="1">
                ❤️ <span class="like-count"><%= post.likes?.length || 0 %></span>
            </button>
        </div>
    </div>

    <!-- Komentarze -->
    <div class="comments-section">
        <h3>Komentarze (<%= comments.length %>)</h3>
        
        <div class="comments-list">
            <% if (comments.length === 0) { %>
                <div class="empty-state">Brak komentarzy</div>
            <% } else { %>
                <% comments.forEach(comment => { %>
                    <div class="comment">
                        <strong>
                            <%= commentUsers[comment.userId] ? (commentUsers[comment.userId].displayName || commentUsers[comment.userId].username) : `Użytkownik #${comment.userId}` %>
                        </strong>
                        <p><%= comment.content %></p>
                        <small><%= new Date(comment.createdAt).toLocaleString('pl-PL') %></small>
                    </div>
                <% }); %>
            <% } %>
        </div>

        <!-- Formularz dodawania komentarza -->
        <form class="comment-form" data-post-id="<%= post.id %>">
            <textarea 
                name="content" 
                placeholder="Dodaj komentarz..." 
                rows="3"
                required
            ></textarea>
            <button type="submit" class="btn btn-primary">Wyślij komentarz</button>
        </form>
    </div>
</div>

<%- include('partials/footer') %>

```

```html
<%- include('partials/header', { title: 'Błąd - Social App' }) %>

<div class="container">
    <div class="error-page">
        <h2>❌ Błąd <%= typeof error !== 'undefined' && error.status ? error.status : '500' %></h2>
        <p><%= typeof message !== 'undefined' ? message : 'Wystąpił błąd' %></p>
        <a href="/" class="btn btn-primary">Powrót do strony głównej</a>
    </div>
</div>

<%- include('partials/footer') %>

```


Tworzenie plików CSS i JS:


```css
/* Reset i podstawowe style */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
}

/* Header */
.app-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.5rem 2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.app-header h1 {
    margin-bottom: 1rem;
    font-size: 1.8rem;
}

.main-nav {
    display: flex;
    gap: 1rem;
}

.nav-link {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.nav-link:hover {
    background-color: rgba(255,255,255,0.2);
}

.nav-link.active {
    background-color: rgba(255,255,255,0.3);
    font-weight: bold;
}

/* Main content */
.app-main {
    min-height: calc(100vh - 200px);
    padding: 2rem;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

/* Page header */
.page-header {
    margin-bottom: 2rem;
}

.page-header h2 {
    margin-bottom: 1rem;
    color: #333;
}

/* Filters */
.filters-form {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
}

.filters-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
}

.filter-input {
    flex: 1;
    min-width: 200px;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
}

.filter-select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    background: white;
}

/* Buttons */
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s;
}

.btn-primary {
    background-color: #667eea;
    color: white;
}

.btn-primary:hover {
    background-color: #5568d3;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #5a6268;
}

/* Posts list */
.posts-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.post-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.post-author {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.author-name {
    font-weight: bold;
    color: #667eea;
}

.post-date {
    font-size: 0.85rem;
    color: #666;
}

.post-content {
    margin-bottom: 1rem;
    line-height: 1.8;
    white-space: pre-wrap;
}

.post-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.like-btn {
    background: none;
    border: 1px solid #ddd;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
}

.like-btn:hover {
    background-color: #f0f0f0;
}

.like-btn.liked {
    background-color: #ffe0e0;
    border-color: #ff6b6b;
}

.comments-link {
    color: #667eea;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.comments-link:hover {
    background-color: #f0f0f0;
}

/* Users grid */
.users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.user-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    text-align: center;
    transition: transform 0.2s, box-shadow 0.2s;
}

.user-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.user-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0 auto 1rem;
}

.user-info h3 {
    margin-bottom: 0.5rem;
    color: #333;
}

.username {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.following {
    color: #667eea;
    font-size: 0.85rem;
}

/* Comments */
.comments-section {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    margin-top: 2rem;
}

.comments-section h3 {
    margin-bottom: 1rem;
    color: #333;
}

.comments-list {
    margin-bottom: 1.5rem;
}

.comment {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    margin-bottom: 1rem;
}

.comment:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.comment strong {
    color: #667eea;
    display: block;
    margin-bottom: 0.5rem;
}

.comment p {
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

.comment small {
    color: #666;
    font-size: 0.85rem;
}

.comment-form {
    margin-top: 1.5rem;
}

.comment-form textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    font-family: inherit;
    margin-bottom: 1rem;
    resize: vertical;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.pagination-btn {
    padding: 0.5rem 1rem;
    background-color: #667eea;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.pagination-btn:hover {
    background-color: #5568d3;
}

.pagination-info {
    color: #666;
}

/* Empty state */
.empty-state {
    text-align: center;
    padding: 3rem;
    color: #666;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* Error page */
.error-page {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.error-page h2 {
    color: #dc3545;
    margin-bottom: 1rem;
}

/* Back link */
.back-link {
    display: inline-block;
    margin-bottom: 1.5rem;
    color: #667eea;
    text-decoration: none;
    transition: color 0.3s;
}

.back-link:hover {
    color: #5568d3;
}

/* Footer */
.app-footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 1.5rem;
    margin-top: 3rem;
}

/* Loading state */
.loading {
    text-align: center;
    padding: 2rem;
    color: #666;
}

/* Responsive */
@media (max-width: 768px) {
    .app-main {
        padding: 1rem;
    }
    
    .filters-row {
        flex-direction: column;
    }
    
    .filter-input,
    .filter-select {
        width: 100%;
    }
    
    .users-grid {
        grid-template-columns: 1fr;
    }
}

```

```javascript
// app.js - Interakcja użytkownika z frontendem

const API_BASE_URL = '/api';

// Funkcja pomocnicza do wykonywania requestów
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Wystąpił błąd');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Obsługa polubień postów
document.addEventListener('DOMContentLoaded', () => {
    // Obsługa przycisków like
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const postId = btn.getAttribute('data-post-id');
            const userId = btn.getAttribute('data-user-id') || '1'; // Mock user ID
            
            if (!postId) return;

            try {
                const result = await apiRequest(`/posts/${postId}/like`, {
                    method: 'POST',
                    body: { userId: parseInt(userId) }
                });

                // Aktualizuj licznik polubień
                const likeCount = btn.querySelector('.like-count');
                if (likeCount) {
                    likeCount.textContent = result.post.likes.length;
                }

                // Zmień wygląd przycisku
                if (result.liked) {
                    btn.classList.add('liked');
                } else {
                    btn.classList.remove('liked');
                }

                // Jeśli jesteśmy na stronie szczegółów posta, odśwież stronę
                if (window.location.pathname.includes('/posts/')) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            } catch (error) {
                alert('Nie udało się polubić posta: ' + error.message);
            }
        });
    });

    // Obsługa formularza komentarzy
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const postId = form.getAttribute('data-post-id');
            const userId = '1'; // Mock user ID
            const content = form.querySelector('textarea[name="content"]').value.trim();

            if (!content) return;

            try {
                await apiRequest(`/posts/${postId}/comments`, {
                    method: 'POST',
                    body: {
                        userId: parseInt(userId),
                        content: content
                    }
                });

                // Wyczyść formularz i odśwież stronę
                form.querySelector('textarea[name="content"]').value = '';
                window.location.reload();
            } catch (error) {
                alert('Nie udało się dodać komentarza: ' + error.message);
            }
        });
    });

    // Płynne przewijanie do góry przy zmianie strony
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Funkcja do wyświetlania komunikatów
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Dodaj style animacji
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

```


Sprawdzanie i poprawianie kolejności routingu oraz instalacja EJS:



Aktualizowanie obsługi błędów 404, aby poprawnie obsługiwała frontend i API:


```javascript
// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfiguracja EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors()); // pozwala na żądania z innych domen
app.use(express.json()); // żeby móc czytać JSON z req.body
app.use(express.urlencoded({ extended: true })); // dla formularzy
app.use(express.static(path.join(__dirname, 'public'))); // statyczne pliki (CSS, JS)

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Frontend Routes
const frontendRoutes = require('./routes/frontend');
app.use('/', frontendRoutes);

// Middleware do obsługi błędów
const errorHandler = require('./middleware/errorHandler');

// Obsługa błędów 404 - musi być na końcu, po wszystkich routach
app.use((req, res) => {
  // Jeśli to request do API, zwróć JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found', message: `Ścieżka ${req.path} nie istnieje` });
  }
  // W przeciwnym razie renderuj stronę błędu
  res.status(404).render('error', { 
    message: 'Strona nie została znaleziona',
    error: { status: 404 }
  });
});

// Middleware obsługi błędów - MUSI być ostatni
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na http://localhost:${PORT}`);
  console.log(`📝 API dostępne pod: http://localhost:${PORT}/api`);
});
```


Tworzenie dokumentu podsumowującego zmiany i instrukcje testowania:


```markdown
# Podsumowanie zmian i instrukcje testowania

## Co się zmieniło?

### 1. Usunięto React
- ✅ Całkowicie usunięto folder `social-app-frontend` z Reactem
- ✅ Usunięto wszystkie zależności React (react, react-dom, vite, itp.)

### 2. Konwersja na Express.js z server-side rendering
- ✅ Dodano EJS jako silnik szablonów
- ✅ Skonfigurowano Express do renderowania widoków po stronie serwera
- ✅ Utworzono strukturę:
  - `views/` - szablony EJS
    - `partials/header.ejs` - nagłówek strony
    - `partials/footer.ejs` - stopka strony
    - `posts.ejs` - lista postów
    - `users.ejs` - lista użytkowników
    - `post-detail.ejs` - szczegóły posta z komentarzami
    - `error.ejs` - strona błędu
  - `public/` - statyczne pliki
    - `css/style.css` - style CSS
    - `js/app.js` - JavaScript do interakcji

### 3. Rozszerzenie API o filtrowanie, sortowanie i paginację

#### API Posts (`/api/posts`)
**Filtrowanie:**
- `?userId=1` - filtruj po autorze
- `?search=tekst` - wyszukaj w treści posta
- `?minLikes=5` - minimum polubień

**Sortowanie:**
- `?sort=createdAt:desc` - najnowsze (domyślne)
- `?sort=createdAt:asc` - najstarsze
- `?sort=likes:desc` - najbardziej polubione
- `?sort=likes:asc` - najmniej polubione

**Paginacja:**
- `?page=1` - numer strony (domyślnie 1)
- `?limit=10` - liczba elementów na stronie (domyślnie 10)

**Przykład:**
```
GET /api/posts?page=1&limit=5&sort=likes:desc&search=JavaScript
```

**Odpowiedź:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 10,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### API Users (`/api/users`)
**Filtrowanie:**
- `?search=tekst` - wyszukaj w username/displayName
- `?minFollowing=5` - minimum obserwowanych

**Sortowanie:**
- `?sort=id:asc` - ID rosnąco (domyślne)
- `?sort=id:desc` - ID malejąco
- `?sort=username:asc` - username A-Z
- `?sort=username:desc` - username Z-A
- `?sort=following:desc` - najwięcej obserwowanych
- `?sort=following:asc` - najmniej obserwowanych

**Paginacja:**
- `?page=1` - numer strony
- `?limit=10` - liczba elementów na stronie

**Przykład:**
```
GET /api/users?page=1&limit=5&sort=username:asc&search=jan
```

### 4. Frontend routing w Express
- ✅ `GET /` - strona główna z listą postów
- ✅ `GET /users` - lista użytkowników
- ✅ `GET /posts/:id` - szczegóły posta z komentarzami

### 5. Interakcja użytkownika
- ✅ Polubienia postów (AJAX)
- ✅ Dodawanie komentarzy (formularze)
- ✅ Filtrowanie i sortowanie (formularze GET)
- ✅ Paginacja (linki)

## Jak przetestować?

### 1. Instalacja zależności
```bash
cd social-app-backend
npm install
```

### 2. Uruchomienie serwera
```bash
npm start
# lub w trybie deweloperskim:
npm run dev
```

Serwer będzie dostępny pod adresem: `http://localhost:3000`

### 3. Testowanie frontendu (przeglądarka)

#### Strona główna - Lista postów
1. Otwórz: `http://localhost:3000`
2. Sprawdź:
   - Wyświetlanie listy postów
   - Filtrowanie po autorze (dropdown)
   - Wyszukiwanie w treści postów
   - Sortowanie (najnowsze, najstarsze, polubienia)
   - Paginacja (jeśli jest więcej niż 10 postów)
   - Kliknięcie "Komentarze" przenosi do szczegółów posta

#### Polubienia
1. Na stronie głównej kliknij przycisk "❤️" przy poście
2. Sprawdź:
   - Licznik polubień się aktualizuje
   - Przycisk zmienia kolor (jeśli polubiono)

#### Szczegóły posta
1. Kliknij "💬 Komentarze" przy poście lub przejdź do: `http://localhost:3000/posts/1`
2. Sprawdź:
   - Wyświetlanie treści posta
   - Lista komentarzy
   - Formularz dodawania komentarza
   - Po dodaniu komentarza strona się odświeża

#### Lista użytkowników
1. Otwórz: `http://localhost:3000/users`
2. Sprawdź:
   - Wyświetlanie listy użytkowników
   - Wyszukiwanie użytkowników
   - Sortowanie (ID, username, liczba obserwowanych)
   - Paginacja

### 4. Testowanie API (Postman/curl/browser)

#### Test filtrowania i sortowania postów
```bash
# Wszystkie posty
curl http://localhost:3000/api/posts

# Filtrowanie po autorze
curl "http://localhost:3000/api/posts?userId=1"

# Wyszukiwanie
curl "http://localhost:3000/api/posts?search=JavaScript"

# Sortowanie po polubieniach
curl "http://localhost:3000/api/posts?sort=likes:desc"

# Paginacja
curl "http://localhost:3000/api/posts?page=1&limit=2"

# Kombinacja wszystkich parametrów
curl "http://localhost:3000/api/posts?page=1&limit=5&sort=likes:desc&search=dzień&userId=1"
```

#### Test filtrowania i sortowania użytkowników
```bash
# Wszyscy użytkownicy
curl http://localhost:3000/api/users

# Wyszukiwanie
curl "http://localhost:3000/api/users?search=jan"

# Sortowanie
curl "http://localhost:3000/api/users?sort=username:asc"

# Paginacja
curl "http://localhost:3000/api/users?page=1&limit=1"

# Kombinacja
curl "http://localhost:3000/api/users?page=1&limit=5&sort=following:desc&search=ania"
```

#### Test polubień (POST)
```bash
curl -X POST http://localhost:3000/api/posts/1/like \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

#### Test dodawania komentarza (POST)
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "content": "Świetny post!"}'
```

### 5. Testowanie paginacji
1. Jeśli masz mniej niż 10 postów, dodaj więcej przez API:
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "content": "Test paginacji 1"}'
```
2. Sprawdź paginację na stronie głównej - powinny pojawić się przyciski "Poprzednia"/"Następna"

### 6. Testowanie błędów
- Otwórz nieistniejącą stronę: `http://localhost:3000/nieistniejaca`
- Sprawdź czy wyświetla się strona błędu 404

## Sugerowane biblioteki (nie zaimplementowane)

### Dla skrócenia kodu i czytelności:

1. **express-validator** - walidacja danych wejściowych
   - Zamiast ręcznej walidacji w każdym route
   - Przykład: `body('email').isEmail()`

2. **helmet** - bezpieczeństwo HTTP headers
   - Automatyczna konfiguracja nagłówków bezpieczeństwa

3. **compression** - kompresja odpowiedzi
   - Automatyczna kompresja gzip dla szybszego ładowania

4. **morgan** - logowanie requestów
   - Łatwiejsze debugowanie i monitoring

5. **dotenv** - zmienne środowiskowe
   - Zarządzanie konfiguracją (PORT, DB_URL, itp.)

6. **express-rate-limit** - ograniczenie liczby requestów
   - Ochrona przed nadużyciami API

7. **joi** lub **yup** - schematy walidacji
   - Bardziej zaawansowana walidacja niż express-validator

8. **lodash** - funkcje pomocnicze
   - Uproszczenie operacji na tablicach/obiektach

## Struktura projektu po zmianach

```
social-app-backend/
├── data/              # Pliki JSON z danymi
├── middleware/       # Middleware Express
├── models/           # Modele danych
├── public/           # Statyczne pliki (CSS, JS)
│   ├── css/
│   └── js/
├── routes/           # Routing
│   ├── auth.js      # API autoryzacji
│   ├── frontend.js  # Frontend routes (nowe!)
│   ├── posts.js     # API postów (rozszerzone!)
│   └── users.js      # API użytkowników (rozszerzone!)
├── views/           # Szablony EJS (nowe!)
│   ├── partials/
│   ├── posts.ejs
│   ├── users.ejs
│   ├── post-detail.ejs
│   └── error.ejs
├── package.json
└── server.js         # Główny plik serwera
```

## Uwagi

- Frontend jest teraz całkowicie po stronie serwera (SSR)
- Wszystkie interakcje używają AJAX/fetch do komunikacji z API
- Routing działa po stronie serwera (nie SPA)
- API zwraca dane w formacie JSON z paginacją
- Frontend renderuje HTML z danymi z serwera

```


Korygowanie przekazywania activeTab do widoków:


```javascript
// routes/frontend.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

function readData(filename) {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Błąd odczytu pliku ${filename}:`, err);
    return [];
  }
}

// Strona główna - lista postów
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'createdAt:desc';
    const search = req.query.search || '';
    const userId = req.query.userId || '';
    
    // Pobierz dane z API (lub bezpośrednio)
    let posts = readData('posts.json');
    const users = readData('users.json');
    
    // Filtrowanie
    if (userId) {
      posts = posts.filter(p => p.userId === parseInt(userId));
    }
    if (search) {
      posts = posts.filter(p => 
        p.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sortowanie
    const [sortField, sortOrder] = sort.split(':');
    const order = sortOrder === 'asc' ? 1 : -1;
    posts.sort((a, b) => {
      let aVal, bVal;
      if (sortField === 'createdAt') {
        aVal = new Date(a.createdAt || 0);
        bVal = new Date(b.createdAt || 0);
      } else if (sortField === 'likes') {
        aVal = a.likes?.length || 0;
        bVal = b.likes?.length || 0;
      } else {
        aVal = a[sortField] || '';
        bVal = b[sortField] || '';
      }
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
    
    // Paginacja
    const total = posts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedPosts = posts.slice(startIndex, startIndex + limit);
    
    // Mapuj użytkowników
    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = { ...u };
      delete usersMap[u.id].password;
    });
    
    res.render('posts', {
      posts: paginatedPosts,
      users: usersMap,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        sort,
        search,
        userId
      },
      allUsers: users.map(u => ({ id: u.id, username: u.username, displayName: u.displayName })),
      activeTab: 'posts'
    });
  } catch (err) {
    next(err);
  }
});

// Strona użytkowników
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'id:asc';
    const search = req.query.search || '';
    
    let users = readData('users.json');
    
    // Filtrowanie
    if (search) {
      users = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Sortowanie
    const [sortField, sortOrder] = sort.split(':');
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
    
    // Paginacja
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedUsers = users.slice(startIndex, startIndex + limit);
    
    // Usuń hasła
    const sanitizedUsers = paginatedUsers.map(({ password, ...user }) => user);
    
    res.render('users', {
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        sort,
        search
      }
    });
  } catch (err) {
    next(err);
  }
});

// Pojedynczy post
router.get('/posts/:id', async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const posts = readData('posts.json');
    const users = readData('users.json');
    const comments = readData('comments.json');
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).render('error', { 
        message: 'Post nie został znaleziony',
        error: { status: 404 }
      });
    }
    
    const postComments = comments
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = { ...u };
      delete usersMap[u.id].password;
    });
    
    res.render('post-detail', {
      post,
      user: usersMap[post.userId],
      comments: postComments,
      commentUsers: usersMap
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


```

```javascript
// routes/frontend.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

function readData(filename) {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Błąd odczytu pliku ${filename}:`, err);
    return [];
  }
}

// Strona główna - lista postów
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'createdAt:desc';
    const search = req.query.search || '';
    const userId = req.query.userId || '';
    
    // Pobierz dane z API (lub bezpośrednio)
    let posts = readData('posts.json');
    const users = readData('users.json');
    
    // Filtrowanie
    if (userId) {
      posts = posts.filter(p => p.userId === parseInt(userId));
    }
    if (search) {
      posts = posts.filter(p => 
        p.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sortowanie
    const [sortField, sortOrder] = sort.split(':');
    const order = sortOrder === 'asc' ? 1 : -1;
    posts.sort((a, b) => {
      let aVal, bVal;
      if (sortField === 'createdAt') {
        aVal = new Date(a.createdAt || 0);
        bVal = new Date(b.createdAt || 0);
      } else if (sortField === 'likes') {
        aVal = a.likes?.length || 0;
        bVal = b.likes?.length || 0;
      } else {
        aVal = a[sortField] || '';
        bVal = b[sortField] || '';
      }
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
    
    // Paginacja
    const total = posts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedPosts = posts.slice(startIndex, startIndex + limit);
    
    // Mapuj użytkowników
    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = { ...u };
      delete usersMap[u.id].password;
    });
    
    res.render('posts', {
      posts: paginatedPosts,
      users: usersMap,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        sort,
        search,
        userId
      },
      allUsers: users.map(u => ({ id: u.id, username: u.username, displayName: u.displayName })),
      activeTab: 'posts'
    });
  } catch (err) {
    next(err);
  }
});

// Strona użytkowników
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'id:asc';
    const search = req.query.search || '';
    
    let users = readData('users.json');
    
    // Filtrowanie
    if (search) {
      users = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Sortowanie
    const [sortField, sortOrder] = sort.split(':');
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
    
    // Paginacja
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedUsers = users.slice(startIndex, startIndex + limit);
    
    // Usuń hasła
    const sanitizedUsers = paginatedUsers.map(({ password, ...user }) => user);
    
    res.render('users', {
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        sort,
        search
      },
      activeTab: 'users'
    });
  } catch (err) {
    next(err);
  }
});

// Pojedynczy post
router.get('/posts/:id', async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const posts = readData('posts.json');
    const users = readData('users.json');
    const comments = readData('comments.json');
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).render('error', { 
        message: 'Post nie został znaleziony',
        error: { status: 404 }
      });
    }
    
    const postComments = comments
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = { ...u };
      delete usersMap[u.id].password;
    });
    
    res.render('post-detail', {
      post,
      user: usersMap[post.userId],
      comments: postComments,
      commentUsers: usersMap
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


```


## Podsumowanie zmian

### 1. Usunięto React
- Usunięto folder `social-app-frontend` i wszystkie zależności React

### 2. Konwersja na Express.js z server-side rendering
- Dodano EJS jako silnik szablonów
- Utworzono widoki EJS w `views/`
- Skonfigurowano Express do renderowania HTML po stronie serwera

### 3. Rozszerzenie API o filtrowanie, sortowanie i paginację

**API Posts (`/api/posts`):**
- Filtrowanie: `?userId=1`, `?search=tekst`, `?minLikes=5`
- Sortowanie: `?sort=createdAt:desc`, `?sort=likes:desc`, itp.
- Paginacja: `?page=1&limit=10`
- Odpowiedź zawiera `data` i `pagination`

**API Users (`/api/users`):**
- Filtrowanie: `?search=tekst`, `?minFollowing=5`
- Sortowanie: `?sort=username:asc`, `?sort=following:desc`, itp.
- Paginacja: `?page=1&limit=10`

### 4. Frontend routing
- `GET /` — lista postów z filtrowaniem, sortowaniem i paginacją
- `GET /users` — lista użytkowników z filtrowaniem, sortowaniem i paginacją
- `GET /posts/:id` — szczegóły posta z komentarzami

### 5. Interakcja użytkownika
- Polubienia postów (AJAX)
- Dodawanie komentarzy (formularze)
- Filtrowanie i sortowanie przez formularze
- Paginacja przez linki

## Jak przetestować

1. Zainstaluj zależności:
   ```bash
   cd social-app-backend
   npm install
   ```

2. Uruchom serwer:
   ```bash
   npm start
   ```

3. Otwórz w przeglądarce:
   - `http://localhost:3000` — lista postów
   - `http://localhost:3000/users` — lista użytkowników
   - `http://localhost:3000/posts/1` — szczegóły posta

4. Przetestuj funkcje:
   - Filtrowanie i sortowanie na stronie głównej
   - Polubienia postów (przycisk ❤️)
   - Dodawanie komentarzy
   - Paginacja

5. Przetestuj API (curl/Postman):
   ```bash
   # Filtrowanie i sortowanie
   curl "http://localhost:3000/api/posts?page=1&limit=5&sort=likes:desc&search=JavaScript"
   
   # Użytkownicy
   curl "http://localhost:3000/api/users?sort=username:asc&search=jan"
   ```

## Sugerowane biblioteki (nie zaimplementowane)

1. express-validator — walidacja danych
2. helmet — bezpieczeństwo HTTP headers
3. compression — kompresja odpowiedzi
4. morgan — logowanie requestów
5. dotenv — zmienne środowiskowe
6. express-rate-limit — ograniczenie requestów
7. joi/yup — schematy walidacji
8. lodash — funkcje pomocnicze

Szczegóły w pliku `ZMiany_i_testowanie.md`.

Projekt jest gotowy do testowania. Wszystkie funkcje działają po stronie serwera z Express.js i EJS.

```shellscript
   cd social-app-backend
   npm install
```

```shellscript
   npm start
```

```shellscript
   # Filtrowanie i sortowanie
   curl "http://localhost:3000/api/posts?page=1&limit=5&sort=likes:desc&search=JavaScript"
   
   # Użytkownicy
   curl "http://localhost:3000/api/users?sort=username:asc&search=jan"
```

