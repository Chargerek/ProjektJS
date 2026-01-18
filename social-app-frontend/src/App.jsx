import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PostList from './components/PostList';
import UserList from './components/UserList';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('posts');
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📱 Social App</h1>
        {isAuthenticated ? (
          <div className="header-actions">
            <nav className="tabs">
              <button
                className={activeTab === 'posts' ? 'active' : ''}
                onClick={() => {
                  setActiveTab('posts');
                  if (location.pathname !== '/') navigate('/');
                }}
              >
                Posty
              </button>
              <button
                className={activeTab === 'users' ? 'active' : ''}
                onClick={() => {
                  setActiveTab('users');
                  navigate('/users');
                }}
              >
                Użytkownicy
              </button>
            </nav>
            <div className="user-info">
              <span className="username">{user?.displayName || user?.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                Wyloguj
              </button>
            </div>
          </div>
        ) : (
          <nav className="tabs">
            <button onClick={() => navigate('/login')}>Zaloguj się</button>
            <button onClick={() => navigate('/register')}>Zarejestruj się</button>
          </nav>
        )}
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login onSwitchToRegister={() => navigate('/register')} />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register onSwitchToLogin={() => navigate('/login')} />
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <UserList />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <PostList />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>Social App - Projekt JS 2025</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
