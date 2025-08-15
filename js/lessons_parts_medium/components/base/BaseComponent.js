/**
 * Base Component
 * Abstract base class for all lesson components
 */

window.BaseComponent = class BaseComponent {
    constructor(name, stateManager, uiManager, config) {
        this.name = name;
        this.stateManager = stateManager;
        this.uiManager = uiManager;
        this.config = config;
        this.data = null;
        this.state = null;
    }

    /**
     * Initialize component with data
     */
    init(data) {
        this.data = data;
        this.validateData(data);
        this.initializeState();
    }

    /**
     * Validate component data - to be implemented by subclasses
     */
    validateData(data) {
        throw new Error('validateData method must be implemented by subclass');
    }

    /**
     * Initialize component state - to be implemented by subclasses
     */
    initializeState() {
        throw new Error('initializeState method must be implemented by subclass');
    }

    /**
     * Render component - to be implemented by subclasses
     */
    render() {
        throw new Error('render method must be implemented by subclass');
    }

    /**
     * Handle component completion
     */
    complete() {
        console.log(`🎉 ${this.name} completed`);
        console.log('📊 Calling stateManager.completeComponent()');
        this.stateManager.completeComponent(this.name);
        console.log('🧹 Calling cleanup()');
        this.cleanup();
        console.log('✅ Component completion finished');
    }

    /**
     * Exit component
     */
    exit() {
        console.log(`🚪 Exiting ${this.name}`);
        this.cleanup();
        this.uiManager.showTreeView();
    }

    /**
     * Cleanup component state
     */
    cleanup() {
        this.stateManager.clearComponentState(this.name);
        this.state = null;
    }

    /**
     * Get component progress
     */
    getProgress() {
        const componentProgress = this.stateManager.get('componentProgress');
        return componentProgress[this.name] || { progress: 0, total: 0 };
    }

    /**
     * Update component progress
     */
    updateProgress(progress) {
        const componentProgress = { ...this.stateManager.get('componentProgress') };
        if (componentProgress[this.name]) {
            componentProgress[this.name].progress = progress;
        }
        this.stateManager.set('componentProgress', componentProgress);
    }

    /**
     * Create header with progress bar
     */
    createHeader(currentStep, totalSteps, subtitle = '') {
        const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
        const progressText = subtitle ? 
            `${currentStep} of ${totalSteps} • ${subtitle}` : 
            `${currentStep} of ${totalSteps}`;

        return `
            <div class="warmup-header">
                <button class="close-btn" onclick="window.mobileApp.exitComponent('${this.name}')">✕</button>
                <div class="${this.config.cssClasses.progress.container}">
                    <div class="${this.config.cssClasses.progress.bar}">
                        <div class="${this.config.cssClasses.progress.fill}" style="width: ${progress}%"></div>
                    </div>
                    <div class="${this.config.cssClasses.progress.text}">${progressText}</div>
                </div>
            </div>
        `;
    }

    /**
     * Create footer with navigation buttons
     */
    createFooter(showPrevious = false, nextText = 'Next', onNext = null, onPrevious = null) {
        const nextHandler = onNext || `window.mobileApp.nextStep('${this.name}')`;
        const prevHandler = onPrevious || `window.mobileApp.previousStep('${this.name}')`;

        return `
            <div class="warmup-footer">
                ${showPrevious ? 
                    `<button class="${this.config.cssClasses.button.secondary}" onclick="${prevHandler}">Previous</button>` :
                    '<div></div>'
                }
                <button class="${this.config.cssClasses.button.primary}" onclick="${nextHandler}">
                    ${nextText}
                </button>
            </div>
        `;
    }

    /**
     * Create multiple choice options
     */
    createMultipleChoiceOptions(options, onSelect, selectedValue = null, questionId = null) {
        return options.map(option => {
            const isSelected = selectedValue === option;
            const selectedClass = isSelected ? 'selected' : '';
            
            // Escape single quotes in the option string for the onclick attribute
            const escapedOption = String(option).replace(/'/g, "'" );

            const clickHandler = questionId ? `${onSelect}('${questionId}', '${escapedOption}')` : `${onSelect}('${escapedOption}')`;

            return `
                <label class="check-option ${selectedClass}" onclick="${clickHandler}">
                    <div class="option-content">
                        <div class="option-radio ${selectedClass}"></div>
                        <span class="option-text">${option}</span>
                    </div>
                </label>
            `;
        }).join('');
    }

    /**
     * Create text input
     */
    createTextInput(placeholder = '', value = '', maxLength = null) {
        const maxLengthAttr = maxLength ? `maxlength="${maxLength}"` : '';
        
        return `
            <textarea 
                class="text-input" 
                placeholder="${placeholder}" 
                ${maxLengthAttr}
                oninput="window.mobileApp.handleTextInput('${this.name}', this.value)"
            >${value}</textarea>
        `;
    }

    /**
     * Show inline feedback
     */
    showFeedback(isCorrect, message, element = null) {
        const feedbackClass = isCorrect ? 'correct' : 'incorrect';
        const feedbackIcon = isCorrect ? '✅' : '❌';
        
        const feedbackHTML = `
            <div class="inline-feedback ${feedbackClass}">
                <div class="feedback-icon">${feedbackIcon}</div>
                <div class="feedback-message">${message}</div>
            </div>
        `;
        
        if (element) {
            element.insertAdjacentHTML('afterend', feedbackHTML);
        }
        
        return feedbackHTML;
    }

    /**
     * Auto-advance after delay
     */
    autoAdvance(callback, delay = null) {
        const advanceDelay = delay || this.config.settings.autoAdvanceDelay;
        
        setTimeout(() => {
            if (typeof callback === 'function') {
                callback();
            }
        }, advanceDelay);
    }

    /**
     * Log component action
     */
    log(action, data = {}) {
        console.log(`📝 ${this.name} - ${action}:`, data);
    }
}

// Make available globally
window.BaseComponent = window.BaseComponent;