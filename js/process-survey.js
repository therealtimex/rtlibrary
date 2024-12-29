class SurveyManager {
    constructor(containerId, surveyData) {
        this.containerId = containerId;
        this.surveyData = surveyData;
        this.survey = null;
        this.init();
    }

    init() {
        this.survey = new Survey.Model(this.surveyData);
        this.setupTheme();
        this.setupEventHandlers();
        this.render();
    }

    setupTheme() {
        Survey.StylesManager.applyTheme("defaultV2");
    }

    setupEventHandlers() {
        this.survey.onComplete.add((sender, options) => {
            // Clear the survey container
            const container = document.getElementById(this.containerId);
            container.innerHTML = '';
            
            // Create status element with permanent display
            const statusElement = document.createElement('div');
            statusElement.className = 'survey-status success';
            statusElement.setAttribute('role', 'status');
            
            // Create language-specific messages container
            const messageContainer = document.createElement('div');
            messageContainer.className = 'survey-message';
            messageContainer.textContent = this.surveyData.completedText[sender.locale];
            messageContainer.setAttribute('data-message-type', 'completed');
            
            // Add to container
            statusElement.appendChild(messageContainer);
            container.appendChild(statusElement);
        });
    }

    changeLanguage(lang) {
        this.survey.locale = lang;
        this.updateLanguageButtons(lang);
        
        // Update message if present
        const messageElement = document.querySelector('[data-message-type="completed"]');
        if (messageElement && this.surveyData.completedText) {
            messageElement.textContent = this.surveyData.completedText[lang];
        }
    }
}

// Initialize survey when the external data is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof surveyData !== 'undefined') {
        window.surveyManager = new SurveyManager('surveyContainer', surveyData);
    } else {
        console.error('Survey data not loaded properly');
    }
});

// Global function for language switching
function changeLanguage(lang) {
    window.surveyManager?.changeLanguage(lang);
}
