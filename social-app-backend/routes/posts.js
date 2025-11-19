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

// GET /api/posts — lista wszystkich postów
router.get('/', (req, res, next) => {
  try {
    const posts = readData('posts.json');
    // Sortuj od najnowszych
    const sortedPosts = posts.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(sortedPosts);
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