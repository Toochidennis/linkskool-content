<template>
    <section>
        <button v-if="isMobile && !sidebarOpen" type="button" @click="toggleSidebar"
            class="fixed top-20 left-3 z-50 p-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-md lg:hidden"
            aria-label="Open navigation">
            <i class="fas fa-bars"></i>
        </button>

        <aside :style="desktopSidebarStyle" :class="[
            'fixed left-0 top-16 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-y-auto',
            isMobile
                ? `h-[calc(100vh-4rem)] z-50 w-[16rem] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                : 'h-full z-40',
        ]">
            <div class="p-4">
                <button @click="toggleSidebar"
                    class="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <i :class="sidebarOpen ? 'fas fa-times' : 'fas fa-bars'"
                        class="text-gray-600 dark:text-gray-400"></i>
                </button>
            </div>

            <nav class="px-4 pb-4">
                <div v-for="item in menuItems" :key="item.name" class="mb-6">
                    <template v-if="item.children">
                        <div v-if="sidebarOpen || isMobile" class="mb-3">
                            <div class="border-t border-gray-300 dark:border-gray-600 mb-2"></div>
                            <div class="px-3 py-2">
                                <h3
                                    class="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide flex items-center">
                                    <i :class="item.icon" class="text-sm mr-2"></i>
                                    {{ item.name }}
                                </h3>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <router-link v-for="child in item.children" :key="child.name" :to="child.route || ''"
                                :class="{
                                    'border-l-4 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20':
                                        isActiveRoute(child.route || ''),
                                }" class="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap text-gray-700 dark:text-gray-300 rounded-r-lg">
                                <i :class="child.icon" class="text-lg"></i>
                                <span v-if="sidebarOpen || isMobile"
                                    class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                    {{ child.name }}
                                </span>
                            </router-link>
                        </div>
                    </template>

                    <router-link v-else :to="item.route || ''" :class="{
                        'border-l-4 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20':
                            isActiveRoute(item.route || ''),
                    }" class="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap text-gray-700 dark:text-gray-300 rounded-r-lg">
                        <i :class="item.icon" class="text-lg"></i>
                        <span v-if="sidebarOpen || isMobile"
                            class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {{ item.name }}
                        </span>
                    </router-link>
                </div>
            </nav>
        </aside>

        <div v-if="sidebarOpen && isMobile" @click="sidebarOpen = false"
            class="fixed inset-0 bg-black bg-opacity-35 z-40 lg:hidden"></div>
    </section>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface MenuItem {
    name: string
    route?: string
    icon: string
    children?: MenuItem[] | null
}

const route = useRoute()
const auth = useAuthStore()

const isMobile = ref(false)
const sidebarOpen = ref(true)
const hasDesktopPreference = ref(true)

const desktopSidebarStyle = computed(() => {
    if (isMobile.value) return undefined
    return { width: sidebarOpen.value ? '13.5rem' : '5.5rem' }
})

const emit = defineEmits<{
    sidebarStateChange: [payload: { isOpen: boolean; isMobile: boolean }]
}>()

const emitSidebarState = () => {
    emit('sidebarStateChange', { isOpen: sidebarOpen.value, isMobile: isMobile.value })
}

const updateViewportState = () => {
    const nextIsMobile = window.innerWidth < 1024

    if (nextIsMobile === isMobile.value) return

    isMobile.value = nextIsMobile

    if (isMobile.value) {
        hasDesktopPreference.value = sidebarOpen.value
        sidebarOpen.value = false
        emitSidebarState()
        return
    }

    sidebarOpen.value = hasDesktopPreference.value
    emitSidebarState()
}

const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
}

watch(sidebarOpen, () => {
    emitSidebarState()
})

watch(
    () => route.fullPath,
    () => {
        if (isMobile.value && sidebarOpen.value) {
            sidebarOpen.value = false
        }
    },
)

const isActiveRoute = (routePath: string): boolean => {
    if (routePath === '/dashboard') {
        return route.path === '/dashboard'
    }
    return route.path.startsWith(routePath)
}

const menuItems: MenuItem[] = [
    {
        name: 'Dashboard',
        route: '/dashboard',
        icon: 'fas fa-home',
        children: null,
    },
    {
        name: 'CBT',
        icon: 'fas fa-layer-group',
        children: [
            { name: 'Courses', route: '/dashboard/courses', icon: 'fas fa-book' },
            { name: 'Exam Types', route: '/dashboard/exam-types', icon: 'fas fa-file-alt' },
            { name: 'Topics', route: '/dashboard/topics', icon: 'fas fa-list' },
            { name: 'Syllabus', route: '/dashboard/syllabus', icon: 'fas fa-graduation-cap' },
            { name: 'Assessments', route: '/dashboard/assessments', icon: 'fas fa-question-circle' },
            { name: 'Challenges', route: '/dashboard/challenges', icon: 'fas fa-trophy' },
            { name: 'CBT Updates', route: '/dashboard/cbt-updates', icon: 'fas fa-bullhorn' },
        ],
    },
    {
        name: 'Updates',
        icon: 'fas fa-bell',
        children: [
            { name: 'Announcements', route: '/dashboard/announcements', icon: 'fas fa-newspaper' },
            { name: 'Advertisements', route: '/dashboard/ads', icon: 'fas fa-ad' },
            { name: 'Admissions', route: '/dashboard/admissions', icon: 'fas fa-user-plus' },
        ],
    },
    {
        name: 'Help Center',
        icon: 'fas fa-circle-question',
        children: [{ name: 'FAQs', route: '/dashboard/faqs', icon: 'fas fa-comments' }],
    },
    {
        name: 'Learn',
        icon: 'fas fa-graduation-cap',
        children: [
            { name: 'Levels', route: '/dashboard/levels', icon: 'fas fa-layer-group' },
            { name: 'Videos', route: '/dashboard/video-library', icon: 'fas fa-video' },
            { name: 'Courses', route: '/dashboard/learn-courses', icon: 'fas fa-book' },
            { name: 'Programs', route: '/dashboard/learn-programs', icon: 'fas fa-sitemap' },
        ],
    },
]

if (auth.isAdmin) {
    menuItems.push(
        { name: 'Team', route: '/dashboard/team', icon: 'fas fa-users', children: null },
        { name: 'Logs', route: '/dashboard/logs', icon: 'fas fa-clipboard-list', children: null },
        {
            name: 'Notifications',
            route: '/dashboard/notifications',
            icon: 'fas fa-bell',
            children: null,
        },
    )
}

menuItems.push({ name: 'Settings', route: '/dashboard/config', icon: 'fas fa-cog', children: null })

onMounted(() => {
    isMobile.value = window.innerWidth < 1024
    sidebarOpen.value = isMobile.value ? false : hasDesktopPreference.value
    emitSidebarState()
    window.addEventListener('resize', updateViewportState)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateViewportState)
})
</script>
