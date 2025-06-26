console.log("🔧 DEBUG: External script loading...");

// Create a global object to expose functionality
window.ProcessingStatusChecker = (function () {
  console.log("🔧 DEBUG: ProcessingStatusChecker module initializing");

  // Private variables
  let pendingItems = [];
  let pollingIntervalId = null;
  let pollingAttempts = 0;

  // Configuration - moved from HTML
  const config = {
    checkUrl: 'https://es.rta.vn/process_status/_search',
    jholderCode: 'process_status',
    pollingInterval: 10000,
    responseKeyField: 'instanceID',
    maxPollingAttempts: 12
  };

  /**
   * Gets the current request body based on pending items
   */
  function getRequestBody() {
    const instanceIds = pendingItems.map(item => item.instanceID);
    return {
      "size": instanceIds.length,
      "query": {
        "bool": {
          "must": [
            { "terms": { "instanceID": instanceIds } }
          ]
        }
      },
      "_source": ["instanceID"]
    };
  }

  /**
   * Merges new items with existing pending items, avoiding duplicates based on instanceID
   */
  function mergePendingItems(existingItems, newItems, key = "instanceID") {
    console.log("🔄 DEBUG: Merging pending items");
    console.log("🔄 DEBUG: Existing items:", existingItems.length);
    console.log("🔄 DEBUG: New items:", newItems.length);

    const existingIds = new Set(existingItems.map((item) => item[key]));
    const merged = [...existingItems];

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
      mainWrapper.innerHTML = `
        <div class="bg-theme-accent text-white p-3 text-xs rounded-lg shadow-lg flex flex-col">
          <div class="text-left">
            <div>Your submission has been recorded and is being processed.</div>
            <div class="mt-1 opacity-80">${message}</div>
          </div>
          <div class="flex justify-end mt-2">
            <button id="processing-status-close-btn" class="px-3 py-1 bg-white/10 border border-white/30 rounded hover:bg-white/20 text-xs">Dismiss</button>
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
    pendingItems = [];
    removeProcessedItemPermanently();
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    }
    renderUI();
  }

  /**
   * Calls an external app function to permanently remove a processed item.
   */
  function removeProcessedItemPermanently() {
    console.log("🗑️ DEBUG: removeProcessedItemPermanently() called");

    const actionData = {
      actionID: 2,
      type: "act_jholder_remove",
      label: "Del",
      jholder_code: config.jholderCode,
      remove_mode: "all",
    };

    console.log("🗑️ DEBUG: actionData prepared:", actionData);

    if (window.App && typeof window.App.callActionButton === "function") {
      console.log("🗑️ DEBUG: Calling App.callActionButton");
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
    if (config.maxPollingAttempts && pollingAttempts > config.maxPollingAttempts) {
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

    try {
      const response = await fetch(config.checkUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getRequestBody()),
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

          removeProcessedItemPermanently();

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

  /**
   * Parses jholder data from the page
   */
  function parseJholderData() {
    console.log("📋 DEBUG: parseJholderData() called");

    const jholderElement = document.getElementById('jholder-data');
    if (!jholderElement) {
      console.log("📋 DEBUG: No jholder element found");
      return [];
    }

    const rawData = jholderElement.textContent || jholderElement.innerText;
    console.log("📋 DEBUG: Raw jholder data:", rawData);

    // Check if data is empty or still contains placeholder
    if (!rawData || rawData.trim() === '' || rawData.includes('##jholder.process_status##')) {
      console.log("📋 DEBUG: No actual jholder data (empty or placeholder)");
      return [];
    }

    try {
      // Parse the JSON array directly
      const parsedData = JSON.parse(rawData);

      if (Array.isArray(parsedData)) {
        console.log("📋 DEBUG: Successfully parsed jholder array:", parsedData.length, "items");
        return parsedData; // Data is already in the correct format
      } else {
        console.log("📋 DEBUG: Parsed data is not an array:", typeof parsedData);
        return [];
      }

    } catch (error) {
      console.error("📋 ERROR: Failed to parse jholder data as JSON:", error);
      console.error("📋 ERROR: Raw data was:", rawData);
      return [];
    }
  }

  // Public API
  return {
    /**
     * Initialize and start the status checker
     */
    init: function () {
      console.log("🚀 DEBUG: ProcessingStatusChecker.init() called");
      pollingAttempts = 0;

      // Parse data from jholder
      const jholderData = parseJholderData();

      if (jholderData && jholderData.length > 0) {
        console.log("🚀 DEBUG: Found jholder data, starting status check");
        pendingItems = mergePendingItems(pendingItems, jholderData);
        renderUI();
        fetchAndFilterProcessedItems();
        startPolling();
      } else {
        console.log("🚀 DEBUG: No jholder data found");
        renderUI();
      }
    },

    /**
     * Resume the status checker (for app resume events)
     */
    resume: function () {
      console.log("🔄 DEBUG: ProcessingStatusChecker.resume() called");
      if (pendingItems.length > 0) {
        console.log("🔄 DEBUG: Resuming polling and fetching for pending items.");
        fetchAndFilterProcessedItems();
        startPolling();
      } else {
        console.log("🔄 DEBUG: No pending items, checking for new jholder data");
        this.init(); // Re-check jholder data
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