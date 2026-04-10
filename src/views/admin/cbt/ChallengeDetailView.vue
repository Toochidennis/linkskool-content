<template>
    <div class="challenge-detail-view">
        <header class="detail-header">
            <div class="detail-header__copy">
                <button class="back-link" type="button" @click="router.push({ name: 'Challenges' })">
                    <i class="fas fa-arrow-left"></i>
                    <span>Back to exam types</span>
                </button>

                <div class="detail-header__title-wrap">
                    <p class="detail-eyebrow">Challenge Library</p>
                    <h1 class="detail-title">{{ examTypeName }}</h1>
                    <p class="detail-subtitle">
                        Browse existing challenge sets for {{ examTypeShortname }}. Data on this screen is dummy data
                        for now.
                    </p>
                </div>
            </div>

            <button class="create-button" type="button" @click="goToCreateChallenge">
                <i class="fas fa-plus"></i>
                <span>Create Challenge</span>
            </button>
        </header>

        <section class="filters-card">
            <div class="filters-block">
                <p class="filters-label">Filter by date</p>
                <div class="filter-chip-row">
                    <button v-for="option in dateFilters" :key="option.value" type="button" class="filter-chip"
                        :class="{ 'filter-chip--active': selectedDateFilter === option.value }"
                        @click="selectedDateFilter = option.value">
                        {{ option.label }}
                    </button>
                </div>
            </div>

            <div class="filters-block">
                <p class="filters-label">Filter by author</p>
                <div class="filter-chip-row">
                    <button v-for="author in authorOptions" :key="author" type="button" class="filter-chip"
                        :class="{ 'filter-chip--active': selectedAuthor === author }" @click="selectedAuthor = author">
                        {{ author }}
                    </button>
                </div>
            </div>
        </section>

        <section v-if="paginatedChallenges.length" class="challenge-results">
            <div class="results-meta">
                <p>{{ filteredChallenges.length }} challenge{{ filteredChallenges.length === 1 ? '' : 's' }} found</p>
                <p>Page {{ currentPage }} of {{ totalPages }}</p>
            </div>

            <div class="challenge-grid">
                <article v-for="challenge in paginatedChallenges" :key="challenge.id" class="challenge-entry-card">
                    <div class="challenge-entry-card__top">
                        <div class="challenge-entry-card__badge">
                            <i class="fas fa-book-open"></i>
                        </div>

                        <span class="challenge-entry-card__status" :class="statusClassMap[challenge.status]">
                            {{ challenge.status }}
                        </span>
                    </div>

                    <div class="challenge-entry-card__content">
                        <h2 class="challenge-entry-card__title">{{ challenge.title }}</h2>
                        <p class="challenge-entry-card__summary">{{ challenge.summary }}</p>
                    </div>

                    <dl class="challenge-entry-card__meta-grid">
                        <div>
                            <dt>Author</dt>
                            <dd>{{ challenge.author }}</dd>
                        </div>
                        <div>
                            <dt>Updated</dt>
                            <dd>{{ formatDate(challenge.updatedAt) }}</dd>
                        </div>
                        <div>
                            <dt>Questions</dt>
                            <dd>{{ challenge.questionCount }}</dd>
                        </div>
                        <div>
                            <dt>Duration</dt>
                            <dd>{{ challenge.duration }}</dd>
                        </div>
                    </dl>
                </article>
            </div>

            <footer class="pagination-bar">
                <button type="button" class="pagination-button" :disabled="currentPage === 1"
                    @click="goToPage(currentPage - 1)">
                    Previous
                </button>

                <div class="pagination-pages">
                    <button v-for="page in pageNumbers" :key="page" type="button" class="pagination-page"
                        :class="{ 'pagination-page--active': currentPage === page }" @click="goToPage(page)">
                        {{ page }}
                    </button>
                </div>

                <button type="button" class="pagination-button" :disabled="currentPage === totalPages"
                    @click="goToPage(currentPage + 1)">
                    Next
                </button>
            </footer>
        </section>

        <section v-else class="empty-state">
            <div class="empty-state__icon">
                <i class="fas fa-folder-open"></i>
            </div>
            <h2>No challenges match these filters</h2>
            <p>Try changing the author or date filter to see more dummy challenge records.</p>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type DateFilter = 'all' | '7days' | '30days'
type ChallengeStatus = 'Draft' | 'Published' | 'Review'
type AuthorFilter = 'Admin' | 'Users'

interface DummyChallenge {
    id: number
    examTypeId: string
    title: string
    summary: string
    author: AuthorFilter
    updatedAt: string
    questionCount: number
    duration: string
    status: ChallengeStatus
}

