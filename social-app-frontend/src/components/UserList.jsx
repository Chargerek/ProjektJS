import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './UserList.css';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followingStates, setFollowingStates] = useState({});
  const { user: currentUser, refreshUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (currentUser && users.length > 0) {
      const states = {};
      users.forEach(u => {
        if (u.id === currentUser.id) {
          states[u.id] = 'self';
        } else {
          const isFollowing = Array.isArray(currentUser.following) && currentUser.following.includes(u.id);
          states[u.id] = isFollowing ? 'following' : 'not-following';
        }
      });
      setFollowingStates(states);
    }
  }, [currentUser?.following, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      const usersData = Array.isArray(data) ? data : (data.data || []);
      setUsers(usersData);
      
      // Ustaw stany follow dla każdego użytkownika
      if (currentUser) {
        const states = {};
        usersData.forEach(u => {
          if (u.id === currentUser.id) {
            states[u.id] = 'self';
          } else {
            // Sprawdź czy obecny użytkownik obserwuje tego użytkownika
            // Możemy sprawdzić w danych użytkownika lub w currentUser.following
            const isFollowing = Array.isArray(currentUser.following) && currentUser.following.includes(u.id);
            states[u.id] = isFollowing ? 'following' : 'not-following';
          }
        });
        setFollowingStates(states);
      }
      
      setError(null);
    } catch (err) {
      setError(err.message || 'Nie udało się załadować użytkowników');
      console.error('Błąd ładowania użytkowników:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    if (!currentUser || userId === currentUser.id) return;
    
    const wasFollowing = followingStates[userId] === 'following';
    const newState = wasFollowing ? 'not-following' : 'following';
    
    setFollowingStates(prev => ({
      ...prev,
      [userId]: newState
    }));
    
    try {
      // Synchronizuj z serwerem w tle (bez blokowania UI)
      await usersAPI.follow(userId);
      // Odśwież dane użytkownika z serwera (w tle)
      refreshUser().catch(err => console.error('Błąd odświeżania użytkownika:', err));
    } catch (err) {
      // Jeśli wystąpił błąd, cofnij zmiany
      setFollowingStates(prev => ({
        ...prev,
        [userId]: wasFollowing ? 'following' : 'not-following'
      }));
      
      alert(err.message || 'Nie udało się wykonać akcji');
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

  const usersData = Array.isArray(users) ? users : [];

  return (
    <div className="user-list">
      <h2>Użytkownicy</h2>
      {usersData.length === 0 ? (
        <div className="no-users">Brak użytkowników</div>
      ) : (
        <div className="users-grid">
          {usersData.map(user => {
            const isSelf = currentUser && user.id === currentUser.id;
            const isFollowing = followingStates[user.id] === 'following';
            
            return (
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
                {currentUser && !isSelf && (
                  <button
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={() => handleFollow(user.id)}
                  >
                    {isFollowing ? 'Odobserwuj' : 'Obserwuj'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UserList;

