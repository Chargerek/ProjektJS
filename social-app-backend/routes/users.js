// routes/users.js
const express = require('express');
const router = express.Router();
const { validateUserUpdate } = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const upload = require('../middleware/upload');
const db = require('../database');

// POST /api/users/upload — przesyłanie zdjęcia (avatara)
router.post('/upload', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Brak pliku' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// GET /api/users — lista użytkowników z filtrowaniem, sortowaniem i paginacją
router.get('/', (req, res, next) => {
  try {
    let query = 'SELECT id, username, email, displayName, bio, avatar, avatarPosition, isAdmin, createdAt FROM users WHERE 1=1';
    const params = [];

    // FILTROWANIE
    // ?search=tekst - wyszukaj w username/displayName
    if (req.query.search) {
      query += ' AND (LOWER(username) LIKE ? OR LOWER(displayName) LIKE ?)';
      const searchTerm = `%${req.query.search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm);
    }

    // SORTOWANIE
    // ?sort=username:asc lub ?sort=following:desc
    const sortParam = req.query.sort || 'id:asc';
    const [sortField, sortOrder] = sortParam.split(':');
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    let orderBy = 'id ASC';
    if (sortField === 'username' || sortField === 'displayName' || sortField === 'createdAt') {
      orderBy = `${sortField} ${order}`;
    } else if (sortField === 'following') {
      // Dla sortowania po liczbie obserwowanych, użyjemy subquery
      orderBy = `(SELECT COUNT(*) FROM user_following WHERE followerId = users.id) ${order}`;
    }

    // PAGINACJA
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Pobierz użytkowników
    let finalQuery = `${query} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const users = db.prepare(finalQuery).all(...params, limit, offset);

    // Pobierz liczbę obserwowanych dla każdego użytkownika
    const getFollowingCount = db.prepare(`
      SELECT COUNT(*) as count FROM user_following WHERE followerId = ?
    `);

    const usersWithFollowing = users.map(user => {
      const count = getFollowingCount.get(user.id);
      return {
        ...user,
        following: count ? count.count : 0
      };
    });

    // Filtrowanie po minFollowing (jeśli potrzebne)
    let filteredUsers = usersWithFollowing;
    if (req.query.minFollowing) {
      const minFollowing = parseInt(req.query.minFollowing);
      filteredUsers = usersWithFollowing.filter(u => u.following >= minFollowing);
    }

    // Pobierz całkowitą liczbę (dla paginacji)
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (req.query.search) {
      countQuery += ' AND (LOWER(username) LIKE ? OR LOWER(displayName) LIKE ?)';
      const searchTerm = `%${req.query.search.toLowerCase()}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const totalResult = db.prepare(countQuery).get(...countParams);
    let total = totalResult.total;

    // Jeśli jest filtrowanie po minFollowing, przelicz
    if (req.query.minFollowing) {
      total = filteredUsers.length;
    }

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: filteredUsers,
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
    const user = db.prepare(`
      SELECT id, username, email, displayName, bio, avatar, isAdmin, createdAt FROM users WHERE id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Użytkownik o podanym ID nie istnieje'
      });
    }

    // Pobierz listę obserwowanych
    const following = db.prepare(`
      SELECT followingId FROM user_following WHERE followerId = ?
    `).all(userId).map(row => row.followingId);

    res.json({
      ...user,
      following
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id — edycja profilu
router.put('/:id', authenticate, (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, email, displayName, bio, avatar, avatarPosition } = req.body;

    if (req.user.id !== userId) {
      return res.status(403).json({
        error: 'Brak dostępu',
        message: 'Możesz edytować tylko swój profil'
      });
    }

    // Walidacja
    const validation = validateUserUpdate({ username, email, displayName, bio, avatar, avatarPosition });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Błąd walidacji',
        details: validation.errors
      });
    }

    // Sprawdź czy użytkownik istnieje
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Użytkownik o podanym ID nie istnieje'
      });
    }

    // Sprawdź czy email/username nie są zajęte przez innego użytkownika
    if (email) {
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
      if (existingUser) {
        return res.status(409).json({
          error: 'Konflikt',
          message: 'Email jest już zajęty'
        });
      }
    }

    if (username) {
      const existingUser = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
      if (existingUser) {
        return res.status(409).json({
          error: 'Konflikt',
          message: 'Username jest już zajęty'
        });
      }
    }

    // Aktualizuj dane
    const updates = [];
    const updateParams = [];

    if (username) {
      updates.push('username = ?');
      updateParams.push(username);
    }
    if (email) {
      updates.push('email = ?');
      updateParams.push(email);
    }
    if (displayName !== undefined) {
      updates.push('displayName = ?');
      updateParams.push(displayName);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      updateParams.push(bio);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      updateParams.push(avatar);
    }
    if (avatarPosition !== undefined) {
      updates.push('avatarPosition = ?');
      updateParams.push(avatarPosition);
    }

    if (updates.length > 0) {
      updateParams.push(userId);
      const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(updateQuery).run(...updateParams);
    }

    // Pobierz zaktualizowanego użytkownika
    const updatedUser = db.prepare(`
      SELECT id, username, email, displayName, bio, avatar, avatarPosition, isAdmin, createdAt FROM users WHERE id = ?
    `).get(userId);

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

    // Sprawdź czy użytkownicy istnieją
    const follower = db.prepare('SELECT id FROM users WHERE id = ?').get(followerId);
    const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(targetUserId);

    if (!follower || !targetUser) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Użytkownik nie istnieje'
      });
    }

    // Sprawdź czy już obserwuje
    const existingFollow = db.prepare(`
      SELECT * FROM user_following WHERE followerId = ? AND followingId = ?
    `).get(followerId, targetUserId);

    if (existingFollow) {
      // Przestań obserwować
      db.prepare(`
        DELETE FROM user_following WHERE followerId = ? AND followingId = ?
      `).run(followerId, targetUserId);

      const followingCount = db.prepare(`
        SELECT COUNT(*) as count FROM user_following WHERE followerId = ?
      `).get(followerId);

      return res.json({
        message: 'Przestano obserwować użytkownika',
        following: false,
        followingCount: followingCount.count
      });
    } else {
      // Zacznij obserwować
      db.prepare(`
        INSERT INTO user_following (followerId, followingId) VALUES (?, ?)
      `).run(followerId, targetUserId);

      const followingCount = db.prepare(`
        SELECT COUNT(*) as count FROM user_following WHERE followerId = ?
      `).get(followerId);

      return res.json({
        message: 'Zaczęto obserwować użytkownika',
        following: true,
        followingCount: followingCount.count
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id/activity — pobierz posty i polubienia użytkownika
router.get('/:id/activity', (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    // Sprawdź czy użytkownik istnieje
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Użytkownik nie istnieje'
      });
    }

    // Pobierz posty użytkownika
    const posts = db.prepare(`
      SELECT p.*, COUNT(DISTINCT c.id) as commentCount
      FROM posts p
      LEFT JOIN comments c ON p.id = c.postId
      WHERE p.userId = ?
      GROUP BY p.id
      ORDER BY p.createdAt DESC
    `).all(userId);

    // Pobierz polubienia dla każdego posta
    const getLikes = db.prepare('SELECT userId FROM post_likes WHERE postId = ?');
    const postsWithLikes = posts.map(post => ({
      ...post,
      likes: getLikes.all(post.id).map(l => l.userId)
    }));

    // Pobierz posty polubione przez użytkownika
    const likedPosts = db.prepare(`
      SELECT p.*, COUNT(DISTINCT c.id) as commentCount
      FROM posts p
      JOIN post_likes pl ON p.id = pl.postId
      LEFT JOIN comments c ON p.id = c.postId
      WHERE pl.userId = ?
      GROUP BY p.id
      ORDER BY p.createdAt DESC
    `).all(userId);

    const likedPostsWithLikes = likedPosts.map(post => ({
      ...post,
      likes: getLikes.all(post.id).map(l => l.userId)
    }));

    res.json({
      posts: postsWithLikes,
      likedPosts: likedPostsWithLikes
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id — usuń użytkownika (Tylko Admin)
router.delete('/:id', authenticate, adminOnly, (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    if (userId === req.user.id) {
      return res.status(400).json({
        error: 'Błąd',
        message: 'Nie możesz usunąć samego siebie'
      });
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Użytkownik nie istnieje'
      });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    res.json({ message: 'Użytkownik został usunięty' });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/:id/promote — dodaj/odbierz uprawnienia admina (Tylko Admin)
router.post('/:id/promote', authenticate, adminOnly, (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const user = db.prepare('SELECT id, isAdmin FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Nie znaleziono',
        message: 'Użytkownik nie istnieje'
      });
    }

    const newIsAdmin = user.isAdmin ? 0 : 1;
    db.prepare('UPDATE users SET isAdmin = ? WHERE id = ?').run(newIsAdmin, userId);

    res.json({
      message: newIsAdmin ? 'Przyznano uprawnienia administratora' : 'Odebrano uprawnienia administratora',
      isAdmin: newIsAdmin
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
