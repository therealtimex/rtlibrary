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
let progressCallback = null; // Callback function for progress updates

// Base URL for assets
const ASSETS_BASE_URL = 'https://app.realtimex.co/storage/v1/object/public/app_lang_assets_data';

// Helper function to construct full asset URLs
function getAssetUrl(path) {
    if (!path) return '';
    // If path already starts with http, return as is
    if (path.startsWith('http')) return path;
    // Remove leading slash if present and combine with base URL
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${ASSETS_BASE_URL}/${cleanPath}`;
}

// Activity type mapping for learning activities only
const activityTypes = {
    'vocabulary': { name: 'Vocabulary', icon: 'book-open' },
    'pronunciation': { name: 'Pronunciation', icon: 'microphone' },
    'dialog': { name: 'Dialog', icon: 'comments' },
    'quiz': { name: 'Quiz', icon: 'question-circle' }
};

// Show different app states
function showLoadingState() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('app-content').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
}

function showAppContent() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('app-content').classList.remove('hidden');
    document.getElementById('error-state').classList.add('hidden');
}

function showErrorState() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('app-content').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
}

function retryLoading() {
    showLoadingState();
    // You can emit an event or call a callback to request data again
    if (typeof window.requestLessonData === 'function') {
        window.requestLessonData();
    }
}



// Set progress callback function
function setProgressCallback(callback) {
    if (typeof callback === 'function') {
        progressCallback = callback;
    }
}

// Audio functionality
function playAudioFile(audioPath, button = null) {
    // Stop any currently playing audio
    stopCurrentAudio();

    if (audioPath && audioPath.trim() !== '') {
        currentAudio = new Audio(audioPath);

        currentAudio.onloadstart = () => {
            if (button) {
                button.classList.add('animate-pulse-ring');
                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-stop';
                }
            }
            isPlaying = true;
        };

        currentAudio.onended = () => {
            isPlaying = false;
            currentAudio = null;
            if (button) {
                button.classList.remove('animate-pulse-ring');
                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-play';
                }
            }
        };

        currentAudio.onerror = () => {
            console.warn('Audio file not found, falling back to speech synthesis:', audioPath);
            playTextToSpeech(audioPath.split('/').pop().replace('.mp3', ''), button);
        };

        currentAudio.play().catch(error => {
            console.warn('Audio playback failed, falling back to speech synthesis:', error);
            playTextToSpeech(audioPath.split('/').pop().replace('.mp3', ''), button);
        });
    }
}

function playTextToSpeech(text, button = null) {
    if ('speechSynthesis' in window) {
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
            if (button) {
                button.classList.remove('animate-pulse-ring');
                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-play';
                }
            }
        };

        // Add error handler for speech synthesis
        utterance.onerror = () => {
            isPlaying = false;
            currentAudio = null;
            if (button) {
                button.classList.remove('animate-pulse-ring');
                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-play';
                }
            }
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

// Load lesson data from external source
function loadLessonData(jsonData) {
    try {
        lessonData = jsonData.sort((a, b) => a.order - b.order);

        // Separate warmup from learning activities
        warmupData = lessonData.find(item => item.type === 'warmup');
        learningActivities = lessonData.filter(item => item.type !== 'warmup');

        if (!warmupData) {
            console.warn('No warmup data found');
        }

        if (learningActivities.length === 0) {
            throw new Error('No learning activities found');
        }

        // Render warmup (always visible)
        renderWarmup();

        // Render progress bar for learning activities only
        renderProgressBar();

        // Start with vocabulary (first learning activity)
        showActivity(0);

    } catch (error) {
        console.error('Error loading lesson data:', error);
        throw error;
    }
}

// Render Warmup (always visible)
function renderWarmup() {
    if (!warmupData) {
        document.getElementById('warmup-container').innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-100">
                <p class="text-gray-500">No warmup content available</p>
            </div>
        `;
        return;
    }

    const warmupContainer = document.getElementById('warmup-container');
    warmupContainer.innerHTML = `
        <img src="${getAssetUrl(warmupData.content.avatar)}" alt="Learning Image" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-center justify-center cursor-pointer transition-all duration-500 hover:from-black/60">
            <div class="flex gap-3 md:gap-6 items-center transform hover:scale-105 transition-transform duration-300">
                <button onclick="playWarmupAudio('${getAssetUrl(warmupData.content.audio)}', this)" title="Listen to description" 
                        class="group relative control-button w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl md:shadow-2xl hover:shadow-blue-500/30 hover:scale-110 hover:from-blue-400 hover:to-blue-500 border-2 border-white/20 backdrop-blur-sm">
                    <i class="fas fa-play text-white text-sm md:text-xl group-hover:scale-110 transition-transform duration-200 ml-0.5"></i>
                    <div class="absolute -bottom-6 md:-bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        Listen
                    </div>
                </button>
                <button onclick="showDescriptionModal()" title="Read description" 
                        class="group relative control-button w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl md:shadow-2xl hover:shadow-purple-500/30 hover:scale-110 hover:from-purple-400 hover:to-purple-500 border-2 border-white/20 backdrop-blur-sm">
                    <i class="fas fa-eye text-white text-sm md:text-xl group-hover:scale-110 transition-transform duration-200"></i>
                    <div class="absolute -bottom-6 md:-bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        Read
                    </div>
                </button>
            </div>
            
            <!-- Decorative elements - smaller on mobile -->
            <div class="absolute top-2 md:top-4 right-2 md:right-4 w-1.5 md:w-2 h-1.5 md:h-2 bg-white/30 rounded-full animate-pulse"></div>
            <div class="absolute top-4 md:top-8 right-4 md:right-8 w-1 h-1 bg-white/20 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
            <div class="absolute bottom-2 md:bottom-4 left-2 md:left-4 w-1 md:w-1.5 h-1 md:h-1.5 bg-white/25 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
        </div>
    `;

    // Populate modal content
    document.getElementById('modal-description-text').textContent = warmupData.content.description;
}

