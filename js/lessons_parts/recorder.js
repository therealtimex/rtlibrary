console.log('Loading recorder.js...');

// --- Universal Recording Logic ---

// Helper to detect device characteristics
function detectDevice() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    const isIOS = /iPad|iPhone|iPod/.test(userAgent) ||
        (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(userAgent);
    const isMobile = /Mobi|Android/i.test(userAgent) || isIOS;

    return { isIOS, isAndroid, isMobile };
}

// Clear recording timer
function clearRecordingTimer() {
    if (recordingTimer) {
        clearTimeout(recordingTimer);
        recordingTimer = null;
    }
}

// Handle manual stop (when user clicks stop button)
function handleManualStop() {
    debugLog('Manual stop triggered by user');
    isManualStop = true;
    clearRecordingTimer();
}

// Start mobile recording with timeout
function startMobileRecording() {
    hasDetectedVoice = true; // Always assume voice detected on mobile

    if (!recordingStartTime) {
        recordingStartTime = Date.now();
        debugLog(`startMobileRecording: Set recordingStartTime=${recordingStartTime}`);
    } else {
        debugLog(`startMobileRecording: recordingStartTime already set=${recordingStartTime}`);
    }

    recordingTimer = setTimeout(() => {
        if (isRecording && mediaRecorder && mediaRecorder.state === 'recording') {
            debugLog('Mobile: Auto-stopping recording after timeout.');
            isManualStop = false; // This is auto-stop
            mediaRecorder.stop();
        }
    }, MOBILE_RECORDING_TIMEOUT);
}

