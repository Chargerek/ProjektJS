import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    const currentTheme = ref(localStorage.getItem('theme') || 'light')

    function setTheme(theme) {
        currentTheme.value = theme
        localStorage.setItem('theme', theme)
        applyTheme(theme)
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme)
    }

    // Inicjalizacja przy ładowaniu
    function init() {
        applyTheme(currentTheme.value)
    }

    return {
        currentTheme,
        setTheme,
        init
    }
})
