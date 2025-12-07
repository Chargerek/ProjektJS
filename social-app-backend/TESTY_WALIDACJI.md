# 🧪 Jak testować walidację Joi

## Metoda 1: Test jednostkowy (bez serwera)

Uruchom prosty skrypt testowy:

```bash
cd social-app-backend
node test-validation.js
```

Ten skrypt testuje wszystkie funkcje walidacji bez potrzeby uruchamiania serwera.

---

## Metoda 2: Test przez API (serwer musi działać)

### 1. Uruchom serwer:

```bash
cd social-app-backend
npm run dev
# lub
npm start
```

Serwer będzie działał na: **http://localhost:3000**

### 2. Testuj endpointy przez curl lub Postman

#### ✅ Test rejestracji - poprawne dane:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

#### ❌ Test rejestracji - błędne dane (powinno zwrócić błędy walidacji):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"ab\",\"email\":\"zly-email\",\"password\":\"123\"}"
```

**Oczekiwana odpowiedź:**
```json
{
  "error": "Błąd walidacji",
  "details": [
    "Username musi mieć od 3 do 20 znaków",
    "Nieprawidłowy format email",
    "Hasło musi mieć co najmniej 6 znaków"
  ]
}
```

#### ✅ Test tworzenia posta - poprawne dane:

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"content\":\"To jest mój pierwszy post\"}"
```

#### ❌ Test tworzenia posta - za długi content:

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"content\":\"$(python -c 'print(\"a\"*1001)')\"}"
```

#### ✅ Test dodawania komentarza:

```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"content\":\"To jest komentarz\"}"
```

---

## Metoda 3: Test przez przeglądarkę (Postman/Thunder Client)

### Postman:
1. Otwórz Postman
2. Utwórz nowy request
3. Wybierz metodę POST
4. Wpisz URL: `http://localhost:3000/api/auth/register`
5. W zakładce "Body" wybierz "raw" i "JSON"
6. Wpisz dane testowe:

**Poprawne dane:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Błędne dane (do testowania walidacji):**
```json
{
  "username": "ab",
  "email": "zly-email",
  "password": "123"
}
```

7. Kliknij "Send" i sprawdź odpowiedź

---

## Metoda 4: Test przez frontend (jeśli masz)

Możesz też testować przez formularze w przeglądarce na `http://localhost:3000`

---

## Przykłady testów do sprawdzenia:

### ✅ Testy pozytywne (powinny przejść):
- Rejestracja z poprawnymi danymi
- Tworzenie posta z content < 1000 znaków
- Dodawanie komentarza z content < 500 znaków
- Aktualizacja profilu z opcjonalnymi polami

### ❌ Testy negatywne (powinny zwrócić błędy):
- Username < 3 znaków lub > 20 znaków
- Username z nieprawidłowymi znakami (np. spacje, znaki specjalne)
- Email w złym formacie
- Hasło < 6 znaków
- Content posta > 1000 znaków
- Content komentarza > 500 znaków
- Puste pola wymagane
- userId/postId jako string (powinno się przekonwertować)

---

## Szybki test wszystkich endpointów:

```bash
# 1. Test serwera
curl http://localhost:3000/api/test

# 2. Rejestracja - poprawne
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"user1\",\"email\":\"user1@test.com\",\"password\":\"pass123\"}"

# 3. Rejestracja - błędne (test walidacji)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"ab\",\"email\":\"zly\",\"password\":\"123\"}"

# 4. Tworzenie posta
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"content\":\"Test post\"}"

# 5. Tworzenie posta - za długi (test walidacji)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"content\":\"$(printf 'a%.0s' {1..1001})\"}"
```

---

## Co sprawdzić w odpowiedziach:

1. **Status code**: 
   - `200` lub `201` = sukces
   - `400` = błąd walidacji (oczekiwane dla błędnych danych)

2. **Body odpowiedzi**:
   - Dla błędów walidacji powinno być:
     ```json
     {
       "error": "Błąd walidacji",
       "details": ["komunikat 1", "komunikat 2", ...]
     }
     ```
   - Komunikaty powinny być po polsku
   - Wszystkie błędy powinny być zwrócone jednocześnie (nie tylko pierwszy)

