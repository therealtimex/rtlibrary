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
            // Fail gracefully - don't break the lesson
            console.error('❌ Failed to log event (non-critical):', error.message);

            // Buffer failed events for retry
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
            ...baseData
        };
    }

    /**
     * 📝 CONVENIENCE: Log vocabulary event (uses core logEvent)
     */
    async logVocabEvent(word, eventType, value) {
        const payload = this.buildVocabPayload(word, eventType, value);
        return await this.logEvent('user_vocab_events', payload);
    }

    /**
     * 🎧 CONVENIENCE: Log audio play event
     */
    async logAudioEvent(word, eventType, value) {
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
     * ❓ CONVENIENCE: Log quiz event
     */
    async logQuizEvent(question, eventType, value) {
        const payload = this.buildPayload({
            question: question,
            event_type: eventType,
            value: value
        });
        return await this.logEvent('user_quiz_events', payload);
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
     * 🔍 Get analytics state (for debugging)
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            currentUsername: this.currentUsername,
            currentLessonId: this.currentLessonId,
            currentLessonPartId: this.currentLessonPartId,
            bufferedEventsCount: this.eventBuffer.length,
            hasDataClient: !!this.dataClient
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