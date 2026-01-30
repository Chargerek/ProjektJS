// routes/posts.js
const express = require('express');
const router = express.Router();
const { validatePostCreate, validatePostUpdate } = require('../models/Post');
const { validateCommentCreate, validateCommentUpdate } = require('../models/Comment');
const { authenticate, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Pomocnicza funkcja do tworzenia powiadomień
function createNotification(userId, actorId, type, postId = null) {
  // Nie twórz powiadomienia, jeśli aktor to właściciel (np. lajkuje własny post)
  if (userId === actorId) return;

  try {
    db.prepare(`
      INSERT INTO notifications (userId, actorId, type, postId)
      VALUES (?, ?, ?, ?)
    `).run(userId, actorId, type, postId);
  } catch (err) {
    console.error('Błąd tworzenia powiadomienia:', err);
  }
}
const db = require('../database');

// GET /api/posts — lista wszystkich postów z filtrowaniem, sortowaniem i paginacją
router.get('/', optionalAuth, (req, res, next) => {
  try {
    let query = `
      SELECT 
        p.id,
        p.userId,
        p.content,
        p.imageUrl,
        p.createdAt,
        p.updatedAt,
        COUNT(DISTINCT c.id) as commentCount
      FROM posts p
      LEFT JOIN comments c ON p.id = c.postId
      WHERE 1=1
    `;
    const params = [];

    // FILTROWANIE
    // ?userId=1 - filtruj po autorze
    if (req.query.userId) {
      query += ' AND p.userId = ?';
      params.push(parseInt(req.query.userId));
    }

    // ?search=tekst - wyszukaj w treści posta
    if (req.query.search) {
      query += ' AND LOWER(p.content) LIKE ?';
      params.push(`%${req.query.search.toLowerCase()}%`);
    }

    query += ' GROUP BY p.id';

    // ?minLikes=5 - minimum polubień
    if (req.query.minLikes) {
      const minLikes = parseInt(req.query.minLikes);
      query += ` HAVING (SELECT COUNT(*) FROM post_likes WHERE postId = p.id) >= ?`;
      params.push(minLikes);
    }

    // SORTOWANIE
    const sortParam = req.query.sort || 'createdAt:desc';
    const [sortField, sortOrder] = sortParam.split(':');
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    let orderBy = 'p.createdAt DESC';
    if (sortField === 'createdAt') {
      orderBy = `p.createdAt ${order}`;
    } else if (sortField === 'likes') {
      orderBy = `(SELECT COUNT(*) FROM post_likes WHERE postId = p.id) ${order}`;
    } else if (sortField === 'userId') {
      orderBy = `p.userId ${order}`;
    }

    query += ` ORDER BY ${orderBy}`;

    // PAGINACJA
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Pobierz posty
    const posts = db.prepare(query).all(...params);

    // Pobierz polubienia dla każdego posta
    const getLikes = db.prepare(`
      SELECT userId FROM post_likes WHERE postId = ?
    `);

    const postsWithLikes = posts.map(post => {
      const likes = getLikes.all(post.id).map(row => row.userId);
      return {
        ...post,
        likes,
        commentCount: post.commentCount || 0
      };
    });

    // Pobierz całkowitą liczbę (dla paginacji)
    let countQuery = 'SELECT COUNT(DISTINCT p.id) as total FROM posts p WHERE 1=1';
    const countParams = [];

    if (req.query.userId) {
      countQuery += ' AND p.userId = ?';
      countParams.push(parseInt(req.query.userId));
    }

    if (req.query.search) {
      countQuery += ' AND LOWER(p.content) LIKE ?';
      countParams.push(`%${req.query.search.toLowerCase()}%`);
    }

    if (req.query.minLikes) {
      const minLikes = parseInt(req.query.minLikes);
      countQuery += ` AND (SELECT COUNT(*) FROM post_likes WHERE postId = p.id) >= ?`;
      countParams.push(minLikes);
    }

    const totalResult = db.prepare(countQuery).get(...countParams);
    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: postsWithLikes,
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
    const post = db.prepare(`
      SELECT * FROM posts WHERE id = ?
    `).get(postId);

    if (!post) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje'
      });
    }

    // Pobierz polubienia
    const likes = db.prepare(`
      SELECT userId FROM post_likes WHERE postId = ?
    `).all(postId).map(row => row.userId);

    // Pobierz liczbę komentarzy
    const commentCount = db.prepare(`
      SELECT COUNT(*) as count FROM comments WHERE postId = ?
    `).get(postId);

    res.json({
      ...post,
      likes,
      commentCount: commentCount.count || 0
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts — dodaj nowy post
router.post('/', authenticate, (req, res, next) => {
  try {
    const { content, image } = req.body;
    const userId = req.user.id;

    // Walidacja
    const validation = validatePostCreate({ userId, content });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Błąd walidacji',
        details: validation.errors
      });
    }

    const insertPost = db.prepare(`
      INSERT INTO posts (userId, content, imageUrl, createdAt)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertPost.run(
      userId,
      content.trim(),
      image || null,
      new Date().toISOString()
    );

    const newPostId = result.lastInsertRowid;
    const newPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(newPostId);

    res.status(201).json({
      message: 'Post dodany',
      post: {
        ...newPost,
        likes: [],
        commentCount: 0
      }
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

    // Sprawdź czy post istnieje
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje'
      });
    }

    // Sprawdź uprawnienia
    if (post.userId !== userId) {
      return res.status(403).json({
        error: 'Brak dostępu',
        message: 'Możesz edytować tylko swoje posty'
      });
    }

    // Aktualizuj post
    db.prepare(`
      UPDATE posts SET content = ?, updatedAt = ? WHERE id = ?
    `).run(content.trim(), new Date().toISOString(), postId);

    const updatedPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);

    // Pobierz polubienia
    const likes = db.prepare(`
      SELECT userId FROM post_likes WHERE postId = ?
    `).all(postId).map(row => row.userId);

    res.json({
      message: 'Post zaktualizowany',
      post: {
        ...updatedPost,
        likes
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/like — lajkuj/odlajkuj post
router.post('/:id/like', authenticate, (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;

    // Sprawdź czy post istnieje
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje'
      });
    }

    // Sprawdź czy już polubił
    const existingLike = db.prepare(`
      SELECT * FROM post_likes WHERE postId = ? AND userId = ?
    `).get(postId, userId);

    if (existingLike) {
      // Odlajkuj
      db.prepare(`
        DELETE FROM post_likes WHERE postId = ? AND userId = ?
      `).run(postId, userId);

      const likes = db.prepare(`
        SELECT userId FROM post_likes WHERE postId = ?
      `).all(postId).map(row => row.userId);

      return res.json({
        message: 'Post odlajkowany',
        post: {
          ...post,
          likes
        },
        liked: false
      });
    } else {
      // Polub
      db.prepare(`
        INSERT INTO post_likes (postId, userId) VALUES (?, ?)
      `).run(postId, userId);

      const likes = db.prepare(`
        SELECT userId FROM post_likes WHERE postId = ?
      `).all(postId).map(row => row.userId);

      // Stwórz powiadomienie dla właściciela posta
      createNotification(post.userId, userId, 'like', postId);

      return res.json({
        message: 'Post polubiono',
        post: {
          ...post,
          likes
        },
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
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje'
      });
    }

    const comments = db.prepare(`
      SELECT * FROM comments 
      WHERE postId = ? 
      ORDER BY createdAt ASC
    `).all(postId);

    res.json(comments);
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
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje'
      });
    }

    // Walidacja komentarza
    const validation = validateCommentCreate({ postId, userId: userId, content });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Błąd walidacji',
        details: validation.errors
      });
    }

    const insertComment = db.prepare(`
      INSERT INTO comments (postId, userId, content, createdAt)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertComment.run(
      postId,
      userId,
      content.trim(),
      new Date().toISOString()
    );

    const newCommentId = result.lastInsertRowid;
    const newComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(newCommentId);

    // Stwórz powiadomienie dla właściciela posta
    if (post) {
      createNotification(post.userId, userId, 'comment', postId);
    }

    res.status(201).json({
      message: 'Komentarz dodany',
      comment: newComment
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/posts/:id/comments/:commentId — edytuj komentarz
router.put('/:id/comments/:commentId', authenticate, (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const commentId = parseInt(req.params.commentId);
    const { content } = req.body;
    const userId = req.user.id;

    // Sprawdź czy post istnieje
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje'
      });
    }

    // Walidacja
    const validation = validateCommentUpdate({ content });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Błąd walidacji',
        details: validation.errors
      });
    }

    // Sprawdź czy komentarz istnieje
    const comment = db.prepare(`
      SELECT * FROM comments WHERE id = ? AND postId = ?
    `).get(commentId, postId);

    if (!comment) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Komentarz o podanym ID nie istnieje'
      });
    }

    // Sprawdź uprawnienia
    if (comment.userId !== userId) {
      return res.status(403).json({
        error: 'Brak dostępu',
        message: 'Możesz edytować tylko swoje komentarze'
      });
    }

    // Aktualizuj komentarz
    db.prepare(`
      UPDATE comments SET content = ?, updatedAt = ? WHERE id = ?
    `).run(content.trim(), new Date().toISOString(), commentId);

    const updatedComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId);

    res.json({
      message: 'Komentarz zaktualizowany',
      comment: updatedComment
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:id/comments/:commentId — usuń komentarz
router.delete('/:id/comments/:commentId', authenticate, (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.id;

    // Sprawdź czy post istnieje
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje'
      });
    }

    // Sprawdź czy komentarz istnieje
    const comment = db.prepare(`
      SELECT * FROM comments WHERE id = ? AND postId = ?
    `).get(commentId, postId);

    if (!comment) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Komentarz o podanym ID nie istnieje'
      });
    }

    // Sprawdź uprawnienia (autor komentarza lub admin)
    if (comment.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Brak dostępu',
        message: 'Nie możesz usunąć tego komentarza'
      });
    }

    // Usuń komentarz
    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);

    res.json({
      message: 'Komentarz usunięty',
      deletedId: commentId
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

    // Sprawdź czy post istnieje
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Post o podanym ID nie istnieje'
      });
    }

    // Sprawdź, czy user jest właścicielem lub adminem
    if (post.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Brak dostępu',
        message: 'Nie możesz usunąć cudzego posta'
      });
    }

    // Usuń post (komentarze i polubienia zostaną usunięte przez CASCADE)
    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);

    res.json({
      message: 'Post usunięty',
      deletedId: postId
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/upload — upload obrazka
router.post('/upload', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Błąd', message: 'Nie przesłano pliku' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

module.exports = router;
