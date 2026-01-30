<template>
  <div class="notifications-page">
    <h2>Powiadomienia</h2>
    
    <div v-if="loading" class="loading">Ładowanie powiadomień...</div>
    <div v-else-if="notifications.length === 0" class="no-notifications">
      Brak nowych powiadomień
    </div>
    
    <div v-else class="notifications-list">
        <div 
          v-for="n in notifications" 
          :key="n.id" 
          :class="['notification-item', { unread: !n.isRead }]"
          @click="handleNotificationClick(n)"
        >
        <div class="notification-icon">
          {{ n.type === 'like' ? '❤️' : '💬' }}
        </div>
        <div class="notification-content">
          <p>
            <strong>{{ n.actorDisplayName || n.actorUsername }}</strong>
            {{ n.type === 'like' ? 'polubił Twój post' : 'skomentował Twój post' }}
          </p>
          <span class="notification-date">{{ formatDate(n.createdAt) }}</span>
        </div>
        <div v-if="!n.isRead" class="unread-dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { request } from '../services/api'
import './Notifications.css'

const router = useRouter()
const notifications = ref([])
const loading = ref(true)

const fetchNotifications = async () => {
  try {
    loading.value = true
    const data = await request('/notifications')
    notifications.value = data
  } catch (err) {
    console.error('Błąd pobierania powiadomień:', err)
  } finally {
    loading.value = false
  }
}

const handleNotificationClick = async (notification) => {
  if (!notification.isRead) {
    await markAsRead(notification)
  }
  if (notification.postId) {
    router.push(`/post/${notification.postId}`)
  }
}

const markAsRead = async (notification) => {
  if (notification.isRead) return
  
  try {
    await request(`/notifications/${notification.id}/read`, { method: 'PUT' })
    notification.isRead = 1
  } catch (err) {
    console.error('Błąd oznaczania jako przeczytane:', err)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(fetchNotifications)
</script>

<style scoped>
.notifications-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.notification-item.unread {
  border-left: 4px solid var(--primary-color);
  background: rgba(24, 119, 242, 0.05);
}

.notification-icon {
  font-size: 24px;
}

.notification-content p {
  margin: 0;
  color: var(--text-color);
}

.notification-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  margin-left: auto;
}

.loading, .no-notifications {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>
