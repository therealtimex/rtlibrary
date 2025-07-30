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

// Pronunciation Recorder State
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let recordedBlob = null;
let audioContext;
let mediaStreamSource;
let workletNode;
let recordingData = [];
let silenceTimer = null;
let lastSoundTime = 0;
let hasRecordedAudio = false;
let noSoundTimeout = null;
let hasDetectedSound = false;

// Pronunciation State Management - persist data for each word
let pronunciationState = {};
let currentLessonId = null;

// Auto-stop configuration
const SILENCE_THRESHOLD = 0.01;
const AUTO_STOP_DELAY = 2000;

// Base URL for assets
const ASSETS_BASE_URL = 'https://app.realtimex.co/storage/v1/object/public/app_lang_assets_data';

// Helper function to construct full asset URLs
function getAssetUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${ASSETS_BASE_URL}/${cleanPath}`;
}

// Activity type mapping
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
    stopCurrentAudio();
    resetAllAudioButtonsUI();

    if (audioPath && audioPath.trim() !== '') {
        currentAudio = new Audio(audioPath);

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
        };

        currentAudio.onended = () => {
            isPlaying = false;
            currentAudio = null;
            resetButtonStyle();
        };

        currentAudio.onerror = () => {
            console.warn('Audio file not found, falling back to speech synthesis:', audioPath);
            resetButtonStyle();
            playTextToSpeech(audioPath.split('/').pop().replace('.mp3', ''), button);
        };

        currentAudio.play().catch(error => {
            resetButtonStyle();
            playTextToSpeech(audioPath.split('/').pop().replace('.mp3', ''), button);
        });
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

// Load lesson data from external source
function loadLessonData(jsonData) {
    try {
        lessonData = jsonData.sort((a, b) => a.order - b.order);

        warmupData = lessonData.find(item => item.type === 'warmup');
        learningActivities = lessonData.filter(item => item.type !== 'warmup');

        if (!warmupData) {
            console.warn('No warmup data found');
        }

        if (learningActivities.length === 0) {
            throw new Error('No learning activities found');
        }

        renderWarmup();
        renderProgressBar();
        showActivity(0);

    } catch (error) {
        console.error('Error loading lesson data:', error);
        throw error;
    }
}

// Load lesson data from external source
function loadLessonData(jsonData) {
    try {
        lessonData = jsonData.sort((a, b) => a.order - b.order);

        warmupData = lessonData.find(item => item.type === 'warmup');
        learningActivities = lessonData.filter(item => item.type !== 'warmup');

        if (!warmupData) {
            console.warn('No warmup data found');
        }

        if (learningActivities.length === 0) {
            throw new Error('No learning activities found');
        }

        renderWarmup();
        renderProgressBar();
        showActivity(0);

    } catch (error) {
        console.error('Error loading lesson data:', error);
        throw error;
    }
}

// Render Warmup
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
        </div>
    `;

    document.getElementById('modal-description-text').textContent = warmupData.content.description;
}

// Warmup functions
function playWarmupAudio(audioPath, button) {
    if (isPlaying && currentAudio) {
        stopCurrentAudio();
        resetAllAudioButtonsUI();
        return;
    }

    stopCurrentAudio();
    resetAllAudioButtonsUI();
    playAudioFile(audioPath, button);
}

// Function to stop current audio
function stopCurrentAudio() {
    if (currentAudio) {
        if (currentAudio.pause) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        } else if (currentAudio.cancel) {
            speechSynthesis.cancel();
        }
        currentAudio = null;
        isPlaying = false;
    }
}

// Reset UI of all audio buttons
function resetAllAudioButtonsUI() {
    document.querySelectorAll('.btn-audio, .control-button').forEach(btn => {
        btn.classList.remove('animate-pulse-ring', 'animate-audio-playing');
        const icon = btn.querySelector('i');
        if (icon) {
            if (!btn.dataset.originalIcon) {
                btn.dataset.originalIcon = icon.className;
            }
            icon.className = btn.dataset.originalIcon;
        }
    });
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

        if (isPlaying && currentAudio) {
            stopCurrentAudio();
            return;
        }

        playAudioFile(getAssetUrl(warmupData.content.audio), button);
    }
}

// Confetti effect
function triggerConfetti() {
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'];
    const numConfetti = 50;

    for (let i = 0; i < numConfetti; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti-piece');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        confetti.style.animationDuration = `${2 + Math.random() * 1}s`;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        document.body.appendChild(confetti);

        confetti.addEventListener('animationend', () => {
            confetti.remove();
        });
    }
}

// Activity completion and navigation
window.markActivityCompleted = () => {
    console.log('markActivityCompleted called');
    const currentActivity = learningActivities[currentActivityIndex];
    completedActivities.add(currentActivity.id || currentActivityIndex);

    // Call progress callback if provided
    if (typeof progressCallback === 'function') {
        const updatedActivity = {
            ...currentActivity,
            completed: true,
            completed_at: new Date().toISOString()
        };
        progressCallback(updatedActivity);
    }

    // Auto advance to next activity or show completion
    if (currentActivityIndex < learningActivities.length - 1) {
        console.log('Advancing to next activity...');
        setTimeout(() => {
            nextActivity();
        }, 1000);
    } else {
        console.log('All activities completed. Showing course completion...');
        setTimeout(() => {
            showCourseCompletion();
        }, 1000);
    }
};

window.nextActivity = () => {
    console.log('nextActivity called');
    if (currentActivityIndex < learningActivities.length - 1) {
        showActivity(currentActivityIndex + 1);
    } else {
        console.log('Reached last activity. Calling showCourseCompletion().');
        showCourseCompletion();
    }
    updateNavigationButtons();
};

window.prevActivity = () => {
    if (currentActivityIndex > 0) {
        showActivity(currentActivityIndex - 1);
    }
    updateNavigationButtons();
};

window.skipActivity = () => {
    nextActivity();
};

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
        prevBtn.disabled = currentActivityIndex === 0;
    }

    if (nextBtn) {
        nextBtn.disabled = currentActivityIndex === learningActivities.length - 1;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('description-modal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeDescriptionModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && showingDescription) {
            closeDescriptionModal();
        }
    });

    initVoices();
    showLoadingState();
});

