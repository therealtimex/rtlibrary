// Define messages 
const phoneMessages = {
    'en': {
        notFound: 'Phone number element not found',
        invalid: 'No valid phone number found'
    },
    'vi': {
        notFound: 'Không tìm thấy phần tử số điện thoại',
        invalid: 'Không tìm thấy số điện thoại hợp lệ'
    },
    'fr': {
        notFound: 'Élément de numéro de téléphone introuvable',
        invalid: 'Aucun numéro de téléphone valide trouvé'
    },
    'el': {
        notFound: 'Το στοιχείο αριθμού τηλεφώνου δεν βρέθηκε',
        invalid: 'Δεν βρέθηκε έγκυρος αριθμός τηλεφώνου'
    }
};

const callMessages = {
    'en': {
        cloudFailed: 'Failed to initiate Internet call',
        simFailed: 'Failed to initiate phone call'
    },
    'vi': {
        cloudFailed: 'Không thể thực hiện cuộc gọi Internet',
        simFailed: 'Không thể thực hiện cuộc gọi điện thoại'
    },
    'fr': {
        cloudFailed: 'Échec de l\'initiation de l\'appel Internet',
        simFailed: 'Échec de l\'initiation de l\'appel téléphonique'
    },
    'el': {
        cloudFailed: 'Αποτυχία έναρξης κλήσης διαδικτύου',
        simFailed: 'Αποτυχία έναρξης τηλεφωνικής κλήσης'
    }
};

const copyMessages = {
    'en': {
        phoneCopied: 'Phone number has been copied!',
        emailCopied: 'Email has been copied!',
        phoneFailed: 'Failed to copy phone number. Please try again.',
        emailFailed: 'Failed to copy email. Please try again.'
    },
    'vi': {
        phoneCopied: 'Đã sao chép số điện thoại!',
        emailCopied: 'Đã sao chép email!',
        phoneFailed: 'Không thể sao chép số điện thoại. Vui lòng thử lại.',
        emailFailed: 'Không thể sao chép email. Vui lòng thử lại.'
    },
    'fr': {
        phoneCopied: 'Le numéro de téléphone a été copié!',
        emailCopied: 'L\'email a été copié!',
        phoneFailed: 'Échec de la copie du numéro de téléphone. Veuillez réessayer.',
        emailFailed: 'Échec de la copie de l\'email. Veuillez réessayer.'
    },
    'el': {
        phoneCopied: 'Ο αριθμός τηλεφώνου αντιγράφηκε!',
        emailCopied: 'Το email αντιγράφηκε!',
        phoneFailed: 'Αποτυχία αντιγραφής αριθμού τηλεφώνου. Παρακαλώ προσπαθήστε ξανά.',
        emailFailed: 'Αποτυχία αντιγραφής email. Παρακαλώ προσπαθήστε ξανά.'
    }
};

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
        const lang = document.documentElement.lang || 'en';
        const message = phoneMessages[lang]?.invalid || nophone_messages['en'].invalid;
        showRTDialog(message);
    }
}


// Utility function to extract and clean phone number
function getCleanPhoneNumber(selector = '.email-field:nth-child(4)') {
    try {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error('notFound');
        }
        
        const phoneNumber = element.textContent.trim();
        const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
        
        if (!cleanPhone) {
            throw new Error('invalid');
        }
        
        return cleanPhone;
    } catch (error) {
        const lang = document.documentElement.lang || 'en';
        const messages = phoneMessages[lang] || phoneMessages['en'];
        const message = messages[error.message] || error.message;
        showRTDialog(message);
        return null;
    }
}

// VOIP cloud phone call function
function callCloudPhone() {
    const phoneNumber = getCleanPhoneNumber();
    if (phoneNumber) {
        try {
            window.open(`tel:${phoneNumber}`);
        } catch (error) {
            const lang = document.documentElement.lang || 'en';
            const message = callMessages[lang]?.cloudFailed || callMessages['en'].cloudFailed;
            showRTDialog(message);
        }
    }
}

// SIM card call function
function callSIM() {
    const phoneNumber = getCleanPhoneNumber();
    if (phoneNumber) {
        try {
            if ('EasySIM' in window) {
                window.EasySIM.dial(phoneNumber);
            } else {
                window.open(`tel:${phoneNumber}`);
            }
        } catch (error) {
            const lang = document.documentElement.lang || 'en';
            const message = callMessages[lang]?.simFailed || callMessages['en'].simFailed;
            showRTDialog(message);
        }
    }
}

