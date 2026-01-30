<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Zaloguj się</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="password">Hasło</label>
          <input
            id="password"
            type="password"
            v-model="password"
            required
            :disabled="loading"
          />
        </div>
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Logowanie...' : 'Zaloguj się' }}
        </button>
      </form>
      <p class="switch-auth">
        Nie masz konta?
        <router-link to="/register" class="link-btn">Zarejestruj się</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import '../components/Login.css'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Nie udało się zalogować'
  } finally {
    loading.value = false
  }
}
</script>
