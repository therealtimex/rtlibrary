// realtimecs-login.js
// Multi-language definitions
const LANG = {
    vi: {
        // Banner texts
        trial_mode_title: "Chế độ trải nghiệm",
        trial_mode_desc: "Bạn đang sử dụng phiên bản dùng thử. Dữ liệu sẽ bị xóa sau 7 ngày.",
        setup_btn: "Thiết lập",
        official_status: "Chính thức",
        settings_btn: "Cài đặt",

        // Welcome texts
        welcome_app: "Chào mừng đến với Realtime CS",
        app_description: "Hệ thống quản lý nhân sự thời gian thực",

        // Setup dialog
        setup_org_title: "Thiết lập tổ chức",
        setup_org_desc: "Chọn cách bạn muốn sử dụng Realtime CS",
        create_org_title: "Tạo tổ chức mới",
        create_org_desc: "Tạo workspace mới cho cửa hàng của bạn",
        join_org_title: "Gia nhập tổ chức",
        join_org_desc: "Tham gia workspace đã có sẵn",
        continue_trial: "Tiếp tục trải nghiệm",

        // Form labels
        org_name_label: "Tên tổ chức",
        org_name_placeholder: "Nhập tên cửa hàng/công ty",
        org_shortname_label: "Tên ngắn gọn (dưới 30 ký tự)",
        org_shortname_placeholder: "Tên rút gọn",
        business_type_label: "Loại hình kinh doanh",
        business_auto: "Sửa chữa ô tô",
        business_electronics: "Sửa chữa điện tử",
        business_ac: "Sửa chữa điều hòa",
        business_appliance: "Sửa chữa gia dụng",
        business_other: "Khác",
        contact_name_label: "Họ và tên",
        contact_email_label: "Email",
        contact_phone_label: "Số điện thoại",
        org_code_label: "Mã tổ chức",
        org_code_placeholder: "Nhập mã tổ chức",
        org_code_help: "Liên hệ quản trị viên của tổ chức để lấy mã mời",

        // Buttons
        back_btn: "Quay lại",
        create_org_btn: "Tạo tổ chức",
        join_btn: "Gia nhập",
        close_btn: "Đóng",
        confirm_btn: "Xác nhận",
        processing: "Đang xử lý...",
        sending: "Đang gửi...",
        request_join: "Yêu cầu tham gia",

        // Messages
        error_empty: "Vui lòng nhập mã tổ chức.",
        error_notfound: "Không tìm thấy tổ chức với mã này. Vui lòng kiểm tra lại.",
        error: "Đã xảy ra lỗi. Vui lòng thử lại sau!",
        trial_success: "Hệ thống đang xử lý yêu cầu sử dụng {appName} - Người dùng trải nghiệm cho <b>{user}</b>, vui lòng chờ hệ thống xác nhận thông tin và khởi tạo dữ liệu!",
        join_success: "Hệ thống đã gửi yêu cầu tham gia đến <b>{org}</b>, vui lòng chờ bộ phận Quản lý xác nhận!",
        notify: (org, email) => `Hệ thống đang xử lý yêu cầu Khởi tạo Tổ chức mới cho <b>${org}</b>, vui lòng chờ hệ thống xác nhận thông tin và khởi tạo dữ liệu!`,
        trial_mode_subtitle: "Bạn đang sử dụng chế độ trải nghiệm",
        official_mode_subtitle: "Phiên bản chính thức",
        settings_alert: "Chức năng cài đặt tổ chức sẽ được phát triển"
    },
    en: {
        // Banner texts
        trial_mode_title: "Trial Mode",
        trial_mode_desc: "You are using the trial version. Data will be deleted after 7 days.",
        setup_btn: "Setup",
        official_status: "Official",
        settings_btn: "Settings",

        // Welcome texts
        welcome_app: "Welcome to Realtime CS",
        app_description: "Real-time Human Resource Management System",

        // Setup dialog
        setup_org_title: "Organization Setup",
        setup_org_desc: "Choose how you want to use Realtime CS",
        create_org_title: "Create New Organization",
        create_org_desc: "Create a new workspace for your business",
        join_org_title: "Join Organization",
        join_org_desc: "Join an existing workspace",
        continue_trial: "Continue Trial",

        // Form labels
        org_name_label: "Organization Name",
        org_name_placeholder: "Enter company/store name",
        org_shortname_label: "Short Name (under 30 characters)",
        org_shortname_placeholder: "Short name",
        business_type_label: "Business Type",
        business_auto: "Auto Repair",
        business_electronics: "Electronics Repair",
        business_ac: "Air Conditioning Repair",
        business_appliance: "Appliance Repair",
        business_other: "Other",
        contact_name_label: "Full Name",
        contact_email_label: "Email",
        contact_phone_label: "Phone Number",
        org_code_label: "Organization Code",
        org_code_placeholder: "Enter organization code",
        org_code_help: "Contact the organization administrator to get the invitation code",

        // Buttons
        back_btn: "Back",
        create_org_btn: "Create Organization",
        join_btn: "Join",
        close_btn: "Close",
        confirm_btn: "Confirm",
        processing: "Processing...",
        sending: "Sending...",
        request_join: "Request to Join",

        // Messages
        error_empty: "Please enter organization code.",
        error_notfound: "Organization not found. Please check your code.",
        error: "An error occurred. Please try again later!",
        trial_success: "The system is processing the request to use {appName} - Trial User for <b>{user}</b>. Please wait for the system to confirm the information and initialize the data!",
        join_success: "The system has sent a join request to <b>{org}</b>. Please wait for admin approval!",
        notify: (org, email) => `We are processing your request to create the new organization <b>${org}</b>. Please wait for the system to confirm the information and initialize the data.`,
        trial_mode_subtitle: "You are using trial mode",
        official_mode_subtitle: "Official Version",
        settings_alert: "Organization settings feature will be developed"
    }
};

