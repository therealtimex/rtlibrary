/**
 * FUSESELL PROCESSING STATUS CHECKER
 *
 * This script provides a UI to show the processing status of submissions.
 * It polls a specified endpoint and updates the UI accordingly.
 *
 * How to use:
 * 1. Include this script in your HTML file.
 * 2. Before including this script, define a global configuration object: `statusCheckerConfig`.
 * 3. The app framework should call `window.onUpdate(data)` to start the process
 *    and `window.onAppResume()` when the user returns to the screen.
 */
const ProcessingStatusChecker = {
    // --- State Properties ---
    config: {},
    pendingItems: [],
    pollingIntervalId: null,

    /**
     * Initializes the module with the provided configuration.
     * @param {object} userConfig - The configuration object.
     */
    init: function(userConfig) {
        if (!userConfig) {
            console.error("Status Checker: Configuration object 'statusCheckerConfig' is missing.");
            return;
        }

        // Set default values and merge with user config
        this.config = {
            checkUrl: userConfig.checkUrl,
            body: userConfig.body,
            jholder_code: userConfig.jholder_code,
            item_name: userConfig.item_name || 'submission'
        };

        // Expose public methods to the global scope for the app framework
        window.onUpdate = this.onUpdate.bind(this);
        window.onAppResume = this.onAppResume.bind(this);

        // Perform initial render on page load
        document.addEventListener('DOMContentLoaded', this.renderUI.bind(this));
    },

    /**
     * Renders the UI based on the current state.
     */
    renderUI: function() {
        const mainWrapper = document.getElementById('main-content-wrapper');
        if (!mainWrapper) return;

        if (this.pendingItems.length > 0) {
            mainWrapper.className = 'p-2 md:p-4';
            mainWrapper.innerHTML = `
              <div class="bg-theme-accent text-white p-4 text-center rounded-lg shadow-lg">
                ✅ Your ${this.config.item_name} has been received and is being processed 🚀
              </div>
            `;
        } else {
            mainWrapper.className = '';
            mainWrapper.innerHTML = '';
        }
    },

    /**
     * Calls an app function to permanently remove a processed item.
     */
    removeProcessedItemPermanently: function() {
        const actionData = {
            "actionID": 2,
            "type": "act_jholder_remove",
            "label": "Del",
            "jholder_code": this.config.jholder_code,
            "remove_mode": "all"
        };

        if (window.App && typeof window.App.callActionButton === 'function') {
            console.log(`Calling App.callActionButton to remove processed items from jholder: ${this.config.jholder_code}.`);
            // The following line is commented out as requested. Uncomment to activate.
            // App.callActionButton(JSON.stringify(actionData));
        } else {
            console.error(`App.callActionButton is not available. Cannot permanently remove items.`);
        }
    },

    /**
     * Fetches processed events and updates the pending list.
     */
    fetchAndFilterProcessedItems: async function() {
        if (this.pendingItems.length === 0) {
            if (this.pollingIntervalId) {
                clearInterval(this.pollingIntervalId);
                this.pollingIntervalId = null;
            }
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

            if (!response.ok) {
                console.error('Failed to fetch processed events:', response.statusText);
                return;
            }

            const result = await response.json();
            const processedEventIds = new Set(
                result.hits?.hits.map(hit => hit._source?.instanceID).filter(id => id) || []
            );

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
            if (this.pendingItems.length === 0 && this.pollingIntervalId) {
                console.log('All items processed. Stopping polling.');
                clearInterval(this.pollingIntervalId);
                this.pollingIntervalId = null;
            }
        }
    },

    /**
     * Starts the polling process.
     */
    startPolling: function() {
        if (this.pollingIntervalId) return;
        console.log('Starting polling: checking every 10 seconds.');
        this.pollingIntervalId = setInterval(this.fetchAndFilterProcessedItems.bind(this), 10000);
    },

    /**
     * Entry point: Initializes the screen with data.
     * @param {Array<Object>} initialData - Array of initial submissions.
     */
    onUpdate: function(initialData) {
        console.log('onUpdate called with initial data.');
        if (initialData && initialData.length > 0) {
            this.pendingItems = initialData;
            this.renderUI();
            this.fetchAndFilterProcessedItems();
            this.startPolling();
        }
    },

    /**
     * Entry point: Called when the user returns to the screen.
     */
    onAppResume: function() {
        console.log('onAppResume called. Re-checking status.');
        this.fetchAndFilterProcessedItems();
        if (this.pendingItems.length > 0) {
            this.startPolling();
        }
    }
};

// Initialize the module with the configuration from the HTML.
ProcessingStatusChecker.init(window.statusCheckerConfig);