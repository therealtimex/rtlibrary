/**
 * Quiz Component
 * Handles the final quiz section of the lesson
 */

window.Quiz = class Quiz extends window.BaseComponent {
    constructor(stateManager, uiManager, config) {
        super('quiz', stateManager, uiManager, config);
    }

    /**
     * Validate quiz data
     */
    validateData(data) {
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('Quiz component must have questions array');
        }

        if (data.questions.length === 0) {
            throw new Error('Quiz component must have at least one question');
        }
    }

    /**
     * Initialize quiz state
     */
    initializeState() {
        this.state = {
            currentQuestion: 0,
            totalQuestions: this.data.questions.length,
            answers: {},
            correctAnswers: 0,
            totalPoints: 0,
            earnedPoints: 0,
            data: this.data
        };
        
        // Calculate total points
        this.state.totalPoints = this.data.questions.reduce((sum, q) => sum + (q.points || 1), 0);
        
        this.stateManager.setComponentState(this.name, this.state);
    }

    /**
     * Render quiz component
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
                ${this.createHeader(currentQuestion + 1, totalQuestions, 'Quiz')}

                <!-- Question Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="quiz-question">
                        <div class="question-header">
                            <div class="question-points">
                                ${question.points || 1} point${(question.points || 1) > 1 ? 's' : ''}
                            </div>
                        </div>
                        
                        <div class="question-title">${question.question || question.prompt}</div>
                        
                        ${this.renderQuestionByType(question, currentQuestion)}
                    </div>
                </div>

                ${this.createFooter(
                    currentQuestion > 0,
                    currentQuestion === totalQuestions - 1 ? 'Finish Quiz' : 'Next',
                    null,
                    `window.mobileApp.previousQuizQuestion()`
                )}
            </div>
        `;
    }

    /**
     * Render question by type
     */
    renderQuestionByType(question, index) {
        const questionId = `quiz_q_${index}`;

        switch (question.type) {
            case 'multiple_choice':
                return this.renderMultipleChoice(question, questionId);
            case 'true_false':
                return this.renderTrueFalse(question, questionId);
            case 'fill_blank':
                return this.renderFillBlank(question, questionId);
            case 'open_text':
                return this.renderOpenText(question, questionId);
            default:
                return this.renderMultipleChoice(question, questionId);
        }
    }

    /**
     * Render multiple choice question
     */
    renderMultipleChoice(question, questionId) {
        return `
            <div class="question-options">
                ${this.createMultipleChoiceOptions(
                    question.options,
                    `window.mobileApp.selectQuizAnswer`,
                    null,
                    questionId
                )}
            </div>
        `;
    }

    /**
     * Render true/false question
     */
    renderTrueFalse(question, questionId) {
        return `
            <div class="question-options">
                ${this.createMultipleChoiceOptions(
                    ['True', 'False'],
                    `window.mobileApp.selectQuizAnswer`,
                    null,
                    questionId
                )}
            </div>
        `;
    }

    /**
     * Render fill in the blank question
     */
    renderFillBlank(question, questionId) {
        if (question.blanks && Array.isArray(question.blanks)) {
            return `
                <div class="fill-blank-container">
                    ${question.blanks.map((blank, index) => `
                        <div class="blank-item">
                            <label class="blank-label">Blank ${index + 1}:</label>
                            <input 
                                type="text" 
                                class="blank-input" 
                                placeholder="Fill in the blank..."
                                data-blank-index="${index}"
                                oninput="window.mobileApp.handleQuizBlankInput('${questionId}', ${index}, this.value)"
                            />
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-primary" style="margin-top: 20px; display: inline-block; width: auto; padding: 10px 25px;" onclick="window.mobileApp.checkQuizAnswer('${questionId}')">Check</button>
            `;
        }
        
        return this.renderOpenText(question, questionId);
    }

    /**
     * Render open text question
     */
    renderOpenText(question, questionId) {
        return `
            <div class="question-input">
                ${this.createTextInput(
                    'Your answer...',
                    '',
                    question.max_length || 500
                )}
            </div>
        `;
    }

    /**
     * Select quiz answer
     */
    selectQuizAnswer(questionId, selectedAnswer, correctAnswer) {
        console.log('--- selectQuizAnswer DEBUG START ---');
        console.log('Input: selectedAnswer =', selectedAnswer, 'correctAnswer =', correctAnswer);

        const { currentQuestion } = this.state;
        const question = this.data.questions[currentQuestion];
        const correct = correctAnswer || question.correct;

        console.log('Derived: correct (from data) =', correct);

        // Normalize both selectedAnswer and correct answer for robust comparison
        const normalizedSelectedAnswer = typeof selectedAnswer === 'string' ? selectedAnswer.trim().toLowerCase() : selectedAnswer;
        const normalizedCorrectAnswer = typeof correct === 'string' ? correct.trim().toLowerCase() : correct;

        console.log('Normalized: normalizedSelectedAnswer =', normalizedSelectedAnswer, 'normalizedCorrectAnswer =', normalizedCorrectAnswer);

        const isCorrect = normalizedSelectedAnswer === normalizedCorrectAnswer;
        console.log('Comparison Result: isCorrect =', isCorrect);

        this.state.answers[questionId] = selectedAnswer;

        if (isCorrect) {
            this.state.correctAnswers++;
            this.state.earnedPoints += question.points || 1;
        }

        this.stateManager.setComponentState(this.name, this.state);

        // Show feedback
        const feedbackMessage = isCorrect ?
            (question.feedback && question.feedback.correct || 'Correct!') :
            (question.feedback && question.feedback.incorrect || question.explanation || `The correct answer is "${correct}"`);

        this.showQuizFeedback(questionId, selectedAnswer, correct, isCorrect, feedbackMessage);
        console.log('--- selectQuizAnswer DEBUG END ---');
    }

    /**
     * Handle blank input
     */
    handleQuizBlankInput(questionId, blankIndex, value) {
        if (!this.state.answers[questionId]) {
            this.state.answers[questionId] = {};
        }
        
        this.state.answers[questionId][blankIndex] = value;
        this.stateManager.setComponentState(this.name, this.state);
        
        this.log('Blank input', { questionId, blankIndex, value });
    }

    /**
     * Handle text input
     */
    handleTextInput(value) {
        const questionId = `quiz_q_${this.state.currentQuestion}`;
        this.state.answers[questionId] = value;
        this.stateManager.setComponentState(this.name, this.state);
        
        this.log('Text input', { questionId, value });
    }

    checkAnswer(questionId) {
        const { currentQuestion } = this.state;
        const question = this.data.questions[currentQuestion];

        if (question.type === 'fill_blank') {
            const userAnswer = this.state.answers[questionId];
            if (!userAnswer) return;

            let allCorrect = true;
            question.blanks.forEach((blank, index) => {
                if (userAnswer[index] !== blank.correct) {
                    allCorrect = false;
                }
            });

            if (allCorrect) {
                this.state.correctAnswers++;
                this.state.earnedPoints += question.points || 1;
            }

            this.stateManager.setComponentState(this.name, this.state);

            const feedbackMessage = allCorrect ? 
                'Correct!' : 
                question.explanation || `The correct answers are: ${question.blanks.map(b => b.correct).join(', ')}`;

            this.showFillBlankFeedback(questionId, allCorrect, feedbackMessage);
        }
    }

    showFillBlankFeedback(questionId, isCorrect, message) {
        const { currentQuestion, totalQuestions, earnedPoints, totalPoints } = this.state;
        const question = this.data.questions[currentQuestion];

        const feedbackHTML = `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                ${this.createHeader(currentQuestion + 1, totalQuestions, isCorrect ? 'Correct!' : 'Incorrect')}

                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="quiz-question">
                        <div class="question-title">${question.question || question.prompt}</div>
                        
                        <div class="fill-blank-container">
                            ${question.blanks.map((blank, index) => {
                                const userAnswer = this.state.answers[questionId] ? this.state.answers[questionId][index] : '';
                                const isBlankCorrect = userAnswer === blank.correct;
                                return `
                                    <div class="blank-item">
                                        <label class="blank-label">Blank ${index + 1}:</label>
                                        <input 
                                            type="text" 
                                            class="blank-input ${isCorrect ? 'correct' : (isBlankCorrect ? 'correct' : 'incorrect')}" 
                                            value="${userAnswer}"
                                            disabled
                                        />
                                        ${!isCorrect && !isBlankCorrect ? `<div class="correct-answer-text">Correct: ${blank.correct}</div>` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        ${this.showFeedback(isCorrect, message)}

                        <div class="score-display">
                            <div class="current-score">Score: ${earnedPoints}/${totalPoints}</div>
                        </div>
                    </div>
                </div>

                <div class="warmup-footer">
                    <div></div>
                    <button class="${this.config.cssClasses.button.primary}" onclick="window.mobileApp.nextQuizQuestion()">
                        ${currentQuestion === totalQuestions - 1 ? 'See Results' : 'Next'}
                    </button>
                </div>
            </div>
        `;

        this.uiManager.render(feedbackHTML);
    }

    /**
     * Show quiz feedback
     */
    showQuizFeedback(questionId, selectedAnswer, correctAnswer, isCorrect, message) {
        console.log('--- showQuizFeedback DEBUG START ---');
        console.log('Input: selectedAnswer =', selectedAnswer, 'correctAnswer =', correctAnswer, 'isCorrect =', isCorrect);

        const { currentQuestion, totalQuestions, earnedPoints, totalPoints } = this.state;
        const question = this.data.questions[currentQuestion];

        const feedbackHTML = `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                ${this.createHeader(currentQuestion + 1, totalQuestions, isCorrect ? 'Correct!' : 'Incorrect')}

                <!-- Question with Feedback -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="quiz-question">
                        <div class="question-header">
                            <div class="question-points ${isCorrect ? 'earned' : 'missed'}">
                                ${isCorrect ? '+' : ''}${isCorrect ? question.points || 1 : 0} point${(question.points || 1) > 1 ? 's' : ''}
                            </div>
                        </div>
                        
                        <div class="question-title">${question.question || question.prompt}</div>
                        
                        <div class="question-options">
                            ${(question.options || ['True', 'False']).map(option => {
                                console.log('  Looping option:', option);
                                let optionClass = 'quiz-option';
                                let optionStyle = '';

                                console.log('    Conditions: option === selectedAnswer', option === selectedAnswer, 'isCorrect', isCorrect, 'option === correctAnswer', option === correctAnswer);

                                if (option === selectedAnswer) {
                                    if (isCorrect) {
                                        optionClass += ' correct-answer';
                                        optionStyle = 'border-color: #10b981; background: #dcfce7;';
                                        console.log('    Result: selected and correct');
                                    } else {
                                        optionClass += ' incorrect-answer';
                                        optionStyle = 'border-color: #ef4444; background: #fef2f2;';
                                        console.log('    Result: selected and incorrect');
                                    }
                                } else if (option === correctAnswer) {
                                    optionClass += ' correct-answer';
                                    optionStyle = 'border-color: #10b981; background: #dcfce7;';
                                    console.log('    Result: not selected but correct');
                                }
                                console.log('  Final optionClass:', optionClass, 'optionStyle:', optionStyle);

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

                        <!-- Score Display -->
                        <div class="score-display">
                            <div class="current-score">Score: ${earnedPoints}/${totalPoints}</div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    <div></div>
                    <button class="${this.config.cssClasses.button.primary}" onclick="window.mobileApp.nextQuizQuestion()">
                        ${currentQuestion === totalQuestions - 1 ? 'See Results' : 'Next'}
                    </button>
                </div>
            </div>
        `;

        this.uiManager.render(feedbackHTML);
        console.log('--- showQuizFeedback DEBUG END ---');
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
            // Show results
            this.showResults();
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
     * Show quiz results
     */
    showResults() {
        const { correctAnswers, totalQuestions, earnedPoints, totalPoints } = this.state;
        const score = Math.round((earnedPoints / totalPoints) * 100);
        
        const stats = {
            score,
            correctAnswers,
            totalQuestions,
            points: earnedPoints,
            totalPoints
        };
        
        this.uiManager.showQuizCompletion(stats);
    }

    /**
     * Finish quiz
     */
    finishQuiz() {
        const { correctAnswers, totalQuestions, earnedPoints, totalPoints } = this.state;
        const percentage = Math.round((earnedPoints / totalPoints) * 100);
        
        this.log('Quiz completed', { 
            correctAnswers, 
            totalQuestions, 
            earnedPoints, 
            totalPoints,
            percentage
        });
        
        this.showCompletion();
    }

    /**
     * Show completion screen
     */
    showCompletion() {
        const { correctAnswers, totalQuestions, earnedPoints, totalPoints } = this.state;
        const score = Math.round((earnedPoints / totalPoints) * 100);
        
        const stats = {
            score,
            correctAnswers,
            totalQuestions,
            points: earnedPoints,
            totalPoints
        };
        
        this.uiManager.showQuizCompletion(stats);
    }

    /** Continue from completion **/
  
    continueFromCompletion() {
        this.complete();
        this.uiManager.showTreeView();
    }
}

// Make available globally
window.Quiz = window.Quiz;