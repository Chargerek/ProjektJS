<template>
  <div class="admin-panel">
    <h1>Panel Administratora</h1>
    
    <div v-if="loading" class="loading">Ładowanie danych...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Statystyki -->
      <div class="admin-stats">
        <div class="stat-card">
          <h3>Użytkownicy</h3>
          <span class="value">{{ users.length }}</span>
        </div>
        <div class="stat-card">
          <h3>Administratorzy</h3>
          <span class="value">{{ adminsCount }}</span>
        </div>
        <div class="stat-card">
          <h3>Nowi dzisiaj</h3>
          <span class="value">{{ newTodayCount }}</span>
        </div>
      </div>

      <!-- Lista użytkowników -->
      <div class="admin-users-list">
        <div class="list-header">
          <h2>Zarządzanie użytkownikami</h2>
          <div class="search-box">
             <input type="text" v-model="searchQuery" placeholder="Szukaj użytkownika..." />
          </div>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Użytkownik</th>
                <th>Email</th>
                <th>Rola</th>
                <th>Data dołączenia</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in filteredUsers" :key="u.id">
                <td>{{ u.id }}</td>
                <td>
                  <router-link :to="'/profile/' + u.id">
                    <strong>{{ u.displayName || u.username }}</strong><br/>
                    <small>@{{ u.username }}</small>
                  </router-link>
                </td>
                <td>{{ u.email }}</td>
                <td>
                  <span :class="['badge', u.isAdmin ? 'badge-admin' : 'badge-user']">
                    {{ u.isAdmin ? 'ADMIN' : 'USER' }}
                  </span>
                </td>
                <td>{{ formatDate(u.createdAt) }}</td>
                <td class="admin-actions">
                  <button 
                    @click="handlePromote(u)"
                    class="btn-secondary btn-small"
                    :disabled="u.id === authStore.user.id"
                  >
                    {{ u.isAdmin ? 'Demaskuj' : 'Daj Admina' }}
                  </button>
                  <button 
                    @click="handleDelete(u)"
                    class="btn-danger-outline btn-small"
                    :disabled="u.id === authStore.user.id"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usersAPI } from '../services/api'
import { useAuthStore } from '../stores/auth'
import './AdminPanel.css'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')

const adminsCount = computed(() => users.value.filter(u => u.isAdmin).length)
const newTodayCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return users.value.filter(u => u.createdAt && u.createdAt.split('T')[0] === today).length
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => 
    u.username.toLowerCase().includes(q) || 
    u.email.toLowerCase().includes(q) ||
    (u.displayName && u.displayName.toLowerCase().includes(q))
  )
})

onMounted(() => {
  loadData()
})

const loadData = async () => {
  try {
    loading.value = true
    const response = await usersAPI.getAll({ limit: 1000 })
    users.value = response.data || []
  } catch (err) {
    error.value = 'Błąd ładowania danych administratora'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handlePromote = async (user) => {
  const action = user.isAdmin ? 'odebrać uprawnienia administratora' : 'nadać uprawnienia administratora'
  if (!confirm(`Czy na pewno chcesz ${action} użytkownikowi ${user.username}?`)) return

  try {
    const response = await usersAPI.adminPromote(user.id)
    user.isAdmin = response.isAdmin
  } catch (err) {
    alert(err.message)
  }
}

const handleDelete = async (user) => {
  if (!confirm(`UWAGA: Czy na pewno chcesz TRWALE USUNĄĆ użytkownika ${user.username}? Tej operacji nie można cofnąć.`)) return

  try {
    await usersAPI.adminDelete(user.id)
    users.value = users.value.filter(u => u.id !== user.id)
  } catch (err) {
    alert(err.message)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pl-PL')
}
</script>
