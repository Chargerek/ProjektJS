# Podsumowanie zmian i instrukcje testowania

## Co się zmieniło?

### 1. Usunięto React
- ✅ Całkowicie usunięto folder `social-app-frontend` z Reactem
- ✅ Usunięto wszystkie zależności React (react, react-dom, vite, itp.)

### 2. Konwersja na Express.js z server-side rendering
- ✅ Dodano EJS jako silnik szablonów
- ✅ Skonfigurowano Express do renderowania widoków po stronie serwera
- ✅ Utworzono strukturę:
  - `views/` - szablony EJS
    - `partials/header.ejs` - nagłówek strony
    - `partials/footer.ejs` - stopka strony
    - `posts.ejs` - lista postów
    - `users.ejs` - lista użytkowników
    - `post-detail.ejs` - szczegóły posta z komentarzami
    - `error.ejs` - strona błędu
  - `public/` - statyczne pliki
    - `css/style.css` - style CSS
    - `js/app.js` - JavaScript do interakcji

### 3. Rozszerzenie API o filtrowanie, sortowanie i paginację

#### API Posts (`/api/posts`)
**Filtrowanie:**
- `?userId=1` - filtruj po autorze
- `?search=tekst` - wyszukaj w treści posta
- `?minLikes=5` - minimum polubień

**Sortowanie:**
- `?sort=createdAt:desc` - najnowsze (domyślne)
- `?sort=createdAt:asc` - najstarsze
- `?sort=likes:desc` - najbardziej polubione
- `?sort=likes:asc` - najmniej polubione

**Paginacja:**
- `?page=1` - numer strony (domyślnie 1)
- `?limit=10` - liczba elementów na stronie (domyślnie 10)

**Przykład:**
```
GET /api/posts?page=1&limit=5&sort=likes:desc&search=JavaScript
```

**Odpowiedź:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 10,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### API Users (`/api/users`)
**Filtrowanie:**
- `?search=tekst` - wyszukaj w username/displayName
- `?minFollowing=5` - minimum obserwowanych

**Sortowanie:**
- `?sort=id:asc` - ID rosnąco (domyślne)
- `?sort=id:desc` - ID malejąco
- `?sort=username:asc` - username A-Z
- `?sort=username:desc` - username Z-A
- `?sort=following:desc` - najwięcej obserwowanych
- `?sort=following:asc` - najmniej obserwowanych

**Paginacja:**
- `?page=1` - numer strony
- `?limit=10` - liczba elementów na stronie

**Przykład:**
```
GET /api/users?page=1&limit=5&sort=username:asc&search=jan
```

### 4. Frontend routing w Express
- ✅ `GET /` - strona główna z listą postów
- ✅ `GET /users` - lista użytkowników
- ✅ `GET /posts/:id` - szczegóły posta z komentarzami

### 5. Interakcja użytkownika
- ✅ Polubienia postów (AJAX)
- ✅ Dodawanie komentarzy (formularze)
- ✅ Filtrowanie i sortowanie (formularze GET)
- ✅ Paginacja (linki)

## Jak przetestować?

### 1. Instalacja zależności
```bash
cd social-app-backend
npm install
```

### 2. Uruchomienie serwera
```bash
npm start
# lub w trybie deweloperskim:
npm run dev
```

Serwer będzie dostępny pod adresem: `http://localhost:3000`

### 3. Testowanie frontendu (przeglądarka)

#### Strona główna - Lista postów
1. Otwórz: `http://localhost:3000`
2. Sprawdź:
   - Wyświetlanie listy postów
   - Filtrowanie po autorze (dropdown)
   - Wyszukiwanie w treści postów
   - Sortowanie (najnowsze, najstarsze, polubienia)
   - Paginacja (jeśli jest więcej niż 10 postów)
   - Kliknięcie "Komentarze" przenosi do szczegółów posta

#### Polubienia
1. Na stronie głównej kliknij przycisk "❤️" przy poście
2. Sprawdź:
   - Licznik polubień się aktualizuje
   - Przycisk zmienia kolor (jeśli polubiono)

#### Szczegóły posta
1. Kliknij "💬 Komentarze" przy poście lub przejdź do: `http://localhost:3000/posts/1`
2. Sprawdź:
   - Wyświetlanie treści posta
   - Lista komentarzy
   - Formularz dodawania komentarza
   - Po dodaniu komentarza strona się odświeża

