// Global state to hold items that are pending processing and the polling interval ID
let pendingItems = [];
let pollingIntervalId = null;

/**
 * Renders the UI based on the current state of pendingItems.
 */
function renderUI() {
    const mainWrapper = document.getElementById('main-content-wrapper');
    if (!mainWrapper) return;

    // Use the item_name from the config, with a fallback
    const itemName = processingConfig.item_name || 'item';

    if (pendingItems.length > 0) {
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
}

/**
 * Calls an external app function to permanently remove a processed item.
 */
function removeProcessedItemPermanently() {
    const actionData = {
        "actionID": 2,
        "type": "act_jholder_remove",
        "label": "Del",
        "jholder_code": processingConfig.jholder_code, // Use jholder_code from config
        "remove_mode": "all"
    };

    if (window.App && typeof window.App.callActionButton === 'function') {
        console.log(`Calling App.callActionButton to remove processed items.`);
        // The following line is commented out as requested. Uncomment to activate.
        // App.callActionButton(JSON.stringify(actionData));
    } else {
        console.error(`App.callActionButton is not available. Cannot permanently remove items.`);
    }
}

/**
 * Fetches the list of processed events and updates the pending items list.
 */
async function fetchAndFilterProcessedItems() {
    if (pendingItems.length === 0) {
        if (pollingIntervalId) {
            console.log('No more pending items. Stopping polling.');
            clearInterval(pollingIntervalId);
            pollingIntervalId = null;
        }
        renderUI();
        return;
    }
    console.log('Checking for processed items...');
    
    // Use the URL and body from the config object
    const url = processingConfig.checkUrl;
    const requestBody = processingConfig.body;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
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
            const itemsToRemove = pendingItems.filter(item => processedEventIds.has(item.instanceID));

            if (itemsToRemove.length > 0) {
                console.log(`${itemsToRemove.length} item(s) are processed.`);

                // The permanent removal action is called once for the batch of processed items.
                // This part is commented out as requested.
                // removeProcessedItemPermanently();

                // Update the local pending list to reflect the removal
                pendingItems = pendingItems.filter(item => !processedEventIds.has(item.instanceID));
            }
        }
    } catch (error) {
        console.error('An error occurred while checking for processed items:', error);
    } finally {
        renderUI();
        if (pendingItems.length === 0 && pollingIntervalId) {
            console.log('All items processed. Stopping polling.');
            clearInterval(pollingIntervalId);
            pollingIntervalId = null;
        }
    }
}

/**
 * Starts the polling process if it's not already running.
 */
function startPolling() {
    if (pollingIntervalId) return;
    console.log('Starting polling: checking every 10 seconds.');
    pollingIntervalId = setInterval(fetchAndFilterProcessedItems, 10000);
}

/**
 * Re-triggers the check for processed items when the user returns to the screen.
 */
function onAppResume() {
    console.log('onAppResume called. Re-checking status.');
    fetchAndFilterProcessedItems();
    if (pendingItems.length > 0) {
        startPolling();
    }
}

// Perform an initial render to show an empty state before onUpdate is called
document.addEventListener('DOMContentLoaded', renderUI);