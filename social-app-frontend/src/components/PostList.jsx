import { useState, useEffect } from 'react';
import Post from './Post';
import { postsAPI, usersAPI } from '../services/api';
import './PostList.css';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({}); // Cache użytkowników

  useEffect(() => {
    loadPosts();
    loadUsers();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getAll();
      setPosts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Nie udało się załadować postów');
      console.error('Błąd ładowania postów:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await usersAPI.getAll();
      const usersMap = {};
      usersData.forEach(user => {
        usersMap[user.id] = user;
      });
      setUsers(usersMap);
    } catch (err) {
      console.error('Błąd ładowania użytkowników:', err);
    }
  };

  const handleLike = async (postId, userId) => {
    try {
      await postsAPI.like(postId, userId);
      // Odśwież listę postów po polubieniu
      loadPosts();
    } catch (err) {
      alert(err.message || 'Nie udało się polubić posta');
    }
  };

  const handleDelete = async (postId, userId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten post?')) {
      return;
    }
    try {
      await postsAPI.delete(postId, userId);
      loadPosts();
    } catch (err) {
      alert(err.message || 'Nie udało się usunąć posta');
    }
  };

  if (loading) {
    return <div className="loading">Ładowanie postów...</div>;
  }

  if (error) {
    return <div className="error">Błąd: {error}</div>;
  }

  if (posts.length === 0) {
    return <div className="no-posts">Brak postów do wyświetlenia</div>;
  }

  return (
    <div className="post-list">
      <h2>Posty</h2>
      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
          user={users[post.userId]}
          onLike={handleLike}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default PostList;

