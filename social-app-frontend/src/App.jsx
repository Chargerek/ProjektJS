import { useState } from 'react';
import PostList from './components/PostList';
import UserList from './components/UserList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="app">
      <header className="app-header">
        <h1>📱 Social App</h1>
        <nav className="tabs">
          <button
            className={activeTab === 'posts' ? 'active' : ''}
            onClick={() => setActiveTab('posts')}
          >
            Posty
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Użytkownicy
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'posts' && <PostList />}
        {activeTab === 'users' && <UserList />}
      </main>

      <footer className="app-footer">
        <p>Social App - Projekt JS 2025</p>
      </footer>
    </div>
  );
}

export default App;
