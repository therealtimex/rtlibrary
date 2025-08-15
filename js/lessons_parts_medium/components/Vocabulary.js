/**
 * Vocabulary Component
 * Handles the vocabulary section of the lesson
 */

window.Vocabulary = class Vocabulary extends window.BaseComponent {
    constructor(stateManager, uiManager, config) {
        super('vocabulary', stateManager, uiManager, config);
    }

    /**
     * Validate vocabulary data
     */
    validateData(data) {
        if (!data.vocabulary_items || !Array.isArray(data.vocabulary_items)) {
            throw new Error('Vocabulary component must have vocabulary_items array');
        }

        if (data.vocabulary_items.length === 0) {
            throw new Error('Vocabulary component must have at least one vocabulary item');
        }
    }

    /**
     * Initialize vocabulary state
     */
    initializeState() {
        this.state = {
            currentWord: 0,
            totalWords: this.data.vocabulary_items.length,
            completedWords: new Set(),
            correctAnswers: new Set(),
            incorrectAnswers: new Set(),
            currentStep: 'learn', // 'learn' or 'check'
            data: this.data
        };
        
        this.stateManager.setComponentState(this.name, this.state);
    }

    /**
     * Render vocabulary component
     */
    render() {
        return this.renderStep();
    }

    /**
     * Render current step
     */
    renderStep() {
        const { currentStep } = this.state;

        if (currentStep === 'learn') {
            return this.renderLearnStep();
        } else if (currentStep === 'check') {
            return this.renderCheckStep();
        }
    }

    /**
     * Render learn step
     */
    renderLearnStep() {
        const { currentWord, totalWords } = this.state;
        const word = this.data.vocabulary_items[currentWord];
        const progress = ((currentWord + 0.5) / totalWords) * 100; // Half progress for learn step

        return `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                ${this.createHeader(currentWord + 1, totalWords, 'Learn')}

                <!-- Word Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                    <div class="vocabulary-word">
                        <div class="word-display">${word.word}</div>
                        <div class="pronunciation">
                            <button class="audio-btn" onclick="window.mobileApp.playAudio('${word.word}')">🔊</button>
                            <span>${word.pronunciation?.ipa || word.pronunciation?.simple || ''}</span>
                        </div>
                        <div class="definition">${word.definition}</div>
                        
                        ${word.examples && word.examples.length > 0 ? `
                            <div class="example">"${word.examples[0]}"</div>
                        ` : ''}

                        ${word.synonyms && word.synonyms.length > 0 ? `
                            <div class="synonyms">
                                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Synonyms:</div>
                                <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                                    ${word.synonyms.map(synonym => `
                                        <span style="background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 14px;">${synonym}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${this.createFooter(
                    currentWord > 0,
                    'Got it!',
                    `window.mobileApp.goToVocabCheck()`,
                    `window.mobileApp.previousVocabStep()`
                )}
            </div>
        `;
    }

    /**
     * Render check step
     */
    renderCheckStep() {
        const { currentWord, totalWords } = this.state;
        const word = this.data.vocabulary_items[currentWord];
        const microCheck = word.micro_check;
        const progress = ((currentWord + 1) / totalWords) * 100; // Full progress after check

        if (!microCheck) {
            // Skip to next word if no micro check
            this.nextWord();
            return this.renderStep();
        }

        return `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                ${this.createHeader(currentWord + 1, totalWords, 'Check')}

                <!-- Check Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="micro-check">
                        <div class="check-title">Quick Check</div>
                        <div class="check-question">${microCheck.question}</div>
                        
                        <div class="check-options">
                            ${microCheck.options.map(option => {
                                return `
                                    <label class="check-option" onclick="window.mobileApp.selectMicroCheck('${option}', '${microCheck.correct}')">
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
                <div class="warmup-footer">
                    <button class="${this.config.cssClasses.button.secondary}" onclick="window.mobileApp.backToVocabLearn()">Back</button>
                    <div></div>
                </div>
            </div>
        `;
    }

    /**
     * Go to check step
     */
    goToCheck() {
        this.state.currentStep = 'check';
        this.stateManager.setComponentState(this.name, this.state);
        this.uiManager.render(this.render());
    }

    /**
     * Back to learn step
     */
    backToLearn() {
        this.state.currentStep = 'learn';
        this.stateManager.setComponentState(this.name, this.state);
        this.uiManager.render(this.render());
    }

    /**
     * Select micro check answer
     */
    selectMicroCheck(selectedOption, correctOption) {
        const isCorrect = selectedOption === correctOption;
        const { currentWord } = this.state;
        const word = this.data.vocabulary_items[currentWord];
        const microCheck = word.micro_check;

        // Track correct/incorrect answers
        if (isCorrect) {
            this.state.correctAnswers.add(currentWord);
        } else {
            this.state.incorrectAnswers.add(currentWord);
        }

        // Update UI to show selected answer
        document.querySelectorAll('.check-option').forEach(option => {
            const optionText = option.querySelector('.option-text').textContent;
            const radio = option.querySelector('.option-radio');
            
            if (optionText === selectedOption) {
                option.classList.add('selected');
                radio.classList.add('selected');
                
                if (isCorrect) {
                    radio.classList.add('correct');
                    option.querySelector('.option-content').insertAdjacentHTML('beforeend', '<span class="correct-indicator">✓</span>');
                } else {
                    option.querySelector('.option-content').insertAdjacentHTML('beforeend', '<span class="incorrect-indicator">✗</span>');
                }
            } else if (optionText === correctOption && !isCorrect) {
                // Highlight correct answer if user was wrong
                radio.classList.add('correct');
                option.querySelector('.option-content').insertAdjacentHTML('beforeend', '<span class="correct-indicator">✓</span>');
            }
            
            // Disable all options
            option.style.pointerEvents = 'none';
        });

        // Show feedback message
        const feedbackMessage = isCorrect ?
            microCheck.feedback?.correct || 'Great job!' :
            microCheck.feedback?.incorrect || `The correct answer is "${correctOption}"`;

        const feedbackHTML = this.showFeedback(isCorrect, feedbackMessage);
        const checkOptions = document.querySelector('.check-options');
        if (checkOptions) {
            checkOptions.insertAdjacentHTML('afterend', feedbackHTML);
        }

        // Auto-advance after showing feedback (longer delay for reading)
        this.autoAdvance(() => {
            this.nextWord();
        }, 4000); // 4 seconds instead of default 2 seconds
    }

    /**
     * Go to next word
     */
    nextWord() {
        const { currentWord, totalWords } = this.state;

        // Mark current word as completed
        this.state.completedWords.add(currentWord);

        if (currentWord < totalWords - 1) {
            // Go to next word
            this.state.currentWord++;
            this.state.currentStep = 'learn';
            this.stateManager.setComponentState(this.name, this.state);
            this.uiManager.render(this.render());
        } else {
            // Finish vocabulary
            this.showCompletion();
        }
    }

    /**
     * Show completion screen
     */
    showCompletion() {
        const correctCount = this.state.correctAnswers.size;
        const incorrectCount = this.state.incorrectAnswers.size;
        const totalChecks = correctCount + incorrectCount;
        const accuracy = totalChecks > 0 ? Math.round((correctCount / totalChecks) * 100) : 0;
        
        const stats = {
            wordsLearned: this.state.totalWords,
            correctAnswers: correctCount,
            incorrectAnswers: incorrectCount,
            totalChecks: totalChecks,
            accuracy: accuracy
        };
        
        this.uiManager.showVocabularyCompletion(stats);
    }

    /**
     * Continue from completion
     */
    continueFromCompletion() {
        console.log('🔥 Vocabulary continueFromCompletion called');
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
     * Go to previous word
     */
    previousWord() {
        if (this.state.currentWord > 0) {
            this.state.currentWord--;
            this.state.currentStep = 'learn';
            this.stateManager.setComponentState(this.name, this.state);
            this.uiManager.render(this.render());
        }
    }

    /**
     * Get asset URL
     */
    getAssetUrl(path) {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        // Use the ASSETS_BASE_URL
        const baseUrl = 'https://app.realtimex.co/storage/v1/object/public/app_lang_assets_data';
        return `${baseUrl}/${cleanPath}`;
    }

    /**
     * Play audio for word
     */
    playAudio(word) {
        this.log('Playing audio', { word });
        
        // Find the word data
        const wordData = this.data.vocabulary_items.find(item => item.word === word);
        if (!wordData || !wordData.audio_url) {
            console.warn('No audio URL found for word:', word);
            return;
        }

        const audioUrl = this.getAssetUrl(wordData.audio_url);
        console.log('Playing audio from URL:', audioUrl);

        try {
            // Create and play audio
            const audio = new Audio(audioUrl);
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                // Fallback to text-to-speech if available
                this.fallbackToTTS(word);
            });
        } catch (error) {
            console.error('Error creating audio element:', error);
            this.fallbackToTTS(word);
        }
    }

    /**
     * Fallback to text-to-speech
     */
    fallbackToTTS(word) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            speechSynthesis.speak(utterance);
        } else {
            console.warn('No audio support available for word:', word);
        }
    }
}

// Make available globally
window.Vocabulary = window.Vocabulary;