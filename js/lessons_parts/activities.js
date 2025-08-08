console.log('Loading activities.js...');

// Render Activity Content
function renderActivityContent(activity) {
    console.log('renderActivityContent called with activity:', activity.type);
    const contentDiv = document.getElementById('lesson-content');
    
    if (!contentDiv) {
        console.error('lesson-content div not found!');
        return;
    }

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
        case 'warmup':
            renderWarmupActivity(contentDiv, activity.content);
            break;
        case 'congratulations':
            renderCongratulationsActivity(contentDiv, activity.content);
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
        console.log('renderWord called for index:', currentWordIndex, 'word:', content.words[currentWordIndex].word);
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
                            <div class="text-base sm:text-lg text-gray-700 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 mb-4 sm:mb-6 max-w-sm sm:max-w-md mx-auto" onmouseenter="trackMeaningView('${word.word}')" ontouchstart="trackMeaningView('${word.word}')">${word.meaning}</div>
                        </div>

                        ${createProgressDots({ count: content.words.length, currentIndex: currentWordIndex, studiedItems: studiedWords, theme: 'blue' })}

                        ${createNavigationButtons({ prevAction: 'prevWord()', nextAction: 'nextWord()', isFirst: currentWordIndex === 0, isLast: currentWordIndex === content.words.length - 1, theme: 'blue', activityType: 'vocabulary' })}
                    </div>
                </div>
            </div>
        `;
    };

    renderWord();

    // Dummy tracking function if analytics is not available
    if (typeof vocabularyTimeTracker === 'undefined') {
        window.vocabularyTimeTracker = { startTracking: () => { }, endTracking: () => { } };
    }
    

    // Only start tracking if this is the initial render of the vocabulary activity
    // or if the activity was reset (e.g., navigating from another activity type)
    if (content.words[0] && !vocabularyTimeTracker.currentWord) {
        vocabularyTimeTracker.startTracking(content.words[0].word);
    }

    window.nextWord = async () => {
        console.log('nextWord called. currentWordIndex before endTracking:', currentWordIndex);
        await vocabularyTimeTracker.endTracking();
        console.log('nextWord: endTracking completed. currentWordIndex before increment:', currentWordIndex);

        studiedWords.add(currentWordIndex);
        if (currentWordIndex < content.words.length - 1) {
            currentWordIndex++;
            console.log('nextWord: currentWordIndex incremented to:', currentWordIndex);
            renderWord();

            const newWord = content.words[currentWordIndex];
            if (newWord) {
                vocabularyTimeTracker.startTracking(newWord.word);
            }
        } else {
            console.log('nextWord: Reached last word. Calling markActivityCompleted.');
            markActivityCompleted();
        }
    };

    window.prevWord = async () => {
        console.log('prevWord called. currentWordIndex before endTracking:', currentWordIndex);
        await vocabularyTimeTracker.endTracking();
        console.log('prevWord: endTracking completed. currentWordIndex before decrement:', currentWordIndex);

        if (currentWordIndex > 0) {
            currentWordIndex--;
            console.log('prevWord: currentWordIndex decremented to:', currentWordIndex);
            renderWord();

            const prevWordData = content.words[currentWordIndex];
            if (prevWordData) {
                vocabularyTimeTracker.startTracking(prevWordData.word);
            }
        }
    };
}

// Render Pronunciation Activity
function renderPronunciationActivity(container, content) {
    if (typeof renderPronunciationActivity.lastActivityIndex === 'undefined' ||
        renderPronunciationActivity.lastActivityIndex !== currentActivityIndex) {
        debugLog(`Resetting pronunciation activity state for activity ${currentActivityIndex}`);
        currentWordIndex = 0;
        studiedWords.clear();
        renderPronunciationActivity.lastActivityIndex = currentActivityIndex;
    } else {
        debugLog(`Keeping pronunciation state for activity ${currentActivityIndex}, currentWordIndex: ${currentWordIndex}`);
    }

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

                        <div class="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                            <h3 class="text-base sm:text-lg font-semibold mb-4 text-gray-700 text-center">
                                <i class="fas fa-microphone text-red-500 mr-2"></i>
                                Record Your Pronunciation
                            </h3>
                            
                            <div class="text-center mb-4 sm:mb-6">
                                <div class="relative inline-block">
                                    <div id="glow-ring" class="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 opacity-20 pulse-glow"></div>
                                    <button id="record-btn" onclick="toggleRecording()"
                                        class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white text-xl sm:text-2xl shadow-lg hover:shadow-red-500/30 hover:scale-110 transition-all duration-300 border-4 border-white animate-pulse-record z-10">
                                        <i id="mic-icon" class="fas fa-microphone animate-mic-bounce"></i>
                                    </button>
                                    <div id="recording-dots" class="hidden absolute -top-2 -right-2">
                                        <div class="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-ping"></div>
                                        <div class="absolute top-0 w-3 h-3 sm:w-4 sm:h-4 bg-red-600 rounded-full"></div>
                                    </div>
                                </div>
                                <p id="record-status" class="mt-3 sm:mt-4 text-gray-600 font-medium text-sm sm:text-base">
                                    <span class="inline-block animate-bounce">🎤</span>
                                    Click to start recording
                                </p>
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

                            <div id="audio-section" class="hidden mb-4 sm:mb-6 text-center">
                                <audio id="recorded-audio" controls class="w-full mb-3 sm:mb-4"></audio>
                                <button id="analyze-btn" onclick="analyzeAudio()"
                                    class="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base mr-2 sm:mr-3">
                                    <i class="fas fa-chart-line mr-2"></i>
                                    Analyze Pronunciation
                                </button>
                                <button id="view-results-btn" onclick="showStoredResults()" 
                                    class="hidden px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base">
                                    <i class="fas fa-eye sm:mr-2"></i>
                                    <span class="hidden sm:inline">View Results</span>
                                </button>
                            </div>

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

                            <div id="loading" class="hidden text-center py-6 sm:py-8">
                                <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
                                <p class="text-gray-600 text-sm sm:text-base">Analyzing your pronunciation...</p>
                            </div>
                        </div>

                        ${createProgressDots({ count: content.practice_words.length, currentIndex: currentWordIndex, studiedItems: studiedWords, theme: 'purple' })}

                        ${createNavigationButtons({ prevAction: 'prevPronunciation()', nextAction: 'nextPronunciation()', isFirst: currentWordIndex === 0, isLast: currentWordIndex === content.practice_words.length - 1, theme: 'purple', activityType: 'pronunciation' })}
                    </div>
                </div>
            </div>
        `;

        restorePronunciationStateWithIndices(currentActivityIndex, currentWordIndex);
    };

    renderPronunciation();

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

