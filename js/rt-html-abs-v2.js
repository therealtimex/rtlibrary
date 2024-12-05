// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Clipboard Operations
async function copyToClipboard(text) {
    try {
        if (!navigator.clipboard) {
            throw new Error('Clipboard API not available');
        }
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Clipboard operation failed:', error);
        return false;
    }
}

function updateCopyButton(button, originalText) {
    button.innerHTML = '✓ Copied!';
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}

async function copyContactInfo(type) {
    const content = type === 'phone' ? '{phone}' : '{email}';
    const success = await copyToClipboard(content);
    if (success) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} has been copied!`);
    } else {
        alert(`Failed to copy ${type}. Please try again.`);
    }
}

// Communication Functions
function sendSMS() {
    const phoneNumber = document.querySelector('.email-field:nth-child(4)').textContent.trim();
    const messageContent = document.getElementById('message').value;
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    if (validatePhoneNumber(cleanPhone)) {
        const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(messageContent)}`;
        window.open(smsUrl);
    } else {
        alert('No valid phone number found');
    }
}

function callPhone(useEasySIM = false) {
    const phoneNumber = document.querySelector('.email-field:nth-child(4)').textContent.trim();
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    if (validatePhoneNumber(cleanPhone)) {
        if (useEasySIM && 'EasySIM' in window) {
            window.EasySIM.dial(cleanPhone);
        } else {
            window.open(`tel:${cleanPhone}`);
        }
    } else {
        alert('No valid phone number found');
    }
}

function sendEmail() {
    const recipient = document.querySelector('[aria-labelledby="to-label"]').textContent;
    const subject = document.querySelector('[aria-labelledby="subject-label"]').textContent;
    const body = document.getElementById('message').value;
    if (validateEmail(recipient)) {
        const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
    } else {
        alert('Invalid email address');
    }
}

// Contact Data Handling
function getContactData() {
    const data = {};
    const fields = ['id', 'name', 'phone', 'email', 'address', 'description', 'status'];
    
    for (const field of fields) {
        const element = document.getElementById(`contact${field.charAt(0).toUpperCase() + field.slice(1)}`);
        data[field] = element?.textContent?.trim() || '';
    }
    return data;
}

function generateVCard() {
    const contact = getContactData();
    const escape = (str) => str.replace(/[\\,;]/g, '\\$&');
    
    return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${escape(contact.name)}`,
        `TEL;TYPE=CELL:${escape(contact.phone)}`,
        `EMAIL;TYPE=WORK:${escape(contact.email)}`,
        `ADR;TYPE=WORK:;;${escape(contact.address)}`,
        `NOTE:${escape(contact.description)}`,
        'END:VCARD'
    ].join('\n');
}

// Contact Operations
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
        alert('Failed to download contact. Please try again.');
    }
}

async function copyContact() {
    try {
        const vcard = generateVCard();
        const success = await copyToClipboard(vcard);
        if (success) {
            alert('Contact information copied to clipboard!');
        } else {
            throw new Error('Clipboard operation failed');
        }
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

// Accessibility
function setupKeyboardNavigation() {
    const elements = document.querySelectorAll('button, a, input, [tabindex="0"]');
    elements.forEach(element => {
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupKeyboardNavigation();
    
    const copyBtn = document.querySelector('.btn');
    copyBtn.addEventListener('click', debounce(() => {
        const messageContent = document.getElementById('message').value;
        copyToClipboard(messageContent).then(success => {
            if (success) {
                updateCopyButton(copyBtn, copyBtn.innerHTML);
            } else {
                alert('Failed to copy text to clipboard');
            }
        });
    }, 300));
    
    document.getElementById('sendSMSBtn').addEventListener('click', debounce(sendSMS, 300));
    document.getElementById('callCPBtn').addEventListener('click', debounce(() => callPhone(false), 300));
    document.getElementById('callSIMBtn').addEventListener('click', debounce(() => callPhone(true), 300));
    document.getElementById('sendEmailBtn').addEventListener('click', debounce(sendEmail, 300));
    document.getElementById('copyPhoneBtn').addEventListener('click', debounce(() => copyContactInfo('phone'), 300));
    document.getElementById('copyEmailBtn').addEventListener('click', debounce(() => copyContactInfo('email'), 300));
    document.getElementById('addToContactsBtn').addEventListener('click', debounce(addToContacts, 300));
    document.getElementById('downloadContactBtn').addEventListener('click', debounce(downloadContact, 300));
    document.getElementById('copyContactBtn').addEventListener('click', debounce(copyContact, 300));
    document.getElementById('shareContactBtn').addEventListener('click', debounce(shareContact, 300));
});