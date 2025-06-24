/**
 * FUSESELL PROCESSING STATUS CHECKER
 *
 * This script provides a UI to show the processing status of submissions.
 * It polls a specified endpoint and updates the UI accordingly.
 */
const ProcessingStatusChecker = {
    // --- State Properties ---
    config: {},
    pendingItems: [],
    pollingIntervalId: null,

    /**
     * Initializes the module with the provided configuration.
     * @param {object} userConfig - The configuration object from the window.
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
        
        // Initial render in case the page loads before onUpdate is called
        this.renderUI();
    },
    
    /**
     * Public entry point to start the checking process.
     * @param {Array<Object>} initialData - The list of items to track.
     */
    start: function(initialData) {
        console.log('ProcessingStatusChecker.start called with initial data.');
        if (initialData && initialData.length > 0) {
            this.pendingItems = initialData;
            this.renderUI();
            this.fetchAndFilterProcessedItems();
            this.startPolling();
        }
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
            "actionID": 2, "type": "act_jholder_remove", "label": "Del",
            "jholder_code": this.config.jholder_code, "remove_mode": "all"
        };

        if (window.App && typeof window.App.callActionButton === 'function') {
            console.log(`Calling App.callActionButton for jholder: ${this.config.jholder_code}.`);
            // The following line is commented out as requested. Uncomment to activate.
            // App.callActionButton(JSON.stringify(actionData));
        } else {
            console.error(`App.callActionButton is not available.`);
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
};

// **CORRECTION:** Wait for the DOM to be fully loaded before initializing the script.
// This ensures that `window.statusCheckerConfig` is available.
document.addEventListener('DOMContentLoaded', () => {
    ProcessingStatusChecker.init(window.statusCheckerConfig);
});
