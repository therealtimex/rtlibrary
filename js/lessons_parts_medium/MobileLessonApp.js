/**
 * Mobile Lesson App - Refactored Version
 * Main orchestrator for the mobile language learning application
 */

window.MobileLessonApp = class MobileLessonApp {
    constructor() {
        try {
            // Check if all dependencies are loaded
            if (!window.AppConfig) throw new Error('AppConfig not loaded');
            if (!window.StateManager) throw new Error('StateManager not loaded');
            if (!window.LessonDataManager) throw new Error('LessonDataManager not loaded');
            if (!window.UIManager) throw new Error('UIManager not loaded');
            
            console.log('🔧 All dependencies loaded, initializing managers...');
            
            // Initialize managers
            this.config = window.AppConfig;
            this.stateManager = new window.StateManager();
            this.dataManager = new window.LessonDataManager(this.stateManager, this.config);
            this.uiManager = new window.UIManager(this.stateManager, this.config);
        
        // Initialize components
        this.components = new Map();
        this.initializeComponents();
        
        // Bind methods
        this.bindMethods();
        
            // Initialize app
            this.init();
        } catch (error) {
            console.error('❌ Failed to initialize MobileLessonApp:', error);
            document.getElementById('screenContainer').innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h3>⚠️ Initialization Error</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">Reload Page</button>
                </div>
            `;
        }
    }

    /**
     * Initialize components
     */
    initializeComponents() {
        this.components.set('warm_up', new window.WarmUp(this.stateManager, this.uiManager, this.config));
        this.components.set('vocabulary', new window.Vocabulary(this.stateManager, this.uiManager, this.config));
        this.components.set('grammar', new window.Grammar(this.stateManager, this.uiManager, this.config));
        this.components.set('reading', new window.Reading(this.stateManager, this.uiManager, this.config));
        this.components.set('speaking', new window.Speaking(this.stateManager, this.uiManager, this.config));
        this.components.set('quiz', new window.Quiz(this.stateManager, this.uiManager, this.config));
    }

    /**
     * Bind methods to window for HTML onclick handlers
     */
    bindMethods() {
        // Make app available globally
        window.mobileApp = this;
        
        // Bind component methods
        this.startComponent = this.startComponent.bind(this);
        this.exitComponent = this.exitComponent.bind(this);
        this.nextStep = this.nextStep.bind(this);
        this.previousStep = this.previousStep.bind(this);
        
        // Bind component methods
        this.nextWarmupQuestion = this.nextWarmupQuestion.bind(this);
        this.previousWarmupQuestion = this.previousWarmupQuestion.bind(this);
        this.selectWarmupAnswer = this.selectWarmupAnswer.bind(this);
        this.continueFromWarmup = this.continueFromWarmup.bind(this);
        
        // Vocabulary methods
        this.goToVocabCheck = this.goToVocabCheck.bind(this);
        this.backToVocabLearn = this.backToVocabLearn.bind(this);
        this.selectMicroCheck = this.selectMicroCheck.bind(this);
        this.previousVocabStep = this.previousVocabStep.bind(this);
        this.playAudio = this.playAudio.bind(this);
        
        // Grammar methods
        this.startGrammarPractice = this.startGrammarPractice.bind(this);
        this.backToGrammarExplanation = this.backToGrammarExplanation.bind(this);
        this.selectGrammarAnswer = this.selectGrammarAnswer.bind(this);
        this.nextGrammarQuestion = this.nextGrammarQuestion.bind(this);
        this.previousGrammarQuestion = this.previousGrammarQuestion.bind(this);
        
        // Reading methods
        this.startReadingQuestions = this.startReadingQuestions.bind(this);
        this.backToReadingPassage = this.backToReadingPassage.bind(this);
        this.selectReadingAnswer = this.selectReadingAnswer.bind(this);
        this.submitShortAnswer = this.submitShortAnswer.bind(this);
        this.nextReadingQuestion = this.nextReadingQuestion.bind(this);
        this.previousReadingQuestion = this.previousReadingQuestion.bind(this);
        
        // Speaking methods
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.playRecording = this.playRecording.bind(this);
        this.redoRecording = this.redoRecording.bind(this);
        this.showSampleAnswer = this.showSampleAnswer.bind(this);
        this.nextSpeakingTask = this.nextSpeakingTask.bind(this);
        this.previousSpeakingTask = this.previousSpeakingTask.bind(this);
        
        // Quiz methods
        this.selectQuizAnswer = this.selectQuizAnswer.bind(this);
        this.handleQuizBlankInput = this.handleQuizBlankInput.bind(this);
        this.nextQuizQuestion = this.nextQuizQuestion.bind(this);
        this.previousQuizQuestion = this.previousQuizQuestion.bind(this);
        this.finishQuiz = this.finishQuiz.bind(this);
        
        // General methods
        this.handleTextInput = this.handleTextInput.bind(this);
        this.continueFromCompletion = this.continueFromCompletion.bind(this);
    }

    /**
     * Initialize application
     */
    async init() {
        try {
            console.log('🚀 Initializing Mobile Lesson App...');

            // Initialize UI Manager
            this.uiManager.init();

            // Show loading
            this.uiManager.showLoading();

            // Wait for lesson data
            await this.dataManager.waitForLessonData();

            // Show tree view
            this.uiManager.showTreeView();

            console.log('✅ Mobile Lesson App initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.uiManager.showError(error.message || this.config.messages.error.loadFailed);
        }
    }

    /**
     * Start a component
     */
    startComponent(componentName) {
        console.log(`🚀 Starting component: ${componentName}`);

        // Check if component is unlocked
        const componentProgress = this.stateManager.get('componentProgress');
        if (!componentProgress[componentName] || !componentProgress[componentName].unlocked) {
            console.log('❌ Component not unlocked yet');
            return;
        }

        // Get component
        const component = this.components.get(componentName);
        if (!component) {
            console.error(`❌ Component ${componentName} not found`);
            return;
        }

        // Get component data
        const componentData = this.dataManager.getComponentData(componentName);
        if (!componentData) {
            console.error(`❌ No data found for component ${componentName}`);
            return;
        }

        try {
            // Initialize and render component
            component.init(componentData);
            this.uiManager.render(component.render());
            
            // Update current screen
            this.stateManager.set('currentScreen', 1);
            
            // Add to screen history
            const screenHistory = [...this.stateManager.get('screenHistory'), 0];
            this.stateManager.set('screenHistory', screenHistory);

        } catch (error) {
            console.error(`❌ Error starting component ${componentName}:`, error);
            this.uiManager.showError(`Failed to start ${componentName}: ${error.message}`);
        }
    }

    /**
     * Exit component
     */
    exitComponent(componentName) {
        const component = this.components.get(componentName);
        if (component) {
            component.exit();
        }
    }

    /**
     * Next step in component
     */
    nextStep(componentName) {
        const component = this.components.get(componentName);
        if (component && typeof component.nextQuestion === 'function') {
            component.nextQuestion();
        }
    }

    /**
     * Previous step in component
     */
    previousStep(componentName) {
        const component = this.components.get(componentName);
        if (component && typeof component.previousQuestion === 'function') {
            component.previousQuestion();
        }
    }

    // ===== WARMUP METHODS =====

    /**
     * Next warmup question
     */
    nextWarmupQuestion() {
        const warmup = this.components.get('warm_up');
        if (warmup) {
            warmup.nextQuestion();
        }
    }

    /**
     * Previous warmup question
     */
    previousWarmupQuestion() {
        const warmup = this.components.get('warm_up');
        if (warmup) {
            warmup.previousQuestion();
        }
    }

    /**
     * Select warmup answer
     */
    selectWarmupAnswer(questionId, answer) {
        const warmup = this.components.get('warm_up');
        if (warmup) {
            warmup.selectAnswer(questionId, answer);
        }
    }

    /**
     * Handle text input
     */
    handleTextInput(componentName, value) {
        const component = this.components.get(componentName);
        if (component && typeof component.handleTextInput === 'function') {
            component.handleTextInput(value);
        }
    }

    /**
     * Continue from warmup completion
     */
    continueFromWarmup() {
        const warmup = this.components.get('warm_up');
        if (warmup) {
            warmup.continueFromCompletion();
        }
    }

    /**
     * Continue from any component completion
     */
    continueFromCompletion(componentName) {
        console.log('🔄 continueFromCompletion called with:', componentName);
        const component = this.components.get(componentName);
        console.log('📦 Component found:', !!component);
        
        if (component && typeof component.continueFromCompletion === 'function') {
            console.log('✅ Calling component.continueFromCompletion()');
            component.continueFromCompletion();
        } else {
            console.log('⚠️ Using fallback: complete component directly');
            // Fallback: complete the component directly
            this.stateManager.completeComponent(componentName);
            this.showTreeView();
        }
    }

    // ===== VOCABULARY METHODS =====

    goToVocabCheck() {
        const vocabulary = this.components.get('vocabulary');
        if (vocabulary) vocabulary.goToCheck();
    }

    backToVocabLearn() {
        const vocabulary = this.components.get('vocabulary');
        if (vocabulary) vocabulary.backToLearn();
    }

    selectMicroCheck(selectedOption, correctOption) {
        const vocabulary = this.components.get('vocabulary');
        if (vocabulary) vocabulary.selectMicroCheck(selectedOption, correctOption);
    }

    previousVocabStep() {
        const vocabulary = this.components.get('vocabulary');
        if (vocabulary) vocabulary.previousWord();
    }

    playAudio(word) {
        const vocabulary = this.components.get('vocabulary');
        if (vocabulary) vocabulary.playAudio(word);
    }

    // ===== GRAMMAR METHODS =====

    startGrammarPractice() {
        const grammar = this.components.get('grammar');
        if (grammar) grammar.startPractice();
    }

    backToGrammarExplanation() {
        const grammar = this.components.get('grammar');
        if (grammar) grammar.backToExplanation();
    }

    selectGrammarAnswer(questionId, selectedAnswer, correctAnswer) {
        const grammar = this.components.get('grammar');
        if (grammar) grammar.selectGrammarAnswer(questionId, selectedAnswer, correctAnswer);
    }

    nextGrammarQuestion() {
        const grammar = this.components.get('grammar');
        if (grammar) grammar.nextQuestion();
    }

    previousGrammarQuestion() {
        const grammar = this.components.get('grammar');
        if (grammar) grammar.previousQuestion();
    }

    // ===== READING METHODS =====

    startReadingQuestions() {
        const reading = this.components.get('reading');
        if (reading) reading.startQuestions();
    }

    backToReadingPassage() {
        const reading = this.components.get('reading');
        if (reading) reading.backToPassage();
    }

    selectReadingAnswer(questionId, selectedAnswer, correctAnswer) {
        const reading = this.components.get('reading');
        if (reading) reading.selectReadingAnswer(questionId, selectedAnswer, correctAnswer);
    }

    submitShortAnswer(questionId, correctAnswer) {
        const reading = this.components.get('reading');
        if (reading) reading.submitShortAnswer(questionId, correctAnswer);
    }

    nextReadingQuestion() {
        const reading = this.components.get('reading');
        if (reading) reading.nextQuestion();
    }

    previousReadingQuestion() {
        const reading = this.components.get('reading');
        if (reading) reading.previousQuestion();
    }

    // ===== SPEAKING METHODS =====

    startRecording(taskId) {
        const speaking = this.components.get('speaking');
        if (speaking) speaking.startRecording(taskId);
    }

    stopRecording(taskId) {
        const speaking = this.components.get('speaking');
        if (speaking) speaking.stopRecording(taskId);
    }

    playRecording(taskId) {
        const speaking = this.components.get('speaking');
        if (speaking) speaking.playRecording(taskId);
    }

    redoRecording(taskId) {
        const speaking = this.components.get('speaking');
        if (speaking) speaking.redoRecording(taskId);
    }

    showSampleAnswer(taskIndex) {
        const speaking = this.components.get('speaking');
        if (speaking) speaking.showSampleAnswer(taskIndex);
    }

    nextSpeakingTask() {
        const speaking = this.components.get('speaking');
        if (speaking) speaking.nextTask();
    }

    previousSpeakingTask() {
        const speaking = this.components.get('speaking');
        if (speaking) speaking.previousTask();
    }

    // ===== QUIZ METHODS =====

    selectQuizAnswer(questionId, selectedAnswer, correctAnswer) {
        const quiz = this.components.get('quiz');
        if (quiz) quiz.selectQuizAnswer(questionId, selectedAnswer, correctAnswer);
    }

    handleQuizBlankInput(questionId, blankIndex, value) {
        const quiz = this.components.get('quiz');
        if (quiz) quiz.handleQuizBlankInput(questionId, blankIndex, value);
    }

    nextQuizQuestion() {
        const quiz = this.components.get('quiz');
        if (quiz) quiz.nextQuestion();
    }

    previousQuizQuestion() {
        const quiz = this.components.get('quiz');
        if (quiz) quiz.previousQuestion();
    }

    finishQuiz() {
        const quiz = this.components.get('quiz');
        if (quiz) quiz.finishQuiz();
    }

    checkQuizAnswer(questionId) {
        const quiz = this.components.get('quiz');
        if (quiz) {
            quiz.checkAnswer(questionId);
        }
    }

    // ===== UTILITY METHODS =====

    /**
     * Show tree view
     */
    showTreeView() {
        this.uiManager.showTreeView();
    }

    /**
     * Get component
     */
    getComponent(componentName) {
        return this.components.get(componentName);
    }

    /**
     * Get state manager
     */
    getStateManager() {
        return this.stateManager;
    }

    /**
     * Get UI manager
     */
    getUIManager() {
        return this.uiManager;
    }

    /**
     * Get data manager
     */
    getDataManager() {
        return this.dataManager;
    }

    /**
     * Get configuration
     */
    getConfig() {
        return this.config;
    }

    /**
     * Start speaking recording
     */
    startSpeakingRecording(taskIndex) {
        console.log('🎤 startSpeakingRecording called with taskIndex:', taskIndex);
        const speakingComponent = this.components.get('speaking');
        if (speakingComponent) {
            console.log('✅ Speaking component found, calling startRecording');
            speakingComponent.startRecording(taskIndex);
        } else {
            console.error('❌ Speaking component not found');
        }
    }

    /**
     * Stop speaking recording
     */
    stopSpeakingRecording() {
        const speakingComponent = this.components.get('speaking');
        if (speakingComponent) {
            speakingComponent.stopRecording();
        }
    }

    /**
     * Play speaking recording
     */
    playSpeakingRecording(taskId) {
        const speakingComponent = this.components.get('speaking');
        if (speakingComponent) {
            speakingComponent.playRecording(taskId);
        }
    }

    /**
     * Toggle audio playback
     */
    togglePlayback(taskId) {
        const speakingComponent = this.components.get('speaking');
        if (speakingComponent) {
            speakingComponent.togglePlayback(taskId);
        }
    }

    /**
     * Seek audio to specific position
     */
    seekAudio(taskId, event) {
        const speakingComponent = this.components.get('speaking');
        if (speakingComponent) {
            speakingComponent.seekAudio(taskId, event);
        }
    }

    /**
     * Analyze speaking recording
     */
    analyzeSpeakingRecording(taskId) {
        const speakingComponent = this.components.get('speaking');
        if (speakingComponent) {
            speakingComponent.analyzePronunciation(taskId);
        }
    }

    /**
     * Show stored speaking analysis results
     */
    showSpeakingResults(taskId) {
        const speakingComponent = this.components.get('speaking');
        if (speakingComponent) {
            speakingComponent.showStoredResults(taskId);
        }
    }

    /**
     * Close analysis modal and refresh UI
     */
    closeAnalysisModal() {
        // Remove modal
        const modal = document.querySelector('.pronunciation-results-modal');
        if (modal) {
            modal.remove();
        }
        
        // Refresh speaking component to show results button
        const speakingComponent = this.components.get('speaking');
        if (speakingComponent) {
            this.uiManager.render(speakingComponent.render());
        }
    }

    /**
     * Redo speaking recording
     */
    redoSpeakingRecording(taskId) {
        const speakingComponent = this.components.get('speaking');
        if (speakingComponent) {
            speakingComponent.redoRecording(taskId);
        }
    }

    /**
     * Next speaking task
     */
    nextSpeakingTask() {
        const speakingComponent = this.components.get('speaking');
        if (speakingComponent) {
            speakingComponent.nextTask();
        }
    }

    /**
     * Previous speaking task
     */
    previousSpeakingTask() {
        const speakingComponent = this.components.get('speaking');
        if (speakingComponent) {
            speakingComponent.previousTask();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded, initializing refactored mobile app...');
    window.mobileApp = new window.MobileLessonApp();
});

// Make available globally
window.MobileLessonApp = window.MobileLessonApp;