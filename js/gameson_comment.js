// Add event listeners to edit and delete buttons (unchanged)
function addButtonEventListeners() {
    document.querySelectorAll('.edit-review').forEach(button => {
      button.addEventListener('click', function () {
        const reviewId = this.getAttribute('data-review-id');
        const reviewElement = this.closest('.flex-1');
        const contentElement = reviewElement.querySelector('p');
        const ratingElement = reviewElement.querySelector('.flex.mt-1');
        const currentContent = contentElement.textContent;
        const currentRating = ratingElement ? ratingElement.querySelectorAll('.star-filled').length : 0;

        const reviewForm = document.getElementById('reviewForm');
        reviewForm.style.display = 'block';

        document.getElementById('reviewContent').value = currentContent;
        document.querySelector(`input[name="rating"][value="${currentRating}"]`).checked = true;
        document.querySelector(`input[name="rating"][value="${currentRating}"]`).dispatchEvent(new Event('change'));

        const submitButton = document.getElementById('submitReview');
        const submitText = document.getElementById('submitText');
        submitText.textContent = 'Update';

        submitButton.setAttribute('data-review-id', reviewId);
        submitButton.setAttribute('data-mode', 'edit');

        reviewForm.scrollIntoView({ behavior: 'smooth' });
      });
    });

    document.querySelectorAll('.delete-review').forEach(button => {
      button.addEventListener('click', function () {
        const reviewId = this.getAttribute('data-review-id');
        if (confirm('Are you sure you want to delete this review?')) {
          Data.delete('comments', 'comment_id', reviewId)
            .then(() => {
              document.getElementById('successMessage').classList.remove('hidden');
              setTimeout(() => {
                document.getElementById('successMessage').classList.add('hidden');
              }, 5000);
            })
            .catch(error => {
              showError('Failed to delete review. Please try again.');
            });
        }
      });
    });
  }

  // Check if current user is the game creator
  const isGameCreator = currentUsername === gameCreatorUsername;

  // Disable tip toggle if user is the game creator
  if (isGameCreator) {
    const tipToggle = document.getElementById('tipToggle');
    tipToggle.disabled = true;

    // Add a note explaining why it's disabled
    const tipToggleContainer = tipToggle.closest('.flex.items-center');
    const noteElement = document.createElement('span');
    noteElement.className = 'text-xs text-theme-text-secondary ml-2';
    // noteElement.textContent = '(Disabled for game creators)';
    tipToggleContainer.appendChild(noteElement);
  }

  // Toggle tip section
  const tipToggle = document.getElementById('tipToggle');
  const tipSection = document.getElementById('tipSection');
  const tipChevron = document.getElementById('tipChevron');

  // Set initial state - tip section is hidden by default
  tipSection.style.display = 'none';

  tipToggle.addEventListener('change', function () {
    if (this.checked) {
      // Show the tip section
      tipSection.style.display = 'block';
      // Add the active class after a small delay to allow for display change
      setTimeout(() => {
        tipSection.classList.add('active');
      }, 10);
      tipChevron.style.transform = 'rotate(180deg)';
    } else {
      // Hide immediately without animation
      tipSection.classList.remove('active');
      tipSection.style.display = 'none';
      tipChevron.style.transform = 'rotate(0)';
      tipAmount = 0;
      updateBalanceAfterTip();
    }
  });

  // Handle tip amount selection
  document.querySelectorAll('.tip-amount-btn').forEach(button => {
    button.addEventListener('click', function () {
      const amount = parseInt(this.getAttribute('data-amount'));

      // Check if amount exceeds balance
      if (amount > userBalance) {
        showError('Tip amount cannot exceed your current balance.');
        return;
      }

      document.querySelectorAll('.tip-amount-btn').forEach(btn => {
        btn.classList.remove('bg-yellow-100');
      });
      this.classList.add('bg-yellow-100');
      tipAmount = amount;
      document.getElementById('customTipAmount').value = '';
      updateBalanceAfterTip();
    });
  });

  // Handle custom tip amount
  document.getElementById('customTipAmount').addEventListener('input', function () {
    if (this.value) {
      const amount = parseInt(this.value);

      // Restrict to current balance
      if (amount > userBalance) {
        this.value = userBalance;
        tipAmount = userBalance;
      } else {
        tipAmount = amount;
      }

      document.querySelectorAll('.tip-amount-btn').forEach(btn => {
        btn.classList.remove('bg-yellow-100');
      });
      updateBalanceAfterTip();
    } else {
      tipAmount = 0;
      updateBalanceAfterTip();
    }
  });

  // Handle form submission
  document.getElementById('submitReview').addEventListener('click', function () {
    const reviewContent = document.getElementById('reviewContent').value.trim();
    const submitButton = document.getElementById('submitReview');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const submitText = document.getElementById('submitText');
    const mode = submitButton.getAttribute('data-mode') || 'create';
    const reviewId = submitButton.getAttribute('data-review-id');
    const includeTip = document.getElementById('tipToggle').checked;

    if (!reviewContent) {
      showError('Please enter a review before submitting.');
      return;
    }

    if (includeTip && tipAmount <= 0) {
      showError('Please select or enter a tip amount.');
      return;
    }

    if (includeTip && tipAmount > userBalance) {
      showError('Insufficient balance for the tip amount.');
      return;
    }

    submitButton.disabled = true;
    submitButton.classList.add('opacity-75');
    loadingIndicator.classList.remove('hidden');
    submitText.textContent = mode === 'edit' ? 'Updating...' : 'Submitting...';

    const payload = {
      content: reviewContent,
      rating: userRating,
      game_id: parseInt(gameId),
      username: currentUsername
    };

    // If tip is included, add gold_tip to payload
    if (includeTip && tipAmount > 0) {
      payload.gold_tip = tipAmount;
      payload.creator_username = gameCreatorUsername;
    }

    const apiCall = mode === 'edit'
      ? Data.update('comments', 'comment_id', reviewId, payload)
      : Data.create('comments', payload);

    apiCall
      .then(response => {
        document.getElementById('successMessage').classList.remove('hidden');
        setTimeout(() => {
          document.getElementById('successMessage').classList.add('hidden');
        }, 5000);

        document.getElementById('reviewContent').value = '';
        submitButton.removeAttribute('data-mode');
        submitButton.removeAttribute('data-review-id');
        submitText.textContent = 'Submit';

        // Reset tip section
        document.getElementById('tipToggle').checked = false;
        tipSection.classList.remove('active');
        tipSection.style.display = 'none';
        tipChevron.style.transform = 'rotate(0)';
        document.querySelectorAll('.tip-amount-btn').forEach(btn => {
          btn.classList.remove('bg-yellow-100');
        });
        document.getElementById('customTipAmount').value = '';

        // Update user balance if tip was included
        if (includeTip) {
          userBalance -= tipAmount;
          document.getElementById('userBalance').textContent = userBalance;
          tipAmount = 0;
          updateBalanceAfterTip();
        }

        submitButton.disabled = false;
        submitButton.classList.remove('opacity-75');
        loadingIndicator.classList.add('hidden');
      })
      .catch(error => {
        showError('Failed to process review. Please try again.');
        submitButton.disabled = false;
        submitButton.classList.remove('opacity-75');
        loadingIndicator.classList.add('hidden');
        submitText.textContent = mode === 'edit' ? 'Update' : 'Submit';
      });
  });

