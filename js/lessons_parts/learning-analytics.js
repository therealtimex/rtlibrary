/**
 * Learning Analytics System - Simplified & Generic
 * One function to rule them all: logEvent(table, payload)
 * Reuses existing Supabase setup from upload_image.html
 */

class LearningAnalytics {
    constructor() {
        this.dataClient = null;
        this.currentUsername = null;
        this.currentLessonId = null;
        this.currentLessonPartId = null;
        this.eventBuffer = [];
        this.isInitialized = false;
        
        // Session tracking properties
        this.currentSessionId = null;
        this.sessionStartTime = null;
        this.lastActivityTime = null;
        this.sessionTimeoutTimer = null;
        this.sessionEnded = false; // Prevent duplicate session ends
        this.SESSION_TIMEOUT_MINUTES = 15; // 15 minutes inactivity timeout
    }

    /**
     * Initialize analytics (reuse Data object from upload_image.html pattern)
     */
    init(config = {}) {
        try {
            // Check if Data object exists (from lessons_parts.html)
            if (typeof Data === 'undefined') {
                throw new Error('Data object not found. Make sure Supabase setup is included in HTML.');
            }

            // Use existing Data object instead of creating new client
            this.dataClient = Data;

            // Set current context
            this.currentUsername = config.username || username;
            this.currentLessonId = config.lessonId;
            this.currentLessonPartId = config.lessonPartId;

            this.isInitialized = true;
            console.log('📊 Learning Analytics initialized successfully');

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Learning Analytics:', error);
            return false;
        }
    }

    /**
     * Set lesson context (call when lesson changes)
     */
    setLessonContext(lessonId, lessonPartId) {
        this.currentLessonId = lessonId;
        this.currentLessonPartId = lessonPartId;
        console.log('📚 Lesson context updated:', { lessonId, lessonPartId });
    }

    /**
     * Check if lesson_part_id is valid for logging (skip warmup and congratulations)
     */
    isValidLessonPartId() {
        if (!this.currentLessonPartId) return false;

        // Skip warmup and congratulations activities
        if (this.currentLessonPartId === 'warmup' || this.currentLessonPartId === 'congratulations') {
            return false;
        }

        // Check if it's a UUID format (basic check)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(this.currentLessonPartId);
    }

    /**
     * Generate unique session ID with format: username_lessonId_timestamp
     */
    generateSessionId(username, lessonId) {
        if (!username || !lessonId) {
            console.error('❌ Cannot generate session ID: missing username or lessonId');
            return null;
        }
        
        const timestamp = Date.now();
        const sessionId = `${username}_${lessonId}_${timestamp}`;
        
        console.log('🆔 Generated session ID:', sessionId);
        return sessionId;
    }

    /**
     * Start a new learning session or resume existing one
     */
    async startSession(lessonId) {
        try {
            console.log('🚀 Starting session for lesson:', lessonId);
            
            if (!this.currentUsername || !lessonId) {
                console.error('❌ Cannot start session: missing username or lessonId');
                return false;
            }

            // Check for existing active session within timeout period
            const existingSession = await this.getExistingSession(this.currentUsername, lessonId);
            
            if (existingSession) {
                // Resume existing session
                console.log('🔄 Resuming existing session:', existingSession.session_id);
                this.currentSessionId = existingSession.session_id;
                this.sessionStartTime = new Date(existingSession.session_start_time);
                this.lastActivityTime = new Date();
                this.sessionEnded = false; // Reset session ended flag
                
                // Update last activity time when resuming session
                await this.updateSessionRecord({
                    last_activity_time: new Date().toISOString()
                });
                
                console.log('📊 Session resumed successfully');
                
            } else {
                // Create new session
                this.currentSessionId = this.generateSessionId(this.currentUsername, lessonId);
                this.sessionStartTime = new Date();
                this.lastActivityTime = new Date();
                this.sessionEnded = false; // Reset session ended flag for new session
                
                if (!this.currentSessionId) {
                    console.error('❌ Failed to generate session ID');
                    return false;
                }
                
                // Create session record in database
                await this.createSessionRecord();
                console.log('✅ New session created:', this.currentSessionId);
            }
            
            // Start timeout monitoring
            this.startTimeoutMonitoring();
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to start session:', error);
            return false;
        }
    }

