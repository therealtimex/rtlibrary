/**
 * FUSESELL PROCESSING STATUS CHECKER
 *
 * This script provides a UI to show the processing status of submissions. It polls
 * a specified endpoint, updates the UI, and automatically stops when complete.
 *
 * HOW TO USE:
 * 1. Define a global configuration object `statusCheckerConfig` in your HTML.
 * 2. Include this script in your HTML file (`<script src="processing-status-checker.js" defer></script>`).
 * 3. The app framework should call the global functions `onUpdate(data)` and `onAppResume()`,
 *    which are defined in the main HTML file to interact with this module.
 */
(function() {
    'use strict';

    // The main module that encapsulates all logic and state.
    const ProcessingStatusChecker = {
        config: {},
        pendingItems: [],
        pollingIntervalId: null,

        /**
         * Initializes the module with configuration.
         * This should only be called once when the script loads.
         */
        init: function(userConfig) {
            if (!userConfig) {
                console.error("Status Checker: Configuration object 'statusCheckerConfig' is missing.");
                return;
            }
            this.config = {
                checkUrl: userConfig.checkUrl,
                body: userConfig.body,
                jholder_code: userConfig.jholder_code,
                item_name: userConfig.item_name || 'submission'
            };
            this.renderUI();
        },

        /**
         * Public method to start the checking process with initial data.
         * Called by the app's `onUpdate` function.
         */
        start: function(initialData) {
            console.log('ProcessingStatusChecker.start called with initial data.');
            if (initialData && initialData.length > 0) {
                this.pendingItems = initialData;
                this.renderUI();
                this.fetchAndFilterProcessedItems(); // Perform an immediate check
                this.startPolling(); // Start recurring checks
            }
        },

        /**
         * Public method to resume polling, e.g., when the user returns to the screen.
         * Called by the app's `onAppResume` function.
         */
        resume: function() {
            console.log('ProcessingStatusChecker.resume called.');
            // Only resume checking if there are items pending and polling isn't already active.
            if (this.pendingItems.length > 0) {
                this.fetchAndFilterProcessedItems();
                this.startPolling();
            }
        },

        /**
         * Renders the entire UI based on the current state of pendingItems.
         */
        renderUI: function() {
            const notificationContainer = document.getElementById('notification-container');
            const dataListContainer = document.getElementById('dataList');
            if (!notificationContainer || !dataListContainer) return;

            if (this.pendingItems.length > 0) {
                notificationContainer.innerHTML = `
                  <div class="bg-theme-accent text-white p-4 text-center rounded-lg shadow-lg">
                    ✅ Your ${this.config.item_name} has been received and is being processed 🚀
                  </div>
                `;
                const itemsHtml = this.pendingItems.map(item =>
                    `<div class="bg-theme-surface p-3 rounded-lg shadow text-sm">
                       <span class="font-medium text-theme-text-secondary">Processing ID:</span> ${item.instanceID}
                     </div>`
                ).join('');
                dataListContainer.innerHTML = `<h2 class="text-xl font-semibold mb-3">Pending Submissions</h2>${itemsHtml}`;
            } else {
                notificationContainer.innerHTML = '';
                dataListContainer.innerHTML = '';
            }
        },

        /**
         * Calls an external app function to permanently remove processed items.
         */
        removeProcessedItemPermanently: function() {
            const actionData = {
                "actionID": 2,
                "type": "act_jholder_remove",
                "label": "Del",
                "jholder_code": this.config.jholder_code,
                "remove_mode": "all"
            };
            // This part is inactive as requested. Uncomment to activate.
            // if (App && typeof App.callActionButton === 'function') {
            //     console.log(`Calling App.callActionButton for jholder: ${this.config.jholder_code}.`);
            //     App.callActionButton(JSON.stringify(actionData));
            // } else {
            //     console.error(`App.callActionButton is not available.`);
            // }
        },

        /**
         * Fetches the list of processed events and updates the pending items list.
         */
        fetchAndFilterProcessedItems: async function() {
            if (this.pendingItems.length === 0) {
                this.stopPolling();
                this.renderUI();
                return;
            }

            console.log('Checking for processed items...');
            try {
                const response = await fetch(this.config.checkUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.config.body)
                });
                if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
                
                const result = await response.json();
                const processedEventIds = new Set(result.hits?.hits.map(hit => hit._source?.instanceID).filter(id => id) || []);

                if (processedEventIds.size > 0) {
                    const itemsToRemove = this.pendingItems.filter(item => processedEventIds.has(item.instanceID));
                    if (itemsToRemove.length > 0) {
                        console.log(`${itemsToRemove.length} item(s) are processed.`);
                        this.removeProcessedItemPermanently();
                        this.pendingItems = this.pendingItems.filter(item => !processedEventIds.has(item.instanceID));
                    }
                }
            } catch (error) {
                console.error('An error occurred while checking for processed items:', error);
            } finally {
                this.renderUI();
                if (this.pendingItems.length === 0) {
                    this.stopPolling();
                }
            }
        },

        /**
         * Starts the polling process if it's not already running.
         */
        startPolling: function() {
            if (this.pollingIntervalId) return;
            console.log('Starting polling: checking every 10 seconds.');
            this.pollingIntervalId = setInterval(() => this.fetchAndFilterProcessedItems(), 10000);
        },

        /**
         * Stops the polling process.
         */
        stopPolling: function() {
            if (this.pollingIntervalId) {
                console.log('All items processed. Stopping polling.');
                clearInterval(this.pollingIntervalId);
                this.pollingIntervalId = null;
            }
        }
    };

    // Initialize the module and attach it to the global scope so the HTML can access it.
    // This runs after the DOM is ready to ensure the config object is available.
    document.addEventListener('DOMContentLoaded', () => {
        ProcessingStatusChecker.init(window.statusCheckerConfig);
        window.ProcessingStatusChecker = ProcessingStatusChecker;
    });

})();
