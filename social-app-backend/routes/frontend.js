// routes/frontend.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

function readData(filename) {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Błąd odczytu pliku ${filename}:`, err);
    return [];
  }
}

// Strona główna - lista postów
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'createdAt:desc';
    const search = req.query.search || '';
    const userId = req.query.userId || '';
    
    // Pobierz dane z API (lub bezpośrednio)
    let posts = readData('posts.json');
    const users = readData('users.json');
    
    // Filtrowanie
    if (userId) {
      posts = posts.filter(p => p.userId === parseInt(userId));
    }
    if (search) {
      posts = posts.filter(p => 
        p.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sortowanie
    const [sortField, sortOrder] = sort.split(':');
    const order = sortOrder === 'asc' ? 1 : -1;
    posts.sort((a, b) => {
      let aVal, bVal;
      if (sortField === 'createdAt') {
        aVal = new Date(a.createdAt || 0);
        bVal = new Date(b.createdAt || 0);
      } else if (sortField === 'likes') {
        aVal = a.likes?.length || 0;
        bVal = b.likes?.length || 0;
      } else {
        aVal = a[sortField] || '';
        bVal = b[sortField] || '';
      }
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
    
    // Paginacja
    const total = posts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedPosts = posts.slice(startIndex, startIndex + limit);
    
    // Mapuj użytkowników
    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = { ...u };
      delete usersMap[u.id].password;
    });
    
    res.render('posts', {
      posts: paginatedPosts,
      users: usersMap,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        sort,
        search,
        userId
      },
      allUsers: users.map(u => ({ id: u.id, username: u.username, displayName: u.displayName })),
      activeTab: 'posts'
    });
  } catch (err) {
    next(err);
  }
});

// Strona użytkowników
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'id:asc';
    const search = req.query.search || '';
    
    let users = readData('users.json');
    
    // Filtrowanie
    if (search) {
      users = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Sortowanie
    const [sortField, sortOrder] = sort.split(':');
    const order = sortOrder === 'asc' ? 1 : -1;
    users.sort((a, b) => {
      let aVal, bVal;
      if (sortField === 'following') {
        aVal = a.following?.length || 0;
        bVal = b.following?.length || 0;
      } else if (sortField === 'username' || sortField === 'displayName') {
        aVal = (a[sortField] || '').toLowerCase();
        bVal = (b[sortField] || '').toLowerCase();
      } else {
        aVal = a[sortField] || 0;
        bVal = b[sortField] || 0;
      }
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
    
    // Paginacja
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedUsers = users.slice(startIndex, startIndex + limit);
    
    // Usuń hasła
    const sanitizedUsers = paginatedUsers.map(({ password, ...user }) => user);
    
    res.render('users', {
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        sort,
        search
      },
      activeTab: 'users'
    });
  } catch (err) {
    next(err);
  }
});

// Pojedynczy post
router.get('/posts/:id', async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const posts = readData('posts.json');
    const users = readData('users.json');
    const comments = readData('comments.json');
    
    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).render('error', { 
        message: 'Post nie został znaleziony',
        error: { status: 404 }
      });
    }
    
    const postComments = comments
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    const usersMap = {};
    users.forEach(u => {
      usersMap[u.id] = { ...u };
      delete usersMap[u.id].password;
    });
    
    res.render('post-detail', {
      post,
      user: usersMap[post.userId],
      comments: postComments,
      commentUsers: usersMap
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