// Global variables
let userType = 'unidentified';
let foundOrg = null;
let isTrialMode = false;
let currentLang, T, config;

// Apply language to all elements
function applyLanguage() {
    // Set HTML lang attribute
    document.documentElement.lang = currentLang;

    // Update banner texts
    document.getElementById('trial-mode-title').textContent = T.trial_mode_title;
    document.getElementById('trial-mode-desc').textContent = T.trial_mode_desc;
    document.getElementById('btn-setup-trial').textContent = T.setup_btn;
    document.getElementById('official-status').textContent = T.official_status;
    document.getElementById('btn-org-settings').textContent = T.settings_btn;

    // Update welcome texts
    // document.getElementById('welcome-message').textContent = T.welcome_app;

    // Update setup dialog
    document.getElementById('setup-org-title').textContent = T.setup_org_title;
    document.getElementById('setup-org-desc').textContent = T.setup_org_desc;
    document.getElementById('create-org-title').textContent = T.create_org_title;
    document.getElementById('create-org-desc').textContent = T.create_org_desc;
    document.getElementById('join-org-title').textContent = T.join_org_title;
    document.getElementById('join-org-desc').textContent = T.join_org_desc;
    document.getElementById('btn-continue-trial').textContent = T.continue_trial;

    // Update form labels
    document.getElementById('org-name-label').textContent = T.org_name_label;
    document.getElementById('org-name-input').placeholder = T.org_name_placeholder;
    document.getElementById('org-shortname-label').textContent = T.org_shortname_label;
    document.getElementById('org-shortname').placeholder = T.org_shortname_placeholder;
    document.getElementById('business-type-label').textContent = T.business_type_label;
    document.getElementById('business-auto').textContent = T.business_auto;
    document.getElementById('business-electronics').textContent = T.business_electronics;
    document.getElementById('business-ac').textContent = T.business_ac;
    document.getElementById('business-appliance').textContent = T.business_appliance;
    document.getElementById('business-other').textContent = T.business_other;
    document.getElementById('contact-name-label').textContent = T.contact_name_label;
    document.getElementById('contact-email-label').textContent = T.contact_email_label;
    document.getElementById('contact-phone-label').textContent = T.contact_phone_label;
    document.getElementById('org-code-label').textContent = T.org_code_label;
    document.getElementById('org-code-input').placeholder = T.org_code_placeholder;
    document.getElementById('org-code-help').textContent = T.org_code_help;

    // Update buttons
    document.getElementById('btn-back-create').textContent = T.back_btn;
    document.getElementById('btn-submit-org').textContent = T.create_org_btn;
    document.getElementById('btn-back-join').textContent = T.back_btn;
    document.getElementById('btn-confirm-join').textContent = T.join_btn;
    document.getElementById('btn-close-result').textContent = T.close_btn;
}

