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









// Set progress callback function
function setProgressCallback(callback) {
    if (typeof callback === 'function') {
        progressCallback = callback;
    }
}





// Track vocabulary audio play events (only for vocabulary activity)
function trackVocabularyAudioPlay(audioPath, button) {
    // Check if we're in vocabulary activity
    if (!learningAnalytics || currentActivityIndex === undefined) return;

    const currentActivity = learningActivities[currentActivityIndex];
    if (!currentActivity) return;

    // Only log for vocabulary activity
    if (currentActivity.type !== 'vocabulary') {
        console.log('📊 Skipping audio tracking for non-vocabulary activity:', currentActivity.type);
        return;
    }

    // Get the word from vocabulary activity
    let word = 'unknown_word';
    if (currentActivity.content && currentActivity.content.words && currentActivity.content.words[currentWordIndex]) {
        word = currentActivity.content.words[currentWordIndex].word;
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

        const lessonId = sortedData.length > 0 ? sortedData[0].lesson_id : null;

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
                lesson_id: originalWarmupData.lesson_id, // Preserve lesson_id
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
            lesson_id: lessonId, // Ensure congratulations activity has lesson_id
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