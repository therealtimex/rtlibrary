// Language handling functions
        const supportedLanguages = ['en', 'fr', 'vi'];

        function getInitialLanguage() {
            // Check URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const urlLang = urlParams.get('lang');
            
            if (urlLang && supportedLanguages.includes(urlLang)) {
                return urlLang;
            }
            
            // Fallback to HTML lang attribute
            const htmlLang = document.documentElement.lang;
            if (htmlLang && supportedLanguages.includes(htmlLang)) {
                return htmlLang;
            }
            
            // Default fallback
            return 'en';
        }

        function setLanguage(lang) {
            // Update URL without reloading
            const url = new URL(window.location);
            url.searchParams.set('lang', lang);
            window.history.pushState({}, '', url);

            // Update HTML lang attribute
            document.documentElement.lang = lang;
            
            // Update language buttons
            document.querySelectorAll('.language-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
                btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang);
            });
            
            // Update content visibility
            document.querySelectorAll('[lang]').forEach(element => {
                element.classList.toggle('active', element.getAttribute('lang') === lang);
            });
            
            // Update survey language if available
            if (window.surveyManager) {
                window.surveyManager.changeLanguage(lang);
            }
        }

        function changeLanguage(lang) {
            if (supportedLanguages.includes(lang)) {
                setLanguage(lang);
            } else {
                console.error('Unsupported language:', lang);
            }
        }

        // Initialization
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize survey
            if (typeof surveyData !== 'undefined' && typeof successMessages !== 'undefined') {
                window.surveyManager = new SurveyManager('surveyContainer', surveyData);
            } else {
                console.error('Survey data not loaded properly');
            }
            
            // Set initial language
            const initialLang = getInitialLanguage();
            setLanguage(initialLang);

            // Handle browser back/forward buttons
            window.addEventListener('popstate', () => {
                const newLang = getInitialLanguage();
                setLanguage(newLang);
            });
        });