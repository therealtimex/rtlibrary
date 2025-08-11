console.log('Loading ui.js...');

// Show different app states
function showLoadingState() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('app-content').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
}

function showAppContent() {
    console.log('showAppContent called');
    const loadingState = document.getElementById('loading-state');
    const appContent = document.getElementById('app-content');
    const errorState = document.getElementById('error-state');

    console.log('Elements found:', {
        loadingState: !!loadingState,
        appContent: !!appContent,
        errorState: !!errorState
    });

    if (loadingState) loadingState.classList.add('hidden');
    if (appContent) appContent.classList.remove('hidden');
    if (errorState) errorState.classList.add('hidden');

    console.log('App content should now be visible');
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
    // Get current warmup activity from learningActivities
    const currentActivity = learningActivities[currentActivityIndex];
    if (currentActivity && currentActivity.type === 'warmup') {
        const button = document.getElementById('modal-audio-button');
        const audioPath = getAssetUrl(currentActivity.content.audio);
        console.log('🎵 playModalAudio called, delegating to toggleAudioPlayback');
        toggleAudioPlayback(audioPath, button);
    }
}

// Show pronunciation results modal
function showPronunciationModal(resultsHTML) {
    const modal = document.getElementById('pronunciation-results-modal');
    const modalContent = document.getElementById('modal-pronunciation-results');

    if (modal && modalContent) {
        modalContent.innerHTML = resultsHTML;
        modal.classList.remove('opacity-0', 'invisible');
        modal.classList.add('opacity-100', 'visible');
        modal.querySelector('.bg-white').classList.remove('translate-y-8');
        modal.querySelector('.bg-white').classList.add('translate-y-0');
        debugLog('Pronunciation results modal opened');
    }
}

