const StatusChecker = {
    // Properties to hold state and configuration
    config: null,
    pendingItems: [],
    pollingIntervalId: null,

    /**
     * Initializes the checker by reading configuration from its own script tag.
     * @returns {object|undefined} The checker instance for chaining or undefined on failure.
     */
    init() {
        const scriptTag = document.getElementById('status-checker-script');
        if (!scriptTag) {
            console.error("Status Checker: Could not find the script tag with id 'status-checker-script'.");
            return;
        }

        const data = scriptTag.dataset;

        try {
            this.config = {
                // Note: dataset converts kebab-case (data-check-url) to camelCase (checkUrl)
                checkUrl: data.checkUrl,
                jholder_code: data.jholderCode,
                item_name: data.itemName || 'item',
                body: JSON.parse(data.body) // Parse the body from a string to an object
            };
        } catch (e) {
            console.error("Status Checker: Failed to parse the 'data-body' attribute. Please ensure it is valid JSON.", e);
            return;
        }

        if (!this.config.checkUrl || !this.config.body) {
            console.error("Status Checker: 'data-check-url' and 'data-body' attributes are required.");
            return;
        }
        
        this.renderUI();
        console.log("Status Checker initialized successfully from data attributes.");
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

        const itemName = this.config ? (this.config.item_name || 'item') : 'item';

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
    
    // ... (The rest of the functions: removeProcessedItemPermanently, fetchAndFilterProcessedItems, startPolling, resume)
    // No changes are needed in the functions below as they rely on this.config which is set during init.

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
