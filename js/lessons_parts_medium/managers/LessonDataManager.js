/**
 * Lesson Data Manager
 * Handles fetching, processing, and validating lesson data
 */

window.LessonDataManager = class LessonDataManager {
    constructor(stateManager, config) {
        this.stateManager = stateManager;
        this.config = config;
    }

    /**
     * Wait for lesson data to be provided via onUpdate
     */
    async waitForLessonData() {
        return new Promise((resolve, reject) => {
            // Check if lesson data is already available
            if (window.lessonDataReady) {
                this.handleLessonData(window.lessonDataReady)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            // Wait for onUpdate to provide data
            const checkInterval = setInterval(() => {
                if (window.lessonDataReady) {
                    clearInterval(checkInterval);
                    this.handleLessonData(window.lessonDataReady)
                        .then(resolve)
                        .catch(reject);
                }
            }, this.config.settings.checkInterval);

            // Timeout after configured time
            setTimeout(() => {
                clearInterval(checkInterval);
                if (!this.stateManager.get('lessonData')) {
                    reject(new Error(this.config.messages.error.dataNotAvailable));
                }
            }, this.config.settings.dataTimeout);
        });
    }

    /**
     * Handle lesson data when received
     */
    async handleLessonData(data) {
        try {
            console.log('📊 Lesson data received:', data);
            
            // Validate data
            this.validateLessonData(data);
            
            // Process and store data
            this.stateManager.set('lessonData', data);
            
            // Initialize component progress
            this.stateManager.initializeComponentProgress(data, this.config.settings.debugMode);
            
            console.log('✅ Lesson data processed successfully');
            return data;
            
        } catch (error) {
            console.error('❌ Error processing lesson data:', error);
            throw error;
        }
    }

    /**
     * Validate lesson data structure
     */
    validateLessonData(data) {
        if (!data) {
            throw new Error('Lesson data is null or undefined');
        }

        if (!data.components || typeof data.components !== 'object') {
            throw new Error('Invalid lesson data: components property is missing or invalid');
        }

        const components = Object.keys(data.components);
        if (components.length === 0) {
            throw new Error('Invalid lesson data: no components found');
        }

        // Validate each component
        components.forEach(componentName => {
            this.validateComponent(componentName, data.components[componentName]);
        });
    }

    /**
     * Validate individual component data
     */
    validateComponent(componentName, componentData) {
        if (!componentData || typeof componentData !== 'object') {
            throw new Error(`Invalid component data for ${componentName}`);
        }

        switch (componentName) {
            case 'warm_up':
                this.validateWarmUpComponent(componentData);
                break;
            case 'vocabulary':
                this.validateVocabularyComponent(componentData);
                break;
            case 'grammar':
                this.validateGrammarComponent(componentData);
                break;
            case 'reading':
                this.validateReadingComponent(componentData);
                break;
            case 'speaking':
                this.validateSpeakingComponent(componentData);
                break;
            case 'quiz':
                this.validateQuizComponent(componentData);
                break;
            default:
                console.warn(`Unknown component type: ${componentName}`);
        }
    }

    /**
     * Validate warm-up component
     */
    validateWarmUpComponent(data) {
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('Warm-up component must have questions array');
        }

        if (data.questions.length === 0) {
            throw new Error('Warm-up component must have at least one question');
        }
    }

    /**
     * Validate vocabulary component
     */
    validateVocabularyComponent(data) {
        if (!data.vocabulary_items || !Array.isArray(data.vocabulary_items)) {
            throw new Error('Vocabulary component must have vocabulary_items array');
        }

        if (data.vocabulary_items.length === 0) {
            throw new Error('Vocabulary component must have at least one vocabulary item');
        }
    }

    /**
     * Validate grammar component
     */
    validateGrammarComponent(data) {
        if (!data.mini_practice || !Array.isArray(data.mini_practice)) {
            throw new Error('Grammar component must have mini_practice array');
        }

        if (!data.explanation) {
            throw new Error('Grammar component must have explanation');
        }
    }

    /**
     * Validate reading component
     */
    validateReadingComponent(data) {
        if (!data.passage) {
            throw new Error('Reading component must have passage');
        }

        if (!data.comprehension_checks || !Array.isArray(data.comprehension_checks)) {
            throw new Error('Reading component must have comprehension_checks array');
        }
    }

    /**
     * Validate speaking component
     */
    validateSpeakingComponent(data) {
        if (!data.speaking_tasks || !Array.isArray(data.speaking_tasks)) {
            throw new Error('Speaking component must have speaking_tasks array');
        }
    }

    /**
     * Validate quiz component
     */
    validateQuizComponent(data) {
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('Quiz component must have questions array');
        }

        if (data.questions.length === 0) {
            throw new Error('Quiz component must have at least one question');
        }
    }

    /**
     * Load test data from JSON file (for development)
     */
    async loadTestData() {
        try {
            const response = await fetch('data/lesson-data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch lesson data');
            }
            const data = await response.json();
            return await this.handleLessonData(data);
        } catch (error) {
            console.error('Failed to load test data:', error);
            throw new Error('Could not load lesson data from file');
        }
    }

    /**
     * Get component data
     */
    getComponentData(componentName) {
        const lessonData = this.stateManager.get('lessonData');
        return lessonData?.components?.[componentName] || null;
    }

    /**
     * Check if component exists
     */
    hasComponent(componentName) {
        const lessonData = this.stateManager.get('lessonData');
        return !!(lessonData?.components?.[componentName]);
    }

    /**
     * Get available components
     */
    getAvailableComponents() {
        const lessonData = this.stateManager.get('lessonData');
        return lessonData ? Object.keys(lessonData.components) : [];
    }
}

// Make available globally
window.LessonDataManager = window.LessonDataManager;
console.log('✅ LessonDataManager loaded:', typeof window.LessonDataManager);