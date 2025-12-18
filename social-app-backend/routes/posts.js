// routes/posts.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { validatePostCreate, validatePostUpdate } = require('../models/Post');
const { validateCommentCreate } = require('../models/Comment');
const { authenticate, optionalAuth } = require('../middleware/auth');

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
router.get('/', optionalAuth, (req, res, next) => {
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
router.post('/', authenticate, (req, res, next) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

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
      userId: userId,
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
router.put('/:id', authenticate, (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    const userId = req.user.id;

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
    if (posts[postIndex].userId !== userId) {
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
router.post('/:id/like', authenticate, (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const userIdNum = req.user.id;
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
router.post('/:id/comments', authenticate, (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    const userId = req.user.id;

    // Sprawdź czy post istnieje
    const posts = readData('posts.json');
    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ 
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje' 
      });
    }

    // Walidacja komentarza (userId z tokena)
    const validation = validateCommentCreate({ postId, userId: userId, content });
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
      userId: userId,
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
router.delete('/:id', authenticate, (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;

    const posts = readData('posts.json');
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({ 
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje' 
      });
    }

    // Sprawdź, czy user jest właścicielem
    if (posts[postIndex].userId !== userId) {
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