function sendEmail() {
    try {
        // Get elements with error handling
        const recipientEl = document.querySelector('[aria-labelledby="to-label"]');
        const subjectEl = document.querySelector('[aria-labelledby="subject-label"]');
        const bodyEl = document.getElementById('message');

        if (!recipientEl || !subjectEl || !bodyEl) {
            throw new Error('Required email elements not found');
        }

        // Validate email format
        const recipient = recipientEl.textContent.trim();
        if (!recipient.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new Error('Invalid email address');
        }

        // Build mailto URL with sanitized inputs
        const mailtoUrl = new URL('mailto:' + recipient);
        mailtoUrl.searchParams.append('subject', subjectEl.textContent.trim());
        mailtoUrl.searchParams.append('body', bodyEl.value.trim());

        // Handle different platforms
        if ('canShare' in navigator && navigator.canShare()) {
            // Modern sharing API if available
            navigator.share({
                url: mailtoUrl.toString()
            }).catch(() => {
                // Fallback to traditional mailto
                openMailto(mailtoUrl.toString());
            });
        } else {
            openMailto(mailtoUrl.toString());
        }
    } catch (error) {
        console.error('Email error:', error);
        showRTDialog(error.message);
    }
}

function openMailto(url) {
    if (navigator?.app?.loadUrl) {
        navigator.app.loadUrl(url, { openExternal: true });
    } else {
        window.open(url, '_system');
    }
}

// Contact Operations
async function copyContactInfo(type) {
    const content = type === 'phone' ? '{phone}' : '{email}';
    
    const lang = document.documentElement.lang || 'en';
    const messages = copyMessages[lang] || copyMessages['en'];
    
    try {
        // Try modern Clipboard API first
        if (navigator.clipboard && navigator.permissions) {
            const permission = await navigator.permissions.query({ name: 'clipboard-write' });
            if (permission.state === 'granted') {
                await navigator.clipboard.writeText(content);
                const successKey = type === 'phone' ? 'phoneCopied' : 'emailCopied';
                showRTDialog(messages[successKey]);
                return;
            }
        }
        
        // Fallback to execCommand for iframe support
        const tempInput = document.createElement('input');
        tempInput.value = content;
        document.body.appendChild(tempInput);
        tempInput.select();
        const success = document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        if (success) {
            const successKey = type === 'phone' ? 'phoneCopied' : 'emailCopied';
            showRTDialog(messages[successKey]);
        } else {
            throw new Error('Copy failed');
        }
    } catch (error) {
        console.error('Copy error:', error);
        const failKey = type === 'phone' ? 'phoneFailed' : 'emailFailed';
        showRTDialog(messages[failKey]);
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
        if (!success) {
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
        
        // Check if navigator.share is available
        if (!navigator.share) {
            throw new Error('Sharing not supported');
        }

        // Try sharing with file first
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const file = new File([blob], `${contact.name || 'contact'}.vcf`, {
            type: 'text/vcard'
        });

        // Check if file sharing is supported
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: `Contact: ${contact.name}`,
                });
                return; // Exit if file share succeeds
            } catch (fileError) {
                console.log('File sharing failed, falling back to text share');
                // Continue to text sharing if file sharing fails
            }
        }

        // Fallback to text sharing
        await navigator.share({
            title: `Contact: ${contact.name}`,
            text: `Name: ${contact.name}\nPhone: ${contact.phone}\nEmail: ${contact.email}\nAddress: ${contact.address}`
        });

    } catch (error) {
        console.error('Error sharing contact:', error);
        if (error.message === 'Sharing not supported') {
            showRTDialog('Sharing is not supported on this device');
        } else if (error.name === 'NotAllowedError') {
            // Don't show error dialog if user cancelled sharing
            return;
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
    document.getElementById('callCPBtn').addEventListener('click', () => callCloudPhone);
    document.getElementById('callSIMBtn').addEventListener('click', () => callSIM);
    document.getElementById('sendEmailBtn').addEventListener('click', sendEmail);
    document.getElementById('copyPhoneBtn').addEventListener('click', () => copyContactInfo('phone'));
    document.getElementById('copyEmailBtn').addEventListener('click', () => copyContactInfo('email'));
    document.getElementById('addToContactsBtn').addEventListener('click', addToContacts);
    document.getElementById('downloadContactBtn').addEventListener('click', downloadContact);
    document.getElementById('copyContactBtn').addEventListener('click', copyContact);
    document.getElementById('shareContactBtn').addEventListener('click', shareContact);
});

