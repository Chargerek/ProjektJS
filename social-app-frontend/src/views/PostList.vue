<template>
  <div class="post-list">
    <h2>Posty</h2>
    
    <!-- Wyszukiwanie i sortowanie -->
    <div class="filters-section">
      <div class="search-box">
        <input
          type="text"
          placeholder="Szukaj postów..."
          v-model="searchTerm"
          @input="handleSearchChange"
          class="search-input"
        />
      </div>
      <div class="sort-box">
        <label for="sort-select">Sortuj:</label>
        <select
          id="sort-select"
          v-model="sortBy"
          @change="handleSortChange"
          class="sort-select"
        >
          <option value="createdAt:desc">Najnowsze</option>
          <option value="createdAt:asc">Najstarsze</option>
          <option value="likes:desc">Najbardziej polubione</option>
          <option value="likes:asc">Najmniej polubione</option>
        </select>
      </div>
    </div>
    
    <form v-if="authStore.user" @submit.prevent="handleCreatePost" class="create-post-form">
      <textarea
        v-model="newPostContent"
        placeholder="Co myślisz?"
        rows="3"
        :disabled="creatingPost"
      />
      <button type="submit" :disabled="!newPostContent.trim() || creatingPost">
        {{ creatingPost ? 'Publikowanie...' : 'Opublikuj' }}
      </button>
      
      <div class="post-form-extras">
        <label class="image-upload-label">
          <span>📷 Dodaj zdjęcie</span>
          <input type="file" @change="handleImageChange" accept="image/*" class="image-input" />
        </label>
        <div v-if="selectedImage" class="image-preview">
          <img :src="imagePreview" />
          <button @click="selectedImage = null" class="remove-img">✕</button>
        </div>
      </div>
    </form>

    <div v-if="loading && posts.length === 0" class="loading">Ładowanie postów...</div>
    <div v-else-if="error && posts.length === 0" class="error">Błąd: {{ error }}</div>
    <div v-else-if="posts.length === 0" class="no-posts">Brak postów do wyświetlenia</div>
    <template v-else>
      <Post
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :user="users[post.userId]"
        @like="handleLike"
        @delete="handleDelete"
        @update="loadPosts"
      />
      
      <!-- Loader dla Infinite Scroll -->
      <div v-if="loading" class="infinite-scroll-loader">
        Ładowanie kolejnych postów...
      </div>
      <div v-if="pagination && !pagination.hasNext && posts.length > 0" class="no-more-posts">
        To już wszystkie posty 🎉
      </div>
      
      <!-- Element obserwujący koniec listy -->
      <div ref="loadMoreTrigger" class="load-more-trigger"></div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { postsAPI, usersAPI } from '../services/api'
import Post from '../components/Post.vue'
import '../components/PostList.css'

const authStore = useAuthStore()
const toastStore = useToastStore()

const posts = ref([])
const loading = ref(false)
const error = ref(null)
const users = ref({})
const newPostContent = ref('')
const creatingPost = ref(false)
const searchTerm = ref('')
const sortBy = ref('createdAt:desc')
const currentPage = ref(1)
const pagination = ref(null)
const loadMoreTrigger = ref(null)

const selectedImage = ref(null)
const imagePreview = ref(null)

let observer = null

onMounted(() => {
  loadUsers()
  loadPosts(true) // Pierwsze ładowanie
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

const setupIntersectionObserver = () => {
  if (observer) observer.disconnect()
  
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry.isIntersecting && !loading.value && pagination.value?.hasNext) {
      handleLoadMore()
    }
  }, { 
    threshold: 0,
    rootMargin: '300px'
  })

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
}

// Obserwuj zmiany triggera (pojawienie się w DOM po załadowaniu postów)
watch(loadMoreTrigger, (newVal) => {
  if (newVal) {
    setupIntersectionObserver()
  }
})

const handleLoadMore = () => {
  currentPage.value++
  loadPosts(false)
}

watch([searchTerm, sortBy], () => {
  currentPage.value = 1
  loadPosts(true)
})

const loadPosts = async (reset = false) => {
  if (loading.value) return

  try {
    loading.value = true
    const params = {
      search: searchTerm.value || undefined,
      sort: sortBy.value,
      page: currentPage.value,
      limit: 10
    }
    const data = await postsAPI.getAll(params)
    
    if (reset) {
      posts.value = data.data || []
    } else {
      posts.value = [...posts.value, ...(data.data || [])]
    }
    
    pagination.value = data.pagination || null
    error.value = null
  } catch (err) {
    error.value = err.message || 'Nie udało się załadować postów'
    console.error('Błąd ładowania postów:', err)
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const usersData = await usersAPI.getAll()
    const usersMap = {}
    usersData.data?.forEach(user => {
      usersMap[user.id] = user
    })
    users.value = usersMap
  } catch (err) {
    console.error('Błąd ładowania użytkowników:', err)
  }
}

const handleLike = async (postId) => {
  try {
    const response = await postsAPI.like(postId)
    // Znajdź i zaktualizuj konkretny post w tablicy
    const index = posts.value.findIndex(p => p.id === postId)
    if (index !== -1 && response.post) {
      posts.value[index] = {
        ...posts.value[index],
        likes: response.post.likes
      }
    }
  } catch (err) {
    toastStore.error(err.message || 'Nie udało się polubić posta')
  }
}

const handleDelete = async (postId) => {
  if (!confirm('Czy na pewno chcesz usunąć ten post?')) {
    return
  }
  try {
    await postsAPI.delete(postId)
    toastStore.success('Post został usunięty')
    loadPosts()
  } catch (err) {
    toastStore.error(err.message || 'Nie udało się usunąć posta')
  }
}

const handleCreatePost = async () => {
  if (!newPostContent.value.trim() || creatingPost.value) return

  try {
    creatingPost.value = true
    
    let imageUrl = null
    if (selectedImage.value) {
      const formData = new FormData()
      formData.append('image', selectedImage.value)
      const uploadRes = await postsAPI.upload(formData)
      imageUrl = uploadRes.imageUrl
    }

    await postsAPI.create({ 
      content: newPostContent.value.trim(),
      image: imageUrl 
    })
    
    toastStore.success('Post został opublikowany!')
    newPostContent.value = ''
    selectedImage.value = null
    imagePreview.value = null
    currentPage.value = 1
    loadPosts(true)
  } catch (err) {
    toastStore.error(err.message || 'Nie udało się utworzyć posta')
  } finally {
    creatingPost.value = false
  }
}

const handleImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedImage.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const handleSearchChange = () => {
  // handled by watch
}

const handleSortChange = () => {
  // handled by watch
}
</script>
