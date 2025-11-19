import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import './Post.css';

function Post({ post, user, onLike, onDelete }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentUsers, setCommentUsers] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);

  // Mock userId - w prawdziwej aplikacji pobierasz z kontekstu/loginu
  const currentUserId = 1;

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, post.id]);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const commentsData = await postsAPI.getComments(post.id);
      setComments(Array.isArray(commentsData) ? commentsData : []);

      // Załaduj użytkowników dla komentarzy
      const userIds = [...new Set(commentsData.map(c => c.userId))];
      const { usersAPI } = await import('../services/api');
      const usersData = await usersAPI.getAll();
      const usersMap = {};
      if (Array.isArray(usersData)) {
        usersData.forEach(u => {
          if (userIds.includes(u.id)) {
            usersMap[u.id] = u;
          }
        });
      }
      setCommentUsers(usersMap);
    } catch (err) {
      console.error('Błąd ładowania komentarzy:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await postsAPI.addComment(post.id, {
        userId: currentUserId,
        content: newComment.trim(),
      });
      setNewComment('');
      loadComments(); // Odśwież komentarze
    } catch (err) {
      alert(err.message || 'Nie udało się dodać komentarza');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isLiked = post.likes && post.likes.includes(currentUserId);
  const canDelete = post.userId === currentUserId;

  return (
    <div className="post">
      <div className="post-header">
        <div className="post-author">
          <span className="author-name">
            {user ? (user.displayName || user.username) : `Użytkownik #${post.userId}`}
          </span>
          <span className="post-date">{formatDate(post.createdAt)}</span>
        </div>
        {canDelete && (
          <button
            className="delete-btn"
            onClick={() => onDelete(post.id, currentUserId)}
            title="Usuń post"
          >
            ×
          </button>
        )}
      </div>

      <div className="post-content">{post.content}</div>

      <div className="post-actions">
        <button
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onLike(post.id, currentUserId)}
        >
          ❤️ {post.likes?.length || 0}
        </button>
        <button
          className="comments-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {comments.length} {comments.length === 1 ? 'komentarz' : 'komentarzy'}
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {loadingComments ? (
            <div className="loading-comments">Ładowanie komentarzy...</div>
          ) : (
            <>
              {comments.length > 0 && (
                <div className="comments-list">
                  {comments.map(comment => (
                    <div key={comment.id} className="comment">
                      <strong>
                        {commentUsers[comment.userId]
                          ? commentUsers[comment.userId].displayName || commentUsers[comment.userId].username
                          : `Użytkownik #${comment.userId}`}
                      </strong>
                      <p>{comment.content}</p>
                      <small>{formatDate(comment.createdAt)}</small>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddComment} className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Dodaj komentarz..."
                  rows="2"
                />
                <button type="submit" disabled={!newComment.trim()}>
                  Wyślij
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Post;

