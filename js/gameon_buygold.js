// Function to show popup messages
function showPopup(message) {
  const popup = document.createElement("div");
  popup.className =
    "fixed bg-theme-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 text-wrap";
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
        const card = document.createElement("div");
        card.className =
          "border border-gray-200 rounded-lg p-3 flex flex-col mb-2";

        // Create the top row with the icon, tier name, and benefits.
        const topRow = document.createElement("div");
        topRow.className = "flex items-center justify-between";
        topRow.innerHTML = `
         <div class="flex items-center">
           <i class="fas fa-user-circle text-theme-primary text-xl mr-3"></i>
           <div>
             <div class="font-medium">${tier.tier_name}</div>
             <div class="text-sm text-theme-text-secondary">
               ${tier.daily_gems_allowance} daily gems, max ${tier.max_gems_capacity}
             </div>
           </div>
         </div>`;

        // Create the bottom row for the price
        const priceRow = document.createElement("div");
        priceRow.className = "font-semibold text-sm";
        priceRow.innerHTML = `
         <i class="fas fa-coins text-yellow-500 mr-1 text-sm"></i>${tier.actual_monthly_cost.toFixed(
           2
         )}/mo
       `;

        // Append the top row and price row into the card
        card.appendChild(topRow);
        card.appendChild(priceRow);

        // If the user does not have enough gold, create an extra row with the warning.
        if (currentGoldBalance < tier.actual_monthly_cost) {
          const warningRow = document.createElement("div");
          warningRow.className = "text-xs text-red-500 mt-1 text-right";
          warningRow.textContent = "Not enough gold";
          card.appendChild(warningRow);
        }

        // Check whether the tier is the current tier or if the user lacks enough gold.
        if (
          tier.tier_name === currentTier ||
          currentGoldBalance < tier.actual_monthly_cost
        ) {
          card.classList.add("opacity-50");
          card.style.cursor = "not-allowed";
        } else {
          // Otherwise, allow selection.
          card.style.cursor = "pointer";
          card.addEventListener("click", () => {
            // Clear previous selection styling.
            const allCards = tiersContainer.querySelectorAll("div.border");
            allCards.forEach((c) =>
              c.classList.remove("border-4", "border-theme-primary")
            );
            // Mark current card as selected.
            card.classList.add("border-4", "border-theme-primary");
            selectedTier = tier;
          });
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
  // Calculate available slots based on user's tier capacity and current gem balance.
  const availableSlots = Math.max(0, maxGemCapacity - currentGemBalance);

  // Clamp the desired purchase amount to available slots.
  const restrictedAmount = Math.min(gemAmount, availableSlots);

  // Calculate the gold cost.
  const goldCost = restrictedAmount * goldPerGem;

  // Update the cost and gems-to-receive displays.
  safelyUpdateElement("goldCost", goldCost);
  safelyUpdateElement("gemsToPurchase", restrictedAmount);

  // Update maxPurchaseAmount: the lower of gold-based limit and available slots.
  const availableByGold = Math.floor(currentGoldBalance / goldPerGem);
  safelyUpdateElement(
    "maxPurchaseAmount",
    Math.min(availableByGold, availableSlots)
  );

  // Enable or disable the purchase button.
  const purchaseButton = document.getElementById("purchaseButton");
  if (purchaseButton) {
    purchaseButton.disabled =
      goldCost > currentGoldBalance || restrictedAmount <= 0;
  }

  // Display note if conditions prevent a purchase.
  const purchaseNote = document.getElementById("purchaseNote");
  if (availableSlots === 0) {
    // User has reached their gem capacity.
    if (purchaseNote) {
      purchaseNote.textContent = "You have reached your gem capacity!";
    }
  } else if (goldCost > currentGoldBalance) {
    // Not enough gold.
    if (purchaseNote) {
      purchaseNote.textContent = "Not enough gold to purchase gems!";
    }
  } else {
    // Clear the note.
    if (purchaseNote) {
      purchaseNote.textContent = "";
    }
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
