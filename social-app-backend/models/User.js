/**
 * Model użytkownika (User)
 * 
 * @typedef {Object} User
 * @property {number} id - Unikalny identyfikator użytkownika
 * @property {string} username - Nazwa użytkownika (unikalna, 3-20 znaków)
 * @property {string} email - Adres email (unikalny, format email)
 * @property {string} password - Hasło (min 6 znaków, w produkcji powinno być zahashowane)
 * @property {string} displayName - Wyświetlana nazwa użytkownika
 * @property {number[]} following - Tablica ID użytkowników, których obserwuje
 * @property {string} [createdAt] - Data utworzenia konta (ISO string)
 * @property {string} [avatar] - URL do avatara użytkownika (opcjonalne)
 */

/**
 * Walidacja danych użytkownika przy rejestracji
 */
const validateUserRegistration = (userData) => {
  const errors = [];

  if (!userData.username || typeof userData.username !== 'string') {
    errors.push('Username jest wymagane');
  } else if (userData.username.length < 3 || userData.username.length > 20) {
    errors.push('Username musi mieć od 3 do 20 znaków');
  } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
    errors.push('Username może zawierać tylko litery, cyfry i podkreślniki');
  }

  if (!userData.email || typeof userData.email !== 'string') {
    errors.push('Email jest wymagany');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Nieprawidłowy format email');
    }
  }

  if (!userData.password || typeof userData.password !== 'string') {
    errors.push('Hasło jest wymagane');
  } else if (userData.password.length < 6) {
    errors.push('Hasło musi mieć co najmniej 6 znaków');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Walidacja danych użytkownika przy aktualizacji profilu
 */
const validateUserUpdate = (userData) => {
  const errors = [];

  if (userData.username !== undefined) {
    if (typeof userData.username !== 'string') {
      errors.push('Username musi być stringiem');
    } else if (userData.username.length < 3 || userData.username.length > 20) {
      errors.push('Username musi mieć od 3 do 20 znaków');
    }
  }

  if (userData.email !== undefined) {
    if (typeof userData.email !== 'string') {
      errors.push('Email musi być stringiem');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Nieprawidłowy format email');
      }
    }
  }

  if (userData.displayName !== undefined && typeof userData.displayName !== 'string') {
    errors.push('DisplayName musi być stringiem');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateUserRegistration,
  validateUserUpdate
};