function renderDialogActivity(container, content) {
    // Check if conversation data exists
    if (!content.dialog || !Array.isArray(content.dialog)) {
        container.innerHTML = `
            <div class="animate-slide-in">
                <div class="bg-white rounded-3xl shadow-lg p-8 text-center">
                    <i class="fas fa-exclamation-triangle text-6xl text-yellow-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">Dialog Content Not Available</h3>
                    <p class="text-gray-500">The dialog conversation data is missing or invalid.</p>
                    <button onclick="markActivityCompleted()" class="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                        <i class="fas fa-arrow-right mr-2"></i>
                        Continue
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // Start tracking time for dialog activity
    if (typeof dialogTimeTracker !== 'undefined') {
        dialogTimeTracker.startTracking();
    }

    container.innerHTML = `
        <div class="animate-slide-in">
            <div class="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden">
                <div class="p-4 sm:p-6 pb-4 text-center border-b border-gray-100">
                    <h2 class="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
                        <i class="fas fa-comments text-green-500"></i>
                        ${content.title || 'Dialog Activity'}
                    </h2>
                    <p class="text-sm text-gray-600">${content.description || ''}</p>
                </div>
                <div class="p-4 sm:p-6">
                    <div class="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                        ${content.dialog.map((line, index) => `
                            <div class="flex items-start gap-3 sm:gap-4">
                                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full ${line.speaker === 'A' ? 'bg-blue-500' : 'bg-green-500'} flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                    ${line.speaker}
                                </div>
                                <div class="flex-1 max-w-xs sm:max-w-sm">
                                    <div class="${line.speaker === 'A' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} rounded-2xl p-3 sm:p-4 border">
                                        <p class="text-sm sm:text-base text-gray-800 mb-2">${line.text}</p>
                                        <div class="flex items-center gap-2">
                                            <button onclick="playAndTrackDialogLine('${getAssetUrl(line.audio)}', ${index}, this)" 
                                                    class="btn-audio group w-6 h-6 sm:w-8 sm:h-8 ${line.speaker === 'A' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:scale-110"
                                                    title="Play audio">
                                                <i class="fas fa-play text-white text-xs group-hover:scale-110 transition-transform duration-200"></i>
                                            </button>
                                            <span class="text-xs text-gray-500">${line.phonetic || ''}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="text-center mb-6 sm:mb-8">
                        <button onclick="toggleDialogPlayback()" id="play-all-dialog-btn"
                                class="btn-audio inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base">
                            <i class="fas fa-volume-up"></i>
                            <span>Play All</span>
                        </button>
                    </div>
                    
                    <div class="text-center mt-8 mb-6">
                        <button onclick="markActivityCompleted()" class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                            <i class="fas fa-check-circle text-xs sm:text-sm"></i>
                            <span class="hidden sm:inline">Complete Dialog</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Play all dialog function
    window.toggleDialogPlayback = () => {
        if (isDialogSequencePlaying) {
            stopDialogSequence();
        } else {
            // Log 'play_all' event
            if (typeof learningAnalytics !== 'undefined' && learningAnalytics.logDialogEvent) {
                learningAnalytics.logDialogEvent(0, 'dialog_play_all', { lines_count: content.dialog.length });
            }
            startDialogSequence(content.dialog);
        }
    };

    window.playAndTrackDialogLine = (audioUrl, lineIndex, buttonElement) => {
        if (typeof learningAnalytics !== 'undefined' && learningAnalytics.logDialogEvent) {
            learningAnalytics.logDialogEvent(lineIndex + 1, 'dialog_listen', {});
        }
        playAudioFile(audioUrl, buttonElement, false); // Pass false to prevent vocab tracking
    };

    function startDialogSequence(dialogLines) {
        isDialogSequencePlaying = true;
        currentDialogLineIndex = 0;
        updatePlayAllButton(true);
        playNextDialogLine(dialogLines);
    }

    function playNextDialogLine(dialogLines) {
        if (!isDialogSequencePlaying || currentDialogLineIndex >= dialogLines.length) {
            stopDialogSequence();
            return;
        }

        const line = dialogLines[currentDialogLineIndex];
        if (line.audio) {
            const audio = new Audio(getAssetUrl(line.audio));
            audio.onended = () => {
                currentDialogLineIndex++;
                dialogPlaybackTimeout = setTimeout(() => playNextDialogLine(dialogLines), 500);
            };
            audio.onerror = () => {
                console.error("Error playing dialog audio");
                stopDialogSequence();
            };
            audio.play().catch(() => {
                console.error("Audio play failed");
                stopDialogSequence();
            });
        } else {
            // If a line has no audio, skip it after a short delay
            currentDialogLineIndex++;
            dialogPlaybackTimeout = setTimeout(() => playNextDialogLine(dialogLines), 500);
        }
    }

    function stopDialogSequence() {
        isDialogSequencePlaying = false;
        if (dialogPlaybackTimeout) {
            clearTimeout(dialogPlaybackTimeout);
            dialogPlaybackTimeout = null;
        }
        stopCurrentAudio(); // This will stop any currently playing dialog line
        updatePlayAllButton(false);
    }

    function updatePlayAllButton(isPlaying) {
        const button = document.getElementById('play-all-dialog-btn');
        if (button) {
            const icon = button.querySelector('i');
            const text = button.querySelector('span');
            if (isPlaying) {
                icon.className = 'fas fa-stop';
                text.textContent = 'Stop';
                button.classList.remove('bg-gradient-to-r', 'from-purple-500', 'to-pink-600');
                button.classList.add('bg-red-500', 'hover:bg-red-600');
            } else {
                icon.className = 'fas fa-volume-up';
                text.textContent = 'Play All';
                button.classList.remove('bg-red-500', 'hover:bg-red-600');
                button.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-pink-600');
            }
        }
    }
}

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
    if (!window.quizState) {
        window.quizState = {
            currentQuestionIndex: 0,
            answers: {}, // Store answers for each question
            checked: {}, // Store if question has been checked
            showResult: false, // This might still be useful for immediate feedback
            questions: questions, // Set the questions for the first time
            correctAnswers: 0,
            questionStartTimes: {}, // Track when each question was first viewed
            questionViewLogged: {} // Track if question_viewed event was logged
        };
    }

    // Start tracking time for quiz activity
    if (typeof quizTimeTracker !== 'undefined' && !quizTimeTracker.startTime) {
        quizTimeTracker.startTracking();
    }

    const renderQuiz = () => {
        const questionIndex = window.quizState.currentQuestionIndex;
        const currentQuestion = window.quizState.questions[questionIndex];
        const isLastQuestion = questionIndex === window.quizState.questions.length - 1;
        const isMultipleQuestions = window.quizState.questions.length > 1;
        const selectedAnswerForCurrentQuestion = window.quizState.answers[questionIndex];
        const isCheckedForCurrentQuestion = window.quizState.checked[questionIndex];

        // 📊 LOG QUESTION VIEWED EVENT: Track when question is first viewed
        if (!window.quizState.questionViewLogged[questionIndex]) {
            window.quizState.questionStartTimes[questionIndex] = Date.now();
            window.quizState.questionViewLogged[questionIndex] = true;
            
            // Log question_viewed event
            if (typeof learningAnalytics !== 'undefined' && learningAnalytics.logQuizQuestionEvent) {
                learningAnalytics.logQuizQuestionEvent({
                    question_number: questionIndex + 1,
                    question_text: currentQuestion.question,
                    question_type: 'multiple_choice',
                    user_answer: null,
                    correct_answer: currentQuestion.correct_answer,
                    is_correct: false,
                    event_type: 'question_viewed',
                    time_spent: 0
                }).catch(error => {
                    console.error('❌ Failed to log question_viewed event:', error);
                });
                console.log('📊 Logged question_viewed for question:', questionIndex + 1);
            }
        }


        container.innerHTML = `
            <div class="animate-slide-in">
                <div class="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden">
                    <div class="p-6 pb-2 text-center border-b border-gray-100">
                        <h2 class="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
                            <i class="fas fa-question-circle text-orange-500"></i>
                            Quiz Time
                        </h2>
                        ${isMultipleQuestions ? `
                            <p class="text-sm text-gray-600">Question ${questionIndex + 1} of ${window.quizState.questions.length}</p>
                        ` : `
                            <p class="text-sm text-gray-600">Test your knowledge</p>
                        `}
                    </div>
                    <div class="p-4">
                        ${currentQuestion.image ? `
                            <div class="text-center mb-4">
                                <img src="${getAssetUrl(currentQuestion.image)}" alt="Quiz Image" class="w-full max-w-80 h-56 object-cover rounded-2xl shadow-lg mx-auto">
                            </div>
                        ` : ''}
                        
                        <div class="text-center mb-2">
                            <div class="flex items-center justify-center gap-3 mb-2">
                                <h3 class="text-xl font-bold text-gray-800 flex items-center justify-center flex-wrap gap-2">${currentQuestion.question}
                                ${currentQuestion.audio ? `
                                    <button onclick="playAudioFile('${getAssetUrl(currentQuestion.audio)}', this)" title="Listen to question" 
                                            class="btn-audio group w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-110 hover:from-orange-400 hover:to-red-500 border-2 border-white/20 backdrop-blur-sm">
                                        <i class="fas fa-volume-up text-white text-xs group-hover:scale-110 transition-transform duration-200"></i>
                                    </button>
                                ` : ''}
                                </h3>
                            </div>
                        </div>

                        <div class="max-w-lg mx-auto space-y-2 mb-6">
                            ${currentQuestion.options.map((option, index) => {
                                let buttonClass = `quiz-option w-full p-3 border-2 border-gray-200 rounded-lg text-left text-sm transition-all duration-300 hover:-translate-y-0.5`;
                                if (selectedAnswerForCurrentQuestion === option) {
                                    buttonClass += ` border-orange-500 bg-orange-500 text-white`;
                                }
                                if (isCheckedForCurrentQuestion) {
                                    if (option === currentQuestion.correct_answer) {
                                        buttonClass += ` border-green-500 bg-green-500 text-white`;
                                    } else if (option === selectedAnswerForCurrentQuestion && option !== currentQuestion.correct_answer) {
                                        buttonClass += ` border-red-500 bg-red-500 text-white`;
                                    }
                                }
                                return `
                                <button onclick="selectQuizAnswer('${option.replace(/'/g, "'")}', this, ${questionIndex})" 
                                        class="${buttonClass}" ${isCheckedForCurrentQuestion ? 'disabled' : ''}>
                                    ${option}
                                </button>
                            `;
                            }).join('')}
                        </div>

                        ${isCheckedForCurrentQuestion ? `
                            <div class="text-center mb-4">
                                <div class="p-4 rounded-lg max-w-lg mx-auto text-sm ${selectedAnswerForCurrentQuestion === currentQuestion.correct_answer ? 'bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-500' : 'bg-gradient-to-r from-red-100 to-red-200 border-2 border-red-500'}">
                                    <div class="text-3xl mb-1">
                                        ${selectedAnswerForCurrentQuestion === currentQuestion.correct_answer ? '🎉' : '😔'}
                                    </div>
                                    <h4 class="text-lg font-bold mb-1 ${selectedAnswerForCurrentQuestion === currentQuestion.correct_answer ? 'text-green-800' : 'text-red-800'}">
                                        ${selectedAnswerForCurrentQuestion === currentQuestion.correct_answer ? 'Correct!' : 'Incorrect!'}
                                    </h4>
                                    <p class="text-gray-700">
                                        The correct answer is: <strong>${currentQuestion.correct_answer}</strong>
                                    </p>
                                    ${isMultipleQuestions ? `
                                        <p class="text-xs text-gray-600 mt-1">
                                            Score: ${window.quizState.correctAnswers}/${window.quizState.questions.length}
                                        </p>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Progress Dots - moved to bottom -->
                        ${isMultipleQuestions ? `
                            <div class="flex justify-center gap-1 mb-4">
                                ${window.quizState.questions.map((_, index) => `
                                    <div class="w-2 h-2 rounded-full transition-all duration-300 ${index < questionIndex ? 'bg-green-500 shadow-lg shadow-green-500/30' : index === questionIndex ? 'bg-orange-500 scale-125 shadow-lg shadow-orange-500/50' : 'bg-gray-300'}"></div>
                                `).join('')}
                            </div>
                        ` : ''}

                        ${!isCheckedForCurrentQuestion ? `
                            <div id="check-answer-container" class="text-center mb-8 ${!selectedAnswerForCurrentQuestion ? 'hidden' : ''}">
                                <button onclick="checkQuizAnswer('${currentQuestion.correct_answer.replace(/'/g, "'")}', ${questionIndex})" 
                                        class="group relative inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 overflow-hidden text-sm">
                                    <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div class="relative flex items-center gap-1">
                                        <div class="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                                            <i class="fas fa-check text-white text-xs group-hover:scale-110 transition-transform duration-300"></i>
                                        </div>
                                        <span class="group-hover:scale-105 transition-transform duration-300">Check Answer</span>
                                    </div>
                                    <div class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse opacity-75"></div>
                                </button>
                            </div>
                            <div id="please-select-container" class="text-center mb-8 ${selectedAnswerForCurrentQuestion ? 'hidden' : ''}">
                                <p class="text-gray-500 text-xs">Please select an answer</p>
                            </div>
                        ` : `
                            <!-- Navigation after showing result -->
                            ${isMultipleQuestions ? `
                                <div class="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                    <button onclick="prevQuizQuestion()" ${questionIndex === 0 ? 'disabled' : ''} 
                                            class="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold border border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                        <i class="fas fa-arrow-left text-xs"></i>
                                        <span class="hidden sm:inline">Previous</span>
                                    </button>
                                    <button onclick="${isLastQuestion ? 'completeQuiz()' : 'nextQuizQuestion()'}" 
                                            class="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                        ${isLastQuestion ? '<i class="fas fa-trophy text-xs"></i><span class="hidden sm:inline">Complete Quiz</span>' : '<span class="hidden sm:inline">Next</span> <i class="fas fa-arrow-right text-xs"></i>'}
                                    </button>
                                </div>
                            ` : `
                                <div class="text-center mb-8">
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
window.selectQuizAnswer = (answer, buttonElement, questionIndex) => {
    // If the question has already been checked, do not allow changing the answer
    if (window.quizState.checked[questionIndex]) return;

    // Check if this is an answer change
    const previousAnswer = window.quizState.answers[questionIndex];
    const isAnswerChange = previousAnswer && previousAnswer !== answer;

    // Update state for the specific question
    window.quizState.answers[questionIndex] = answer;

    // 📊 LOG ANSWER CHANGE EVENT: Track when user changes their answer
    if (isAnswerChange && typeof learningAnalytics !== 'undefined' && learningAnalytics.logQuizQuestionEvent) {
        const currentQuestion = window.quizState.questions[questionIndex];
        const timeSpent = window.quizState.questionStartTimes[questionIndex] ? 
            Math.round((Date.now() - window.quizState.questionStartTimes[questionIndex]) / 1000) : 0;

        learningAnalytics.logQuizQuestionEvent({
            question_number: questionIndex + 1,
            question_text: currentQuestion.question,
            question_type: 'multiple_choice',
            user_answer: answer,
            correct_answer: currentQuestion.correct_answer,
            is_correct: answer === currentQuestion.correct_answer,
            event_type: 'answer_changed',
            time_spent: timeSpent
        }).catch(error => {
            console.error('❌ Failed to log answer_changed event:', error);
        });
        console.log('📊 Logged answer_changed for question:', questionIndex + 1, 'from:', previousAnswer, 'to:', answer);
    }

    // --- Efficient UI Update ---
    // 1. Remove 'selected' style from all options for the current question
    const allOptions = document.querySelectorAll('.quiz-option');
    allOptions.forEach(btn => {
        btn.classList.remove('border-orange-500', 'bg-orange-500', 'text-white');
    });

    // 2. Add 'selected' style to the clicked button
    if (buttonElement) {
        buttonElement.classList.add('border-orange-500', 'bg-orange-500', 'text-white');
    }

    // 3. Show the 'Check Answer' button container and hide 'Please select' hint
    const checkButtonContainer = document.getElementById('check-answer-container');
    const pleaseSelectContainer = document.getElementById('please-select-container');

    if (checkButtonContainer) {
        checkButtonContainer.classList.remove('hidden');
        checkButtonContainer.classList.add('animate-slide-in');
    }

    if (pleaseSelectContainer) {
        pleaseSelectContainer.classList.add('hidden');
    }
};

window.checkQuizAnswer = (correctAnswer, questionIndex) => {
    window.quizState.checked[questionIndex] = true; // Mark this question as checked
    const selectedAnswer = window.quizState.answers[questionIndex]; // Get the selected answer for this question
    const currentQuestion = window.quizState.questions[questionIndex];
    const isCorrect = (selectedAnswer === correctAnswer);

    // Calculate time spent on this question
    const timeSpent = window.quizState.questionStartTimes[questionIndex] ? 
        Math.round((Date.now() - window.quizState.questionStartTimes[questionIndex]) / 1000) : 0;

    // 📊 LOG QUESTION ANSWERED EVENT: Track final answer submission
    if (typeof learningAnalytics !== 'undefined' && learningAnalytics.logQuizQuestionEvent) {
        learningAnalytics.logQuizQuestionEvent({
            question_number: questionIndex + 1,
            question_text: currentQuestion.question,
            question_type: 'multiple_choice',
            user_answer: selectedAnswer,
            correct_answer: correctAnswer,
            is_correct: isCorrect,
            event_type: 'question_answered',
            time_spent: timeSpent
        }).catch(error => {
            console.error('❌ Failed to log question_answered event:', error);
        });
        console.log('📊 Logged question_answered for question:', questionIndex + 1, 'Answer:', selectedAnswer, 'Correct:', isCorrect, 'Time:', timeSpent + 's');
    }

    // Update state for the specific question with detailed answer
    window.quizState.answers[questionIndex] = {
        question_id: currentQuestion.id || questionIndex, // Use question.id if available, else index
        question_text: currentQuestion.question,
        selected_answer: selectedAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect
    };

    if (isCorrect) {
        window.quizState.correctAnswers++;
        playTextToSpeech('correct');
        triggerConfetti();
    } else {
        playTextToSpeech('incorrect');
    }
    // Re-render the current quiz question to show results
    const quizActivity = learningActivities.find(a => a.type === 'quiz');
    if (quizActivity) {
        renderQuizActivity(document.getElementById('lesson-content'), quizActivity.content);
    }
};

window.nextQuizQuestion = () => {
    if (window.quizState.currentQuestionIndex < window.quizState.questions.length - 1) {
        window.quizState.currentQuestionIndex++;
        // No need to reset selectedAnswer or showResult here, as they are now per-question
        // and handled by the render function based on window.quizState.answers and window.quizState.checked
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
        // No need to reset selectedAnswer or showResult here
        const quizActivity = learningActivities.find(a => a.type === 'quiz');
        if (quizActivity) {
            renderQuizActivity(document.getElementById('lesson-content'), quizActivity.content);
        }
    }
};

window.completeQuiz = async () => {
    // End tracking time
    const spentTime = await quizTimeTracker.endTracking();

    // Calculate results
    const totalQuestions = window.quizState.questions.length;
    const correctCount = window.quizState.correctAnswers;
    const wrongCount = totalQuestions - correctCount;
    const score = (correctCount / totalQuestions) * 100; // Percentage score

    // Format answers for Supabase
    const formattedAnswers = Object.values(window.quizState.answers);

    // 📊 NOTE: Individual question events are already logged via logQuizQuestionEvent
    // Quiz attempt summary will be handled by backend aggregation from user_quiz_events
    console.log('📊 Quiz completed - Individual question events logged. Summary:', { 
        score, 
        totalQuestions, 
        correctCount, 
        wrongCount, 
        spentTime 
    });

    // Mark the activity as completed, but persist the state
    // so the user can review their answers.
    // The state will be cleared by restartCourse().
    markActivityCompleted();
};

// Legacy functions for backward compatibility
window.selectAnswer = (answer) => {
    // This legacy function doesn't have questionIndex, so it can only work for single-question quizzes
    // or the first question of a multi-question quiz.
    window.selectQuizAnswer(answer, null, 0); // Pass null for buttonElement as it's not available here
};

window.checkAnswer = (correctAnswer) => {
    // This legacy function doesn't have questionIndex, so it can only work for single-question quizzes
    // or the first question of a multi-question quiz.
    window.checkQuizAnswer(correctAnswer, 0);
};


function renderWarmupActivity(container, content) {
    const avatarUrl = safeGetAssetUrl(content.avatar);
    const audioUrl = safeGetAssetUrl(content.audio);

    container.innerHTML = `
        <div class="animate-slide-in">
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div class="relative w-full h-72 md:h-80 overflow-hidden group">
                    <img src="${avatarUrl}" alt="Learning Image" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-center justify-center">
                        <div class="flex gap-3 md:gap-6 items-center transform hover:scale-105 transition-transform duration-300">
                            <button onclick="playWarmupAudio('${audioUrl}', this)" title="Listen to description"
                                    class="group relative w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl hover:scale-110 border-2 border-white/20 backdrop-blur-sm">
                                <i class="fas fa-play text-white text-sm md:text-xl group-hover:scale-110 transition-transform duration-200 ml-0.5"></i>
                            </button>
                            <button onclick="showDescriptionModal()" title="Read description"
                                    class="group relative w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl hover:scale-110 border-2 border-white/20 backdrop-blur-sm">
                                <i class="fas fa-eye text-white text-sm md:text-xl group-hover:scale-110 transition-transform duration-200"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="p-6 text-center">
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">Welcome to Your Lesson!</h2>
                
                    <p class="text-blue-600 font-medium">🌟 Wishing you an amazing learning experience! Good luck! 🚀</p>
                </div>
            </div>
        </div>
    `;

    // Set description text for modal after rendering HTML
    const modalDescriptionText = document.getElementById('modal-description-text');
    if (modalDescriptionText && content.description) {
        modalDescriptionText.textContent = content.description;
        console.log('📝 Description set for modal:', content.description);
    } else {
        console.log('⚠️ Modal description element not found or no description content:', {
            modalElement: modalDescriptionText ? 'found' : 'not found',
            description: content.description || 'no description'
        });
    }
}

function renderCongratulationsActivity(container, content) {
    container.innerHTML = `
        <div class="animate-slide-in">
            <div class="bg-white rounded-3xl shadow-lg p-8 text-center completion-screen">
                <div class="text-6xl mb-6">🎉</div>
                <h2 class="text-3xl font-bold text-gray-800 mb-4">${content.title}</h2>
                <p class="text-lg text-gray-600 mb-8">${content.message}</p>
                <div class="flex justify-center items-center gap-4 mb-6">
                    <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-trophy text-white text-2xl"></i>
                    </div>
                </div>
                <div class="text-sm text-gray-500">Activity ${learningActivities.length} of ${learningActivities.length} - Complete!</div>
            </div>
        </div>
    `;

    // Trigger confetti effect
    triggerConfetti();
}

// Save pronunciation state for current word
function savePronunciationState(data) {
    const wordId = `${currentActivityIndex}_${currentWordIndex}`;
    const existingState = pronunciationState[wordId] || {};
    pronunciationState[wordId] = { ...existingState, ...data };
    debugLog('Saving pronunciation state for wordId:', wordId);
}

// Restore pronunciation state with explicit indices
function restorePronunciationStateWithIndices(activityIndex, wordIndex) {
    const wordId = `${activityIndex}_${wordIndex}`;
    const wordState = pronunciationState[wordId];

    debugLog('Restoring state for wordId:', wordId, 'State exists:', !!wordState);

    const audioSection = document.getElementById('audio-section');
    const recordedAudio = document.getElementById('recorded-audio');
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');
    const viewResultsBtn = document.getElementById('view-results-btn');

    // Reset UI first
    if (audioSection) audioSection.classList.add('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');
    if (viewResultsBtn) viewResultsBtn.classList.add('hidden');

    if (!wordState) return;

    if (wordState.recordedBlob && wordState.audioURL) {
        recordedBlob = wordState.recordedBlob;
        if (audioSection && recordedAudio) {
            audioSection.classList.remove('hidden');
            recordedAudio.src = wordState.audioURL;
        }
    }

    if (wordState.hasAnalysis) {
        if (resultsSection && resultsContent) {
            resultsContent.innerHTML = wordState.analysisResult;
            // resultsSection.classList.remove('hidden'); // Keep hidden, use modal
        }
        if (viewResultsBtn) {
            viewResultsBtn.classList.remove('hidden');
        }
    }
}

// Show stored pronunciation results
function showStoredResults() {
    const wordId = `${currentActivityIndex}_${currentWordIndex}`;
    const wordState = pronunciationState[wordId];
    if (wordState && wordState.analysisResult) {
        showPronunciationModal(wordState.analysisResult);
    } else {
        debugLog('No stored results to show for word:', wordId);
    }
}

// Reusable function to create progress dots
function createProgressDots({ count, currentIndex, studiedItems, theme }) {
    const themeClasses = {
        blue: 'bg-blue-500 shadow-blue-500/50',
        purple: 'bg-purple-500 shadow-purple-500/50'
    };
    const activeClasses = themeClasses[theme] || themeClasses.blue;

    let dotsHTML = '';
    for (let i = 0; i < count; i++) {
        const dotClasses = i === currentIndex
            ? `${activeClasses} scale-125 shadow-lg`
            : studiedItems.has(i)
                ? 'bg-green-500 shadow-lg shadow-green-500/30'
                : 'bg-gray-300';
        dotsHTML += `<div class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${dotClasses}"></div>`;
    }

    return `
        <div class="flex justify-center gap-1 sm:gap-2 mb-6 sm:mb-8">
            ${dotsHTML}
        </div>
    `;
}

