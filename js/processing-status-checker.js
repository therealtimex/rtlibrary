(function () {
  "use strict";

  const ProcessingStatusChecker = {
    config: {},
    pendingItems: [],
    pollingIntervalId: null,

    /**
     * Initializes the module by reading attributes from its own <script> tag.
     */
    init: function () {
      const self = document.currentScript;
      if (!self) {
        console.error(
          "Status Checker: Could not find its own script tag. 'document.currentScript' is not supported or the script is not loaded correctly."
        );
        return;
      }

      try {
        this.config = {
          checkUrl: self.dataset.checkUrl,
          jholder_code: self.dataset.jholderCode,
          item_name: self.dataset.itemName || "submission",
          body: JSON.parse(self.dataset.body || "{}"), // Safely parse the body
        };
      } catch (e) {
        console.error(
          "Status Checker: Failed to parse 'data-body' JSON attribute.",
          e
        );
        return;
      }

      this.renderUI();
    },

    start: function (initialData) {
      // ... start, renderUI, and other functions remain exactly the same ...
    },

    // ... (The rest of the functions: renderUI, removeProcessedItemPermanently, etc., are unchanged)
  };

  // Initialize the module as soon as the script is executed
  ProcessingStatusChecker.init();

  // Expose the module to the global scope so onUpdate can call it
  window.ProcessingStatusChecker = ProcessingStatusChecker;
})();
