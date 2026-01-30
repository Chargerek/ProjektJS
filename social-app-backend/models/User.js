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

const Joi = require('joi');

// Schemat walidacji dla rejestracji użytkownika
const userRegistrationSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.empty': 'Username jest wymagane',
      'string.min': 'Username musi mieć od 3 do 20 znaków',
      'string.max': 'Username musi mieć od 3 do 20 znaków',
      'string.pattern.base': 'Username może zawierać tylko litery, cyfry i podkreślniki',
      'any.required': 'Username jest wymagane'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email jest wymagany',
      'string.email': 'Nieprawidłowy format email',
      'any.required': 'Email jest wymagany'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Hasło jest wymagane',
      'string.min': 'Hasło musi mieć co najmniej 6 znaków',
      'any.required': 'Hasło jest wymagane'
    })
});

// Schemat walidacji dla aktualizacji profilu użytkownika
const userUpdateSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .optional()
    .messages({
      'string.min': 'Username musi mieć od 3 do 20 znaków',
      'string.max': 'Username musi mieć od 3 do 20 znaków',
      'string.pattern.base': 'Username może zawierać tylko litery, cyfry i podkreślniki'
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Nieprawidłowy format email'
    }),
  displayName: Joi.string()
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'DisplayName musi być stringiem'
    }),
  bio: Joi.string()
    .max(500)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Biogram nie może przekraczać 500 znaków'
    }),
  avatar: Joi.string()
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'Avatar musi być stringiem'
    }),
  avatarPosition: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Pozycja awatara musi być liczbą',
      'number.min': 'Pozycja musi być między 0 a 100',
      'number.max': 'Pozycja musi być między 0 a 100'
    })
});

/**
 * Walidacja danych użytkownika przy rejestracji
 */
const validateUserRegistration = (userData) => {
  const { error } = userRegistrationSchema.validate(userData, { abortEarly: false });

  return {
    isValid: !error,
    errors: error ? error.details.map(detail => detail.message) : []
  };
};

/**
 * Walidacja danych użytkownika przy aktualizacji profilu
 */
const validateUserUpdate = (userData) => {
  const { error } = userUpdateSchema.validate(userData, { abortEarly: false });

  return {
    isValid: !error,
    errors: error ? error.details.map(detail => detail.message) : []
  };
};

module.exports = {
  validateUserRegistration,
  validateUserUpdate
};