// Warmup functions
function playWarmupAudio(audioPath, button) {
    // If audio is currently playing, stop it
    if (isPlaying && currentAudio) {
        stopCurrentAudio();
        return;
    }

    // Otherwise, play the audio
    playAudioFile(audioPath, button);
}

// Function to stop current audio
function stopCurrentAudio() {
    if (currentAudio) {
        if (currentAudio.pause) {
            // For HTML5 Audio
            currentAudio.pause();
            currentAudio.currentTime = 0;
        } else if (currentAudio.cancel) {
            // For Speech Synthesis
            speechSynthesis.cancel();
        }

        currentAudio = null;
        isPlaying = false;

        // Remove playing animations from all audio buttons
        document.querySelectorAll('.btn-audio, .control-button').forEach(btn => {
            btn.classList.remove('animate-pulse-ring', 'animate-audio-playing');
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-play';
            }
        });
    }
}

function showDescriptionModal() {
    const modal = document.getElementById('description-modal');
    modal.classList.remove('opacity-0', 'invisible');
    modal.classList.add('opacity-100', 'visible');
    modal.querySelector('.bg-white').classList.remove('translate-y-8');
    modal.querySelector('.bg-white').classList.add('translate-y-0');
    showingDescription = true;
}

function closeDescriptionModal() {
    const modal = document.getElementById('description-modal');
    modal.classList.add('opacity-0', 'invisible');
    modal.classList.remove('opacity-100', 'visible');
    modal.querySelector('.bg-white').classList.add('translate-y-8');
    modal.querySelector('.bg-white').classList.remove('translate-y-0');
    showingDescription = false;
}

function playModalAudio() {
    if (warmupData) {
        const button = document.getElementById('modal-audio-button');

        // If audio is currently playing, stop it
        if (isPlaying && currentAudio) {
            stopCurrentAudio();
            return;
        }

        // Otherwise, play the audio
        playAudioFile(getAssetUrl(warmupData.content.audio), button);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Close modal when clicking outside
    document.getElementById('description-modal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeDescriptionModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && showingDescription) {
            closeDescriptionModal();
        }
    });

    // Initialize voices
    initVoices();

    // Show loading state initially
    showLoadingState();
});

