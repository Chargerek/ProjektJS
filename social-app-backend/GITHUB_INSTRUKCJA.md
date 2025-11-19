# 📚 Profesjonalne dodanie projektu do GitHub

## 🎯 Jak profesjonalnie dodać projekt do GitHub - krok po kroku

---

## 📋 Przygotowanie przed pierwszym committem:

### 1. Sprawdź co masz w projekcie:

```powershell
# W folderze projektu
cd C:\Users\damia\Documents\GitHub\ProjektJS
```

### 2. Utwórz plik `.gitignore` dla każdego projektu:

#### Backend (`social-app-backend/.gitignore`):
```gitignore
# Dependencies
node_modules/
package-lock.json

# Logs
logs
*.log
npm-debug.log*

# Environment variables
.env
.env.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
*.temp
```

#### Frontend (`social-app-frontend/.gitignore`):
```gitignore
# Dependencies
node_modules/
package-lock.json

# Build output
dist/
build/

# Logs
logs
*.log
npm-debug.log*

# Environment variables
.env
.env.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
*.temp
```

### 3. Utwórz plik `README.md` dla każdego projektu:

#### Backend README (`social-app-backend/README.md`):
```markdown
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

## API Endpoints

- `GET /api/test` - Test endpoint
- `POST /api/auth/register` - Rejestracja
- `POST /api/auth/login` - Logowanie
- `GET /api/users` - Lista użytkowników
- `GET /api/users/:id` - Pojedynczy użytkownik
- `GET /api/posts` - Lista postów
- `POST /api/posts` - Utworzenie posta
- `PUT /api/posts/:id` - Aktualizacja posta
- `DELETE /api/posts/:id` - Usunięcie posta
- `POST /api/posts/:id/like` - Polubienie/odlubienie posta
- `GET /api/posts/:id/comments` - Komentarze do posta
- `POST /api/posts/:id/comments` - Dodanie komentarza
```

#### Frontend README (`social-app-frontend/README.md`):
```markdown
# Social App Frontend

Frontend aplikacji społecznościowej zbudowany w React i Vite.

## Technologie
- React 19
- Vite
- JavaScript (ES6+)

## Instalacja

```bash
npm install
```

## Uruchomienie

```bash
npm run dev
```

Aplikacja będzie dostępna na http://localhost:5173

## Build

```bash
npm run build
```

## Preview build

```bash
npm run preview
```
```

---

## 🚀 Krok po kroku - dodanie do GitHub:

### Krok 1: Zainicjuj repozytorium Git (jeśli jeszcze nie masz)

```powershell
# Przejdź do głównego folderu projektu
cd C:\Users\damia\Documents\GitHub\ProjektJS

# Sprawdź czy Git jest zainstalowany
git --version

# Jeśli nie masz jeszcze repozytorium, zainicjuj je
git init
```

### Krok 2: Stwórz strukturę committów

**Dobra praktyka**: Twórz osobne commity dla różnych zmian:

```powershell
# 1. Dodaj pliki backendu
git add social-app-backend/.gitignore
git add social-app-backend/package.json
git add social-app-backend/server.js
git add social-app-backend/routes/
git add social-app-backend/models/
git add social-app-backend/middleware/
git add social-app-backend/data/
git add social-app-backend/README.md

# Zrób commit z opisem
git commit -m "feat(backend): dodanie backendu z Express i CRUD API

- Dodano serwer Express z podstawowym routingiem
- Implementacja CRUD dla postów, użytkowników i komentarzy
- Walidacja danych przez modele
- Middleware do obsługi błędów
- Przechowywanie danych w plikach JSON"
```

```powershell
# 2. Dodaj pliki frontendu
git add social-app-frontend/.gitignore
git add social-app-frontend/package.json
git add social-app-frontend/vite.config.js
git add social-app-frontend/src/
git add social-app-frontend/index.html
git add social-app-frontend/README.md

# Zrób commit z opisem
git commit -m "feat(frontend): dodanie frontendu React + Vite

- Utworzenie projektu React z Vite
- Komponenty do wyświetlania postów i użytkowników
- Service API do komunikacji z backendem
- Responsywny interfejs użytkownika"
```

```powershell
# 3. Dodaj dokumentację
git add SETUP_INSTRUKCJA.md
git add GITHUB_INSTRUKCJA.md

git commit -m "docs: dodanie dokumentacji projektu

- Instrukcja setupu i testowania
- Instrukcja dodawania do GitHub"
```

### Krok 3: Utwórz repozytorium na GitHub

1. **Przejdź na**: https://github.com
2. **Zaloguj się** (lub utwórz konto jeśli nie masz)
3. **Kliknij**: "+" w prawym górnym rogu → "New repository"
4. **Wypełnij formularz**:
   - **Repository name**: `social-app` (lub inna nazwa)
   - **Description**: "Aplikacja społecznościowa - backend + frontend"
   - **Visibility**: Public lub Private (wybierz według preferencji)
   - **NIE ZAZNACZAJ**: "Initialize with README" (bo już masz kod)
   - **NIE DODAWAJ**: .gitignore ani license (masz już swoje)

5. **Kliknij**: "Create repository"

