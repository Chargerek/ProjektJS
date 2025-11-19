/**
 * Model komentarza (Comment)
 * 
 * @typedef {Object} Comment
 * @property {number} id - Unikalny identyfikator komentarza
 * @property {number} postId - ID posta, do którego należy komentarz
 * @property {number} userId - ID użytkownika, który dodał komentarz
 * @property {string} content - Treść komentarza (wymagana, max 500 znaków)
 * @property {string} createdAt - Data utworzenia komentarza (ISO string)
 * @property {string} [updatedAt] - Data ostatniej aktualizacji (ISO string, opcjonalne)
 */

/**
 * Walidacja danych komentarza przy tworzeniu
 */
const validateCommentCreate = (commentData) => {
  const errors = [];

  if (!commentData.postId) {
    errors.push('postId jest wymagane');
  } else if (typeof commentData.postId !== 'number' && isNaN(parseInt(commentData.postId))) {
    errors.push('postId musi być liczbą');
  }

  if (!commentData.userId) {
    errors.push('userId jest wymagane');
  } else if (typeof commentData.userId !== 'number' && isNaN(parseInt(commentData.userId))) {
    errors.push('userId musi być liczbą');
  }

  if (!commentData.content || typeof commentData.content !== 'string') {
    errors.push('Content jest wymagany');
  } else if (commentData.content.trim().length === 0) {
    errors.push('Content nie może być pusty');
  } else if (commentData.content.length > 500) {
    errors.push('Content nie może przekraczać 500 znaków');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Walidacja danych komentarza przy aktualizacji
 */
const validateCommentUpdate = (commentData) => {
  const errors = [];

  if (commentData.content !== undefined) {
    if (typeof commentData.content !== 'string') {
      errors.push('Content musi być stringiem');
    } else if (commentData.content.trim().length === 0) {
      errors.push('Content nie może być pusty');
    } else if (commentData.content.length > 500) {
      errors.push('Content nie może przekraczać 500 znaków');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateCommentCreate,
  validateCommentUpdate
};

