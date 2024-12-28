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
        this.survey.onComplete.add(this.handleSubmission.bind(this));
    }

    handleSubmission(sender, options) {
        const results = JSON.stringify(sender.data);
        console.log('Form Data:', results);
        this.showSuccessMessage(sender.locale);
    }

    showSuccessMessage(locale) {
        alert(successMessages[locale]);
    }

    render() {
        $(`#${this.containerId}`).Survey({ model: this.survey });
    }

    changeLanguage(lang) {
        this.survey.locale = lang;
        this.updateLanguageButtons(lang);
    }

    updateLanguageButtons(lang) {
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === lang);
        });
    }
}

// Initialize survey when the external data is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof surveyData !== 'undefined' && typeof successMessages !== 'undefined') {
        const surveyManager = new SurveyManager('surveyContainer', surveyData);
    } else {
        console.error('Survey data not loaded properly');
    }
});

// Global function for language switching
function changeLanguage(lang) {
    window.surveyManager?.changeLanguage(lang);
}