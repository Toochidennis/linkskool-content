import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/admin/DashboardView.vue'
import UserView from '@/views/admin/UserView.vue'
import ExamVue from '@/views/admin/ExamView.vue'
import ProgramsView from '@/views/admin/ProgramView.vue'
import RecentActivitiesView from '@/views/admin/RecentActivitiesView.vue'
import SettingsView from '@/views/admin/SettingsView.vue'
import CoursesVue from '@/views/admin/CoursesView.vue'
import UploadView from '@/views/user/UploadView.vue'
import AuthenticatedView from '@/views/auth/AuthenticatedView.vue'
import TopicsView from '@/views/admin/TopicsView.vue'
import SyllabusView from '@/views/admin/SyllabusView.vue'
import NewsView from '@/views/admin/NewsView.vue'
import AdmissionsView from '@/views/admin/AdmissionsView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const auth = useAuthStore()
      if(!auth.isAuthenticated) return '/login'
      return auth.isAuthenticated ? '/admin' : '/user/upload'
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
    component: AuthenticatedView,
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
        path: 'topics',
        name: 'Topics',
        component: TopicsView
      },
      {
        path: 'syllabus',
        name: 'Syllabus',
        component: SyllabusView
      },
      {
        path: 'news',
        name: 'News',
        component: NewsView
      },
      {
        path: 'admissions',
        name: 'Admissions',
        component: AdmissionsView
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
    component: AuthenticatedView,
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
