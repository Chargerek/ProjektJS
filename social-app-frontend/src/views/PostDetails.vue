<template>
  <div class="post-details-page">
    <button @click="router.back()" class="back-link">← Powrót</button>
    
    <div v-if="loading" class="loading">Ładowanie posta...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="post" class="post-container">
      <Post 
        :post="post" 
        :user="author" 
        @update="fetchPost"
        @delete="handleDelete"
        @like="handleLike"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsAPI, usersAPI } from '../services/api'
import Post from '../components/Post.vue'

const route = useRoute()
const router = useRouter()
const post = ref(null)
const author = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchPost = async () => {
  try {
    loading.value = true
    const postId = route.params.id
    const data = await postsAPI.getById(postId)
    post.value = data
    
    // Pobierz autora
    const users = await usersAPI.getAll()
    author.value = users.data?.find(u => u.id === data.userId)
  } catch (err) {
    error.value = 'Nie udało się załadować posta'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleLike = async (postId) => {
  try {
    const response = await postsAPI.like(postId)
    if (response.post) {
      post.value.likes = response.post.likes
    }
  } catch (err) {
    console.error(err)
  }
}

const handleDelete = () => {
  router.push('/')
}

onMounted(fetchPost)
</script>

<style scoped>
.post-details-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.back-link {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 0;
}

.back-link:hover {
  text-decoration: underline;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>
