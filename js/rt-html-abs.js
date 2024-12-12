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

function showBreakdown() {
    document.getElementById('breakdownDialog').showModal();
}

function closeBreakdown() {
    document.getElementById('breakdownDialog').close();
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


function callPhone(element) {
    const actionData = {
        actionID: 9001,
        orderNumber: 1,
        phone: element.getAttribute('data-phone'),
        type: 'act_call'
    };
    var json = JSON.stringify(actionData);
    App.callActionButton(json);
}

function sendSMS(element) {
    const actionData = {
        actionID: 9002,
        orderNumber: 1,
        phone: element.getAttribute('data-phone'),
        defaultMsg: element.getAttribute('data-default-msg'),
        type: 'act_sms'
    };
    var json = JSON.stringify(actionData);
    App.callActionButton(json);
}

function openLocation(element) {
    const actionData = {
        actionID: 9003,
        orderNumber: 1,
        name: element.getAttribute('data-name'),
        lat: parseFloat(element.getAttribute('data-lat')),
        lon: parseFloat(element.getAttribute('data-lon')),
        mapType: element.getAttribute('data-map-type'),
        type: 'act_gps'
    };
    var json = JSON.stringify(actionData);
    App.callActionButton(json);
}

function shareContent(element) {
    const actionData = {
        actionID: 9004,
        orderNumber: 1,
        copy: element.getAttribute('data-copy') === 'true',
        body: element.getAttribute('data-body'),
        fileName: element.getAttribute('data-filename'),
        subject: element.getAttribute('data-subject'),
        type: 'act_share'
    };
    var json = JSON.stringify(actionData);
    App.callActionButton(json);
}

function callCloudPhone(element) {
    const actionData = {
        actionID: 9005,
        orderNumber: 1,
        phone: element.getAttribute('data-phone'),
        isVideoCall: element.getAttribute('data-video-call') === 'true',
        isCallOut: element.getAttribute('data-call-out') === 'true',
        customData: JSON.parse(element.getAttribute('data-custom-data')),
        type: 'act_call_cloudphone'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function openForm(element) {
    const actionData = {
        actionID: 9006,
        orderNumber: 1,
        familyID: element.getAttribute('data-family-id'),
        dismissParent: element.getAttribute('data-dismiss-parent') === 'true',
        dependencies: JSON.parse(element.getAttribute('data-dependencies')),
        preload: JSON.parse(element.getAttribute('data-preload')),
        openArgs: JSON.parse(element.getAttribute('data-open-args')),
        preload_repeat: JSON.parse(element.getAttribute('data-preload-repeat')),
        type: 'act_fill_form'
    };
    var json = JSON.stringify(actionData);
    App.callActionButton(json);
}

function openReport(element) {
    const actionData = {
        actionID: 9007,
        orderNumber: 1,
        reportID: element.getAttribute('data-report-id'),
        type: 'act_report'
    };
    var json = JSON.stringify(actionData);
    App.callActionButton(json);
}

function openDMView(element) {
    const actionData = {
        actionID: 9008,
        orderNumber: 1,
        subModule: element.getAttribute('data-sub-module'),
        component: element.getAttribute('data-component'),
        object: element.getAttribute('data-object'),
        alias: element.getAttribute('data-alias'),
        screen: element.getAttribute('data-screen'),
        where: element.getAttribute('data-where'),
        get: JSON.parse(element.getAttribute('data-get') || '{}'),
        post: JSON.parse(element.getAttribute('data-post') || '{}'),
        args: JSON.parse(element.getAttribute('data-args') || '{}'),
        dismissParent: element.getAttribute('data-dismiss-parent') === 'true',
        type: 'act_dm_view'
    };
    var json = JSON.stringify(actionData);
    App.callActionButton(json);
}

function getInstance(element) {
    const actionData = {
        actionID: 9009,
        orderNumber: 1,
        familyName: element.getAttribute('data-family-name'),
        display: element.getAttribute('data-display'),
        uuid: element.getAttribute('data-uuid'),
        isLast: element.getAttribute('data-is-last') === 'true',
        clone: element.getAttribute('data-clone') === 'true',
        removeQuestions: JSON.parse(element.getAttribute('data-remove-questions') || '[]'),
        filter: JSON.parse(element.getAttribute('data-filter') || '[]'),
        openArgs: JSON.parse(element.getAttribute('data-open-args') || '{}'),
        type: 'act_get_instance'
    };
    App.callActionButton(JSON.stringify(actionData));
}

function openModule(element) {
    const actionData = {
        actionID: 9010,
        orderNumber: 1,
        destinationCode: element.getAttribute('data-destination-code'),
        destinationType: element.getAttribute('data-destination-type'),
        args: JSON.parse(element.getAttribute('data-args') || '{}'),
        dismissParent: element.getAttribute('data-dismiss-parent') === 'true',
        type: 'act_open_module'
    };
    var json = JSON.stringify(actionData);
    App.callActionButton(json);
}

function openChat(element) {
    const actionData = {
        actionID: 9011,
        orderNumber: 1,
        room_target: element.getAttribute('data-room-target'),
        room_title: element.getAttribute('data-room-title'),
        type: 'act_open_chat'
    };
    var json = JSON.stringify(actionData);
    App.callActionButton(json);
}

function openDeeplink(element) {
    const actionData = {
        actionID: 9012,
        orderNumber: 1,
        deepLink: element.getAttribute('data-deep-link'),
        packageName: element.getAttribute('data-package-name'),
        type: 'act_open_deeplink'
    };
    var json = JSON.stringify(actionData);
    App.callActionButton(json);
}

function downloadVCard() {
    const vCardContent = document.getElementById('vcardTemplate').textContent;
    
    const fnMatch = vCardContent.match(/FN;CHARSET=utf-8:(.*)/);
    const filename = fnMatch ? fnMatch[1].trim() : 'contact';
    
    const blob = new Blob([vCardContent], { 
        type: 'text/vcard;charset=utf-8'
    });
    
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = `${filename}.vcf`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(downloadUrl);
}

window.onload = function() {
    const button = document.getElementById('downloadButton');
    if (button) {
        button.addEventListener('click', downloadVCard);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn, .btn-shade');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const handler = e.target.getAttribute('onclick');
            if (handler) {
                eval(handler.replace('this', 'e.target'));
            }
        });
    });
})  ;