// Check if recorded audio is valid using hybrid approach
function isValidAudioRecording(blob, startTime, manualStop = false) {
    const recordingDuration = (Date.now() - startTime) / 1000; // in seconds
    debugLog(`Recording duration: ${recordingDuration.toFixed(2)}s, Size: ${blob.size} bytes, Manual stop: ${manualStop}`);

    if (manualStop) {
        debugLog('Manual stop detected - accepting recording');
        return true;
    }

    if (recordingDuration < 3) {
        const MIN_SHORT_SIZE = 30000; // 30KB for < 3s
        if (blob.size < MIN_SHORT_SIZE) {
            debugLog(`Short recording too small: ${blob.size} bytes (minimum: ${MIN_SHORT_SIZE} bytes)`);
            return false;
        }
    } else {
        const MIN_BYTES_PER_SECOND = 10000;
        const calculatedMinSize = MIN_BYTES_PER_SECOND * recordingDuration;
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

// Process recorded audio, checking for validity before proceeding
function processRecordedAudio() {
    isRecording = false;
    updateRecordingUI(false);
    debugLog('processRecordedAudioEnhanced called.');

    if (audioChunks.length === 0) {
        debugLog('No audio data was recorded.');
        const recordStatus = document.getElementById('record-status');
        if (recordStatus) {
            recordStatus.innerHTML = '<span class="text-theme-warning font-semibold"><i class="fas fa-exclamation-triangle mr-2"></i>No audio recorded. Please try again.</span>';
        }
        return;
    }

    const mimeType = mediaRecorder.mimeType || 'audio/webm';
    recordedBlob = new Blob(audioChunks, { type: mimeType });
    debugLog(`Recorded audio blob created. Size: ${recordedBlob.size}, Type: ${recordedBlob.type}`);

    if (!isValidAudioRecording(recordedBlob, recordingStartTime, isManualStop)) {
        const recordStatus = document.getElementById('record-status');
        if (recordStatus) {
            if (isManualStop) {
                recordStatus.innerHTML = '<span class="text-theme-warning font-semibold"><i class="fas fa-exclamation-triangle mr-2"></i>Recording too short. Please try again.</span>';
            } else {
                recordStatus.innerHTML = '<span class="text-theme-warning font-semibold"><i class="fas fa-exclamation-triangle mr-2"></i>Recording appears to be silent. Please speak clearly and try again.</span>';
            }
        }
        return;
    }

    const audioUrl = URL.createObjectURL(recordedBlob);

    const audioElement = document.getElementById('recorded-audio');
    if (audioElement) {
        audioElement.src = audioUrl;
        audioElement.playsInline = true;
        debugLog('Audio element source set.');
    }

    const audioSection = document.getElementById('audio-section');
    if (audioSection) {
        audioSection.classList.remove('hidden');
        debugLog('Audio section shown.');
    }

    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
        debugLog('Results section hidden.');
    }

    if (typeof savePronunciationState === 'function') {
        savePronunciationState({
            recordedBlob: recordedBlob,
            audioURL: audioUrl,
            hasRecording: true,
            analysisResult: null,
            hasAnalysis: false
        });
        debugLog('Pronunciation state saved.');
    }
}

// Consolidated Voice Activity Detection - handles all device types
function startVoiceActivityDetection() {
    debugLog('Starting voice activity detection...');

    const deviceInfo = detectDevice();
    if (deviceInfo.isMobile) {
        debugLog('Mobile detected: Using simple timeout approach');
        startMobileRecording();
        return;
    }

    if (!recordingStream || !audioContext) {
        debugLog('Cannot start voice detection: missing stream or context');
        startMobileRecording();
        return;
    }

    hasDetectedVoice = false;

    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const source = audioContext.createMediaStreamSource(recordingStream);
        source.connect(analyser);

        initialSilenceTimer = setTimeout(() => {
            if (!hasDetectedVoice) {
                debugLog('No voice detected in initial 3 seconds. Stopping recording.');
                if (typeof stopRecordingWithReason === 'function') {
                    stopRecordingWithReason('no_voice');
                } else {
                    mediaRecorder.stop();
                }
            }
        }, 3000); // INITIAL_SILENCE_TIMEOUT

        startVoiceMonitoring();

        voiceDetectionTimer = setTimeout(() => {
            if (isRecording) {
                debugLog('Maximum recording time reached (30s)');
                if (hasDetectedVoice) {
                    mediaRecorder.stop();
                } else {
                    if (typeof cancelRecording === 'function') {
                        cancelRecording();
                    } else {
                        mediaRecorder.stop();
                    }
                }
            }
        }, 30000);

    } catch (error) {
        debugLog(`Voice detection setup failed: ${error.message}`);
        startMobileRecording();
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

// Monitor voice activity
function startVoiceMonitoring() {
    voiceCheckInterval = setInterval(() => {
        if (!isRecording) {
            clearInterval(voiceCheckInterval);
            return;
        }

        const audioLevel = getCurrentAudioLevel();

        if (!hasDetectedVoice) {
            if (audioLevel > VOICE_THRESHOLD) {
                debugLog(`Voice detected! Audio level: ${audioLevel}`);
                hasDetectedVoice = true;

                if (initialSilenceTimer) {
                    clearTimeout(initialSilenceTimer);
                    initialSilenceTimer = null;
                }

                startEndingSilenceTimer();
            }
        } else {
            if (audioLevel > VOICE_THRESHOLD) {
                startEndingSilenceTimer();
            }
        }

    }, 100); // Check every 100ms
}

// Start/restart ending silence timer
function startEndingSilenceTimer() {
    if (endingSilenceTimer) {
        clearTimeout(endingSilenceTimer);
    }

    endingSilenceTimer = setTimeout(() => {
        if (hasDetectedVoice && isRecording) {
            debugLog('3 seconds of silence after voice detected. Stopping recording.');
            stopRecordingWithReason('silence_after_voice');
        }
    }, ENDING_SILENCE_TIMEOUT);
}

// Get a compatible MIME type for MediaRecorder
function getCompatibleMimeType() {
    const { isIOS } = detectDevice();
    const types = isIOS ?
        ['audio/mp4', 'audio/wav'] :
        ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/wav'];

    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            debugLog(`Using compatible MIME type: ${type}`);
            return type;
        }
    }
    debugLog('No preferred MIME type supported, using browser default.');
    return undefined;
}

// Initialize microphone access
async function initMicrophone() {
    debugLog('initMicrophone called.');
    if (recordingStream && recordingStream.active) {
        debugLog('Microphone already initialized and active.');
        return true;
    }

    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('getUserMedia is not supported in this browser.');
        }

        const deviceInfo = detectDevice();
        let constraints;

        if (deviceInfo.isIOS) {
            constraints = {
                audio: {
                    sampleRate: { ideal: 44100, min: 22050 },
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    latency: { ideal: 0.01 },
                    volume: { ideal: 1.0 }
                }
            };
            debugLog('Using iOS-optimized constraints.');
        } else if (deviceInfo.isAndroid) {
            constraints = {
                audio: {
                    sampleRate: { ideal: 48000, min: 16000 },
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };
            debugLog('Using Android-optimized constraints.');
        } else {
            constraints = {
                audio: {
                    sampleRate: { ideal: 48000, min: 16000 },
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    latency: { ideal: 0.01 }
                }
            };
            debugLog('Using Desktop-optimized constraints.');
        }

        try {
            debugLog('Requesting microphone with constraints:' + JSON.stringify(constraints));
            recordingStream = await navigator.mediaDevices.getUserMedia(constraints);
            debugLog('Microphone access granted with optimized constraints.');
        } catch (error) {
            debugLog('Optimized constraints failed, trying basic constraints...');
            constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            };
            debugLog('Requesting microphone with basic constraints:' + JSON.stringify(constraints));
            recordingStream = await navigator.mediaDevices.getUserMedia(constraints);
            debugLog('Microphone access granted with basic constraints.');
        }

        return true;

    } catch (error) {
        debugLog(`Microphone error: ${error.name} - ${error.message}`);
        const recordStatus = document.getElementById('record-status');
        let userFriendlyMessage = 'Unable to access microphone. ';

        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            userFriendlyMessage = 'Microphone access denied. Please enable microphone in your device/browser settings.';
        } else if (error.name === 'NotFoundError') {
            userFriendlyMessage = 'No microphone found. Please connect a microphone and try again.';
        } else {
            userFriendlyMessage = 'Microphone access failed. Please ensure microphone permissions are enabled for this application in your device settings, then try again.';
        }

        if (recordStatus) {
            recordStatus.innerHTML = `
                <span class="text-theme-danger font-semibold">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    ${userFriendlyMessage}
                </span>
            `;
        }
        return false;
    }
}

