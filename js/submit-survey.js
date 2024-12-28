class SurveySubmissionManager {
    constructor(endpoint = 'https://hooks.realtimex.co/hooks/survey') {
        this.endpoint = endpoint;
        this.surveyId = this.getSurveyId();
    }

    getSurveyId() {
        const scriptSrc = document.querySelector('script[src*="rtlibrary/js/form"]')?.src;
        return scriptSrc ? scriptSrc.split('/').pop() : null;
    }

    async generateSecret() {
        if (!this.surveyId) {
            throw new Error('Survey ID not found');
        }

        // Create message from origin and surveyId
        const message = `${window.location.origin}|${this.surveyId}`;
        
        // Convert message to Uint8Array
        const msgBuffer = new TextEncoder().encode(message);
        
        // Generate key from message (using SHA-256 for key derivation)
        const keyMaterial = await crypto.subtle.digest('SHA-256', msgBuffer);
        
        // Import key for AES
        const key = await crypto.subtle.importKey(
            'raw',
            keyMaterial,
            { name: 'AES-CBC', length: 256 },
            false,
            ['encrypt']
        );

        // Generate IV (16 bytes)
        const iv = crypto.getRandomValues(new Uint8Array(16));
        
        // Encrypt
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-CBC', iv },
            key,
            msgBuffer
        );

        // Combine IV and encrypted data and convert to base64
        const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
        return btoa(String.fromCharCode(...combined));
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

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Submission error:', error);
            throw error;
        }
    }
}

// Initialize in your main code
document.addEventListener('DOMContentLoaded', () => {
    if (typeof surveyData !== 'undefined' && typeof successMessages !== 'undefined') {
        window.surveyManager = new SurveyManager('surveyContainer', surveyData);
        window.submissionManager = new SurveySubmissionManager();
        
        // Add submission handler
        window.surveyManager.survey.onComplete.add(async (sender, options) => {
            try {
                const loadingToast = showToast('Submitting...', 'info');
                await window.submissionManager.submitSurvey(sender.data);
                hideToast(loadingToast);
                showToast(successMessages[sender.locale], 'success');
            } catch (error) {
                showToast('Submission failed. Please try again.', 'error');
            }
        });
    }
});
