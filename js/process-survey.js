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
            
            // Create status element
            const statusElement = document.createElement('div');
            statusElement.className = 'survey-status success';
            statusElement.setAttribute('role', 'status');
            
            // Use message from surveyData
            statusElement.textContent = this.surveyData.completedText[sender.locale];
            
            // Add to container
            container.appendChild(statusElement);
        });
    }

    render() {
        $(`#${this.containerId}`).Survey({ model: this.survey });
    }

    changeLanguage(lang) {
        this.survey.locale = lang;
        this.updateLanguageButtons(lang);
        
        // Update status message if present
        const statusElement = document.querySelector('.survey-status');
        if (statusElement) {
            statusElement.textContent = this.surveyData.completedText[lang];
        }
    }

    updateLanguageButtons(lang) {
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === lang);
            btn.setAttribute('aria-pressed', btn.textContent.toLowerCase() === lang);
        });
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
