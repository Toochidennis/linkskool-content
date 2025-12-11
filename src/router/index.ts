import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/admin/DashboardView.vue'
import UserView from '@/views/admin/TeamView.vue'
import AssessmentView from '@/views/admin/AssessmentView.vue'
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
import ChallengeView from '@/views/admin/ChallengeView.vue'
import AssessmentSpreadsheetView from '@/views/admin/AssessmentSpreadsheetView.vue'
import AssessmentFormView from '@/views/admin/AssessmentFormView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return '/login'
      return auth.isAuthenticated ? '/dashboard' : '/library'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false, layout: 'blank' }
  },
  // Redirect old /admin path to new /dashboard
  {
    path: '/admin/:pathMatch(.*)*',
    redirect: '/dashboard'
  },
  // Redirect old /user path to new /library
  {
    path: '/user/:pathMatch(.*)*',
    redirect: '/library'
  },
  // Admin Routes (hidden paths)
  {
    path: '/dashboard',
    component: AuthenticatedView,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: DashboardView
      },
      {
        path: 'analytics',
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
        path: 'announcements',
        name: 'News',
        component: NewsView
      },
      {
        path: 'admissions',
        name: 'Admissions',
        component: AdmissionsView
      },
      {
        path: 'assessments',
        name: 'Assessments',
        component: AssessmentView
      },
      {
        path: 'assessment-spreadsheet',
        name: 'Assessment Spreadsheet',
        component: AssessmentSpreadsheetView
      },
      {
        path: 'assessment-form',
        name: 'Assessment Form',
        component: AssessmentFormView
      },
      {
        path: 'programs',
        name: 'Programs',
        component: ProgramsView
      },
      {
        path: 'challenges',
        name: 'Challenges',
        component: ChallengeView
      },
      {
        path: 'team',
        name: 'Users',
        component: UserView
      },
      {
        path: 'logs',
        name: 'Activities',
        component: RecentActivitiesView
      },
      {
        path: 'config',
        name: 'Settings',
        component: SettingsView
      },
    ]
  },
  // User Routes (hidden paths)
  {
    path: '/library',
    component: AuthenticatedView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/library/upload'
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
    next('/library/upload')
    return
  }

  if (to.path === '/login' && auth.isAuthenticated) {
    next(auth.isAdmin ? '/dashboard' : '/library/upload')
    return
  }

  next()
})

export default router
