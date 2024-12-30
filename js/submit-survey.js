class SurveySubmissionManager {
    constructor(endpoint = 'https://hooks.realtimex.co/hooks/mdsurvey') {
        this.endpoint = endpoint;
        this.surveyId = window.surveyManager?.survey?.id || null;
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
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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

                const locale = sender.locale || 'en';

                try {
                    statusElement.textContent = surveyData.submittingText?.[locale] || 'Submitting...';
                    await window.submissionManager.submitSurvey(sender.data);
                    
                    statusElement.className = 'survey-status success';
                    statusElement.textContent = surveyData.completedText[locale];
                    statusElement.setAttribute('data-message-type', 'completed');
                } catch (error) {
                    statusElement.className = 'survey-status error';
                    statusElement.textContent = surveyData.errorText?.[locale] || 'Submission failed. Please try again.';
                }
            });
        }
    }, 100);
});
