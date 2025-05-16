// Function to show popup messages
function showPopup(message) {
  const popup = document.createElement("div");
  popup.className =
    "fixed bg-theme-primary text-white px-4 py-2 rounded-lg shadow-lg z-50";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transition = "opacity 0.5s";
    setTimeout(() => popup.remove(), 500);
  }, 2000);
}

// Function to fetch additional data needed for the updated UI
function fetchAdditionalData() {
  // Fetch bundle pricing
  return Data.supabaseClient
    .from("current_bundle_pricing")
    .select(
      "bundle_name, actual_gold_amount, actual_price_usd, extra_gold_gain"
    )
    .then(function (bundleResponse) {
      if (bundleResponse.error) {
        throw bundleResponse.error;
      }
      bundlePricing = bundleResponse.data || [];

      // Fetch tier pricing (filtering out the "Standard" tier)
      return Data.supabaseClient
        .from("current_tier_pricing")
        .select(
          "tier_name, actual_monthly_cost, daily_gems_allowance, max_gems_capacity, monthly_gems_allowance"
        )
        .neq("tier_name", "Standard");
    })
    .then(function (tierResponse) {
      if (tierResponse.error) {
        throw tierResponse.error;
      }
      tierPricing = tierResponse.data || [];

      // Fetch conversion rate
      return Data.supabaseClient
        .from("current_conversion_rate")
        .select("actual_gold_per_gem")
        .single();
    })
    .then(function (conversionResponse) {
      if (conversionResponse.error) {
        throw conversionResponse.error;
      }
      goldPerGem = conversionResponse.data?.actual_gold_per_gem || 100;
    });
}

// Function to update UI with fetched data
function updateUI() {
  // Update max purchase amount based on gold-to-gem ratio
  if (goldPerGem > 0) {
    safelyUpdateElement(
      "maxPurchaseAmount",
      Math.floor(currentGoldBalance / goldPerGem)
    );
    safelyUpdateElement("goldPerGem", goldPerGem);
  }

  // Update gold bundles
  const bundlesContainer = document.getElementById("goldBundlesContainer");
  if (bundlesContainer) {
    bundlesContainer.innerHTML = ""; // Clear the container

    if (bundlePricing.length === 0) {
      bundlesContainer.innerHTML =
        '<div class="text-center p-4 text-theme-text-secondary">No bundles available</div>';
    } else {
      bundlePricing.forEach((bundle) => {
        const bundleElement = document.createElement("div");
        bundleElement.className =
          "border border-gray-200 rounded-lg p-3 flex justify-between items-center";
        bundleElement.innerHTML = `
         <div class="flex items-center">
           <i class="fas fa-coins text-yellow-500 text-xl mr-3"></i>
           <div>
             <div class="font-medium">${bundle.bundle_name}</div>
             <div class="text-sm text-theme-text-secondary">
               ${bundle.actual_gold_amount} gold ${
          bundle.extra_gold_gain > 0 ? `(+${bundle.extra_gold_gain} bonus)` : ""
        }
             </div>
           </div>
         </div>
         <div class="font-semibold">$${bundle.actual_price_usd.toFixed(2)}</div>
       `;
        bundlesContainer.appendChild(bundleElement);
      });
    }
  }

  // Update tier options
  const subscriptionSection = document.querySelector(
    "#buyGold-content h3:nth-of-type(2)"
  );
  if (subscriptionSection) {
    subscriptionSection.textContent = "User Tier Upgrades";
  }

  const tiersContainer = document.getElementById("userTiersContainer");
  if (tiersContainer) {
    tiersContainer.innerHTML = ""; // Clear the container

    if (tierPricing.length === 0) {
      tiersContainer.innerHTML =
        '<div class="text-center p-4 text-theme-text-secondary">No tiers available</div>';
    } else {
      tierPricing.forEach((tier) => {
        // Create an individual tier card element
        const card = document.createElement("div");
        card.className =
          "border border-gray-200 rounded-lg p-3 flex justify-between items-center mb-2";

        // Content for the card (you can also append additional text or an indicator if gold is insufficient)
        card.innerHTML = `
         <div class="flex items-center">
           <i class="fas fa-user-circle text-theme-primary text-xl mr-3"></i>
           <div>
             <div class="font-medium">${tier.tier_name}</div>
             <div class="text-sm text-theme-text-secondary">
               ${tier.daily_gems_allowance} daily gems, max ${
          tier.max_gems_capacity
        }
             </div>
           </div>
         </div>
         <div class="font-semibold text-sm">
           <i class="fas fa-coins text-yellow-500 mr-1 text-sm"></i>${tier.actual_monthly_cost.toFixed(
             2
           )}/mo
         </div>
       `;

        // Determine whether to disable this card for two reasons:
        // 1. It is the current tier.
        // 2. The user does not have enough gold to cover the tier upgrade cost.
        if (
          tier.tier_name === currentTier ||
          currentGoldBalance < tier.actual_monthly_cost
        ) {
          card.classList.add("opacity-50");
          card.style.cursor = "not-allowed";
        } else {
          // The card is enabled: make it clickable.
          card.style.cursor = "pointer";
          card.addEventListener("click", () => {
            // When the card is clicked, proceed to update the user's tier.
            Data.update("users", "username", currentUsername, {
              type: tier.tier_name,
            })
              .then((updatedData) => {
                // Update local currentTier variable.
                currentTier = tier.tier_name;
                showPopup(
                  `Tier upgraded to "${tier.tier_name}". Benefits updated accordingly.`
                );
                updateUI();
              })
              .catch((error) => {
                console.error("Error upgrading tier:", error);
                showPopup("Error upgrading tier. Please try again.");
              });
          });
        }

        // Optionally, if the card is disabled because of gold, add an indicator.
        if (currentGoldBalance < tier.actual_monthly_cost) {
          const goldWarning = document.createElement("div");
          goldWarning.className = "text-xs text-red-500 mt-1";
          goldWarning.textContent = "Not enough gold!";
          card.appendChild(goldWarning);
        }

        tiersContainer.appendChild(card);
      });
    }
  }

  // Update conversion display
  const conversionDisplay = document.querySelector(
    "#getGems-content .flex.justify-between.items-center.mb-6"
  );
  if (conversionDisplay) {
    const conversionText = conversionDisplay.querySelector(
      ".text-theme-text-secondary.text-sm"
    );
    if (conversionText) {
      conversionText.textContent = "buys";
    }
  }

  // Update conversion input label
  const conversionLabel = document.querySelector(
    "#getGems-content label.block.text-sm.mb-2"
  );
  if (conversionLabel) {
    conversionLabel.textContent = "How many gems do you want to purchase?";
  }

  // Update conversion button text
  const convertButton = document.getElementById("convertButton");
  if (convertButton) {
    convertButton.textContent = "Purchase Gems";
  }

  // Update purchase calculations
  updatePurchaseCalculations(1);
}

