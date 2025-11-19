/**
 * Middleware do obsługi błędów
 * Musi być dodany jako ostatni middleware w app.js/server.js
 */

const errorHandler = (err, req, res, next) => {
  console.error('❌ Błąd:', err);

  // Błąd walidacji
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Błąd walidacji',
      details: err.message
    });
  }

  // Błąd 404
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Nie znaleziono',
      message: err.message || 'Zasób nie istnieje'
    });
  }

  // Błąd autoryzacji
  if (err.status === 401 || err.status === 403) {
    return res.status(err.status).json({
      error: 'Brak dostępu',
      message: err.message || 'Nie masz uprawnień do wykonania tej operacji'
    });
  }

  // Błąd konfliktu (np. duplikat)
  if (err.status === 409) {
    return res.status(409).json({
      error: 'Konflikt',
      message: err.message || 'Zasób już istnieje'
    });
  }

  // Błąd serwera (500)
  res.status(err.status || 500).json({
    error: 'Wewnętrzny błąd serwera',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Coś poszło nie tak'
  });
};

module.exports = errorHandler;

