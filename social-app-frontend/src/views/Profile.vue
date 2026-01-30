<template>
  <div class="profile-page">
    <div v-if="loading" class="loading">Ładowanie profilu...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="user" class="profile-content">
      <!-- Nagłówek profilu -->
      <div class="profile-header">
        <div class="profile-avatar-container">
          <img v-if="user.avatar" 
               :src="'http://localhost:3000' + user.avatar" 
               :style="{ objectPosition: `${user.avatarPosition || 50}% center` }"
               :alt="user.username" />
          <span v-else>👤</span>
        </div>
        <div class="profile-info">
          <h2>{{ user.displayName || user.username }}</h2>
          <span class="username-handle">@{{ user.username }}</span>
          <p v-if="user.bio" class="profile-bio">{{ user.bio }}</p>
          <div class="profile-stats">
            <span class="stat-item"><strong>{{ user.following?.length || 0 }}</strong> obserwuje</span>
            <span class="stat-item"><strong>{{ activity.posts?.length || 0 }}</strong> postów</span>
          </div>
          <div class="profile-actions">
            <button v-if="isOwnProfile" @click="isEditing = !isEditing" class="btn-secondary">
              {{ isEditing ? 'Anuluj' : 'Edytuj profil' }}
            </button>
            <button v-else @click="handleFollow" :class="['btn-primary', { followed: isFollowed }]">
              {{ isFollowed ? 'Obserwujesz' : 'Obserwuj' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Formularz edycji -->
      <div v-if="isEditing" class="edit-profile-form">
        <h3>Edytuj profil</h3>
        <div class="form-group">
          <label>Nazwa wyświetlana</label>
          <input v-model="editForm.displayName" type="text" placeholder="Wpisz nazwę..." />
        </div>
        <div class="form-group">
          <label>Biogram</label>
          <textarea v-model="editForm.bio" rows="4" placeholder="Opisz siebie..."></textarea>
        </div>
        <div class="form-group">
          <label>Avatar</label>
          <div class="avatar-edit-box">
            <img v-if="avatarPreview || editForm.avatar" 
                 :src="avatarPreview || ('http://localhost:3000' + editForm.avatar)" 
                 :style="{ objectPosition: `${editForm.avatarPosition || 50}% center` }"
                 class="avatar-preview-small" />
            <input type="file" @change="handleAvatarChange" accept="image/*" />
          </div>
          <div v-if="editForm.avatar || selectedAvatar" class="avatar-position-control">
            <label>Pozycja zdjęcia (lewo-prawo): {{ editForm.avatarPosition }}%</label>
            <input type="range" v-model="editForm.avatarPosition" min="0" max="100" class="slider" />
          </div>
        </div>
        <div class="form-actions">
          <button @click="handleUpdateProfile" :disabled="updating" class="btn-primary">
            {{ updating ? 'Zapisywanie...' : 'Zapisz zmiany' }}
          </button>
        </div>
      </div>

      <!-- Taby aktywności -->
      <div class="profile-tabs">
        <button 
          :class="['profile-tab', { active: activeTab === 'posts' }]"
          @click="activeTab = 'posts'"
        >
          Posty
        </button>
        <button 
          :class="['profile-tab', { active: activeTab === 'liked' }]"
          @click="activeTab = 'liked'"
        >
          Polubione
        </button>
      </div>

      <!-- Lista postów -->
      <div class="profile-activity">
        <div v-if="activeTab === 'posts'">
          <div v-if="activity.posts.length === 0" class="no-data">Brak postów do wyświetlenia</div>
          <Post
            v-for="post in activity.posts"
            :key="post.id"
            :post="post"
            :user="user"
            @like="handleLike(post.id)"
            @delete="handleDeletePost(post.id)"
            @update="loadActivity"
          />
        </div>
        <div v-else>
          <div v-if="activity.likedPosts.length === 0" class="no-data">Brak polubionych postów</div>
          <Post
            v-for="post in activity.likedPosts"
            :key="post.id"
            :post="post"
            @like="handleLike(post.id)"
            @update="loadActivity"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { usersAPI, postsAPI } from '../services/api'
import Post from '../components/Post.vue'
import './Profile.css'

const route = useRoute()
const authStore = useAuthStore()
const toastStore = useToastStore()

const user = ref(null)
const activity = ref({ posts: [], likedPosts: [] })
const loading = ref(true)
const error = ref(null)
const isEditing = ref(false)
const updating = ref(false)
const activeTab = ref('posts')

const editForm = ref({
  displayName: '',
  bio: '',
  avatar: '',
  avatarPosition: 50
})
const selectedAvatar = ref(null)
const avatarPreview = ref(null)

const isOwnProfile = computed(() => authStore.user?.id === user.value?.id)
const isFollowed = computed(() => authStore.user?.following?.includes(user.value?.id))

onMounted(() => {
  loadProfile()
})

watch(() => route.params.id, () => {
  loadProfile()
})

const loadProfile = async () => {
  try {
    loading.value = true
    const userId = route.params.id || authStore.user?.id
    if (!userId) {
      error.value = 'Nie znaleziono użytkownika'
      return
    }

    const userData = await usersAPI.getById(userId)
    user.value = userData
    editForm.value = {
      displayName: userData.displayName || '',
      bio: userData.bio || '',
      avatar: userData.avatar || '',
      avatarPosition: userData.avatarPosition || 50
    }

    await loadActivity()
  } catch (err) {
    error.value = 'Błąd ładowania profilu'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadActivity = async () => {
  try {
    const activityData = await usersAPI.getActivity(user.value.id)
    activity.value = activityData
  } catch (err) {
    console.error('Błąd ładowania aktywności:', err)
  }
}

const handleAvatarChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedAvatar.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

const handleUpdateProfile = async () => {
  try {
    updating.value = true
    
    let avatarUrl = editForm.value.avatar
    if (selectedAvatar.value) {
      const formData = new FormData()
      formData.append('image', selectedAvatar.value)
      const uploadRes = await usersAPI.upload(formData)
      avatarUrl = uploadRes.imageUrl
    }

    await usersAPI.update(user.value.id, {
      ...editForm.value,
      avatar: avatarUrl
    })
    
    await authStore.refreshUser()
    await loadProfile()
    isEditing.value = false
    selectedAvatar.value = null
    avatarPreview.value = null
    toastStore.success('Profil został zaktualizowany!')
  } catch (err) {
    toastStore.error(err.message || 'Nie udało się zaktualizować profilu')
  } finally {
    updating.value = false
  }
}

const handleFollow = async () => {
  try {
    await usersAPI.follow(user.value.id)
    await authStore.refreshUser()
    toastStore.success(isFollowed.value ? 'Przestałeś obserwować' : 'Obserwujesz teraz tego użytkownika')
  } catch (err) {
    toastStore.error(err.message || 'Błąd podczas obserwowania')
  }
}

const handleLike = async (postId) => {
  try {
    await postsAPI.like(postId)
    loadActivity()
  } catch (err) {
    console.error(err)
  }
}

const handleDeletePost = async (postId) => {
  if (!confirm('Czy na pewno chcesz usunąć ten post?')) return
  try {
    await postsAPI.delete(postId)
    loadActivity()
  } catch (err) {
    alert(err.message)
  }
}
</script>
