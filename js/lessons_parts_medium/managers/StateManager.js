/**
 * State Manager
 * Centralized state management for the Mobile Lesson App
 */

window.StateManager = class StateManager {
    constructor() {
        this.state = {
            // App State
            lessonData: null,
            currentScreen: 0, // 0 = tree view
            screens: [],
            screenHistory: [],
            
            // Component Progress
            componentProgress: {},
            
            // Component-specific states
            warmupState: null,
            vocabularyState: null,
            grammarState: null,
            readingState: null,
            speakingState: null,
            quizState: null
        };
        
        this.listeners = new Map();
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Get specific state property
     */
    get(key) {
        return this.state[key];
    }

    /**
     * Set state property and notify listeners
     */
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        this.notifyListeners(key, value, oldValue);
    }

    /**
     * Update multiple state properties
     */
    update(updates) {
        const changes = {};
        
        Object.keys(updates).forEach(key => {
            const oldValue = this.state[key];
            this.state[key] = updates[key];
            changes[key] = { newValue: updates[key], oldValue };
        });
        
        // Notify listeners for each change
        Object.keys(changes).forEach(key => {
            this.notifyListeners(key, changes[key].newValue, changes[key].oldValue);
        });
    }

    /**
     * Initialize component progress
     */
    initializeComponentProgress(lessonData, debugMode = false) {
        const componentProgress = {};
        
        Object.keys(lessonData.components).forEach(componentName => {
            const totalSteps = this.getComponentTotalSteps(componentName, lessonData);
            componentProgress[componentName] = {
                unlocked: debugMode || componentName === 'warm_up',
                completed: false,
                progress: 0,
                total: totalSteps
            };
        });
        
        this.set('componentProgress', componentProgress);
    }

    /**
     * Get total steps for a component
     */
    getComponentTotalSteps(componentName, lessonData) {
        const componentData = lessonData.components[componentName];
        if (!componentData) return 0;

        switch(componentName) {
            case 'warm_up':
                return componentData.questions?.length || 0;
            case 'vocabulary':
                return componentData.vocabulary_items?.length || 0;
            case 'grammar':
                return componentData.mini_practice?.length || 0;
            case 'reading':
                return componentData.comprehension_checks?.length || 0;
            case 'speaking':
                return componentData.tasks?.length || 0;
            case 'quiz':
                return componentData.questions?.length || 0;
            default:
                return 3; // Fallback for unknown components
        }
    }

    /**
     * Complete a component
     */
    completeComponent(componentName) {
        const componentProgress = { ...this.state.componentProgress };
        
        if (componentProgress[componentName]) {
            componentProgress[componentName].completed = true;
            componentProgress[componentName].progress = componentProgress[componentName].total;
        }
        
        // Unlock next component
        this.unlockNextComponent(componentName, componentProgress);
        
        this.set('componentProgress', componentProgress);
    }

    /**
     * Unlock next component in sequence
     */
    unlockNextComponent(completedComponent, componentProgress) {
        const componentOrder = ['warm_up', 'vocabulary', 'grammar', 'reading', 'speaking', 'quiz'];
        const currentIndex = componentOrder.indexOf(completedComponent);
        
        if (currentIndex >= 0 && currentIndex < componentOrder.length - 1) {
            const nextComponent = componentOrder[currentIndex + 1];
            if (componentProgress[nextComponent]) {
                componentProgress[nextComponent].unlocked = true;
            }
        }
    }

    /**
     * Set component state
     */
    setComponentState(componentName, state) {
        const stateKey = `${componentName}State`;
        this.set(stateKey, state);
    }

    /**
     * Get component state
     */
    getComponentState(componentName) {
        const stateKey = `${componentName}State`;
        return this.get(stateKey);
    }

    /**
     * Clear component state
     */
    clearComponentState(componentName) {
        const stateKey = `${componentName}State`;
        this.set(stateKey, null);
    }

    /**
     * Add state change listener
     */
    addListener(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }

    /**
     * Remove state change listener
     */
    removeListener(key, callback) {
        if (this.listeners.has(key)) {
            const callbacks = this.listeners.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Notify listeners of state changes
     */
    notifyListeners(key, newValue, oldValue) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    console.error(`Error in state listener for ${key}:`, error);
                }
            });
        }
    }

    /**
     * Reset all state
     */
    reset() {
        this.state = {
            lessonData: null,
            currentScreen: 0,
            screens: [],
            screenHistory: [],
            componentProgress: {},
            warmupState: null,
            vocabularyState: null,
            grammarState: null,
            readingState: null,
            speakingState: null,
            quizState: null
        };
    }
}

// Make available globally
window.StateManager = window.StateManager;
console.log('✅ StateManager loaded:', typeof window.StateManager);