// Reusable function to create navigation buttons
function createNavigationButtons({ prevAction, nextAction, isFirst, isLast, theme, activityType }) {
    const themeClasses = {
        blue: 'from-blue-500 to-purple-600',
        purple: 'from-purple-500 to-pink-600'
    };
    const currentTheme = themeClasses[theme] || themeClasses.blue;

    return `
        <div class="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <button onclick="${prevAction}" ${isFirst ? 'disabled' : ''}
                    class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold border border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <i class="fas fa-arrow-left text-xs sm:text-sm"></i>
                <span class="hidden sm:inline">Previous</span>
            </button>
            <button onclick="${nextAction}"
                    class="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r ${currentTheme} text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                ${isLast ? '<i class="fas fa-check-circle text-xs sm:text-sm"></i><span class="hidden sm:inline">Complete</span>' : '<span class="hidden sm:inline">Next</span> <i class="fas fa-arrow-right text-xs sm:text-sm"></i>'}
            </button>
        </div>
    `;
}
// Activity completion and navigation
window.markActivityCompleted = () => {
    console.log('markActivityCompleted called');
    const currentActivity = learningActivities[currentActivityIndex];

    // If the current activity is vocabulary, ensure tracking for the current word is ended
    // The endTracking is primarily handled by nextWord/prevWord, so this is a safeguard.
    // However, if the activity is completed without navigating (e.g., direct completion),
    // we might need to ensure the last word's time is logged.
    // For now, removing this as it causes double-ending/skipping for the last word.
    // The nextWord/prevWord functions are responsible for ending tracking for the word *just left*.
    // If the last word is completed by nextActivity, its time should have been logged by the nextWord call.
    // If it's completed by other means, we might need a specific check here.
    // For now, assuming nextWord/prevWord handles it.
    // if (currentActivity && currentActivity.type === 'vocabulary') {
    //     vocabularyTimeTracker.endTracking();
    // }

    // End tracking for dialog activity if applicable
    if (currentActivity && currentActivity.type === 'dialog' && typeof dialogTimeTracker !== 'undefined') {
        dialogTimeTracker.endTracking();
    }

    completedActivities.add(currentActivity.id || currentActivityIndex);

    // 📊 UPDATE SESSION PROGRESS: Update session with activity completion
    if (typeof learningAnalytics !== 'undefined' && learningAnalytics.currentSessionId) {
        console.log('📊 Updating session progress for completed activity:', currentActivity.type);
        learningAnalytics.updateSessionProgress().catch(error => {
            console.error('❌ Failed to update session progress:', error);
        });
    }

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
    
    // 📊 UPDATE SESSION ACTIVITY: Reset timeout timer on navigation
    if (typeof learningAnalytics !== 'undefined' && learningAnalytics.currentSessionId) {
        learningAnalytics.updateSessionProgress().catch(error => {
            console.error('❌ Failed to update session on next activity:', error);
        });
    }
    
    // End tracking for the current word before moving to the next activity
    if (learningActivities[currentActivityIndex] && learningActivities[currentActivityIndex].type === 'vocabulary') {
        vocabularyTimeTracker.endTracking();
    }

    // End tracking for dialog activity if applicable
    if (learningActivities[currentActivityIndex] && learningActivities[currentActivityIndex].type === 'dialog' && typeof dialogTimeTracker !== 'undefined') {
        dialogTimeTracker.endTracking();
    }

    if (currentActivityIndex < learningActivities.length - 1) {
        showActivity(currentActivityIndex + 1);
    } else {
        console.log('Reached last activity. Calling showCourseCompletion().');
        showCourseCompletion();
    }
    updateNavigationButtons();
};

