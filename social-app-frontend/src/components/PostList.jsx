import { useState, useEffect } from 'react';
import Post from './Post';
import { postsAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './PostList.css';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({}); // Cache użytkowników
  const [newPostContent, setNewPostContent] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
    loadUsers();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getAll();
      // API może zwracać obiekt z paginacją lub tablicę
      const postsData = Array.isArray(data) ? data : (data.data || []);
      setPosts(postsData);
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

  const handleLike = async (postId) => {
    try {
      await postsAPI.like(postId);
      // Odśwież listę postów po polubieniu
      loadPosts();
    } catch (err) {
      alert(err.message || 'Nie udało się polubić posta');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten post?')) {
      return;
    }
    try {
      await postsAPI.delete(postId);
      loadPosts();
    } catch (err) {
      alert(err.message || 'Nie udało się usunąć posta');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || creatingPost) return;

    try {
      setCreatingPost(true);
      await postsAPI.create({ content: newPostContent.trim() });
      setNewPostContent('');
      loadPosts();
    } catch (err) {
      alert(err.message || 'Nie udało się utworzyć posta');
    } finally {
      setCreatingPost(false);
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

  const postsData = Array.isArray(posts) ? posts : [];

  return (
    <div className="post-list">
      <h2>Posty</h2>
      
      {user && (
        <form onSubmit={handleCreatePost} className="create-post-form">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Co myślisz?"
            rows="3"
            disabled={creatingPost}
          />
          <button type="submit" disabled={!newPostContent.trim() || creatingPost}>
            {creatingPost ? 'Publikowanie...' : 'Opublikuj'}
          </button>
        </form>
      )}

      {postsData.length === 0 ? (
        <div className="no-posts">Brak postów do wyświetlenia</div>
      ) : (
        postsData.map(post => (
          <Post
            key={post.id}
            post={post}
            user={users[post.userId]}
            onLike={handleLike}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
}

export default PostList;

