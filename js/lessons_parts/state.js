console.log('Loading state.js...');

// App State
let currentActivityIndex = 0;
let completedActivities = new Set();
let currentWordIndex = 0;
let studiedWords = new Set();
let selectedAnswer = null;
let showResult = false;
let currentAudio = null;
let isPlaying = false;
let lessonData = [];
let warmupData = null;
let learningActivities = [];
let showingDescription = false;
let isDataLoaded = false;
let progressCallback = null;

// Dialog playback state
let isDialogSequencePlaying = false;
let currentDialogLineIndex = 0;
let dialogPlaybackTimeout = null;

// Pronunciation Recorder State
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let recordedBlob = null;
let recordingStream = null;
let audioContext = null; // Declare audioContext globally

// Voice Activity Detection (VAD) constants
const VOICE_THRESHOLD = 15; // Sensitivity for voice detection. Adjust as needed.
const ENDING_SILENCE_TIMEOUT = 3000; // 3 seconds of silence to stop recording.

// Mobile Recording State
let hasDetectedVoice = false;
let recordingTimer = null;
let recordingStartTime = null;
let isManualStop = false;
const MOBILE_RECORDING_TIMEOUT = 5000; // 8 seconds timeout for mobile

// Voice Activity Detection variables
let analyser = null;
let dataArray = null;
let initialSilenceTimer = null;
let voiceDetectionTimer = null;
let voiceCheckInterval = null;

// Pronunciation State Management
let pronunciationState = {};
let currentLessonId = null;

// Base URL for assets
const ASSETS_BASE_URL = 'https://app.realtimex.co/storage/v1/object/public/app_lang_assets_data';

// Activity type mapping
const activityTypes = {
    'vocabulary': { name: 'Vocabulary', icon: 'book-open' },
    'pronunciation': { name: 'Pronunciation', icon: 'microphone' },
    'dialog': { name: 'Dialog', icon: 'comments' },
    'quiz': { name: 'Quiz', icon: 'question-circle' }
};

// Activity type mapping with icons
const activityTypeIcons = {
    'warmup': { name: 'Warmup', icon: 'fas fa-fire', color: 'text-orange-500' },
    'vocabulary': { name: 'Vocabulary', icon: 'fas fa-book-open', color: 'text-blue-500' },
    'pronunciation': { name: 'Pronunciation', icon: 'fas fa-microphone', color: 'text-green-500' },
    'dialog': { name: 'Dialog', icon: 'fas fa-comments', color: 'text-purple-500' },
    'quiz': { name: 'Quiz', icon: 'fas fa-question-circle', color: 'text-red-500' },
    'congratulations': { name: 'Congratulations', icon: 'fas fa-trophy', color: 'text-yellow-500' }
};

// Store original data for restructuring
let originalWarmupData = null;
let originalLearningActivities = [];

// Function references for overriding
let originalLoadLessonData = null;
let originalShowActivity = null;

// Vocabulary time tracking
let vocabularyTimeTracker = {
    currentWord: null,
    startTime: null,
    totalTime: 0,
    wordTimes: new Map(),

    startTracking(word) {
        this.currentWord = word;
        this.startTime = new Date();
        console.log('📊 Started tracking time for word:', word, 'at', this.startTime);
    },

    async endTracking() {
        // Capture current word and start time before any async operations
        const wordToLog = this.currentWord;
        const startTimeToLog = this.startTime;

        // Log 1: Before check
        console.log('📊 endTracking: Checking state before logging:', { currentWord: wordToLog, startTime: startTimeToLog, learningAnalytics: !!learningAnalytics });
        if (!wordToLog || !startTimeToLog || !learningAnalytics) {
            console.log('📊 endTracking: No current word or start time, or analytics not available. Skipping log.', { currentWord: wordToLog, startTime: startTimeToLog, learningAnalytics: !!learningAnalytics });
            return;
        }

        const endTime = new Date();
        const duration = Math.round((endTime - this.startTime) / 1000); // seconds

        console.log('📊 Ending tracking for word:', this.currentWord, 'duration:', duration + 's', 'at', endTime);

        if (typeof learningAnalytics !== 'undefined' && learningAnalytics.logVocabEvent) {
            // Log 2: Before await
            console.log('📊 Calling logVocabEvent for:', this.currentWord);
            await learningAnalytics.logVocabEvent(this.currentWord, 'spent_time', {
                start_time: this.startTime.toISOString(),
                end_time: endTime.toISOString(),
                duration: duration
            });
            // Log 3: After await
            console.log('📊 logVocabEvent completed for:', this.currentWord);
        } else {
            console.warn('⚠️ learningAnalytics.logVocabEvent not available. Event not logged for word:', this.currentWord);
        }

        // Reset only after the logging operation is complete
        this.currentWord = null;
        this.startTime = null;
        console.log('📊 Tracking reset for vocabularyTimeTracker.');
    }
};
