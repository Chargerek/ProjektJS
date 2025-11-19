# Social App Backend

Backend API dla aplikacji społecznościowej.

## Technologie
- Node.js
- Express
- JSON (tymczasowa baza danych)

## Instalacja

```bash
npm install
```

## Uruchomienie

```bash
# Tryb deweloperski
npm run dev

# Tryb produkcyjny
npm start
```

Serwer będzie działał na: **http://localhost:3000**

## API Endpoints

### Auth
- `POST /api/auth/register` - Rejestracja użytkownika
- `POST /api/auth/login` - Logowanie

### Users
- `GET /api/users` - Lista użytkowników
- `GET /api/users/:id` - Pojedynczy użytkownik
- `PUT /api/users/:id` - Aktualizacja profilu
- `POST /api/users/:id/follow` - Obserwowanie/odobserwowanie użytkownika

### Posts
- `GET /api/posts` - Lista postów
- `GET /api/posts/:id` - Pojedynczy post
- `POST /api/posts` - Utworzenie posta
- `PUT /api/posts/:id` - Aktualizacja posta
- `DELETE /api/posts/:id` - Usunięcie posta
- `POST /api/posts/:id/like` - Polubienie/odlubienie posta
- `GET /api/posts/:id/comments` - Komentarze do posta
- `POST /api/posts/:id/comments` - Dodanie komentarza

### Test
- `GET /api/test` - Test endpoint

## Struktura projektu

```
social-app-backend/
├── data/              # Pliki JSON (tymczasowa baza danych)
├── models/            # Modele danych z walidacją
├── middleware/        # Middleware (obsługa błędów)
├── routes/            # Routing
├── server.js          # Główny plik serwera
└── package.json
```