// Generate random ID
function generateRandomId(length = 9) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// Check user type and determine display mode
async function checkUserType() {
    if (config.userOrgId === config.trialOrgId || config.userOrgId === 'rta') {
        userType = 'trial';
        isTrialMode = true;
        return 'trial';
    } else {
        userType = 'official';
        isTrialMode = false;
        return 'official';
    }
}

// Show result message
function showResult(msg, color = '#333') {
    document.getElementById('setup-dialog').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    const msgElem = document.getElementById('result-message');
    msgElem.innerHTML = msg;
    msgElem.style.color = color;
}

// Show setup dialog
function showSetupDialog() {
    document.getElementById('setup-dialog').classList.remove('hidden');
    document.getElementById('setup-selection').classList.remove('hidden');
    document.getElementById('create-org-form').classList.add('hidden');
    document.getElementById('join-org-form').classList.add('hidden');
}

// Hide setup dialog
function hideSetupDialog() {
    document.getElementById('setup-dialog').classList.add('hidden');
}

// Show appropriate banner based on user type
function showBanner() {
    if (isTrialMode) {
        // Show trial banner
        document.getElementById('trial-banner').classList.remove('hidden');
        document.getElementById('official-banner').classList.add('hidden');
        // document.getElementById('welcome-subtitle').textContent = T.trial_mode_subtitle;
    } else {
        // Show official banner
        document.getElementById('official-banner').classList.remove('hidden');
        document.getElementById('trial-banner').classList.add('hidden');

        // Update organization info
        document.getElementById('org-name-display').textContent = config.userOrgName || 'Your Organization';
        document.getElementById('org-id-display').textContent = `ID: ${config.userOrgId}`;
        // document.getElementById('welcome-subtitle').textContent = `${config.userOrgName || 'Your Organization'} - ${T.official_mode_subtitle}`;
    }
}

