/**
 * Speaking Component
 * Handles the speaking section of the lesson with pronunciation analysis
 */

window.Speaking = class Speaking extends window.BaseComponent {
    constructor(stateManager, uiManager, config) {
        super('speaking', stateManager, uiManager, config);
        this.pronunciationRecorder = null;
        this.analysisResults = {};
    }

    /**
     * Validate speaking data
     */
    validateData(data) {
        if (!data.speaking_tasks || !Array.isArray(data.speaking_tasks)) {
            throw new Error('Speaking component must have speaking_tasks array');
        }
    }

    /**
     * Initialize speaking state
     */
    initializeState() {
        this.state = {
            currentTask: 0,
            totalTasks: this.data.speaking_tasks.length,
            completedTasks: new Set(),
            recordings: {},
            data: this.data
        };
        
        // Initialize pronunciation recorder
        this.initializePronunciationRecorder();
        
        this.stateManager.setComponentState(this.name, this.state);
    }

    /**
     * Initialize pronunciation recorder with callbacks
     */
    initializePronunciationRecorder() {
        if (!window.PronunciationRecorder) {
            console.error('PronunciationRecorder not available');
            return;
        }

        this.pronunciationRecorder = new window.PronunciationRecorder();
        
        this.pronunciationRecorder.onRecordingStart = () => {
            console.log('Recording started');
            const taskId = `speaking_task_${this.state.currentTask}`;
            this.state.recordings[taskId] = {
                ...this.state.recordings[taskId],
                isRecording: true,
                hasRecording: false
            };
            this.stateManager.setComponentState(this.name, this.state);
            this.uiManager.render(this.render());
        };

        this.pronunciationRecorder.onRecordingStop = (audioData) => {
            console.log('Recording stopped', audioData);
            const taskId = `speaking_task_${this.state.currentTask}`;
            this.state.recordings[taskId] = {
                ...this.state.recordings[taskId],
                isRecording: false,
                hasRecording: true,
                audioBlob: audioData.blob,
                audioUrl: audioData.url,
                duration: audioData.duration
            };
            this.stateManager.setComponentState(this.name, this.state);
            this.uiManager.render(this.render());
        };

        this.pronunciationRecorder.onRecordingError = (error) => {
            console.error('Recording error:', error);
            const taskId = `speaking_task_${this.state.currentTask}`;
            this.state.recordings[taskId] = {
                ...this.state.recordings[taskId],
                isRecording: false,
                hasRecording: false,
                error: error.message
            };
            this.stateManager.setComponentState(this.name, this.state);
            this.uiManager.render(this.render());
            
            // Show error message to user
            this.showErrorMessage(error.message);
        };

        this.pronunciationRecorder.onAnalysisComplete = (result) => {
            console.log('Analysis complete:', result);
            const taskId = `speaking_task_${this.state.currentTask}`;
            this.analysisResults[taskId] = result;
            this.showAnalysisResults(result);
        };
    }

    /**
     * Render speaking component
     */
    render() {
        return this.renderTask();
    }

    /**
     * Render current task
     */
    renderTask() {
        const { currentTask, totalTasks } = this.state;
        const task = this.data.speaking_tasks[currentTask];

        return `
            <div class="${this.config.cssClasses.screen} ${this.config.cssClasses.screenActive}">
                ${this.createHeader(currentTask + 1, totalTasks)}

                <!-- Task Content -->
                <div class="screen-content speaking-screen-content">
                    <div class="speaking-task-container">
                        <!-- Task Type Badge -->
                        <div class="task-type-badge">
                            ${this.getTaskTypeLabel(task.type)}
                        </div>
                        
                        <!-- Main Prompt Card -->
                        <div class="task-prompt-card">
                            <h3 class="task-prompt-title">${task.prompt}</h3>
                            ${task.read_aloud_text ? `
                                <div class="read-aloud-section">
                                    <div class="read-aloud-header">
                                        <span class="read-aloud-icon">📖</span>
                                        <span class="read-aloud-label">Text to read:</span>
                                    </div>
                                    <div class="read-aloud-text">
                                        "${task.read_aloud_text}"
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${task.frame ? `
                            <div class="task-frame-card">
                                <div class="frame-header">
                                    <span class="frame-icon">📝</span>
                                    <span class="frame-title">Suggested Structure</span>
                                </div>
                                <div class="frame-content">
                                    <em>"${task.frame}"</em>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Input Section -->
                        <div class="task-input-section">
                            ${this.renderTaskInput(task, this.state.currentTask)}
                        </div>

                        ${task.vocabulary_hints && task.vocabulary_hints.length > 0 ? `
                            <div class="vocabulary-hints-card">
                                <div class="hints-header">
                                    <span class="hints-icon">💡</span>
                                    <span class="hints-title">Helpful Vocabulary</span>
                                </div>
                                <div class="hints-grid">
                                    ${task.vocabulary_hints.map(hint => `
                                        <span class="hint-chip">${hint}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        ${task.sample_answer && !['describe_scene', 'personal_opinion'].includes(task.type) ? `
                            <div class="sample-answer-card">
                                <button class="sample-toggle-btn" onclick="window.mobileApp.showSampleAnswer(${this.state.currentTask})">
                                    <span class="sample-icon">💭</span>
                                    <span class="sample-text">Show Sample Answer</span>
                                    <span class="sample-arrow">▼</span>
                                </button>
                                <div id="sample-${this.state.currentTask}" class="sample-content-expanded" style="display: none;">
                                    <div class="sample-answer-text">
                                        "${task.sample_answer}"
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${this.createFooter(
                    currentTask > 0,
                    currentTask === totalTasks - 1 ? 'Finish' : 'Next',
                    `window.mobileApp.nextSpeakingTask()`,
                    `window.mobileApp.previousSpeakingTask()`
                )}
            </div>
        `;
    }

    /**
     * Render task input based on type
     */
    renderTaskInput(task, index) {
        const taskId = `speaking_task_${index}`;

        switch (task.input_type) {
            case 'audio_record':
                return this.renderAudioInput(task, taskId, index);
            case 'text_input':
                return this.renderTextInput(task, taskId);
            default:
                return this.renderTextInput(task, taskId);
        }
    }

    /**
     * Render audio input
     */
    renderAudioInput(task, taskId, index) {
        const maxDuration = task.max_duration || 60; // seconds
        const recording = this.state.recordings[taskId] || {};
        const isRecording = recording.isRecording || false;
        const hasRecording = recording.hasRecording || false;

        return `
            <div class="audio-input-container">
                <div class="audio-input-header">
                    <h4 class="input-title">
                        ${task.read_aloud_text ? '🗣️ Read Aloud Recording' : '🎤 Voice Recording'}
                    </h4>
                    <div class="duration-badge">Max: ${maxDuration}s</div>
                </div>
                
                <div class="recording-studio">
                    ${!isRecording && !hasRecording ? `
                        <div class="record-ready-state">
                            <div class="record-icon-large">${task.read_aloud_text ? '🗣️' : '🎤'}</div>
                            <p class="record-instruction">
                                ${task.read_aloud_text ? 
                                    'Read the sentence above clearly and naturally' : 
                                    'Tap to start recording your response'
                                }
                            </p>
                            <button class="record-btn-modern start" onclick="window.mobileApp.startSpeakingRecording(${index})">
                                <span class="btn-icon">🎙️</span>
                                <span class="btn-text">${task.read_aloud_text ? 'Start Reading' : 'Start Recording'}</span>
                            </button>
                        </div>
                    ` : ''}
                    
                    ${isRecording ? `
                        <div class="record-active-state">
                            <div class="recording-animation">
                                <div class="pulse-ring"></div>
                                <div class="pulse-ring pulse-ring-delay"></div>
                                <div class="record-icon-active">🔴</div>
                            </div>
                            <div class="recording-timer-display" id="timer-${taskId}">00:00</div>
                            <p class="recording-status">Recording in progress...</p>
                            <button class="record-btn-modern stop" onclick="window.mobileApp.stopSpeakingRecording()">
                                <span class="btn-icon">⏹️</span>
                                <span class="btn-text">Stop Recording</span>
                            </button>
                        </div>
                    ` : ''}
                    
                    ${hasRecording ? `
                        <div class="record-complete-state">
                            <div class="success-icon-container">
                                <div class="success-icon">✅</div>
                            </div>
                            <h4 class="completion-title">Recording Complete!</h4>
                            <p class="completion-message">Great job! Your response has been recorded.</p>
                            
                            <div class="playback-controls">
                                <!-- Minimal Audio Player -->
                                <div class="audio-player-container">
                                    <div class="audio-player" id="player-${taskId}">
                                        <button class="play-pause-btn" onclick="window.mobileApp.togglePlayback('${taskId}')" id="play-btn-${taskId}">
                                            <span class="play-icon">▶️</span>
                                        </button>
                                        <div class="audio-info">
                                            <div class="audio-progress">
                                                <div class="progress-bar" onclick="window.mobileApp.seekAudio('${taskId}', event)">
                                                    <div class="progress-fill" id="progress-${taskId}"></div>
                                                    <div class="progress-handle" id="handle-${taskId}"></div>
                                                </div>
                                            </div>
                                            <div class="audio-time">
                                                <span class="current-time" id="current-${taskId}">0:00</span>
                                                <span class="duration" id="duration-${taskId}">${this.formatDuration(recording.duration || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="action-buttons">
                                    <button class="playback-btn analyze" onclick="window.mobileApp.analyzeSpeakingRecording('${taskId}')">
                                      
                                        <span class="btn-text">Check</span>
                                    </button>
                                    ${this.analysisResults[taskId] ? `
                                        <div class="results-icon" onclick="window.mobileApp.showSpeakingResults('${taskId}')" title="View Analysis Results">
                                            ${this.getScoreIcon(this.getAverageScore(this.analysisResults[taskId]))}
                                        </div>
                                    ` : ''}
                                    <button class="playback-btn redo" onclick="window.mobileApp.redoSpeakingRecording('${taskId}')">
                                        <span class="btn-icon">🔄</span>
                                        <span class="btn-text">Redo</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render text input
     */
    renderTextInput(task, taskId) {
        const currentAnswer = this.state.recordings[taskId]?.text || '';
        const maxLength = task.max_length || 500;
        const currentLength = currentAnswer.length;

        return `
            <div class="text-input-container">
                <div class="text-input-header">
                    <h4 class="input-title">✍️ Written Response</h4>
                    <div class="character-counter">
                        <span class="char-count ${currentLength > maxLength * 0.9 ? 'warning' : ''}">${currentLength}</span>
                        <span class="char-limit">/${maxLength}</span>
                    </div>
                </div>
                
                <div class="text-input-studio">
                    <textarea 
                        class="speaking-text-input" 
                        placeholder="Share your thoughts here... Take your time to express yourself clearly and thoughtfully."
                        maxlength="${maxLength}"
                        oninput="window.mobileApp.handleTextInput('speaking', this.value)"
                    >${currentAnswer}</textarea>
                    
                    <div class="input-tips">
                        <div class="tip-item">
                            <span class="tip-icon">💡</span>
                            <span class="tip-text">Use the vocabulary hints above to enrich your response</span>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">📝</span>
                            <span class="tip-text">Follow the suggested structure for better organization</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get task type label
     */
    getTaskTypeLabel(type) {
        const labels = {
            'describe_scene': '📝 Describe Scene',
            'comparison': '⚖️ Comparison',
            'personal_opinion': '💭 Personal Opinion',
            'describe': '📝 Describe',
            'opinion': '💭 Opinion',
            'story': '📖 Story',
            'explanation': '💡 Explain',
            'discussion': '💬 Discuss'
        };
        return labels[type] || '🗣️ Speaking Task';
    }

    /**
     * Start recording using enhanced pronunciation recorder
     */
    async startRecording(taskIndex = null) {
        console.log('🔴 Speaking.startRecording called with taskIndex:', taskIndex);
        if (!this.pronunciationRecorder) {
            console.error('❌ Pronunciation recorder not initialized');
            return;
        }

        if (taskIndex !== null) {
            console.log('📝 Setting currentTask to:', taskIndex);
            this.state.currentTask = taskIndex;
        }

        console.log('🎙️ Starting pronunciation recorder...');
        const success = await this.pronunciationRecorder.startRecording();
        if (!success) {
            console.error('❌ Failed to start recording');
        } else {
            console.log('✅ Recording started successfully');
        }
    }

    /**
     * Stop recording using enhanced pronunciation recorder
     */
    stopRecording() {
        if (this.pronunciationRecorder) {
            this.pronunciationRecorder.stopRecording();
        }
    }

    /**
     * Play recording
     */
    playRecording(taskId) {
        const recording = this.state.recordings[taskId];
        
        if (recording && recording.audioUrl) {
            const audio = new Audio(recording.audioUrl);
            audio.play();
            this.log('Playing recording', { taskId });
        } else {
            console.error('No recording found for taskId:', taskId);
            this.showErrorMessage('No recording found to play');
        }
    }

    /**
     * Toggle audio playback with progress tracking
     */
    togglePlayback(taskId) {
        const recording = this.state.recordings[taskId];
        if (!recording || !recording.audioUrl) {
            this.showErrorMessage('No recording found to play');
            return;
        }

        const playBtn = document.getElementById(`play-btn-${taskId}`);
        const playIcon = playBtn?.querySelector('.play-icon');
        
        if (!this.currentAudio || this.currentAudio.src !== recording.audioUrl) {
            // Create new audio instance
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.clearAudioEventListeners();
            }
            
            this.currentAudio = new Audio(recording.audioUrl);
            this.currentTaskId = taskId;
            this.setupAudioEventListeners(taskId);
        }

        if (this.currentAudio.paused) {
            this.currentAudio.play();
            if (playIcon) playIcon.textContent = '⏸️';
        } else {
            this.currentAudio.pause();
            if (playIcon) playIcon.textContent = '▶️';
        }
    }

    /**
     * Setup audio event listeners for progress tracking
     */
    setupAudioEventListeners(taskId) {
        if (!this.currentAudio) return;

        this.currentAudio.addEventListener('timeupdate', () => {
            this.updateProgress(taskId);
        });

        this.currentAudio.addEventListener('ended', () => {
            this.onAudioEnd(taskId);
        });

        this.currentAudio.addEventListener('loadedmetadata', () => {
            const durationEl = document.getElementById(`duration-${taskId}`);
            if (durationEl) {
                durationEl.textContent = this.formatDuration(this.currentAudio.duration);
            }
        });
    }

    /**
     * Clear audio event listeners
     */
    clearAudioEventListeners() {
        if (this.currentAudio) {
            this.currentAudio.removeEventListener('timeupdate', this.updateProgress);
            this.currentAudio.removeEventListener('ended', this.onAudioEnd);
            this.currentAudio.removeEventListener('loadedmetadata', () => {});
        }
    }

    /**
     * Update progress bar and time display
     */
    updateProgress(taskId) {
        if (!this.currentAudio) return;

        const currentTime = this.currentAudio.currentTime;
        const duration = this.currentAudio.duration;
        const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

        const progressFill = document.getElementById(`progress-${taskId}`);
        const progressHandle = document.getElementById(`handle-${taskId}`);
        const currentTimeEl = document.getElementById(`current-${taskId}`);

        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressHandle) progressHandle.style.left = `${progress}%`;
        if (currentTimeEl) currentTimeEl.textContent = this.formatDuration(currentTime);
    }

    /**
     * Handle audio end
     */
    onAudioEnd(taskId) {
        const playBtn = document.getElementById(`play-btn-${taskId}`);
        const playIcon = playBtn?.querySelector('.play-icon');
        if (playIcon) playIcon.textContent = '▶️';

        // Reset progress
        const progressFill = document.getElementById(`progress-${taskId}`);
        const progressHandle = document.getElementById(`handle-${taskId}`);
        const currentTimeEl = document.getElementById(`current-${taskId}`);

        if (progressFill) progressFill.style.width = '0%';
        if (progressHandle) progressHandle.style.left = '0%';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
    }

    /**
     * Seek audio to specific position
     */
    seekAudio(taskId, event) {
        if (!this.currentAudio || this.currentTaskId !== taskId) return;

        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = event.clientX - rect.left;
        const progressBarWidth = rect.width;
        const seekPercent = (clickPosition / progressBarWidth) * 100;
        
        const seekTime = (seekPercent / 100) * this.currentAudio.duration;
        this.currentAudio.currentTime = seekTime;
        
        this.updateProgress(taskId);
    }

    /**
     * Show stored analysis results
     */
    showStoredResults(taskId) {
        if (this.analysisResults[taskId]) {
            this.showAnalysisResults(this.analysisResults[taskId]);
        } else {
            this.showErrorMessage('No analysis results found');
        }
    }

    /**
     * Analyze pronunciation for current recording
     */
    async analyzePronunciation(taskId) {
        const recording = this.state.recordings[taskId];
        const taskIndex = parseInt(taskId.replace('speaking_task_', ''));
        const task = this.data.speaking_tasks[taskIndex];
        
        if (!recording || !recording.audioBlob) {
            console.error('No recording found for taskId:', taskId, 'recordings:', this.state.recordings);
            this.showErrorMessage('No recording found to analyze');
            return;
        }

        if (!this.pronunciationRecorder) {
            this.showErrorMessage('Pronunciation recorder not available');
            return;
        }

        try {
            // Show loading state
            this.showLoadingMessage('Analyzing your pronunciation...');
            
            // Use read_aloud_text for analysis if available, otherwise use prompt
            const referenceText = task.read_aloud_text || task.prompt;
            
            // Set the recorded blob for analysis
            this.pronunciationRecorder.recordedBlob = recording.audioBlob;
            
            // Analyze the recording
            const result = await this.pronunciationRecorder.analyzeAudio(referenceText);
            
            // Hide loading
            this.hideLoadingMessage();
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.hideLoadingMessage();
            this.showErrorMessage('Analysis failed. Please try again.');
        }
    }

    /**
     * Redo recording
     */
    redoRecording(taskId) {
        
        // Clear current recording
        if (this.state.recordings[taskId]) {
            if (this.state.recordings[taskId].audioUrl) {
                URL.revokeObjectURL(this.state.recordings[taskId].audioUrl);
            }
            delete this.state.recordings[taskId];
        }
        
        // Clear analysis results
        delete this.analysisResults[taskId];
        
        this.stateManager.setComponentState(this.name, this.state);
        this.uiManager.render(this.render());
        
        this.log('Redo recording', { taskId });
    }

    /**
     * Show analysis results in a modal
     */
    showAnalysisResults(result) {
        const modal = document.createElement('div');
        modal.className = 'pronunciation-results-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="window.mobileApp.closeAnalysisModal()">
                <div class="modal-content detailed-analysis" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>🎯Pronunciation Analysis</h3>
                        <button class="close-btn" onclick="window.mobileApp.closeAnalysisModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <!-- Overall Scores Section -->
                        <div class="overall-scores">
                            <div class="score-grid">
                                <div class="score-item">
                                    <div class="score-circle accuracy">
                                        <span class="score-number">${Math.round(result.accuracy_score || 0)}</span>
                                        <span class="score-label">Accuracy</span>
                                    </div>
                                </div>
                                <div class="score-item">
                                    <div class="score-circle fluency">
                                        <span class="score-number">${Math.round(result.fluency_score || 0)}</span>
                                        <span class="score-label">Fluency</span>
                                    </div>
                                </div>
                                <div class="score-item">
                                    <div class="score-circle completeness">
                                        <span class="score-number">${Math.round(result.completeness_score || 0)}</span>
                                        <span class="score-label">Completeness</span>
                                    </div>
                                </div>
                                <div class="score-item">
                                    <div class="score-circle pronunciation">
                                        <span class="score-number">${Math.round(result.pronunciation_score || 0)}</span>
                                        <span class="score-label">Pronunciation</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Reference Text Section -->
                        <div class="text-comparison">
                            <h4>📝 Reference Text</h4>
                            <div class="text-blocks">
                                <div class="text-block reference">
                                    <p>"${result.reference_text || 'N/A'}"</p>
                                </div>
                            </div>
                        </div>

                        <!-- Word-by-Word Analysis -->
                        ${result.words && result.words.length > 0 ? `
                            <div class="word-analysis">
                                <h4>🔍 Word-by-Word Analysis</h4>
                                <div class="words-container">
                                    ${result.words.map(word => `
                                        <div class="word-item ${this.getWordStatusClass(word)}" 
                                             onclick="this.classList.toggle('expanded')">
                                            <div class="word-header">
                                                <span class="word-text">${word.word}</span>
                                                <span class="word-score ${this.getScoreClass(word.accuracy_score)}">${Math.round(word.accuracy_score || 0)}%</span>
                                                ${word.error_type && word.error_type !== 'None' ? `
                                                    <span class="error-type">${word.error_type}</span>
                                                ` : ''}
                                            </div>
                                            ${word.phonemes && word.phonemes.length > 0 ? `
                                                <div class="phonemes-detail">
                                                    <label>Phoneme Breakdown:</label>
                                                    <div class="phonemes-grid">
                                                        ${word.phonemes.map(phoneme => `
                                                            <div class="phoneme-item ${this.getScoreClass(phoneme.accuracy_score)}">
                                                                <span class="phoneme-symbol">/${phoneme.phoneme}/</span>
                                                                <span class="phoneme-score">${Math.round(phoneme.accuracy_score || 0)}%</span>
                                                            </div>
                                                        `).join('')}
                                                    </div>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                                <p class="analysis-note">💡 Click on words to see phoneme details</p>
                            </div>
                        ` : ''}

                        <!-- Performance Insights -->
                        <div class="performance-insights">
                            <h4>📊 Performance Insights</h4>
                            <div class="insights-grid">
                                ${this.generateInsights(result).map(insight => `
                                    <div class="insight-item ${insight.type}">
                                        <span class="insight-icon">${insight.icon}</span>
                                        <span class="insight-text">${insight.text}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Get CSS class based on score
     */
    getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'fair';
        if (score >= 60) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Get word status class based on word analysis
     */
    getWordStatusClass(word) {
        if (word.error_type && word.error_type !== 'None') {
            return `error-${word.error_type.toLowerCase()}`;
        }
        return this.getScoreClass(word.accuracy_score);
    }

    /**
     * Get average score from analysis result
     */
    getAverageScore(result) {
        if (!result) return 0;
        const avgScore = (result.accuracy_score + result.fluency_score + result.completeness_score + result.pronunciation_score) / 4;
        return avgScore;
    }

    /**
     * Get icon based on score
     */
    getScoreIcon(score) {
        if (score >= 90) return '🌟';
        if (score >= 80) return '👍';
        if (score >= 70) return '😊';
        return '🤔';
    }

    /**
     * Generate performance insights based on analysis results
     */
    generateInsights(result) {
        const insights = [];
        
        // Overall performance insights
        const avgScore = (result.accuracy_score + result.fluency_score + result.completeness_score + result.pronunciation_score) / 4;
        
        if (avgScore >= 90) {
            insights.push({
                type: 'excellent',
                icon: '🌟',
                text: 'Excellent pronunciation! You\'re speaking very clearly.'
            });
        } else if (avgScore >= 80) {
            insights.push({
                type: 'good',
                icon: '👍',
                text: 'Good job! Your pronunciation is quite clear.'
            });
        } else if (avgScore >= 70) {
            insights.push({
                type: 'fair',
                icon: '📈',
                text: 'You\'re making progress! Keep practicing to improve.'
            });
        } else {
            insights.push({
                type: 'needs-improvement',
                icon: '💪',
                text: 'Keep practicing! Focus on clear pronunciation.'
            });
        }

        // Specific area insights
        if (result.accuracy_score < 70) {
            insights.push({
                type: 'warning',
                icon: '🎯',
                text: 'Focus on word accuracy - practice saying each word clearly.'
            });
        }

        if (result.fluency_score < 70) {
            insights.push({
                type: 'warning',
                icon: '⏱️',
                text: 'Work on speaking rhythm and natural flow.'
            });
        }

        if (result.completeness_score < 80) {
            insights.push({
                type: 'info',
                icon: '📝',
                text: 'Try to include all words from the reference text.'
            });
        }

        // Word-specific insights
        if (result.words) {
            const problemWords = result.words.filter(w => w.accuracy_score < 60);
            if (problemWords.length > 0) {
                insights.push({
                    type: 'tip',
                    icon: '💡',
                    text: `Focus on: ${problemWords.map(w => w.word).slice(0, 3).join(', ')}`
                });
            }

            const mispronunciations = result.words.filter(w => w.error_type === 'Mispronunciation');
            if (mispronunciations.length > 0) {
                insights.push({
                    type: 'warning',
                    icon: '🔄',
                    text: `Practice these words: ${mispronunciations.map(w => w.word).slice(0, 2).join(', ')}`
                });
            }
        }

        return insights;
    }

    /**
     * Format duration in seconds to MM:SS
     */
    formatDuration(seconds) {
        if (!seconds || seconds === 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(errorElement);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (errorElement.parentElement) {
                errorElement.remove();
            }
        }, 3000);
    }

    /**
     * Show loading message
     */
    showLoadingMessage(message) {
        const loadingElement = document.createElement('div');
        loadingElement.id = 'pronunciation-loading';
        loadingElement.className = 'loading-message';
        loadingElement.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <span class="loading-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(loadingElement);
    }

    /**
     * Hide loading message
     */
    hideLoadingMessage() {
        const loadingElement = document.getElementById('pronunciation-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    /**
     * Start recording timer
     */
    startRecordingTimer(taskId) {
        const recording = this.state.recordings[taskId];
        if (!recording || !recording.isRecording) return;
        
        const timerElement = document.getElementById(`timer-${taskId}`);
        if (!timerElement) return;
        
        const updateTimer = () => {
            if (!this.state.recordings[taskId]?.isRecording) return;
            
            const elapsed = Math.floor((Date.now() - recording.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Auto-stop at max duration
            const task = this.data.speaking_tasks[this.state.currentTask];
            const maxDuration = task.max_duration || 60;
            
            if (elapsed >= maxDuration) {
                this.stopRecording(taskId);
                return;
            }
            
            setTimeout(updateTimer, 1000);
        };
        
        updateTimer();
    }

    /**
     * Handle text input
     */
    handleTextInput(value) {
        const taskId = `speaking_task_${this.state.currentTask}`;
        
        if (!this.state.recordings[taskId]) {
            this.state.recordings[taskId] = {};
        }
        
        this.state.recordings[taskId].text = value;
        this.stateManager.setComponentState(this.name, this.state);
        
        this.log('Text input', { taskId, value });
    }

    /**
     * Show sample answer
     */
    showSampleAnswer(taskIndex) {
        const sampleElement = document.getElementById(`sample-${taskIndex}`);
        if (sampleElement) {
            sampleElement.style.display = sampleElement.style.display === 'none' ? 'block' : 'none';
        }
    }

    /**
     * Go to next task
     */
    nextTask() {
        const { currentTask, totalTasks } = this.state;

        // Mark current task as completed
        this.state.completedTasks.add(currentTask);

        if (currentTask < totalTasks - 1) {
            // Go to next task
            this.state.currentTask++;
            this.stateManager.setComponentState(this.name, this.state);
            this.uiManager.render(this.render());
        } else {
            // Finish speaking
            this.showCompletion();
        }
    }

    /**
     * Show completion screen
     */
    showCompletion() {
        const totalRecordingTime = this.calculateTotalRecordingTime();
        
        const stats = {
            tasksCompleted: this.state.completedTasks.size,
            recordingTime: this.formatRecordingTime(totalRecordingTime)
        };
        
        this.uiManager.showSpeakingCompletion(stats);
    }

    /**
     * Calculate total recording time
     */
    calculateTotalRecordingTime() {
        let totalTime = 0;
        Object.values(this.state.recordings).forEach(recording => {
            if (recording.duration) {
                totalTime += recording.duration;
            }
        });
        return totalTime;
    }

    /**
     * Format recording time
     */
    formatRecordingTime(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    }

    /**
     * Continue from completion
     */
    continueFromCompletion() {
        console.log('🔥 Speaking continueFromCompletion called');
        // Complete the component and unlock next one
        this.complete();
        console.log('✅ Component completed, showing tree view in 100ms');
        // Return to tree view to show unlocked components
        setTimeout(() => {
            console.log('🌳 Calling showTreeView()');
            this.uiManager.showTreeView();
        }, 100);
    }

    /**
     * Go to previous task
     */
    previousTask() {
        if (this.state.currentTask > 0) {
            this.state.currentTask--;
            this.stateManager.setComponentState(this.name, this.state);
            this.uiManager.render(this.render());
        }
    }

    /**
     * Cleanup resources when component is destroyed
     */
    cleanup() {
        if (this.pronunciationRecorder) {
            this.pronunciationRecorder.cleanup();
            this.pronunciationRecorder = null;
        }
        
        // Clean up audio URLs
        Object.values(this.state.recordings).forEach(recording => {
            if (recording.audioUrl) {
                URL.revokeObjectURL(recording.audioUrl);
            }
        });
        
        super.cleanup?.();
    }
}

// Make available globally
window.Speaking = window.Speaking;