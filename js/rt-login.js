function initializeLoginApp(config) {
  // Extract configuration with comprehensive defaults
  const {
    username = 'user',
    userFullName = 'User',
    userEmail = 'user@example.com',
    userPhone = '',
    userOrgId = '',
    userOrgName = '',
    projectCode = '',
    appLanguage = 'en',
    appName = 'Real-time HRM',
    appShortName = 'HRM',
    containerId = 'app-container',
    trialOrgId = 'ea8018e243',
    apiEndpoints = {
      orgSearch: 'https://es.rta.vn/nerp_org/_search',
      webhook: 'https://automation.rta.vn/webhook/rthrm-events'
    },
    theme = {
      primaryColor: '#007bff',
      infoColor: '#17a2b8',
      surfaceColor: '#ffffff',
      inoutColor: '#16a75c',
      leaveColor: '#e74c3c',
      holidayColor: '#3498db',
      zeroColor: '#95a5a6',
      borderColor: '#e0e0e0',
      backgroundLight: '#f5f5f5',
      textMain: '#333',
      textLight: '#777',
      warningColor: '#FF9800',
      warningDark: '#F57C00'
    },
    roles = {
      staff: `${appShortName} Staff`,
      trial: `${appShortName} - User Trial`,
      manager: `${appShortName} Manager`
    },
    eventIds = {
      user: `rt${appShortName.toLowerCase()}.user`,
      newOrg: `rt${appShortName.toLowerCase()}.neworg`
    },
    orgSettings = {
      demoName: `${appShortName} Demo`,
      contextSuffix: appShortName,
      shortNameMaxLength: 30,
      randomIdLength: 9
    },
    userStatus = {
      active: '1',
      inactive: '0'
    },
    cssClasses = {
      orgNameFound: 'org-name-found'
    }
  } = config;

  // Apply all theme colors
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(cssVar, value);
  });

  // Language definitions with configurable app name
  const LANG = {
    vi: {
      welcome: "Xin chào, {user}",
      desc: `Tiếp tục sử dụng ${appName} bằng cách`,
      orgPlaceholder: "Nhập mã tổ chức",
      confirm: "Xác nhận",
      or: "hoặc",
      createOrg: "Khởi tạo tổ chức mới",
      trial: "Người dùng trải nghiệm",
      error_empty: "Vui lòng nhập mã tổ chức.",
      error_notfound: "Không tìm thấy tổ chức với mã này. Vui lòng kiểm tra lại.",
      error: "Đã xảy ra lỗi. Vui lòng thử lại sau!",
      trialSuccess: `Hệ thống đang xử lý yêu cầu sử dụng ${appName} - Người dùng trải nghiệm cho <b>{user}</b>, vui lòng chờ hệ thống xác nhận thông tin và khởi tạo dữ liệu!`,
      joinSuccess: "Hệ thống đã gửi yêu cầu tham gia đến <b>{org}</b>, vui lòng chờ bộ phận Quản lý xác nhận!",
      close: "Đóng",
      trialTag: "Người dùng trải nghiệm",
      orgName: "Tên Tổ chức",
      shortName: `Tên ngắn gọn (dưới ${orgSettings.shortNameMaxLength} ký tự)`,
      contactName: "Họ và tên",
      contactEmail: "Email",
      contactPhone: "Số điện thoại",
      submitBtn: "GỬI",
      orgFormTitle: "Thông tin Tổ chức",
      orgFormDesc: "Vui lòng cung cấp Thông tin để Hệ thống khởi tạo Tổ chức mới:",
      processing: "Đang xử lý...",
      sending: "Đang gửi...",
      requestJoin: "Yêu cầu tham gia",
      notify: (org, email) => `Hệ thống đang xử lý yêu cầu Khởi tạo Tổ chức mới cho <b>${org}</b>, vui lòng chờ hệ thống xác nhận thông tin và khởi tạo dữ liệu!`
    },
    en: {
      welcome: "Welcome, {user}",
      desc: `Continue using ${appName} by`,
      orgPlaceholder: "Enter organization code",
      confirm: "Confirm",
      or: "or",
      createOrg: "Create new organization",
      trial: "Trial user",
      error_empty: "Please enter organization code.",
      error_notfound: "Organization not found. Please check your code.",
      error: "Error occurred. Please try again!",
      trialSuccess: `The system is processing the request to use ${appName} - User Trial for <b>{user}</b>. Please wait for the system to confirm the information and initialize the data!`,
      joinSuccess: "The system has sent a join request to <b>{org}</b>. Please wait for admin approval!",
      close: "Close",
      trialTag: "Trial user",
      orgName: "Organization Name",
      shortName: `Short Name (under ${orgSettings.shortNameMaxLength} characters)`,
      contactName: "Contact Name",
      contactEmail: "Email",
      contactPhone: "Phone Number",
      submitBtn: "SUBMIT",
      orgFormTitle: "Organization Information",
      orgFormDesc: "Please provide the information so the system can create a New organization:",
      processing: "Processing...",
      sending: "Sending...",
      requestJoin: "Request to join",
      notify: (org, email) => `We are processing your request to create the new organization <b>${org}</b>. Please wait for the system to confirm the information and initialize the data.`
    }
  };

  const T = LANG[appLanguage] || LANG.en;
  let userType = 'unidentified';
  let foundOrg = null;
  let combineScreenMode = 'default';

  // Generate HTML structure
  function createHTML() {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID '${containerId}' not found`);
      return;
    }

    container.innerHTML = `
      <!-- Main login screen -->
      <div id="combine-user-screen">
        <div class="combine-card">
          <div id="combine-title">
            ${T.welcome.replace('{user}', `<b>${userFullName}</b>`)}
          </div>
          <div style="font-size:1rem;margin-bottom:22px;" id="combine-desc">
            ${T.desc}
          </div>
          <input id="combine-org-code" type="text" placeholder="${T.orgPlaceholder}">
          <div id="combine-org-error"></div>
          <button id="combine-btn-confirm">${T.confirm}</button>
          <div class="combine-or" id="combine-or">${T.or}</div>
          <button id="combine-btn-create-org">${T.createOrg}</button>
          <button id="combine-btn-trial">${T.trial}</button>
        </div>
      </div>

      <!-- Result screen -->
      <div id="combine-result-screen" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;background:rgba(0,0,0,0.07);align-items:center;justify-content:center;">
        <div class="combine-card" style="margin:auto;">
          <div id="combine-result-message" class="combine-result-content"></div>
          <button id="combine-btn-close-result" class="btn btn-primary" style="width:70vw;max-width:350px;">${T.close}</button>
        </div>
      </div>

      <!-- Trial user tag -->
      <div id="trial-user-tag" style="display:none;">${T.trialTag}</div>

      <!-- Notification modal -->
      <div class="modal-bg" id="notification-popup" style="display:none;">
        <div class="modal-content2" style="padding: 20px 20px 16px 20px; max-width: 360px;">
          <div class="modal-body" style="padding: 0; font-size: 0.95rem;" id="notification-message"></div>
          <div style="text-align: center; margin-top: 16px;">
            <button id="btn-close-notification" class="btn btn-sm" style="background-color: var(--primary-color); color: white; padding: 4px 12px; border-radius: 6px; font-size: 14px;">${T.close}</button>
          </div>
        </div>
      </div>

      <!-- Create organization modal -->
      <div class="modal-bg" id="modal-create-org" style="display:none;">
        <div class="modal-content2" style="overflow:visible; max-width: 540px;">
          <div class="modal-header2">
            <h3 id="org-form-title">${T.orgFormTitle}</h3>
            <div class="modal-close-x" onclick="closeModalCreateOrg()"></div>
          </div>
          <div class="modal-body" style="padding: 24px;">
            <form id="org-create-form">
              <p id="org-form-desc" style="font-size: 0.95rem; margin-bottom: 1rem;">${T.orgFormDesc}</p>
              <div class="row g-3">
                <div class="col-12">
                  <label for="org-name-input" class="form-label"><span id="label-org-name">${T.orgName}</span> <span style="color:red">*</span></label>
                  <input type="text" class="form-control" id="org-name-input" required>
                </div>
                <div class="col-12">
                  <label for="org-shortname" class="form-label"><span id="label-org-short">${T.shortName}</span></label>
                  <input type="text" class="form-control" id="org-shortname" maxlength="${orgSettings.shortNameMaxLength}">
                </div>
              </div>
              <div style="height: 12px;"></div>
              <div class="row g-3">
                <div class="col-12">
                  <label for="contact-name" class="form-label"><span id="label-contact-name">${T.contactName}</span> <span style="color:red">*</span></label>
                  <input type="text" class="form-control" id="contact-name" value="${userFullName}" required>
                </div>
                <div class="col-12">
                  <label for="contact-email" class="form-label"><span id="label-contact-email">${T.contactEmail}</span> <span style="color:red">*</span></label>
                  <input type="email" class="form-control" id="contact-email" value="${userEmail}" required>
                </div>
                <div class="col-12">
                  <label for="contact-phone" class="form-label"><span id="label-contact-phone">${T.contactPhone}</span></label>
                  <input type="tel" class="form-control" id="contact-phone" value="${userPhone}">
                </div>
              </div>
              <div class="d-grid mt-4">
                <button type="submit" class="btn btn-primary" id="btn-submit-org">${T.submitBtn}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  // Generate random ID with configurable length
  function generateRandomId(length = orgSettings.randomIdLength) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  // Check user type
  async function checkUserType() {
    if (userOrgId === trialOrgId) {
      userType = 'trial';
      return 'trial';
    }
    return 'unidentified';
  }

  // Show result message
  function showCombineResult(msg, color = theme.textMain) {
    document.getElementById('combine-user-screen').style.display = 'none';
    document.getElementById('combine-result-screen').style.display = 'flex';
    const msgElem = document.getElementById('combine-result-message');
    msgElem.innerHTML = msg;
    msgElem.style.color = color;
  }

  // Reset form
  function resetCombineForm() {
    document.getElementById('combine-org-code').value = '';
    document.getElementById('combine-org-error').style.display = 'none';
    foundOrg = null;
    combineScreenMode = 'default';
    document.getElementById('combine-btn-confirm').textContent = T.confirm;
    document.getElementById('combine-btn-confirm').disabled = false;
  }

  // Show combine screen
  function showCombineScreen() {
    document.getElementById('combine-user-screen').style.display = 'flex';
    document.getElementById('combine-result-screen').style.display = 'none';
    resetCombineForm();
  }

  // Close organization modal
  window.closeModalCreateOrg = function() {
    document.getElementById('modal-create-org').style.display = 'none';
    showCombineScreen();
  };

  // Setup event handlers
  function setupEventHandlers() {
    // Confirm button handler
    document.getElementById('combine-btn-confirm').onclick = async function() {
      const code = document.getElementById('combine-org-code').value.trim();
      const errorElem = document.getElementById('combine-org-error');
      errorElem.style.display = 'none';
      errorElem.style.color = theme.leaveColor;
      
      if (!foundOrg) {
        if (!code) {
          errorElem.textContent = T.error_empty;
          errorElem.style.display = 'block';
          return;
        }
        this.disabled = true;
        this.textContent = T.confirm + '...';
        try {
          const response = await fetch(apiEndpoints.orgSearch, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              "size": 1,
              "query": { "bool": { "must": [{ "term": { "org_id.raw": { "value": code } } }] } }
            })
          });
          const data = await response.json();
          this.disabled = false;
          this.textContent = T.confirm;
          if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
            foundOrg = data.hits.hits[0]._source;
            errorElem.innerHTML = `<b class="${cssClasses.orgNameFound}">${foundOrg.org_lb || foundOrg.org_name || code}</b>`;
            errorElem.style.display = 'block';
            this.textContent = T.requestJoin;
          } else {
            errorElem.textContent = T.error_notfound;
            errorElem.style.display = 'block';
          }
        } catch (err) {
          this.disabled = false;
          this.textContent = T.confirm;
          errorElem.textContent = T.error;
          errorElem.style.display = 'block';
        }
      } else {
        this.disabled = true;
        this.textContent = T.sending;
        try {
          await fetch(apiEndpoints.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_id: eventIds.user,
              user_trial: userStatus.inactive,
              project_code: projectCode,
              data: [{
                username: username,
                fullname: userFullName,
                user_role: `${trialOrgId}_${roles.staff}`,
                cellphone: userPhone && userPhone.trim() ? userPhone : '0',
                user_status: userStatus.active,
                email: userEmail,
                org_id: foundOrg.org_id,
                org_name: foundOrg.org_lb
              }]
            })
          });
          showCombineResult(T.joinSuccess.replace('{org}', foundOrg.org_lb || foundOrg.org_name || code), theme.textMain);
        } catch (err) {
          errorElem.style.color = theme.leaveColor;
          errorElem.textContent = T.error;
          errorElem.style.display = 'block';
        }
        this.disabled = false;
        this.textContent = T.requestJoin;
      }
    };

    // Trial button handler
    document.getElementById('combine-btn-trial').onclick = async function() {
      const btn = this;
      const errorElem = document.getElementById('combine-org-error');
      btn.disabled = true;
      btn.textContent = T.processing;
      
      try {
        await fetch(apiEndpoints.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: eventIds.user,
            user_trial: userStatus.active,
            project_code: projectCode,
            data: [{
              username: username,
              fullname: userFullName,
              user_role: `${trialOrgId}_${roles.trial}`,
              cellphone: userPhone && userPhone.trim() ? userPhone : '0',
              user_status: userStatus.active,
              email: userEmail,
              org_id: trialOrgId,
              org_name: orgSettings.demoName
            }]
          })
        });
        showCombineResult(T.trialSuccess.replace('{user}', userFullName), theme.textMain);
      } catch (err) {
        errorElem.style.color = theme.leaveColor;
        errorElem.textContent = T.error;
        errorElem.style.display = 'block';
      }
      btn.disabled = false;
      btn.textContent = T.trial;
    };

    // Create organization button handler
    document.getElementById('combine-btn-create-org').onclick = function() {
      document.getElementById('combine-user-screen').style.display = 'none';
      document.getElementById('modal-create-org').style.display = 'flex';
    };

    // Close result button handler
    document.getElementById('combine-btn-close-result').onclick = function() {
      document.getElementById('combine-result-screen').style.display = 'none';
      resetCombineForm();
      showCombineScreen();
    };

    // Close notification button handler
    document.getElementById('btn-close-notification').onclick = function() {
      document.getElementById('notification-popup').style.display = 'none';
      showCombineScreen();
    };

    // Organization form submit handler
    document.getElementById('org-create-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const orgName = document.getElementById('org-name-input').value.trim();
      let shortName = document.getElementById('org-shortname').value.trim();
      if (!shortName) shortName = orgName;
      const contactName = document.getElementById('contact-name').value.trim();
      const contactEmail = document.getElementById('contact-email').value.trim();
      const contactPhone = document.getElementById('contact-phone').value.trim();
      
      let orgId;
      if (userType === 'trial' || userOrgId === '324fd') {
        orgId = 'p' + generateRandomId();
      } else if (userType === 'unidentified') {
        orgId = userOrgId;
      }

      const payload = {
        event_id: eventIds.newOrg,
        new_org: userStatus.active,
        project_code: projectCode,
        data: [{
          username: username,
          fullname: userFullName,
          user_role: `${trialOrgId}_${roles.manager}`,
          email: userEmail,
          cellphone: userPhone && userPhone.trim() ? userPhone : '0',
          user_status: userStatus.active,
          org_id: orgId,
          org_name: shortName,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone || '0',
          context_title: `${shortName}-${orgSettings.contextSuffix}`
        }]
      };

      fetch(apiEndpoints.webhook, {
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
        document.getElementById('modal-create-org').style.display = 'none';
        showCombineResult(T.notify(orgName, contactEmail), theme.textMain);
        this.reset();
      })
      .catch(err => {
        console.error('Submit error:', err);
        document.getElementById('modal-create-org').style.display = 'none';
        document.getElementById('notification-message').innerHTML = `
          <div style="color: ${theme.leaveColor}; font-weight: 500; margin-bottom: 8px; text-align:center;">
            ${T.error}
          </div>`;
        document.getElementById('notification-popup').style.display = 'flex';
      });
    });
  }

  // Initialize the application
  function init() {
    createHTML();
    setupEventHandlers();
    checkUserType().then(() => {
      showCombineScreen();
    });
  }

  // Start the application
  init();
}