// Render Progress Bar (only for learning activities)
function renderProgressBar() {
    const progressContainer = document.getElementById('activity-progress');
    const labelsContainer = document.getElementById('progress-labels');

    progressContainer.innerHTML = '';
    labelsContainer.innerHTML = '';

    if (learningActivities.length === 0) {
        document.getElementById('progress-counter').textContent = '0 of 0';
        return;
    }

    learningActivities.forEach((activity, index) => {
        // Progress step
        const step = document.createElement('div');
        step.className = 'flex-1 h-1.5 bg-gray-200 rounded-full relative transition-all duration-300 cursor-pointer hover:bg-gray-300';

        if (index < currentActivityIndex) {
            step.className += ' bg-gradient-to-r from-green-500 to-green-600';
        } else if (index === currentActivityIndex) {
            step.className += ' bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse';
        }

        // Add click handler to jump to activity
        step.onclick = () => showActivity(index);

        // Add step indicator
        const indicator = document.createElement('div');
        indicator.className = 'absolute -top-1.5 -right-0.5 w-3.5 h-3.5 rounded-full transition-all duration-300';

        if (index < currentActivityIndex) {
            indicator.className += ' bg-green-500 shadow-lg shadow-green-500/30';
        } else if (index === currentActivityIndex) {
            indicator.className += ' bg-blue-500 scale-110 shadow-lg shadow-blue-500/50';
        } else {
            indicator.className += ' bg-gray-200';
        }

        step.appendChild(indicator);
        progressContainer.appendChild(step);

        // Progress label
        const label = document.createElement('div');
        label.className = 'text-xs text-gray-600 text-center min-w-[60px] cursor-pointer p-1 rounded-md transition-all duration-300 hover:bg-gray-100';

        if (index < currentActivityIndex) {
            label.className += ' text-green-600 font-semibold';
        } else if (index === currentActivityIndex) {
            label.className += ' text-blue-600 font-semibold bg-blue-50';
        }

        const activityInfo = activityTypes[activity.type] || { name: 'Activity', icon: 'circle' };
        label.textContent = activityInfo.name;
        label.onclick = () => showActivity(index);
        labelsContainer.appendChild(label);
    });

    // Update counter
    document.getElementById('progress-counter').textContent = `${currentActivityIndex + 1} of ${learningActivities.length}`;
}

// Show specific activity
function showActivity(index) {
    if (index < 0 || index >= learningActivities.length) return;

    currentActivityIndex = index;
    const activity = learningActivities[index];

    // Update progress bar
    renderProgressBar();

    // Render content
    renderActivityContent(activity);
    updateNavigationButtons();
}

// Render Activity Content
function renderActivityContent(activity) {
    const contentDiv = document.getElementById('lesson-content');

    switch (activity.type) {
        case 'vocabulary':
            renderVocabularyActivity(contentDiv, activity.content);
            break;
        case 'pronunciation':
            renderPronunciationActivity(contentDiv, activity.content);
            break;
        case 'dialog':
            renderDialogActivity(contentDiv, activity.content);
            break;
        case 'quiz':
            renderQuizActivity(contentDiv, activity.content);
            break;
        default:
            contentDiv.innerHTML = `
                <div class="bg-white rounded-3xl shadow-lg p-8 text-center">
                    <i class="fas fa-question-circle text-6xl text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600">Unknown Activity Type</h3>
                    <p class="text-gray-500 mt-2">Activity type "${activity.type}" is not supported.</p>
                </div>
            `;
    }
}

