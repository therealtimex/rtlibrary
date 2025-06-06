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
let userType = 'trial';
let foundOrg = null;
let isTrialMode = false;
let currentLang, T, config;

// Apply language to all elements
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setPlaceholder(id, value) {
  const el = document.getElementById(id);
  if (el) el.placeholder = value;
}

function applyLanguage() {
  document.documentElement.lang = currentLang;

  // Banner texts
  setText('trial-mode-title', T.trial_mode_title);
  setText('trial-mode-desc', T.trial_mode_desc);
  setText('btn-setup-trial', T.setup_btn);
  setText('official-status', T.official_status);
  // setText('btn-org-settings', T.settings_btn);

  // Setup dialog
  setText('setup-org-title', T.setup_org_title);
  setText('setup-org-desc', T.setup_org_desc);
  setText('create-org-title', T.create_org_title);
  setText('create-org-desc', T.create_org_desc);
  setText('join-org-title', T.join_org_title);
  setText('join-org-desc', T.join_org_desc);
  setText('btn-continue-trial', T.continue_trial);

  // Form labels and placeholders
  setText('org-name-label', T.org_name_label);
  setPlaceholder('org-name-input', T.org_name_placeholder);
  setText('org-shortname-label', T.org_shortname_label);
  setPlaceholder('org-shortname', T.org_shortname_placeholder);
  setText('business-type-label', T.business_type_label);
  setText('business-auto', T.business_auto);
  setText('business-electronics', T.business_electronics);
  setText('business-ac', T.business_ac);
  setText('business-appliance', T.business_appliance);
  setText('business-other', T.business_other);
  setText('contact-name-label', T.contact_name_label);
  setText('contact-email-label', T.contact_email_label);
  setText('contact-phone-label', T.contact_phone_label);
  setText('org-code-label', T.org_code_label);
  setPlaceholder('org-code-input', T.org_code_placeholder);
  setText('org-code-help', T.org_code_help);

  // Buttons
  setText('btn-back-create', T.back_btn);
  setText('btn-submit-org', T.create_org_btn);
  setText('btn-back-join', T.back_btn);
  setText('btn-confirm-join', T.join_btn);
  setText('btn-close-result', T.close_btn);
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
    if (config.userOrgId === config.trialOrgId) {
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
    // document.getElementById('btn-setup-trial').onclick = function() {
    //     showSetupDialog();
    // };

    document.getElementById('btn-setup-trial').onclick = function() {
        const actionData = {
            actionID: 99,
            orderNumber: 1,
            type: "act_dm_view",
            label: "no label",
            screen: "realtimecs-realtimecs00-realtimecs010obj1-screen10",
            alias: "realtimecs_realtimecs00obj1",
            args: { user_type: userType }
        };
        App.callActionButton(JSON.stringify(actionData));
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
    // document.getElementById('btn-continue-trial').onclick = function() {
    //     hideSetupDialog();
    // };
    document.getElementById('btn-continue-trial').onclick = function() {
        const actionData = {
            actionID: 99,
            orderNumber: 1,
            type: "act_dm_view",
            label: "no label",
            screen: "realtimecs-realtimecs00-realtimecs010obj1-screen1",
            alias: "realtimecs_realtimecs00obj1",
            args: { user_type: userType }
        };
        App.callActionButton(JSON.stringify(actionData));
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
        } else if (userType === 'official') {
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
        const actionData = {
            actionID: 99,
            orderNumber: 1,
            type: "act_dm_view",
            label: "no label",
            screen: "realtimecs-realtimecs00-realtimecs010obj1-screen1",
            alias: "realtimecs_realtimecs00obj1",
            args: { user_type: userType }
        };
        App.callActionButton(JSON.stringify(actionData));

        // document.getElementById('result-screen').classList.add('hidden');
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