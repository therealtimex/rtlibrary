// realtimecs-login.js
// Multi-language definitions
const LANG = {
    vi: {
        // Banner texts
        trial_mode_title: "Chế độ trải nghiệm",
        trial_mode_desc: "Bạn đang sử dụng phiên bản dùng thử. Dữ liệu sẽ bị xóa sau 7 ngày.",
        setup_btn: "Nâng cấp",
        official_status: "Chính thức",
        settings_btn: "Cài đặt",

        // Welcome texts
        welcome_app: "Chào mừng đến với FuseSell AI",
        app_description: "Hệ thống quản lý bán hàng bằng AI",

        // Setup dialog
        setup_org_title: "Thiết lập tổ chức",
        setup_org_desc: "Chọn cách bạn muốn sử dụng FuseSell AI",
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
        join_success: "Yêu cầu tham gia <b>{org}</b> của bạn đã được xử lý thành công",
        notify: (org, email) => `Hệ thống đang xử lý yêu cầu Khởi tạo Tổ chức mới cho <b>${org}</b>, vui lòng chờ hệ thống xác nhận thông tin và khởi tạo dữ liệu!`,
        trial_mode_subtitle: "Bạn đang sử dụng chế độ trải nghiệm",
        official_mode_subtitle: "Phiên bản chính thức",
        settings_alert: "Chức năng cài đặt tổ chức sẽ được phát triển",
        org_update_timeout: "Không xác định được cập nhật tổ chức.",
        org_update_error: "Lỗi khi kiểm tra cập nhật tổ chức."
    },
    en: {
        // Banner texts
        trial_mode_title: "Trial Mode",
        trial_mode_desc: "You are using the trial version. Data will be deleted after 7 days.",
        setup_btn: "Upgrade",
        official_status: "Official",
        settings_btn: "Settings",

        // Welcome texts
        welcome_app: "Welcome to RealTime CS",
        app_description: "Real-time Human Resource Management System",

        // Setup dialog
        setup_org_title: "Organization Setup",
        setup_org_desc: "Choose how you want to use RealTime CS",
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
        join_success: "Your request to join <b>{org}</b> has been successfully processed",
        notify: (org, email) => `We are processing your request to create the new organization <b>${org}</b>. Please wait for the system to confirm the information and initialize the data.`,
        trial_mode_subtitle: "You are using trial mode",
        official_mode_subtitle: "Official Version",
        settings_alert: "Organization settings feature will be developed",
        org_update_timeout: "Organization update not recognized.",
        org_update_error: "Error checking organization update."
    }
};

// Global variables
let userType = 'trial';
let foundOrg = null;
let isTrialMode = false;
let currentLang, T, config;


function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setPlaceholder(id, value) {
  const el = document.getElementById(id);
  if (el) el.placeholder = value;
}

// Apply language to all elements
function applyLanguage() {
  document.documentElement.lang = currentLang;

  // Banner texts
  setText('trial-mode-title', T.trial_mode_title);
  var trialModeDescElem = document.getElementById('trial-mode-desc');
  if (trialModeDescElem) {
    trialModeDescElem.textContent = T.trial_mode_desc;
  }
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
    const trialOrg = configUser.trialOrgId;
    const userOrgId = configUser.userOrgId;

    const isTrial =
        (Array.isArray(trialOrg) && trialOrg.includes(userOrgId)) ||
        userOrgId === trialOrg; 

    if (isTrial) {
        userType = 'trial';
        isTrialMode = true;
        return 'trial';
    } else {
        userType = 'official';
        isTrialMode = false;
        return 'official';
    }
}



async function checkOrgInfoData() {
    const apiUrl = 'https://es.rta.vn/nerp_org/_search';
    
    // Ensure trialOrgId is always an array
    const trialOrgIds = Array.isArray(config.trialOrgId) ? config.trialOrgId : [config.trialOrgId];

    const query = {
        "sort": [{ "__system_update_timestamp__": "desc" }],
        "query": {
            "bool": {
                "must": [
                    { "term": { "username.raw": { "value": config.username } } },
                    { "term": { "project_code.raw": { "value": config.projectCode } } }
                ],
                "must_not": [
                    { "terms": { "org_id.raw": trialOrgIds } }
                ]
            }
        },
        "size": 1
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        });

        const data = await response.json();
        // Check if data is returned
        return data.hits.total.value > 0; // Return true if data exists, false otherwise
    } catch (error) {
        console.error('Error calling Elasticsearch API:', error);
        return false; // Return false if an error occurs
    }
}                                