// Render Progress Bar
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
        const step = document.createElement('div');
        step.className = 'flex-1 h-1.5 bg-gray-200 rounded-full relative transition-all duration-300 cursor-pointer hover:bg-gray-300';

        if (index < currentActivityIndex) {
            step.className += ' bg-gradient-to-r from-green-500 to-green-600';
        } else if (index === currentActivityIndex) {
            step.className += ' bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse';
        }

        step.onclick = () => showActivity(index);

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

    document.getElementById('progress-counter').textContent = `${currentActivityIndex + 1} of ${learningActivities.length}`;
}

// Show specific activity
function showActivity(index) {
    if (index < 0 || index >= learningActivities.length) return;

    currentActivityIndex = index;
    const activity = learningActivities[index];

    renderProgressBar();
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
                    <div class="p-4 sm:p-6 pb-4 text-center border-b border-gray-100">
                        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
                            <i class="fas fa-book-open text-blue-500"></i>
                            Vocabulary Learning
                        </h2>
                        <p class="text-sm text-gray-600">Word ${currentWordIndex + 1} of ${content.words.length}</p>
                    </div>
                    <div class="p-4 sm:p-6">
                        <div class="text-center mb-6 sm:mb-8">
                            <img src="${getAssetUrl(word.image)}" alt="${word.word}" class="w-full max-w-72 sm:max-w-80 h-48 sm:h-56 object-cover rounded-2xl shadow-lg mx-auto mb-4 sm:mb-6">
                            <div class="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                                <div class="text-3xl sm:text-5xl font-extrabold text-blue-500">${word.word}</div>
                                <button onclick="playAudioFile('${getAssetUrl(word.audio)}', this)" 
                                        class="btn-audio group w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:scale-110 hover:from-green-400 hover:to-green-500 border-2 border-white/20 backdrop-blur-sm"
                                        title="Listen to pronunciation">
                                    <i class="fas fa-volume-up text-white text-sm sm:text-lg group-hover:scale-110 transition-transform duration-200"></i>
                                </button>
                            </div>
                            <div class="text-base sm:text-lg text-gray-700 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 mb-4 sm:mb-6 max-w-sm sm:max-w-md mx-auto">${word.meaning}</div>
                        </div>

                        <div class="flex justify-center gap-1 sm:gap-2 mb-6 sm:mb-8">
                            ${content.words.map((_, index) => `
                                <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${index === currentWordIndex ? 'bg-blue-500 scale-125 shadow-lg shadow-blue-500/50' :
                studiedWords.has(index) ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-gray-300'
            }"></div>
                            `).join('')}
                        </div>

                        <div class="flex justify-center gap-2 sm:gap-4 mb-16 sm:mb-20">
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

    window.nextWord = () => {
        studiedWords.add(currentWordIndex);
        if (currentWordIndex < content.words.length - 1) {
            currentWordIndex++;
            renderWord();
        } else {
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

// AudioWorklet processor code for pronunciation recording
const audioWorkletCode = `
    class RecordingProcessor extends AudioWorkletProcessor {
        constructor() {
            super();
            this.isRecording = false;
            this.port.onmessage = (event) => {
                if (event.data.command === 'start') {
                    this.isRecording = true;
                } else if (event.data.command === 'stop') {
                    this.isRecording = false;
                }
            };
        }

        process(inputs, outputs, parameters) {
            const input = inputs[0];
            if (input && input.length > 0 && this.isRecording) {
                const inputData = input[0];
                
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += Math.abs(inputData[i]);
                }
                const volume = sum / inputData.length;
                
                this.port.postMessage({
                    audioData: inputData,
                    volume: volume
                });
            }
            return true;
        }
    }

    registerProcessor('recording-processor', RecordingProcessor);
`;

// WAV file creation utilities
function encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
    }

    return buffer;
}

// Initialize microphone access
async function initMicrophone() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('getUserMedia is not supported in this browser. Please use a modern browser or access via HTTPS/localhost.');
        }

        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            throw new Error('Microphone access requires HTTPS or localhost. Please access this page via HTTPS.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true
            }
        });

        audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 16000
        });
        mediaStreamSource = audioContext.createMediaStreamSource(stream);

        try {
            const blob = new Blob([audioWorkletCode], { type: 'application/javascript' });
            const workletUrl = URL.createObjectURL(blob);

            await audioContext.audioWorklet.addModule(workletUrl);
            workletNode = new AudioWorkletNode(audioContext, 'recording-processor');

            workletNode.port.onmessage = (event) => {
                if (isRecording && event.data.audioData) {
                    recordingData.push(new Float32Array(event.data.audioData));

                    if (event.data.volume > SILENCE_THRESHOLD) {
                        lastSoundTime = Date.now();
                        hasRecordedAudio = true;

                        // Clear no-sound timeout when sound is detected
                        if (!hasDetectedSound) {
                            hasDetectedSound = true;
                            if (noSoundTimeout) {
                                clearTimeout(noSoundTimeout);
                                noSoundTimeout = null;
                            }
                        }

                        if (silenceTimer) {
                            clearTimeout(silenceTimer);
                            silenceTimer = null;
                        }
                    } else if (hasRecordedAudio && !silenceTimer) {
                        silenceTimer = setTimeout(() => {
                            if (isRecording) {
                                console.log('Auto-stopping due to silence');
                                toggleRecording();
                            }
                        }, AUTO_STOP_DELAY);
                    }
                }
            };

            mediaStreamSource.connect(workletNode);
            workletNode.connect(audioContext.destination);

            URL.revokeObjectURL(workletUrl);
            console.log('Using AudioWorklet for recording');

        } catch (workletError) {
            console.warn('AudioWorklet not supported, falling back to ScriptProcessor:', workletError);

            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (event) => {
                if (isRecording) {
                    const inputData = event.inputBuffer.getChannelData(0);
                    recordingData.push(new Float32Array(inputData));

                    let sum = 0;
                    for (let i = 0; i < inputData.length; i++) {
                        sum += Math.abs(inputData[i]);
                    }
                    const volume = sum / inputData.length;

                    if (volume > SILENCE_THRESHOLD) {
                        lastSoundTime = Date.now();
                        hasRecordedAudio = true;

                        // Clear no-sound timeout when sound is detected
                        if (!hasDetectedSound) {
                            hasDetectedSound = true;
                            if (noSoundTimeout) {
                                clearTimeout(noSoundTimeout);
                                noSoundTimeout = null;
                            }
                        }

                        if (silenceTimer) {
                            clearTimeout(silenceTimer);
                            silenceTimer = null;
                        }
                    } else if (hasRecordedAudio && !silenceTimer) {
                        silenceTimer = setTimeout(() => {
                            if (isRecording) {
                                console.log('Auto-stopping due to silence');
                                toggleRecording();
                            }
                        }, AUTO_STOP_DELAY);
                    }
                }
            };

            mediaStreamSource.connect(processor);
            processor.connect(audioContext.destination);
            console.log('Using ScriptProcessor for recording');
        }

        return true;
    } catch (error) {
        console.error('Error accessing microphone:', error);
        let errorMessage = 'Unable to access microphone. ';

        if (error.name === 'NotAllowedError') {
            errorMessage += 'Please allow microphone permissions in your browser.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'No microphone found. Please connect a microphone.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage += 'Microphone not supported by this browser.';
        } else {
            errorMessage += error.message || 'Please check permissions and try again.';
        }

        alert(errorMessage);
        return false;
    }
}