const router = useRouter()
const route = useRoute()

const dateFilters: Array<{ label: string; value: DateFilter }> = [
    { label: 'All time', value: 'all' },
    { label: 'Last 7 days', value: '7days' },
    { label: 'Last 30 days', value: '30days' },
]

const dummyChallenges: DummyChallenge[] = [
    {
        id: 1,
        examTypeId: 'default',
        title: 'Core reasoning warm-up',
        summary: 'Short entry challenge covering logic, vocabulary, and quick-fire comprehension.',
        author: 'Admin',
        updatedAt: '2026-03-29',
        questionCount: 25,
        duration: '20 mins',
        status: 'Published',
    },
    {
        id: 2,
        examTypeId: 'default',
        title: 'Timed practice set A',
        summary: 'Mixed question batch designed for speed practice and accuracy review.',
        author: 'Users',
        updatedAt: '2026-03-26',
        questionCount: 40,
        duration: '35 mins',
        status: 'Draft',
    },
    {
        id: 3,
        examTypeId: 'default',
        title: 'Weekend mastery drill',
        summary: 'Extended challenge set for revision sessions with balanced difficulty.',
        author: 'Users',
        updatedAt: '2026-03-23',
        questionCount: 50,
        duration: '45 mins',
        status: 'Review',
    },
    {
        id: 4,
        examTypeId: 'default',
        title: 'Past question remix',
        summary: 'A refreshed pack of previously used challenge items with updated sequencing.',
        author: 'Admin',
        updatedAt: '2026-03-18',
        questionCount: 30,
        duration: '25 mins',
        status: 'Published',
    },
    {
        id: 5,
        examTypeId: 'default',
        title: 'Comprehension focus pack',
        summary: 'Reading-heavy challenge built for close comprehension and recall.',
        author: 'Users',
        updatedAt: '2026-03-15',
        questionCount: 20,
        duration: '18 mins',
        status: 'Draft',
    },
    {
        id: 6,
        examTypeId: 'default',
        title: 'Mock exam sprint',
        summary: 'Compact mock session intended for quick class practice before a full assessment.',
        author: 'Admin',
        updatedAt: '2026-03-12',
        questionCount: 35,
        duration: '30 mins',
        status: 'Published',
    },
    {
        id: 7,
        examTypeId: 'default',
        title: 'Revision booster set',
        summary: 'General revision challenge with a tighter timing window and easier entry points.',
        author: 'Users',
        updatedAt: '2026-03-10',
        questionCount: 28,
        duration: '22 mins',
        status: 'Review',
    },
    {
        id: 8,
        examTypeId: 'default',
        title: 'High-score practice round',
        summary: 'Higher-difficulty challenge meant for top-performing learners and retakes.',
        author: 'Admin',
        updatedAt: '2026-03-07',
        questionCount: 45,
        duration: '40 mins',
        status: 'Published',
    },
    {
        id: 9,
        examTypeId: 'default',
        title: 'Foundation checkpoint',
        summary: 'Baseline challenge used to gauge readiness before moving to advanced sets.',
        author: 'Users',
        updatedAt: '2026-03-03',
        questionCount: 18,
        duration: '15 mins',
        status: 'Draft',
    },
]

const selectedDateFilter = ref<DateFilter>('all')
const selectedAuthor = ref<AuthorFilter>('Admin')
const currentPage = ref(1)
const pageSize = 6

const statusClassMap: Record<ChallengeStatus, string> = {
    Draft: 'challenge-entry-card__status--draft',
    Published: 'challenge-entry-card__status--published',
    Review: 'challenge-entry-card__status--review',
}

const examTypeName = computed(() => {
    const value = route.query.name
    return typeof value === 'string' && value.trim() ? value : 'Selected Exam Type'
})

const examTypeShortname = computed(() => {
    const value = route.query.shortname
    return typeof value === 'string' && value.trim() ? value : 'EXAM'
})

const baseChallenges = computed(() => {
    const examTypeId = String(route.params.examTypeId || 'default')
    return dummyChallenges.map(challenge => ({
        ...challenge,
        examTypeId,
    }))
})

const authorOptions: AuthorFilter[] = ['Admin', 'Users']

const filteredChallenges = computed(() => {
    const now = new Date('2026-03-31T12:00:00')

    return baseChallenges.value.filter(challenge => {
        if (challenge.author !== selectedAuthor.value) {
            return false
        }

        if (selectedDateFilter.value === 'all') {
            return true
        }

        const updatedAt = new Date(challenge.updatedAt)
        const diffInDays = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)

        if (selectedDateFilter.value === '7days') {
            return diffInDays <= 7
        }

        return diffInDays <= 30
    })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredChallenges.value.length / pageSize)))

