<template>
  <div class="post">
    <div class="post-header">
      <div class="post-author">
        <router-link :to="'/profile/' + post.userId" class="author-avatar-link">
          <div class="author-avatar-small">
            <img v-if="user?.avatar" 
                 :src="'http://localhost:3000' + user.avatar" 
                 :style="{ objectPosition: `${user.avatarPosition || 50}% center` }"
                 :alt="user.username" />
            <span v-else>{{ (user?.displayName || user?.username || 'U')[0].toUpperCase() }}</span>
          </div>
        </router-link>
        <div class="author-info">
          <router-link :to="'/profile/' + post.userId" class="author-name">
            {{ user ? (user.displayName || user.username) : `Użytkownik #${post.userId}` }}
          </router-link>
          <span class="post-date">{{ formatDate(post.createdAt) }}</span>
        </div>
        <button v-if="currentUserId && !isOwnPost" 
                @click="handleFollow" 
                :class="['post-follow-btn', { 'is-following': isFollowing }]">
          {{ isFollowing ? 'Odobserwuj' : 'Obserwuj' }}
        </button>
      </div>
      <div class="post-header-actions">
        <button
          v-if="canEdit && !isEditingPost"
          @click="isEditingPost = true"
          class="edit-btn"
          title="Edytuj post"
        >
          ✏️
        </button>
        <button
          v-if="canDelete"
          @click="$emit('delete', post.id)"
          class="delete-btn"
          title="Usuń post"
        >
          ×
        </button>
      </div>
    </div>

    <div v-if="isEditingPost" class="edit-post-section">
      <textarea
        v-model="editedPostContent"
        class="edit-post-textarea"
        rows="4"
      />
      <div class="edit-post-actions">
        <button @click="handleEditPost" class="save-btn">Zapisz</button>
        <button @click="cancelEditPost" class="cancel-btn">Anuluj</button>
      </div>
    </div>
    <div v-else class="post-content">
      {{ post.content }}
      <div v-if="post.imageUrl" class="post-image-container">
        <img :src="'http://localhost:3000' + post.imageUrl" alt="Post image" class="post-image" />
      </div>
    </div>

    <div class="post-actions">
      <button
        :class="['like-btn', { liked: isLiked }]"
        @click="currentUserId && handleLike()"
        :disabled="!currentUserId"
      >
        ❤️ {{ post.likes?.length || 0 }}
      </button>
      <button
        class="comments-btn"
        @click="showComments = !showComments"
      >
        💬 {{ commentCount }} {{ commentCount === 1 ? 'komentarz' : 'komentarzy' }}
      </button>
    </div>

    <div v-if="showComments" class="comments-section">
      <div v-if="loadingComments" class="loading-comments">Ładowanie komentarzy...</div>
      <template v-else>
        <div v-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment">
            <div class="comment-header">
              <strong>
                {{ commentUsers[comment.userId]
                  ? (commentUsers[comment.userId].displayName || commentUsers[comment.userId].username)
                  : `Użytkownik #${comment.userId}` }}
              </strong>
              <button
                v-if="canEditComment(comment) && editingCommentId !== comment.id"
                @click="startEditingComment(comment)"
                class="edit-comment-btn"
                title="Edytuj komentarz"
              >
                ✏️
              </button>
            </div>
            <div v-if="editingCommentId === comment.id" class="edit-comment-section">
              <textarea
                v-model="editedCommentContent"
                class="edit-comment-textarea"
                rows="2"
              />
              <div class="edit-comment-actions">
                <button @click="handleEditComment(comment.id)" class="save-btn">Zapisz</button>
                <button @click="cancelEditingComment" class="cancel-btn">Anuluj</button>
              </div>
            </div>
            <p v-else>{{ comment.content }}</p>
            <small>{{ formatDate(comment.createdAt) }}</small>
            <div v-show="!editingCommentId || editingCommentId !== comment.id" class="comment-actions">
                <button v-if="canEditComment(comment)" @click="startEditingComment(comment)" class="edit-btn">Edytuj</button>
                <button v-if="canDeleteComment(comment)" @click="handleDeleteComment(comment.id)" class="delete-btn">Usuń</button>
              </div>
          </div>
        </div>

        <form v-if="currentUserId" @submit.prevent="handleAddComment" class="comment-form">
          <textarea
            v-model="newComment"
            placeholder="Dodaj komentarz..."
            rows="2"
          />
          <button type="submit" :disabled="!newComment.trim()">Wyślij</button>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { postsAPI, usersAPI } from '../services/api'
