<template>
  <div class="app">
    <Toast />
    <header class="app-header">
      <h1>📱 Social App</h1>
      <div v-if="authStore.isAuthenticated" class="header-actions">
        <nav class="tabs">
          <router-link to="/" class="tab-btn" :class="{ active: $route.path === '/' }">
            Posty
          </router-link>
          <router-link to="/users" class="tab-btn" :class="{ active: $route.path === '/users' }">
            Użytkownicy
          </router-link>
          <router-link to="/notifications" class="tab-btn" :class="{ active: $route.path === '/notifications' }">
            Powiadomienia
          </router-link>
          <router-link :to="'/profile/' + authStore.user?.id" class="tab-btn" :class="{ active: $route.path.startsWith('/profile') && $route.params.id == authStore.user?.id }">
            Mój Profil
          </router-link>
          <router-link v-if="authStore.user?.isAdmin" to="/admin" class="tab-btn" :class="{ active: $route.path === '/admin' }">
            Admin
          </router-link>
        </nav>
        <div class="header-right">
          <select @change="e => themeStore.setTheme(e.target.value)" :value="themeStore.currentTheme" class="theme-select">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="cashmere">Cashmere</option>
          </select>
          <div class="user-info">
            <div class="header-avatar-small">
              <img v-if="authStore.user?.avatar" 
                   :src="'http://localhost:3000' + authStore.user.avatar" 
                   :style="{ objectPosition: `${authStore.user.avatarPosition || 50}% center` }"
                   :alt="authStore.user.username" />
              <span v-else>{{ (authStore.user?.displayName || authStore.user?.username || 'U')[0].toUpperCase() }}</span>
            </div>
            <span class="username">{{ authStore.user?.displayName || authStore.user?.username }}</span>
            <button @click="handleLogout" class="logout-btn">
              Wyloguj
            </button>
          </div>
        </div>
      </div>
      <nav v-else class="tabs">
        <router-link to="/register" class="tab-btn">Zarejestruj się</router-link>
      </nav>
    </header>

    <main class="app-main">
      <router-view />
    </main>

    <footer class="app-footer">
      <p>Social App - Projekt JS 2025</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import Toast from './components/Toast.vue'
import './App.css'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

onMounted(() => {
  authStore.init()
  themeStore.init()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
