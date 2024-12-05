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

function sendEmail() {
    const recipient = document.querySelector('[aria-labelledby="to-label"]').textContent;
    const subject = document.querySelector('[aria-labelledby="subject-label"]').textContent;
    const body = document.getElementById('message').value;
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
}

function getContactData() {
    return {
        id: document.getElementById('contactId').textContent,
        name: document.getElementById('contactName').textContent,
        phone: document.getElementById('contactPhone').textContent,
        email: document.getElementById('contactEmail').textContent,
        address: document.getElementById('contactAddress').textContent,
        description: document.getElementById('contactDescription').textContent,
        status: document.getElementById('contactStatus').textContent
    };
}

function generateVCard() {
    const contact = getContactData();
    return `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
TEL;TYPE=CELL:${contact.phone}
EMAIL;TYPE=WORK:${contact.email}
ADR;TYPE=WORK:;;${contact.address}
NOTE:${contact.description}
END:VCARD`;
}

async function addToContacts() {
    try {
        const vcard = generateVCard();
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const vcfUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = vcfUrl;
        link.download = `${getContactData().name || 'contact'}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(vcfUrl);
    } catch (error) {
        console.error('Error adding contact:', error);
        alert('Failed to add contact. Please try again.');
    }
}

async function copyContact() {
    try {
        const vcard = generateVCard();
        await navigator.clipboard.writeText(vcard);
        alert('Contact information copied to clipboard!');
    } catch (error) {
        console.error('Error copying contact:', error);
        alert('Failed to copy contact. Please try again.');
    }
}

async function shareContact() {
    try {
        const contact = getContactData();
        const vcard = generateVCard();
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const file = new File([blob], `${contact.name || 'contact'}.vcf`, {
            type: 'text/vcard'
        });

        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: `Contact: ${contact.name}`,
            });
        } else if (navigator.share) {
            await navigator.share({
                title: `Contact: ${contact.name}`,
                text: `Name: ${contact.name}\nPhone: ${contact.phone}\nEmail: ${contact.email}\nAddress: ${contact.address}`
            });
        } else {
            throw new Error('Sharing not supported');
        }
    } catch (error) {
        console.error('Error sharing contact:', error);
        if (error.message === 'Sharing not supported') {
            alert('Sharing is not supported on this device');
        } else {
            alert('Failed to share contact. Please try again.');
        }
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