function pollOrgUpdate(originalOrgId, resultMessage, maxAttempts = 3, interval = 5000) {
  let attempts = 0;

  function displayRetryUI(message) {
    const retryPopup = document.getElementById('retry-popup');
    const retryMessage = document.getElementById('retry-popup-message');
    const btnRetryPopup = document.getElementById('btn-retry-popup');

    if (retryMessage) {
      retryMessage.textContent = message;
    }

    if (retryPopup) {
      retryPopup.classList.remove('hidden');
    }

    if (btnRetryPopup) {
      btnRetryPopup.onclick = function() {
        // hide popup retry
        retryPopup.classList.add('hidden');
        // ReShow spinner
        const spinner = document.getElementById('loading-spinner');
        const spinnerLabel = document.getElementById('spinner-label');
        if (spinner) {
            spinner.classList.remove('hidden');
            if (spinnerLabel) spinnerLabel.textContent = T.processing;
        }
        attempts = 0; // Reset the number of tests again
        checkUpdate();
      };
    }
  }

  // Show Spinner before starting Polling
  const spinner = document.getElementById('loading-spinner');
  const spinnerLabel = document.getElementById('spinner-label');
  if (spinner) {
    spinner.classList.remove('hidden');
    spinnerLabel.textContent = T.processing;
  }

  const checkUpdate = () => {
    fetch(`${config.projectURL}/api/dm/getData?token=your_token_here&dm_name=ss_user&max_order=0&format=json&mode=download&where=\`username\`="${config.username}"`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0 && data[0].organization_id !== originalOrgId) {
          // If organization_id has changed, conducted 2 actions:
          App.callActionButton(JSON.stringify({
            actionID: 24703,
            orderNumber: 1,
            type: "act_fetch_rcm",
            label: "Fetch RCM"
          }));
          setTimeout(() => {
            App.callActionButton(JSON.stringify({
              actionID: 24704,
              orderNumber: 2,
              type: "act_reload_app",
              label: "Reload App"
            }));
            // Hide spinner after completion
            if (spinner) spinner.classList.add('hidden');
            // Show Popup results
            showResult(resultMessage);
          }, 3000);
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkUpdate, interval);
          } else {
            if (spinner) spinner.classList.add('hidden');
            displayRetryUI(T.org_update_timeout);
          }
        }
      })
      .catch(err => {
        console.error("Lỗi polling:", err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkUpdate, interval);
        } else {
          if (spinner) spinner.classList.add('hidden');
          displayRetryUI(T.org_update_error);
        }
      });
  };

  setTimeout(checkUpdate, 5000);
  // checkUpdate();
}


function showResult(msg, color = '#333') {
    const setupDialog = document.getElementById('setup-dialog');
    if (setupDialog) setupDialog.classList.add('hidden');

    const resultScreen = document.getElementById('result-screen');
    if (resultScreen) resultScreen.classList.remove('hidden');

    const msgElem = document.getElementById('result-message');
    if (msgElem) {
        msgElem.innerHTML = msg;
        msgElem.style.color = color;
    }
}

// Show setup dialog
function showSetupDialog() {
    // If the interface is being displayed flat, no more processing 
    // You can delete the content or comment hidden/show
}


// Hide setup dialog
function hideSetupDialog() {
    // Do not hide the interface, or process the flat interface logic
}


// Show appropriate banner based on user type
async function showBanner() {
    const trialBanner = document.getElementById('trial-banner');
    const officialBanner = document.getElementById('official-banner');
    const orgNameDisplay = document.getElementById('org-name-display');
    const orgIdDisplay = document.getElementById('org-id-display');
    const userDisplay = document.getElementById('org-user-display');
    const orgInfoButton = document.getElementById('org-info-button'); // Lấy tham chiếu đến nú
    // const welcomeSubtitle = document.getElementById('welcome-subtitle');

    if (isTrialMode) {
        // Show trial banner
        if (trialBanner) trialBanner.classList.remove('hidden');
        if (officialBanner) officialBanner.classList.add('hidden');
        // if (welcomeSubtitle) welcomeSubtitle.textContent = T.trial_mode_subtitle;
    } else {
        // Show official banner
        if (officialBanner) officialBanner.classList.remove('hidden');
        if (trialBanner) trialBanner.classList.add('hidden');

        // Update organization info
        if (orgNameDisplay) orgNameDisplay.textContent = config.userOrgName || 'Your Organization';
        if (orgIdDisplay) orgIdDisplay.textContent = `ID: ${config.userOrgId}`;
        if (userDisplay) userDisplay.textContent = `${config.userFullName}`;
        // if (welcomeSubtitle) welcomeSubtitle.textContent = `${config.userOrgName || 'Your Organization'} - ${T.official_mode_subtitle}`;

        // Check data from elasticsearch
        const hasOrgInfoData = await checkOrgInfoData();
                                                                                                                                                 
        // Hide/Show button based on the results
        if (orgInfoButton) {
            if (hasOrgInfoData) {
                orgInfoButton.classList.remove('hidden');
            } else {
                orgInfoButton.classList.add('hidden');
            }
        }
    }
}


