class SurveySubmissionManager {
    constructor(endpoint = 'https://hooks.realtimex.co/hooks/mdsurvey') {
        this.endpoint = endpoint;
        this.secret = "QOZbs38kWlOTP1YMsLVmT4dEYN4mBajg";
        this.surveyId = window.surveyManager?.survey?.id || null;
    }

    async generateSignature(payload) {
        const message = JSON.stringify(payload);
        const encoder = new TextEncoder();
        const messageBytes = encoder.encode(message);
        const keyBytes = encoder.encode(this.secret);
        
        const key = await crypto.subtle.importKey(
            'raw', 
            keyBytes,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        const signature = await crypto.subtle.sign('HMAC', key, messageBytes);
        return Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async submitSurvey(surveyData) {
        const payload = {
            formData: surveyData,
            metadata: {
                url: window.location.href,
                surveyId: this.surveyId
            }
        };

        try {
            const signature = await this.generateSignature(payload);
            
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature
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
    setTimeout(() => {
        if (typeof surveyData !== 'undefined' && window.surveyManager?.survey) {
            window.submissionManager = new SurveySubmissionManager();
            
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
