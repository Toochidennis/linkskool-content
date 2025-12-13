<template>
    <Transition name="fade">
        <div v-if="isVisible" class="floating-action-card" :style="{
            top: `${floatingCardPosition.top}px`,
            left: `${floatingCardPosition.left}px`
        }">
            <!-- Main floating card -->
            <div class="action-card-content">
                <!-- Action buttons -->
                <div class="action-buttons">
                    <button class="action-btn duplicate" @click="$emit('duplicate')" title="Duplicate this question">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>

                    <button class="action-btn add" @click="$emit('add')" title="Add a new question">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>

                    <button class="action-btn delete" @click="$emit('delete')" title="Delete this question">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                            </path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Pointer arrow -->
            <div class="action-card-arrow"></div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { useFloatingActionCard } from '@/composables/useFloatingActionCard';

const { activeCard, floatingCardPosition, isVisible } = useFloatingActionCard();

defineEmits<{
    close: [];
    duplicate: [];
    add: [];
    delete: [];
}>();
</script>

<style scoped>
/* Transition animations */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: left center;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateX(-12px) scale(0.95);
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
    transform: translateX(0) scale(1);
}

/* Floating action card container */
.floating-action-card {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    /* Smooth transition using top/left for viewport-relative positioning */
    transition: top 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
}

.action-card-content {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 56px;
    padding: 8px;
    background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.12),
        0 0 0 1px rgba(102, 126, 234, 0.08);
    backdrop-filter: blur(8px);
    animation: slideInLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideInLeft {
    0% {
        opacity: 0;
        transform: translateX(-24px) scale(0.9);
    }

    100% {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

.action-card-header {
    display: none;
}

.action-card-title {
    font-size: 12px;
    font-weight: 700;
    color: #667eea;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.close-btn:hover {
    background: #f3f4f6;
    color: #667eea;
    transform: scale(1.1);
}

/* Action buttons */
.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 10px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: #374151;
    width: 100%;
    height: 40px;
    position: relative;
    overflow: hidden;
}

.action-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
}

.action-btn:hover::before {
    left: 100%;
}

.action-btn svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    transition: transform 0.2s ease;
}

.action-btn:hover {
    background: white;
    transform: scale(1.1);
}

.action-btn:active {
    transform: translateX(2px) scale(0.98);
}

.action-btn.duplicate {
    border-color: #10b981;
    color: #10b981;
}

.action-btn.duplicate:hover {
    background: #f0fdf4;
    border-color: #10b981;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.action-btn.duplicate svg {
    color: #10b981;
}

.action-btn.add {
    border-color: #667eea;
    color: #667eea;
}

.action-btn.add:hover {
    background: #f0f4ff;
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.action-btn.add svg {
    color: #667eea;
}

.action-btn.delete {
    border-color: #ef4444;
    color: #ef4444;
}

.action-btn.delete:hover {
    background: #fef2f2;
    border-color: #ef4444;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.action-btn.delete svg {
    color: #ef4444;
}

/* Hint text */
.action-hint {
    display: none;
}

/* Pointer arrow - pointing left toward the question card */
.action-card-arrow {
    position: absolute;
    right: 100%;
    top: 20px;
    width: 0;
    height: 0;
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
    border-right: 8px solid white;
    filter: drop-shadow(-1px 0 1px rgba(102, 126, 234, 0.1));
    animation: pulse-arrow 3s ease-in-out infinite;
}

@keyframes pulse-arrow {

    0%,
    100% {
        opacity: 0.6;
        transform: translateX(0);
    }

    50% {
        opacity: 1;
        transform: translateX(-2px);
    }
}

/* Responsive adjustments */
@media (max-width: 1400px) {
    .action-card-content {
        width: 56px;
        padding: 8px;
    }

    .action-btn {
        padding: 8px;
        height: 36px;
    }

    .action-btn svg {
        width: 18px;
        height: 18px;
    }
}

@media (max-width: 1024px) {
    .floating-action-card {
        position: fixed;
        bottom: 24px;
        right: 24px;
        top: auto !important;
        left: auto !important;
    }

    .action-card-content {
        width: 220px;
    }

    .action-card-arrow {
        display: none;
    }
}

@media (max-width: 768px) {
    .action-card-content {
        width: 56px;
        padding: 8px;
    }

    .action-btn {
        padding: 8px;
        height: 36px;
    }

    .action-btn svg {
        width: 18px;
        height: 18px;
    }

    .action-card-title {
        font-size: 11px;
    }
}
</style>
