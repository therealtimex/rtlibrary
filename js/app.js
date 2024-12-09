// app.js
(function() {
    'use strict';

    // Initialize the application when DOM is ready
    document.addEventListener('DOMContentLoaded', initApp);

    function initApp() {
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', handleDownload);
        }
    }

    function handleDownload() {
        // Check if external function exists
        if (typeof window.rtlib === 'object' && typeof window.rtlib.downloadVCard === 'function') {
            window.rtlib.downloadVCard();
        } else {
            console.error('VCard download functionality not available');
        }
    }
})();