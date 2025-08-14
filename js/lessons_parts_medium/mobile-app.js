// Mobile-First Language Learning App
class MobileLessonApp {
    constructor() {
        this.lessonData = null;
        this.currentScreen = 0; // 0 = tree view
        this.screens = [];
        this.componentProgress = {};
        this.screenHistory = [];

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Mobile Lesson App...');

            // Show loading
            this.showLoading();

            // Wait for lesson data (will be provided by onUpdate)
            this.waitForLessonData();

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load lesson. Please refresh the page.');
        }
    }

    waitForLessonData() {
        // Check if lesson data is already available
        if (window.lessonDataReady) {
            this.handleLessonData(window.lessonDataReady);
            return;
        }

        // Wait for onUpdate to provide data
        const checkInterval = setInterval(() => {
            if (window.lessonDataReady) {
                clearInterval(checkInterval);
                this.handleLessonData(window.lessonDataReady);
            }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!this.lessonData) {
                this.showError('Lesson data not available. Please check your connection.');
            }
        }, 10000);
    }

    handleLessonData(data) {
        console.log('📊 Lesson data received:', data);
        this.lessonData = data;
        this.setupScreens();
        this.showTreeView();
    }

    setupScreens() {
        const debugMode = false; // Temporarily disabled by user request

        const getComponentTotalSteps = (componentName) => {
            const componentData = this.lessonData.components[componentName];
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
        };

        // Initialize component progress
        Object.keys(this.lessonData.components).forEach(componentName => {
            const totalSteps = getComponentTotalSteps(componentName);
            this.componentProgress[componentName] = {
                unlocked: debugMode || componentName === 'warm_up',
                completed: false,
                progress: 0,
                total: totalSteps
            };
        });

        if (debugMode) {
            console.log('🐛 DEBUG MODE: All components unlocked for testing');
        }

        console.log('📱 Screens setup complete');
    }

    showLoading() {
        const container = document.getElementById('screenContainer');
        container.innerHTML = `
            <div class="mobile-screen active">
                <div class="screen-content">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                    </div>
                    <div class="subtitle">Loading lesson...</div>
                </div>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('screenContainer');
        container.innerHTML = `
            <div class="mobile-screen active">
                <div class="screen-content">
                    <div class="emoji">⚠️</div>
                    <div class="title">Error</div>
                    <div class="subtitle">${message}</div>
                </div>
                <div class="screen-footer">
                    <button class="btn btn-primary" onclick="location.reload()">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
    }

    showTreeView() {
        this.currentScreen = 0;
        this.updateScreenIndicator();

        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderTreeView();

        // Update navigation controls
        this.updateNavigationControls();
    }

    renderTreeView() {
        if (!this.lessonData) return '';

        const components = Object.keys(this.lessonData.components);
        const componentOrder = ['warm_up', 'vocabulary', 'grammar', 'reading', 'speaking', 'quiz'];
        const orderedComponents = componentOrder.filter(comp => components.includes(comp));

        return `
            <div class="mobile-screen active">
                <div class="screen-content">
                    <!-- Compact Welcome Header -->
                    <div style="text-align: center; margin-bottom: 24px; padding-top: 16px;">
                        <div style="font-size: 24px; margin-bottom: 4px;">👋</div>
                        <div style="font-size: 20px; font-weight: 600; color: #1a1a1a;">Welcome!</div>
                        
                        
                    </div>
                    
                    <div class="lesson-tree">
                        ${this.renderTreeNodes(orderedComponents)}
                    </div>
                </div>
            </div>
        `;
    }

    renderTreeNodes(components) {
        const componentIcons = {
            warm_up: '🔥',
            vocabulary: '📚',
            grammar: '📝',
            reading: '📖',
            speaking: '🎤',
            quiz: '🏆'
        };

        const componentLabels = {
            warm_up: 'Warm Up',
            vocabulary: 'Vocabulary',
            grammar: 'Grammar',
            reading: 'Reading',
            speaking: 'Speaking',
            quiz: 'Quiz'
        };

        // Create tree structure without root node
        let treeHTML = '';

        // Start with warm-up as the first/root node, then other components
        const levels = [
            ['warm_up'],           // First level - just warm-up
            ['vocabulary'],        // Second level - vocabulary
            ['grammar', 'reading'], // Third level - grammar and reading
            ['speaking'],          // Fourth level - speaking
            ['quiz']              // Final level - quiz
        ];

        levels.forEach((levelComponents, levelIndex) => {
            const availableComponents = levelComponents.filter(comp => components.includes(comp));
            if (availableComponents.length === 0) return;

            treeHTML += `
                <div class="tree-level">
                    ${levelIndex > 0 ? '<div class="tree-branch"></div>' : ''}
                    <div class="tree-nodes-row">
                        ${availableComponents.map(componentName => {
                const progress = this.componentProgress[componentName];
                const nodeClass = progress.completed ? 'completed' :
                    progress.unlocked ? 'available' : 'locked';

                const isNextUp = progress.unlocked && !progress.completed;
                const nodeSize = isNextUp ? 'tree-node-large' : '';

                return `
                                <div class="tree-node ${nodeClass} ${nodeSize}" 
                                     data-component="${componentName}"
                                     onclick="mobileApp.startComponent('${componentName}')">
                                    <div class="node-icon">${componentIcons[componentName]}</div>
                                    <div class="node-label">${componentLabels[componentName]}</div>
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

    showNodeInfo(componentName) {
        const componentData = {
            lesson: {
                icon: '🎯',
                title: 'Lesson Overview',
                description: this.lessonData?.description || 'Complete language learning lesson',
                stats: ['📚 6 components', '⏱️ 25 min', '🎯 Interactive'],
                action: null
            },
            warm_up: {
                icon: '🔥',
                title: 'Warm Up',
                description: 'Get started with quick questions about the topic',
                stats: ['⏱️ 3 min', '❓ 3 questions', '🎯 Easy start'],
                action: () => this.startComponent('warm_up')
            },
            vocabulary: {
                icon: '📚',
                title: 'Vocabulary',
                description: 'Learn new words with examples and practice',
                stats: ['⏱️ 8 min', '📝 5 words', '✅ Quick checks'],
                action: () => this.startComponent('vocabulary')
            },
            grammar: {
                icon: '📝',
                title: 'Grammar',
                description: 'Practice grammar rules with exercises',
                stats: ['⏱️ 7 min', '📋 4 exercises', '🎯 Interactive'],
                action: () => this.startComponent('grammar')
            },
            reading: {
                icon: '📖',
                title: 'Reading',
                description: 'Read and understand a passage',
                stats: ['⏱️ 5 min', '📄 1 passage', '❓ 4 questions'],
                action: () => this.startComponent('reading')
            },
            speaking: {
                icon: '🎤',
                title: 'Speaking',
                description: 'Practice speaking and expressing opinions',
                stats: ['⏱️ 4 min', '🗣️ 3 tasks', '🎙️ Record'],
                action: () => this.startComponent('speaking')
            },
            quiz: {
                icon: '🏆',
                title: 'Final Quiz',
                description: 'Test your knowledge from the lesson',
                stats: ['⏱️ 3 min', '❓ 3 questions', '🏆 Complete'],
                action: () => this.startComponent('quiz')
            }
        };

        const info = componentData[componentName];
        if (!info) return;

        const panel = document.getElementById('nodeInfoPanel');
        if (!panel) return;

        const infoContent = panel.querySelector('.info-content');
        const button = panel.querySelector('.btn');

        infoContent.innerHTML = `
            <div class="info-icon">${info.icon}</div>
            <div class="info-title">${info.title}</div>
            <div class="info-description">${info.description}</div>
            <div class="info-stats">
                ${info.stats.map(stat => `<span>${stat}</span>`).join('')}
            </div>
        `;

        // Check if component is available
        const progress = this.componentProgress[componentName];
        const isAvailable = !progress || progress.unlocked;

        if (info.action && isAvailable) {
            button.textContent = `Start ${info.title}`;
            button.onclick = info.action;
            button.disabled = false;
            button.style.opacity = '1';
        } else if (info.action) {
            button.textContent = 'Complete previous steps first';
            button.onclick = null;
            button.disabled = true;
            button.style.opacity = '0.5';
        } else {
            button.textContent = 'Lesson Overview';
            button.onclick = null;
            button.disabled = true;
            button.style.opacity = '0.5';
        }

        panel.classList.add('show');
    }

    startComponent(componentName) {
        console.log(`🚀 Starting component: ${componentName}`);

        if (!this.componentProgress[componentName] || !this.componentProgress[componentName].unlocked) {
            console.log('❌ Component not unlocked yet');
            return;
        }

        // Create component screen
        this.currentScreen = 1; // Component screen
        this.screenHistory.push(0); // Remember we came from tree

        const container = document.getElementById('screenContainer');
        const componentData = this.lessonData.components[componentName];

        // Render mobile-optimized component directly
        container.innerHTML = this.renderMobileComponent(componentName, componentData);

        this.updateScreenIndicator();
        this.updateNavigationControls();
    }

    // Removed renderRealComponentScreen - using renderMobileComponent directly

    renderMobileComponent(componentName, componentData) {
        switch (componentName) {
            case 'warm_up':
                return this.renderMobileWarmUp(componentData);
            case 'vocabulary':
                return this.renderMobileVocabulary(componentData);
            case 'grammar':
                return this.renderMobileGrammar(componentData);
            case 'reading':
                return this.renderMobileReading(componentData);
            case 'speaking':
                return this.renderMobileSpeaking(componentData);
            case 'quiz':
                return this.renderMobileQuiz(componentData);
            default:
                return this.renderFallbackComponent(componentName, componentData);
        }
    }

    renderMobileWarmUp(data) {
        if (!data.questions || data.questions.length === 0) return '';

        // Initialize warmup state
        this.warmupState = {
            currentQuestion: 0,
            totalQuestions: data.questions.length,
            answers: {},
            data: data
        };

        return this.renderWarmupQuestion();
    }

    renderWarmupQuestion() {
        const { currentQuestion, totalQuestions, data } = this.warmupState;
        const question = data.questions[currentQuestion];
        const progress = ((currentQuestion + 1) / totalQuestions) * 100;

        return `
            <div class="mobile-screen active">
                <!-- Header with progress and close -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitWarmup()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${currentQuestion + 1} of ${totalQuestions}</div>
                    </div>
                </div>

                <!-- Question Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    ${this.renderSingleQuestion(question, currentQuestion)}
                </div>

                <!-- Footer with navigation -->
                <div class="warmup-footer">
                    ${currentQuestion > 0 ?
                `<button class="btn btn-secondary" onclick="mobileApp.previousWarmupQuestion()">Previous</button>` :
                '<div></div>'
            }
                    <button class="btn btn-primary" id="warmupNextBtn" disabled onclick="mobileApp.nextWarmupQuestion()">
                        ${currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        `;
    }

    renderMobileVocabulary(data) {
        if (!data.vocabulary_items || data.vocabulary_items.length === 0) {
            return this.renderFallbackComponent('vocabulary', data);
        }

        // Initialize vocabulary state
        this.vocabularyState = {
            currentWord: 0,
            totalWords: data.vocabulary_items.length,
            completedWords: new Set(),
            currentStep: 'learn', // 'learn' or 'check'
            data: data
        };

        return this.renderVocabularyStep();
    }

    renderVocabularyStep() {
        const { currentStep } = this.vocabularyState;

        if (currentStep === 'learn') {
            return this.renderVocabularyLearn();
        } else if (currentStep === 'check') {
            return this.renderVocabularyCheck();
        }
    }

    renderVocabularyLearn() {
        const { currentWord, totalWords, data } = this.vocabularyState;
        const word = data.vocabulary_items[currentWord];
        const progress = ((currentWord + 0.5) / totalWords) * 100; // Half progress for learn step

        return `
            <div class="mobile-screen active">
                <!-- Header with progress and close -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitVocabulary()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${currentWord + 1} of ${totalWords} • Learn</div>
                    </div>
                </div>

                <!-- Word Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                    <div class="vocabulary-word">
                        <div class="word-display">${word.word}</div>
                        <div class="pronunciation">
                            <button class="audio-btn" onclick="mobileApp.playAudio('${word.word}')">🔊</button>
                            <span>${word.pronunciation?.simple || ''}</span>
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

                <!-- Footer with navigation -->
                <div class="warmup-footer">
                    ${currentWord > 0 ?
                `<button class="btn btn-secondary" onclick="mobileApp.previousVocabStep()">Previous</button>` :
                '<div></div>'
            }
                    <button class="btn btn-primary" onclick="mobileApp.goToVocabCheck()">
                        Got it!
                    </button>
                </div>
            </div>
        `;
    }

    renderVocabularyCheck() {
        const { currentWord, totalWords, data } = this.vocabularyState;
        const word = data.vocabulary_items[currentWord];
        const microCheck = word.micro_check;
        const progress = ((currentWord + 1) / totalWords) * 100; // Full progress after check

        if (!microCheck) {
            // Skip to next word if no micro check
            return this.nextVocabWord();
        }

        return `
            <div class="mobile-screen active">
                <!-- Header with progress and close -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitVocabulary()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${currentWord + 1} of ${totalWords} • Check</div>
                    </div>
                </div>

                <!-- Check Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="micro-check">
                        <div class="check-title">Quick Check</div>
                        <div class="check-question">${microCheck.question}</div>
                        
                        <div class="check-options">
                            ${microCheck.options.map(option => `
                                <label class="check-option" onclick="mobileApp.selectMicroCheck('${option}', '${microCheck.correct}')">
                                    <div class="option-content">
                                        <div class="option-radio"></div>
                                        <span class="option-text">${option}</span>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    <button class="btn btn-secondary" onclick="mobileApp.backToVocabLearn()">Back</button>
                    <div></div>
                </div>
            </div>
        `;
    }

    renderVocabularyWord() {
        const { currentWord, totalWords, data } = this.vocabularyState;
        const word = data.vocabulary_items[currentWord];
        const progress = ((currentWord + 1) / totalWords) * 100;

        return `
            <div class="mobile-screen active">
                <!-- Header with progress and close -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitVocabulary()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${currentWord + 1} of ${totalWords}</div>
                    </div>
                </div>

                <!-- Word Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                    <div class="vocabulary-word">
                        <div class="word-display">${word.word}</div>
                        <div class="pronunciation">
                            <button class="audio-btn" onclick="mobileApp.playAudio('${word.word}')">🔊</button>
                            <span>${word.pronunciation?.simple || ''}</span>
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

                <!-- Footer with navigation -->
                <div class="warmup-footer">
                    ${currentWord > 0 ?
                `<button class="btn btn-secondary" onclick="mobileApp.previousVocabWord()">Previous</button>` :
                '<div></div>'
            }
                    <button class="btn btn-primary" onclick="mobileApp.nextVocabWord()">
                        ${currentWord === totalWords - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        `;
    }

    // Vocabulary navigation methods
    exitVocabulary() {
        console.log('🚪 Exiting vocabulary');
        this.vocabularyState = null;
        this.showTreeView();
    }

    playAudio(word) {
        console.log(`🔊 Playing audio for: ${word}`);
        // Audio implementation would go here
    }

    previousVocabWord() {
        if (this.vocabularyState.currentWord > 0) {
            this.vocabularyState.currentWord--;
            this.vocabularyState.currentStep = 'learn';
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderVocabularyStep();
        }
    }

    nextVocabWord() {
        const { currentWord, totalWords } = this.vocabularyState;

        // Mark current word as completed
        this.vocabularyState.completedWords.add(currentWord);

        if (currentWord < totalWords - 1) {
            // Go to next word
            this.vocabularyState.currentWord++;
            this.vocabularyState.currentStep = 'learn';
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderVocabularyStep();
        } else {
            // Finish vocabulary
            this.finishVocabulary();
        }
    }

    finishVocabulary() {
        console.log('🎉 Vocabulary completed');
        this.completeComponent('vocabulary');
    }

    renderMobileGrammar(data) {
        if (!data.mini_practice || data.mini_practice.length === 0) {
            return this.renderFallbackComponent('grammar', data);
        }

        // Initialize grammar state
        this.grammarState = {
            currentStep: 'explanation', // 'explanation' or 'practice'
            currentQuestion: 0,
            totalQuestions: data.mini_practice.length,
            answers: {},
            correctAnswers: 0,
            data: data
        };

        return this.renderGrammarStep();
    }

    renderGrammarStep() {
        const { currentStep } = this.grammarState;

        if (currentStep === 'explanation') {
            return this.renderGrammarExplanation();
        } else if (currentStep === 'practice') {
            return this.renderGrammarPractice();
        }
    }

    renderGrammarExplanation() {
        const { data } = this.grammarState;
        const explanation = data.explanation;

        return `
            <div class="mobile-screen active">
                <!-- Header with close -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitGrammar()">✕</button>
                    <div class="progress-container">
                        <div class="progress-text">Grammar Rules</div>
                    </div>
                </div>

                <!-- Explanation Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="grammar-explanation">
                        <div class="explanation-title">${data.topic}</div>
                        
                        <div class="explanation-cards">
                            ${explanation.cards.map(card => `
                                <div class="explanation-card">
                                    <div class="card-title">${card.title}</div>
                                    <div class="card-rule">${card.rule}</div>
                                    <div class="card-example">"${card.example}"</div>
                                    ${card.keywords ? `
                                        <div class="card-keywords">
                                            <div class="keywords-label">Key words:</div>
                                            <div class="keywords-list">
                                                ${card.keywords.map(keyword => `
                                                    <span class="keyword-tag">${keyword}</span>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    <div></div>
                    <button class="btn btn-primary" onclick="mobileApp.startGrammarPractice()">
                        Start Practice
                    </button>
                </div>
            </div>
        `;
    }

    renderGrammarPractice() {
        const { currentQuestion, totalQuestions, data } = this.grammarState;
        const question = data.mini_practice[currentQuestion];
        const progress = ((currentQuestion + 1) / totalQuestions) * 100;

        return `
            <div class="mobile-screen active">
                <!-- Header with progress and close -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitGrammar()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${currentQuestion + 1} of ${totalQuestions}</div>
                    </div>
                </div>

                <!-- Question Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="grammar-question">
                        <div class="question-title">${question.question || question.prompt}</div>
                        
                        <div class="question-options">
                            ${question.options.map(option => `
                                <label class="grammar-option" onclick="mobileApp.selectGrammarAnswer('${question.id}', '${option}', '${question.correct || question.correct_answer}')">
                                    <div class="option-content">
                                        <div class="option-radio"></div>
                                        <span class="option-text">${option}</span>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    ${currentQuestion > 0 ?
                `<button class="btn btn-secondary" onclick="mobileApp.previousGrammarQuestion()">Previous</button>` :
                `<button class="btn btn-secondary" onclick="mobileApp.backToGrammarExplanation()">Rules</button>`
            }
                    <div></div>
                </div>
            </div>
        `;
    }

    // Grammar navigation methods
    exitGrammar() {
        console.log('🚪 Exiting grammar');
        this.grammarState = null;
        this.showTreeView();
    }

    startGrammarPractice() {
        this.grammarState.currentStep = 'practice';
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderGrammarStep();
    }

    backToGrammarExplanation() {
        this.grammarState.currentStep = 'explanation';
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderGrammarStep();
    }

    selectGrammarAnswer(questionId, selectedAnswer, correctAnswer) {
        const isCorrect = selectedAnswer === correctAnswer;
        this.grammarState.answers[questionId] = selectedAnswer;

        if (isCorrect) {
            this.grammarState.correctAnswers++;
        }

        // Show inline feedback
        this.showGrammarFeedback(questionId, selectedAnswer, correctAnswer, isCorrect);
    }

    showGrammarFeedback(questionId, selectedAnswer, correctAnswer, isCorrect) {
        const { currentQuestion, totalQuestions, data } = this.grammarState;
        const question = data.mini_practice[currentQuestion];
        const progress = ((currentQuestion + 1) / totalQuestions) * 100;

        const container = document.getElementById('screenContainer');
        container.innerHTML = `
            <div class="mobile-screen active">
                <!-- Header with progress and close -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitGrammar()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${currentQuestion + 1} of ${totalQuestions} • ${isCorrect ? 'Correct!' : 'Try again'}</div>
                    </div>
                </div>

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
                        <div class="inline-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                            <div class="feedback-icon">${isCorrect ? '✅' : '❌'}</div>
                            <div class="feedback-message">
                                ${isCorrect ? 'Great job!' : question.explanation || `The correct answer is "${correctAnswer}"`}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    <button class="btn btn-secondary" onclick="mobileApp.backToGrammarExplanation()">Rules</button>
                    <button class="btn btn-primary" onclick="mobileApp.nextGrammarQuestion()">
                        ${currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        `;
    }

    previousGrammarQuestion() {
        if (this.grammarState.currentQuestion > 0) {
            this.grammarState.currentQuestion--;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderGrammarStep();
        }
    }

    nextGrammarQuestion() {
        const { currentQuestion, totalQuestions } = this.grammarState;

        if (currentQuestion < totalQuestions - 1) {
            // Go to next question
            this.grammarState.currentQuestion++;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderGrammarStep();
        } else {
            // Finish grammar
            this.finishGrammar();
        }
    }

    finishGrammar() {
        const { correctAnswers, totalQuestions } = this.grammarState;
        console.log(`🎉 Grammar completed: ${correctAnswers}/${totalQuestions} correct`);
        this.completeComponent('grammar');
    }

    // Debug methods
    showDebugIndicator() {
        // Add debug indicator to the tree view
        setTimeout(() => {
            const container = document.getElementById('screenContainer');
            if (container && container.innerHTML.includes('Welcome!')) {
                const debugIndicator = `
                    <div style="position: fixed; top: 60px; right: 20px; background: #ef4444; color: white; padding: 8px 12px; border-radius: 20px; font-size: 12px; z-index: 200;">
                        🐛 DEBUG MODE
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', debugIndicator);
            }
        }, 100);
    }

    toggleDebugMode() {
        const currentMode = localStorage.getItem('debugMode') === 'true';
        const newMode = !currentMode;

        localStorage.setItem('debugMode', newMode.toString());
        console.log(`🐛 Debug mode ${newMode ? 'ENABLED' : 'DISABLED'}`);

        // Reload the app to apply changes
        location.reload();
    }

    // New vocabulary methods with micro_check
    goToVocabCheck() {
        this.vocabularyState.currentStep = 'check';
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderVocabularyStep();
    }

    backToVocabLearn() {
        this.vocabularyState.currentStep = 'learn';
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderVocabularyStep();
    }

    selectMicroCheck(selectedOption, correctOption) {
        const isCorrect = selectedOption === correctOption;

        // Update the current screen with inline feedback
        this.showInlineCheckFeedback(selectedOption, correctOption, isCorrect);
    }

    showInlineCheckFeedback(selectedOption, correctOption, isCorrect) {
        const { currentWord, totalWords, data } = this.vocabularyState;
        const word = data.vocabulary_items[currentWord];
        const microCheck = word.micro_check;
        const progress = ((currentWord + 1) / totalWords) * 100;

        const container = document.getElementById('screenContainer');
        container.innerHTML = `
            <div class="mobile-screen active">
                <!-- Header with progress and close -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitVocabulary()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${currentWord + 1} of ${totalWords} • ${isCorrect ? 'Correct!' : 'Try again'}</div>
                    </div>
                </div>

                <!-- Check Content with Feedback -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="micro-check">
                        <div class="check-title">Quick Check</div>
                        <div class="check-question">${microCheck.question}</div>
                        
                        <div class="check-options">
                            ${microCheck.options.map(option => {
            let optionClass = 'check-option';
            let optionStyle = '';

            if (option === selectedOption) {
                if (isCorrect) {
                    optionClass += ' correct-answer';
                    optionStyle = 'border-color: #10b981; background: #dcfce7;';
                } else {
                    optionClass += ' incorrect-answer';
                    optionStyle = 'border-color: #ef4444; background: #fef2f2;';
                }
            } else if (option === correctOption && !isCorrect) {
                optionClass += ' correct-answer';
                optionStyle = 'border-color: #10b981; background: #dcfce7;';
            }

            return `
                                    <div class="${optionClass}">
                                        <div class="option-content" style="${optionStyle}">
                                            <div class="option-radio ${option === selectedOption ? 'selected' : ''} ${option === correctOption ? 'correct' : ''}"></div>
                                            <span class="option-text">${option}</span>
                                            ${option === correctOption ? '<span class="correct-indicator">✓</span>' : ''}
                                            ${option === selectedOption && !isCorrect ? '<span class="incorrect-indicator">✗</span>' : ''}
                                        </div>
                                    </div>
                                `;
        }).join('')}
                        </div>

                        <!-- Inline Feedback -->
                        <div class="inline-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                            <div class="feedback-icon">${isCorrect ? '✅' : '❌'}</div>
                            <div class="feedback-message">
                                ${isCorrect ?
                microCheck.feedback?.correct || 'Great job!' :
                microCheck.feedback?.incorrect || `The correct answer is "${correctOption}"`
            }
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    <button class="btn btn-secondary" onclick="mobileApp.backToVocabLearn()">Back</button>
                    <button class="btn btn-primary" onclick="mobileApp.nextVocabWord()">
                        ${currentWord === totalWords - 1 ? 'Finish' : 'Next Word'}
                    </button>
                </div>
            </div>
        `;
    }

    goToVocabCheck() {
        this.vocabularyState.currentStep = 'check';
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderVocabularyStep();
    }

    backToVocabLearn() {
        this.vocabularyState.currentStep = 'learn';
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderVocabularyStep();
    }

    selectMicroCheck(selectedOption, correctOption) {
        const isCorrect = selectedOption === correctOption;
        const { currentWord, totalWords } = this.vocabularyState;

        // Show feedback
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderVocabularyCheckWithFeedback(selectedOption, correctOption, isCorrect);

        // Auto-advance after showing feedback
        setTimeout(() => {
            this.nextVocabWord();
        }, 2000);
    }

    renderVocabularyCheckWithFeedback(selectedOption, correctOption, isCorrect) {
        const { currentWord, totalWords, data } = this.vocabularyState;
        const word = data.vocabulary_items[currentWord];
        const microCheck = word.micro_check;
        const progress = ((currentWord + 1) / totalWords) * 100;

        return `
            <div class="mobile-screen active">
                <!-- Header with progress -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitVocabulary()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${currentWord + 1} of ${totalWords} • Check</div>
                    </div>
                </div>

                <!-- Check Content with Feedback -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="micro-check">
                        <div class="check-title">Quick Check</div>
                        <div class="check-question">${microCheck.question}</div>
                        
                        <div class="check-options">
                            ${microCheck.options.map(option => {
            let optionClass = 'check-option';
            let optionStyle = '';

            if (option === selectedOption && isCorrect) {
                optionClass += ' correct-answer';
                optionStyle = 'border-color: #10b981; background: #dcfce7;';
            } else if (option === selectedOption && !isCorrect) {
                optionClass += ' incorrect-answer';
                optionStyle = 'border-color: #ef4444; background: #fef2f2;';
            } else if (option === correctOption && !isCorrect) {
                optionClass += ' correct-answer';
                optionStyle = 'border-color: #10b981; background: #dcfce7;';
            }

            return `
                                    <div class="${optionClass}">
                                        <div class="option-content" style="${optionStyle}">
                                            <div class="option-radio ${option === selectedOption ? 'selected' : ''} ${option === correctOption ? 'correct' : ''}"></div>
                                            <span class="option-text">${option}</span>
                                            ${option === correctOption ? '<span class="correct-indicator">✓</span>' : ''}
                                            ${option === selectedOption && !isCorrect ? '<span class="incorrect-indicator">✗</span>' : ''}
                                        </div>
                                    </div>
                                `;
        }).join('')}
                        </div>

                        <!-- Inline Feedback -->
                        <div class="inline-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                            <div class="feedback-icon">${isCorrect ? '✅' : '❌'}</div>
                            <div class="feedback-message">
                                ${isCorrect ?
                microCheck.feedback?.correct || 'Great job!' :
                microCheck.feedback?.incorrect || `The correct answer is "${correctOption}"`
            }
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    <button class="btn btn-secondary" onclick="mobileApp.backToVocabLearn()">Back</button>
                    <button class="btn btn-primary" onclick="mobileApp.nextVocabWord()">
                        ${currentWord === totalWords - 1 ? 'Finish' : 'Next Word'}
                    </button>
                </div>
            </div>
        `;
    }

    previousVocabStep() {
        if (this.vocabularyState.currentStep === 'check') {
            this.vocabularyState.currentStep = 'learn';
        } else if (this.vocabularyState.currentWord > 0) {
            this.vocabularyState.currentWord--;
            this.vocabularyState.currentStep = 'learn';
        }

        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderVocabularyStep();
    }

    renderMobileReading(data) {
        if (!data.passage || !data.comprehension_checks) {
            return this.renderFallbackComponent('reading', data);
        }

        // Initialize reading state
        this.readingState = {
            currentStep: 'passage', // 'passage' or 'questions'
            currentQuestion: 0,
            totalQuestions: data.comprehension_checks.length,
            answers: {},
            correctAnswers: 0,
            data: data
        };

        return this.renderReadingStep();
    }

    renderReadingStep() {
        const { currentStep } = this.readingState;

        if (currentStep === 'passage') {
            return this.renderReadingPassage();
        } else if (currentStep === 'questions') {
            return this.renderReadingQuestion();
        }
    }

    renderReadingPassage() {
        const { data } = this.readingState;
        const passage = data.passage;

        // Split passage text into paragraphs
        const passageParagraphs = passage.text.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');

        return `
            <div class="mobile-screen active">
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitReading()">✕</button>
                    <div class="progress-container">
                        <div class="progress-text">Reading Passage</div>
                    </div>
                </div>

                <div class="screen-content" style="padding: 16px; flex: 1; overflow-y: auto; background-color: #f3f4f6;">
                    <div class="reading-passage-card">
                        <h2 class="passage-title-reading">${passage.title}</h2>
                        <div class="passage-meta-reading">
                            <span>📖 ${passage.word_count} words</span>
                            <span>⏱️ ${passage.reading_time}</span>
                        </div>
                        <div class="passage-text-reading">
                            ${passageParagraphs}
                        </div>
                    </div>
                </div>

                <div class="warmup-footer">
                    <button class="btn btn-primary btn-lg" onclick="mobileApp.startReadingQuestions()">
                        Start Questions
                    </button>
                </div>
            </div>
        `;
    }

    renderReadingQuestion() {
        const { currentQuestion, totalQuestions, data } = this.readingState;
        const question = data.comprehension_checks[currentQuestion];
        const progress = ((currentQuestion + 1) / totalQuestions) * 100;

        return `
            <div class="mobile-screen active">
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitReading()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">Question ${currentQuestion + 1} of ${totalQuestions}</div>
                    </div>
                </div>

                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: flex-start;">
                    ${this.renderReadingQuestionContent(question)}
                </div>

                <div class="warmup-footer">
                    ${currentQuestion > 0 ?
                `<button class="btn btn-secondary" onclick="mobileApp.previousReadingQuestion()">Previous</button>` :
                `<button class="btn btn-secondary" onclick="mobileApp.backToPassage()">Passage</button>`
            }
                    <button class="btn btn-primary" id="readingNextBtn" disabled onclick="mobileApp.nextReadingQuestion()">
                        ${currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        `;
    }

    renderReadingQuestionContent(question) {
        const questionText = question.question || question.statement;
        const answerData = this.readingState.answers[question.id];
        const isSubmitted = answerData?.submitted;
        const correctAnswer = question.correct || question.correct_answer;

        let optionsHtml = '';
        let feedbackBox = '';

        // Logic for Multiple Choice and True/False
        if (question.type === 'true_false' || question.type === 'multiple_choice') {
            const options = question.type === 'true_false' ? [true, false] : question.options;
            
            optionsHtml = options.map(option => {
                const type = typeof option === 'boolean' ? 'boolean' : 'string';
                const escapedOption = type === 'string' ? option.replace(/'/g, "'") : option;
                let optionClass = 'option-label-reading';
                let clickHandler = `onclick="mobileApp.selectReadingAnswer('${question.id}', ${type === 'boolean' ? option : `'${escapedOption}'`})"`;

                if (isSubmitted) {
                    const userAnswer = answerData.answer;
                    const isSelected = String(userAnswer) === String(option);
                    const isCorrectOption = String(correctAnswer) === String(option);
                    
                    clickHandler = ''; // Disable click after submission
                    if (isSelected) {
                        optionClass += (String(userAnswer) === String(correctAnswer)) ? ' correct' : ' incorrect';
                    } else if (isCorrectOption) {
                        optionClass += ' correct';
                    }
                }

                return `<div class="${optionClass}" ${clickHandler}><div class="option-radio-reading-container"><div class="option-radio-reading"></div></div><span class="option-text-reading">${option}</span></div>`;
            }).join('');

            if (isSubmitted) {
                 const isAnswerCorrect = String(answerData.answer) === String(correctAnswer);
                 feedbackBox = `<div class="inline-feedback ${isAnswerCorrect ? 'correct' : 'incorrect'}" style="margin-top: 24px;"><div class="feedback-icon">${isAnswerCorrect ? '✅' : '❌'}</div><div class="feedback-message">${isAnswerCorrect ? (question.feedback?.correct || 'Correct!') : (question.feedback?.incorrect || `The correct answer was: "${correctAnswer}" `)}</div></div>`;
            }
        // Logic for Short Answer
        } else if (question.type === 'short_answer') {
            const userAnswer = answerData?.answer || '';
            const isAnswerCorrect = isSubmitted ? (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) : false;

            optionsHtml = `<textarea class="question-textarea-reading" placeholder="Type your answer here..." rows="5" data-question-id="${question.id}" oninput="mobileApp.handleReadingInput()" ${isSubmitted ? 'disabled' : ''}>${userAnswer}</textarea>`;
            
            if (isSubmitted) {
                feedbackBox = `<div class="inline-feedback ${isAnswerCorrect ? 'correct' : 'incorrect'}" style="margin-top: 24px;"><div class="feedback-icon">${isAnswerCorrect ? '✅' : '❌'}</div><div class="feedback-message">${isAnswerCorrect ? (question.feedback?.correct || 'Correct!') : (question.feedback?.incorrect || `The correct answer is: "${correctAnswer}" `)}</div></div>`;
            }
        }

        return `
            <div class="reading-question">
                <div class="question-title-reading">${questionText}</div>
                <div class="question-options-reading ${isSubmitted ? 'disabled' : ''}">
                    ${optionsHtml}
                </div>
                ${feedbackBox}
            </div>
        `;
    }

    renderMobileGrammar(data) {
        if (!data.mini_practice || data.mini_practice.length === 0) {
            return this.renderFallbackComponent('grammar', data);
        }

        // Initialize grammar state
        this.grammarState = {
            currentStep: 'explanation', // 'explanation' or 'practice'
            currentQuestion: 0,
            totalQuestions: data.mini_practice.length,
            answers: {},
            correctAnswers: 0,
            data: data
        };

        return this.renderGrammarStep();
    }

    renderGrammarStep() {
        const { currentStep } = this.grammarState;

        if (currentStep === 'explanation') {
            return this.renderGrammarExplanation();
        } else if (currentStep === 'practice') {
            return this.renderGrammarPractice();
        }
    }

    renderGrammarExplanation() {
        const { data } = this.grammarState;
        const explanation = data.explanation;

        return `
            <div class="mobile-screen active">
                <!-- Header with close -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitGrammar()">✕</button>
                    <div class="progress-container">
                        <div class="progress-text">Grammar Rules</div>
                    </div>
                </div>

                <!-- Explanation Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="grammar-explanation">
                        <div class="explanation-title">${data.description}</div>
                        
                        <div class="explanation-cards">
                            ${explanation.cards.map(card => `
                                <div class="explanation-card">
                                    <div class="card-title">${card.title}</div>
                                    <div class="card-rule">${card.rule}</div>
                                    <div class="card-example">"${card.example}"</div>
                                    ${card.keywords ? `
                                        <div class="card-keywords">
                                            <div class="keywords-label">Key words:</div>
                                            <div class="keywords-list">
                                                ${card.keywords.map(keyword => `
                                                    <span class="keyword-tag">${keyword}</span>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    <div></div>
                    <button class="btn btn-primary" onclick="mobileApp.startGrammarPractice()">
                        Start Practice
                    </button>
                </div>
            </div>
        `;
    }

    renderGrammarPractice() {
        const { currentQuestion, totalQuestions, data } = this.grammarState;
        const question = data.mini_practice[currentQuestion];
        const progress = ((currentQuestion + 1) / totalQuestions) * 100;

        return `
            <div class="mobile-screen active">
                <!-- Header with progress -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitGrammar()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${currentQuestion + 1} of ${totalQuestions}</div>
                    </div>
                </div>

                <!-- Question Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="grammar-question">
                        <div class="question-title">${question.question||question.prompt}</div>
                        <div class="question-options">
                            ${question.options.map(option => `
                                <label class="option-label" onclick="mobileApp.selectGrammarAnswer('${question.id}', '${option}')">
                                    <div class="option-content">
                                        <div class="option-radio ${this.grammarState.answers[question.id] === option ? 'checked' : ''}"></div>
                                        <span class="option-text">${option}</span>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    ${currentQuestion > 0 ?
                `<button class="btn btn-secondary" onclick="mobileApp.previousGrammarQuestion()">Previous</button>` :
                `<button class="btn btn-secondary" onclick="mobileApp.backToGrammarExplanation()">Back</button>`
            }
                    <button class="btn btn-primary" id="grammarNextBtn" disabled onclick="mobileApp.nextGrammarQuestion()">
                        ${currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        `;
    }

    renderMobileSpeaking(data) {
        if (!data.tasks || data.tasks.length === 0) {
            return this.renderFallbackComponent('speaking', data);
        }

        // Initialize speaking state
        this.speakingState = {
            currentTask: 0,
            totalTasks: data.tasks.length,
            responses: {},
            data: data
        };

        return this.renderSpeakingTask();
    }

    renderSpeakingTask() {
        const { currentTask, totalTasks, data } = this.speakingState;
        const task = data.tasks[currentTask];
        const progress = ((currentTask + 1) / totalTasks) * 100;

        return `
            <div class="mobile-screen active">
                <!-- Header with progress -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitSpeaking()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">${currentTask + 1} of ${totalTasks}</div>
                    </div>
                </div>

                <!-- Task Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div class="speaking-task">
                        <div class="task-title">${task.prompt}</div>
                        
                        ${task.frame ? `
                            <div class="task-frame">
                                <div class="frame-label">Use this frame:</div>
                                <div class="frame-text">${task.frame}</div>
                            </div>
                        ` : ''}

                        ${task.vocabulary_hints ? `
                            <div class="vocabulary-hints">
                                <div class="hints-label">Helpful words:</div>
                                <div class="hints-list">
                                    ${task.vocabulary_hints.map(hint => `
                                        <span class="hint-tag">${hint}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <div class="task-input">
                            ${task.input_type === 'audio_record' ? `
                                <div class="audio-recorder">
                                    <button class="record-btn" onclick="mobileApp.toggleRecording('${task.id}')">
                                        🎤 Start Recording
                                    </button>
                                    <div class="recording-info">Max ${task.max_duration}s</div>
                                </div>
                            ` : `
                                <textarea 
                                    class="speaking-textarea"
                                    placeholder="Type your response..."
                                    maxlength="${task.max_length || 200}"
                                    rows="4"
                                    data-task-id="${task.id}"
                                    oninput="mobileApp.handleSpeakingInput()">${this.speakingState.responses[task.id] || ''}</textarea>
                                <div class="char-counter">
                                    <span class="char-count">${(this.speakingState.responses[task.id] || '').length}</span>/${task.max_length || 200} characters
                                </div>
                            `}
                        </div>

                        ${task.sample_answer ? `
                            <div class="sample-answer">
                                <button class="btn btn-outline" onclick="mobileApp.showSampleAnswer('${task.id}')">
                                    Show Sample Answer
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    ${currentTask > 0 ?
                `<button class="btn btn-secondary" onclick="mobileApp.previousSpeakingTask()">Previous</button>` :
                '<div></div>'
            }
                    <button class="btn btn-primary" id="speakingNextBtn" onclick="mobileApp.nextSpeakingTask()">
                        ${currentTask === totalTasks - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        `;
    }

    renderMobileQuiz(data) {
        if (!data.questions || data.questions.length === 0) {
            return this.renderFallbackComponent('quiz', data);
        }

        // Initialize quiz state
        this.quizState = {
            currentQuestion: 0,
            totalQuestions: data.questions.length,
            answers: {},
            score: 0,
            data: data
        };

        return this.renderQuizQuestion();
    }

    renderQuizQuestion() {
        const { currentQuestion, totalQuestions, data } = this.quizState;
        const question = data.questions[currentQuestion];
        const progress = ((currentQuestion + 1) / totalQuestions) * 100;

        return `
            <div class="mobile-screen active">
                <!-- Header with progress -->
                <div class="warmup-header">
                    <button class="close-btn" onclick="mobileApp.exitQuiz()">✕</button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">Quiz ${currentQuestion + 1} of ${totalQuestions}</div>
                    </div>
                </div>

                <!-- Question Content -->
                <div class="screen-content" style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    ${this.renderQuizQuestionContent(question)}
                </div>

                <!-- Footer -->
                <div class="warmup-footer">
                    ${currentQuestion > 0 ?
                `<button class="btn btn-secondary" onclick="mobileApp.previousQuizQuestion()">Previous</button>` :
                '<div></div>'
            }
                    <button class="btn btn-primary" id="quizNextBtn" disabled onclick="mobileApp.nextQuizQuestion()">
                        ${currentQuestion === totalQuestions - 1 ? 'Finish Quiz' : 'Next'}
                    </button>
                </div>
            </div>
        `;
    }

    renderQuizQuestionContent(question) {
        if (question.type === 'multiple_choice') {
            return `
                <div class="quiz-question">
                    <div class="question-title">${question.question}</div>
                    <div class="question-options">
                        ${question.options.map(option => `
                            <label class="option-label" onclick="mobileApp.selectQuizAnswer('${question.id}', '${option}')">
                                <div class="option-content">
                                    <div class="option-radio ${this.quizState.answers[question.id] === option ? 'checked' : ''}"></div>
                                    <span class="option-text">${option}</span>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (question.type === 'fill_blank') {
            return `
                <div class="quiz-question">
                    <div class="question-title">${question.question||question.prompt}</div>
                    <div class="fill-blank-options">
                        ${question.blanks[0].options.map(option => `
                            <label class="option-label" onclick="mobileApp.selectQuizAnswer('${question.id}', '${option}')">
                                <div class="option-content">
                                    <div class="option-radio ${this.quizState.answers[question.id] === option ? 'checked' : ''}"></div>
                                    <span class="option-text">${option}</span>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        return '';
    }

    renderSingleQuestion(question, index) {
        if (question.type === 'open_text') {
            return `
                <div class="single-question">
                    <h2 class="question-title">${question.question}</h2>
                    <textarea 
                        class="question-textarea"
                        placeholder="${question.placeholder || 'Your answer...'}"
                        maxlength="${question.max_length || 200}"
                        rows="6"
                        data-question-id="${question.id}"
                        oninput="mobileApp.handleQuestionInput()">${this.warmupState.answers[question.id] || ''}</textarea>
                    <div class="char-counter">
                        <span class="char-count">${(this.warmupState.answers[question.id] || '').length}</span>/${question.max_length || 200} characters
                    </div>
                </div>
            `;
        } else if (question.type === 'multiple_choice') {
            return `
                <div class="single-question">
                    <h2 class="question-title">${question.question}</h2>
                    <div class="question-options">
                        ${(question.options || []).map(option => `
                            <label class="option-label ${this.warmupState.answers[question.id] === option ? 'selected' : ''}" 
                                   onclick="mobileApp.selectOption('${question.id}', '${option}')">
                                <div class="option-content">
                                    <div class="option-radio ${this.warmupState.answers[question.id] === option ? 'checked' : ''}"></div>
                                    <span class="option-text">${option}</span>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        return '';
    }

    renderMobileQuestion(question, index) {
        if (question.type === 'open_text') {
            return `
                <div class="mobile-question" style="margin-bottom: 32px;" data-question-id="${question.id}">
                    <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px; text-align: left;">
                        ${index + 1}. ${question.question}
                    </h3>
                    <textarea 
                        class="mobile-textarea"
                        placeholder="${question.placeholder || 'Your answer...'}"
                        maxlength="${question.max_length || 200}"
                        rows="4"
                        data-question-id="${question.id}"
                        style="width: 100%; min-height: 80px; padding: 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 16px; resize: none; font-family: inherit;"
                        oninput="mobileApp.handleWarmupInput()"></textarea>
                    <div style="text-align: right; font-size: 12px; color: #999; margin-top: 4px;">
                        <span class="char-count">0</span>/${question.max_length || 200} characters
                    </div>
                </div>
            `;
        } else if (question.type === 'multiple_choice') {
            return `
                <div class="mobile-question" style="margin-bottom: 32px;" data-question-id="${question.id}">
                    <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px; text-align: left;">
                        ${index + 1}. ${question.question}
                    </h3>
                    <div class="mobile-options">
                        ${(question.options || []).map(option => `
                            <label class="mobile-option" style="display: block; margin-bottom: 12px; cursor: pointer;">
                                <div style="display: flex; align-items: center; padding: 16px; border: 2px solid #e5e7eb; border-radius: 12px; background: white; transition: all 0.2s ease;">
                                    <input type="radio" 
                                           name="${question.id}" 
                                           value="${option}"
                                           style="width: 20px; height: 20px; margin-right: 12px; accent-color: #3b82f6;"
                                           onchange="mobileApp.handleWarmupInput()">
                                    <span style="font-size: 16px; color: #374151;">${option}</span>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        return '';
    }

    // Removed initializeComponent - using direct mobile rendering instead

    renderFallbackComponent(componentName, componentData) {
        return `
            <div style="text-align: center; padding: 40px 20px;">
                <div class="emoji">${this.getComponentIcon(componentName)}</div>
                <div class="title">${componentData.title}</div>
                <div class="subtitle">${componentData.description}</div>
                <div class="subtitle">⏱️ ${componentData.estimated_time}</div>
                <button class="btn btn-primary" onclick="mobileApp.completeComponent('${componentName}')" style="margin-top: 32px;">
                    Complete ${componentData.title}
                </button>
            </div>
        `;
    }

    // Removed setupComponentListeners - using direct completion handling

    // Warmup navigation methods
    exitWarmup() {
        console.log('🚪 Exiting warmup');
        this.warmupState = null;
        this.showTreeView();
    }

    handleQuestionInput() {
        const textarea = document.querySelector('.question-textarea');
        if (textarea) {
            const questionId = textarea.dataset.questionId;
            this.warmupState.answers[questionId] = textarea.value;

            // Update character count
            const charCount = document.querySelector('.char-count');
            if (charCount) {
                charCount.textContent = textarea.value.length;
            }

            // Enable/disable next button
            this.updateNextButton();
        }
    }

    selectOption(questionId, option) {
        console.log(`Selected: ${questionId} = ${option}`);
        this.warmupState.answers[questionId] = option;

        // Update UI
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderWarmupQuestion();

        // Enable next button
        this.updateNextButton();
    }

    updateNextButton() {
        const nextBtn = document.getElementById('warmupNextBtn');
        const currentQuestion = this.warmupState.data.questions[this.warmupState.currentQuestion];
        const hasAnswer = this.warmupState.answers[currentQuestion.id];

        if (nextBtn) {
            nextBtn.disabled = !hasAnswer || (hasAnswer && hasAnswer.trim().length === 0);
            nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
        }
    }

    previousWarmupQuestion() {
        if (this.warmupState.currentQuestion > 0) {
            this.warmupState.currentQuestion--;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderWarmupQuestion();
            this.updateNextButton();
        }
    }

    nextWarmupQuestion() {
        const { currentQuestion, totalQuestions } = this.warmupState;

        if (currentQuestion < totalQuestions - 1) {
            // Go to next question
            this.warmupState.currentQuestion++;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderWarmupQuestion();
            this.updateNextButton();
        } else {
            // Finish warmup
            this.finishWarmup();
        }
    }

    finishWarmup() {
        const answeredCount = Object.keys(this.warmupState.answers).length;
        const required = this.warmupState.data.completion_rule.value;

        console.log(`Warmup finished: ${answeredCount}/${this.warmupState.totalQuestions} answered, ${required} required`);

        if (answeredCount >= required) {
            this.completeComponent('warm_up');
        } else {
            // Show completion screen with option to continue
            this.showWarmupIncomplete(answeredCount, required);
        }
    }

    showWarmupIncomplete(answered, required) {
        const container = document.getElementById('screenContainer');
        container.innerHTML = `
            <div class="mobile-screen active">
                <div class="screen-content" style="text-align: center; padding: 40px 24px;">
                    <div class="emoji">📝</div>
                    <div class="title">Almost done!</div>
                    <div class="subtitle">You answered ${answered} questions, but ${required} are required to continue.</div>
                    <div style="margin-top: 32px;">
                        <button class="btn btn-primary" onclick="mobileApp.completeComponent('warm_up')" style="margin-bottom: 12px;">
                            Continue Anyway
                        </button>
                        <button class="btn btn-secondary" onclick="mobileApp.showTreeView()">
                            Back to Menu
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Reading navigation methods
    exitReading() {
        console.log('🚪 Exiting reading');
        this.readingState = null;
        this.showTreeView();
    }

    startReadingQuestions() {
        this.readingState.currentStep = 'questions';
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderReadingStep();
    }

    backToPassage() {
        this.readingState.currentStep = 'passage';
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderReadingStep();
    }

    selectReadingAnswer(questionId, selectedAnswer) {
        // Prevent re-answering if already submitted
        if (this.readingState.answers[questionId]?.submitted) {
            return;
        }

        // Store the answer and mark as submitted
        this.readingState.answers[questionId] = {
            answer: selectedAnswer,
            submitted: true
        };

        // Re-render the entire question screen to show feedback
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderReadingQuestion();

        // Enable the next button
        this.updateReadingNextButton();
    }

    handleReadingInput() {
        const textarea = document.querySelector('.question-textarea-reading');
        if (textarea) {
            const questionId = textarea.dataset.questionId;
            this.readingState.answers[questionId] = {
                answer: textarea.value,
                submitted: false
            };
            this.updateReadingNextButton();
        }
    }

    updateReadingNextButton() {
        const nextBtn = document.getElementById('readingNextBtn');
        if (!nextBtn) return;

        const currentQuestionData = this.readingState.data.comprehension_checks[this.readingState.currentQuestion];
        const answerData = this.readingState.answers[currentQuestionData.id];

        let isAnswered = false;
        if (currentQuestionData.type === 'short_answer') {
            isAnswered = answerData && typeof answerData.answer === 'string' && answerData.answer.trim().length > 0;
            if (!answerData?.submitted) {
                nextBtn.textContent = 'Submit';
            } else {
                nextBtn.textContent = 'Next';
            }
        } else {
            isAnswered = answerData && answerData.submitted;
            nextBtn.textContent = 'Next';
        }

        nextBtn.disabled = !isAnswered;
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    }

    previousReadingQuestion() {
        if (this.readingState.currentQuestion > 0) {
            this.readingState.currentQuestion--;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderReadingStep();
        }
    }

    nextReadingQuestion() {
        const { currentQuestion, totalQuestions, data } = this.readingState;
        const question = data.comprehension_checks[currentQuestion];
        const answerData = this.readingState.answers[question.id];

        // If it's an unanswered short_answer, treat this as a "submit" action
        if (question.type === 'short_answer' && !answerData?.submitted) {
            this.readingState.answers[question.id] = {
                ...(answerData || { answer: '' }),
                submitted: true
            };
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderReadingQuestion();
            this.updateReadingNextButton();
            return;
        }

        // Otherwise, proceed to the next question
        if (currentQuestion < totalQuestions - 1) {
            this.readingState.currentQuestion++;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderReadingStep();
        } else {
            this.finishReading();
        }
    }

    finishReading() {
        console.log('🎉 Reading completed');
        this.completeComponent('reading');
    }

    // Grammar navigation methods
    exitGrammar() {
        console.log('🚪 Exiting grammar');
        this.grammarState = null;
        this.showTreeView();
    }

    startGrammarPractice() {
        this.grammarState.currentStep = 'practice';
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderGrammarStep();
    }

    backToGrammarExplanation() {
        this.grammarState.currentStep = 'explanation';
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderGrammarStep();
    }

    selectGrammarAnswer(questionId, answer) {
        this.grammarState.answers[questionId] = answer;
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderGrammarPractice();
        this.updateGrammarNextButton();
    }

    updateGrammarNextButton() {
        const nextBtn = document.getElementById('grammarNextBtn');
        const currentQuestion = this.grammarState.data.mini_practice[this.grammarState.currentQuestion];
        const hasAnswer = this.grammarState.answers[currentQuestion.id];

        if (nextBtn) {
            nextBtn.disabled = !hasAnswer;
            nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
        }
    }

    previousGrammarQuestion() {
        if (this.grammarState.currentQuestion > 0) {
            this.grammarState.currentQuestion--;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderGrammarStep();
        }
    }

    nextGrammarQuestion() {
        const { currentQuestion, totalQuestions } = this.grammarState;

        if (currentQuestion < totalQuestions - 1) {
            this.grammarState.currentQuestion++;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderGrammarStep();
        } else {
            this.finishGrammar();
        }
    }

    finishGrammar() {
        console.log('🎉 Grammar completed');
        this.completeComponent('grammar');
    }

    // Speaking navigation methods
    exitSpeaking() {
        console.log('🚪 Exiting speaking');
        this.speakingState = null;
        this.showTreeView();
    }

    handleSpeakingInput() {
        const textarea = document.querySelector('.speaking-textarea');
        if (textarea) {
            const taskId = textarea.dataset.taskId;
            this.speakingState.responses[taskId] = textarea.value;

            // Update character count
            const charCount = document.querySelector('.char-count');
            if (charCount) {
                charCount.textContent = textarea.value.length;
            }
        }
    }

    toggleRecording(taskId) {
        console.log(`🎤 Toggle recording for task: ${taskId}`);
        // Audio recording implementation would go here
        this.speakingState.responses[taskId] = 'Audio recorded';
    }

    showSampleAnswer(taskId) {
        const task = this.speakingState.data.tasks.find(t => t.id === taskId);
        if (task && task.sample_answer) {
            alert(`Sample Answer:\n\n${task.sample_answer}`);
        }
    }

    previousSpeakingTask() {
        if (this.speakingState.currentTask > 0) {
            this.speakingState.currentTask--;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderSpeakingTask();
        }
    }

    nextSpeakingTask() {
        const { currentTask, totalTasks } = this.speakingState;

        if (currentTask < totalTasks - 1) {
            this.speakingState.currentTask++;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderSpeakingTask();
        } else {
            this.finishSpeaking();
        }
    }

    finishSpeaking() {
        console.log('🎉 Speaking completed');
        this.completeComponent('speaking');
    }

    // Quiz navigation methods
    exitQuiz() {
        console.log('🚪 Exiting quiz');
        this.quizState = null;
        this.showTreeView();
    }

    selectQuizAnswer(questionId, answer) {
        this.quizState.answers[questionId] = answer;
        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderQuizQuestion();
        this.updateQuizNextButton();
    }

    updateQuizNextButton() {
        const nextBtn = document.getElementById('quizNextBtn');
        const currentQuestion = this.quizState.data.questions[this.quizState.currentQuestion];
        const hasAnswer = this.quizState.answers[currentQuestion.id];

        if (nextBtn) {
            nextBtn.disabled = !hasAnswer;
            nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
        }
    }

    previousQuizQuestion() {
        if (this.quizState.currentQuestion > 0) {
            this.quizState.currentQuestion--;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderQuizQuestion();
        }
    }

    nextQuizQuestion() {
        const { currentQuestion, totalQuestions } = this.quizState;

        if (currentQuestion < totalQuestions - 1) {
            this.quizState.currentQuestion++;
            const container = document.getElementById('screenContainer');
            container.innerHTML = this.renderQuizQuestion();
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        // Calculate score
        let score = 0;
        this.quizState.data.questions.forEach(question => {
            const userAnswer = this.quizState.answers[question.id];
            const correctAnswer = question.correct || (question.blanks && question.blanks[0].correct);
            if (userAnswer === correctAnswer) {
                score++;
            }
        });

        this.quizState.score = score;
        console.log(`🎉 Quiz completed with score: ${score}/${this.quizState.totalQuestions}`);

        this.showQuizResults();
    }

    showQuizResults() {
        const { score, totalQuestions, data } = this.quizState;
        const percentage = Math.round((score / totalQuestions) * 100);
        const passingScore = data.config.passing_score;
        const passed = score >= passingScore;

        const container = document.getElementById('screenContainer');
        container.innerHTML = `
            <div class="mobile-screen active">
                <div class="screen-content" style="text-align: center; padding: 40px 24px;">
                    <div class="emoji">${passed ? '🎉' : '📚'}</div>
                    <div class="title">${passed ? 'Great Job!' : 'Keep Learning!'}</div>
                    <div class="subtitle">You scored ${score} out of ${totalQuestions} (${percentage}%)</div>
                    
                    <div style="margin: 32px 0;">
                        <div style="font-size: 16px; color: #666; margin-bottom: 16px;">
                            ${passed ? 'You passed the quiz!' : `You need ${passingScore} correct to pass.`}
                        </div>
                    </div>

                    <div style="margin-top: 32px;">
                        ${passed ? `
                            <button class="btn btn-primary" onclick="mobileApp.completeComponent('quiz')" style="margin-bottom: 12px;">
                                Complete Lesson
                            </button>
                        ` : `
                            <button class="btn btn-primary" onclick="mobileApp.retakeQuiz()" style="margin-bottom: 12px;">
                                Try Again
                            </button>
                        `}
                        <button class="btn btn-secondary" onclick="mobileApp.showTreeView()">
                            Back to Menu
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    retakeQuiz() {
        // Reset quiz state
        this.quizState.currentQuestion = 0;
        this.quizState.answers = {};
        this.quizState.score = 0;

        const container = document.getElementById('screenContainer');
        container.innerHTML = this.renderQuizQuestion();
    }

    completeComponent(componentName) {
        console.log(`🎉 Completing component: ${componentName}`);

        // Mark component as completed
        this.componentProgress[componentName].completed = true;
        this.componentProgress[componentName].progress = this.componentProgress[componentName].total;

        // Unlock next component
        this.unlockNextComponent(componentName);

        // Show completion screen
        this.showCompletionScreen(componentName);

        // Clean up current component
        this.currentComponent = null;
    }

    unlockNextComponent(completedComponent) {
        const componentOrder = ['warm_up', 'vocabulary', 'grammar', 'reading', 'speaking', 'quiz'];
        const currentIndex = componentOrder.indexOf(completedComponent);

        if (currentIndex >= 0 && currentIndex < componentOrder.length - 1) {
            const nextComponent = componentOrder[currentIndex + 1];
            if (this.componentProgress[nextComponent]) {
                this.componentProgress[nextComponent].unlocked = true;
            }
        }
    }

    showCompletionScreen(componentName) {
        const container = document.getElementById('screenContainer');
        container.innerHTML = `
            <div class="mobile-screen active">
                <div class="screen-content">
                    <div class="emoji celebrate">🎉</div>
                    <div class="title">Great job!</div>
                    <div class="subtitle" style="margin-bottom: 48px;">You completed ${this.getComponentTitle(componentName)}!</div>

                    <div class="tree-icon-button" onclick="mobileApp.showTreeView()">
                        <div class="tree-icon">🌳</div>
                        <div class="tree-icon-label">Continue</div>
                    </div>
                    
                    <div class="auto-redirect-notice" style="position: absolute; bottom: 30px; width: 100%; left: 0;">
                        Returning to the lesson in 5 seconds...
                    </div>
                </div>
            </div>
        `;

        this.updateNavigationControls();

        setTimeout(() => {
            // Check if we are still on the completion screen before redirecting
            if (container.querySelector('.auto-redirect-notice')) {
                this.showTreeView();
            }
        }, 5000);
    }

    getComponentIcon(componentName) {
        const icons = {
            warm_up: '🔥',
            vocabulary: '📚',
            grammar: '📝',
            reading: '📖',
            speaking: '🎤',
            quiz: '🏆'
        };
        return icons[componentName] || '📚';
    }

    getComponentTitle(componentName) {
        const titles = {
            warm_up: 'Warm Up',
            vocabulary: 'Vocabulary',
            grammar: 'Grammar',
            reading: 'Reading',
            speaking: 'Speaking',
            quiz: 'Quiz'
        };
        return titles[componentName] || componentName;
    }

    toggleDebugMode() {
        const currentMode = localStorage.getItem('debugMode') === 'true';
        const newMode = !currentMode;

        localStorage.setItem('debugMode', newMode.toString());

        if (newMode) {
            // Enable debug mode - unlock all components
            Object.keys(this.componentProgress).forEach(componentName => {
                this.componentProgress[componentName].unlocked = true;
            });
            console.log('🐛 DEBUG MODE ENABLED: All components unlocked');
        } else {
            // Disable debug mode - reset to normal progression
            this.setupScreens();
            console.log('🔒 DEBUG MODE DISABLED: Normal progression restored');
        }

        // Refresh the tree view
        this.showTreeView();
    }

    updateScreenIndicator() {
        const indicator = document.getElementById('screenIndicator');
        if (indicator) {
            if (this.currentScreen === 0) {
                indicator.textContent = 'Lesson Overview';
            } else {
                indicator.textContent = `Component View`;
            }
        }
    }

    updateNavigationControls() {
        const prevBtn = document.getElementById('prevBtn');
        const treeBtn = document.getElementById('treeBtn');
        const nextBtn = document.getElementById('nextBtn');

        // Check if elements exist before manipulating them
        if (treeBtn) {
            treeBtn.style.display = this.currentScreen === 0 ? 'none' : 'block';
        }

        if (prevBtn) {
            prevBtn.disabled = true;
        }

        if (nextBtn) {
            nextBtn.disabled = true;
        }
    }

    // Navigation methods
    previousScreen() {
        // Implementation for previous screen
        console.log('Previous screen');
    }

    nextScreen() {
        // Implementation for next screen
        console.log('Next screen');
    }
}

// Navigation functions (called from HTML)
function showTreeView() {
    if (window.mobileApp) {
        window.mobileApp.showTreeView();
    }
}

function previousScreen() {
    if (window.mobileApp) {
        window.mobileApp.previousScreen();
    }
}

function nextScreen() {
    if (window.mobileApp) {
        window.mobileApp.nextScreen();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded, initializing mobile app...');
    window.mobileApp = new MobileLessonApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileLessonApp;
}