    /**
     * End current session with reason
     */
    async endSession(reason = 'completed') {
        try {
            if (!this.currentSessionId) {
                console.log('ℹ️ No active session to end');
                return;
            }
            
            // Prevent duplicate session ends
            if (this.sessionEnded) {
                console.log('ℹ️ Session already ended, ignoring duplicate call');
                return;
            }
            
            this.sessionEnded = true;
            console.log('🏁 Ending session:', this.currentSessionId, 'Reason:', reason);
            
            // Calculate final metrics
            const endTime = new Date();
            const totalDuration = this.sessionStartTime ? 
                Math.round((endTime - this.sessionStartTime) / 1000) : 0;
            const activitiesCompleted = completedActivities ? completedActivities.size : 0;
            const totalActivities = learningActivities ? learningActivities.length : 0;
            const completionPercentage = totalActivities > 0 ? 
                Math.round((activitiesCompleted / totalActivities) * 100) : 0;

            // Update session record with all final data
            await this.updateSessionRecord({
                session_end_time: endTime.toISOString(),
                total_duration: totalDuration,
                status: reason,
                last_activity_time: endTime.toISOString(),
                activities_completed: activitiesCompleted,
                total_activities: totalActivities,
                completion_percentage: completionPercentage
            });
            
            // Clear timeout timer
            if (this.sessionTimeoutTimer) {
                clearTimeout(this.sessionTimeoutTimer);
                this.sessionTimeoutTimer = null;
            }
            
            // Reset session properties
            this.currentSessionId = null;
            this.sessionStartTime = null;
            this.lastActivityTime = null;
            // Note: sessionEnded flag is kept true until next session starts
            
            console.log('✅ Session ended successfully. Duration:', totalDuration + 's', 'Progress:', `${completionPercentage}%`);
            
        } catch (error) {
            console.error('❌ Failed to end session:', error);
        }
    }

    /**
     * Update session progress (activities completed, completion percentage)
     */
    async updateSessionProgress() {
        try {
            if (!this.currentSessionId || this.sessionEnded) {
                // Don't update if there's no session or it has already ended
                return;
            }
            
            console.log('💓 Heartbeat: Updating session progress with rolling end time...');

            // Update last activity time locally
            this.lastActivityTime = new Date();
            
            // Calculate current progress
            const activitiesCompleted = (typeof completedActivities !== 'undefined') ? completedActivities.size : 0;
            const totalActivities = (typeof learningActivities !== 'undefined' && learningActivities) ? learningActivities.length : 0;
            const completionPercentage = totalActivities > 0 ? 
                Math.round((activitiesCompleted / totalActivities) * 100) : 0;

            // Prepare payload for backend update
            const updates = {
                last_activity_time: this.lastActivityTime.toISOString(),
                session_end_time: this.lastActivityTime.toISOString(), // Continuously update end time
                activities_completed: activitiesCompleted,
                completion_percentage: completionPercentage
            };

            // Update the session record in the database
            // This makes the heartbeat actually update the backend
            await this.updateSessionRecord(updates);
            
            // Restart timeout monitoring
            this.startTimeoutMonitoring();
            
        } catch (error) {
            console.error('❌ Failed to update session progress:', error);
        }
    }

    /**
     * Start timeout monitoring for session inactivity
     */
    startTimeoutMonitoring() {
        // Clear existing timer
        if (this.sessionTimeoutTimer) {
            clearTimeout(this.sessionTimeoutTimer);
        }
        
        // Set new timeout timer
        const timeoutMs = this.SESSION_TIMEOUT_MINUTES * 60 * 1000; // Convert to milliseconds
        this.sessionTimeoutTimer = setTimeout(() => {
            console.log('⏰ Session timeout reached, ending session');
            this.endSession('timeout');
        }, timeoutMs);
        
        console.log(`⏱️ Session timeout set for ${this.SESSION_TIMEOUT_MINUTES} minutes`);
    }

