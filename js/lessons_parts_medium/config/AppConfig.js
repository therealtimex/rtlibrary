/**
 * Application Configuration
 * Centralized configuration for the Mobile Lesson App
 */

window.AppConfig = {
    // Component Configuration
    components: {
        order: ['warm_up', 'vocabulary', 'grammar', 'reading', 'speaking', 'quiz'],
        
        icons: {
            warm_up: '🔥',
            vocabulary: '📚',
            grammar: '📝',
            reading: '📖',
            speaking: '🎤',
            quiz: '🏆'
        },
        
        labels: {
            warm_up: 'Warm Up',
            vocabulary: 'Vocabulary',
            grammar: 'Grammar',
            reading: 'Reading',
            speaking: 'Speaking',
            quiz: 'Quiz'
        },
        
        descriptions: {
            warm_up: 'Get started with quick questions about the topic',
            vocabulary: 'Learn new words with examples and practice',
            grammar: 'Practice grammar rules with exercises',
            reading: 'Read and understand a passage',
            speaking: 'Practice speaking and expressing opinions',
            quiz: 'Test your knowledge from the lesson'
        },
        
        estimatedTimes: {
            warm_up: '3 min',
            vocabulary: '8 min',
            grammar: '7 min',
            reading: '5 min',
            speaking: '4 min',
            quiz: '3 min'
        }
    },

    // Tree View Configuration
    treeView: {
        levels: [
            ['warm_up'],           // First level - just warm-up
            ['vocabulary'],        // Second level - vocabulary
            ['grammar', 'reading'], // Third level - grammar and reading
            ['speaking'],          // Fourth level - speaking
            ['quiz']              // Final level - quiz
        ]
    },

    // UI Configuration
    ui: {
        animations: {
            transitionDuration: 300,
            floatDuration: 3000,
            bounceDuration: 2000,
            pulseDuration: 2000
        },
        
        colors: {
            primary: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        
        breakpoints: {
            mobile: 480,
            tablet: 768,
            desktop: 1024
        }
    },

    // App Settings
    settings: {
        dataTimeout: 10000, // 10 seconds
        checkInterval: 100, // 100ms
        debugMode: false,
        autoAdvanceDelay: 2000 // 2 seconds
    },

    // Messages
    messages: {
        loading: 'Loading lesson...',
        error: {
            dataNotAvailable: 'Lesson data not available. Please check your connection.',
            loadFailed: 'Failed to load lesson. Please refresh the page.',
            componentLocked: 'Complete previous steps first'
        },
        completion: {
            warmup: {
                title: 'Warm-up Complete!',
                subtitle: 'Great job! You\'ve completed the warm-up section.<br>Ready to explore the main lesson? Let\'s continue! 🎉',
                button: 'Continue'
            }
        }
    },

    // CSS Classes
    cssClasses: {
        screen: 'mobile-screen',
        screenActive: 'active',
        screenPrev: 'prev',
        button: {
            primary: 'btn btn-primary',
            secondary: 'btn btn-secondary',
            large: 'btn-large',
            animated: 'btn-animated'
        },
        progress: {
            container: 'progress-container',
            bar: 'progress-bar',
            fill: 'progress-fill',
            text: 'progress-text'
        }
    }
};

// Make available globally
window.AppConfig = window.AppConfig;
console.log('✅ AppConfig loaded:', typeof window.AppConfig);