import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/admin/DashboardView.vue'
import UserView from '@/views/admin/UserView.vue'
import ExamVue from '@/views/admin/ExamVue.vue'
import ProgramsView from '@/views/admin/ProgramsView.vue'
import RecentActivitiesView from '@/views/admin/RecentActivitiesView.vue'
import SettingsView from '@/views/admin/SettingsView.vue'
import CoursesVue from '@/views/admin/CoursesVue.vue'
import UploadView from '@/views/user/UploadView.vue'
import AuthenticatedLayout from '@/views/auth/AuthenticatedVue.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const auth = useAuthStore()
      return auth.isAuthenticated ? '/admin' : '/login'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false, layout: 'blank' }
  },
  // Admin Routes
  {
    path: '/admin',
    component: AuthenticatedLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: DashboardView
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView
      },
      {
        path: 'courses',
        name: 'Courses',
        component: CoursesVue
      },
      {
        path: 'exams',
        name: 'Exams',
        component: ExamVue
      },
      {
        path: 'programs',
        name: 'Programs',
        component: ProgramsView
      },
      {
        path: 'users',
        name: 'Users',
        component: UserView
      },
      {
        path: 'activities',
        name: 'Activities',
        component: RecentActivitiesView
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsView
      }
    ]
  },
  // User Routes
  {
    path: '/user',
    component: AuthenticatedLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/user/upload'
      },
      {
        path: 'upload',
        name: 'Upload',
        component: UploadView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  const requiresAuth = to.meta.requiresAuth as boolean | undefined
  const requiresAdmin = to.meta.requiresAdmin as boolean | undefined

  if (requiresAuth && !auth.isAuthenticated) {
    next('/login')
    return
  }

  if (requiresAdmin && !auth.isAdmin) {
    next('/user/upload')
    return
  }

  if (to.path === '/login' && auth.isAuthenticated) {
    next(auth.isAdmin ? '/admin' : '/user/upload')
    return
  }

  next()
})

export default router
