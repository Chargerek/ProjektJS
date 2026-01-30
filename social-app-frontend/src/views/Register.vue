<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Zarejestruj się</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Nazwa użytkownika</label>
          <input
            id="username"
            type="text"
            v-model="username"
            required
            minlength="3"
            maxlength="20"
            pattern="[a-zA-Z0-9_]+"
            title="Tylko litery, cyfry i podkreślniki"
            :disabled="loading"
          />
        </div>
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
            minlength="6"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Potwierdź hasło</label>
          <input
            id="confirmPassword"
            type="password"
            v-model="confirmPassword"
            required
            :disabled="loading"
          />
        </div>
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Rejestracja...' : 'Zarejestruj się' }}
        </button>
      </form>
      <p class="switch-auth">
        Masz już konto?
        <router-link to="/login" class="link-btn">Zaloguj się</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import '../components/Register.css'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''

  // Walidacja
  if (password.value !== confirmPassword.value) {
    error.value = 'Hasła nie są identyczne'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Hasło musi mieć co najmniej 6 znaków'
    return
  }

  if (username.value.length < 3 || username.value.length > 20) {
    error.value = 'Nazwa użytkownika musi mieć od 3 do 20 znaków'
    return
  }

  loading.value = true

  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value
    })
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Nie udało się zarejestrować'
  } finally {
    loading.value = false
  }
}
</script>
