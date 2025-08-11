console.log('Loading gestures.js...');

/**
 * SwipeNavigator - Handles swipe gestures for activity navigation
 * Uses Hammer.js for reliable cross-platform gesture recognition
 */
class SwipeNavigator {
    constructor() {
        this.hammer = null;
        this.isEnabled = true;
        this.config = {
            threshold: 50,        // Minimum distance in pixels
            velocity: 0.3,        // Minimum velocity
            direction: 'horizontal' // Only horizontal swipes
        };
        this.init();
    }

    /**
     * Initialize the swipe navigator
     */
    init() {
        // Check if Hammer.js is available
        if (typeof Hammer === 'undefined') {
            console.warn('Hammer.js not available, swipe navigation disabled');
            return;
        }

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupGestures());
        } else {
            this.setupGestures();
        }
    }

    /**
     * Setup gesture recognition on the main content container
     */
    setupGestures() {
        const container = document.getElementById('lesson-content');
        if (!container) {
            console.warn('Lesson content container not found, swipe navigation disabled');
            return;
        }

        // Add CSS class for touch optimization
        container.classList.add('swipe-container');

        // Create Hammer instance
        this.hammer = new Hammer(container);

        // Configure swipe gesture - horizontal only
        this.hammer.get('swipe').set({
            direction: Hammer.DIRECTION_HORIZONTAL,
            threshold: this.config.threshold,
            velocity: this.config.velocity
        });

        // Attach event handlers
        this.hammer.on('swipeleft', (e) => this.handleSwipeLeft(e));
        this.hammer.on('swiperight', (e) => this.handleSwipeRight(e));

        console.log('✅ Swipe navigation initialized successfully');
    }

    /**
     * Handle swipe left gesture (next item within activity)
     */
    handleSwipeLeft(event) {
        console.log('👈 Swipe left detected');

        if (this.canNavigate()) {
            const currentActivity = this.getCurrentActivity();
            if (currentActivity) {
                this.navigateWithinActivity('next', currentActivity);
            }
        } else {
            console.log('❌ Cannot navigate - conditions not met');
        }
    }

    /**
     * Handle swipe right gesture (previous item within activity)
     */
    handleSwipeRight(event) {
        console.log('👉 Swipe right detected');

        if (this.canNavigate()) {
            const currentActivity = this.getCurrentActivity();
            if (currentActivity) {
                this.navigateWithinActivity('prev', currentActivity);
            }
        } else {
            console.log('❌ Cannot navigate - conditions not met');
        }
    }

    /**
     * Navigate within the current activity (words, questions, etc.)
     */
    navigateWithinActivity(direction, activity) {
        console.log(`🔄 Navigating ${direction} within ${activity.type} activity`);

        switch (activity.type) {
            case 'vocabulary':
                if (!this.handleVocabularySwipe(direction)) {
                    // If can't navigate within vocabulary, try to navigate between activities
                    this.handleActivityBoundarySwipe(direction);
                }
                break;
            case 'pronunciation':
                if (!this.handlePronunciationSwipe(direction)) {
                    // If can't navigate within pronunciation, try to navigate between activities
                    this.handleActivityBoundarySwipe(direction);
                }
                break;
            case 'quiz':
                if (!this.handleQuizSwipe(direction)) {
                    // If can't navigate within quiz, try to navigate between activities
                    this.handleActivityBoundarySwipe(direction);
                }
                break;
            case 'dialog':
            case 'warmup':
            case 'congratulations':
                // These activities don't have internal navigation, go directly to activity navigation
                console.log('ℹ️ Activity has no internal navigation, navigating between activities');
                this.handleActivityBoundarySwipe(direction);
                break;
            default:
                console.log('⚠️ Unknown activity type:', activity.type);
                this.handleActivityBoundarySwipe(direction);
        }
    }

    /**
     * Handle swipe between activities when at boundaries
     */
    handleActivityBoundarySwipe(direction) {
        if (direction === 'next') {
            if (this.canGoToNextActivity()) {
                console.log('🚀 Navigating to next activity');
                if (typeof nextActivity === 'function') {
                    nextActivity();
                } else {
                    console.warn('nextActivity function not found');
                }
            } else {
                console.log('❌ Cannot navigate to next activity');
            }
        } else {
            if (this.canGoToPrevActivity()) {
                console.log('🚀 Navigating to previous activity');
                if (typeof prevActivity === 'function') {
                    prevActivity();
                } else {
                    console.warn('prevActivity function not found');
                }
            } else {
                console.log('❌ Cannot navigate to previous activity');
            }
        }
    }

    /**
     * Check if can navigate to next activity
     */
    canGoToNextActivity() {
        if (typeof currentActivityIndex === 'undefined' || typeof learningActivities === 'undefined') {
            return false;
        }
        return currentActivityIndex < learningActivities.length - 1;
    }

    /**
     * Check if can navigate to previous activity
     */
    canGoToPrevActivity() {
        if (typeof currentActivityIndex === 'undefined') {
            return false;
        }
        return currentActivityIndex > 0;
    }

    /**
     * Handle swipe in vocabulary activity
     * @returns {boolean} true if navigation happened, false if at boundary
     */
    handleVocabularySwipe(direction) {
        if (direction === 'next') {
            if (this.canGoNextInVocabulary()) {
                if (typeof nextWord === 'function') {
                    console.log('📚 Swiping to next word');
                    nextWord();
                    return true;
                } else {
                    console.warn('nextWord function not found');
                    return false;
                }
            } else {
                console.log('📚 At last word in vocabulary');
                return false;
            }
        } else {
            if (this.canGoPrevInVocabulary()) {
                if (typeof prevWord === 'function') {
                    console.log('📚 Swiping to previous word');
                    prevWord();
                    return true;
                } else {
                    console.warn('prevWord function not found');
                    return false;
                }
            } else {
                console.log('📚 At first word in vocabulary');
                return false;
            }
        }
    }

    /**
     * Handle swipe in pronunciation activity
     * @returns {boolean} true if navigation happened, false if at boundary
     */
    handlePronunciationSwipe(direction) {
        if (direction === 'next') {
            if (this.canGoNextInPronunciation()) {
                if (typeof nextPronunciation === 'function') {
                    console.log('🎤 Swiping to next pronunciation');
                    nextPronunciation();
                    return true;
                } else {
                    console.warn('nextPronunciation function not found');
                    return false;
                }
            } else {
                console.log('🎤 At last word in pronunciation');
                return false;
            }
        } else {
            if (this.canGoPrevInPronunciation()) {
                if (typeof prevPronunciation === 'function') {
                    console.log('🎤 Swiping to previous pronunciation');
                    prevPronunciation();
                    return true;
                } else {
                    console.warn('prevPronunciation function not found');
                    return false;
                }
            } else {
                console.log('🎤 At first word in pronunciation');
                return false;
            }
        }
    }

    /**
     * Handle swipe in quiz activity
     */
    handleQuizSwipe(direction) {
        // For quiz, we might want to navigate between questions if it's multi-question
        if (typeof window.quizState !== 'undefined' && window.quizState.questions) {
            const totalQuestions = window.quizState.questions.length;
            const currentIndex = window.quizState.currentQuestionIndex;

            if (direction === 'next') {
                if (this.canGoNextInQuiz()) {
                    if (typeof nextQuizQuestion === 'function') {
                        console.log('❓ Swiping to next quiz question');
                        nextQuizQuestion();
                        return true;
                    } else {
                        console.log('ℹ️ Quiz navigation not implemented yet');
                        return false;
                    }
                } else {
                    console.log('❓ At last quiz question');
                    return false;
                }
            } else {
                if (this.canGoPrevInQuiz()) {
                    if (typeof prevQuizQuestion === 'function') {
                        console.log('❓ Swiping to previous quiz question');
                        prevQuizQuestion();
                        return true;
                    } else {
                        console.log('ℹ️ Quiz navigation not implemented yet');
                        return false;
                    }
                } else {
                    console.log('❓ At first quiz question');
                    return false;
                }
            }
        } else {
            console.log('ℹ️ Quiz - single question or state not available');
            return false;
        }
    }

    /**
     * Get current activity object
     */
    getCurrentActivity() {
        if (typeof currentActivityIndex === 'undefined' || typeof learningActivities === 'undefined') {
            console.warn('Activity state not available');
            return null;
        }

        return learningActivities[currentActivityIndex];
    }

    /**
     * Check if navigation is currently allowed
     */
    canNavigate() {
        // Check if swipe is globally enabled
        if (!this.isEnabled) {
            return false;
        }

        // Check if description modal is open
        if (typeof showingDescription !== 'undefined' && showingDescription) {
            return false;
        }

        // Check if audio is recording
        if (typeof isRecording !== 'undefined' && isRecording) {
            return false;
        }

        // Check if audio is playing
        if (typeof isPlaying !== 'undefined' && isPlaying) {
            return false;
        }

        // Check if any modal is visible
        const visibleModal = document.querySelector('.modal.visible, .modal.opacity-100');
        if (visibleModal) {
            return false;
        }

        // Check if pronunciation results modal is open
        const pronunciationModal = document.getElementById('pronunciation-results-modal');
        if (pronunciationModal && !pronunciationModal.classList.contains('opacity-0')) {
            return false;
        }

        // Check if description modal is open
        const descriptionModal = document.getElementById('description-modal');
        if (descriptionModal && !descriptionModal.classList.contains('opacity-0')) {
            return false;
        }

        return true;
    }

    /**
     * Check if can navigate to next item within current activity
     */
    canGoNext() {
        const activity = this.getCurrentActivity();
        if (!activity) return false;

        switch (activity.type) {
            case 'vocabulary':
                return this.canGoNextInVocabulary();
            case 'pronunciation':
                return this.canGoNextInPronunciation();
            case 'quiz':
                return this.canGoNextInQuiz();
            default:
                return false;
        }
    }

    /**
     * Check if can navigate to previous item within current activity
     */
    canGoPrev() {
        const activity = this.getCurrentActivity();
        if (!activity) return false;

        switch (activity.type) {
            case 'vocabulary':
                return this.canGoPrevInVocabulary();
            case 'pronunciation':
                return this.canGoPrevInPronunciation();
            case 'quiz':
                return this.canGoPrevInQuiz();
            default:
                return false;
        }
    }

    /**
     * Check navigation bounds for vocabulary activity
     */
    canGoNextInVocabulary() {
        const activity = this.getCurrentActivity();
        if (!activity || !activity.content || !activity.content.words) return false;

        const currentIndex = typeof currentWordIndex !== 'undefined' ? currentWordIndex : 0;
        return currentIndex < activity.content.words.length - 1;
    }

    canGoPrevInVocabulary() {
        const currentIndex = typeof currentWordIndex !== 'undefined' ? currentWordIndex : 0;
        return currentIndex > 0;
    }

    /**
     * Check navigation bounds for pronunciation activity
     */
    canGoNextInPronunciation() {
        const activity = this.getCurrentActivity();
        if (!activity || !activity.content || !activity.content.practice_words) return false;

        const currentIndex = typeof currentWordIndex !== 'undefined' ? currentWordIndex : 0;
        return currentIndex < activity.content.practice_words.length - 1;
    }

    canGoPrevInPronunciation() {
        const currentIndex = typeof currentWordIndex !== 'undefined' ? currentWordIndex : 0;
        return currentIndex > 0;
    }

    /**
     * Check navigation bounds for quiz activity
     */
    canGoNextInQuiz() {
        if (typeof window.quizState === 'undefined' || !window.quizState.questions) return false;

        const currentIndex = window.quizState.currentQuestionIndex || 0;
        return currentIndex < window.quizState.questions.length - 1;
    }

    canGoPrevInQuiz() {
        if (typeof window.quizState === 'undefined') return false;

        const currentIndex = window.quizState.currentQuestionIndex || 0;
        return currentIndex > 0;
    }

    /**
     * Enable swipe navigation
     */
    enable() {
        this.isEnabled = true;
        console.log('✅ Swipe navigation enabled');
    }

    /**
     * Disable swipe navigation
     */
    disable() {
        this.isEnabled = false;
        console.log('❌ Swipe navigation disabled');
    }

    /**
     * Destroy the swipe navigator and clean up resources
     */
    destroy() {
        if (this.hammer) {
            this.hammer.destroy();
            this.hammer = null;
            console.log('🧹 Swipe navigator destroyed');
        }
    }

    /**
     * Get current state for debugging
     */
    getState() {
        const activity = this.getCurrentActivity();
        return {
            isEnabled: this.isEnabled,
            hasHammer: !!this.hammer,
            canNavigate: this.canNavigate(),
            canGoNext: this.canGoNext(),
            canGoPrev: this.canGoPrev(),
            currentActivity: activity ? activity.type : 'unknown',
            currentActivityIndex: typeof currentActivityIndex !== 'undefined' ? currentActivityIndex : 'undefined',
            currentWordIndex: typeof currentWordIndex !== 'undefined' ? currentWordIndex : 'undefined',
            totalActivities: typeof learningActivities !== 'undefined' ? learningActivities.length : 'undefined',
            activityDetails: this.getActivityDetails(activity)
        };
    }

    /**
     * Get details about current activity for debugging
     */
    getActivityDetails(activity) {
        if (!activity) return null;

        switch (activity.type) {
            case 'vocabulary':
                const vocabWords = activity.content?.words?.length || 0;
                const currentVocabIndex = typeof currentWordIndex !== 'undefined' ? currentWordIndex : 0;
                return {
                    type: 'vocabulary',
                    totalWords: vocabWords,
                    currentWordIndex: currentVocabIndex,
                    progress: vocabWords > 0 ? `${currentVocabIndex + 1}/${vocabWords}` : '0/0'
                };

            case 'pronunciation':
                const pronWords = activity.content?.practice_words?.length || 0;
                const currentPronIndex = typeof currentWordIndex !== 'undefined' ? currentWordIndex : 0;
                return {
                    type: 'pronunciation',
                    totalWords: pronWords,
                    currentWordIndex: currentPronIndex,
                    progress: pronWords > 0 ? `${currentPronIndex + 1}/${pronWords}` : '0/0'
                };

            case 'quiz':
                const quizQuestions = window.quizState?.questions?.length || 0;
                const currentQuizIndex = window.quizState?.currentQuestionIndex || 0;
                return {
                    type: 'quiz',
                    totalQuestions: quizQuestions,
                    currentQuestionIndex: currentQuizIndex,
                    progress: quizQuestions > 0 ? `${currentQuizIndex + 1}/${quizQuestions}` : '0/0'
                };

            default:
                return {
                    type: activity.type,
                    hasInternalNavigation: false
                };
        }
    }
}

// Initialize swipe navigator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.swipeNavigator = new SwipeNavigator();

    // Add to global scope for debugging
    window.getSwipeState = () => window.swipeNavigator.getState();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwipeNavigator;
}