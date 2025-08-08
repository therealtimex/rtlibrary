console.log('Loading audio.js...');

// Audio functionality
function playAudioFile(audioPath, button = null, trackVocab = true) {
    console.log('🎵 playAudioFile called:', {
        audioPath,
        buttonId: button ? button.id : 'no-id',
        currentIsPlaying: isPlaying,
        trackVocab: trackVocab
    });

    // 📊 Track vocabulary audio play events ONLY if trackVocab is true
    if (trackVocab && typeof trackVocabularyAudioPlay === 'function') {
        trackVocabularyAudioPlay(audioPath, button);
    } else if (trackVocab) {
        // console.warn('trackVocabularyAudioPlay function not found, but trackVocab was true');
    }

    // 📊 UPDATE SESSION ACTIVITY: Reset timeout timer on audio interaction
    if (typeof learningAnalytics !== 'undefined' && learningAnalytics.currentSessionId) {
        learningAnalytics.updateSessionProgress().catch(error => {
            console.error('❌ Failed to update session on audio play:', error);
        });
    }

    stopCurrentAudio();
    resetAllAudioButtonsUI();

    if (audioPath && audioPath.trim() !== '') {
        console.log('🎶 Creating new Audio element...');
        currentAudio = new Audio(audioPath);
        currentAudio.playsInline = true; // Crucial for iOS

        const resetButtonStyle = () => {
            if (button) {
                button.classList.remove('animate-pulse-ring');
                const icon = button.querySelector('i');
                if (icon) {
                    if (button.dataset.originalIcon) {
                        icon.className = button.dataset.originalIcon;
                    } else if (button.id === 'play-all-dialog-btn') {
                        icon.className = 'fas fa-volume-up';
                    } else {
                        icon.className = 'fas fa-play';
                    }
                }
            }
        };

        currentAudio.onloadstart = () => {
            console.log('🎵 Audio loadstart event fired');
            if (button) {
                button.classList.add('animate-pulse-ring');
                const icon = button.querySelector('i');
                if (icon) {
                    if (!button.dataset.originalIcon) {
                        button.dataset.originalIcon = icon.className;
                    }
                    icon.className = 'fas fa-stop';
                }
            }
            isPlaying = true;
            console.log('✅ isPlaying set to true');
        };

        currentAudio.onended = () => {
            console.log('🔚 Audio ended event fired');
            isPlaying = false;
            currentAudio = null;
            resetButtonStyle();

            // Reset warmup button icon specifically
            if (button && button.querySelector('i')) {
                const icon = button.querySelector('i');
                // Check if this is a warmup button by looking at its classes or parent
                const isWarmupButton = button.closest('.animate-slide-in') ||
                    (icon.className && icon.className.includes('ml-0.5'));
                if (isWarmupButton) {
                    icon.className = 'fas fa-play text-white text-sm md:text-xl group-hover:scale-110 transition-transform duration-200 ml-0.5';
                }
            }
        };

        currentAudio.onerror = () => {
            console.warn('❌ Audio file not found, falling back to speech synthesis:', audioPath);
            resetButtonStyle();
            playTextToSpeech(audioPath.split('/').pop().replace('.mp3', ''), button);
        };

        console.log('▶️ Starting audio playback...');
        currentAudio.play().catch(error => {
            console.warn('❌ Audio play failed, falling back to speech synthesis:', error);
            resetButtonStyle();
            playTextToSpeech(audioPath.split('/').pop().replace('.mp3', ''), button);
        });
    } else {
        console.log('⚠️ No valid audio path provided');
    }
}


function playTextToSpeech(text, button = null) {
    if ('speechSynthesis' in window) {
        resetAllAudioButtonsUI();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice =>
            voice.lang.startsWith('en') && voice.name.includes('Google')
        ) || voices.find(voice => voice.lang.startsWith('en'));

        if (englishVoice) {
            utterance.voice = englishVoice;
        }

        const resetButtonStyle = () => {
            if (button) {
                button.classList.remove('animate-pulse-ring');
                const icon = button.querySelector('i');
                if (icon) {
                    if (button.id === 'play-all-dialog-btn') {
                        icon.className = 'fas fa-volume-up';
                    } else {
                        icon.className = 'fas fa-play';
                    }
                }
            }
        };

        utterance.onstart = () => {
            isPlaying = true;
            if (button) {
                button.classList.add('animate-pulse-ring');
                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-stop';
                }
            }
        };

        utterance.onend = () => {
            isPlaying = false;
            currentAudio = null;
            resetButtonStyle();
        };

        utterance.onerror = () => {
            isPlaying = false;
            currentAudio = null;
            resetButtonStyle();
        };

        currentAudio = utterance;
        speechSynthesis.speak(utterance);
    }
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

// Reusable function for toggling audio playback
function toggleAudioPlayback(audioPath, button) {
    // If audio is currently playing, stop it.
    if (isPlaying && currentAudio) {
        stopCurrentAudio();
        resetAllAudioButtonsUI(); // This resets all buttons to their original 'play' state
    } else {
        // Otherwise, play the new audio.
        playAudioFile(audioPath, button);
    }
}

// Warmup functions
function playWarmupAudio(audioPath, button) {
    console.log('🎵 playWarmupAudio called, delegating to toggleAudioPlayback');
    toggleAudioPlayback(audioPath, button);
}


// Function to stop current audio
function stopCurrentAudio() {
    console.log('🔇 stopCurrentAudio called:', {
        currentAudio: currentAudio ? 'exists' : 'null',
        isPlaying: isPlaying,
        audioType: currentAudio ? (currentAudio.pause ? 'HTMLAudioElement' : 'SpeechSynthesisUtterance') : 'none'
    });

    if (currentAudio) {
        if (currentAudio.pause) {
            console.log('⏸️ Pausing HTMLAudioElement...');
            currentAudio.pause();
            currentAudio.currentTime = 0;
        } else if (currentAudio.cancel) {
            console.log('🚫 Canceling SpeechSynthesis...');
            speechSynthesis.cancel();
        }
        currentAudio = null;
        isPlaying = false;
        console.log('✅ Audio stopped successfully, isPlaying:', isPlaying);
    } else {
        console.log('ℹ️ No audio to stop');
    }
}




// iOS Audio Unlock: Must be triggered by a user gesture.
const unlockAudio = () => {
    debugLog('unlockAudio function called.'); // Log when the function itself is called
    // Create AudioContext only if it doesn't exist
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        debugLog('AudioContext created.');
    }

    if (audioContext.state === 'suspended') {
        debugLog('AudioContext is suspended. Attempting to resume...');
        audioContext.resume().then(() => {
            debugLog('AudioContext resumed successfully.');
            // Once unlocked, we don't need this listener anymore.
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        }).catch(e => debugLog(`Failed to resume AudioContext: ${e.message}`));
    } else {
        debugLog('AudioContext is not suspended.');
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    }
};

// Attach unlockAudio to document for initial user gesture
// Use { once: true, passive: true } for better performance and single execution
document.addEventListener('click', unlockAudio, { once: true, passive: true });
document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
// Export functions to global scope for HTML onclick handlers
window.playAudioFile = playAudioFile;
window.playTextToSpeech = playTextToSpeech;
window.toggleAudioPlayback = toggleAudioPlayback;
window.playWarmupAudio = playWarmupAudio;
window.stopCurrentAudio = stopCurrentAudio;
window.initVoices = initVoices;
