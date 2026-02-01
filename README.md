# Aplikacja społecznościowa
Aplikacja społecznościowa uproszczona wersja Facebooka/Twittera - pozwala na dodawanie postów w tym zdjęć, obserwowanie innych użytkowników, polubienia, komentarze. 
Aplikacja powiadamia użytkownika jeśli ktoś skomentowal lub polubił jego post za pomocą małych powiadomień w prawym  dolnym rogu, powiadomienia zostają dodane do zakładki powiadomienia, 
w obu przypadkach użytkownik może kliknać na powiadomienie i zostanie przekierowany do danego posta/komentarza, dodatkowa opcja zmiany motywu dla komfortu.
Panel admina do zarządzania postami i użytkownikami.

## Podział pracy:
* Krok 2 - Damian Zdrodowski - Stworzenie początkowej struktury, backendu i frontendu
* Krok 3 - Mateusz Rzodkiewicz - Rozbudowa backendu
* Krok 4 - Kacper Zajkowski - Łączenie frontendu z API
* Krok 5 - Kacper Zajkowski - Uwierzytelnianie, autoryzacja
* Krok 6 - Mateusz Rzodkiewicz - Połączenie z bazą danych  
* Krok 7 - Damian Zdrodowski - Poprawki końcowe / Finalizacja projektu


## Struktura projektu + krótki opis zawartości

```Backend + Frontend
social-app-backend/
├── uploads/                         # Pliki graficzne użytkowników
│
├── routes/                          # Endpointy API
│   ├── auth.js                       # Logowanie i rejestracja
│   ├── posts.js                      # Posty, zdjęcia, komentarze, lajki
│   ├── users.js                      # Profile, obserwowanie, lista użytkowników
│   ├── notifications.js              # Logika powiadomień
│   └── frontend.js                   # Obsługa tras frontendu
│
├── models/                          # Modele danych + walidacja
│   ├── User.js                       # Dane użytkownika
│   ├── Post.js                       # Posty
│   └── Comment.js                    # Komentarze
│
├── middleware/                      # Middleware aplikacji
│   ├── auth.js                       # JWT (autoryzacja)
│   ├── admin.js                      # Uprawnienia administratora
│   ├── upload.js                     # Upload plików (np. Multer)
│   └── errorHandler.js               # Globalna obsługa błędów
│
├── data/                            # Pliki bazy danych
│   └── social_app.db                 # Baza danych SQLite
│
├── database.js                      # Konfiguracja SQLite + schemat tabel
├── server.js                        # Główny punkt wejścia serwera
├── package.json                     # Zależności backendu
└── README.md                        # Dokumentacja backendu
 

social-app-frontend/
├── src/
│   ├── components/                  # Reużywalne komponenty UI
│   ├── ├── Post.vue
│   │   ├── Toast.vue                 # Komunikaty UI
│   │   ├── Login.css
│   │   ├── Register.css
│   │   └── PostList.css
│   │
│   ├── views/                       # Widoki aplikacji
│   │   ├── PostList.vue              # Główny feed (infinite scroll)
│   │   ├── Profile.vue               # Profil użytkownika
│   │   ├── UserList.vue              # Wyszukiwarka użytkowników
│   │   ├── Notifications.vue         # Powiadomienia
│   │   ├── PostDetails.vue           # Szczegóły posta
│   │   ├── Login.vue                 # Logowanie
│   │   ├── Register.vue              # Rejestracja
│   │   └── AdminPanel.vue            # Panel administratora
│   │
│   ├── stores/                      # Pinia – stan aplikacji
│   │   ├── auth.js                   # Sesja użytkownika
│   │   ├── theme.js                  # Motywy kolorystyczne
│   │   └── toast.js                  # Powiadomienia UI
│   │
│   ├── services/                    # Komunikacja z API
│   │   └── api.js                    # Centralna konfiguracja fetch
│   │
│   ├── router/                      # Routing
│   │   └── index.js                  # Definicja tras
│   │
│   ├── App.vue                      # Główny layout aplikacji
│   └── main.js                      # Inicjalizacja Vue
│
├── index.html                       # Główny plik HTML
├── vite.config.js                   # Konfiguracja Vite
├── eslint.config.js                 # Konfiguracja ESLint
├── package.json                     # Zależności frontendu
└── README.md                        # Dokumentacja frontendu


```
## Jak uruchomić aplikacje:
Po pobraniu projektu włączamy 2 terminale
* W pierwszym terminalu przechodzimy do folderu social-app-backend i uzywamy następujących komend: "npm install" następnie "npm run dev"
* W drugim terminalu przechodzimy do folderu social-app-frontend i uzywamy następujących komend: "npm install" następnie "npm run dev"
* Przechodzimy do przeglądarki i wklejamy ten adres: http://localhost:5173/
