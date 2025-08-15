/**
 * Reading Component
 * Handles the reading section of the lesson
 */

window.Reading = class Reading extends window.BaseComponent {
    constructor(stateManager, uiManager, config) {
        super('reading', stateManager, uiManager, config);
    }

    /**
     * Validate reading data
     */
    validateData(data) {
        if (!data.passage) {
            throw new Error('Reading component must have passage');
        }

        if (!data.comprehension_checks || !Array.isArray(data.comprehension_checks)) {
            throw new Error('Reading component must have comprehension_checks array');
        }
    }

    /**
     * Initialize reading state
     */
    initializeState() {
        this.state = {
            currentStep: 'reading', // 'reading' or 'questions'
            currentQuestion: 0,
            totalQuestions: this.data.comprehension_checks.length,
            answers: {},
            correctAnswers: 0,
            data: this.data
        };
        
        this.stateManager.setComponentState(this.name, this.state);
    }

    /**
     * Render reading component
     */
    render() {
        return this.renderStep();
    }

    /**
     * Render current step
     */
    renderStep() {
        const { currentStep } = this.state;

        if (currentStep === 'reading') {
            return this.renderPassage();
        } else if (currentStep === 'questions') {
            return this.renderQuestion();
        }
    }

    /**
     * Render passage step
     */
    renderPassage() {
        return `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                <!-- Header with close -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="window.mobileApp.exitComponent('${this.name}')">✕</button>
                    <div class="${this.config.cssClasses.progress.container}">
                        <div class="${this.config.cssClasses.progress.text}">Reading Passage</div>
                    </div>
                </div>

                <!-- Passage Content -->
                <div class="screen-content" style="padding: 16px; flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;">
                    <div class="reading-passage">
                        <div class="passage-title" style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; text-align: center;">${this.data.passage?.title || this.data.title || 'Reading Passage'}</div>
                        <div class="passage-meta" style="text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                            ${this.data.passage?.reading_time ? `Reading time: ${this.data.passage.reading_time}` : ''}
                            ${this.data.passage?.word_count ? ` • ${this.data.passage.word_count} words` : ''}
                        </div>
                        <div class="passage-content" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.6; font-size: 16px; color: #374151;">
                            ${this.formatPassage(this.data.passage?.text || this.data.passage)}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    <div></div>
                    <button class="${this.config.cssClasses.button.primary}" onclick="window.mobileApp.startReadingQuestions()">
                        Answer Questions
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render question step
     */
    renderQuestion() {
        const { currentQuestion, totalQuestions } = this.state;
        const question = this.data.comprehension_checks[currentQuestion];

        return `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                ${this.createHeader(currentQuestion + 1, totalQuestions)}

                <!-- Question Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="reading-question">
                        <div class="question-title">${question.question || question.statement}</div>
                        
                        ${this.renderQuestionByType(question, currentQuestion)}
                    </div>
                </div>

                ${this.createFooter(
                    currentQuestion > 0,
                    currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next',
                    null,
                    `window.mobileApp.previousReadingQuestion()`
                )}
            </div>
        `;
    }

    /**
     * Render question by type
     */
    renderQuestionByType(question, index) {
        const questionId = `reading_q_${index}`;
        const correctAnswer = question.correct_answer;

        switch (question.type) {
            case 'multiple_choice':
                return `
                    <div class="question-options">
                        ${question.options.map(option => {
                            return `
                                <label class="reading-option" onclick="window.mobileApp.selectReadingAnswer('${questionId}', '${option}', '${correctAnswer}')">
                                    <div class="option-content">
                                        <div class="option-radio"></div>
                                        <span class="option-text">${option}</span>
                                    </div>
                                </label>
                            `;
                        }).join('')}
                    </div>
                `;
            case 'true_false':
                const trueAnswer = correctAnswer === true ? 'True' : 'False';
                return `
                    <div class="question-options">
                        ${['True', 'False'].map(option => {
                            return `
                                <label class="reading-option" onclick="window.mobileApp.selectReadingAnswer('${questionId}', '${option}', '${trueAnswer}')">
                                    <div class="option-content">
                                        <div class="option-radio"></div>
                                        <span class="option-text">${option}</span>
                                    </div>
                                </label>
                            `;
                        }).join('')}
                    </div>
                `;
            case 'short_answer':
                return `
                    <div class="question-input">
                        ${this.createTextInput(
                            'Your answer...',
                            '',
                            question.max_length || 100
                        )}
                        <div style="margin-top: 12px;">
                            <button class="btn btn-primary" onclick="window.mobileApp.submitShortAnswer('${questionId}', '${correctAnswer}')">
                                Submit Answer
                            </button>
                        </div>
                    </div>
                `;
            default:
                return `
                    <div class="question-options">
                        ${(question.options || ['True', 'False']).map(option => {
                            const defaultCorrect = question.options ? correctAnswer : (correctAnswer === true ? 'True' : 'False');
                            return `
                                <label class="reading-option" onclick="window.mobileApp.selectReadingAnswer('${questionId}', '${option}', '${defaultCorrect}')">
                                    <div class="option-content">
                                        <div class="option-radio"></div>
                                        <span class="option-text">${option}</span>
                                    </div>
                                </label>
                            `;
                        }).join('')}
                    </div>
                `;
        }
    }

    /**
     * Format passage text
     */
    formatPassage(passage) {
        if (typeof passage === 'string') {
            // Split into paragraphs and format
            return passage.split('\n\n').map(paragraph => 
                `<p class="passage-paragraph">${paragraph.trim()}</p>`
            ).join('');
        }
        return passage;
    }

    /**
     * Start questions
     */
    startQuestions() {
        this.state.currentStep = 'questions';
        this.stateManager.setComponentState(this.name, this.state);
        this.uiManager.render(this.render());
    }

    /**
     * Back to passage
     */
    backToPassage() {
        this.state.currentStep = 'reading';
        this.stateManager.setComponentState(this.name, this.state);
        this.uiManager.render(this.render());
    }

    /**
     * Select reading answer
     */
    selectReadingAnswer(questionId, selectedAnswer, correctAnswer) {
        const isCorrect = selectedAnswer === correctAnswer;
        this.state.answers[questionId] = selectedAnswer;

        if (isCorrect) {
            this.state.correctAnswers++;
        }

        this.stateManager.setComponentState(this.name, this.state);

        // Show feedback
        const { currentQuestion } = this.state;
        const question = this.data.comprehension_checks[currentQuestion];
        const feedbackMessage = isCorrect ? 
            question.feedback?.correct || 'Correct!' : 
            question.feedback?.incorrect || question.explanation || `The correct answer is "${correctAnswer}"`;

        this.showReadingFeedback(questionId, selectedAnswer, correctAnswer, isCorrect, feedbackMessage);
    }

    /**
     * Submit short answer
     */
    submitShortAnswer(questionId, correctAnswer) {
        const textInput = document.querySelector('.text-input');
        const selectedAnswer = textInput ? textInput.value.trim() : '';
        
        if (!selectedAnswer) {
            alert('Please enter an answer.');
            return;
        }

        // For short answers, we'll do a simple comparison (case-insensitive)
        const isCorrect = selectedAnswer.toLowerCase().includes(correctAnswer.toLowerCase());
        this.state.answers[questionId] = selectedAnswer;

        if (isCorrect) {
            this.state.correctAnswers++;
        }

        this.stateManager.setComponentState(this.name, this.state);

        // Show inline feedback on the current question
        const { currentQuestion } = this.state;
        const question = this.data.comprehension_checks[currentQuestion];
        const feedbackMessage = isCorrect ? 
            question.feedback?.correct || 'Great answer!' : 
            question.feedback?.incorrect || question.explanation || `A good answer would include: "${correctAnswer}"`;

        this.showInlineFeedback(isCorrect, feedbackMessage, selectedAnswer);
    }

    /**
     * Show inline feedback for short answers
     */
    showInlineFeedback(isCorrect, message, userAnswer) {
        // Remove existing feedback
        const existingFeedback = document.querySelector('.inline-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Disable the text input and submit button
        const textInput = document.querySelector('.text-input');
        const submitButton = document.querySelector('.btn-primary');
        if (textInput) textInput.disabled = true;
        if (submitButton) submitButton.disabled = true;

        // Create feedback element
        const feedbackClass = isCorrect ? 'correct' : 'incorrect';
        const feedbackIcon = isCorrect ? '✅' : '❌';
        
        const feedbackHTML = `
            <div class="inline-feedback ${feedbackClass}" style="margin-top: 16px; padding: 16px; border-radius: 12px; display: flex; align-items: center; gap: 12px; ${isCorrect ? 'background: #dcfce7; border: 1px solid #10b981; color: #065f46;' : 'background: #fef2f2; border: 1px solid #ef4444; color: #991b1b;'}">
                <div class="feedback-icon" style="font-size: 20px;">${feedbackIcon}</div>
                <div class="feedback-message" style="flex: 1; font-size: 16px; line-height: 1.5;">
                    <div style="font-weight: 600; margin-bottom: 4px;">Your answer: "${userAnswer}"</div>
                    <div>${message}</div>
                </div>
            </div>
        `;
        
        // Insert feedback after the question input
        const questionInput = document.querySelector('.question-input');
        if (questionInput) {
            questionInput.insertAdjacentHTML('beforeend', feedbackHTML);
        }

        // Auto-advance after delay
        setTimeout(() => {
            this.nextQuestion();
        }, 3000); // 3 seconds to read feedback
    }

    /**
     * Show reading feedback
     */
    showReadingFeedback(questionId, selectedAnswer, correctAnswer, isCorrect, message) {
        const { currentQuestion, totalQuestions } = this.state;
        const question = this.data.comprehension_checks[currentQuestion];

        const feedbackHTML = `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                ${this.createHeader(currentQuestion + 1, totalQuestions, isCorrect ? 'Correct!' : 'Try again')}

                <!-- Question with Feedback -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="reading-question">
                        <div class="question-title">${question.question || question.statement}</div>
                        
                        <div class="question-options">
                            ${(question.options || ['True', 'False']).map(option => {
                                let optionClass = 'reading-option';
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
                    <button class="${this.config.cssClasses.button.secondary}" onclick="window.mobileApp.backToReadingPassage()">Passage</button>
                    <button class="${this.config.cssClasses.button.primary}" onclick="window.mobileApp.nextReadingQuestion()">
                        ${currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        `;

        this.uiManager.render(feedbackHTML);
    }

    /**
     * Handle text input
     */
    handleTextInput(value) {
        const questionId = `reading_q_${this.state.currentQuestion}`;
        this.state.answers[questionId] = value;
        this.stateManager.setComponentState(this.name, this.state);
        
        this.log('Text input', { questionId, value });
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
            // Finish reading
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
     * Finish reading component
     */
    finish() {
        const { correctAnswers, totalQuestions } = this.state;
        this.log('Reading completed', { correctAnswers, totalQuestions });
        this.showCompletion();
    }

    /**
     * Show completion screen
     */
    showCompletion() {
        const { correctAnswers, totalQuestions } = this.state;
        const comprehensionScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        const stats = {
            correctAnswers,
            totalQuestions,
            comprehensionScore
        };
        
        this.uiManager.showReadingCompletion(stats);
    }

    /**
     * Continue from completion
     */
    continueFromCompletion() {
        console.log('🔥 Reading continueFromCompletion called');
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
window.Reading = window.Reading;