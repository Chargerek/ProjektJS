import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import './UserList.css';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Nie udało się załadować użytkowników');
      console.error('Błąd ładowania użytkowników:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Ładowanie użytkowników...</div>;
  }

  if (error) {
    return <div className="error">Błąd: {error}</div>;
  }

  if (users.length === 0) {
    return <div className="no-users">Brak użytkowników</div>;
  }

  return (
    <div className="user-list">
      <h2>Użytkownicy</h2>
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">
              {(user.displayName || user.username || 'U')[0].toUpperCase()}
            </div>
            <div className="user-info">
              <h3>{user.displayName || user.username}</h3>
              <p className="username">@{user.username}</p>
              {user.following && (
                <p className="following">Obserwuje: {user.following.length}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;

