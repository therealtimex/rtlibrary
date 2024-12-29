// submit-survey.js
class SurveySubmissionManager {
    constructor(endpoint = 'https://hooks.realtimex.co/hooks/survey') {
        this.endpoint = endpoint;
        this.surveyId = window.surveyManager?.survey?.id || null;
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

// Initialize submission handling
document.addEventListener('DOMContentLoaded', () => {
    // Wait for survey manager to be initialized
    setTimeout(() => {
        if (typeof surveyData !== 'undefined' && window.surveyManager?.survey) {
            window.submissionManager = new SurveySubmissionManager();
            
            // Add submission handler to survey
            window.surveyManager.survey.onComplete.add(async (sender, options) => {
                const container = document.getElementById('surveyContainer');
                container.innerHTML = '';

                const statusElement = document.createElement('div');
                statusElement.className = 'survey-status';
                statusElement.setAttribute('role', 'status');
                container.appendChild(statusElement);

                try {
                    statusElement.textContent = surveyData.submittingText?.[sender.locale] || 'Submitting...';
                    await window.submissionManager.submitSurvey(sender.data);
                    
                    statusElement.className = 'survey-status success';
                    statusElement.textContent = surveyData.completedText[sender.locale];
                    statusElement.setAttribute('data-message-type', 'completed');
                } catch (error) {
                    statusElement.className = 'survey-status error';
                    statusElement.textContent = surveyData.errorText?.[sender.locale] || 'Submission failed. Please try again.';
                }
            });
        }
    }, 100);
});
