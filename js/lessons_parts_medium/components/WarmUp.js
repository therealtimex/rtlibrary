/**
 * WarmUp Component
 * Handles the warm-up section of the lesson
 */

window.WarmUp = class WarmUp extends window.BaseComponent {
    constructor(stateManager, uiManager, config) {
        super('warm_up', stateManager, uiManager, config);
    }

    /**
     * Validate warm-up data
     */
    validateData(data) {
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('Warm-up component must have questions array');
        }

        if (data.questions.length === 0) {
            throw new Error('Warm-up component must have at least one question');
        }
    }

    /**
     * Initialize warm-up state
     */
    initializeState() {
        this.state = {
            currentQuestion: 0,
            totalQuestions: this.data.questions.length,
            answers: {},
            data: this.data
        };

        this.stateManager.setComponentState(this.name, this.state);
    }

    /**
     * Render warm-up component
     */
    render() {
        return this.renderQuestion();
    }

    /**
     * Render current question
     */
    renderQuestion() {
        const { currentQuestion, totalQuestions } = this.state;
        const question = this.data.questions[currentQuestion];

        return `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                ${this.createHeader(currentQuestion + 1, totalQuestions)}

                <!-- Question Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    ${this.renderSingleQuestion(question, currentQuestion)}
                </div>

                ${this.createFooter(
            currentQuestion > 0,
            currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next',
            `window.mobileApp.nextWarmupQuestion()`,
            `window.mobileApp.previousWarmupQuestion()`
        )}
            </div>
        `;
    }

    /**
     * Render single question based on type
     */
    renderSingleQuestion(question, index) {
        const questionId = `warmup_q_${index}`;
        const currentAnswer = this.state.answers[questionId] || '';

        switch (question.type) {
            case 'multiple_choice':
                return this.renderMultipleChoiceQuestion(question, questionId, currentAnswer);
            case 'open_text':
                return this.renderOpenTextQuestion(question, questionId, currentAnswer);
            default:
                return this.renderOpenTextQuestion(question, questionId, currentAnswer);
        }
    }

    /**
     * Render multiple choice question
     */
    renderMultipleChoiceQuestion(question, questionId, currentAnswer) {
        return `
            <div class="question-container">
                <div class="question-text">${question.question}</div>
                <div class="question-options">
                    ${question.options.map(option => {
            const isSelected = currentAnswer === option;
            const selectedClass = isSelected ? 'selected' : '';

            return `
                            <label class="check-option ${selectedClass}" onclick="window.mobileApp.selectWarmupAnswer('${questionId}', '${option}')">
                                <div class="option-content">
                                    <div class="option-radio ${selectedClass}"></div>
                                    <span class="option-text">${option}</span>
                                </div>
                            </label>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render open text question
     */
    renderOpenTextQuestion(question, questionId, currentAnswer) {
        return `
            <div class="question-container">
                <div class="question-text">${question.question}</div>
                <div class="question-input">
                    ${this.createTextInput(
            question.placeholder || 'Your answer...',
            currentAnswer,
            question.max_length
        )}
                </div>
            </div>
        `;
    }

    /**
     * Handle answer selection
     */
    selectAnswer(questionId, answer) {
        this.state.answers[questionId] = answer;
        this.stateManager.setComponentState(this.name, this.state);

        // Enable next button
        this.enableNextButton();

        this.log('Answer selected', { questionId, answer });
    }

    /**
     * Handle text input
     */
    handleTextInput(value) {
        const questionId = `warmup_q_${this.state.currentQuestion}`;
        this.selectAnswer(questionId, value);
    }

    /**
     * Enable next button
     */
    enableNextButton() {
        const nextBtn = document.getElementById('warmupNextBtn');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
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
            // Finish warm-up
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
     * Finish warm-up
     */
    finish() {
        const answeredCount = Object.keys(this.state.answers).length;
        const required = this.data.completion_rule?.value || this.state.totalQuestions;

        this.log('Warmup finished', {
            answeredCount,
            totalQuestions: this.state.totalQuestions,
            required
        });

        if (answeredCount >= required) {
            this.showCompletion();
        } else {
            this.showIncomplete(answeredCount, required);
        }
    }

    /**
     * Show completion screen
     */
    showCompletion() {
        this.uiManager.showWarmupCompletion();
    }

    /**
     * Continue from completion
     */
    continueFromCompletion() {
        console.log('🔥 WarmUp continueFromCompletion called');
        // Complete the component and unlock next one
        this.complete();
        console.log('✅ Component completed, showing tree view in 100ms');
        // Return to tree view to show unlocked components
        setTimeout(() => {
            console.log('🌳 Calling showTreeView()');
            this.uiManager.showTreeView();
        }, 100);
    }

    /**
     * Show incomplete screen
     */
    showIncomplete(answered, required) {
        const message = `You need to answer at least ${required} questions. You answered ${answered}.`;

        this.uiManager.render(`
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                <div class="screen-content">
                    <div class="emoji">⚠️</div>
                    <div class="title">Almost Done!</div>
                    <div class="subtitle">${message}</div>
                </div>
                <div class="screen-footer">
                    <button class="${this.config.cssClasses.button.primary}" onclick="window.mobileApp.continueWarmup()">
                        Continue Anyway
                    </button>
                </div>
            </div>
        `);
    }

}

// Make available globally
window.WarmUp = window.WarmUp;