    /**
     * Check if session should timeout due to inactivity
     */
    checkSessionTimeout() {
        if (!this.lastActivityTime || !this.currentSessionId) {
            return false;
        }
        
        const now = new Date();
        const inactiveTime = (now - this.lastActivityTime) / 1000 / 60; // minutes
        
        if (inactiveTime >= this.SESSION_TIMEOUT_MINUTES) {
            console.log(`⏰ Session inactive for ${inactiveTime.toFixed(1)} minutes, timing out`);
            this.endSession('timeout');
            return true;
        }
        
        return false;
    }

    /**
     * Create new session record in database
     */
    async createSessionRecord() {
        try {
            if (!this.currentSessionId || !this.currentUsername || !this.currentLessonId) {
                throw new Error('Missing required session data');
            }
            
            const sessionData = {
                session_id: this.currentSessionId,
                username: this.currentUsername,
                lesson_id: this.currentLessonId,
                session_start_time: this.sessionStartTime.toISOString(),
                last_activity_time: this.lastActivityTime.toISOString(),
                total_duration: 0,
                activities_completed: 0,
                total_activities: learningActivities ? learningActivities.filter(a => a.type !== 'warmup' && a.type !== 'congratulations').length : 0,
                completion_percentage: 0,
                status: 'active'
            };
            
            console.log('💾 Creating session record:', sessionData);
            
            const result = await this.dataClient.create('user_learning_sessions', sessionData);
            
            if (result) {
                console.log('✅ Session record created successfully');
                return result;
            } else {
                throw new Error('Failed to create session record');
            }
            
        } catch (error) {
            console.error('❌ Failed to create session record:', error);
            throw error;
        }
    }

    /**
     * Update existing session record in database
     */
    async updateSessionRecord(updates) {
        try {
            if (!this.currentSessionId) {
                console.warn('⚠️ No active session to update');
                return null;
            }
            
            console.log('💾 Updating session record:', this.currentSessionId, updates);
            
            // Use Supabase client directly for update operation
            const { data, error } = await this.dataClient.supabaseClient
                .from('user_learning_sessions')
                .update(updates)
                .eq('session_id', this.currentSessionId)
                .select();
            
            if (error) {
                throw new Error(error.message);
            }
            
            console.log('✅ Session record updated successfully');
            return data;
            
        } catch (error) {
            console.error('❌ Failed to update session record:', error);
            // Don't throw error - allow session to continue even if update fails
            return null;
        }
    }

