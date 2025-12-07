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

const Joi = require('joi');

// Schemat walidacji dla tworzenia komentarza
const commentCreateSchema = Joi.object({
  postId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'postId musi być liczbą',
      'number.integer': 'postId musi być liczbą całkowitą',
      'number.positive': 'postId musi być liczbą dodatnią',
      'any.required': 'postId jest wymagane'
    }),
  userId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'userId musi być liczbą',
      'number.integer': 'userId musi być liczbą całkowitą',
      'number.positive': 'userId musi być liczbą dodatnią',
      'any.required': 'userId jest wymagane'
    }),
  content: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Content nie może być pusty',
      'string.min': 'Content nie może być pusty',
      'string.max': 'Content nie może przekraczać 500 znaków',
      'any.required': 'Content jest wymagany'
    })
});

// Schemat walidacji dla aktualizacji komentarza
const commentUpdateSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .optional()
    .messages({
      'string.empty': 'Content nie może być pusty',
      'string.min': 'Content nie może być pusty',
      'string.max': 'Content nie może przekraczać 500 znaków',
      'string.base': 'Content musi być stringiem'
    })
});

/**
 * Walidacja danych komentarza przy tworzeniu
 */
const validateCommentCreate = (commentData) => {
  // Konwersja ID na liczby jeśli są stringami
  const dataToValidate = {
    ...commentData,
    postId: typeof commentData.postId === 'string' ? parseInt(commentData.postId) : commentData.postId,
    userId: typeof commentData.userId === 'string' ? parseInt(commentData.userId) : commentData.userId
  };
  
  const { error } = commentCreateSchema.validate(dataToValidate, { abortEarly: false });
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => detail.message) : []
  };
};

/**
 * Walidacja danych komentarza przy aktualizacji
 */
const validateCommentUpdate = (commentData) => {
  const { error } = commentUpdateSchema.validate(commentData, { abortEarly: false });
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => detail.message) : []
  };
};

module.exports = {
  validateCommentCreate,
  validateCommentUpdate
};
