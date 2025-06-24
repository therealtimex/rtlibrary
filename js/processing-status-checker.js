console.log("🔧 DEBUG: External script loading...");

// Create a global object to expose functionality
window.ProcessingStatusChecker = (function () {
  console.log("🔧 DEBUG: ProcessingStatusChecker module initializing");

  // Private variables
  let pendingItems = [];
  let pollingIntervalId = null;
  let config = null;

  /**
   * Load configuration from the script tag's data attributes
   */
  function loadConfig() {
    console.log("⚙️ DEBUG: Loading configuration from script tag");

    const scriptTag = document.getElementById("processing-status-checker");
    if (!scriptTag) {
      console.error(
        '⚙️ ERROR: Could not find script tag with id "processing-status-checker"'
      );
      return null;
    }

    const dataset = scriptTag.dataset;
    console.log("⚙️ DEBUG: Dataset found:", dataset);

    try {
      const loadedConfig = {
        checkUrl: dataset.checkUrl,
        jholderCode: dataset.jholderCode,
        itemName: dataset.itemName || "item",
        requestBody: JSON.parse(dataset.requestBody),
        pollingInterval: parseInt(dataset.pollingInterval) || 10000,
      };

      console.log("⚙️ DEBUG: Configuration loaded successfully:", loadedConfig);
      return loadedConfig;
    } catch (error) {
      console.error("⚙️ ERROR: Failed to parse configuration:", error);
      return null;
    }
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

    const itemName = config ? config.itemName : "item";

    if (pendingItems.length > 0) {
      console.log("🎨 DEBUG: Rendering processing message for:", itemName);
      mainWrapper.className = "p-2 md:p-4";
      mainWrapper.innerHTML = `
              <div class="bg-theme-accent text-white p-4 text-center rounded-lg shadow-lg">
                ✅ Your ${itemName} has been received and is being processed 🚀
              </div>
            `;
    } else {
      console.log("🎨 DEBUG: Clearing UI (no pending items)");
      mainWrapper.className = "";
      mainWrapper.innerHTML = "";
    }
  }

  /**
   * Calls an external app function to permanently remove a processed item.
   */
  function removeProcessedItemPermanently() {
    console.log("🗑️ DEBUG: removeProcessedItemPermanently() called");

    if (!config) {
      console.error("🗑️ ERROR: Configuration not loaded");
      return;
    }

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
      // App.callActionButton(JSON.stringify(actionData));
      console.log(
        "🗑️ DEBUG: App.callActionButton call completed (commented out)"
      );
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

    console.log("🔍 DEBUG: Starting API check for processed items");
    console.log("🔍 DEBUG: Using URL:", config.checkUrl);
    console.log("🔍 DEBUG: Using request body:", config.requestBody);

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

      const processedEventIds = new Set(
        result.hits?.hits
          .map((hit) => hit._source?.instanceID)
          .filter((id) => id) || []
      );

      console.log(
        "🔍 DEBUG: Processed event IDs found:",
        Array.from(processedEventIds)
      );

      if (processedEventIds.size > 0) {
        const itemsToRemove = pendingItems.filter((item) =>
          processedEventIds.has(item.instanceID)
        );
        console.log("🔍 DEBUG: Items to remove:", itemsToRemove.length);

        if (itemsToRemove.length > 0) {
          console.log(
            `🔍 SUCCESS: ${itemsToRemove.length} item(s) are processed`
          );

          // removeProcessedItemPermanently();

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
     * Initialize the module
     */
    initialize: function () {
      console.log("🚀 DEBUG: ProcessingStatusChecker.initialize() called");

      config = loadConfig();
      if (!config) {
        console.error("🚀 ERROR: Failed to load configuration");
        return;
      }

      console.log("🚀 DEBUG: Configuration loaded, initializing UI");
      renderUI();
    },

    /**
     * Handle initial data from onUpdate
     */
    onUpdate: function (initialData) {
      console.log(
        "📥 DEBUG: ProcessingStatusChecker.onUpdate() called with:",
        initialData
      );

      if (!config) {
        console.error("📥 ERROR: Configuration not loaded");
        return;
      }

      if (initialData && initialData.length > 0) {
        console.log("📥 DEBUG: Valid initial data found, starting process");
        pendingItems = initialData;
        renderUI();
        fetchAndFilterProcessedItems();
        startPolling();
      } else {
        console.log("📥 DEBUG: No valid initial data");
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