// Setup event handlers
function setupEventHandlers() {
    // Setup trial button (from trial banner)
    document.getElementById('btn-setup-trial').onclick = function() {
        showSetupDialog();
    };

    // Organization settings button (from official banner)
    document.getElementById('btn-org-settings').onclick = function() {
        alert(T.settings_alert);
    };

    // Close setup dialog
    document.getElementById('btn-close-setup').onclick = function() {
        hideSetupDialog();
    };

    // Create org button
    document.getElementById('btn-create-org').onclick = function() {
        document.getElementById('setup-selection').classList.add('hidden');
        document.getElementById('create-org-form').classList.remove('hidden');

        // Pre-fill form
        document.getElementById('contact-name').value = config.userFullName;
        document.getElementById('contact-email').value = config.userEmail;
        document.getElementById('contact-phone').value = config.userPhone;
    };

    // Join org button
    document.getElementById('btn-join-org').onclick = function() {
        document.getElementById('setup-selection').classList.add('hidden');
        document.getElementById('join-org-form').classList.remove('hidden');
    };

    // Continue trial button
    document.getElementById('btn-continue-trial').onclick = function() {
        hideSetupDialog();
    };

    // Back buttons
    document.getElementById('btn-back-create').onclick = function() {
        document.getElementById('create-org-form').classList.add('hidden');
        document.getElementById('setup-selection').classList.remove('hidden');
    };

    document.getElementById('btn-back-join').onclick = function() {
        document.getElementById('join-org-form').classList.add('hidden');
        document.getElementById('setup-selection').classList.remove('hidden');
    };

    // Create org form submit
    document.getElementById('org-create-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const orgName = document.getElementById('org-name-input').value.trim();
        let shortName = document.getElementById('org-shortname').value.trim();
        if (!shortName) shortName = orgName;
        const contactName = document.getElementById('contact-name').value.trim();
        const contactEmail = document.getElementById('contact-email').value.trim();
        const contactPhone = document.getElementById('contact-phone').value.trim();

        let orgId;
        if (userType === 'trial') {
            orgId = 's' + generateRandomId();
        } else if (userType === 'unidentified') {
            orgId = config.userOrgId;
        }

        const payload = {
            event_id: `rt${config.appShortName.toLowerCase()}.neworg`,
            new_org: '1',
            project_code: config.projectCode,
            data: [{
                username: config.username,
                fullname: config.userFullName,
                user_role: config.userRoledefault,
                email: config.userEmail,
                cellphone: config.userPhone && config.userPhone.trim() ? config.userPhone : '0',
                user_status: '1',
                org_id: orgId,
                org_name: shortName,
                contact_name: contactName,
                contact_email: contactEmail,
                contact_phone: contactPhone || '0',
                context_title: `${shortName}-${config.appShortName}`
            }]
        };

        fetch(config.apiEndpoints.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json(); 
        })
        .then(() => {
            showResult(T.notify(orgName, contactEmail));
            this.reset();
        })
        .catch(err => {
            console.error('Submit error:', err);
            showResult(T.error, '#e74c3c');
        });
    });

    // Join org confirm button
    document.getElementById('btn-confirm-join').onclick = async function() {
        const code = document.getElementById('org-code-input').value.trim();
        const errorElem = document.getElementById('org-error');
        errorElem.style.display = 'none';

        if (!foundOrg) {
            if (!code) {
                errorElem.textContent = T.error_empty;
                errorElem.style.display = 'block';
                return;
            }
            this.disabled = true;
            this.textContent = T.confirm_btn + '...';
            try {
                const response = await fetch(config.apiEndpoints.orgSearch, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "size": 1,
                        "query": { "bool": { "must": [{ "term": { "org_id.raw": { "value": code } } }] } }
                    })
                });
                const data = await response.json();
                this.disabled = false;
                this.textContent = T.confirm_btn;
                if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
                    foundOrg = data.hits.hits[0]._source;
                    errorElem.innerHTML = `<b class="org-name-found">${foundOrg.org_lb || foundOrg.org_name || code}</b>`;
                    errorElem.style.display = 'block';
                    errorElem.style.color = '#16a75c';
                    this.textContent = T.request_join;
                } else {
                    errorElem.textContent = T.error_notfound;
                    errorElem.style.display = 'block';
                }
            } catch (err) {
                this.disabled = false;
                this.textContent = T.confirm_btn;
                errorElem.textContent = T.error;
                errorElem.style.display = 'block';
            }
        } else {
            this.disabled = true;
            this.textContent = T.sending;
            try {
                await fetch(config.apiEndpoints.webhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event_id: `rt${config.appShortName.toLowerCase()}.user`,
                        user_trial: '0',
                        project_code: config.projectCode,
                        data: [{
                            username: config.username,
                            fullname: config.userFullName,
                            user_role: config.userRoledefault,
                            cellphone: config.userPhone && config.userPhone.trim() ? config.userPhone : '0',
                            user_status: '1',
                            email: config.userEmail,
                            org_id: foundOrg.org_id,
                            org_name: foundOrg.org_lb
                        }]
                    })
                });
                showResult(T.join_success.replace('{org}', foundOrg.org_lb || foundOrg.org_name || code));
            } catch (err) {
                errorElem.textContent = T.error;
                errorElem.style.display = 'block';
            }
            this.disabled = false;
            this.textContent = T.request_join;
        }
    };

    // Close result button
    document.getElementById('btn-close-result').onclick = function() {
        document.getElementById('result-screen').classList.add('hidden');
    };
}

// Initialize the application
function initRealtimeCS(configObj) {
    config = configObj;
    currentLang = config.appLanguage || 'en';
    T = LANG[currentLang] || LANG.en;

    // Apply language first
    applyLanguage();

    setupEventHandlers();
    checkUserType().then(() => {
        showBanner();
        // Re-initialize Lucide icons after DOM changes
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    });
}

// Export for global access
window.initRealtimeCS = initRealtimeCS;