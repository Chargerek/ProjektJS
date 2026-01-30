// database.js - moduł do obsługi SQLite
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'social_app.db');


const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Połączenie z bazą danych
const db = new Database(DB_PATH);


db.pragma('foreign_keys = ON');


function initDatabase() {
  // Tabela użytkowników
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      displayName TEXT,
      bio TEXT,
      avatar TEXT,
      avatarPosition INTEGER DEFAULT 50,
      isAdmin INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migracja: dodaj kolumnę avatarPosition jeśli nie istnieje
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasAvatarPosition = tableInfo.some(column => column.name === 'avatarPosition');
    if (!hasAvatarPosition) {
      db.exec("ALTER TABLE users ADD COLUMN avatarPosition INTEGER DEFAULT 50");
      console.log("✅ Dodano kolumnę avatarPosition do tabeli users");
    }
  } catch (err) {
    console.error("Błąd migracji tabeli users:", err);
  }

  // Tabela powiadomień
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      actorId INTEGER NOT NULL,
      type TEXT NOT NULL,
      postId INTEGER,
      isRead INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);

  // Tabela postów
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      content TEXT NOT NULL,
      imageUrl TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Migracja: dodaj kolumnę imageUrl jeśli nie istnieje
  try {
    const tableInfo = db.prepare("PRAGMA table_info(posts)").all();
    const hasImageUrl = tableInfo.some(column => column.name === 'imageUrl');
    if (!hasImageUrl) {
      db.exec("ALTER TABLE posts ADD COLUMN imageUrl TEXT");
      console.log("✅ Dodano kolumnę imageUrl do tabeli posts");
    }
  } catch (err) {
    console.error("Błąd migracji tabeli posts:", err);
  }

  // Tabela komentarzy
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT,
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tabela polubień postów
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_likes (
      postId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      PRIMARY KEY (postId, userId),
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tabela obserwacji użytkowników
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_following (
      followerId INTEGER NOT NULL,
      followingId INTEGER NOT NULL,
      PRIMARY KEY (followerId, followingId),
      FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (followingId) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (followerId != followingId)
    )
  `);

  // Indeksy dla lepszej wydajności
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_posts_userId ON posts(userId);
    CREATE INDEX IF NOT EXISTS idx_posts_createdAt ON posts(createdAt);
    CREATE INDEX IF NOT EXISTS idx_comments_postId ON comments(postId);
    CREATE INDEX IF NOT EXISTS idx_comments_userId ON comments(userId);
    CREATE INDEX IF NOT EXISTS idx_post_likes_postId ON post_likes(postId);
    CREATE INDEX IF NOT EXISTS idx_post_likes_userId ON post_likes(userId);
    CREATE INDEX IF NOT EXISTS idx_user_following_followerId ON user_following(followerId);
    CREATE INDEX IF NOT EXISTS idx_user_following_followingId ON user_following(followingId);
    CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
  `);

  // Specjalne konto Admina dla użytkownika
  const adminEmail = 'admin@social.pl';
  const adminUsername = 'admin';
  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);

  if (!existingAdmin) {
    const hashedPassword = '$2b$10$c6T6oaiddycCZyFGUMvkh.3a8ThMa5sAuxdQ7FVmzIWVng5Kbr3gW'; // admin123
    db.prepare(`
      INSERT INTO users (username, email, password, displayName, isAdmin, createdAt)
      VALUES (?, ?, ?, ?, 1, ?)
    `).run(adminUsername, adminEmail, hashedPassword, 'Administrator', new Date().toISOString());
    console.log('✅ Utworzono konto administratora: admin@social.pl (hasło: admin123)');
  }

  console.log(' Baza danych zainicjalizowana');
}

// Funkcja do migracji danych z JSON do SQLite
function migrateDataFromJSON() {
  const dataDir = path.join(__dirname, 'data');

  try {
    // Sprawdź czy są dane w JSON
    const usersPath = path.join(dataDir, 'users.json');
    const postsPath = path.join(dataDir, 'posts.json');
    const commentsPath = path.join(dataDir, 'comments.json');

    if (!fs.existsSync(usersPath)) {
      console.log(' Brak plików JSON do migracji');
      return;
    }

    // Sprawdź czy już są dane w bazie
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount.count > 0) {
      console.log(' Dane już są w bazie, pomijam migrację');
      return;
    }

    console.log(' Migracja danych z JSON do SQLite...');

    // Migracja użytkowników
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, email, password, displayName, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertFollowing = db.prepare(`
      INSERT INTO user_following (followerId, followingId)
      VALUES (?, ?)
    `);

    const userTransaction = db.transaction((users) => {
      for (const user of users) {
        insertUser.run(
          user.id,
          user.username,
          user.email,
          user.password,
          user.displayName || null,
          user.createdAt || new Date().toISOString()
        );

        // Dodaj obserwacje
        if (Array.isArray(user.following)) {
          for (const followingId of user.following) {
            try {
              insertFollowing.run(user.id, followingId);
            } catch (err) {
              // Ignoruj duplikaty
            }
          }
        }
      }
    });

    userTransaction(users);
    console.log(` Zmigrowano ${users.length} użytkowników`);

    // Migracja postów
    if (fs.existsSync(postsPath)) {
      const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
      const insertPost = db.prepare(`
        INSERT INTO posts (id, userId, content, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
      `);

      const insertLike = db.prepare(`
        INSERT INTO post_likes (postId, userId)
        VALUES (?, ?)
      `);

      const postTransaction = db.transaction((posts) => {
        for (const post of posts) {
          insertPost.run(
            post.id,
            post.userId,
            post.content,
            post.createdAt || new Date().toISOString(),
            post.updatedAt || null
          );

          // Dodaj polubienia
          if (Array.isArray(post.likes)) {
            for (const userId of post.likes) {
              try {
                insertLike.run(post.id, userId);
              } catch (err) {
                // Ignoruj duplikaty
              }
            }
          }
        }
      });

      postTransaction(posts);
      console.log(` Zmigrowano ${posts.length} postów`);
    }

    // Migracja komentarzy
    if (fs.existsSync(commentsPath)) {
      const comments = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));
      const insertComment = db.prepare(`
        INSERT INTO comments (id, postId, userId, content, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const commentTransaction = db.transaction((comments) => {
        for (const comment of comments) {
          insertComment.run(
            comment.id,
            comment.postId,
            comment.userId,
            comment.content,
            comment.createdAt || new Date().toISOString(),
            comment.updatedAt || null
          );
        }
      });

      commentTransaction(comments);
      console.log(` Zmigrowano ${comments.length} komentarzy`);
    }

    console.log(' Migracja zakończona pomyślnie');
  } catch (err) {
    console.error(' Błąd podczas migracji:', err);
  }
}

// Inicjalizuj bazę przy starcie
initDatabase();
migrateDataFromJSON();

module.exports = db;