// Toggle recording function (Universal)
async function toggleRecording() {
    debugLog('toggleRecording called. Current state: ', isRecording ? 'recording' : 'not recording');
    
    // 📊 UPDATE SESSION ACTIVITY: Reset timeout timer on recording interaction
    if (typeof learningAnalytics !== 'undefined' && learningAnalytics.currentSessionId) {
        learningAnalytics.updateSessionProgress().catch(error => {
            console.error('❌ Failed to update session on recording:', error);
        });
    }
    
    if (isRecording) {
        handleManualStop();
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            debugLog('Recording stopped by user (manual).');
        }
    } else {
        recordingStartTime = Date.now();
        isManualStop = false;
        debugLog(`Starting recording: recordingStartTime=${recordingStartTime}, isManualStop=${isManualStop}`);

        debugLog('Attempting to initialize microphone...');
        const success = await initMicrophone();
        if (!success) {
            debugLog('Microphone initialization failed. Aborting recording start.');
            return;
        }
        debugLog('Microphone initialized. Proceeding to MediaRecorder setup.');

        try {
            audioChunks = [];
            const mimeType = getCompatibleMimeType();
            const options = mimeType ? { mimeType } : {};
            debugLog('MediaRecorder options:' + JSON.stringify(options));

            mediaRecorder = new MediaRecorder(recordingStream, options);
            debugLog('MediaRecorder instance created.');

            mediaRecorder.ondataavailable = (event) => {
                debugLog('MediaRecorder ondataavailable. Data size:' + event.data.size);
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                debugLog('MediaRecorder onstop event triggered.');
                processRecordedAudio();
            };

            mediaRecorder.onerror = (event) => {
                debugLog(`MediaRecorder error: ${event.error.name} - ${event.error.message}`);
                alert(`An error occurred during recording: ${event.error.name}`);
                updateRecordingUI(false);
            };

            mediaRecorder.start();
            isRecording = true;
            updateRecordingUI(true);
            debugLog('MediaRecorder started.');

            startVoiceActivityDetection();

        } catch (error) {
            debugLog(`Failed to start recording or MediaRecorder setup error: ${error.message}`);
            alert(`Could not start recording: ${error.message}`);
        }
    }
}

function cancelRecording() {
    debugLog('Canceling recording - no voice detected');
    isRecording = false;

    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }

    audioChunks = [];

    updateRecordingUI(false);
    const recordStatus = document.getElementById('record-status');
    if(recordStatus) recordStatus.innerHTML = '⚠️ No voice detected. Please try again.';

    // cleanupVoiceDetection(); // This function was not defined in the original code
}

/**
 * Uploads an audio blob to Supabase Storage.
 * @param {Blob} blob The audio blob to upload.
 * @param {string} word The word being pronounced, for filename.
 * @returns {Promise<string|null>} The public URL of the uploaded file or null on error.
 */
