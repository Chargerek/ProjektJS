/**
 * Skrypt testowy do sprawdzania walidacji Joi
 * Uruchom: node test-validation.js
 */

const { validateUserRegistration, validateUserUpdate } = require('./models/User');
const { validatePostCreate, validatePostUpdate } = require('./models/Post');
const { validateCommentCreate, validateCommentUpdate } = require('./models/Comment');

console.log('🧪 Testowanie walidacji Joi\n');
console.log('='.repeat(60));

// Test 1: Walidacja rejestracji użytkownika - sukces
console.log('\n✅ TEST 1: Rejestracja użytkownika - poprawne dane');
const validUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};
const result1 = validateUserRegistration(validUser);
console.log('Wynik:', result1.isValid ? '✅ POPRAWNE' : '❌ BŁĄD');
if (!result1.isValid) {
  console.log('Błędy:', result1.errors);
}

// Test 2: Walidacja rejestracji - błędne dane
console.log('\n❌ TEST 2: Rejestracja użytkownika - błędne dane');
const invalidUser = {
  username: 'ab', // za krótkie
  email: 'niepoprawny-email', // zły format
  password: '123' // za krótkie
};
const result2 = validateUserRegistration(invalidUser);
console.log('Wynik:', result2.isValid ? '✅ POPRAWNE' : '❌ BŁĄD (oczekiwane)');
console.log('Błędy:', result2.errors);

// Test 3: Walidacja aktualizacji użytkownika
console.log('\n✅ TEST 3: Aktualizacja użytkownika - poprawne dane');
const updateUser = {
  username: 'newusername',
  email: 'newemail@example.com'
};
const result3 = validateUserUpdate(updateUser);
console.log('Wynik:', result3.isValid ? '✅ POPRAWNE' : '❌ BŁĄD');
if (!result3.isValid) {
  console.log('Błędy:', result3.errors);
}

// Test 4: Walidacja tworzenia posta
console.log('\n✅ TEST 4: Tworzenie posta - poprawne dane');
const validPost = {
  userId: 1,
  content: 'To jest przykładowy post'
};
const result4 = validatePostCreate(validPost);
console.log('Wynik:', result4.isValid ? '✅ POPRAWNE' : '❌ BŁĄD');
if (!result4.isValid) {
  console.log('Błędy:', result4.errors);
}

// Test 5: Walidacja posta - za długi content
console.log('\n❌ TEST 5: Tworzenie posta - za długi content');
const longPost = {
  userId: 1,
  content: 'a'.repeat(1001) // przekracza limit 1000 znaków
};
const result5 = validatePostCreate(longPost);
console.log('Wynik:', result5.isValid ? '✅ POPRAWNE' : '❌ BŁĄD (oczekiwane)');
console.log('Błędy:', result5.errors);

// Test 6: Walidacja komentarza
console.log('\n✅ TEST 6: Tworzenie komentarza - poprawne dane');
const validComment = {
  postId: 1,
  userId: 1,
  content: 'To jest komentarz'
};
const result6 = validateCommentCreate(validComment);
console.log('Wynik:', result6.isValid ? '✅ POPRAWNE' : '❌ BŁĄD');
if (!result6.isValid) {
  console.log('Błędy:', result6.errors);
}

// Test 7: Walidacja komentarza - za długi content
console.log('\n❌ TEST 7: Tworzenie komentarza - za długi content');
const longComment = {
  postId: 1,
  userId: 1,
  content: 'a'.repeat(501) // przekracza limit 500 znaków
};
const result7 = validateCommentCreate(longComment);
console.log('Wynik:', result7.isValid ? '✅ POPRAWNE' : '❌ BŁĄD (oczekiwane)');
console.log('Błędy:', result7.errors);

// Test 8: Konwersja typów (string -> number)
console.log('\n✅ TEST 8: Konwersja typów - userId jako string');
const postWithStringId = {
  userId: '1', // string zamiast number
  content: 'Test konwersji'
};
const result8 = validatePostCreate(postWithStringId);
console.log('Wynik:', result8.isValid ? '✅ POPRAWNE (konwersja działa)' : '❌ BŁĄD');
if (!result8.isValid) {
  console.log('Błędy:', result8.errors);
}

console.log('\n' + '='.repeat(60));
console.log('✅ Testy zakończone!');

