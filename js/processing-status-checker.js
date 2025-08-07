console.log("🔧 DEBUG: External script loading...");

// Create a global object to expose functionality
window.ProcessingStatusChecker = (function () {
  console.log("🔧 DEBUG: ProcessingStatusChecker module initializing");

  // Private variables
  let pendingItems = [];
  let pollingIntervalId = null;
  let config = null;
  let pollingAttempts = 0;

  /**
   * Merges new items with existing pending items, avoiding duplicates based on instanceID
   * @param {Array} existingItems - Current pending items
   * @param {Array} newItems - New items to merge
   * @param {string} key - Key field to use for duplicate detection (default: 'instanceID')
   * @returns {Array} Merged array without duplicates
   */
  function mergePendingItems(existingItems, newItems, key = "instanceID") {
    console.log("🔄 DEBUG: Merging pending items");
    console.log("🔄 DEBUG: Existing items:", existingItems.length);
    console.log("🔄 DEBUG: New items:", newItems.length);

    const existingIds = new Set(existingItems.map((item) => item[key]));
    const merged = [...existingItems];
    console.log("🔄 DEBUG: Merged items:", merged);

    for (const item of newItems) {
      if (!existingIds.has(item[key])) {
        merged.push(item);
        existingIds.add(item[key]);
        console.log("🔄 DEBUG: Added new item:", item[key]);
      } else {
        console.log("🔄 DEBUG: Skipped duplicate item:", item[key]);
      }
    }

    console.log("🔄 DEBUG: Final merged items:", merged.length);
    return merged;
  }

  /**
   * Renders the UI based on the current state of pendingItems.
   */
  function renderUI() {
    console.log(
      "🎨 DEBUG: renderUI() called, pendingItems.length:",
      pendingItems.length
    );

    const mainWrapper = document.getElementById("main-content-wrapper");
    if (!mainWrapper) {
      console.error("🎨 ERROR: main-content-wrapper element not found");
      return;
    }

    if (pendingItems.length > 0) {
      const itemGroups = pendingItems.reduce((acc, item) => {
        const itemType = item.item_type || "item";
        acc[itemType] = (acc[itemType] || 0) + 1;
        return acc;
      }, {});

      const groupStrings = Object.entries(itemGroups).map(
        ([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`
      );
      const message = `Processing: ${groupStrings.join(", ")} 🚀`;

      console.log("🎨 DEBUG: Rendering processing message:", message);
      mainWrapper.className = "p-2 md:p-4";
      // mainWrapper.innerHTML = `
      //         <div class="bg-theme-accent text-white p-3 text-xs rounded-lg shadow-lg flex flex-col">
      //           <div class="text-left">
      //             <div>Your submission has been recorded and is being processed.</div>
      //             <div class="mt-1 opacity-80">${message}</div>
      //           </div>
      //           <div class="flex justify-end mt-2">
      //               <button id="processing-status-close-btn" class="px-3 py-1 bg-white/10 border border-white/30 rounded hover:bg-white/20 text-xs">Dismiss</button>
      //           </div>
      //         </div>
      //       `;
      mainWrapper.innerHTML = `
              <div class="bg-theme-info text-white p-4 m-4 rounded-lg shadow-sm border border-white/10 relative overflow-hidden">
                <div class="flex items-center gap-3">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium leading-tight">
                            All set! We're on it
                        </div>
                        <div class="text-xs text-white/85 leading-tight mt-0.5 truncate">
                            ${message}
                        </div>
                    </div>
                    <button id="processing-status-close-btn" 
                            class="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors duration-200 flex-shrink-0">
                        <i class="fas fa-times text-xs text-white/90"></i>
                    </button>
                </div>
            </div>
            `;
      document
        .getElementById("processing-status-close-btn")
        .addEventListener("click", dismissMessage);
    } else {
      console.log("🎨 DEBUG: Clearing UI (no pending items)");
      mainWrapper.className = "hidden";
      mainWrapper.innerHTML = "";
    }
  }
  /**
   * Dismisses the processing message and stops polling.
   */
  function dismissMessage() {
    console.log("🎨 DEBUG: User dismissed the message");

    // Remove each pending item individually
    pendingItems.forEach((item) => {
      console.log("🎨 DEBUG: Removing processed item:", item);
      removeProcessedItemPermanently(item);
    });

    pendingItems = [];
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    }
    renderUI();
  }

  /**
   * Calls an external app function to permanently remove a processed item.
   * @param {object} item - The item to remove
   */
  function removeProcessedItemPermanently(item) {
    console.log(
      "🗑️ DEBUG: removeProcessedItemPermanently() called with item:",
      item
    );

    if (!config) {
      console.error("🗑️ ERROR: Configuration not loaded");
      return;
    }

    const actionData = {
      actionID: 2,
      type: "act_jholder_remove",
      label: "Del",
      jholder_code: config.jholderCode,
      remove_mode: "remove",
      id: item.__json_id__
    };

    console.log("🗑️ DEBUG: actionData prepared:", actionData);

    if (window.App && typeof window.App.callActionButton === "function") {
      console.log("🗑️ DEBUG: Calling App.callActionButton");
      // document.write(JSON.stringify(actionData));
      App.callActionButton(JSON.stringify(actionData));

      console.log("🗑️ DEBUG: App.callActionButton call completed");
    } else {
      console.error("🗑️ ERROR: App.callActionButton is not available");
    }
  }

  /**
   * Fetches the list of processed events and updates the pending items list.
   */
  async function fetchAndFilterProcessedItems() {
    console.log(
      "🔍 DEBUG: fetchAndFilterProcessedItems() called, pendingItems.length:",
      pendingItems.length
    );

    if (!config) {
      console.error("🔍 ERROR: Configuration not loaded");
      return;
    }

    if (pendingItems.length === 0) {
      console.log("🔍 DEBUG: No pending items, stopping polling");
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
      }
      renderUI();
      return;
    }

    pollingAttempts++;
    if (
      config.maxPollingAttempts &&
      pollingAttempts > config.maxPollingAttempts
    ) {
      console.warn(
        `🔍 WARNING: Max polling attempts (${config.maxPollingAttempts}) reached. Stopping polling.`
      );
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
      }
      return;
    }

    console.log("🔍 DEBUG: Starting API check for processed items");
    console.log("🔍 DEBUG: Using URL:", config.checkUrl);
    console.log("🔍 DEBUG: Using response key field:", config.responseKeyField);

    try {
      const response = await fetch(config.checkUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.requestBody),
      });

      console.log(
        "🔍 DEBUG: Response status:",
        response.status,
        "ok:",
        response.ok
      );

      if (!response.ok) {
        console.error(
          "🔍 ERROR: Failed to fetch processed events:",
          response.statusText
        );
        return;
      }

      const result = await response.json();
      console.log("🔍 DEBUG: API response received");

      // Use the configurable key field to extract processed IDs
      const processedEventIds = new Set(
        result.hits?.hits
          .map((hit) => {
            const value = hit._source?.[config.responseKeyField];
            console.log(
              "🔍 DEBUG: Extracted value from response:",
              value,
              "using key:",
              config.responseKeyField
            );
            return value;
          })
          .filter((id) => id) || []
      );

      console.log(
        "🔍 DEBUG: Processed event IDs found:",
        Array.from(processedEventIds)
      );

      if (processedEventIds.size > 0) {
        const itemsToRemove = pendingItems.filter((item) => {
          console.log(
            "🔍 DEBUG: Checking item:",
            item.instanceID,
            "against processed IDs"
          );
          return processedEventIds.has(item.instanceID);
        });
        console.log("🔍 DEBUG: Items to remove:", itemsToRemove.length);

        if (itemsToRemove.length > 0) {
          console.log(
            `🔍 SUCCESS: ${itemsToRemove.length} item(s) are processed`
          );

          // Remove each processed item individually
          itemsToRemove.forEach((item) => {
            removeProcessedItemPermanently(item);
          });

          const beforeCount = pendingItems.length;
          pendingItems = pendingItems.filter(
            (item) => !processedEventIds.has(item.instanceID)
          );
          console.log(
            "🔍 DEBUG: Items removed:",
            beforeCount - pendingItems.length
          );
        }
      }
    } catch (error) {
      console.error("🔍 ERROR: Exception occurred:", error);
    } finally {
      renderUI();
      if (pendingItems.length === 0 && pollingIntervalId) {
        console.log("🔍 DEBUG: All items processed, stopping polling");
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
      }
    }
  }

  /**
   * Starts the polling process if it's not already running.
   */
  function startPolling() {
    console.log(
      "⏰ DEBUG: startPolling() called, current interval:",
      pollingIntervalId
    );

    if (!config) {
      console.error("⏰ ERROR: Configuration not loaded");
      return;
    }

    if (pollingIntervalId) {
      console.log("⏰ DEBUG: Polling already active");
      return;
    }

    console.log(
      "⏰ DEBUG: Starting new polling interval:",
      config.pollingInterval,
      "ms"
    );
    pollingIntervalId = setInterval(
      fetchAndFilterProcessedItems,
      config.pollingInterval
    );
    console.log("⏰ DEBUG: Polling started with ID:", pollingIntervalId);
  }

  // Public API - these functions will be accessible from the HTML
  return {
    /**
     * Start the processing status checker with initial data and configuration (replaces existing items)
     * @param {Array<Object>} initialData - Array of initial submissions
     * @param {Object} configuration - Configuration object with all parameters
     */
    start: function (initialData, configuration) {
      console.log("🚀 DEBUG: ProcessingStatusChecker.start() called");
      console.log("🚀 DEBUG: Initial data:", initialData);
      console.log("🚀 DEBUG: Configuration:", configuration);

      // Store the configuration
      config = configuration;
      pollingAttempts = 0;

      if (initialData && initialData.length > 0) {
        console.log(
          "🚀 DEBUG: Valid initial data found, replacing pending items"
        );
        pendingItems = [...initialData]; // Replace existing items
        renderUI();
        fetchAndFilterProcessedItems();
        startPolling();
      } else {
        console.log("🚀 DEBUG: No valid initial data, clearing pending items");
        pendingItems = [];
        renderUI();
      }
    },

    /**
     * Start the processing status checker with initial data and configuration (merges with existing items)
     * @param {Array<Object>} initialData - Array of initial submissions
     * @param {Object} configuration - Configuration object with all parameters
     */
    startWithMerge: function (initialData, configuration) {
      console.log("🚀 DEBUG: ProcessingStatusChecker.startWithMerge() called");
      console.log("🚀 DEBUG: Initial ", initialData);
      console.log("🚀 DEBUG: Configuration:", configuration);

      // Store the configuration
      config = configuration;
      pollingAttempts = 0;
      if (initialData && initialData.length > 0) {
        console.log(
          "🚀 DEBUG: Valid initial data found, merging with existing items"
        );
        pendingItems = mergePendingItems(pendingItems, initialData);
        renderUI();
        fetchAndFilterProcessedItems();
        startPolling();
      } else {
        console.log("🚀 DEBUG: No valid initial data, keeping existing items");
        renderUI();
      }
    },
    resume: function () {
      console.log("🔄 DEBUG: ProcessingStatusChecker.resume() called");
      if (pendingItems.length > 0) {
        console.log(
          "🔄 DEBUG: Resuming polling and fetching for pending items."
        );
        fetchAndFilterProcessedItems();
        startPolling();
      } else {
        console.log("🔄 DEBUG: No pending items, resume is not needed.");
      }
    },
    // Expose internal state for debugging
    getState: function () {
      return {
        pendingItems: pendingItems,
        pollingIntervalId: pollingIntervalId,
        config: config,
      };
    },
  };
})();

console.log(
  "🔧 DEBUG: ProcessingStatusChecker module created and attached to window"
);
console.log(
  "🔧 DEBUG: Available methods:",
  Object.keys(window.ProcessingStatusChecker)
);
