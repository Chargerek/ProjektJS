import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([])
    let nextId = 0

    function addToast(message, type = 'success', duration = 3000) {
        const id = nextId++
        toasts.value.push({ id, message, type })

        setTimeout(() => {
            removeToast(id)
        }, duration)
    }

    function removeToast(id) {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    function success(message, duration) {
        addToast(message, 'success', duration)
    }

    function error(message, duration) {
        addToast(message, 'error', duration)
    }

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error
    }
})
