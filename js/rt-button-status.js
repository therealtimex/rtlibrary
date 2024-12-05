// Button status management
function updateButtonStatus(button, status, duration = 2000) {
    const originalText = button.innerHTML;
    const originalDisabled = button.disabled;
    button.innerHTML = status;
    button.disabled = true;
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = originalDisabled;
    }, duration);
}

// Event handlers initialization
function initializeButtonHandlers() {
    document.getElementById('copyPhoneBtn').addEventListener('click', async (e) => {
        const phone = document.getElementById('contactPhone').textContent;
        const success = await copyToClipboard(phone, e.target);
        if (success) {
            updateButtonStatus(e.target, '✓ Copied!', 1500);
        } else {
            updateButtonStatus(e.target, '❌ Failed', 1500);
        }
    });

    document.getElementById('copyEmailBtn').addEventListener('click', async (e) => {
        const email = document.getElementById('contactEmail').textContent;
        const success = await copyToClipboard(email, e.target);
        if (success) {
            updateButtonStatus(e.target, '✓ Copied!', 1500);
        } else {
            updateButtonStatus(e.target, '❌ Failed', 1500);
        }
    });

    document.getElementById('addToContactsBtn').addEventListener('click', async (e) => {
        try {
            await addToContacts();
            updateButtonStatus(e.target, '✓ Added!');
        } catch {
            updateButtonStatus(e.target, '❌ Failed', 1500);
        }
    });

    document.getElementById('copyContactBtn').addEventListener('click', async (e) => {
        try {
            await copyContact();
            updateButtonStatus(e.target, '✓ Copied!');
        } catch {
            updateButtonStatus(e.target, '❌ Failed', 1500);
        }
    });

    document.getElementById('shareContactBtn').addEventListener('click', async (e) => {
        try {
            await shareContact();
            updateButtonStatus(e.target, '✓ Shared!');
        } catch {
            updateButtonStatus(e.target, '❌ Failed', 1500);
        }
    });

    document.getElementById('downloadContactBtn').addEventListener('click', async (e) => {
        try {
            await downloadContact();
            updateButtonStatus(e.target, '✓ Downloaded!');
        } catch {
            updateButtonStatus(e.target, '❌ Failed', 1500);
        }
    });

    // Keyboard accessibility
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
}

// Initialize handlers when DOM is ready
document.addEventListener('DOMContentLoaded', initializeButtonHandlers);