    /**
     * Get existing active session for user and lesson
     */
    async getExistingSession(username, lessonId) {
        try {
            console.log('🔍 Checking for existing session:', username, lessonId);
            
            // Calculate cutoff time for session resume (15 minutes ago)
            const cutoffTime = new Date();
            cutoffTime.setMinutes(cutoffTime.getMinutes() - this.SESSION_TIMEOUT_MINUTES);
            
            const { data, error } = await this.dataClient.supabaseClient
                .from('user_learning_sessions')
                .select('*')
                .eq('username', username)
                .eq('lesson_id', lessonId)
                .eq('status', 'active')
                .gte('last_activity_time', cutoffTime.toISOString())
                .order('session_start_time', { ascending: false })
                .limit(1);
            
            if (error) {
                throw new Error(error.message);
            }
            
            if (data && data.length > 0) {
                console.log('✅ Found existing active session:', data[0].session_id);
                return data[0];
            } else {
                console.log('ℹ️ No existing active session found');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Failed to check for existing session:', error);
            return null; // Return null to create new session
        }
    }

    /**
     * Test Supabase connection
     */
    async testConnection() {
        if (!this.isInitialized) {
            console.error('❌ Analytics not initialized');
            return false;
        }

        try {
            // Test with a simple query to check connection
            console.log('🔍 Testing Supabase connection...');

            // Try to access the supabaseClient directly for testing
            if (this.dataClient && this.dataClient.supabaseClient) {
                const { data, error } = await this.dataClient.supabaseClient
                    .from('user_vocab_events')
                    .select('count')
                    .limit(1);

                if (error) {
                    console.warn('⚠️ Connection test warning:', error.message);
                    return false;
                }

                console.log('✅ Supabase connection successful');
                return true;
            } else {
                console.error('❌ Data client not properly initialized');
                return false;
            }
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        }
    }

    /**
     * 🎯 CORE FUNCTION: Log any event to any table
     * This is the only function you need for all analytics!
     */
    async logEvent(tableName, payload) {
        // Fail gracefully if not initialized
        if (!this.isInitialized) {
            console.warn('⚠️ Analytics not initialized, buffering event');
            this.eventBuffer.push({
                tableName,
                payload,
                timestamp: new Date(),
                lessonId: this.currentLessonId,
                lessonPartId: this.currentLessonPartId
            });
            return null;
        }

        try {
            // Use existing Data.create method from upload_image.html pattern
            const result = await this.dataClient.create(tableName, payload);
            console.log('✅ Event logged:', { table: tableName, payload });
            return result;
        } catch (error) {
            // Handle specific duplicate key errors gracefully
            if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
                console.warn('⚠️ Duplicate event ignored (already logged):', { 
                    table: tableName, 
                    constraint: error.message.match(/unique constraint "([^"]+)"/)?.[1] || 'unknown',
                    payload: payload 
                });
                return null; // Don't retry duplicates
            }

            // Fail gracefully - don't break the lesson
            console.error('❌ Failed to log event (non-critical):', error.message);

            // Buffer failed events for retry (but not duplicates)
            this.eventBuffer.push({
                tableName,
                payload,
                timestamp: new Date(),
                retryCount: (payload.retryCount || 0) + 1
            });

            return null;
        }
    }

    /**
     * 🏗️ HELPER: Build payload for vocabulary events
     */
    buildVocabPayload(word, eventType, value) {
        return {
            username: this.currentUsername,
            lesson_id: this.currentLessonId,
            lesson_part_id: this.currentLessonPartId,
            session_id: this.currentSessionId, // Add session_id to vocab events
            word: word,
            event_type: eventType,
            value: value
        };
    }

    /**
     * 🏗️ HELPER: Build payload for any event type
     */
    buildPayload(baseData) {
        return {
            username: this.currentUsername,
            lesson_id: this.currentLessonId,
            lesson_part_id: this.currentLessonPartId,
            session_id: this.currentSessionId, // Add session_id to all events
            ...baseData
        };
    }

    /**
     * 📝 CONVENIENCE: Log vocabulary event (uses core logEvent)
     */
    async logVocabEvent(word, eventType, value) {
        // Skip logging for warmup and congratulations activities
        if (!this.isValidLessonPartId()) {
            console.log('📊 Skipping vocab event log for activity:', this.currentLessonPartId);
            return null;
        }

        const payload = this.buildVocabPayload(word, eventType, value);
        return await this.logEvent('user_vocab_events', payload);
    }

    /**
     * 🎧 CONVENIENCE: Log audio play event
     */
    async logAudioEvent(word, eventType, value) {
        // Skip logging for warmup and congratulations activities
        if (!this.isValidLessonPartId()) {
            console.log('📊 Skipping audio event log for activity:', this.currentLessonPartId);
            return null;
        }

        const payload = this.buildPayload({
            word: word,
            event_type: eventType,
            value: value
        });
        return await this.logEvent('user_vocab_events', payload);
    }

    /**
     * 🎤 CONVENIENCE: Log pronunciation event
     */
    async logPronunciationEvent(word, eventType, value) {
        const payload = this.buildPayload({
            word: word,
            event_type: eventType,
            value: value
        });
        return await this.logEvent('user_pronunciation_events', payload);
    }

    /**
     * ❓ CONVENIENCE: Log individual quiz question event
     */
    async logQuizQuestionEvent(questionData) {
        const payload = this.buildPayload({
            question_number: questionData.question_number,
            question_text: questionData.question_text,
            question_type: questionData.question_type || 'multiple_choice',
            user_answer: questionData.user_answer,
            correct_answer: questionData.correct_answer,
            is_correct: questionData.is_correct,
            event_type: questionData.event_type,
            time_spent: questionData.time_spent
        });
        return await this.logEvent('user_quiz_events', payload);
    }

    /**
     * 💾 CONVENIENCE: Save a pronunciation attempt
     */
    async savePronunciationAttempt(attemptData) {
        const payload = this.buildPayload({
            word: attemptData.word,
            phonetic: attemptData.phonetic,
            audio_url: attemptData.audio_url,
            feedback: attemptData.feedback, // This is the full JSON result
            // score is omitted as requested
        });
        // Log to the new table
        return await this.logEvent('user_pronunciation_events', payload);
    }

    /**
     * 💬 CONVENIENCE: Log dialog event
     */
    async logDialogEvent(dialogLine, eventType, value) {
        const payload = this.buildPayload({
            dialog_line: dialogLine,
            event_type: eventType,
            value: value
        });
        return await this.logEvent('user_dialog_events', payload);
    }

    /**
     * 📝 DEPRECATED: Quiz attempts are now tracked via individual question events
     * Backend will aggregate user_quiz_events to create attempt summaries
     */
    async logQuizAttempt(attemptData) {
        console.warn('⚠️ logQuizAttempt is deprecated. Individual questions are logged via logQuizQuestionEvent');
        return null;
    }

    /**
     * 🔄 Flush buffered events (retry failed events)
     */
    async flushEventBuffer() {
        if (this.eventBuffer.length === 0) return;

        console.log('🔄 Flushing', this.eventBuffer.length, 'buffered events');

        const eventsToRetry = [...this.eventBuffer];
        this.eventBuffer = [];

        for (const event of eventsToRetry) {
            try {
                // Skip events that have been retried too many times
                if (event.retryCount && event.retryCount > 3) {
                    console.warn('⚠️ Dropping event after 3 retries:', event);
                    continue;
                }

                // Set lesson context if available from buffered event
                if (event.lessonId && event.lessonPartId) {
                    this.setLessonContext(event.lessonId, event.lessonPartId);
                }

                // Retry the event using core logEvent function
                await this.logEvent(event.tableName, event.payload);

            } catch (error) {
                console.error('❌ Failed to flush event:', error);
                // Re-buffer failed events with incremented retry count
                event.retryCount = (event.retryCount || 0) + 1;
                if (event.retryCount <= 3) {
                    this.eventBuffer.push(event);
                }
            }
        }

        if (this.eventBuffer.length > 0) {
            console.log('📦 Re-buffered', this.eventBuffer.length, 'failed events for retry');
        }
    }

    /**
     * Check session health and attempt recovery if needed
     */
    async checkSessionHealth() {
        try {
            if (!this.currentSessionId) {
                console.log('ℹ️ No active session to check');
                return { healthy: false, reason: 'no_session' };
            }

            // Check if session exists in database
            const { data, error } = await this.dataClient.supabaseClient
                .from('user_learning_sessions')
                .select('*')
                .eq('session_id', this.currentSessionId)
                .single();

            if (error || !data) {
                console.warn('⚠️ Session not found in database, creating recovery session');
                // Attempt to create recovery session
                await this.createSessionRecord();
                return { healthy: true, reason: 'recovered' };
            }

            // Check if session is too old (beyond timeout)
            const lastActivity = new Date(data.last_activity_time);
            const now = new Date();
            const inactiveMinutes = (now - lastActivity) / 1000 / 60;

            if (inactiveMinutes > this.SESSION_TIMEOUT_MINUTES) {
                console.warn('⚠️ Session expired, ending and starting new session');
                await this.endSession('timeout');
                await this.startSession(this.currentLessonId);
                return { healthy: true, reason: 'renewed' };
            }

            return { healthy: true, reason: 'active' };

        } catch (error) {
            console.error('❌ Session health check failed:', error);
            return { healthy: false, reason: 'error', error: error.message };
        }
    }

    /**
     * 🔍 Get analytics state (for debugging)
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            currentUsername: this.currentUsername,
            currentLessonId: this.currentLessonId,
            currentLessonPartId: this.currentLessonPartId,
            bufferedEventsCount: this.eventBuffer.length,
            hasDataClient: !!this.dataClient,
            // Session tracking state
            currentSessionId: this.currentSessionId,
            sessionStartTime: this.sessionStartTime,
            lastActivityTime: this.lastActivityTime,
            hasActiveSession: !!this.currentSessionId,
            sessionTimeoutMinutes: this.SESSION_TIMEOUT_MINUTES
        };
    }

    /**
     * 🧹 Clean up resources
     */
    cleanup() {
        // Flush remaining events
        this.flushEventBuffer();
        console.log('🧹 Learning Analytics cleaned up');
    }
}

// Create global instance
window.LearningAnalytics = LearningAnalytics;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningAnalytics;
}