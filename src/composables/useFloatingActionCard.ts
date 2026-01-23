import { ref, onMounted, onUnmounted, computed } from 'vue';

interface ActiveCard {
    id: string;
    element: HTMLElement | null;
    position: 'above' | 'active' | 'below';
}

export function useFloatingActionCard() {
    const activeCard = ref<ActiveCard>({
        id: '',
        element: null,
        position: 'above'
    });

    const floatingCardPosition = ref({ top: 0, left: 0 });
    const isVisible = computed(() => activeCard.value.position === 'active');

    let intersectionObserver: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let scrollHandler: (() => void) | null = null;
    let animationFrameId: number | null = null;

    /**
     * Calculate the position of the floating card based on the active card element
     * Positions it fixed in the viewport, tracking the active question
     */
    const updateFloatingCardPosition = () => {
        if (!activeCard.value.element) return;

        // Get the question card's position in the VIEWPORT
        const rect = activeCard.value.element.getBoundingClientRect();

        // Calculate viewport-relative position (for fixed positioning)
        // Position vertically aligned with the center of the active card
        let yPosition = rect.top + rect.height / 2 - 60; // Center vertically (60px is half approximate card height)

        // Keep it within viewport bounds (not too high, not too low)
        yPosition = Math.max(20, Math.min(yPosition, window.innerHeight - 180));

        // Position to the right of the card
        const gapFromCard = 20;
        let xPosition = rect.right + gapFromCard;

        // Keep within viewport horizontally
        xPosition = Math.max(20, Math.min(xPosition, window.innerWidth - 100));

        floatingCardPosition.value = {
            top: yPosition,
            left: xPosition
        };
    };

    /**
     * Setup IntersectionObserver to track visible cards
     */
    const setupIntersectionObserver = () => {
        // Get all question cards
        const questionCards = document.querySelectorAll('.question-card');

        const observerOptions: IntersectionObserverInit = {
            root: null,
            rootMargin: '-50px 0px -50px 0px', // Trigger when card is in the middle of viewport
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };

        intersectionObserver = new IntersectionObserver((entries) => {
            // Find the most visible card
            let mostVisibleEntry = entries[0];
            let maxVisibility = 0;

            entries.forEach((entry) => {
                const visibility =
                    entry.intersectionRatio * (entry.isIntersecting ? 1 : 0);

                if (visibility > maxVisibility) {
                    maxVisibility = visibility;
                    mostVisibleEntry = entry;
                }
            });

            if (mostVisibleEntry && mostVisibleEntry.isIntersecting && maxVisibility > 0) {
                const cardElement = mostVisibleEntry.target as HTMLElement;
                const questionIdElement = cardElement.querySelector('.question-number');
                const questionId = questionIdElement?.textContent || '';

                activeCard.value = {
                    id: questionId,
                    element: cardElement,
                    position: 'active'
                };

                updateFloatingCardPosition();
            }
        }, observerOptions);

        // Observe all question cards
        questionCards.forEach((card) => {
            intersectionObserver?.observe(card);
        });
    };

    /**
     * Setup mutation observer to detect when new cards are added/removed
     */
    const setupMutationObserver = () => {
        const questionsWrapper = document.querySelector('.questions-wrapper');
        if (!questionsWrapper) return;

        mutationObserver = new MutationObserver(() => {
            // Disconnect and re-setup intersection observer
            if (intersectionObserver) {
                intersectionObserver.disconnect();
            }
            setupIntersectionObserver();
        });

        mutationObserver.observe(questionsWrapper, {
            childList: true,
            subtree: true
        });
    };

    /**
     * Setup ResizeObserver to handle window/card size changes
     */
    const setupResizeObserver = () => {
        if (!activeCard.value.element) return;

        resizeObserver = new ResizeObserver(() => {
            updateFloatingCardPosition();
        });

        resizeObserver.observe(activeCard.value.element);

        // Also observe the viewport (through document.documentElement)
        resizeObserver.observe(document.documentElement);
    };

    /**
     * Setup scroll listener for smooth position updates
     */
    const setupScrollListener = () => {
        scrollHandler = () => {
            // Use requestAnimationFrame for smooth 60fps updates without blocking scroll
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(() => {
                updateFloatingCardPosition();
            });
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
    };

    /**
     * Initialize all observers
     */
    const initializeObservers = () => {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setupIntersectionObserver();
                setupMutationObserver();
                setupScrollListener();
                setupResizeObserver();
            });
        } else {
            setupIntersectionObserver();
            setupMutationObserver();
            setupScrollListener();
            setupResizeObserver();
        }
    };

    /**
     * Cleanup all observers
     */
    const cleanup = () => {
        if (intersectionObserver) {
            intersectionObserver.disconnect();
            intersectionObserver = null;
        }

        if (mutationObserver) {
            mutationObserver.disconnect();
            mutationObserver = null;
        }

        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }

        if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
            scrollHandler = null;
        }

        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    };

    onMounted(() => {
        initializeObservers();
    });

    onUnmounted(() => {
        cleanup();
    });

    return {
        activeCard: computed(() => activeCard.value),
        floatingCardPosition: computed(() => floatingCardPosition.value),
        isVisible,
        updateFloatingCardPosition
    };
}
