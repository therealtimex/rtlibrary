/**
 * Grammar Component
 * Handles the grammar section of the lesson
 */

window.Grammar = class Grammar extends window.BaseComponent {
    constructor(stateManager, uiManager, config) {
        super('grammar', stateManager, uiManager, config);
    }

    /**
     * Validate grammar data
     */
    validateData(data) {
        if (!data.mini_practice || !Array.isArray(data.mini_practice)) {
            throw new Error('Grammar component must have mini_practice array');
        }

        if (!data.explanation) {
            throw new Error('Grammar component must have explanation');
        }
    }

    /**
     * Initialize grammar state
     */
    initializeState() {
        this.state = {
            currentStep: 'explanation', // 'explanation' or 'practice'
            currentQuestion: 0,
            totalQuestions: this.data.mini_practice.length,
            answers: {},
            correctAnswers: 0,
            data: this.data
        };
        
        this.stateManager.setComponentState(this.name, this.state);
    }

    /**
     * Render grammar component
     */
    render() {
        return this.renderStep();
    }

    /**
     * Render current step
     */
    renderStep() {
        const { currentStep } = this.state;

        if (currentStep === 'explanation') {
            return this.renderExplanation();
        } else if (currentStep === 'practice') {
            return this.renderPractice();
        }
    }

    /**
     * Render explanation step
     */
    renderExplanation() {
        const explanation = this.data.explanation;

        return `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                <!-- Header with close -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="window.mobileApp.exitComponent('${this.name}')">✕</button>
                    <div class="${this.config.cssClasses.progress.container}">
                        <div class="${this.config.cssClasses.progress.text}">Grammar Rules</div>
                    </div>
                </div>

                <!-- Explanation Content -->
                <div class="screen-content" style="padding: 16px; flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;">
                    <div class="grammar-explanation">
                        <div class="explanation-title" style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px; text-align: center;">${this.data.description || this.data.topic || 'Grammar Rules'}</div>
                        
                        <div class="explanation-cards" style="display: flex; flex-direction: column; gap: 16px;">
                            ${explanation.cards ? explanation.cards.map(card => `
                                <div class="explanation-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div class="card-title" style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">${card.title}</div>
                                    <div class="card-rule" style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 10px;">${card.rule}</div>
                                    <div class="card-example" style="font-style: italic; color: #6b7280; background: #f9fafb; padding: 8px 12px; border-left: 3px solid #3b82f6; margin-bottom: 10px; border-radius: 4px;">"${card.example}"</div>
                                    ${card.keywords ? `
                                        <div class="card-keywords">
                                            <div class="keywords-label" style="font-size: 12px; color: #6b7280; margin-bottom: 6px; font-weight: 500;">Key words:</div>
                                            <div class="keywords-list" style="display: flex; flex-wrap: wrap; gap: 6px;">
                                                ${card.keywords.map(keyword => `
                                                    <span class="keyword-tag" style="background: #dbeafe; color: #1d4ed8; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">${keyword}</span>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('') : `
                                <div class="explanation-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <div class="card-rule" style="font-size: 14px; color: #4b5563; line-height: 1.6;">${explanation}</div>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    <div></div>
                    <button class="${this.config.cssClasses.button.primary}" onclick="window.mobileApp.startGrammarPractice()">
                        Start Practice
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render practice step
     */
    renderPractice() {
        const { currentQuestion, totalQuestions } = this.state;
        const question = this.data.mini_practice[currentQuestion];
        const progress = ((currentQuestion + 1) / totalQuestions) * 100;

        return `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                ${this.createHeader(currentQuestion + 1, totalQuestions)}

                <!-- Question Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="grammar-question">
                        <div class="question-title">${question.question || question.prompt}</div>
                        
                        <div class="question-options">
                            ${question.options.map(option => {
                                return `
                                    <label class="grammar-option" onclick="window.mobileApp.selectGrammarAnswer('${question.id}', '${option}', '${question.correct}')">
                                        <div class="option-content">
                                            <div class="option-radio"></div>
                                            <span class="option-text">${option}</span>
                                        </div>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                ${this.createFooter(
                    currentQuestion > 0,
                    'Continue',
                    null,
                    `window.mobileApp.previousGrammarQuestion()`
                )}
            </div>
        `;
    }

    /**
     * Start practice
     */
    startPractice() {
        this.state.currentStep = 'practice';
        this.stateManager.setComponentState(this.name, this.state);
        this.uiManager.render(this.render());
    }

    /**
     * Back to explanation
     */
    backToExplanation() {
        this.state.currentStep = 'explanation';
        this.stateManager.setComponentState(this.name, this.state);
        this.uiManager.render(this.render());
    }

    /**
     * Select grammar answer
     */
    selectGrammarAnswer(questionId, selectedAnswer, correctAnswer) {
        const isCorrect = selectedAnswer === correctAnswer;
        this.state.answers[questionId] = selectedAnswer;

        if (isCorrect) {
            this.state.correctAnswers++;
        }

        this.stateManager.setComponentState(this.name, this.state);

        // Show feedback
        const { currentQuestion } = this.state;
        const question = this.data.mini_practice[currentQuestion];
        const feedbackMessage = isCorrect ? 
            'Great job!' : 
            question.explanation || `The correct answer is "${correctAnswer}"`;

        this.showGrammarFeedback(questionId, selectedAnswer, correctAnswer, isCorrect, feedbackMessage);
    }

    /**
     * Show grammar feedback
     */
    showGrammarFeedback(questionId, selectedAnswer, correctAnswer, isCorrect, message) {
        const { currentQuestion, totalQuestions } = this.state;
        const question = this.data.mini_practice[currentQuestion];
        const progress = ((currentQuestion + 1) / totalQuestions) * 100;

        const feedbackHTML = `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                ${this.createHeader(currentQuestion + 1, totalQuestions, isCorrect ? 'Correct!' : 'Try again')}

                <!-- Question with Feedback -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="grammar-question">
                        <div class="question-title">${question.question || question.prompt}</div>
                        
                        <div class="question-options">
                            ${question.options.map(option => {
                                let optionClass = 'grammar-option';
                                let optionStyle = '';

                                if (option === selectedAnswer) {
                                    if (isCorrect) {
                                        optionClass += ' correct-answer';
                                        optionStyle = 'border-color: #10b981; background: #dcfce7;';
                                    } else {
                                        optionClass += ' incorrect-answer';
                                        optionStyle = 'border-color: #ef4444; background: #fef2f2;';
                                    }
                                } else if (option === correctAnswer && !isCorrect) {
                                    optionClass += ' correct-answer';
                                    optionStyle = 'border-color: #10b981; background: #dcfce7;';
                                }

                                return `
                                    <div class="${optionClass}">
                                        <div class="option-content" style="${optionStyle}">
                                            <div class="option-radio ${option === selectedAnswer ? 'selected' : ''} ${option === correctAnswer ? 'correct' : ''}"></div>
                                            <span class="option-text">${option}</span>
                                            ${option === correctAnswer ? '<span class="correct-indicator">✓</span>' : ''}
                                            ${option === selectedAnswer && !isCorrect ? '<span class="incorrect-indicator">✗</span>' : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        <!-- Inline Feedback -->
                        ${this.showFeedback(isCorrect, message)}
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    <button class="${this.config.cssClasses.button.secondary}" onclick="window.mobileApp.backToGrammarExplanation()">Rules</button>
                    <button class="${this.config.cssClasses.button.primary}" onclick="window.mobileApp.nextGrammarQuestion()">
                        ${currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        `;

        this.uiManager.render(feedbackHTML);
    }

    /**
     * Go to next question
     */
    nextQuestion() {
        const { currentQuestion, totalQuestions } = this.state;

        if (currentQuestion < totalQuestions - 1) {
            // Go to next question
            this.state.currentQuestion++;
            this.stateManager.setComponentState(this.name, this.state);
            this.uiManager.render(this.render());
        } else {
            // Finish grammar
            this.finish();
        }
    }

    /**
     * Go to previous question
     */
    previousQuestion() {
        if (this.state.currentQuestion > 0) {
            this.state.currentQuestion--;
            this.stateManager.setComponentState(this.name, this.state);
            this.uiManager.render(this.render());
        }
    }

    /**
     * Finish grammar component
     */
    finish() {
        const { correctAnswers, totalQuestions } = this.state;
        this.log('Grammar completed', { correctAnswers, totalQuestions });
        this.showCompletion();
    }

    /**
     * Show completion screen
     */
    showCompletion() {
        const { correctAnswers, totalQuestions } = this.state;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        const stats = {
            correctAnswers,
            totalQuestions,
            accuracy
        };
        
        this.uiManager.showGrammarCompletion(stats);
    }

    /**
     * Continue from completion
     */
    continueFromCompletion() {
        console.log('🔥 Grammar continueFromCompletion called');
        // Complete the component and unlock next one
        this.complete();
        console.log('✅ Component completed, showing tree view in 100ms');
        // Return to tree view to show unlocked components
        setTimeout(() => {
            console.log('🌳 Calling showTreeView()');
            this.uiManager.showTreeView();
        }, 100);
    }
}

// Make available globally
window.Grammar = window.Grammar;