<template>
  <div class="user-list">
    <div class="user-list-header">
      <h2>Użytkownicy</h2>
      <div class="search-box">
        <input
          type="text"
          placeholder="Szukaj użytkowników..."
          v-model="searchTerm"
          @input="handleSearchChange"
          class="search-input"
        />
      </div>
    </div>
    
    <div v-if="loading && users.length === 0" class="loading">Ładowanie użytkowników...</div>
    <div v-else-if="error && users.length === 0" class="error">Błąd: {{ error }}</div>
    <div v-else-if="users.length === 0" class="no-users">Brak użytkowników</div>
    <template v-else>
      <div class="users-grid">
        <div v-for="user in users" :key="user.id" class="user-card">
          <div class="user-card-header">
            <button
              v-if="authStore.user && !isSelf(user)"
              :class="['follow-btn', { following: isFollowing(user) }]"
              @click="handleFollow(user.id)"
            >
              {{ isFollowing(user) ? 'Odobserwuj' : 'Obserwuj' }}
            </button>
          </div>
          <div class="user-card-content">
            <div class="user-avatar">
              <img v-if="user.avatar" 
                   :src="'http://localhost:3000' + user.avatar" 
                   :style="{ objectPosition: `${user.avatarPosition || 50}% center` }"
                   :alt="user.username" 
                   class="avatar-img" />
              <span v-else>{{ (user.displayName || user.username || 'U')[0].toUpperCase() }}</span>
            </div>
            <div class="user-info">
              <router-link :to="'/profile/' + user.id" class="user-link">
                <h3>{{ user.displayName || user.username }}</h3>
              </router-link>
              <p class="username">@{{ user.username }}</p>
              <p v-if="user.following !== undefined" class="following">
                Obserwuje: {{ user.following }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Paginacja -->
      <div v-if="pagination && pagination.totalPages > 1" class="pagination">
        <button
          @click="handlePageChange(currentPage - 1)"
          :disabled="!pagination.hasPrev || loading"
          class="pagination-btn"
        >
          Poprzednia
        </button>
        <span class="pagination-info">
          Strona {{ pagination.page }} z {{ pagination.totalPages }} ({{ pagination.total }} użytkowników)
        </span>
        <button
          @click="handlePageChange(currentPage + 1)"
          :disabled="!pagination.hasNext || loading"
          class="pagination-btn"
        >
          Następna
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usersAPI } from '../services/api'
import '../components/UserList.css'

const authStore = useAuthStore()

const users = ref([])
const loading = ref(true)
const error = ref(null)
const followingStates = ref({})
const searchTerm = ref('')
const currentPage = ref(1)
const pagination = ref(null)

onMounted(() => {
  loadUsers()
})

watch([searchTerm, currentPage], () => {
  loadUsers()
})

watch(() => authStore.user?.following, () => {
  updateFollowingStates()
}, { deep: true })

const loadUsers = async () => {
  try {
    loading.value = true
    const params = {
      search: searchTerm.value || undefined,
      page: currentPage.value,
      limit: 12
    }
    const data = await usersAPI.getAll(params)
    users.value = data.data || []
    pagination.value = data.pagination || null
    updateFollowingStates()
    error.value = null
  } catch (err) {
    error.value = err.message || 'Nie udało się załadować użytkowników'
    console.error('Błąd ładowania użytkowników:', err)
  } finally {
    loading.value = false
  }
}

const updateFollowingStates = () => {
  if (!authStore.user) return
  
  const states = {}
  users.value.forEach(u => {
    if (u.id === authStore.user.id) {
      states[u.id] = 'self'
    } else {
      const isFollowing = Array.isArray(authStore.user.following) && authStore.user.following.includes(u.id)
      states[u.id] = isFollowing ? 'following' : 'not-following'
    }
  })
  followingStates.value = states
}

const handleFollow = async (userId) => {
  if (!authStore.user || userId === authStore.user.id) return
  
  const wasFollowing = followingStates.value[userId] === 'following'
  const newState = wasFollowing ? 'not-following' : 'following'
  
  followingStates.value[userId] = newState
  
  try {
    await usersAPI.follow(userId)
    await authStore.refreshUser()
  } catch (err) {
    followingStates.value[userId] = wasFollowing ? 'following' : 'not-following'
    alert(err.message || 'Nie udało się wykonać akcji')
  }
}

const isSelf = (user) => {
  return authStore.user && user.id === authStore.user.id
}

const isFollowing = (user) => {
  return followingStates.value[user.id] === 'following'
}

const handleSearchChange = () => {
  currentPage.value = 1
}

const handlePageChange = (newPage) => {
  currentPage.value = newPage
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
