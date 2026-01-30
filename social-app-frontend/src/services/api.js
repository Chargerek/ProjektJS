/**
 * Serwis do komunikacji z API backendu
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Pobierz token z localStorage
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Uniwersalna funkcja do wykonywania requestów
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  // Najpierw przygotuj bazowe nagłówki
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !isFormData) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Jeśli token jest nieprawidłowy, usuń go
      if (response.status === 401 && token) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
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
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    const queryString = queryParams.toString();
    return request(`/posts${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => request(`/posts/${id}`),
  create: (postData) => request('/posts', { method: 'POST', body: postData }),
  update: (id, postData) => request(`/posts/${id}`, { method: 'PUT', body: postData }),
  delete: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  like: (id) => request(`/posts/${id}/like`, { method: 'POST' }),
  getComments: (id) => request(`/posts/${id}/comments`),
  addComment: (id, commentData) => request(`/posts/${id}/comments`, { method: 'POST', body: commentData }),
  updateComment: (postId, commentId, commentData) => request(`/posts/${postId}/comments/${commentId}`, { method: 'PUT', body: commentData }),
  deleteComment: (postId, commentId) => request(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),
  upload: (formData) => request('/posts/upload', {
    method: 'POST',
    body: formData,
    headers: {}
  }),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    const queryString = queryParams.toString();
    return request(`/users${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => request(`/users/${id}`),
  update: (id, userData) => request(`/users/${id}`, { method: 'PUT', body: userData }),
  follow: (id) => request(`/users/${id}/follow`, { method: 'POST' }),
  getActivity: (id) => request(`/users/${id}/activity`),
  adminDelete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  adminPromote: (id) => request(`/users/${id}/promote`, { method: 'POST' }),
  upload: (formData) => request('/users/upload', {
    method: 'POST',
    body: formData,
    headers: {}
  }),
};

// Auth API
export const authAPI = {
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  getMe: () => request('/auth/me'),
};

export { request };

