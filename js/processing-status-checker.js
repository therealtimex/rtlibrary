const StatusChecker = {
    // Properties to hold state and configuration
    config: null,
    pendingItems: [],
    pollingIntervalId: null,

    /**
     * Initializes the checker with the provided configuration.
     * @param {object} userConfig - The configuration object from the HTML page.
     * @returns {object} The checker instance for chaining or reference.
     */
    init(userConfig) {
        if (!userConfig || !userConfig.checkUrl || !userConfig.body) {
            console.error("Status Checker: Configuration object is missing or invalid.");
            return;
        }
        this.config = userConfig;
        
        // Perform an initial render to set the default empty state.
        this.renderUI();
        
        console.log("Status Checker initialized successfully.");
        return this;
    },
    
    /**
     * Starts the checking process with the initial data.
     * @param {Array<Object>} initialData 
     */
    start(initialData) {
        this.pendingItems = initialData || [];
        this.renderUI();
        if (this.pendingItems.length > 0) {
            this.fetchAndFilterProcessedItems();
            this.startPolling();
        }
    },

    /**
     * Renders the UI based on the current state of pendingItems.
     */
    renderUI() {
        const mainWrapper = document.getElementById('main-content-wrapper');
        if (!mainWrapper) return;

        const itemName = this.config.item_name || 'item';

        if (this.pendingItems.length > 0) {
            mainWrapper.className = 'p-2 md:p-4';
            mainWrapper.innerHTML = `
              <div class="bg-theme-accent text-white p-4 text-center rounded-lg shadow-lg">
                ✅ Your ${itemName} has been received and is being processed 🚀
              </div>
            `;
        } else {
            mainWrapper.className = '';
            mainWrapper.innerHTML = '';
        }
    },

    /**
     * Calls an external app function to permanently remove a processed item.
     */
    removeProcessedItemPermanently() {
        const actionData = {
            "actionID": 2,
            "type": "act_jholder_remove",
            "label": "Del",
            "jholder_code": this.config.jholder_code,
            "remove_mode": "all"
        };

        if (window.App && typeof window.App.callActionButton === 'function') {
            console.log(`Calling App.callActionButton to remove processed items.`);
            // App.callActionButton(JSON.stringify(actionData));
        } else {
            console.error(`App.callActionButton is not available.`);
        }
    },

    /**
     * Fetches the list of processed events and updates the pending items list.
     */
    async fetchAndFilterProcessedItems() {
        if (this.pendingItems.length === 0) {
            if (this.pollingIntervalId) {
                clearInterval(this.pollingIntervalId);
                this.pollingIntervalId = null;
            }
            this.renderUI();
            return;
        }

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
                    // removeProcessedItemPermanently();
                    this.pendingItems = this.pendingItems.filter(item => !processedEventIds.has(item.instanceID));
                }
            }
        } catch (error) {
            console.error('An error occurred while checking for processed items:', error);
        } finally {
            this.renderUI();
            if (this.pendingItems.length === 0 && this.pollingIntervalId) {
                clearInterval(this.pollingIntervalId);
                this.pollingIntervalId = null;
            }
        }
    },

    /**
     * Starts the polling process.
     */
    startPolling() {
        if (this.pollingIntervalId) return;
        this.pollingIntervalId = setInterval(() => this.fetchAndFilterProcessedItems(), 10000);
    },

    /**
     * Resumes checking when the app is brought to the foreground.
     */
    resume() {
        console.log('onAppResume called. Re-checking status.');
        this.fetchAndFilterProcessedItems();
        if (this.pendingItems.length > 0) {
            this.startPolling();
        }
    }
};