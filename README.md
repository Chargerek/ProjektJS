# Aplikacja społecznościowa
Aplikacja społecznościowa uproszczona wersja Facebooka/Twittera - pozwala na dodawanie postów w tym zdjęć, obserwowanie innych użytkowników, polubienia, komentarze. 
Aplikacja powiadamia użytkownika jeśli ktoś skomentowal lub polubił jego post za pomocą małych powiadomień w prawym  dolnym rogu, powiadomienia zostają dodane do zakładki powiadomienia, 
w obu przypadkach użytkownik może kliknać na powiadomienie i zostanie przekierowany do danego posta/komentarza, dodatkowa opcja zmiany motywu dla komfortu.
Panel admina do zarządzania postami i użytkownikami.

## Podział pracy:
* Krok 2 - Damian Zdrodowski - Stworzenie początkowej struktury, backendu i frontendu
* Krok 3 - Mateusz Rzodkiewicz - Rozbudowa backendu
* Krok 4 - Kacper Zajkowski - Łączenie frontendu z API
* Krok 5 - Kacper Zajkowski - Rejestracja, logowanie, uwierzytelnianie, autoryzacja
* Krok 6 - Mateusz Rzodkiewicz - Połączenie z bazą danych  
* Krok 7 - Damian Zdrodowski - Poprawki końcowe / Finalizacja projektu


## Struktura projektu + krótki opis zawartości

```Backend + Frontend
social-app-backend/
├── uploads/                     # Pliki graficzne użytkowników
│
├── routes/                      # Endpointy API
│   ├── auth.js                   # Logowanie i rejestracja
│   ├── posts.js                  # Posty, zdjęcia, komentarze, lajki
│   ├── users.js                  # Profile, obserwowanie, lista użytkowników
│   └── notifications.js          # Logika powiadomień
│
├── models/                      # Modele danych + walidacja
│   ├── User.js                   # Walidacja danych użytkownika
│   └── Post.js                   # Walidacja postów i komentarzy
│
├── middleware/                  # Middleware aplikacji
│   └── auth.js                   # JWT + uprawnienia administratora
│
├── database.js                  # Konfiguracja SQLite + schemat tabel
├── index.js                     # Główny punkt wejścia serwera
├── social.db                    # Plik bazy danych SQLite
└── package.json                 # Zależności backendu
 

social-app-frontend/
├── src/
│   ├── components/              # Reużywalne komponenty UI
│   │   ├── Post.vue
│   │   ├── Post.css
│   │   └── UserList.css
│   │
│   ├── views/                   # Widoki (strony aplikacji)
│   │   ├── Home.vue
│   │   ├── PostList.vue          # Główny feed (infinite scroll)
│   │   ├── Profile.vue           # Profil użytkownika + edycja i kadrowanie
│   │   ├── UserList.vue          # Wyszukiwarka użytkowników
│   │   ├── Notifications.vue     # Lista powiadomień
│   │   └── PostDetails.vue       # Szczegóły posta
│   │
│   ├── stores/                  # Zarządzanie stanem (Pinia)
│   │   ├── auth.js               # Sesja użytkownika
│   │   ├── theme.js              # Motywy kolorystyczne
│   │   └── toast.js              # System powiadomień UI
│   │
│   ├── services/                # Warstwa komunikacji z API
│   │   └── api.js                # Centralna konfiguracja fetch
│   │
│   ├── router/                  # Routing aplikacji
│   │   └── index.js              # Konfiguracja tras
│   │
│   ├── App.vue                  # Główny szablon aplikacji
│   └── main.js                  # Inicjalizacja Vue
│
├── index.html                   # Główny plik HTML
└── package.json                 # Zależności frontendu

```
## Jak uruchomić aplikacje:
Po pobraniu projektu włączaamy 2 terminale
* W pierwszym terminalu przechodzimy do folderu social-app-backend i uzywamy następujących komend: "npm install" następnie "npm run dev"
* W drugim terminalu przechodzimy do folderu social-app-frontend i uzywamy następujących komend: "npm install" następnie "npm run dev"
* Przechodzimy do przeglądarki i wklejamy ten adres: http://localhost:5173/
