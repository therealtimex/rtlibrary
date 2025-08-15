/**
 * Enhanced Pronunciation Recorder for Speaking Components
 * Based on the advanced recording system from easy_level_js
 */

class PronunciationRecorder {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordingStream = null;
        this.audioChunks = [];
        this.recordedBlob = null;
        this.recordingStartTime = null;
        this.isManualStop = false;
        this.hasDetectedVoice = false;
        
        // Voice detection variables
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.voiceCheckInterval = null;
        this.initialSilenceTimer = null;
        this.endingSilenceTimer = null;
        this.voiceDetectionTimer = null;
        this.recordingTimer = null;
        
        // Configuration constants
        this.VOICE_THRESHOLD = 30;
        this.MOBILE_RECORDING_TIMEOUT = 30000; // 30 seconds
        this.ENDING_SILENCE_TIMEOUT = 3000; // 3 seconds
        this.INITIAL_SILENCE_TIMEOUT = 3000; // 3 seconds
        
        // Callbacks
        this.onRecordingStart = null;
        this.onRecordingStop = null;
        this.onRecordingError = null;
        this.onAnalysisComplete = null;
    }

    /**
     * Detect device characteristics
     */
    detectDevice() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;

        const isIOS = /iPad|iPhone|iPod/.test(userAgent) ||
            (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isAndroid = /Android/.test(userAgent);
        const isMobile = /Mobi|Android/i.test(userAgent) || isIOS;

        return { isIOS, isAndroid, isMobile };
    }

    /**
     * Get compatible MIME type for MediaRecorder
     */
    getCompatibleMimeType() {
        const { isIOS } = this.detectDevice();
        const types = isIOS ?
            ['audio/mp4', 'audio/wav'] :
            ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/wav'];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log(`Using compatible MIME type: ${type}`);
                return type;
            }
        }
        console.log('No preferred MIME type supported, using browser default.');
        return undefined;
    }

    /**
     * Initialize microphone access with device-optimized constraints
     */
    async initMicrophone() {
        console.log('Initializing microphone...');
        
        if (this.recordingStream && this.recordingStream.active) {
            console.log('Microphone already initialized and active.');
            return true;
        }

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia is not supported in this browser.');
            }

            const deviceInfo = this.detectDevice();
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
            }

            try {
                this.recordingStream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('Microphone access granted with optimized constraints.');
            } catch (error) {
                console.log('Optimized constraints failed, trying basic constraints...');
                constraints = {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true
                    }
                };
                this.recordingStream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('Microphone access granted with basic constraints.');
            }

            return true;

        } catch (error) {
            console.error(`Microphone error: ${error.name} - ${error.message}`);
            
            let userFriendlyMessage = 'Unable to access microphone. ';
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                userFriendlyMessage = 'Microphone access denied. Please enable microphone in your browser settings.';
            } else if (error.name === 'NotFoundError') {
                userFriendlyMessage = 'No microphone found. Please connect a microphone and try again.';
            } else {
                userFriendlyMessage = 'Microphone access failed. Please check your microphone permissions.';
            }

            if (this.onRecordingError) {
                this.onRecordingError({ type: 'microphone', message: userFriendlyMessage });
            }
            return false;
        }
    }

    /**
     * Start recording with voice activity detection
     */
    async startRecording() {
        console.log('Starting recording...');
        
        if (this.isRecording) {
            console.log('Already recording');
            return false;
        }

        this.recordingStartTime = Date.now();
        this.isManualStop = false;

        const success = await this.initMicrophone();
        if (!success) {
            console.log('Microphone initialization failed');
            return false;
        }

        try {
            this.audioChunks = [];
            const mimeType = this.getCompatibleMimeType();
            const options = mimeType ? { mimeType } : {};

            this.mediaRecorder = new MediaRecorder(this.recordingStream, options);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.processRecordedAudio();
            };

            this.mediaRecorder.onerror = (event) => {
                console.error(`MediaRecorder error: ${event.error}`);
                if (this.onRecordingError) {
                    this.onRecordingError({ type: 'recording', message: `Recording error: ${event.error.name}` });
                }
                this.isRecording = false;
            };

            this.mediaRecorder.start();
            this.isRecording = true;

            if (this.onRecordingStart) {
                this.onRecordingStart();
            }

            this.startVoiceActivityDetection();
            return true;

        } catch (error) {
            console.error(`Failed to start recording: ${error.message}`);
            if (this.onRecordingError) {
                this.onRecordingError({ type: 'recording', message: `Could not start recording: ${error.message}` });
            }
            return false;
        }
    }

    /**
     * Stop recording manually
     */
    stopRecording() {
        console.log('Stopping recording manually...');
        
        if (!this.isRecording) {
            return;
        }

        this.isManualStop = true;
        this.clearAllTimers();

        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
    }

    /**
     * Start voice activity detection
     */
    startVoiceActivityDetection() {
        console.log('Starting voice activity detection...');

        const deviceInfo = this.detectDevice();
        if (deviceInfo.isMobile) {
            console.log('Mobile detected: Using simple timeout approach');
            this.startMobileRecording();
            return;
        }

        this.hasDetectedVoice = false;

        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            const source = this.audioContext.createMediaStreamSource(this.recordingStream);
            source.connect(this.analyser);

            this.initialSilenceTimer = setTimeout(() => {
                if (!this.hasDetectedVoice) {
                    console.log('No voice detected in initial 3 seconds.');
                    this.cancelRecording('no_voice');
                }
            }, this.INITIAL_SILENCE_TIMEOUT);

            this.startVoiceMonitoring();

            this.voiceDetectionTimer = setTimeout(() => {
                if (this.isRecording) {
                    console.log('Maximum recording time reached (30s)');
                    if (this.hasDetectedVoice) {
                        this.mediaRecorder.stop();
                    } else {
                        this.cancelRecording('timeout');
                    }
                }
            }, 30000);

        } catch (error) {
            console.error(`Voice detection setup failed: ${error.message}`);
            this.startMobileRecording();
        }
    }

    /**
     * Start mobile recording with timeout
     */
    startMobileRecording() {
        this.hasDetectedVoice = true; // Always assume voice detected on mobile

        this.recordingTimer = setTimeout(() => {
            if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                console.log('Mobile: Auto-stopping recording after timeout.');
                this.isManualStop = false;
                this.mediaRecorder.stop();
            }
        }, this.MOBILE_RECORDING_TIMEOUT);
    }

    /**
     * Monitor voice activity
     */
    startVoiceMonitoring() {
        this.voiceCheckInterval = setInterval(() => {
            if (!this.isRecording) {
                clearInterval(this.voiceCheckInterval);
                return;
            }

            const audioLevel = this.getCurrentAudioLevel();

            if (!this.hasDetectedVoice) {
                if (audioLevel > this.VOICE_THRESHOLD) {
                    console.log(`Voice detected! Audio level: ${audioLevel}`);
                    this.hasDetectedVoice = true;

                    if (this.initialSilenceTimer) {
                        clearTimeout(this.initialSilenceTimer);
                        this.initialSilenceTimer = null;
                    }

                    this.startEndingSilenceTimer();
                }
            } else {
                if (audioLevel > this.VOICE_THRESHOLD) {
                    this.startEndingSilenceTimer();
                }
            }
        }, 100);
    }

    /**
     * Get current audio level
     */
    getCurrentAudioLevel() {
        if (!this.analyser || !this.dataArray) return 0;

        this.analyser.getByteFrequencyData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / this.dataArray.length;
    }

    /**
     * Start/restart ending silence timer
     */
    startEndingSilenceTimer() {
        if (this.endingSilenceTimer) {
            clearTimeout(this.endingSilenceTimer);
        }

        this.endingSilenceTimer = setTimeout(() => {
            if (this.hasDetectedVoice && this.isRecording) {
                console.log('3 seconds of silence after voice detected.');
                this.mediaRecorder.stop();
            }
        }, this.ENDING_SILENCE_TIMEOUT);
    }

    /**
     * Clear all timers
     */
    clearAllTimers() {
        if (this.recordingTimer) {
            clearTimeout(this.recordingTimer);
            this.recordingTimer = null;
        }
        if (this.initialSilenceTimer) {
            clearTimeout(this.initialSilenceTimer);
            this.initialSilenceTimer = null;
        }
        if (this.endingSilenceTimer) {
            clearTimeout(this.endingSilenceTimer);
            this.endingSilenceTimer = null;
        }
        if (this.voiceDetectionTimer) {
            clearTimeout(this.voiceDetectionTimer);
            this.voiceDetectionTimer = null;
        }
        if (this.voiceCheckInterval) {
            clearInterval(this.voiceCheckInterval);
            this.voiceCheckInterval = null;
        }
    }

    /**
     * Cancel recording with reason
     */
    cancelRecording(reason) {
        console.log(`Canceling recording: ${reason}`);
        this.isRecording = false;
        this.clearAllTimers();

        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }

        this.audioChunks = [];

        let message = 'Recording cancelled.';
        if (reason === 'no_voice') {
            message = 'No voice detected. Please try speaking clearly.';
        } else if (reason === 'timeout') {
            message = 'Recording timeout. Please try again.';
        }

        if (this.onRecordingError) {
            this.onRecordingError({ type: 'cancelled', message });
        }
    }

    /**
     * Validate recorded audio
     */
    isValidAudioRecording(blob, startTime, manualStop = false) {
        const recordingDuration = (Date.now() - startTime) / 1000;
        console.log(`Recording duration: ${recordingDuration.toFixed(2)}s, Size: ${blob.size} bytes`);

        if (manualStop) {
            console.log('Manual stop detected - accepting recording');
            return true;
        }

        if (recordingDuration < 3) {
            const MIN_SHORT_SIZE = 30000; // 30KB for < 3s
            if (blob.size < MIN_SHORT_SIZE) {
                console.log(`Short recording too small: ${blob.size} bytes`);
                return false;
            }
        } else {
            const MIN_BYTES_PER_SECOND = 10000;
            const calculatedMinSize = MIN_BYTES_PER_SECOND * recordingDuration;
            const MIN_TOTAL_SIZE = Math.max(30000, calculatedMinSize);

            if (blob.size < MIN_TOTAL_SIZE) {
                console.log(`Recording too small: ${blob.size} bytes < ${MIN_TOTAL_SIZE.toFixed(0)} bytes`);
                return false;
            }
        }

        console.log('Recording validation passed');
        return true;
    }

    /**
     * Process recorded audio
     */
    processRecordedAudio() {
        this.isRecording = false;
        this.clearAllTimers();

        console.log('Processing recorded audio...');

        if (this.audioChunks.length === 0) {
            console.log('No audio data recorded');
            if (this.onRecordingError) {
                this.onRecordingError({ type: 'no_data', message: 'No audio was recorded. Please try again.' });
            }
            return;
        }

        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        this.recordedBlob = new Blob(this.audioChunks, { type: mimeType });

        if (!this.isValidAudioRecording(this.recordedBlob, this.recordingStartTime, this.isManualStop)) {
            let message = 'Recording appears to be silent. Please speak clearly and try again.';
            if (this.isManualStop) {
                message = 'Recording too short. Please try again.';
            }
            
            if (this.onRecordingError) {
                this.onRecordingError({ type: 'invalid', message });
            }
            return;
        }

        const audioUrl = URL.createObjectURL(this.recordedBlob);

        if (this.onRecordingStop) {
            this.onRecordingStop({
                blob: this.recordedBlob,
                url: audioUrl,
                duration: (Date.now() - this.recordingStartTime) / 1000
            });
        }
    }

    /**
     * Analyze pronunciation with API
     */
    async analyzeAudio(referenceText) {
        console.log('Analyzing pronunciation...');
        
        if (!this.recordedBlob) {
            throw new Error('No audio recorded');
        }

        try {
            // Convert to base64
            const base64Audio = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(this.recordedBlob);
            });

            // Call pronunciation analysis API
            const response = await fetch('https://automation.rta.vn/webhook/anki-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audio_data: base64Audio,
                    reference_text: referenceText,
                    audio_format: this.recordedBlob.type.split('/')[1].split(';')[0]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Analysis failed: ' + errorText);
            }

            const result = await response.json();
            console.log('Analysis complete:', result);

            if (this.onAnalysisComplete) {
                this.onAnalysisComplete(result);
            }

            return result;

        } catch (error) {
            console.error('Error analyzing audio:', error);
            throw error;
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.clearAllTimers();
        
        if (this.recordingStream) {
            this.recordingStream.getTracks().forEach(track => track.stop());
            this.recordingStream = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordedBlob = null;
        this.isRecording = false;
    }
}

// Export for use in components
window.PronunciationRecorder = PronunciationRecorder;