import '../components/Post.css'

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['like', 'delete', 'update'])

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id)
const isLiked = computed(() => props.post.likes && props.post.likes.includes(currentUserId.value))
const isOwnPost = computed(() => props.post.userId === currentUserId.value)
const isFollowing = computed(() => authStore.user?.following?.includes(props.post.userId))
const canDelete = computed(() => isOwnPost.value || authStore.user?.isAdmin)
const canEdit = computed(() => isOwnPost.value)

const comments = ref([])
const showComments = ref(false)
const newComment = ref('')
const commentUsers = ref({})
const loadingComments = ref(false)
const isEditingPost = ref(false)
const editedPostContent = ref(props.post.content)
const editingCommentId = ref(null)
const editedCommentContent = ref('')
const commentCount = ref(props.post.commentCount || 0)

watch(() => props.post.commentCount, (newCount) => {
  commentCount.value = newCount || 0
})

watch(showComments, (show) => {
  if (show) {
    loadComments()
  }
})

const loadComments = async () => {
  try {
    loadingComments.value = true
    const commentsData = await postsAPI.getComments(props.post.id)
    comments.value = Array.isArray(commentsData) ? commentsData : []

    // Załaduj użytkowników dla komentarzy
    const userIds = [...new Set(comments.value.map(c => c.userId))]
    const usersData = await usersAPI.getAll()
    const usersMap = {}
    if (Array.isArray(usersData.data)) {
      usersData.data.forEach(u => {
        if (userIds.includes(u.id)) {
          usersMap[u.id] = u
        }
      })
    }
    commentUsers.value = usersMap
    commentCount.value = comments.value.length
  } catch (err) {
    console.error('Błąd ładowania komentarzy:', err)
  } finally {
    loadingComments.value = false
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim() || !currentUserId.value) return

  try {
    await postsAPI.addComment(props.post.id, {
      content: newComment.value.trim()
    })
    newComment.value = ''
    loadComments()
    commentCount.value++
    emit('update')
  } catch (err) {
    alert(err.message || 'Nie udało się dodać komentarza')
  }
}

const handleEditPost = async () => {
  if (!editedPostContent.value.trim()) return
  
  try {
    await postsAPI.update(props.post.id, {
      content: editedPostContent.value.trim()
    })
    isEditingPost.value = false
    emit('update')
  } catch (err) {
    alert(err.message || 'Nie udało się zaktualizować posta')
  }
}

const cancelEditPost = () => {
  isEditingPost.value = false
  editedPostContent.value = props.post.content
}

const handleEditComment = async (commentId) => {
  if (!editedCommentContent.value.trim()) return
  
  try {
    await postsAPI.updateComment(props.post.id, commentId, {
      content: editedCommentContent.value.trim()
    })
    editingCommentId.value = null
    editedCommentContent.value = ''
    loadComments()
  } catch (err) {
    alert(err.message || 'Nie udało się zaktualizować komentarza')
  }
}

const startEditingComment = (comment) => {
  editingCommentId.value = comment.id
  editedCommentContent.value = comment.content
}

const cancelEditingComment = () => {
  editingCommentId.value = null
  editedCommentContent.value = ''
}

const handleFollow = async () => {
  try {
    await usersAPI.follow(props.post.userId)
    await authStore.refreshUser()
  } catch (err) {
    console.error('Błąd podczas obserwowania:', err)
  }
}

const handleDeleteComment = async (commentId) => {
  if (!confirm('Czy na pewno chcesz usunąć ten komentarz?')) return
  
  try {
    await postsAPI.deleteComment(props.post.id, commentId)
    loadComments()
    commentCount.value--
  } catch (err) {
    alert(err.message || 'Nie udało się usunąć komentarza')
  }
}

const canEditComment = (comment) => {
  return comment.userId === currentUserId.value
}

const canDeleteComment = (comment) => {
  return comment.userId === currentUserId.value || authStore.user?.isAdmin
}

const handleLike = () => {
  emit('like', props.post.id)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