function updatePurchaseCalculations(gemAmount) {
  // Compute available purchase slots based on user tier and current gems
  const availableSlots = Math.max(0, maxGemCapacity - currentGemBalance);
  // Clamp gemAmount to the available slots
  const restrictedAmount = Math.min(gemAmount, availableSlots);

  // Calculate the gold cost for the (restricted) gem purchase
  const goldCost = restrictedAmount * goldPerGem;

  // Update cost and gems-to-receive displays
  safelyUpdateElement("goldCost", goldCost);
  safelyUpdateElement("gemsToPurchase", restrictedAmount);

  // Also update the on-screen display of max purchasable gems using both available gold and available slot limits
  const availableByGold = Math.floor(currentGoldBalance / goldPerGem);
  safelyUpdateElement(
    "maxPurchaseAmount",
    Math.min(availableByGold, availableSlots)
  );

  // Enable/disable the purchase button if the gold cost exceeds current gold or if no gems can be purchased (i.e. restrictedAmount is 0)
  const purchaseButton = document.getElementById("purchaseButton");
  if (purchaseButton) {
    purchaseButton.disabled =
      goldCost > currentGoldBalance || restrictedAmount <= 0;
  }
}

// Function to set up tab switching
function setupTabs() {
  // Initialize tab indicator
  const activeTab = document.querySelector(".tab.active");
  const indicator = document.getElementById("tab-indicator");

  if (activeTab && indicator) {
    const tabWidth = activeTab.offsetWidth;
    const tabLeft = activeTab.offsetLeft;
    indicator.style.width = `${tabWidth}px`;
    indicator.style.left = `${tabLeft}px`;
  }

  // Add click handlers to tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs
      document.querySelectorAll(".tab").forEach((t) => {
        t.classList.remove("active");
      });

      // Add active class to clicked tab
      this.classList.add("active");

      // Update indicator position
      const tabWidth = this.offsetWidth;
      const tabLeft = this.offsetLeft;
      const indicator = document.getElementById("tab-indicator");
      if (indicator) {
        indicator.style.width = `${tabWidth}px`;
        indicator.style.left = `${tabLeft}px`;
      }

      // Hide all content
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });

      // Show selected content
      const targetId = `${this.dataset.tab}-content`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add("active");
      } else {
        console.error(`Content with ID "${targetId}" not found`);
      }
    });
  });
}

// Function to set up purchase controls
function setupPurchaseControls() {
  const minusBtn = document.getElementById("purchaseMinus");
  const plusBtn = document.getElementById("purchasePlus");
  const purchaseInput = document.getElementById("purchaseInput");
  const purchaseButton = document.getElementById("purchaseButton");

  if (minusBtn && purchaseInput) {
    minusBtn.addEventListener("click", () => {
      let currentVal = parseInt(purchaseInput.value, 10);
      if (currentVal > 1) {
        currentVal -= 1;
        purchaseInput.value = currentVal;
        updatePurchaseCalculations(currentVal);
      }
    });
  }

  if (plusBtn && purchaseInput) {
    plusBtn.addEventListener("click", () => {
      let currentVal = parseInt(purchaseInput.value, 10);
      const availableByGold = Math.floor(currentGoldBalance / goldPerGem);
      // Calculate the available purchase slots accounting for already held gems
      const availableSlots = Math.max(0, maxGemCapacity - currentGemBalance);
      const maxAllowed = Math.min(availableByGold, availableSlots);
      if (currentVal < maxAllowed) {
        currentVal += 1;
        purchaseInput.value = currentVal;
        updatePurchaseCalculations(currentVal);
      }
    });
  }

  if (purchaseInput) {
    purchaseInput.addEventListener("input", () => {
      let currentVal = parseInt(purchaseInput.value, 10) || 0;
      const availableSlots = Math.max(0, maxGemCapacity - currentGemBalance);
      if (currentVal > availableSlots) {
        currentVal = availableSlots;
        purchaseInput.value = currentVal;
      }
      updatePurchaseCalculations(currentVal);
    });
  }

  if (purchaseButton) {
    purchaseButton.addEventListener("click", () => {
      const gemAmount = parseInt(purchaseInput.value, 10);
      if (gemAmount > 0) {
        purchaseButton.disabled = true;
        purchaseGems(gemAmount).finally(() => {
          purchaseButton.disabled = false;
        });
      }
    });
  }
}