### Krok 4: Połącz lokalne repozytorium z GitHubem

GitHub pokaże Ci instrukcje. Wykonaj:

```powershell
# Dodaj remote (zamień YOUR_USERNAME na swoją nazwę użytkownika)
git remote add origin https://github.com/YOUR_USERNAME/social-app.git

# Albo jeśli używasz SSH:
# git remote add origin git@github.com:YOUR_USERNAME/social-app.git

# Sprawdź czy remote został dodany
git remote -v
```

### Krok 5: Push do GitHub

```powershell
# Najpierw sprawdź jakie masz branche
git branch

# Jeśli jesteś na main/master, jeśli nie, możesz zmienić nazwę:
git branch -M main

# Push do GitHub (pierwszy raz)
git push -u origin main
```

**Ważne**: Jeśli GitHub poprosi Cię o autoryzację:
- Możesz użyć **Personal Access Token** zamiast hasła
- Lub skonfiguruj SSH keys (bardziej bezpieczne)

### Krok 6: Zweryfikuj na GitHub

1. Odśwież stronę repozytorium na GitHub
2. Sprawdź czy wszystkie pliki są tam
3. Sprawdź czy commity są widoczne w "Commits"

---

## 📝 Dobre praktyki dla commitów:

### Format commitów (Conventional Commits):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Typy commitów:
- `feat`: Nowa funkcjonalność
- `fix`: Naprawa błędu
- `docs`: Zmiany w dokumentacji
- `style`: Formatowanie, brak zmian w kodzie
- `refactor`: Refaktoryzacja kodu
- `test`: Dodanie/zmiana testów
- `chore`: Zmiany w buildzie, zależnościach

### Przykłady dobrych commitów:

```powershell
git commit -m "feat(posts): dodanie możliwości edycji postów

- Endpoint PUT /api/posts/:id
- Walidacja uprawnień (tylko właściciel)
- Aktualizacja timestamps"
```

```powershell
git commit -m "fix(auth): poprawa walidacji emaila

- Dodano sprawdzanie formatu emaila
- Poprawiono komunikaty błędów"
```

```powershell
git commit -m "docs: aktualizacja README z instrukcją setupu"
```

---

## 🔄 Praca z repozytorium - codzienne użycie:

### Sprawdź status:
```powershell
git status
```

### Dodaj zmiany:
```powershell
# Dodaj konkretny plik
git add nazwa_pliku.js

# Lub wszystkie zmiany
git add .

# Lub tylko w konkretnym folderze
git add social-app-backend/
```

### Zrób commit:
```powershell
git commit -m "Krótki opis zmian"
```

### Push do GitHub:
```powershell
git push
```

### Pobierz zmiany z GitHub:
```powershell
git pull
```

---

## 🌿 Praca z branchami (opcjonalne, ale zalecane):

### Utworzenie nowego brancha:
```powershell
git checkout -b feature/dodaj-wyszukiwanie
# lub w nowszych wersjach Git:
git switch -c feature/dodaj-wyszukiwanie
```

### Przełączanie między branchami:
```powershell
git checkout main
# lub:
git switch main
```

### Merge brancha:
```powershell
# Przełącz się na main
git switch main

# Scal branch
git merge feature/dodaj-wyszukiwanie

# Usuń lokalny branch (po scaleniu)
git branch -d feature/dodaj-wyszukiwanie
```

---

## 📋 Checklist przed push:

- ✅ Czy `.gitignore` jest poprawny?
- ✅ Czy wszystkie wrażliwe dane są wyłączone (hasła, API keys)?
- ✅ Czy komentarze są czytelne?
- ✅ Czy README jest aktualny?
- ✅ Czy kod działa lokalnie?
- ✅ Czy commity mają opisowe wiadomości?

---

## 🎯 Dodatkowe rzeczy do zrobienia (opcjonalne):

### 1. Dodaj licencję:
Utwórz plik `LICENSE` (np. MIT License)

### 2. Dodaj .github/workflows (CI/CD):
Możesz dodać GitHub Actions do automatycznego testowania

### 3. Dodaj Issues templates:
Ułatw to raportowanie błędów

### 4. Dodaj Pull Request template:
Ułatw review kodu

---

## 🔐 Bezpieczeństwo:

### NIGDY nie commituj:
- ❌ Hasła
- ❌ API keys
- ❌ Secret tokens
- ❌ Pliki `.env` (dodaj do `.gitignore`)
- ❌ Dane osobowe

### Jeśli przypadkowo zcommitowałeś wrażliwe dane:
1. Usuń je z historii: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
2. Zmień wszystkie hasła/tokeny

---

## ✅ Podsumowanie:

Po wykonaniu wszystkich kroków będziesz mieć:
- ✅ Profesjonalne repozytorium na GitHub
- ✅ Czytelną historię commitów
- ✅ Dobrze zorganizowaną strukturę
- ✅ Dokumentację
- ✅ Wszystko gotowe do współpracy

**Powodzenia! 🚀**

---

## 📞 Pomoc:

Jeśli masz problemy:
- Git docs: https://git-scm.com/doc
- GitHub docs: https://docs.github.com
- Stack Overflow: https://stackoverflow.com/questions/tagged/git

