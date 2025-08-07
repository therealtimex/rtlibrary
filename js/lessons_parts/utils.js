console.log('Loading utils.js...');

// Utility Functions
// Constants are defined in state.js

// Helper function to construct full asset URLs
function getAssetUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    // Use the ASSETS_BASE_URL from state.js
    const baseUrl = 'https://app.realtimex.co/storage/v1/object/public/app_lang_assets_data';
    return `${baseUrl}/${cleanPath}`;
}

// Debug logging function for UI
function debugLog(message) {
    const logDiv = document.getElementById('debug-log');
    if (logDiv) {
        const timestamp = new Date().toLocaleTimeString();
        logDiv.innerHTML += `<div>[${timestamp}] ${message}</div>`;
        logDiv.scrollTop = logDiv.scrollHeight; // Auto-scroll to bottom
    }
    console.log(message); // Keep console.log for browser dev tools
}

// Helper function for asset URLs (fallback if not loaded from JS)
function safeGetAssetUrl(path) {
    if (typeof getAssetUrl === 'function') {
        return getAssetUrl(path);
    }
    // Fallback implementation
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const baseUrl = 'https://app.realtimex.co/storage/v1/object/public/app_lang_assets_data';
    return `${baseUrl}/${cleanPath}`;
}

// Helper to detect device characteristics
function detectDevice() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    return {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
        isIOS: /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream,
        isAndroid: /Android/i.test(userAgent),
        platform: platform
    };
}

// Get a compatible MIME type for MediaRecorder
function getCompatibleMimeType() {
    const { isIOS } = detectDevice();
    // iOS prefers mp4, other platforms work well with webm
    if (isIOS) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
            return 'audio/mp4';
        }
    }

    // Try webm first (better compression)
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        return 'audio/webm;codecs=opus';
    }
    if (MediaRecorder.isTypeSupported('audio/webm')) {
        return 'audio/webm';
    }

    // Fallback to mp4
    if (MediaRecorder.isTypeSupported('audio/mp4')) {
        return 'audio/mp4';
    }

    // Last resort
    return 'audio/wav';
}

// Check if recorded audio is valid using hybrid approach
function isValidAudioRecording(blob, startTime, manualStop = false) {
    // Calculate recording duration
    const recordingDuration = (Date.now() - startTime) / 1000; // in seconds
    debugLog(`Recording duration: ${recordingDuration.toFixed(2)}s, Size: ${blob.size} bytes, Manual stop: ${manualStop}`);

    // If user manually stopped, always accept (they know they spoke)
    if (manualStop) {
        debugLog('Manual stop detected - accepting recording');
        return true;
    }

    // For auto-timeout, check based on duration and size ratio
    if (recordingDuration < 3) {
        // Short recording: just need minimum size
        const MIN_SHORT_SIZE = 30000; // 30KB for < 3s
        if (blob.size < MIN_SHORT_SIZE) {
            debugLog(`Short recording too small: ${blob.size} bytes (minimum: ${MIN_SHORT_SIZE} bytes)`);
            return false;
        }
    } else {
        // For longer recordings, calculate a minimum size based on duration.
        // Use a conservative floor of 10KB/s.
        const MIN_BYTES_PER_SECOND = 10000;
        const calculatedMinSize = MIN_BYTES_PER_SECOND * recordingDuration;

        // We can also set an absolute minimum floor to avoid accepting very short, noisy clips that pass the ratio.
        const MIN_TOTAL_SIZE = Math.max(30000, calculatedMinSize);

        debugLog(`Total size: ${blob.size} bytes (calculated minimum: ${MIN_TOTAL_SIZE.toFixed(0)} bytes for ${recordingDuration.toFixed(2)}s)`);

        if (blob.size < MIN_TOTAL_SIZE) {
            debugLog(`Recording too small for meaningful speech: ${blob.size} bytes < ${MIN_TOTAL_SIZE.toFixed(0)} bytes`);
            return false;
        }
    }

    debugLog('Recording validation passed');
    return true;
}

// Clear recording timer
function clearRecordingTimer() {
    if (recordingTimer) {
        clearTimeout(recordingTimer);
        recordingTimer = null;
    }
}

// Get current audio level for voice detection
function getCurrentAudioLevel() {
    if (!analyser || !dataArray) return 0;

    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    return sum / dataArray.length;
}

// Set progress callback function
function setProgressCallback(callback) {
    if (typeof callback === 'function') {
        progressCallback = callback;
    }
}

