// app.js - Interakcja użytkownika z frontendem

const API_BASE_URL = '/api';

// Funkcja pomocnicza do wykonywania requestów
async function apiRequest(endpoint, options = {}) {
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

// Obsługa polubień postów
document.addEventListener('DOMContentLoaded', () => {
    // Obsługa przycisków like
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const postId = btn.getAttribute('data-post-id');
            const userId = btn.getAttribute('data-user-id') || '1'; // Mock user ID
            
            if (!postId) return;

            try {
                const result = await apiRequest(`/posts/${postId}/like`, {
                    method: 'POST',
                    body: { userId: parseInt(userId) }
                });

                // Aktualizuj licznik polubień
                const likeCount = btn.querySelector('.like-count');
                if (likeCount) {
                    likeCount.textContent = result.post.likes.length;
                }

                // Zmień wygląd przycisku
                if (result.liked) {
                    btn.classList.add('liked');
                } else {
                    btn.classList.remove('liked');
                }

                // Jeśli jesteśmy na stronie szczegółów posta, odśwież stronę
                if (window.location.pathname.includes('/posts/')) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            } catch (error) {
                alert('Nie udało się polubić posta: ' + error.message);
            }
        });
    });

    // Obsługa formularza komentarzy
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const postId = form.getAttribute('data-post-id');
            const userId = '1'; // Mock user ID
            const content = form.querySelector('textarea[name="content"]').value.trim();

            if (!content) return;

            try {
                await apiRequest(`/posts/${postId}/comments`, {
                    method: 'POST',
                    body: {
                        userId: parseInt(userId),
                        content: content
                    }
                });

                // Wyczyść formularz i odśwież stronę
                form.querySelector('textarea[name="content"]').value = '';
                window.location.reload();
            } catch (error) {
                alert('Nie udało się dodać komentarza: ' + error.message);
            }
        });
    });

    // Płynne przewijanie do góry przy zmianie strony
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Funkcja do wyświetlania komunikatów
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Dodaj style animacji
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

