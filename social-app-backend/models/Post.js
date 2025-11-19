/**
 * Model posta (Post)
 * 
 * @typedef {Object} Post
 * @property {number} id - Unikalny identyfikator posta
 * @property {number} userId - ID użytkownika, który utworzył post
 * @property {string} content - Treść posta (wymagana, max 1000 znaków)
 * @property {number[]} likes - Tablica ID użytkowników, którzy polubili post
 * @property {string} createdAt - Data utworzenia posta (ISO string)
 * @property {string} [updatedAt] - Data ostatniej aktualizacji (ISO string, opcjonalne)
 * @property {string[]} [tags] - Tablica tagów (opcjonalne)
 * @property {string} [image] - URL do obrazka (opcjonalne)
 */

/**
 * Walidacja danych posta przy tworzeniu
 */
const validatePostCreate = (postData) => {
  const errors = [];

  if (!postData.userId) {
    errors.push('userId jest wymagane');
  } else if (typeof postData.userId !== 'number' && isNaN(parseInt(postData.userId))) {
    errors.push('userId musi być liczbą');
  }

  if (!postData.content || typeof postData.content !== 'string') {
    errors.push('Content jest wymagany');
  } else if (postData.content.trim().length === 0) {
    errors.push('Content nie może być pusty');
  } else if (postData.content.length > 1000) {
    errors.push('Content nie może przekraczać 1000 znaków');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Walidacja danych posta przy aktualizacji
 */
const validatePostUpdate = (postData) => {
  const errors = [];

  if (postData.content !== undefined) {
    if (typeof postData.content !== 'string') {
      errors.push('Content musi być stringiem');
    } else if (postData.content.trim().length === 0) {
      errors.push('Content nie może być pusty');
    } else if (postData.content.length > 1000) {
      errors.push('Content nie może przekraczać 1000 znaków');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validatePostCreate,
  validatePostUpdate
};