// Close pronunciation results modal
function closePronunciationModal() {
    const modal = document.getElementById('pronunciation-results-modal');
    if (modal) {
        modal.classList.add('opacity-0', 'invisible');
        modal.classList.remove('opacity-100', 'visible');
        modal.querySelector('.bg-white').classList.add('translate-y-8');
        modal.querySelector('.bg-white').classList.remove('translate-y-0');
        debugLog('Pronunciation results modal closed');
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

// Update the UI based on recording state
function updateRecordingUI(isRec) {
    debugLog(`updateRecordingUI called with isRec: ${isRec}`);
    const recordBtn = document.getElementById('record-btn');
    const recordStatus = document.getElementById('record-status');
    const micIcon = document.getElementById('mic-icon');
    const glowRing = document.getElementById('glow-ring');
    const recordingDots = document.getElementById('recording-dots');
    const soundWaves = document.getElementById('sound-waves');
    const audioSection = document.getElementById('audio-section');
    const resultsSection = document.getElementById('results-section');

    if (isRec) {
        if (micIcon) micIcon.className = 'fas fa-stop';
        if (recordBtn) {
            recordBtn.className = recordBtn.className.replace(/from-red-500 to-red-600/g, 'from-gray-500 to-gray-600');
            recordBtn.classList.remove('animate-pulse-record');
            recordBtn.classList.add('animate-recording-pulse');
        }
        if (glowRing) glowRing.classList.add('hidden');
        if (recordingDots) recordingDots.classList.remove('hidden');
        if (soundWaves) soundWaves.classList.remove('hidden');
        if (recordStatus) recordStatus.innerHTML = '<span class="text-red-600 font-semibold">🔴 Recording...</span>';

        if (audioSection) audioSection.classList.add('hidden');
        if (resultsSection) resultsSection.classList.add('hidden');

    } else {
        if (micIcon) {
            micIcon.className = 'fas fa-microphone';
            micIcon.classList.add('animate-mic-bounce');
        }
        if (recordBtn) {
            recordBtn.className = recordBtn.className.replace(/from-gray-500 to-gray-600/g, 'from-red-500 to-red-600');
            recordBtn.classList.remove('animate-recording-pulse');
            recordBtn.classList.add('animate-pulse-record');
        }
        if (glowRing) {
            glowRing.classList.remove('hidden', 'pulse-glow');
            // A little trick to restart animation
            void glowRing.offsetWidth;
            glowRing.classList.add('pulse-glow');
        }

        if (recordingDots) recordingDots.classList.add('hidden');
        if (soundWaves) soundWaves.classList.add('hidden');
        if (recordStatus) recordStatus.innerHTML = '<span class="inline-block animate-bounce">🎤</span> Click to start recording';
    }
}

// Get score colors
function getScoreColor(score) {
    if (score >= 90) return 'text-theme-success';
    if (score >= 80) return 'text-theme-info';
    if (score >= 70) return 'text-theme-warning';
    if (score >= 60) return 'text-theme-warning';
    return 'text-theme-danger';
}

function getScoreBgColor(score) {
    if (score >= 90) return 'bg-theme-success-50 border-theme-success-200';
    if (score >= 80) return 'bg-theme-info-50 border-theme-info-200';
    if (score >= 70) return 'bg-theme-warning-50 border-theme-warning-200';
    if (score >= 60) return 'bg-theme-warning-50 border-theme-warning-200';
    return 'bg-theme-danger-50 border-theme-danger-200';
}

function getPhonemeColor(score) {
    if (score >= 90) return 'bg-theme-success-100 text-theme-success-800';
    if (score >= 80) return 'bg-theme-info-100 text-theme-info-800';
    if (score >= 70) return 'bg-theme-warning-100 text-theme-warning-800';
    return 'bg-theme-danger-100 text-theme-danger-800';
}

// Additional helper functions for phoneme breakdown
function getPhonemeScoreBgColor(score) {
    if (score >= 90) return 'bg-theme-success-50 border-theme-success-200';
    if (score >= 80) return 'bg-theme-info-50 border-theme-info-200';
    if (score >= 70) return 'bg-theme-warning-50 border-theme-warning-200';
    if (score >= 60) return 'bg-theme-warning-50 border-theme-warning-200';
    return 'bg-theme-danger-50 border-theme-danger-200';
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
            <div class="mt-4 p-3 bg-theme-warning-50 border border-theme-warning-200 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-theme-warning mr-2"></i>
                    <span class="text-sm text-theme-warning font-medium">This word was not detected in your recording.</span>
                </div>
            </div>
        `;
    }

    // Case 2: The word was said, now check for poorly pronounced phonemes.
    const poorPhonemes = word.phonemes.filter(p => p.accuracy_score < 70);
    if (poorPhonemes.length === 0) {
        // All phonemes are good.
        return `
            <div class="mt-4 p-3 bg-theme-success-50 border border-theme-success-200 rounded-lg">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-theme-success mr-2"></i>
                    <span class="text-sm text-theme-success font-medium">Great pronunciation! All phonemes are well pronounced.</span>
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
        `;
}

// Display pronunciation results
function displayResults(result) {
    const resultsContent = document.getElementById('results-content');
    const resultsSection = document.getElementById('results-section');

    if (!resultsContent || !resultsSection) return;

    // Generate results HTML
    let resultsHTML = '';

    if (result.error) {
        resultsHTML = `
            <div class="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <strong>Error:</strong> ${result.error}
            </div>
        `;
    } else {
        resultsHTML = `
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
                <p class="text-base sm:text-lg text-gray-800 italic">"${result.actual_spoken_text}"</p>
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

    // Populate inline results for state persistence
    resultsContent.innerHTML = resultsHTML;

    // Show modal instead of inline results
    showPronunciationModal(resultsHTML);

    // Show View Results button
    const viewResultsBtn = document.getElementById('view-results-btn');
    if (viewResultsBtn) {
        viewResultsBtn.classList.remove('hidden');
        debugLog('View Results button shown');
    }

    // Keep inline results hidden but populated for state persistence
    // resultsSection.classList.remove('hidden'); // Keep hidden - only use popup modal

    // Save analysis results state
    debugLog('About to save pronunciation results');
    debugLog('currentActivityIndex:', currentActivityIndex);
    debugLog('currentWordIndex:', currentWordIndex);
    savePronunciationState({
        analysisResult: resultsHTML,
        hasAnalysis: true
    });
}

// Toggle phoneme breakdown visibility
window.togglePhonemeBreakdown = (wordIndex) => {
    const phonemesDiv = document.getElementById(`phonemes-${wordIndex}`);
    const chevron = document.getElementById(`chevron-${wordIndex}`);
    const chevronDesktop = document.getElementById(`chevron-desktop-${wordIndex}`);

    if (phonemesDiv) {
        if (phonemesDiv.classList.contains('hidden')) {
            // Show phonemes
            phonemesDiv.classList.remove('hidden');
            phonemesDiv.classList.add('animate-slide-in');
            if (chevron) chevron.classList.add('rotate-180');
            if (chevronDesktop) chevronDesktop.classList.add('rotate-180');
        } else {
            // Hide phonemes
            phonemesDiv.classList.add('hidden');
            phonemesDiv.classList.remove('animate-slide-in');
            if (chevron) chevron.classList.remove('rotate-180');
            if (chevronDesktop) chevronDesktop.classList.remove('rotate-180');
        }
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



// Progress dots and navigation buttons are now in activities.js
// Show specific activity
function showActivity(index) {
    console.log('showActivity called with index:', index, 'total activities:', learningActivities.length);

    if (index < 0 || index >= learningActivities.length) {
        console.log('Invalid activity index:', index);
        return;
    }

    currentActivityIndex = index;
    currentWordIndex = 0; // Reset word index for new activity
    const activity = learningActivities[currentActivityIndex];
    console.log('Showing activity:', activity.type, activity.id);

    // Update analytics context when activity changes
    console.log('🔍 showActivity called with activity:', activity.type, activity.id);
    if (typeof updateAnalyticsContext === 'function') {
        console.log('📊 Calling updateAnalyticsContext...');
        updateAnalyticsContext(activity);
    } else {
        console.warn('⚠️ updateAnalyticsContext function not found');
    }

    // Reset pronunciation activity initialization flag when switching activities
    if (activity.type === 'pronunciation') {
        pronunciationActivityInitialized = false;
    }

    renderActivityContent(activity);
    renderProgressBar();
    updateNavigationButtons();
}



// Render Progress Bar
// ==== FINAL PROGRESS BAR - VOCAB HAS NO LEFT BAR ====
function renderProgressBar() {
    const progressContainer = document.getElementById('activity-progress');
    const labelsContainer = document.getElementById('progress-labels');

    if (!progressContainer || !labelsContainer) return;

    progressContainer.innerHTML = '';
    labelsContainer.innerHTML = '';

    if (learningActivities.length === 0) {
        const progressCounter = document.getElementById('progress-counter');
        if (progressCounter) {
            progressCounter.textContent = '0 of 0';
        }
        return;
    }

    learningActivities.forEach((activity, index) => {
        const activityInfo = activityTypeIcons[activity.type] || {
            name: 'Activity',
            icon: 'fas fa-circle',
            color: 'text-gray-500'
        };

        const isWarmup = activity.type === 'warmup';
        const isCongratulations = activity.type === 'congratulations';
        const isVocab = activity.type === 'vocabulary';
        const isMainActivity = !isWarmup && !isCongratulations;

        // Create progress step container
        const stepContainer = document.createElement('div');

        if (isWarmup || isCongratulations) {
            // Milestone (centered)
            stepContainer.className = 'flex items-center justify-center px-4';
            if (index === currentActivityIndex) {
                stepContainer.className += ' animate-pulse';
            }
        } else if (isVocab) {
            // Vocabulary: no bar, but aligned with others.
            stepContainer.className = 'relative h-1.5 transition-all duration-300 cursor-pointer pr-4';
            if (index === currentActivityIndex) {
                stepContainer.className += ' animate-pulse';
            }
        } else {
            // Main activities with full progress bar
            stepContainer.className = 'flex-1 h-1.5 bg-gray-200 rounded-full relative transition-all duration-300 cursor-pointer hover:bg-gray-300';

            if (index < currentActivityIndex) {
                stepContainer.className += ' bg-gradient-to-r from-green-500 to-green-600';
            } else if (index === currentActivityIndex) {
                stepContainer.className += ' bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse';
            }
        }

        stepContainer.onclick = () => showActivity(index);

        // Create indicator with icon
        const indicator = document.createElement('div');

        if (isWarmup || isCongratulations) {
            indicator.className = 'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 border-2 border-white shadow-lg';
        } else {
            indicator.className = 'absolute -top-3 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 border-2 border-white shadow-lg';
        }

        // Set indicator state and icon
        if (index < currentActivityIndex) {
            if (isWarmup) {
                indicator.className += ' bg-theme-danger text-theme-text-onprimary shadow-theme-danger/30';
                indicator.innerHTML = `<i class="${activityInfo.icon}"></i>`;
            } else if (isCongratulations) {
                indicator.className += ' bg-theme-accent text-theme-text-onprimary shadow-theme-accent/30';
                indicator.innerHTML = `<i class="${activityInfo.icon}"></i>`;
            } else {
                indicator.className += ' bg-theme-success text-theme-text-onprimary shadow-theme-success/30';
                indicator.innerHTML = '<i class="fas fa-check"></i>';
            }
        } else if (index === currentActivityIndex) {
            if (isWarmup) {
                indicator.className += ' bg-theme-danger text-theme-text-onprimary scale-110 shadow-theme-danger/50';
            } else if (isCongratulations) {
                indicator.className += ' bg-theme-accent text-theme-text-onprimary scale-110 shadow-theme-accent/50';
            } else {
                indicator.className += ' bg-theme-primary text-theme-text-onprimary scale-110 shadow-theme-primary/50';
            }
            indicator.innerHTML = `<i class="${activityInfo.icon}"></i>`;
        } else {
            indicator.className += ' bg-gray-200 text-gray-400';
            indicator.innerHTML = `<i class="${activityInfo.icon}"></i>`;
        }

        stepContainer.appendChild(indicator);
        progressContainer.appendChild(stepContainer);

        // Create label
        const label = document.createElement('div');

        if (isMainActivity) {
            // Main activity (including vocab)
            label.className = 'text-xs text-center min-w-[60px] sm:min-w-[60px] min-w-[45px] cursor-pointer p-1 rounded-md transition-all duration-300 hover:bg-gray-100 flex flex-col items-center gap-1';

            if (index < currentActivityIndex) {
                label.className += ' text-theme-success font-semibold';
            } else if (index === currentActivityIndex) {
                label.className += ' text-blue-600 font-semibold bg-blue-50';
            } else {
                label.className += ' text-gray-600';
            }

            label.innerHTML = `<div class="text-[10px] sm:text-xs">${activityInfo.name}</div>`;
        } else {
            // Milestone label (warmup, congratulations)
            label.className = 'text-xs text-center min-w-[50px] sm:min-w-[50px] min-w-[40px] cursor-pointer p-1 transition-all duration-300 flex flex-col items-center gap-1';

            if (index < currentActivityIndex) {
                label.className += ' text-green-600';
            } else if (index === currentActivityIndex) {
                label.className += ' text-blue-600 font-semibold';
            } else {
                label.className += ' text-gray-500';
            }

            label.innerHTML = `<div class="hidden sm:block text-[10px] sm:text-xs opacity-75">${activityInfo.name}</div>`;
        }

        label.onclick = () => showActivity(index);
        labelsContainer.appendChild(label);
    });

    // Update counter
    const progressCounter = document.getElementById('progress-counter');
    if (progressCounter) {
        const currentActivity = learningActivities[currentActivityIndex];
        if (!currentActivity) {
            progressCounter.textContent = '0 of 0';
        } else if (currentActivity.type === 'warmup') {
            progressCounter.textContent = 'Warmup';
        } else if (currentActivity.type === 'congratulations') {
            progressCounter.textContent = 'Completed!';
        } else {
            // Count only main activities (exclude warmup and congratulations)
            const mainActivities = learningActivities.filter(a => a.type !== 'warmup' && a.type !== 'congratulations');
            const currentMainIndex = mainActivities.findIndex(a => a.id === currentActivity.id);
            progressCounter.textContent = `${currentMainIndex + 1} of ${mainActivities.length}`;
        }
    }
}

// Export functions to global scope for HTML onclick handlers
window.showLoadingState = showLoadingState;
window.showAppContent = showAppContent;
window.showErrorState = showErrorState;
window.retryLoading = retryLoading;
window.showDescriptionModal = showDescriptionModal;
window.closeDescriptionModal = closeDescriptionModal;
window.playModalAudio = playModalAudio;
window.showPronunciationModal = showPronunciationModal;
window.closePronunciationModal = closePronunciationModal;
window.triggerConfetti = triggerConfetti;
window.updateNavigationButtons = updateNavigationButtons;
window.updateRecordingUI = updateRecordingUI;
window.displayResults = displayResults;
window.showActivity = showActivity;
window.renderProgressBar = renderProgressBar;