/**
 * UI Manager
 * Handles all DOM manipulations and rendering
 */

window.UIManager = class UIManager {
    constructor(stateManager, config) {
        this.stateManager = stateManager;
        this.config = config;
        this.container = null;
    }

    /**
     * Initialize UI Manager
     */
    init() {
        this.container = document.getElementById('screenContainer');
        if (!this.container) {
            throw new Error('Screen container not found');
        }
    }

    /**
     * Show loading screen
     */
    showLoading() {
        this.render(`
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                <div class="screen-content">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                    </div>
                    <div class="subtitle">${this.config.messages.loading}</div>
                </div>
            </div>
        `);
    }

    /**
     * Show error screen
     */
    showError(message) {
        this.render(`
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                <div class="screen-content">
                    <div class="emoji">⚠️</div>
                    <div class="title">Error</div>
                    <div class="subtitle">${message}</div>
                </div>
                <div class="screen-footer">
                    <button class="${this.config.cssClasses.button.primary}" onclick="location.reload()">
                        Reload Page
                    </button>
                </div>
            </div>
        `);
    }

    /**
     * Show tree view
     */
    showTreeView() {
        const lessonData = this.stateManager.get('lessonData');
        const componentProgress = this.stateManager.get('componentProgress');
        
        if (!lessonData) {
            this.showError('No lesson data available');
            return;
        }

        const components = Object.keys(lessonData.components);
        const orderedComponents = this.config.components.order.filter(comp => components.includes(comp));

        this.render(`
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                <div class="screen-content">
                    <!-- Compact Welcome Header -->
                    <div style="text-align: center; margin-bottom: 24px; padding-top: 16px;">
                        <div style="font-size: 24px; margin-bottom: 4px;">👋</div>
                        <div style="font-size: 20px; font-weight: 600; color: #1a1a1a;">Welcome!</div>
                    </div>
                    
                    <div class="lesson-tree">
                        ${this.renderTreeNodes(orderedComponents, componentProgress)}
                    </div>
                </div>
            </div>
        `);

        this.stateManager.set('currentScreen', 0);
    }

    /**
     * Render tree nodes
     */
    renderTreeNodes(components, componentProgress) {
        let treeHTML = '';

        this.config.treeView.levels.forEach((levelComponents, levelIndex) => {
            const availableComponents = levelComponents.filter(comp => components.includes(comp));
            if (availableComponents.length === 0) return;

            treeHTML += `
                <div class="tree-level">
                    ${levelIndex > 0 ? '<div class="tree-branch"></div>' : ''}
                    <div class="tree-nodes-row">
                        ${availableComponents.map(componentName => {
                const progress = componentProgress[componentName];
                const nodeClass = progress.completed ? 'completed' :
                    progress.unlocked ? 'available' : 'locked';

                const isNextUp = progress.unlocked && !progress.completed;
                const nodeSize = isNextUp ? 'tree-node-large' : '';

                return `
                                <div class="tree-node ${nodeClass} ${nodeSize}" 
                                     data-component="${componentName}"
                                     onclick="window.mobileApp.startComponent('${componentName}')">
                                    <div class="node-icon">${this.config.components.icons[componentName]}</div>
                                    <div class="node-label">${this.config.components.labels[componentName]}</div>
                                    <div class="node-progress">${progress.progress}/${progress.total}</div>
                                    ${progress.completed ? '<div class="node-status">✓</div>' : ''}
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        });

        return treeHTML;
    }

    /**
     * Show component completion screen
     */
    showComponentCompletion(componentName, stats = {}) {
        const completionConfigs = {
            warm_up: {
                title: 'Warm-up Complete!',
                subtitle: 'Great job! You\'ve completed the warm-up section.<br>Ready to explore the main lesson? Let\'s continue! 🎉',
                button: 'Continue',
                icon: '🔥',
                nextComponent: 'vocabulary'
            },
            vocabulary: {
                title: 'Vocabulary Complete!',
                subtitle: 'Excellent! You\'ve learned new words and practiced their usage.<br>Ready to move on to grammar? Let\'s continue! 📝',
                button: 'Continue to Grammar',
                icon: '📚',
                nextComponent: 'grammar'
            },
            grammar: {
                title: 'Grammar Complete!',
                subtitle: 'Excellent! You\'ve mastered the grammar rules.<br>Ready to practice reading comprehension? Let\'s continue! 📖',
                button: 'Continue to Reading',
                icon: '📝',
                nextComponent: 'reading'
            },
            reading: {
                title: 'Reading Complete!',
                subtitle: 'Well done! You\'ve understood the passage thoroughly.<br>Now let\'s practice speaking skills! 🎤',
                button: 'Continue to Speaking',
                icon: '📖',
                nextComponent: 'speaking'
            },
            speaking: {
                title: 'Speaking Complete!',
                subtitle: 'Fantastic! You\'ve expressed your thoughts confidently.<br>Finally, let\'s take the quiz to test your knowledge! 🏆',
                button: 'Continue to Quiz',
                icon: '🎤',
                nextComponent: 'quiz'
            },
            quiz: {
                title: 'Lesson Complete!',
                subtitle: 'Congratulations! You\'ve successfully completed the entire lesson.<br>Keep learning and exploring new topics! 🌟',
                button: 'Back to Home',
                icon: '🏆',
                nextComponent: null
            }
        };

        const config = completionConfigs[componentName] || completionConfigs.warm_up;
        
        this.render(`
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                <!-- Animated Background -->
                <div class="completion-bg">
                    <div class="floating-emoji">🎯</div>
                    <div class="floating-emoji">✨</div>
                    <div class="floating-emoji">🚀</div>
                    <div class="floating-emoji">💫</div>
                    <div class="floating-emoji">🌟</div>
                </div>

                <!-- Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; position: relative; z-index: 2;">
                    <!-- Main Icon with Animation -->
                    <div class="completion-icon-container">
                        <div class="completion-icon">${config.icon}</div>
                        <div class="completion-pulse"></div>
                    </div>

                    <!-- Title -->
                    <div class="completion-title">${config.title}</div>
                    
                    <!-- Subtitle -->
                    <div class="completion-subtitle">
                        ${config.subtitle}
                    </div>

                    <!-- Stats Display -->
                    ${this.renderCompletionStats(componentName, stats)}

                    <!-- Continue Button -->
                    <div style="margin-top: 40px;">
                        <button class="${this.config.cssClasses.button.primary} ${this.config.cssClasses.button.large} ${this.config.cssClasses.button.animated}" 
                                onclick="console.log('Button clicked!'); window.mobileApp.continueFromCompletion('${componentName}')"
                                style="width: 100%; max-width: 300px; padding: 18px 32px; font-size: 18px; font-weight: 600; border-radius: 16px; background: linear-gradient(45deg, #10b981, #059669); border: none; color: white; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); transition: all 0.3s ease;">
                            <span class="btn-text" style="margin-right: 8px;">${config.button}</span>
                            <span class="btn-icon" style="font-size: 20px;">🚀</span>
                        </button>
                    </div>
                </div>


            </div>

            ${this.getCompletionStyles()}
        `);
    }

    /**
     * Render completion stats
     */
    renderCompletionStats(componentName, stats) {
        if (!stats || Object.keys(stats).length === 0) return '';

        const statItems = [];

        // Component-specific stats
        switch (componentName) {
            case 'vocabulary':
                if (stats.wordsLearned) statItems.push({ label: 'Words Learned', value: stats.wordsLearned });
                if (stats.correctAnswers !== undefined) statItems.push({ label: 'Correct Answers', value: `${stats.correctAnswers}/${stats.totalChecks}` });
                if (stats.accuracy !== undefined) statItems.push({ label: 'Accuracy', value: `${stats.accuracy}%` });
                break;
            case 'grammar':
                if (stats.correctAnswers) statItems.push({ label: 'Correct Answers', value: `${stats.correctAnswers}/${stats.totalQuestions}` });
                if (stats.accuracy) statItems.push({ label: 'Accuracy', value: `${stats.accuracy}%` });
                break;
            case 'reading':
                if (stats.correctAnswers) statItems.push({ label: 'Correct Answers', value: `${stats.correctAnswers}/${stats.totalQuestions}` });
                if (stats.comprehensionScore) statItems.push({ label: 'Comprehension Score', value: `${stats.comprehensionScore}%` });
                break;
            case 'speaking':
                if (stats.tasksCompleted) statItems.push({ label: 'Tasks Completed', value: stats.tasksCompleted });
                if (stats.recordingTime) statItems.push({ label: 'Speaking Time', value: stats.recordingTime });
                break;
            case 'quiz':
                if (stats.score) statItems.push({ label: 'Final Score', value: `${stats.score}%` });
                if (stats.correctAnswers) statItems.push({ label: 'Correct Answers', value: `${stats.correctAnswers}/${stats.totalQuestions}` });
                if (stats.points) statItems.push({ label: 'Points Earned', value: `${stats.points}/${stats.totalPoints}` });
                break;
        }

        if (statItems.length === 0) return '';

        return `
            <div class="completion-stats">
                ${statItems.map(stat => `
                    <div class="stat-item">
                        <div class="stat-value">${stat.value}</div>
                        <div class="stat-label">${stat.label}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }



    /**
     * Show warmup completion screen (legacy method)
     */
    showWarmupCompletion() {
        this.showComponentCompletion('warm_up');
    }

    /**
     * Show vocabulary completion screen
     */
    showVocabularyCompletion(stats = {}) {
        this.showComponentCompletion('vocabulary', stats);
    }

    /**
     * Show grammar completion screen
     */
    showGrammarCompletion(stats = {}) {
        this.showComponentCompletion('grammar', stats);
    }

    /**
     * Show reading completion screen
     */
    showReadingCompletion(stats = {}) {
        this.showComponentCompletion('reading', stats);
    }

    /**
     * Show speaking completion screen
     */
    showSpeakingCompletion(stats = {}) {
        this.showComponentCompletion('speaking', stats);
    }

    /**
     * Show quiz completion screen
     */
    showQuizCompletion(stats = {}) {
        this.showComponentCompletion('quiz', stats);
    }


    /**
     * Get completion styles
     */
    getCompletionStyles() {
        return `
            <style>
                /* Component Completion Styles */
                .completion-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: ${this.config.ui.colors.background};
                    overflow: hidden;
                    z-index: 1;
                }

                .floating-emoji {
                    position: absolute;
                    font-size: 24px;
                    animation: float ${this.config.ui.animations.floatDuration}ms ease-in-out infinite;
                    opacity: 0.7;
                }

                .floating-emoji:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
                .floating-emoji:nth-child(2) { top: 30%; right: 15%; animation-delay: 0.5s; }
                .floating-emoji:nth-child(3) { top: 60%; left: 20%; animation-delay: 1s; }
                .floating-emoji:nth-child(4) { top: 70%; right: 25%; animation-delay: 1.5s; }
                .floating-emoji:nth-child(5) { top: 45%; left: 50%; animation-delay: 2s; }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }

                .completion-icon-container {
                    position: relative;
                    margin-bottom: 32px;
                }

                .completion-icon {
                    font-size: 80px;
                    animation: bounce ${this.config.ui.animations.bounceDuration}ms ease-in-out infinite;
                    position: relative;
                    z-index: 2;
                }

                .completion-pulse {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 120px;
                    height: 120px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    animation: pulse ${this.config.ui.animations.pulseDuration}ms ease-in-out infinite;
                }

                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                }

                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
                }

                .completion-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 16px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }

                .completion-subtitle {
                    font-size: 18px;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.5;
                    margin-bottom: 40px;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                }

                /* Completion Stats */
                .completion-stats {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    margin: 32px 0;
                    flex-wrap: wrap;
                }

                .stat-item {
                    text-align: center;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 16px;
                    border-radius: 12px;
                    min-width: 80px;
                }

                .stat-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 4px;
                }

                .stat-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }



                /* Button Animations */
                .btn-large {
                    padding: 18px 32px;
                    font-size: 18px;
                    font-weight: 600;
                    border-radius: 16px;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                }

                .btn-animated {
                    background: linear-gradient(45deg, #10b981, #059669);
                    border: none;
                    color: white;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                    transition: all 0.3s ease;
                }

                .btn-animated:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
                }

                .btn-animated:active {
                    transform: translateY(0);
                }

                .btn-text {
                    margin-right: 8px;
                }

                .btn-icon {
                    font-size: 20px;
                    animation: rocket 1.5s ease-in-out infinite;
                }

                @keyframes rocket {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(3px); }
                }

                /* Responsive adjustments */
                @media (max-width: ${this.config.ui.breakpoints.mobile}px) {
                    .completion-title { font-size: 28px; }
                    .completion-subtitle { font-size: 16px; }
                    
                    .completion-stats {
                        gap: 16px;
                        margin: 24px 0;
                    }
                    
                    .stat-item {
                        min-width: 70px;
                        padding: 12px;
                    }
                    
                    .stat-value {
                        font-size: 20px;
                    }
                    
                    .completion-progress-indicator {
                        gap: 8px;
                    }
                    
                    .progress-step {
                        min-width: 60px;
                        padding: 8px;
                    }
                    
                    .step-icon {
                        font-size: 20px;
                    }
                    
                    .step-label {
                        font-size: 11px;
                    }
                }
            </style>
        `;
    }

    /**
     * Render content to container
     */
    render(html) {
        if (this.container) {
            // Check if styles are already added
            if (!document.getElementById('mobile-app-styles')) {
                const styleElement = document.createElement('style');
                styleElement.id = 'mobile-app-styles';
                styleElement.innerHTML = this.getBaseStylesContent();
                document.head.appendChild(styleElement);
            }
            this.container.innerHTML = html;
        }
    }

    /**
     * Get base styles content (without <style> tags)
     */
    getBaseStylesContent() {
        return `
            /* Question Styles */
            .question-container {
                max-width: 100%;
                margin: 0 auto;
            }

            .question-text {
                font-size: 22px;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 24px;
                line-height: 1.4;
                text-align: center;
            }

            .question-input {
                margin-top: 20px;
            }

            .text-input {
                width: 100%;
                min-height: 120px;
                padding: 16px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 16px;
                font-family: inherit;
                resize: vertical;
                background: #f9fafb;
                transition: all 0.3s ease;
            }

            .text-input:focus {
                outline: none;
                border-color: #3b82f6;
                background: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .text-input::placeholder {
                color: #9ca3af;
                font-style: italic;
            }

            /* Question Options */
            .question-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 20px;
            }

            .check-option, .grammar-option, .reading-option, .quiz-option {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 0;
                cursor: pointer;
                transition: all 0.3s ease;
                overflow: hidden;
            }

            .check-option:hover, .grammar-option:hover, .reading-option:hover, .quiz-option:hover {
                border-color: #3b82f6;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
            }

            .option-content {
                display: flex;
                align-items: center;
                padding: 16px;
                gap: 12px;
                position: relative;
            }

            .option-radio {
                width: 20px;
                height: 20px;
                border: 2px solid #d1d5db;
                border-radius: 50%;
                background: white;
                position: relative;
                flex-shrink: 0;
                transition: all 0.3s ease;
            }

            .option-radio.selected {
                border-color: #3b82f6;
                background: #3b82f6;
            }

            .option-radio.selected::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                transform: translate(-50%, -50%);
            }

            .option-radio.correct {
                border-color: #10b981;
                background: #10b981;
            }

            .option-text {
                flex: 1;
                font-size: 16px;
                color: #374151;
                line-height: 1.5;
            }

            .correct-indicator, .incorrect-indicator {
                font-size: 18px;
                font-weight: bold;
                margin-left: auto;
            }

            .correct-indicator {
                color: #10b981;
            }

            .incorrect-indicator {
                color: #ef4444;
            }

            /* Feedback Styles */
            .inline-feedback {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-top: 20px;
                padding: 16px;
                border-radius: 12px;
                font-size: 16px;
                line-height: 1.5;
            }

            .inline-feedback.correct {
                background: #dcfce7;
                border: 1px solid #10b981;
                color: #065f46;
            }

            .inline-feedback.incorrect {
                background: #fef2f2;
                border: 1px solid #ef4444;
                color: #991b1b;
            }

            .feedback-icon {
                font-size: 20px;
                flex-shrink: 0;
            }

            .feedback-message {
                flex: 1;
            }

            /* Button Styles */
            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .btn-primary {
                background: #3b82f6;
                color: white;
            }

            .btn-primary:hover {
                background: #2563eb;
                transform: translateY(-1px);
            }

            .btn-primary:disabled {
                background: #9ca3af;
                cursor: not-allowed;
                transform: none;
            }

            .btn-secondary {
                background: #6b7280;
                color: white;
            }

            .btn-secondary:hover {
                background: #4b5563;
                transform: translateY(-1px);
            }

            /* Header Styles */
            .warmup-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 24px;
                background: white;
                border-bottom: 1px solid #e5e7eb;
                position: sticky;
                top: 0;
                z-index: 10;
            }

            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.3s ease;
            }

            .close-btn:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .progress-container {
                flex: 1;
                margin: 0 20px;
            }

            .progress-bar {
                width: 100%;
                height: 6px;
                background: #e5e7eb;
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 8px;
            }

            .progress-fill {
                height: 100%;
                background: #3b82f6;
                border-radius: 3px;
                transition: width 0.3s ease;
            }

            .progress-text {
                font-size: 14px;
                color: #6b7280;
                text-align: center;
                font-weight: 500;
            }

            /* Footer Styles */
            .warmup-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                background: white;
                border-top: 1px solid #e5e7eb;
                gap: 16px;
            }

            /* Responsive */
            @media (max-width: 480px) {
                .question-text {
                    font-size: 20px;
                }
                
                .text-input {
                    min-height: 100px;
                    font-size: 16px;
                }
                
                .option-content {
                    padding: 14px;
                }
                
                .option-text {
                    font-size: 15px;
                }
            }
        `;
    }



    /**
     * Create DOM element programmatically
     */
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    /**
     * Add event listener with delegation
     */
    addEventDelegate(selector, event, handler) {
        if (this.container) {
            this.container.addEventListener(event, (e) => {
                if (e.target.matches(selector)) {
                    handler(e);
                }
            });
        }
    }
}

// Make available globally
window.UIManager = window.UIManager;
console.log('✅ UIManager loaded:', typeof window.UIManager);