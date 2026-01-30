<template>
  <TransitionGroup name="toast" tag="div" class="toast-container">
    <div
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      :class="['toast-item', toast.type]"
      @click="removeToast(toast.id)"
    >
      <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
      <span class="toast-message">{{ toast.message }}</span>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()

const removeToast = (id) => {
  toastStore.removeToast(id)
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
}

.toast-item {
  min-width: 250px;
  padding: 12px 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  animation: slideIn 0.3s ease-out;
}

.toast-item.success {
  border-left: 4px solid #4CAF50;
}

.toast-item.error {
  border-left: 4px solid #f44336;
}

.toast-icon {
  font-size: 20px;
}

.toast-message {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* Animacje */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
