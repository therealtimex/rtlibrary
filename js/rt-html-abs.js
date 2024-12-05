function copyToClipboard() {
    const messageContent = document.getElementById('message').value;
    navigator.clipboard.writeText(messageContent)
        .then(() => {
            const copyBtn = document.querySelector('.btn');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span>✓</span> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text to clipboard');
        });
}

function sendSMS() {
    const phoneNumber = document.querySelector('.email-field:nth-child(4)').textContent.trim();
    const messageContent = document.getElementById('message').value;
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    
    if (cleanPhone) {
        const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(messageContent)}`;
        window.open(smsUrl);
    } else {
        alert('No valid phone number found');
    }
}

function callCP() {
    const phoneNumber = document.querySelector('.email-field:nth-child(4)').textContent.trim();
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    
    if (cleanPhone) {
        window.open(`tel:${cleanPhone}`);
    } else {
        alert('No valid phone number found');
    }
}

function callSIM() {
    const phoneNumber = document.querySelector('.email-field:nth-child(4)').textContent.trim();
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    
    if ('EasySIM' in window) {
        window.EasySIM.dial(cleanPhone);
    } else {
        // Fallback to regular call if EasySIM is not available
        window.open(`tel:${cleanPhone}`);
    }
}

// Add event listeners for better keyboard accessibility
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
});