async function uploadAudioToSupabase(blob, word) {
    debugLog(`Attempting to upload audio for word: ${word}`);
    if (!blob) {
        debugLog('Upload failed: Blob is null.');
        return null;
    }

    // Ensure learningAnalytics is available to get context
    if (typeof learningAnalytics === 'undefined' || !learningAnalytics.isInitialized) {
        debugLog('Upload failed: LearningAnalytics not initialized.');
        return null;
    }

    const analyticsState = learningAnalytics.getState();
    const username = analyticsState.currentUsername;
    const lessonId = analyticsState.currentLessonId;
    const lessonPartId = analyticsState.currentLessonPartId; // Get lesson_part_id

    if (!username || !lessonId || !lessonPartId) {
        debugLog(`Upload failed: Missing context - username: ${username}, lessonId: ${lessonId}, lessonPartId: ${lessonPartId}`);
        return null;
    }

    const timestamp = Date.now();
    const fileExtension = (blob.type.split('/')[1] || 'webm').split(';')[0];
    // New path structure
    const filePath = `${username}/${lessonId}/${lessonPartId}/${word}_${timestamp}.${fileExtension}`;
    // New bucket name
    const bucketName = 'app_lang_assets_data';

    try {
        debugLog(`Uploading to Supabase Storage: bucket='${bucketName}', path='${filePath}'`);

        // Use the globally available Data.supabaseClient
        const { data, error } = await Data.supabaseClient
            .storage
            .from(bucketName)
            .upload(filePath, blob, {
                cacheControl: '3600',
                upsert: false,
                contentType: blob.type
            });

        if (error) {
            throw error;
        }

        // Get the public URL
        const { data: urlData } = Data.supabaseClient
            .storage
            .from(bucketName)
            .getPublicUrl(data.path);

        if (urlData && urlData.publicUrl) {
            debugLog(`Upload successful. Public URL: ${urlData.publicUrl}`);
            return urlData.publicUrl;
        } else {
            debugLog('Upload succeeded, but failed to get public URL.');
            return null;
        }

    } catch (error) {
        debugLog(`Supabase upload error: ${error.message}`);
        // Don't show alert to user, just log it
        return null;
    }
}

// Analyze audio with backend
async function analyzeAudio() {
    debugLog('analyzeAudio called.');
    if (!recordedBlob) {
        alert('No audio recorded');
        debugLog('No recordedBlob found.');
        return;
    }

    const loading = document.getElementById('loading');
    const resultsSection = document.getElementById('results-section');

    if (loading) loading.classList.remove('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');
    debugLog('Loading and results sections updated.');

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
        debugLog('Audio converted to base64.');

        const referenceText = document.getElementById('reference-text').textContent;
        debugLog('Reference text:' + referenceText);

        const response = await fetch('https://automation.rta.vn/webhook/anki-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                audio_data: base64Audio,
                reference_text: referenceText,
                audio_format: recordedBlob.type.split('/')[1].split(';')[0]
            })
        });
        debugLog('API call initiated.');

        if (!response.ok) {
            const errorText = await response.text();
            debugLog(`API response not OK: ${response.status} - ${errorText}`);
            throw new Error('Analysis failed: ' + errorText);
        }

        const result = await response.json();
        debugLog('API call successful. Displaying results.');

        // --- Start Integration: Upload and Save Attempt ---
        if (recordedBlob) {
            const audioUrl = await uploadAudioToSupabase(recordedBlob, referenceText);

            if (audioUrl && typeof learningAnalytics !== 'undefined') {
                const currentActivity = learningActivities[currentActivityIndex];
                const practiceWord = currentActivity.content.practice_words[currentWordIndex];

                learningAnalytics.savePronunciationAttempt({
                    word: referenceText,
                    phonetic: practiceWord ? practiceWord.phonetic : null,
                    audio_url: audioUrl,
                    feedback: result // The full JSON from the analysis API
                });
            } else {
                debugLog('Skipping pronunciation attempt save: audioUrl or analytics missing.');
            }
        } else {
            debugLog('Skipping pronunciation attempt save: recordedBlob is missing.');
        }
        // --- End Integration ---

        displayResults(result);

        // Mark current word as checked and show navigation buttons
        if (window.pronunciationCheckedWords && typeof currentActivityIndex !== 'undefined' && typeof currentWordIndex !== 'undefined') {
            const wordKey = `${currentActivityIndex}-${currentWordIndex}`;
            window.pronunciationCheckedWords.set(wordKey, true);
            debugLog(`Marked word ${wordKey} as checked.`);
        }
        
        const navigationDiv = document.getElementById('pronunciation-navigation');
        if (navigationDiv) {
            navigationDiv.classList.remove('hidden');
            navigationDiv.classList.add('animate-slide-in');
            debugLog('Pronunciation navigation buttons shown.');
        }

    } catch (error) {
        debugLog(`Error analyzing audio: ${error.message}`);
        alert('Error analyzing pronunciation. Please try again.');
    } finally {
        if (loading) loading.classList.add('hidden');
        debugLog('Loading spinner hidden.');
    }
}
// Export functions to global scope for HTML onclick handlers
window.toggleRecording = toggleRecording;
window.analyzeAudio = analyzeAudio;
window.initMicrophone = initMicrophone;
window.cancelRecording = cancelRecording;