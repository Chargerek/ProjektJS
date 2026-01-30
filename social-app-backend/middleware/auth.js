/**
 * Middleware do autoryzacji użytkowników
 * Weryfikuje JWT token z nagłówka Authorization
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware do weryfikacji JWT tokenu
 * Dodaje req.user z danymi użytkownika jeśli token jest poprawny
 */
const authenticate = (req, res, next) => {
  try {
    // Pobierz token z nagłówka Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Nieautoryzowany',
        message: 'Brak tokenu autoryzacyjnego. Zaloguj się ponownie.'
      });
    }

    const token = authHeader.substring(7); // Usuń "Bearer "

    // Weryfikuj token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Dodaj dane użytkownika do requestu
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Nieautoryzowany',
        message: 'Nieprawidłowy token'
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Nieautoryzowany',
        message: 'Token wygasł. Zaloguj się ponownie.'
      });
    }
    next(err);
  }
};

/**
 * Opcjonalna autoryzacja - nie wymaga tokenu, ale jeśli jest, weryfikuje go
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      } catch (err) {
        // Ignoruj błędy - użytkownik nie jest zalogowany
        req.user = null;
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  JWT_SECRET
};