// Render Vocabulary Activity
function renderVocabularyActivity(container, content) {
    currentWordIndex = 0;
    studiedWords.clear();

    const renderWord = () => {
        const word = content.words[currentWordIndex];

        container.innerHTML = `
            <div class="animate-slide-in">
                <div class="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden">
                    <div class="p-6 pb-4 text-center border-b border-gray-100">
                        <h2 class="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
                            <i class="fas fa-book-open text-blue-500"></i>
                            Vocabulary Learning
                        </h2>
                        <p class="text-sm text-gray-600">Word ${currentWordIndex + 1} of ${content.words.length}</p>
                    </div>
                    <div class="p-6">
                        <div class="text-center mb-8">
                            <img src="${getAssetUrl(word.image)}" alt="${word.word}" class="w-full max-w-80 h-56 object-cover rounded-2xl shadow-lg mx-auto mb-6">
                            <div class="flex items-center justify-center gap-3 mb-2">
                                <div class="text-5xl font-extrabold text-blue-500">${word.word}</div>
                                <button onclick="playAudioFile('${getAssetUrl(word.audio)}', this)" 
                                        class="btn-audio group w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:scale-110 hover:from-green-400 hover:to-green-500 border-2 border-white/20 backdrop-blur-sm"
                                        title="Listen to pronunciation">
                                    <i class="fas fa-volume-up text-white text-lg group-hover:scale-110 transition-transform duration-200"></i>
                                </button>
                            </div>
                            <div class="text-lg text-gray-700 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 mb-6 max-w-md mx-auto">${word.meaning}</div>
                        </div>

                        <div class="flex justify-center gap-2 mb-8">
                            ${content.words.map((_, index) => `
                                <div class="w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentWordIndex ? 'bg-blue-500 scale-125 shadow-lg shadow-blue-500/50' :
                studiedWords.has(index) ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-gray-300'
            }"></div>
                            `).join('')}
                        </div>

                        <div class="flex justify-center gap-2 sm:gap-4 mb-20">
                            <button onclick="prevWord()" ${currentWordIndex === 0 ? 'disabled' : ''} 
                                    class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold border border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                <i class="fas fa-arrow-left text-xs sm:text-sm"></i>
                                <span class="hidden sm:inline">Previous</span>
                            </button>
                            <button onclick="nextWord()" 
                                    class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                ${currentWordIndex === content.words.length - 1 ? '<i class="fas fa-check-circle text-xs sm:text-sm"></i><span class="hidden sm:inline">Complete</span>' : '<span class="hidden sm:inline">Next</span> <i class="fas fa-arrow-right text-xs sm:text-sm"></i>'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    renderWord();

    // Word navigation functions
    window.nextWord = () => {
        studiedWords.add(currentWordIndex);
        if (currentWordIndex < content.words.length - 1) {
            currentWordIndex++;
            renderWord();
        } else {
            // Mark activity as completed
            markActivityCompleted();
        }
    };

    window.prevWord = () => {
        if (currentWordIndex > 0) {
            currentWordIndex--;
            renderWord();
        }
    };
}

// Render Pronunciation Activity
function renderPronunciationActivity(container, content) {
    currentWordIndex = 0;
    studiedWords.clear();

    const renderPronunciation = () => {
        const word = content.practice_words[currentWordIndex];

        container.innerHTML = `
            <div class="animate-slide-in">
                <div class="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden">
                    <div class="p-6 pb-4 text-center border-b border-gray-100">
                        <h2 class="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
                            <i class="fas fa-microphone text-purple-500"></i>
                            Pronunciation Practice
                        </h2>
                        <p class="text-sm text-gray-600">Word ${currentWordIndex + 1} of ${content.practice_words.length}</p>
                    </div>
                    <div class="p-6">
                        <div class="text-center mb-8">
                            <div class="text-5xl font-extrabold text-purple-500 mb-4">${word.word}</div>
                            <div class="text-2xl text-gray-600 font-mono mb-4">${word.phonetic}</div>
                            <div class="text-lg text-gray-700 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 mb-6 max-w-md mx-auto">
                                <strong>Tip:</strong> ${word.tips}
                            </div>
                        </div>

                        <div class="text-center mb-8">
                            <button onclick="playAudioFile('${getAssetUrl(word.audio)}', this)" class="btn-audio inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                <i class="fas fa-volume-up"></i>
                                Listen & Practice
                            </button>
                        </div>

                        <div class="flex justify-center gap-2 mb-8">
                            ${content.practice_words.map((_, index) => `
                                <div class="w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentWordIndex ? 'bg-purple-500 scale-125 shadow-lg shadow-purple-500/50' :
                studiedWords.has(index) ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-gray-300'
            }"></div>
                            `).join('')}
                        </div>

                        <div class="flex justify-center gap-2 sm:gap-4 mb-20">
                            <button onclick="prevPronunciation()" ${currentWordIndex === 0 ? 'disabled' : ''} 
                                    class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold border border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                <i class="fas fa-arrow-left text-xs sm:text-sm"></i>
                                <span class="hidden sm:inline">Previous</span>
                            </button>
                            <button onclick="nextPronunciation()" 
                                    class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                ${currentWordIndex === content.practice_words.length - 1 ? '<i class="fas fa-check-circle text-xs sm:text-sm"></i><span class="hidden sm:inline">Complete</span>' : '<span class="hidden sm:inline">Next</span> <i class="fas fa-arrow-right text-xs sm:text-sm"></i>'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    renderPronunciation();

    // Pronunciation navigation functions
    window.nextPronunciation = () => {
        studiedWords.add(currentWordIndex);
        if (currentWordIndex < content.practice_words.length - 1) {
            currentWordIndex++;
            renderPronunciation();
        } else {
            markActivityCompleted();
        }
    };

    window.prevPronunciation = () => {
        if (currentWordIndex > 0) {
            currentWordIndex--;
            renderPronunciation();
        }
    };
}

// Render Dialog Activity
function renderDialogActivity(container, content) {
    container.innerHTML = `
        <div class="animate-slide-in">
            <div class="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden">
                <div class="p-6 pb-4 text-center border-b border-gray-100">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
                        <i class="fas fa-comments text-green-500"></i>
                        Dialog Practice
                    </h2>
                    <p class="text-sm text-gray-600">Listen and practice the conversation</p>
                </div>
                <div class="p-6">
                    <div class="max-w-2xl mx-auto">
                        <div class="mb-6">
                            <button onclick="playAllDialog()" class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                <i class="fas fa-play"></i>
                                Play
                            </button>
                        </div>
                        
                        <div class="space-y-4">
                            ${content.dialog.map((item, index) => `
                                <div class="p-4 border-2 border-gray-200 rounded-2xl transition-all duration-300 hover:border-green-500 hover:bg-green-50">
                                    <div class="flex items-center gap-3 mb-3">
                                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${item.speaker === 'A' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'
        }">
                                            ${item.speaker}
                                        </div>
                                        <div class="text-sm text-gray-500 flex-1">Speaker ${item.speaker}</div>
                                        <button onclick="playAudioFile('${getAssetUrl(item.audio)}', this)" 
                                                class="btn-audio group w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md hover:shadow-green-500/30 hover:scale-110 hover:from-green-400 hover:to-green-500 border border-white/20"
                                                title="Listen to this line">
                                            <i class="fas fa-volume-up text-white text-xs group-hover:scale-110 transition-transform duration-200"></i>
                                        </button>
                                    </div>
                                    <div class="text-gray-800 text-lg leading-relaxed ml-13">${item.text}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="text-center mt-8 mb-20">
                        <button onclick="markActivityCompleted()" class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                            <i class="fas fa-check-circle text-xs sm:text-sm"></i>
                            <span class="hidden sm:inline">Complete Dialog</span>
                            <span class="sm:hidden">Complete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Play all dialog function
    window.playAllDialog = () => {
        let currentIndex = 0;
        const playNext = () => {
            if (currentIndex < content.dialog.length) {
                const item = content.dialog[currentIndex];
                const audio = new Audio(getAssetUrl(item.audio));

                audio.onended = () => {
                    currentIndex++;
                    // Add a small delay between dialog lines
                    setTimeout(playNext, 500);
                };

                audio.onerror = () => {
                    // Fallback to text-to-speech
                    const utterance = new SpeechSynthesisUtterance(item.text);
                    utterance.rate = 0.8;
                    utterance.pitch = 1;
                    utterance.volume = 1;

                    utterance.onend = () => {
                        currentIndex++;
                        setTimeout(playNext, 500);
                    };

                    speechSynthesis.speak(utterance);
                };

                audio.play().catch(() => {
                    // Fallback to text-to-speech if audio fails
                    const utterance = new SpeechSynthesisUtterance(item.text);
                    utterance.rate = 0.8;
                    utterance.pitch = 1;
                    utterance.volume = 1;

                    utterance.onend = () => {
                        currentIndex++;
                        setTimeout(playNext, 500);
                    };

                    speechSynthesis.speak(utterance);
                });
            }
        };

        playNext();
    };
}

// Render Quiz Activity
function renderQuizActivity(container, content) {
    selectedAnswer = null;
    showResult = false;

    const renderQuiz = () => {
        container.innerHTML = `
            <div class="animate-slide-in">
                <div class="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden">
                    <div class="p-6 pb-4 text-center border-b border-gray-100">
                        <h2 class="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
                            <i class="fas fa-question-circle text-orange-500"></i>
                            Quiz Time
                        </h2>
                        <p class="text-sm text-gray-600">Test your knowledge</p>
                    </div>
                    <div class="p-6">
                        ${content.image ? `
                            <div class="text-center mb-6">
                                <img src="${getAssetUrl(content.image)}" alt="Quiz Image" class="w-full max-w-80 h-56 object-cover rounded-2xl shadow-lg mx-auto">
                            </div>
                        ` : ''}
                        
                        <div class="text-center mb-8">
                            <div class="flex items-center justify-center gap-3 mb-4">
                                <h3 class="text-2xl font-bold text-gray-800">${content.question}</h3>
                                ${content.audio ? `
                                    <button onclick="playAudioFile('${getAssetUrl(content.audio)}', this)" title="Listen to question" 
                                            class="btn-audio group w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-110 hover:from-orange-400 hover:to-red-500 border-2 border-white/20 backdrop-blur-sm">
                                        <i class="fas fa-volume-up text-white text-sm group-hover:scale-110 transition-transform duration-200"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <div class="max-w-lg mx-auto space-y-3 mb-8">
                            ${content.options.map((option, index) => `
                                <button onclick="selectAnswer('${option}')" 
                                        class="quiz-option w-full p-4 border-2 border-gray-200 rounded-xl text-left transition-all duration-300 hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-1 ${selectedAnswer === option ? 'border-orange-500 bg-orange-500 text-white' : ''
            } ${showResult ? (
                option === content.correct_answer ? 'border-green-500 bg-green-500 text-white' :
                    option === selectedAnswer && option !== content.correct_answer ? 'border-red-500 bg-red-500 text-white' : ''
            ) : ''
            }">
                                    ${option}
                                </button>
                            `).join('')}
                        </div>

                        ${showResult ? `
                            <div class="text-center mb-6">
                                <div class="p-6 rounded-2xl max-w-lg mx-auto ${selectedAnswer === content.correct_answer ?
                    'bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-500' :
                    'bg-gradient-to-r from-red-100 to-red-200 border-2 border-red-500'
                }">
                                    <div class="text-4xl mb-2">
                                        ${selectedAnswer === content.correct_answer ? '🎉' : '😔'}
                                    </div>
                                    <h4 class="text-xl font-bold mb-2 ${selectedAnswer === content.correct_answer ? 'text-green-800' : 'text-red-800'
                }">
                                        ${selectedAnswer === content.correct_answer ? 'Correct!' : 'Incorrect!'}
                                    </h4>
                                    <p class="text-gray-700">
                                        The correct answer is: <strong>${content.correct_answer}</strong>
                                    </p>
                                </div>
                            </div>
                        ` : ''}

                        <div class="text-center mb-12">
                            ${!showResult ? `
                                <button onclick="checkAnswer('${content.correct_answer}')" ${!selectedAnswer ? 'disabled' : ''} 
                                        class="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none overflow-hidden">
                                    <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div class="relative flex items-center gap-2">
                                        <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                                            <i class="fas fa-check text-white text-xs group-hover:scale-110 transition-transform duration-300"></i>
                                        </div>
                                        <span class="group-hover:scale-105 transition-transform duration-300">Check Answer</span>
                                    </div>
                                    <div class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-75"></div>
                                </button>
                            ` : `
                                <button onclick="markActivityCompleted()" 
                                        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                    <i class="fas fa-arrow-right"></i>
                                    Continue
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    renderQuiz();

    // Quiz functions
    window.selectAnswer = (answer) => {
        if (!showResult) {
            selectedAnswer = answer;
            renderQuiz();
        }
    };

    window.checkAnswer = (correctAnswer) => {
        showResult = true;
        renderQuiz();
    };
}

// Navigation functions
function nextActivity() {
    if (currentActivityIndex < learningActivities.length - 1) {
        showActivity(currentActivityIndex + 1);
    } else {
        // Course completed
        showCourseCompletion();
    }
}

function prevActivity() {
    if (currentActivityIndex > 0) {
        showActivity(currentActivityIndex - 1);
    }
}

function skipActivity() {
    nextActivity();
}

function updateNavigationButtons() {
    document.getElementById('prev-btn').disabled = currentActivityIndex === 0;

    const nextBtn = document.getElementById('next-btn');
    if (currentActivityIndex === learningActivities.length - 1) {
        nextBtn.innerHTML = '<i class="fas fa-trophy"></i>';
        nextBtn.title = 'Complete Course';
    } else {
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.title = 'Next';
    }
}

function markActivityCompleted() {
    const currentActivity = learningActivities[currentActivityIndex];
    completedActivities.add(currentActivity.id);

    // Call progress callback if provided
    if (typeof progressCallback === 'function') {
        // Update the current activity data with completion info
        const updatedActivity = {
            ...currentActivity,
            completed: true,
            completed_at: new Date().toISOString()
        };
        progressCallback(updatedActivity);
    }

    // Auto advance to next activity
    if (currentActivityIndex < learningActivities.length - 1) {
        setTimeout(() => {
            nextActivity();
        }, 1000);
    } else {
        showCourseCompletion();
    }
}

function showCourseCompletion() {
    const contentDiv = document.getElementById('lesson-content');
    contentDiv.innerHTML = `
        <div class="animate-slide-in">
            <div class="bg-white rounded-3xl shadow-lg p-8 text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Congratulations!</h2>
                <p class="text-lg text-gray-600 mb-6">You have successfully completed all learning activities!</p>
                <div class="flex justify-center gap-4">
                    <button onclick="restartCourse()" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                        <i class="fas fa-redo"></i>
                        Restart Course
                    </button>
                </div>
            </div>
        </div>
    `;
}

function restartCourse() {
    currentActivityIndex = 0;
    completedActivities.clear();
    currentWordIndex = 0;
    studiedWords.clear();
    selectedAnswer = null;
    showResult = false;

    showActivity(0);
}

// Handle page visibility change to stop audio when tab is hidden
document.addEventListener('visibilitychange', function () {
    if (document.hidden && currentAudio) {
        if (currentAudio.pause) {
            currentAudio.pause();
        } else {
            speechSynthesis.cancel();
        }
        currentAudio = null;
        isPlaying = false;
        document.querySelectorAll('.btn-audio, .control-button').forEach(btn => {
            btn.classList.remove('animate-pulse-ring', 'animate-audio-playing');
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = icon.className.includes('play') ? 'fas fa-play' : 'fas fa-volume-up';
            }
        });
    }
});