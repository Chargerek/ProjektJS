# 📖 Instrukcja ustawienia i testowania projektu

## 🎯 Krok 3: Backend + Frontend - Kompletna instrukcja

---

## 📋 Co zostało zrobione:

### Backend:
1. ✅ **Modele danych** (`models/`):
   - `User.js` - walidacja rejestracji i aktualizacji użytkownika
   - `Post.js` - walidacja tworzenia i aktualizacji postów
   - `Comment.js` - walidacja tworzenia i aktualizacji komentarzy

2. ✅ **CRUD z walidacją i obsługą błędów**:
   - Pełna walidacja danych wejściowych
   - Obsługa błędów przez middleware (`middleware/errorHandler.js`)
   - Spójne komunikaty błędów
   - Walidacja uprawnień (tylko właściciel może edytować/usunąć)

3. ✅ **Rozbudowane endpointy**:
   - **Auth**: `/api/auth/register`, `/api/auth/login`
   - **Users**: GET `/api/users`, GET `/api/users/:id`, PUT `/api/users/:id`, POST `/api/users/:id/follow`
   - **Posts**: GET `/api/posts`, GET `/api/posts/:id`, POST `/api/posts`, PUT `/api/posts/:id`, DELETE `/api/posts/:id`, POST `/api/posts/:id/like`, GET/POST `/api/posts/:id/comments`

### Frontend:
1. ✅ **Projekt React + Vite** (`social-app-frontend/`)
2. ✅ **Komponenty**:
   - `PostList.jsx` - lista postów
   - `Post.jsx` - pojedynczy post z komentarzami
   - `UserList.jsx` - lista użytkowników
3. ✅ **Service API** (`services/api.js`) - komunikacja z backendem
4. ✅ **Interfejs użytkownika** - nowoczesny, responsywny design

---

## 🚀 Jak uruchomić projekt:

### 1. Backend

```powershell
# Przejdź do folderu backendu
cd social-app-backend

# Zainstaluj zależności (jeśli jeszcze nie)
npm install

# Uruchom serwer w trybie deweloperskim
npm run dev

# Albo w trybie produkcyjnym
npm start
```

Serwer będzie działał na: **http://localhost:3000**

### 2. Frontend (w nowym terminalu)

```powershell
# Przejdź do folderu frontendu
cd social-app-frontend

# Zainstaluj zależności (jeśli jeszcze nie)
npm install

# Uruchom serwer deweloperski
npm run dev
```

Frontend będzie działał na: **http://localhost:5173** (lub inny port jeśli 5173 jest zajęty)

---

## 🧪 Jak przetestować:

### Testowanie Backendu (API):

#### 1. Test podstawowy:
```powershell
# Sprawdź czy serwer działa
curl http://localhost:3000/api/test
```

Lub w przeglądarce: http://localhost:3000/api/test

#### 2. Test rejestracji użytkownika:
```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"username\": \"testuser\", \"email\": \"test@example.com\", \"password\": \"haslo123\"}"
```

#### 3. Test logowania:
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\": \"test@example.com\", \"password\": \"haslo123\"}"
```

#### 4. Test pobierania postów:
```powershell
curl http://localhost:3000/api/posts
```

#### 5. Test tworzenia posta:
```powershell
curl -X POST http://localhost:3000/api/posts `
  -H "Content-Type: application/json" `
  -d "{\"userId\": 1, \"content\": \"To jest mój pierwszy post!\"}"
```

#### 6. Test walidacji (powinien zwrócić błąd):
```powershell
curl -X POST http://localhost:3000/api/posts `
  -H "Content-Type: application/json" `
  -d "{\"userId\": 1}"
```

### Testowanie Frontendu:

1. **Otwórz przeglądarkę**: http://localhost:5173
2. **Sprawdź zakładki**:
   - "Posty" - powinny wyświetlać się posty z backendu
   - "Użytkownicy" - powinna wyświetlać się lista użytkowników
3. **Testuj funkcjonalności**:
   - Polub post (kliknij ❤️)
   - Pokaż komentarze (kliknij 💬)
   - Dodaj komentarz
   - Usuń post (jeśli jesteś właścicielem)

### Użycie Postman/Insomnia:

Możesz też użyć Postman lub Insomnia do testowania API:
- Importuj kolekcję endpointów
- Testuj każdy endpoint osobno
- Sprawdź walidację błędów

---

## 🔍 Co sprawdzić:

### Backend:
- ✅ Serwer startuje bez błędów
- ✅ Endpoint `/api/test` zwraca odpowiedź
- ✅ Rejestracja działa i waliduje dane
- ✅ Logowanie działa
- ✅ Można tworzyć, czytać, aktualizować i usuwać posty
- ✅ Walidacja działa (próba utworzenia posta bez content zwraca błąd)
- ✅ Obsługa błędów działa (404, 400, 403, 409, 500)

### Frontend:
- ✅ Aplikacja się uruchamia
- ✅ Posty się wyświetlają
- ✅ Użytkownicy się wyświetlają
- ✅ Można polubić post
- ✅ Można zobaczyć i dodać komentarze
- ✅ Interfejs jest czytelny i responsywny

---

## 📦 Struktura projektu:

```
ProjektJS/
├── social-app-backend/
│   ├── data/
│   │   ├── users.json
│   │   ├── posts.json
│   │   └── comments.json
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Comment.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── posts.js
│   ├── server.js
│   └── package.json
│
└── social-app-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── PostList.jsx
    │   │   ├── Post.jsx
    │   │   ├── UserList.jsx
    │   │   └── *.css
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 🐛 Rozwiązywanie problemów:

### Problem: Backend nie startuje
- Sprawdź czy port 3000 jest wolny
- Sprawdź czy `npm install` został wykonany
- Sprawdź czy Node.js jest zainstalowany (`node --version`)

### Problem: Frontend nie łączy się z backendem
- Sprawdź czy backend działa na http://localhost:3000
- Sprawdź czy CORS jest włączony w backendzie (powinien być w `server.js`)
- Sprawdź konsolę przeglądarki (F12) - mogą być błędy CORS

### Problem: Błędy CORS
- Upewnij się że `cors` jest zainstalowany w backendzie
- Upewnij się że `app.use(cors())` jest w `server.js`

### Problem: Dane się nie wyświetlają
- Sprawdź konsolę przeglądarki (F12) - mogą być błędy
- Sprawdź Network tab w DevTools - czy requesty do API się wykonują
- Sprawdź czy pliki JSON w folderze `data/` mają poprawne dane

---

## 📝 Następne kroki (opcjonalne):

1. Dodaj autentykację JWT
2. Dodaj hashowanie haseł (bcrypt)
3. Dodaj bazę danych (MongoDB/PostgreSQL zamiast JSON)
4. Dodaj więcej funkcjonalności (edycja komentarzy, wyszukiwanie, itp.)
5. Dodaj testy jednostkowe
6. Dodaj Docker Compose dla łatwego uruchamiania

---

## ✅ Podsumowanie:

Projekt jest gotowy do testowania! Masz:
- ✅ Backend z pełnym CRUD, walidacją i obsługą błędów
- ✅ Frontend React z komponentami do wyświetlania danych
- ✅ Komunikację między frontendem a backendem
- ✅ Profesjonalną strukturę projektu

Powodzenia! 🚀