#### Lista użytkowników
1. Otwórz: `http://localhost:3000/users`
2. Sprawdź:
   - Wyświetlanie listy użytkowników
   - Wyszukiwanie użytkowników
   - Sortowanie (ID, username, liczba obserwowanych)
   - Paginacja

### 4. Testowanie API (Postman/curl/browser)

#### Test filtrowania i sortowania postów
```bash
# Wszystkie posty
curl http://localhost:3000/api/posts

# Filtrowanie po autorze
curl "http://localhost:3000/api/posts?userId=1"

# Wyszukiwanie
curl "http://localhost:3000/api/posts?search=JavaScript"

# Sortowanie po polubieniach
curl "http://localhost:3000/api/posts?sort=likes:desc"

# Paginacja
curl "http://localhost:3000/api/posts?page=1&limit=2"

# Kombinacja wszystkich parametrów
curl "http://localhost:3000/api/posts?page=1&limit=5&sort=likes:desc&search=dzień&userId=1"
```

#### Test filtrowania i sortowania użytkowników
```bash
# Wszyscy użytkownicy
curl http://localhost:3000/api/users

# Wyszukiwanie
curl "http://localhost:3000/api/users?search=jan"

# Sortowanie
curl "http://localhost:3000/api/users?sort=username:asc"

# Paginacja
curl "http://localhost:3000/api/users?page=1&limit=1"

# Kombinacja
curl "http://localhost:3000/api/users?page=1&limit=5&sort=following:desc&search=ania"
```

#### Test polubień (POST)
```bash
curl -X POST http://localhost:3000/api/posts/1/like \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

#### Test dodawania komentarza (POST)
```bash
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "content": "Świetny post!"}'
```

### 5. Testowanie paginacji
1. Jeśli masz mniej niż 10 postów, dodaj więcej przez API:
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "content": "Test paginacji 1"}'
```
2. Sprawdź paginację na stronie głównej - powinny pojawić się przyciski "Poprzednia"/"Następna"

### 6. Testowanie błędów
- Otwórz nieistniejącą stronę: `http://localhost:3000/nieistniejaca`
- Sprawdź czy wyświetla się strona błędu 404

## Sugerowane biblioteki (nie zaimplementowane)

### Dla skrócenia kodu i czytelności:

1. **express-validator** - walidacja danych wejściowych
   - Zamiast ręcznej walidacji w każdym route
   - Przykład: `body('email').isEmail()`

2. **helmet** - bezpieczeństwo HTTP headers
   - Automatyczna konfiguracja nagłówków bezpieczeństwa

3. **compression** - kompresja odpowiedzi
   - Automatyczna kompresja gzip dla szybszego ładowania

4. **morgan** - logowanie requestów
   - Łatwiejsze debugowanie i monitoring

5. **dotenv** - zmienne środowiskowe
   - Zarządzanie konfiguracją (PORT, DB_URL, itp.)

6. **express-rate-limit** - ograniczenie liczby requestów
   - Ochrona przed nadużyciami API

7. **joi** lub **yup** - schematy walidacji
   - Bardziej zaawansowana walidacja niż express-validator

8. **lodash** - funkcje pomocnicze
   - Uproszczenie operacji na tablicach/obiektach

## Struktura projektu po zmianach

```
social-app-backend/
├── data/              # Pliki JSON z danymi
├── middleware/       # Middleware Express
├── models/           # Modele danych
├── public/           # Statyczne pliki (CSS, JS)
│   ├── css/
│   └── js/
├── routes/           # Routing
│   ├── auth.js      # API autoryzacji
│   ├── frontend.js  # Frontend routes (nowe!)
│   ├── posts.js     # API postów (rozszerzone!)
│   └── users.js      # API użytkowników (rozszerzone!)
├── views/           # Szablony EJS (nowe!)
│   ├── partials/
│   ├── posts.ejs
│   ├── users.ejs
│   ├── post-detail.ejs
│   └── error.ejs
├── package.json
└── server.js         # Główny plik serwera
```

## Uwagi

- Frontend jest teraz całkowicie po stronie serwera (SSR)
- Wszystkie interakcje używają AJAX/fetch do komunikacji z API
- Routing działa po stronie serwera (nie SPA)
- API zwraca dane w formacie JSON z paginacją
- Frontend renderuje HTML z danymi z serwera

