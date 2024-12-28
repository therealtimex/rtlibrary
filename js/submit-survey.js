class SurveySubmissionManager {
    constructor(endpoint = 'https://hooks.realtimex.co/hooks/survey') {
        this.endpoint = endpoint;
        this.surveyId = this.getSurveyId();
        this.maxRetries = 3;
        this.timeout = 10000; // 10 seconds
    }

    getSurveyId() {
        const scriptSrc = document.querySelector('script[src*="rtlibrary/js/form"]')?.src;
        return scriptSrc ? scriptSrc.split('/').pop() : null;
    }

    async generateSecret() {
        if (!this.surveyId) {
            throw new Error('Survey ID not found');
        }

        const message = `${window.location.origin}|${this.surveyId}`;
        const msgBuffer = new TextEncoder().encode(message);
        
        const keyMaterial = await crypto.subtle.digest('SHA-256', msgBuffer);
        const key = await crypto.subtle.importKey(
            'raw',
            keyMaterial,
            { name: 'AES-CBC', length: 256 },
            false,
            ['encrypt']
        );

        const iv = crypto.getRandomValues(new Uint8Array(16));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-CBC', iv },
            key,
            msgBuffer
        );

        const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
        return btoa(String.fromCharCode(...combined));
    }

    async submitWithRetry(payload, retryCount = 0) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.status === 401) {
                throw new Error('Unauthorized: Invalid secret');
            }
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || 5;
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return this.submitWithRetry(payload, retryCount);
            }
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Submission failed');
            }

            return data;

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            if (error.name === 'TypeError') {
                if (retryCount < this.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                    return this.submitWithRetry(payload, retryCount + 1);
                }
                throw new Error('Network error: Unable to reach server');
            }
            throw error;
        }
    }

    async submitSurvey(surveyData) {
        const payload = {
            formData: surveyData,
            metadata: {
                url: window.location.href,
                surveyId: this.surveyId,
                secret: await this.generateSecret()
            }
        };

        return this.submitWithRetry(payload);
    }
}

// Initialize submission manager
document.addEventListener('DOMContentLoaded', () => {
    if (typeof surveyData !== 'undefined' && typeof successMessages !== 'undefined') {
        window.submissionManager = new SurveySubmissionManager();
        
        // Add submission handler to survey manager
        window.surveyManager.survey.onComplete.add(async (sender, options) => {
            try {
                const loadingToast = showToast('Submitting...', 'info');
                await window.submissionManager.submitSurvey(sender.data);
                hideToast(loadingToast);
                showToast(successMessages[sender.locale], 'success');
            } catch (error) {
                const errorMessage = error.message || 'Submission failed. Please try again.';
                showToast(errorMessage, 'error');
            }
        });
    }
});