window.prevActivity = () => {
    // 📊 UPDATE SESSION ACTIVITY: Reset timeout timer on navigation
    if (typeof learningAnalytics !== 'undefined' && learningAnalytics.currentSessionId) {
        learningAnalytics.updateSessionProgress().catch(error => {
            console.error('❌ Failed to update session on prev activity:', error);
        });
    }
    
    // End tracking for dialog activity if applicable
    if (learningActivities[currentActivityIndex] && learningActivities[currentActivityIndex].type === 'dialog' && typeof dialogTimeTracker !== 'undefined') {
        dialogTimeTracker.endTracking();
    }

    if (currentActivityIndex > 0) {
        showActivity(currentActivityIndex - 1);
    }
    updateNavigationButtons();
};

window.skipActivity = () => {
    nextActivity();
};

// Course completion function
function showCourseCompletion() {
    const contentDiv = document.getElementById('lesson-content');
    contentDiv.innerHTML = `
        <div class="animate-slide-in">
            <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-lg p-6 sm:p-8 text-center border border-yellow-200">
                <div class="mb-6 sm:mb-8">
                    <div class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <i class="fas fa-trophy text-white text-3xl sm:text-4xl"></i>
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">🎉 Congratulations!</h2>
                    <p class="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed">
                        You have successfully completed all activities in this lesson! 
                        Great job on your learning journey.
                    </p>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-md mx-auto">
                    <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
                        <div class="text-lg sm:text-xl font-bold text-blue-600">${learningActivities.length}</div>
                        <div class="text-xs sm:text-sm text-gray-600">Activities</div>
                    </div>
                    <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
                        <div class="text-lg sm:text-xl font-bold text-green-600">${completedActivities.size}</div>
                        <div class="text-xs sm:text-sm text-gray-600">Completed</div>
                    </div>
                    <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
                        <div class="text-lg sm:text-xl font-bold text-purple-600">${studiedWords.size}</div>
                        <div class="text-xs sm:text-sm text-gray-600">Words</div>
                    </div>
                    <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
                        <div class="text-lg sm:text-xl font-bold text-orange-600">100%</div>
                        <div class="text-xs sm:text-sm text-gray-600">Progress</div>
                    </div>
                </div>

                <div class="space-y-3 sm:space-y-4">
                    <button onclick="restartCourse()" 
                            class="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base">
                        <i class="fas fa-redo"></i>
                        <span>Restart Course</span>
                    </button>
                    <div>
                        <button onclick="window.close()" 
                                class="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold border border-gray-300 hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base">
                            <i class="fas fa-times"></i>
                            <span>Close</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    triggerConfetti();
}

// Restart course function
window.restartCourse = () => {
    // Reset all state
    currentActivityIndex = 0;
    completedActivities.clear();
    currentWordIndex = 0;
    studiedWords.clear();
    selectedAnswer = null;
    showResult = false;
    pronunciationState = {};

    // Reset quiz state if exists
    if (window.quizState) {
        window.quizState = null;
    }

    // Show first activity
    showActivity(0);
    renderProgressBar();
};
// Export functions to global scope for HTML onclick handlers
window.renderActivityContent = renderActivityContent;
window.renderVocabularyActivity = renderVocabularyActivity;
window.renderPronunciationActivity = renderPronunciationActivity;
window.renderDialogActivity = renderDialogActivity;
window.renderQuizActivity = renderQuizActivity;
window.renderWarmupActivity = renderWarmupActivity;
window.renderCongratulationsActivity = renderCongratulationsActivity;
window.savePronunciationState = savePronunciationState;
window.restorePronunciationStateWithIndices = restorePronunciationStateWithIndices;
window.showStoredResults = showStoredResults;
window.createProgressDots = createProgressDots;
window.createNavigationButtons = createNavigationButtons;
window.showCourseCompletion = showCourseCompletion;

