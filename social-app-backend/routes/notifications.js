const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticate } = require('../middleware/auth');

// GET /api/notifications - Pobierz powiadomienia zalogowanego użytkownika
router.get('/', authenticate, (req, res, next) => {
    try {
        const userId = req.user.id;
        const notifications = db.prepare(`
      SELECT n.*, u.username as actorUsername, u.displayName as actorDisplayName
      FROM notifications n
      JOIN users u ON n.actorId = u.id
      WHERE n.userId = ?
      ORDER BY n.createdAt DESC
      LIMIT 50
    `).all(userId);

        res.json(notifications);
    } catch (err) {
        next(err);
    }
});

// PUT /api/notifications/:id/read - Oznacz jako przeczytane
router.put('/:id/read', authenticate, (req, res, next) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id;

        const result = db.prepare(`
      UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?
    `).run(notificationId, userId);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Nie znaleziono powiadomienia' });
        }

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
