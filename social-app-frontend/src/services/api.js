/**
 * Serwis do komunikacji z API backendu
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Uniwersalna funkcja do wykonywania requestów
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Wystąpił błąd');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Posts API
export const postsAPI = {
  getAll: () => request('/posts'),
  getById: (id) => request(`/posts/${id}`),
  create: (postData) => request('/posts', { method: 'POST', body: postData }),
  update: (id, postData) => request(`/posts/${id}`, { method: 'PUT', body: postData }),
  delete: (id, userId) => request(`/posts/${id}`, { method: 'DELETE', body: { userId } }),
  like: (id, userId) => request(`/posts/${id}/like`, { method: 'POST', body: { userId } }),
  getComments: (id) => request(`/posts/${id}/comments`),
  addComment: (id, commentData) => request(`/posts/${id}/comments`, { method: 'POST', body: commentData }),
};

// Users API
export const usersAPI = {
  getAll: () => request('/users'),
  getById: (id) => request(`/users/${id}`),
  update: (id, userData) => request(`/users/${id}`, { method: 'PUT', body: userData }),
  follow: (id, userId) => request(`/users/${id}/follow`, { method: 'POST', body: { userId } }),
};

// Auth API
export const authAPI = {
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
};

