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

const Joi = require('joi');

// Schemat walidacji dla tworzenia posta
const postCreateSchema = Joi.object({
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
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Content nie może być pusty',
      'string.min': 'Content nie może być pusty',
      'string.max': 'Content nie może przekraczać 1000 znaków',
      'any.required': 'Content jest wymagany'
    })
});

// Schemat walidacji dla aktualizacji posta
const postUpdateSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'string.empty': 'Content nie może być pusty',
      'string.min': 'Content nie może być pusty',
      'string.max': 'Content nie może przekraczać 1000 znaków',
      'string.base': 'Content musi być stringiem'
    })
});

/**
 * Walidacja danych posta przy tworzeniu
 */
const validatePostCreate = (postData) => {
  // Konwersja userId na liczbę jeśli jest stringiem
  const dataToValidate = {
    ...postData,
    userId: typeof postData.userId === 'string' ? parseInt(postData.userId) : postData.userId
  };
  
  const { error } = postCreateSchema.validate(dataToValidate, { abortEarly: false });
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => detail.message) : []
  };
};

/**
 * Walidacja danych posta przy aktualizacji
 */
const validatePostUpdate = (postData) => {
  const { error } = postUpdateSchema.validate(postData, { abortEarly: false });
  
  return {
    isValid: !error,
    errors: error ? error.details.map(detail => detail.message) : []
  };
};

module.exports = {
  validatePostCreate,
  validatePostUpdate
};
