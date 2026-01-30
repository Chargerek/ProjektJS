import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/PostList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../views/UserList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/:id?',
      name: 'Profile',
      component: () => import('../views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('../views/AdminPanel.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('../views/Notifications.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/post/:id',
      name: 'PostDetails',
      component: () => import('../views/PostDetails.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.user?.isAdmin) {
    next('/')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
