// process-survey.js
class SurveyManager {
    constructor(containerId, surveyData) {
        this.containerId = containerId;
        this.surveyData = surveyData;
        this.survey = null;
        this.init();
    }

    init() {
        if (typeof Survey === 'undefined' || typeof $ === 'undefined') {
            console.error('Survey or jQuery not loaded');
            return;
        }
        this.survey = new Survey.Model(this.surveyData);
        this.setupTheme();
        this.render();
    }

    setupTheme() {
        Survey.StylesManager.applyTheme("defaultV2");
    }

    render() {
        $(`#${this.containerId}`).Survey({ model: this.survey });
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

    updateLanguageButtons(lang) {
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === lang);
            btn.setAttribute('aria-pressed', btn.textContent.toLowerCase() === lang);
        });
    }
}

// Initialize survey when the external data is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (
        typeof surveyData !== 'undefined' &&
        typeof successMessages !== 'undefined' &&
        window.surveyManager === undefined
    ) {
        window.surveyManager = new SurveyManager('surveyContainer', surveyData);
    } else {
        console.error('Survey data not loaded properly');
    }
});

// Global function for language switching
function changeLanguage(lang) {
    window.surveyManager?.changeLanguage(lang);
}
