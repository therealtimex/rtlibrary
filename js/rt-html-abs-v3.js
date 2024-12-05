// Replace alert() with showRTDialog()
function showRTDialog(message) {
    const dialog = document.getElementById('rtDialog');
    const closeBtn = dialog.querySelector('.close-btn');
    const messageEl = dialog.querySelector('#rtMessage');
    
    messageEl.textContent = message;
    dialog.showModal();

    closeBtn.onclick = () => dialog.close();
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
    });
}

// Utility Functions
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

// Clipboard Operations
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}

function updateCopyButton(button, originalText) {
    button.innerHTML = '✓ Copied!';
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}

// Communication Functions
function sendSMS() {
    const phoneNumber = document.querySelector('.email-field:nth-child(4)').textContent.trim();
    const messageContent = document.getElementById('message').value;
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    if (cleanPhone) {
        const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(messageContent)}`;
        window.open(smsUrl);
    } else {
        showRTDialog('No valid phone number found');
    }
}

function callPhone(useEasySIM = false) {
    const phoneNumber = document.querySelector('.email-field:nth-child(4)').textContent.trim();
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    if (cleanPhone) {
        if (useEasySIM && 'EasySIM' in window) {
            window.EasySIM.dial(cleanPhone);
        } else {
            window.open(`tel:${cleanPhone}`);
        }
    } else {
        showRTDialog('No valid phone number found');
    }
}

function sendEmail() {
    const recipient = document.querySelector('[aria-labelledby="to-label"]').textContent;
    const subject = document.querySelector('[aria-labelledby="subject-label"]').textContent;
    const body = document.getElementById('message').value;
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
}

// Contact Operations
async function copyContactInfo(type) {
    const content = type === 'phone' ? '{phone}' : '{email}';
    const success = await copyToClipboard(content);
    if (success) {
        showRTDialog(`${type.charAt(0).toUpperCase() + type.slice(1)} has been copied!`);
    } else {
        showRTDialog(`Failed to copy ${type}. Please try again.`);
    }
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
        showRTDialog('Failed to add contact. Please try again.');
    }
}

async function downloadContact() {
    try {
        const contact = getContactData();
        const vcard = generateVCard();
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${contact.name || 'contact'}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading contact:', error);
        showRTDialog('Failed to download contact. Please try again.');
    }
}

async function copyContact() {
    try {
        const vcard = generateVCard();
        const success = await copyToClipboard(vcard);
        if (success) {
            showRTDialog('Contact information copied to clipboard!');
        } else {
            throw new Error('Clipboard operation failed');
        }
    } catch (error) {
        console.error('Error copying contact:', error);
        showRTDialog('Failed to copy contact. Please try again.');
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
            showRTDialog('Sharing is not supported on this device');
        } else {
            showRTDialog('Failed to share contact. Please try again.');
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.querySelector('.btn');
    copyBtn.addEventListener('click', async () => {
        const messageContent = document.getElementById('message').value;
        const success = await copyToClipboard(messageContent);
        if (success) {
            updateCopyButton(copyBtn, copyBtn.innerHTML);
        } else {
            showRTDialog('Failed to copy text to clipboard');
        }
    });

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });

    document.getElementById('sendSMSBtn').addEventListener('click', sendSMS);
    document.getElementById('callCPBtn').addEventListener('click', () => callPhone(false));
    document.getElementById('callSIMBtn').addEventListener('click', () => callPhone(true));
    document.getElementById('sendEmailBtn').addEventListener('click', sendEmail);
    document.getElementById('copyPhoneBtn').addEventListener('click', () => copyContactInfo('phone'));
    document.getElementById('copyEmailBtn').addEventListener('click', () => copyContactInfo('email'));
    document.getElementById('addToContactsBtn').addEventListener('click', addToContacts);
    document.getElementById('downloadContactBtn').addEventListener('click', downloadContact);
    document.getElementById('copyContactBtn').addEventListener('click', copyContact);
    document.getElementById('shareContactBtn').addEventListener('click', shareContact);
});