// Toggle recording function
async function toggleRecording() {
    if (!audioContext) {
        const success = await initMicrophone();
        if (!success) return;
    }

    const recordBtn = document.getElementById('record-btn');
    const recordStatus = document.getElementById('record-status');

    if (!isRecording) {
        // Start recording
        recordingData = [];
        isRecording = true;
        hasRecordedAudio = false;
        hasDetectedSound = false;
        lastSoundTime = Date.now();

        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }

        // Set timeout for no sound detection (5 seconds)
        noSoundTimeout = setTimeout(() => {
            if (!hasDetectedSound && isRecording) {
                stopRecordingDueToNoSound();
            }
        }, 5000);

        if (workletNode) {
            workletNode.port.postMessage({ command: 'start' });
        }

        const micIcon = document.getElementById('mic-icon');
        const glowRing = document.getElementById('glow-ring');
        const recordingDots = document.getElementById('recording-dots');
        const soundWaves = document.getElementById('sound-waves');

        micIcon.className = 'fas fa-stop';
        micIcon.classList.remove('animate-mic-bounce');
        recordBtn.className = recordBtn.className.replace('from-red-500 to-red-600', 'from-gray-500 to-gray-600');
        recordBtn.classList.remove('animate-pulse-record');
        recordBtn.classList.add('animate-recording-pulse');

        if (glowRing) {
            glowRing.classList.remove('pulse-glow');
            glowRing.classList.add('hidden');
        }
        if (recordingDots) recordingDots.classList.remove('hidden');
        if (soundWaves) soundWaves.classList.remove('hidden');

        recordStatus.innerHTML = '<span class="text-red-600 font-semibold">🔴 Recording... Click to stop or speak and pause</span>';

        const audioSection = document.getElementById('audio-section');
        const resultsSection = document.getElementById('results-section');
        if (audioSection) audioSection.classList.add('hidden');
        if (resultsSection) resultsSection.classList.add('hidden');
    } else {
        // Stop recording
        isRecording = false;

        if (workletNode) {
            workletNode.port.postMessage({ command: 'stop' });
        }

        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }

        // Clear no-sound timeout when stopping recording
        if (noSoundTimeout) {
            clearTimeout(noSoundTimeout);
            noSoundTimeout = null;
        }

        const totalLength = recordingData.reduce((acc, chunk) => acc + chunk.length, 0);
        const samples = new Float32Array(totalLength);
        let offset = 0;

        for (const chunk of recordingData) {
            samples.set(chunk, offset);
            offset += chunk.length;
        }

        const wavBuffer = encodeWAV(samples, audioContext.sampleRate);
        recordedBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(recordedBlob);

        const audioElement = document.getElementById('recorded-audio');
        if (audioElement) {
            audioElement.src = audioUrl;
        }

        const audioSection = document.getElementById('audio-section');
        if (audioSection) audioSection.classList.remove('hidden');

        // Save recording state
        savePronunciationState({
            recordedBlob: recordedBlob,
            audioURL: audioUrl,
            hasRecording: true
        });

        const micIcon = document.getElementById('mic-icon');
        const glowRing = document.getElementById('glow-ring');
        const recordingDots = document.getElementById('recording-dots');
        const soundWaves = document.getElementById('sound-waves');

        micIcon.className = 'fas fa-microphone';
        micIcon.classList.remove('animate-mic-bounce');
        recordBtn.className = recordBtn.className.replace('from-gray-500 to-gray-600', 'from-red-500 to-red-600');
        recordBtn.classList.remove('animate-recording-pulse');

        if (glowRing) {
            glowRing.classList.remove('pulse-glow');
            glowRing.classList.add('hidden');
        }
        if (recordingDots) recordingDots.classList.add('hidden');
        if (soundWaves) soundWaves.classList.add('hidden');

        recordStatus.innerHTML = '';
    }
}

// Stop recording due to no sound detected
function stopRecordingDueToNoSound() {
    if (!isRecording) return;

    // Stop recording
    isRecording = false;

    if (workletNode) {
        workletNode.port.postMessage({ command: 'stop' });
    }

    // Clear timers
    if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
    }
    if (noSoundTimeout) {
        clearTimeout(noSoundTimeout);
        noSoundTimeout = null;
    }

    // Reset UI
    const recordBtn = document.querySelector('.record-btn');
    const micIcon = document.getElementById('mic-icon');
    const glowRing = document.getElementById('glow-ring');
    const recordingDots = document.getElementById('recording-dots');
    const soundWaves = document.getElementById('sound-waves');
    const recordStatus = document.getElementById('record-status');

    if (micIcon) {
        micIcon.className = 'fas fa-microphone';
        micIcon.classList.remove('animate-mic-bounce');
    }
    if (recordBtn) {
        recordBtn.className = recordBtn.className.replace('from-gray-500 to-gray-600', 'from-red-500 to-red-600');
        recordBtn.classList.remove('animate-recording-pulse');
    }
    if (glowRing) {
        glowRing.classList.remove('pulse-glow');
        glowRing.classList.add('hidden');
    }
    if (recordingDots) recordingDots.classList.add('hidden');
    if (soundWaves) soundWaves.classList.add('hidden');

    // Show helpful message
    if (recordStatus) {
        recordStatus.innerHTML = '<span class="text-orange-600 font-semibold">⚠️ No speech detected.</span> Please speak closer to the microphone and try again.';
    }
}