const paginatedChallenges = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredChallenges.value.slice(start, start + pageSize)
})

const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1))

watch([selectedDateFilter, selectedAuthor], () => {
    currentPage.value = 1
})

watch(totalPages, value => {
    if (currentPage.value > value) {
        currentPage.value = value
    }
})

const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) {
        return
    }

    currentPage.value = page
}

const goToCreateChallenge = () => {
    router.push({
        name: 'Challenge Create',
        params: {
            examTypeId: String(route.params.examTypeId || ''),
        },
        query: {
            name: examTypeName.value,
            shortname: examTypeShortname.value,
        },
    })
}

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value))
</script>

<style scoped>
.challenge-detail-view {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.detail-header__copy {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.back-link {
    border: 0;
    background: transparent;
    padding: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.92rem;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
}

.detail-header__title-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.detail-eyebrow {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #3b82f6;
}

.detail-title {
    margin: 0;
    font-size: 1.9rem;
    font-weight: 800;
    color: #0f172a;
}

.detail-subtitle {
    margin: 0;
    max-width: 720px;
    color: #64748b;
    line-height: 1.55;
}

.create-button {
    border: 0;
    border-radius: 0.95rem;
    padding: 0.9rem 1.15rem;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    background: #0f172a;
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
}

.filters-card {
    border-radius: 1.25rem;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
    padding: 1.1rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
}

.filters-block {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
}

.filters-label {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 700;
    color: #475569;
}

.filter-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
}

.filter-chip {
    border: 1px solid #dbe3ee;
    border-radius: 9999px;
    background: #ffffff;
    color: #334155;
    padding: 0.62rem 0.9rem;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.filter-chip--active {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1d4ed8;
}

.challenge-results {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.results-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    color: #64748b;
    font-size: 0.9rem;
}

.results-meta p {
    margin: 0;
}

.challenge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
}

.challenge-entry-card {
    border-radius: 1.2rem;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    padding: 1.1rem;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.challenge-entry-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.8rem;
}

.challenge-entry-card__badge {
    width: 2.85rem;
    height: 2.85rem;
    border-radius: 0.95rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #3b82f6;
    color: #ffffff;
    font-size: 1rem;
}

.challenge-entry-card__status {
    padding: 0.38rem 0.7rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1;
}

.challenge-entry-card__status--draft {
    background: #fff7ed;
    color: #c2410c;
}

.challenge-entry-card__status--published {
    background: #ecfdf5;
    color: #047857;
}

.challenge-entry-card__status--review {
    background: #eef2ff;
    color: #4338ca;
}

.challenge-entry-card__content {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.challenge-entry-card__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
}

.challenge-entry-card__summary {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.55;
    color: #64748b;
}

.challenge-entry-card__meta-grid {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
}

.challenge-entry-card__meta-grid div {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.challenge-entry-card__meta-grid dt {
    font-size: 0.76rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
}

.challenge-entry-card__meta-grid dd {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e293b;
}

.pagination-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.pagination-button,
.pagination-page {
    border: 1px solid #dbe3ee;
    background: #ffffff;
    color: #334155;
    border-radius: 0.85rem;
    padding: 0.7rem 0.95rem;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
}

.pagination-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.pagination-pages {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.pagination-page {
    min-width: 2.6rem;
}

.pagination-page--active {
    border-color: #0f172a;
    background: #0f172a;
    color: #ffffff;
}

.empty-state {
    min-height: 280px;
    border-radius: 1.25rem;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    text-align: center;
    padding: 1.25rem;
}

.empty-state h2,
.empty-state p {
    margin: 0;
}

.empty-state h2 {
    font-size: 1.1rem;
    color: #0f172a;
}

.empty-state p {
    color: #64748b;
}

.empty-state__icon {
    width: 4rem;
    height: 4rem;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #eff6ff;
    color: #2563eb;
    font-size: 1.4rem;
}

@media (max-width: 768px) {
    .challenge-detail-view {
        padding: 1rem;
    }

    .detail-title {
        font-size: 1.55rem;
    }

    .create-button {
        width: 100%;
        justify-content: center;
    }

    .challenge-entry-card__meta-grid {
        grid-template-columns: 1fr;
    }

    .pagination-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .pagination-pages {
        justify-content: center;
        flex-wrap: wrap;
    }
}
</style>
