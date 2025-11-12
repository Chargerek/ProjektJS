// routes/posts.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Funkcja pomocnicza do odczytu danych
function readData(filename) {
  const data = fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8');
  return JSON.parse(data);
}

function writeData(filename, data) {
  fs.writeFileSync(path.join(__dirname, '../data', filename), JSON.stringify(data, null, 2));
}

// GET /api/posts — lista wszystkich postów (mock)
router.get('/', (req, res) => {
  try {
    const posts = readData('posts.json');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Nie udało się wczytać postów' });
  }
});

// POST /api/posts — dodaj nowy post (mock)
router.post('/', (req, res) => {
  const { userId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: 'userId i content są wymagane' });
  }

  const posts = readData('posts.json');
  const newPost = {
    id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
    userId: parseInt(userId),
    content,
    likes: [],
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  writeData('posts.json', posts);

  res.status(201).json({
    message: 'Post dodany',
    post: newPost
  });
});

// POST /api/posts/:id/like — lajkuj post (mock)
router.post('/:id/like', (req, res) => {
  const postId = parseInt(req.params.id);
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId jest wymagany' });
  }

  const userIdNum = parseInt(userId);
  const posts = readData('posts.json');
  const post = posts.find(p => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post nie istnieje' });
  }

  // Upewnij się, że likes to tablica
  if (!Array.isArray(post.likes)) {
    post.likes = [];
  }

  // Sprawdź, czy użytkownik już polubił
  if (post.likes.includes(userIdNum)) {
    return res.status(409).json({ error: 'Już polubiono ten post' });
  }

  post.likes.push(userIdNum);
  writeData('posts.json', posts);

  res.json({
    message: 'Post polubiono',
    post
  });
});

// GET /api/posts/:id/comments — komentarze do posta (mock)
router.get('/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  const comments = readData('comments.json');
  const postComments = comments.filter(c => c.postId === postId);

  res.json(postComments);
});

// POST /api/posts/:id/comments — dodaj komentarz (mock)
router.post('/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  const { userId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: 'userId i content są wymagane' });
  }

  const comments = readData('comments.json');
  const newComment = {
    id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
    postId,
    userId: parseInt(userId),
    content,
    createdAt: new Date().toISOString()
  };

  comments.push(newComment);
  writeData('comments.json', comments);

  res.status(201).json({
    message: 'Komentarz dodany',
    comment: newComment
  });
});

// DELETE /api/posts/:id — usuń post (tylko jeśli user to autor)
router.delete('/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const { userId } = req.body; // w praktyce: z tokena JWT, ale tu mock

  if (!userId) {
    return res.status(400).json({ error: 'userId jest wymagany' });
  }

  const posts = readData('posts.json');
  const postIndex = posts.findIndex(p => p.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post nie istnieje' });
  }

  // Sprawdź, czy user jest właścicielem
  if (posts[postIndex].userId !== parseInt(userId)) {
    return res.status(403).json({ error: 'Nie możesz usunąć cudzego posta' });
  }

  posts.splice(postIndex, 1);
  writeData('posts.json', posts);

  res.json({
    message: 'Post usunięty',
    deletedId: postId
  });
});

// Eksportuj router — 🔑 to kluczowe!
module.exports = router;