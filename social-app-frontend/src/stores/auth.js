import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'
import { useToastStore } from './toast'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  // Inicjalizacja - sprawdź token przy starcie
  async function init() {
    if (token.value) {
      try {
        const userData = await authAPI.getMe()
        user.value = userData
      } catch (err) {
        // Token nieprawidłowy
        logout()
      }
    }
  }

  async function login(credentials) {
    loading.value = true
    try {
      const response = await authAPI.login(credentials)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      useToastStore().success('Zalogowano pomyślnie!')
      return response
    } catch (err) {
      useToastStore().error(err.message || 'Błąd logowania')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    try {
      const response = await authAPI.register(userData)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      useToastStore().success('Konto zostało utworzone!')
      return response
    } catch (err) {
      useToastStore().error(err.message || 'Błąd rejestracji')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function refreshUser() {
    if (!token.value) return
    try {
      const userData = await authAPI.getMe()
      user.value = userData
      return userData
    } catch (err) {
      logout()
      throw err
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    useToastStore().success('Wylogowano pomyślnie')
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    init,
    login,
    register,
    refreshUser,
    logout
  }
})