// Save pronunciation state for current word
function savePronunciationState(data) {
    const wordId = `${currentActivityIndex}_${currentWordIndex}`;
    const existingState = pronunciationState[wordId] || {};

    pronunciationState[wordId] = {
        ...existingState,
        ...data,
        lastUpdated: new Date().toISOString()
    };

    debugLog(`Pronunciation state saved for word ${wordId}:`, pronunciationState[wordId]);
}

// Initialize voices
function initVoices() {
    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();
        speechSynthesis.onvoiceschanged = () => {
            speechSynthesis.getVoices();
        };
    }
}

// Track vocabulary audio play events
function trackVocabularyAudioPlay(audioPath, button) {
    // Check if we're in vocabulary activity
    if (!learningAnalytics || currentActivityIndex === undefined) return;

    const currentActivity = learningActivities[currentActivityIndex];
    if (!currentActivity) return;

    // Determine the word based on activity type
    let word = 'unknown_word';
    if (currentActivity.type === 'vocabulary' && currentActivity.content && currentActivity.content.words && currentActivity.content.words[currentWordIndex]) {
        word = currentActivity.content.words[currentWordIndex].word;
    } else if (currentActivity.type === 'pronunciation' && currentActivity.content && currentActivity.content.practice_words && currentActivity.content.practice_words[currentWordIndex]) {
        word = currentActivity.content.practice_words[currentWordIndex].word;
    } else if (currentActivity.type === 'warmup' && currentActivity.content && currentActivity.content.title) {
        word = currentActivity.content.title; // For warmup, log the title
    }

    // Track the audio play event using logAudioEvent
    if (typeof learningAnalytics.logAudioEvent === 'function') {
        learningAnalytics.logAudioEvent(word, 'audio_played', {
            audio_path: audioPath,
            activity_type: currentActivity.type,
            button_id: button ? button.id : null,
            timestamp: new Date().toISOString()
        });
        console.log('📊 Logged audio_played event for word:', word, 'path:', audioPath);
    } else {
        console.warn('⚠️ learningAnalytics.logAudioEvent function not found. Cannot log audio play event.');
    }
}

// Load lesson data from external source
function loadLessonData(jsonData) {
    try {
        // Sort original data
        const sortedData = jsonData.sort((a, b) => a.order - b.order);

        // Extract warmup and learning activities
        const originalWarmupData = sortedData.find(item => item.type === 'warmup');
        const originalLearningActivities = sortedData.filter(item => item.type !== 'warmup');

        // Create new restructured learning activities array
        const restructuredActivities = [];

        // 1. Add warmup as first activity
        if (originalWarmupData) {
            restructuredActivities.push({
                id: 'warmup',
                type: 'warmup',
                order: 0,
                content: originalWarmupData.content
            });
        }

        // 2. Add original learning activities (vocabulary, pronunciation, dialog, quiz)
        originalLearningActivities.forEach((activity, index) => {
            restructuredActivities.push({
                ...activity,
                order: index + 1
            });
        });

        // 3. Add congratulations as last activity
        restructuredActivities.push({
            id: 'congratulations',
            type: 'congratulations',
            order: restructuredActivities.length,
            content: {
                title: 'Congratulations!',
                message: 'You have completed all activities successfully!',
                icon: 'trophy'
            }
        });

        // Update global variables
        lessonData = restructuredActivities;
        warmupData = null; // No longer separate
        learningActivities = restructuredActivities; // All activities now

        console.log('Data restructured:', {
            totalActivities: learningActivities.length,
            activities: learningActivities.map(a => ({ type: a.type, order: a.order }))
        });

        // Render with new structure (like in original file)
        renderProgressBar();
        showActivity(0); // Start with warmup

        return restructuredActivities;

    } catch (error) {
        console.error('Error loading lesson data:', error);
        throw error;
    }
}
// Export functions to global scope for HTML onclick handlers
window.getAssetUrl = getAssetUrl;
window.safeGetAssetUrl = safeGetAssetUrl;
window.debugLog = debugLog;
window.detectDevice = detectDevice;
window.loadLessonData = loadLessonData;
window.setProgressCallback = setProgressCallback;
window.savePronunciationState = savePronunciationState;
window.trackVocabularyAudioPlay = trackVocabularyAudioPlay;

// Track viewed_meaning events
function trackMeaningView(word) {
    if (typeof learningAnalytics !== 'undefined' && learningAnalytics.logVocabEvent) {
        learningAnalytics.logVocabEvent(word, 'viewed_meaning', {});
        console.log('📊 Logged viewed_meaning event for word:', word);
    } else {
        console.warn('⚠️ learningAnalytics not available or logVocabEvent not found. Cannot log viewed_meaning event.');
    }
}

// vocabularyTimeTracker is defined in state.js