// Setup event handlers
function setupEventHandlers() {
    // Setup trial button (from trial banner)
    var btnSetupTrial = document.getElementById('btn-setup-trial');
    if (btnSetupTrial) {
      btnSetupTrial.onclick = function() {
        showSetupDialog();
      };

      btnSetupTrial.addEventListener('click', function() {
        const actionData = {
            actionID: 99,
            orderNumber: 1,
            type: "act_dm_view",
            label: "no label",
            screen: "fusesellaisub-fusesellai01-fusesellai01obj1000-screen1001",
            alias: "fusesellai_fusesellai01obj1000",
            args: { user_type: userType }
        };
        App.callActionButton(JSON.stringify(actionData));
      });
    }

    // Organization settings button (from official banner)
    // document.getElementById('btn-org-settings').onclick = function() {
    //     alert(T.settings_alert);
    // };

    // Close setup dialog
    var btnCloseSetup = document.getElementById('btn-close-setup');
    if (btnCloseSetup) {
      btnCloseSetup.addEventListener('click', function() {
        hideSetupDialog();
      });
    }

    var btnCreateOrg = document.getElementById('btn-create-org');
    if (btnCreateOrg) {
      btnCreateOrg.addEventListener('click', function() {
        // Hide setup-org-desc
        var setupOrgDesc = document.getElementById('setup-org-desc');
        if (setupOrgDesc) setupOrgDesc.classList.add('hidden');
        // Hide selection setup
        var setupSelection = document.getElementById('setup-selection');
        if (setupSelection) setupSelection.classList.add('hidden');
        // Show form create org
        var createOrgForm = document.getElementById('create-org-form');
        if (createOrgForm) createOrgForm.classList.remove('hidden');
        // Setup default value for form
        var contactName = document.getElementById('contact-name');
        if (contactName) contactName.value = config.userFullName;
        var contactEmail = document.getElementById('contact-email');
        if (contactEmail) contactEmail.value = config.userEmail;
        var contactPhone = document.getElementById('contact-phone');
        if (contactPhone) contactPhone.value = config.userPhone;
      });
    }

    var btnJoinOrg = document.getElementById('btn-join-org');
    if (btnJoinOrg) {
      btnJoinOrg.addEventListener('click', function() {
        // Hide setup-org-desc
        var setupOrgDesc = document.getElementById('setup-org-desc');
        if (setupOrgDesc) setupOrgDesc.classList.add('hidden');
        // Hide selection setup
        var setupSelection = document.getElementById('setup-selection');
        if (setupSelection) setupSelection.classList.add('hidden');
        // Show form join Org
        var joinOrgForm = document.getElementById('join-org-form');
        if (joinOrgForm) joinOrgForm.classList.remove('hidden');
      });
    }

    // Continue trial button
    // document.getElementById('btn-continue-trial').onclick = function() {
    //     hideSetupDialog();
    // };
    var btnContinueTrial = document.getElementById('btn-continue-trial');
    if (btnContinueTrial) {
      btnContinueTrial.addEventListener('click', function() {
        const actionData = {
            actionID: 99,
            orderNumber: 1,
            type: "act_exit",
            label: "no label"
        };
        App.callActionButton(JSON.stringify(actionData));
      });
    }

    var btnBackCreate = document.getElementById('btn-back-create');
    if (btnBackCreate) {
      btnBackCreate.addEventListener('click', function() {
        var createOrgForm = document.getElementById('create-org-form');
        if (createOrgForm) createOrgForm.classList.add('hidden');
        var setupSelection = document.getElementById('setup-selection');
        if (setupSelection) setupSelection.classList.remove('hidden');
        // Show the description of setup-org-desc
        var setupOrgDesc = document.getElementById('setup-org-desc');
        if (setupOrgDesc) setupOrgDesc.classList.remove('hidden');
      });
    }

    var btnBackJoin = document.getElementById('btn-back-join');
    if (btnBackJoin) {
      btnBackJoin.addEventListener('click', function() {
        var joinOrgForm = document.getElementById('join-org-form');
        if (joinOrgForm) joinOrgForm.classList.add('hidden');
        var setupSelection = document.getElementById('setup-selection');
        if (setupSelection) setupSelection.classList.remove('hidden');
        // Show the description of setup-org-desc
        var setupOrgDesc = document.getElementById('setup-org-desc');
        if (setupOrgDesc) setupOrgDesc.classList.remove('hidden');
      });
    }

    // Create org form submit
var orgCreateForm = document.getElementById('org-create-form');
if (orgCreateForm) {
  orgCreateForm.addEventListener('submit', function(e) {
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
      // Hide the entry interface completely by setting the style display = 'none'
      const createOrgFormElem = document.getElementById('create-org-form');
      if (createOrgFormElem) {
        createOrgFormElem.style.display = 'none';
      }
      const setupSelectionElem = document.getElementById('setup-selection');
      if (setupSelectionElem) {
        setupSelectionElem.style.display = 'none';
      }
      
      const originalOrgId = config.userOrgId;
      pollOrgUpdate(originalOrgId, T.notify(orgName, contactEmail));
      // Display results screen
      // showResult(T.notify(orgName, contactEmail));
      orgCreateForm.reset();
    })
    .catch(err => {
      console.error('Submit error:', err);
      showResult(T.error, '#e74c3c');
    });
  });
}

    // Join org confirm button
    var btnConfirmJoin = document.getElementById('btn-confirm-join');
    if (btnConfirmJoin) {
      btnConfirmJoin.addEventListener('click', async function() {
        var orgCodeInput = document.getElementById('org-code-input');
        const code = orgCodeInput ? orgCodeInput.value.trim() : '';
        const errorElem = document.getElementById('org-error');
        if (errorElem) errorElem.style.display = 'none';

        if (!foundOrg) {
            if (!code) {
                if (errorElem) {
                    errorElem.textContent = T.error_empty;
                    errorElem.style.display = 'block';
                }
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
                    if (errorElem) {
                        errorElem.innerHTML = `<b class="org-name-found">${foundOrg.org_lb || foundOrg.org_name || code}</b>`;
                        errorElem.style.display = 'block';
                        errorElem.style.color = '#16a75c';
                    }
                    this.textContent = T.request_join;
                } else {
                    if (errorElem) {
                        errorElem.textContent = T.error_notfound;
                        errorElem.style.display = 'block';
                    }
                }
            } catch (err) {
                this.disabled = false;
                this.textContent = T.confirm_btn;
                if (errorElem) {
                    errorElem.textContent = T.error;
                    errorElem.style.display = 'block';
                }
            }
        } else {
            // Hide the input interface of join-org-form
            var joinOrgFormElem = document.getElementById('join-org-form');
            if (joinOrgFormElem) {
              joinOrgFormElem.style.display = 'none';
            }
            // Disable the send button and update label
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
                            cellphone: (config.userPhone && config.userPhone.trim() && !/^n\/?a$/i.test(config.userPhone.trim())) ? config.userPhone : '0',
                            user_status: '1',
                            email: config.userEmail,
                            org_id: foundOrg.org_id,
                            org_name: foundOrg.org_lb
                        }]
                    })
                });
                const originalOrgId = config.userOrgId;
                pollOrgUpdate(originalOrgId, T.join_success.replace('{org}', foundOrg.org_lb || foundOrg.org_name || code));
                // showResult(T.join_success.replace('{org}', foundOrg.org_lb || foundOrg.org_name || code));
            } catch (err) {
                if (errorElem) {
                    errorElem.textContent = T.error;
                    errorElem.style.display = 'block';
                }
            }
            this.disabled = false;
            this.textContent = T.request_join;
        }
      });
    }

    // Close result button
    var btnCloseResult = document.getElementById('btn-close-result');
    if (btnCloseResult) {
      btnCloseResult.addEventListener('click', function() {
        const actionData = {
            actionID: 99,
            orderNumber: 1,
            type: "act_exit",
            label: "no label"
        };
        App.callActionButton(JSON.stringify(actionData));

        // var resultScreen = document.getElementById('result-screen');
        // if (resultScreen) resultScreen.classList.add('hidden');
      });
    }

    // Setup org info button (from official banner)
    const orgInfoButton = document.getElementById('org-info-button');
    if (orgInfoButton) {
        orgInfoButton.addEventListener('click', function() {
            const actionData = {
                actionID: 99,
                orderNumber: 1,
                type: "act_dm_view",
                label: "no label",
                screen: "fusesellaisub-fusesellai01-fusesellai01obj1000-screen1002",
                alias: "fusesellai_fusesellai01obj1000"
               
            };
            App.callActionButton(JSON.stringify(actionData));
        });
    }


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