// Analyze audio with backend
async function analyzeAudio() {
    if (!recordedBlob) {
        alert('No audio recorded');
        return;
    }

    const loading = document.getElementById('loading');
    const resultsSection = document.getElementById('results-section');

    if (loading) loading.classList.remove('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');

    try {
        const base64Audio = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(recordedBlob);
        });

        const referenceText = document.getElementById('reference-text').textContent;

        const response = await fetch('https://hooks.realtimex.co/hooks/anki-speech-v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                audio_data: base64Audio,
                reference_text: referenceText,
                audio_format: 'wav'
            })
        });

        if (!response.ok) {
            throw new Error('Analysis failed');
        }

        const result = await response.json();
        displayResults(result);

    } catch (error) {
        console.error('Error analyzing audio:', error);
        alert('Error analyzing pronunciation. Please try again.');
    } finally {
        if (loading) loading.classList.add('hidden');
    }
}

// Get score colors
function getScoreColor(score) {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
}

function getScoreBgColor(score) {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
}

function getPhonemeColor(score) {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
}

// Additional helper functions for phoneme breakdown
function getPhonemeScoreBgColor(score) {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
}

function getPhonemeQuality(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs work';
    return 'Poor';
}

function getPhonemeImprovementTips(word) {
    // Case 1: The word was completely missed (Omission) or has no phonemes.
    if (word.error_type === 'Omission' || word.phonemes.length === 0) {
        return `
            <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                    <span class="text-sm text-yellow-700 font-medium">This word was not detected in your recording.</span>
                </div>
            </div>
        `;
    }

    // Case 2: The word was said, now check for poorly pronounced phonemes.
    const poorPhonemes = word.phonemes.filter(p => p.accuracy_score < 70);
    if (poorPhonemes.length === 0) {
        // All phonemes are good.
        return `
            <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    <span class="text-sm text-green-700 font-medium">Great pronunciation! All phonemes are well pronounced.</span>
                </div>
            </div>
        `;
    }

    // Case 3: There are specific phonemes to improve.
    return `
        <div class="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div class="flex items-start">
                <i class="fas fa-lightbulb text-orange-500 mr-2 mt-0.5"></i>
                <div>
                    <div class="text-sm font-medium text-orange-700 mb-1">Improvement Tips:</div>
                    <div class="text-sm text-orange-600">
                        Focus on these sounds: ${poorPhonemes.map(p => `<span class="font-mono bg-orange-100 px-1 rounded">/${p.phoneme}/</span>`).join(', ')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Display pronunciation results
function displayResults(result) {
    const resultsContent = document.getElementById('results-content');
    const resultsSection = document.getElementById('results-section');

    if (!resultsContent || !resultsSection) return;

    if (result.error) {
        resultsContent.innerHTML = `
            <div class="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <strong>Error:</strong> ${result.error}
            </div>
        `;
    } else {
        resultsContent.innerHTML = `
            <!-- Overall Scores -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-2 mb-4 sm:mb-6">
                <div class="text-center p-2 sm:p-2 bg-white rounded-xl border-2 ${getScoreBgColor(result.pronunciation_score)} shadow-sm">
                    <div class="text-xl sm:text-2xl font-bold ${getScoreColor(result.pronunciation_score)}">${Math.round(result.pronunciation_score)}</div>
                    <div class="text-xs text-gray-600 mt-1">Pronunciation</div>
                </div>
                <div class="text-center p-2 sm:p-2 bg-white rounded-xl border-2 ${getScoreBgColor(result.accuracy_score)} shadow-sm">
                    <div class="text-xl sm:text-2xl font-bold ${getScoreColor(result.accuracy_score)}">${Math.round(result.accuracy_score)}</div>
                    <div class="text-xs text-gray-600 mt-1">Accuracy</div>
                </div>
                <div class="text-center p-2 sm:p-2 bg-white rounded-xl border-2 ${getScoreBgColor(result.fluency_score)} shadow-sm">
                    <div class="text-xl sm:text-2xl font-bold ${getScoreColor(result.fluency_score)}">${Math.round(result.fluency_score)}</div>
                    <div class="text-xs text-gray-600 mt-1">Fluency</div>
                </div>
                <div class="text-center p-2 sm:p-2 bg-white rounded-xl border-2 ${getScoreBgColor(result.completeness_score)} shadow-sm">
                    <div class="text-xl sm:text-2xl font-bold ${getScoreColor(result.completeness_score)}">${Math.round(result.completeness_score)}</div>
                    <div class="text-xs text-gray-600 mt-1">Completeness</div>
                </div>
            </div>
            
            <!-- Recognition Result -->
            <div class="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl border">
                <div class="flex items-center mb-2">
                    <i class="fas fa-quote-left text-gray-400 mr-2"></i>
                    <strong class="text-gray-700">You said:</strong>
                </div>
                <p class="text-base sm:text-lg text-gray-800 italic">"${result.recognized_text}"</p>
            </div>
            
            <!-- Interactive Word Breakdown -->
            <div class="mb-4 sm:mb-6">
                <h4 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700 flex items-center">
                    <i class="fas fa-microscope text-blue-500 mr-2"></i>
                    Detailed Word Analysis
                </h4>
                <div class="space-y-3 sm:space-y-4">
                    ${result.words.map((word, wordIndex) => `
                        <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <!-- Word Header - Mobile Optimized -->
                            <div class="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors duration-200" onclick="togglePhonemeBreakdown(${wordIndex})">
                                <!-- Main content container -->
                                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                    <!-- Left side: Word Name -->
                                    <div class="flex-grow mb-2 sm:mb-0">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xl sm:text-2xl font-bold text-gray-800 pr-2">"${word.word}"</span>
                                            <!-- Mobile Chevron -->
                                            <i id="chevron-${wordIndex}" class="fas fa-chevron-down text-gray-400 transition-transform duration-200 text-lg sm:hidden"></i>
                                        </div>
                                    </div>

                                    <!-- Right side: Details -->
                                    <div class="flex items-center sm:justify-end space-x-3">
                                        <span class="px-3 py-1.5 rounded-full text-sm font-semibold ${getPhonemeColor(word.accuracy_score)}">
                                            ${Math.round(word.accuracy_score)}%
                                        </span>
                                        <span class="text-sm text-gray-500">
                                            ${word.phonemes.length} phoneme${word.phonemes.length > 1 ? 's' : ''}
                                        </span>
                                        <!-- Desktop Chevron -->
                                        <i id="chevron-desktop-${wordIndex}" class="hidden sm:block fas fa-chevron-down text-gray-400 transition-transform duration-200 text-lg"></i>
                                    </div>
                                </div>

                                <!-- Error Type on new line -->
                                ${word.error_type !== 'None' ? `
                                    <div class="mt-3 text-left sm:text-right">
                                        <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                            Error: ${word.error_type}
                                        </span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <!-- Phoneme Breakdown (Initially Hidden) -->
                            <div id="phonemes-${wordIndex}" class="hidden border-t bg-gradient-to-r from-blue-50 to-purple-50">
                                <div class="p-3 sm:p-4">
                                    <div class="mb-3">
                                        <span class="text-sm font-medium text-gray-600">Phoneme Breakdown:</span>
                                    </div>
                                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                                        ${word.phonemes.map((phoneme, phonemeIndex) => `
                                            <div class="text-center p-2 sm:p-3 rounded-lg border-2 ${getPhonemeScoreBgColor(phoneme.accuracy_score)} transition-all duration-200 hover:scale-105">
                                                <div class="text-lg sm:text-xl font-mono font-bold text-gray-800 mb-1">/${phoneme.phoneme}/</div>
                                                <div class="text-xs sm:text-sm font-semibold ${getScoreColor(phoneme.accuracy_score)}">${Math.round(phoneme.accuracy_score)}%</div>
                                                <div class="text-xs text-gray-500 mt-1">${getPhonemeQuality(phoneme.accuracy_score)}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    
                                    <!-- Phoneme Tips -->
                                    ${getPhonemeImprovementTips(word)}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    resultsSection.classList.remove('hidden');

    // Save analysis results state
    savePronunciationState({
        analysisResult: resultsContent.innerHTML,
        hasAnalysis: true
    });
}

// Toggle phoneme breakdown visibility
window.togglePhonemeBreakdown = (wordIndex) => {
    const phonemesDiv = document.getElementById(`phonemes-${wordIndex}`);
    const chevron = document.getElementById(`chevron-${wordIndex}`);

    if (phonemesDiv && chevron) {
        if (phonemesDiv.classList.contains('hidden')) {
            // Show phonemes
            phonemesDiv.classList.remove('hidden');
            phonemesDiv.classList.add('animate-slide-in');
            chevron.classList.add('rotate-180');
        } else {
            // Hide phonemes
            phonemesDiv.classList.add('hidden');
            phonemesDiv.classList.remove('animate-slide-in');
            chevron.classList.remove('rotate-180');
        }
    }
}

// Render Pronunciation Activity with integrated recorder
function renderPronunciationActivity(container, content) {
    currentWordIndex = 0;
    studiedWords.clear();

    // State persists across all navigation - only reset on manual restart

    const renderPronunciation = () => {
        const word = content.practice_words[currentWordIndex];

        container.innerHTML = `
            <div class="animate-slide-in">
                <div class="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden">
                    <div class="p-4 sm:p-6 pb-4 text-center border-b border-gray-100">
                        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
                            <i class="fas fa-microphone text-purple-500"></i>
                            Pronunciation Practice
                        </h2>
                        <p class="text-sm text-gray-600">Word ${currentWordIndex + 1} of ${content.practice_words.length}</p>
                    </div>
                    <div class="p-4 sm:p-6">
                        <!-- Word Display -->
                        <div class="text-center mb-6 sm:mb-8">
                            <div class="text-3xl sm:text-5xl font-extrabold text-purple-500 mb-3 sm:mb-4" id="reference-text">${word.word}</div>
                            <div class="flex items-center justify-center gap-3 mb-3 sm:mb-4">
                                <div class="text-lg sm:text-2xl text-gray-600 font-mono">${word.phonetic}</div>
                                <button onclick="playAudioFile('${getAssetUrl(word.audio)}', this)" 
                                        class="btn-audio group w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-purple-500/30 hover:scale-110 hover:from-purple-400 hover:to-pink-500 border-2 border-white/20 backdrop-blur-sm"
                                        title="Listen to pronunciation">
                                    <i class="fas fa-volume-up text-white text-xs sm:text-sm group-hover:scale-110 transition-transform duration-200"></i>
                                </button>
                            </div>
                            <div class="text-sm sm:text-lg text-gray-700 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 mb-4 sm:mb-6 max-w-sm sm:max-w-md mx-auto">
                                <strong>Tip:</strong> ${word.tips}
                            </div>
                        </div>

                        <!-- Recording Section -->
                        <div class="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                            <h3 class="text-base sm:text-lg font-semibold mb-4 text-gray-700 text-center">
                                <i class="fas fa-microphone text-red-500 mr-2"></i>
                                Record Your Pronunciation
                            </h3>
                            
                            <!-- Recording Controls -->
                            <div class="text-center mb-4 sm:mb-6">
                                <div class="relative inline-block">
                                    <!-- Outer glow ring -->
                                    <div id="glow-ring" class="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 opacity-20 pulse-glow"></div>

                                    <!-- Main record button -->
                                    <button id="record-btn" onclick="toggleRecording()"
                                        class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white text-xl sm:text-2xl shadow-lg hover:shadow-red-500/30 hover:scale-110 transition-all duration-300 border-4 border-white animate-pulse-record z-10">
                                        <i id="mic-icon" class="fas fa-microphone animate-mic-bounce"></i>
                                    </button>

                                    <!-- Recording indicator dots -->
                                    <div id="recording-dots" class="hidden absolute -top-2 -right-2">
                                        <div class="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-ping"></div>
                                        <div class="absolute top-0 w-3 h-3 sm:w-4 sm:h-4 bg-red-600 rounded-full"></div>
                                    </div>
                                </div>

                                <p id="record-status" class="mt-3 sm:mt-4 text-gray-600 font-medium text-sm sm:text-base">
                                    <span class="inline-block animate-bounce">🎤</span>
                                    Click to start recording
                                </p>

                                <!-- Visual sound waves when recording -->
                                <div id="sound-waves" class="hidden mt-3 sm:mt-4 flex justify-center space-x-1">
                                    <div class="w-1 bg-red-500 rounded-full animate-pulse" style="height: 16px; animation-delay: 0s;"></div>
                                    <div class="w-1 bg-red-500 rounded-full animate-pulse" style="height: 24px; animation-delay: 0.1s;"></div>
                                    <div class="w-1 bg-red-500 rounded-full animate-pulse" style="height: 20px; animation-delay: 0.2s;"></div>
                                    <div class="w-1 bg-red-500 rounded-full animate-pulse" style="height: 28px; animation-delay: 0.3s;"></div>
                                    <div class="w-1 bg-red-500 rounded-full animate-pulse" style="height: 16px; animation-delay: 0.4s;"></div>
                                    <div class="w-1 bg-red-500 rounded-full animate-pulse" style="height: 22px; animation-delay: 0.5s;"></div>
                                    <div class="w-1 bg-red-500 rounded-full animate-pulse" style="height: 18px; animation-delay: 0.6s;"></div>
                                </div>
                            </div>

                            <!-- Audio Playback -->
                            <div id="audio-section" class="hidden mb-4 sm:mb-6 text-center">
                                <audio id="recorded-audio" controls class="w-full mb-3 sm:mb-4"></audio>
                                <button id="analyze-btn" onclick="analyzeAudio()"
                                    class="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base">
                                    <i class="fas fa-chart-line mr-2"></i>
                                    Analyze Pronunciation
                                </button>
                            </div>

                            <!-- Results -->
                            <div id="results-section" class="hidden">
                                <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
                                    <h3 class="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">
                                        <i class="fas fa-chart-bar text-blue-500 mr-3"></i>
                                        Analysis Results
                                    </h3>
                                    <div id="results-content">
                                        <!-- Results will be populated here -->
                                    </div>
                                </div>
                            </div>

                            <!-- Loading -->
                            <div id="loading" class="hidden text-center py-6 sm:py-8">
                                <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
                                <p class="text-gray-600 text-sm sm:text-base">Analyzing your pronunciation...</p>
                            </div>
                        </div>

                        <!-- Progress Dots -->
                        <div class="flex justify-center gap-1 sm:gap-2 mb-6 sm:mb-8">
                            ${content.practice_words.map((_, index) => `
                                <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${index === currentWordIndex ? 'bg-purple-500 scale-125 shadow-lg shadow-purple-500/50' :
                studiedWords.has(index) ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-gray-300'
            }"></div>
                            `).join('')}
                        </div>

                        <!-- Navigation -->
                        <div class="flex justify-center gap-2 sm:gap-4 mb-16 sm:mb-20">
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

    // Restore state if exists for current word
    restorePronunciationState();

    // Navigation functions
    window.nextPronunciation = () => {
        studiedWords.add(currentWordIndex);
        if (currentWordIndex < content.practice_words.length - 1) {
            currentWordIndex++;
            renderPronunciation();
            restorePronunciationState();
        } else {
            markActivityCompleted();
        }
    };

    window.prevPronunciation = () => {
        if (currentWordIndex > 0) {
            currentWordIndex--;
            renderPronunciation();
            restorePronunciationState();
        }
    };
}

// Restore pronunciation state for current word
function restorePronunciationState() {
    const wordState = pronunciationState[currentWordIndex];
    if (!wordState) return;

    // Restore recorded audio if exists
    if (wordState.recordedBlob && wordState.audioURL) {
        recordedBlob = wordState.recordedBlob;

        // Show audio section
        const audioSection = document.getElementById('audio-section');
        const recordedAudio = document.getElementById('recorded-audio');

        if (audioSection && recordedAudio) {
            audioSection.classList.remove('hidden');
            recordedAudio.src = wordState.audioURL;
        }
    }

    // Restore analysis results if exists
    if (wordState.analysisResult) {
        const resultsSection = document.getElementById('results-section');
        const resultsContent = document.getElementById('results-content');

        if (resultsSection && resultsContent) {
            resultsSection.classList.remove('hidden');
            resultsContent.innerHTML = wordState.analysisResult;
        }
    }
}

// Save pronunciation state for current word
function savePronunciationState(data) {
    if (!pronunciationState[currentWordIndex]) {
        pronunciationState[currentWordIndex] = {};
    }

    Object.assign(pronunciationState[currentWordIndex], data);
}

// Placeholder functions for other activities
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
                            <button id="play-all-dialog-btn" class="btn-audio group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                <i class="fas fa-volume-up"></i>
                                Play
                            </button>
                        </div>
                        
                        <div class="space-y-4">
                            ${content.dialog.map((item, index) => `
                                <div class="p-4 border-2 border-gray-200 rounded-2xl transition-all duration-300 hover:border-green-500 hover:bg-green-50">
                                    <div class="flex items-center gap-3 mb-3">
                                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold speaker-color-class">
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

    // Attach event listener after content is rendered
    const playAllBtn = document.getElementById('play-all-dialog-btn');
    if (playAllBtn) {
        playAllBtn.onclick = () => playAllDialog(playAllBtn, content.dialog);
    }

    // Apply speaker colors dynamically
    content.dialog.forEach((item, index) => {
        const speakerDiv = container.querySelector(`.space-y-4 > div:nth-child(${index + 1}) .speaker-color-class`);
        if (speakerDiv) {
            if (item.speaker === 'A') {
                speakerDiv.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-blue-600');
            } else {
                speakerDiv.classList.add('bg-gradient-to-br', 'from-green-500', 'to-green-600');
            }
        }
    });
}

// Play all dialog function
window.playAllDialog = (button, dialogContent) => {
    // If the play-all button is currently playing and we want to stop it
    if (button.id === 'play-all-dialog-btn' && isPlaying) {
        stopCurrentAudio();
        resetAllAudioButtonsUI();
        isPlaying = false;
        return;
    }

    stopCurrentAudio();
    resetAllAudioButtonsUI();

    let currentIndex = 0;
    const playNext = () => {
        if (currentIndex < dialogContent.length) {
            const item = dialogContent[currentIndex];
            const audio = new Audio(getAssetUrl(item.audio));

            if (button) {
                button.classList.add('animate-pulse-ring');
                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-stop';
                }
            }
            isPlaying = true;
            currentAudio = audio;

            audio.onended = () => {
                currentIndex++;
                setTimeout(playNext, 500);
            };

            audio.onerror = () => {
                const utterance = new SpeechSynthesisUtterance(item.text);
                utterance.onend = () => {
                    currentIndex++;
                    setTimeout(playNext, 500);
                };
                currentAudio = utterance;
                speechSynthesis.speak(utterance);
            };

            audio.play().catch(() => {
                const utterance = new SpeechSynthesisUtterance(item.text);
                utterance.onend = () => {
                    currentIndex++;
                    setTimeout(playNext, 500);
                };
                currentAudio = utterance;
                speechSynthesis.speak(utterance);
            });
        } else {
            if (button) {
                button.classList.remove('animate-pulse-ring');
                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-volume-up';
                }
            }
            isPlaying = false;
            currentAudio = null;
        }
    };

    playNext();
};

function renderQuizActivity(container, content) {
    // Handle both old structure (single question object) and new structure (array of questions)
    let questions = [];
    if (Array.isArray(content.questions)) {
        // New structure: array of questions in "questions" property
        questions = content.questions;
    } else if (content.question && typeof content.question === 'string' && content.options && content.correct_answer) {
        // Old structure: content directly contains question properties
        questions = [{
            question: content.question,
            options: content.options,
            correct_answer: content.correct_answer,
            image: content.image,
            audio: content.audio
        }];
    } else {
        console.error('Invalid quiz content structure:', content);
        return;
    }

    // Initialize or reset quiz state
    if (!window.quizState || window.quizState.questions !== questions) {
        window.quizState = {
            currentQuestionIndex: 0,
            selectedAnswer: null,
            showResult: false,
            questions: questions,
            correctAnswers: 0
        };
    }

    const renderQuiz = () => {
        const currentQuestion = window.quizState.questions[window.quizState.currentQuestionIndex];
        const isLastQuestion = window.quizState.currentQuestionIndex === window.quizState.questions.length - 1;
        const isMultipleQuestions = window.quizState.questions.length > 1;

        container.innerHTML = `
            <div class="animate-slide-in">
                <div class="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden">
                    <div class="p-6 pb-4 text-center border-b border-gray-100">
                        <h2 class="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
                            <i class="fas fa-question-circle text-orange-500"></i>
                            Quiz Time
                        </h2>
                        ${isMultipleQuestions ? `
                            <p class="text-sm text-gray-600">Question ${window.quizState.currentQuestionIndex + 1} of ${window.quizState.questions.length}</p>
                        ` : `
                            <p class="text-sm text-gray-600">Test your knowledge</p>
                        `}
                    </div>
                    <div class="p-6">
                        ${currentQuestion.image ? `
                            <div class="text-center mb-6">
                                <img src="${getAssetUrl(currentQuestion.image)}" alt="Quiz Image" class="w-full max-w-80 h-56 object-cover rounded-2xl shadow-lg mx-auto">
                            </div>
                        ` : ''}
                        
                        <div class="text-center mb-8">
                            <div class="flex items-center justify-center gap-3 mb-4">
                                <h3 class="text-2xl font-bold text-gray-800 flex items-center justify-center flex-wrap gap-3">${currentQuestion.question}
                                ${currentQuestion.audio ? `
                                    <button onclick="playAudioFile('${getAssetUrl(currentQuestion.audio)}', this)" title="Listen to question" 
                                            class="btn-audio group w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-110 hover:from-orange-400 hover:to-red-500 border-2 border-white/20 backdrop-blur-sm">
                                        <i class="fas fa-volume-up text-white text-xs group-hover:scale-110 transition-transform duration-200"></i>
                                    </button>
                                ` : ''}
                                </h3>
                            </div>
                        </div>

                        <div class="max-w-lg mx-auto space-y-3 mb-8">
                            ${currentQuestion.options.map((option, index) => `
                                <button onclick="selectQuizAnswer('${option.replace(/'/g, "\\'")}', ${window.quizState.currentQuestionIndex})" 
                                        class="quiz-option w-full p-4 border-2 border-gray-200 rounded-xl text-left transition-all duration-300 hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-1 ${window.quizState.selectedAnswer === option ? 'border-orange-500 bg-orange-500 text-white' : ''
            } ${window.quizState.showResult ? (
                option === currentQuestion.correct_answer ? 'border-green-500 bg-green-500 text-white' :
                    option === window.quizState.selectedAnswer && option !== currentQuestion.correct_answer ? 'border-red-500 bg-red-500 text-white' : ''
            ) : ''
            }">
                                    ${option}
                                </button>
                            `).join('')}
                        </div>

                        ${window.quizState.showResult ? `
                            <div class="text-center mb-6">
                                <div class="p-6 rounded-2xl max-w-lg mx-auto ${window.quizState.selectedAnswer === currentQuestion.correct_answer ?
                    'bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-500' :
                    'bg-gradient-to-r from-red-100 to-red-200 border-2 border-red-500'
                }">
                                    <div class="text-4xl mb-2">
                                        ${window.quizState.selectedAnswer === currentQuestion.correct_answer ? '🎉' : '😔'}
                                    </div>
                                    <h4 class="text-xl font-bold mb-2 ${window.quizState.selectedAnswer === currentQuestion.correct_answer ? 'text-green-800' : 'text-red-800'
                }">
                                        ${window.quizState.selectedAnswer === currentQuestion.correct_answer ? 'Correct!' : 'Incorrect!'}
                                    </h4>
                                    <p class="text-gray-700">
                                        The correct answer is: <strong>${currentQuestion.correct_answer}</strong>
                                    </p>
                                    ${isMultipleQuestions ? `
                                        <p class="text-sm text-gray-600 mt-2">
                                            Score: ${window.quizState.correctAnswers}/${window.quizState.questions.length}
                                        </p>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Progress Dots - moved to bottom -->
                        ${isMultipleQuestions ? `
                            <div class="flex justify-center gap-2 mb-6">
                                ${window.quizState.questions.map((_, index) => `
                                    <div class="w-2.5 h-2.5 rounded-full transition-all duration-300 ${index < window.quizState.currentQuestionIndex ? 'bg-green-500 shadow-lg shadow-green-500/30' :
                        index === window.quizState.currentQuestionIndex ? 'bg-orange-500 scale-125 shadow-lg shadow-orange-500/50' : 'bg-gray-300'
                    }"></div>
                                `).join('')}
                            </div>
                        ` : ''}

                        ${!window.quizState.showResult ? `
                            ${window.quizState.selectedAnswer ? `
                                <div class="text-center mb-12">
                                    <button onclick="checkQuizAnswer('${currentQuestion.correct_answer.replace(/'/g, "\\'")}', ${window.quizState.currentQuestionIndex})" 
                                            class="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 overflow-hidden animate-slide-in">
                                        <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div class="relative flex items-center gap-2">
                                            <div class="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                                                <i class="fas fa-check text-white text-xs group-hover:scale-110 transition-transform duration-300"></i>
                                            </div>
                                            <span class="group-hover:scale-105 transition-transform duration-300">Check Answer</span>
                                        </div>
                                        <div class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-75"></div>
                                    </button>
                                </div>
                            ` : `
                                <div class="text-center mb-12">
                                    <p class="text-gray-500 text-sm">Please select an answer</p>
                                </div>
                            `}
                        ` : `
                            <!-- Navigation after showing result -->
                            ${isMultipleQuestions ? `
                                <div class="flex justify-center gap-2 sm:gap-4 mb-16 sm:mb-20">
                                    <button onclick="prevQuizQuestion()" ${window.quizState.currentQuestionIndex === 0 ? 'disabled' : ''} 
                                            class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold border border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                        <i class="fas fa-arrow-left text-xs sm:text-sm"></i>
                                        <span class="hidden sm:inline">Previous</span>
                                    </button>
                                    <button onclick="${isLastQuestion ? 'completeQuiz()' : 'nextQuizQuestion()'}" 
                                            class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                        ${isLastQuestion ? '<i class="fas fa-trophy text-xs sm:text-sm"></i><span class="hidden sm:inline">Complete Quiz</span>' : '<span class="hidden sm:inline">Next</span> <i class="fas fa-arrow-right text-xs sm:text-sm"></i>'}
                                    </button>
                                </div>
                            ` : `
                                <div class="text-center mb-12">
                                    <button onclick="completeQuiz()" 
                                            class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                        <i class="fas fa-arrow-right"></i>
                                        Continue
                                    </button>
                                </div>
                            `}
                        `}
                    </div>
                </div>
            </div>
        `;
    };

    renderQuiz();
}
// Global Quiz functions
window.selectQuizAnswer = (answer, questionIndex) => {
    if (!window.quizState.showResult) {
        window.quizState.selectedAnswer = answer;
        const quizActivity = learningActivities.find(a => a.type === 'quiz');
        if (quizActivity) {
            renderQuizActivity(document.getElementById('lesson-content'), quizActivity.content);
        }
    }
};

window.checkQuizAnswer = (correctAnswer, questionIndex) => {
    window.quizState.showResult = true;
    if (window.quizState.selectedAnswer === correctAnswer) {
        window.quizState.correctAnswers++;
        playTextToSpeech('correct');
        triggerConfetti();
    } else {
        playTextToSpeech('incorrect');
    }
    const quizActivity = learningActivities.find(a => a.type === 'quiz');
    if (quizActivity) {
        renderQuizActivity(document.getElementById('lesson-content'), quizActivity.content);
    }
};

window.nextQuizQuestion = () => {
    if (window.quizState.currentQuestionIndex < window.quizState.questions.length - 1) {
        window.quizState.currentQuestionIndex++;
        window.quizState.selectedAnswer = null;
        window.quizState.showResult = false;

        const quizActivity = learningActivities.find(a => a.type === 'quiz');
        if (quizActivity) {
            renderQuizActivity(document.getElementById('lesson-content'), quizActivity.content);
        }
    } else {
        // Last question, complete quiz
        completeQuiz();
    }
};

window.prevQuizQuestion = () => {
    if (window.quizState.currentQuestionIndex > 0) {
        window.quizState.currentQuestionIndex--;
        window.quizState.selectedAnswer = null;
        window.quizState.showResult = false;

        const quizActivity = learningActivities.find(a => a.type === 'quiz');
        if (quizActivity) {
            renderQuizActivity(document.getElementById('lesson-content'), quizActivity.content);
        }
    }
};

window.completeQuiz = () => {
    // Reset quiz state for next time
    window.quizState = null;
    markActivityCompleted();
};

// Legacy functions for backward compatibility
window.selectAnswer = (answer) => {
    window.selectQuizAnswer(answer, 0);
};

window.checkAnswer = (correctAnswer) => {
    window.checkQuizAnswer(correctAnswer, 0);
};
// Course completion function
function showCourseCompletion() {
    const contentDiv = document.getElementById('lesson-content');
    contentDiv.innerHTML = `
        <div class="animate-slide-in">
            <div class="bg-white rounded-3xl shadow-lg p-8 text-center mb-24">
                <div class="text-6xl mb-4">🎉</div>
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Congratulations!</h2>
                <p class="text-lg text-gray-600 mb-6">You have successfully completed all learning activities!</p>
                <div class="flex justify-center gap-4 mb-8">
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
    // Reset activity navigation state
    currentActivityIndex = 0;
    completedActivities.clear();

    // Reset vocabulary state
    currentWordIndex = 0;
    studiedWords.clear();

    // Reset quiz state
    selectedAnswer = null;
    showResult = false;
    if (window.quizState) {
        window.quizState = null;
    }

    // Reset pronunciation state - this is the key addition
    pronunciationState = {};

    // Reset any recording state
    recordedBlob = null;
    isRecording = false;
    hasRecordedAudio = false;
    hasDetectedSound = false;

    // Clear any pending timeouts
    if (noSoundTimeout) {
        clearTimeout(noSoundTimeout);
        noSoundTimeout = null;
    }
    if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
    }

    // Reset audio playback
    if (currentAudio) {
        if (currentAudio.pause) {
            currentAudio.pause();
        } else if (currentAudio.cancel) {
            speechSynthesis.cancel();
        }
        currentAudio = null;
        isPlaying = false;
    }

    // Reset UI state
    resetAllAudioButtonsUI();

    // Clear any pronunciation UI elements that might be lingering
    const audioSection = document.getElementById('audio-section');
    const resultsSection = document.getElementById('results-section');
    if (audioSection) audioSection.classList.add('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');

    console.log('Course restarted - all states reset including pronunciation data');
    showActivity(0);
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
        prevBtn.disabled = currentActivityIndex === 0;
    }

    if (nextBtn) {
        if (currentActivityIndex === learningActivities.length - 1) {
            nextBtn.innerHTML = '<i class="fas fa-trophy"></i>';
            nextBtn.title = 'Complete Course';
        } else {
            nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextBtn.title = 'Next';
        }
    }
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