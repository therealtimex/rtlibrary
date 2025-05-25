function renderOrgFormLang() {
  document.getElementById('org-form-desc').textContent = 
  appLanguage === 'vi' 
  ? "Vui lòng cung cấp Thông tin để Hệ thống khởi tạo Tổ chức mới:" 
  : "Please provide the information so the system can create a New organization:";
  document.getElementById('org-form-title').textContent = appLanguage === 'vi' ? 'Khởi tạo tổ chức mới' : 'Create New Organization';

  document.getElementById('label-org-name').textContent = T.orgName;
  document.getElementById('label-org-short').textContent = T.shortName;
  document.getElementById('label-contact-name').textContent = T.contactName;
  document.getElementById('label-contact-email').textContent = T.contactEmail;
  document.getElementById('label-contact-phone').textContent = T.contactPhone;
  document.getElementById('btn-submit-org').textContent = T.submitBtn;
}

;
    // ==== Hàm lấy thông tin user ====
function getUserEmail() {
  return USER_EMAIL || 'user@example.com';
}
function getUserName() {
  const profileName = document.querySelector('.profile-name');
  return profileName ? profileName.textContent : (appLanguage === 'en' ? 'User' : 'Người dùng');
}

    // Xác định loại người dùng
    let userType = 'unidentified'; // unidentified, trial, official
    const TRIAL_ORG_ID = 'ea8018e243';

    // Hàm kiểm tra loại người dùng
    async function checkUserType() {
      // Lấy organization_id từ hệ thống
      const userOrgId = USER_ORG_ID;
      
      if (userOrgId === TRIAL_ORG_ID) {
        userType = 'trial';
        return 'trial';
      }
      
      try {
        // Kiểm tra với API nếu là người dùng chính thức
        const response = await fetch('https://es.rta.vn/nerp_org/_search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "size": 10000,
            "collapse": {"field": "org_id.raw"},
            "_source": {"includes": ["org_id"]},
            "sort": [{"endtime": {"order": "desc"}}]
          })
        });
        
        const data = await response.json();
        const officialOrgIds = data.hits.hits.map(hit => hit._source.org_id);

    
        
        if (officialOrgIds.includes(userOrgId)) {
          userType = 'official';
          return 'official';
        }
        
        return 'unidentified';
      } catch (error) {
        console.error("Error checking user type:", error);
        return 'unidentified';
      }
    }


    // ==== Hàm hiển thị giao diện theo loại người dùng ====
function renderByUserType() {
  const hrmMain = document.getElementById('hrm-main');
  const unidentifiedScreen = document.getElementById('unidentified-user-screen');
  const trialTag = document.getElementById('trial-user-tag');

  if (userType === 'unidentified') {
    // Hiện màn hình chọn vai trò, ẩn HRM
    if (hrmMain) hrmMain.style.display = 'none';
    if (unidentifiedScreen) {
      unidentifiedScreen.style.display = 'block';
      showUnidentifiedScreen();
    }
    if (trialTag) trialTag.style.display = 'none';
  } else if (userType === 'trial') {
    // Hiện HRM, hiện tag "Người dùng trải nghiệm"
    if (hrmMain) hrmMain.style.display = 'block';
    if (unidentifiedScreen) unidentifiedScreen.style.display = 'none';
    if (trialTag) {
      trialTag.style.display = 'inline-block';
      trialTag.textContent = T.trialTag;
      
      // Thêm sự kiện click để mở popup chính thức
      trialTag.onclick = function() {
        document.getElementById('unidentified-user-screen').style.display = 'none';
        document.getElementById('official-mode-popup').style.display = 'flex';
        document.getElementById('hrm-main').style.display = 'none'; // Ẩn HRM
        resetOrgCodeInput();
        renderOfficialPopupLang();
      };
    }
  } else if (userType === 'official') {
    // Hiện HRM, ẩn tag trải nghiệm
    if (hrmMain) hrmMain.style.display = 'block';
    if (unidentifiedScreen) unidentifiedScreen.style.display = 'none';
    if (trialTag) trialTag.style.display = 'none';
  }
}

// ==== Hàm hiển thị lại màn hình chọn vai trò ====
function showUnidentifiedScreen() {
  const screen = document.getElementById('unidentified-user-screen');
  if (!screen) return;
  screen.style.display = 'block';
  document.body.style.overflow = 'hidden';
  // Reset nội dung popup
  const container = screen.querySelector('.mode-selection-container');
  if (container) {
    container.innerHTML = `
      <div style="font-size:1.1rem; font-weight:700; margin-bottom: 18px;">
        ${T.unidentifiedTitle}
      </div>
      <div style="font-size:1rem; margin-bottom: 18px;">
        ${T.unidentifiedDesc}
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button id="btn-trial-mode" class="mode-btn trial-btn">${T.trialBtn}</button>
        <button id="btn-official-mode" class="mode-btn official-btn">${T.officialBtn}</button>
      </div>
    `;
    setupModeButtons();
  }
  // Ẩn popup khác
  const officialPopup = document.getElementById('official-mode-popup');
  if (officialPopup) officialPopup.style.display = 'none';
  const modalCreateOrg = document.getElementById('modal-create-org');
  if (modalCreateOrg) modalCreateOrg.style.display = 'none';
}


// ==== Reset input mã tổ chức + trạng thái popup ====
function resetOrgCodeInput() {
  const container = document.querySelector('.official-popup-inner');
  
  if (container) {
    container.innerHTML = `
      <div class="official-title" id="official-title">${T.officialTitle}</div>
      <div class="official-org-input">
        <input id="org-code-input" type="text" placeholder="${T.orgPlaceholder}" />
        <button id="clear-input-btn" style="display:none;">×</button>
      </div>
      <div id="org-code-error" class="input-error" style="display:none;"></div>
      <div id="org-found" class="org-found-container" style="display:none;">
        <div><b id="org-name"></b></div>
        <button id="btn-request-join">${T.join}</button>
      </div>
      <button id="btn-verify-org">${T.confirm}</button>
      <div class="divider" id="official-or">${T.or}</div>
      <button id="btn-create-org">${T.createOrg}</button>
    `;
  }

  // Gắn lại sự kiện cho các nút và input
  setupOrgCodeEvents();
  setupRequestJoinEvent();
  setupCreateOrgEvent();
}


// ==== Hàm cập nhật song ngữ cho popup chuyển chính thức ====
function renderOfficialPopupLang() {
  document.getElementById('official-title').innerHTML = T.officialTitle;
  document.getElementById('org-code-input').placeholder = T.orgPlaceholder;
  document.getElementById('btn-verify-org').textContent = T.confirm;
  document.getElementById('btn-request-join').textContent = T.join;
  document.getElementById('official-or').textContent = T.or;
  document.getElementById('btn-create-org').textContent = T.createOrg;
 
}

// ==== Xử lý popup chuyển chính thức: đóng về màn hình chọn vai trò + reset input ====
function setupOfficialPopupEvents() {
  // Đóng bằng nút X hoặc overlay
  document.querySelectorAll('#official-mode-popup .modal-close-x, #official-mode-popup button[aria-label="Đóng"]').forEach(btn => {
    btn.onclick = function () {
      document.getElementById('official-mode-popup').style.display = 'none';
      showUnidentifiedScreen();
      resetOrgCodeInput();
    };
  });
  // Đóng khi click ra ngoài
  const officialPopup = document.getElementById('official-mode-popup');
  if (officialPopup) {
    officialPopup.addEventListener('click', function (e) {
      if (e.target === this) {
        this.style.display = 'none';
        showUnidentifiedScreen();
        resetOrgCodeInput();
      }
    });
  }
}

// ==== Xác nhận mã tổ chức ====
function setupOrgCodeEvents() {
  const orgCodeInput = document.getElementById('org-code-input');
  const clearBtn = document.getElementById('clear-input-btn');
  const btnVerifyOrg = document.getElementById('btn-verify-org');
  const errorElement = document.getElementById('org-code-error');

  if (orgCodeInput && clearBtn) {
    orgCodeInput.addEventListener('input', function () {
      clearBtn.style.display = this.value.trim() !== '' ? 'block' : 'none';
    });
    clearBtn.onclick = function () {
      orgCodeInput.value = '';
      clearBtn.style.display = 'none';
      errorElement.style.display = 'none';
      document.getElementById('org-found').style.display = 'none';
      btnVerifyOrg.style.display = 'block';
      orgCodeInput.focus();
    };
  }
  if (btnVerifyOrg) {
    btnVerifyOrg.onclick = async function () {
      const code = orgCodeInput.value.trim();
      if (!code) {
        errorElement.textContent = T.error_empty;
        errorElement.style.display = 'block';
        return;
      }
      try {
        const response = await fetch('https://es.rta.vn/nerp_org/_search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "size": 1,
            "query": { "bool": { "must": [{ "term": { "org_id.raw": { "value": code } } }] } }
          })
        });
        const data = await response.json();
        if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
          errorElement.style.display = 'none';
          btnVerifyOrg.style.display = 'none';
          document.getElementById('org-name').textContent = data.hits.hits[0]._source.org_lb || (appLanguage === 'en' ? 'Organization' : 'Tổ chức');
          document.getElementById('org-found').style.display = 'block';
        } else {
          errorElement.textContent = T.error_notfound;
          errorElement.style.display = 'block';
        }
      } catch (error) {
        errorElement.textContent = T.error_notfound;
        errorElement.style.display = 'block';
      }
    };
  }
}

// ==== Yêu cầu tham gia tổ chức ====
function setupRequestJoinEvent() {
  const btnRequestJoin = document.getElementById('btn-request-join');
  if (btnRequestJoin) {
    btnRequestJoin.onclick = function () {
      const orgId = T.foundOrgInfo?.org_id;
      const orgName = T.foundOrgInfo?.org_name || 'Tổ chức';

      fetch('https://rthrm.rtworkspace.com/services/fireEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: 'rthrm.user',
          user_trial: '0',
          project_code: PROJECT_CODE,
          email: USER_EMAIL,
          username: USERNAME,
          fullname: USER_FULLNAME,
          user_role: 'ea8018e243_HRM Staff',
          org_id: orgId,
          org_name: orgName
        })
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(() => {
        showJoinNotify(orgName, getUserEmail());
      })
      .catch(err => {
        console.error('Join fireEvent error:', err);
        showJoinError();
      });
    };
  }

  function showJoinNotify(orgName, email) {
    const popup = document.getElementById('official-mode-popup');
    const container = popup.querySelector('.official-popup-inner');
    container.innerHTML = `
      <div style="font-size: 1rem; line-height: 1.6; color: #333; text-align: center;">
        ${T.joinNotify.replace('{org}', `<b>${orgName}</b>`).replace('{email}', `<b>${email}</b>`)}
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <button style="background: var(--primary-color, #009688); color: #fff; border: none; border-radius: 6px; padding: 5px 15px; font-weight: 500; font-size: 0.9rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer;" id="btn-close-request-join">${T.close}</button>
      </div>
    `;
    document.getElementById('btn-close-request-join').onclick = closeOfficialPopup;
  }

  function showJoinError() {
    const popup = document.getElementById('official-mode-popup');
    const container = popup.querySelector('.official-popup-inner');
    container.innerHTML = `
      <div style="color:red; font-weight:500; margin-bottom:8px; text-align:center;">
        ${appLanguage === 'vi' ? 'Đã xảy ra lỗi khi gửi yêu cầu.<br>Vui lòng thử lại sau!' : 'An error occurred while submitting the request.<br>Please try again!'}
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <button style="background: var(--primary-color, #009688); color: #fff; border: none; border-radius: 6px; padding: 5px 15px; font-weight: 500; font-size: 0.9rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer;" id="btn-close-request-join">${T.close}</button>
      </div>
    `;
    document.getElementById('btn-close-request-join').onclick = closeOfficialPopup;
  }
}


// ==== Nút khởi tạo tổ chức mới ====
function setupCreateOrgEvent() {
  const btnCreateOrg = document.getElementById('btn-create-org');
  if (btnCreateOrg) {
    btnCreateOrg.onclick = function () {
  document.getElementById('official-mode-popup').style.display = 'none';
  document.getElementById('modal-create-org').style.display = 'flex';
  setTimeout(renderOrgFormLang, 50); 
};
  }

  // Đóng modal tạo tổ chức
  const modalCreateOrg = document.getElementById('modal-create-org');
  if (modalCreateOrg) {
    modalCreateOrg.querySelector('.modal-close-x').onclick = function () {
      modalCreateOrg.style.display = 'none';
      showUnidentifiedScreen();
    };
  }
}


// ==== Biến toàn cục để lưu nguồn mở popup ====
let popupOrigin = null; // 'unidentified' hoặc 'trial'

// ==== Hàm mở popup chuyển sang người dùng chính thức ====
function openOfficialPopup(origin) {
  popupOrigin = origin;
  document.getElementById('official-mode-popup').style.display = 'flex';
  renderOfficialPopupLang();
  resetOrgCodeInput();

  // Ẩn/hiện nền phía sau popup theo nguồn mở
  if (origin === 'unidentified') {
    document.getElementById('unidentified-user-screen').style.display = 'none';
    document.getElementById('hrm-main').style.display = 'none';
  } else if (origin === 'trial') {
    // HRM vẫn hiện, chỉ cần show popup
    document.getElementById('unidentified-user-screen').style.display = 'none';
    document.getElementById('hrm-main').style.display = 'block';
  }
}

// ==== Hàm đóng popup chuyển chính thức, trở lại màn hình ban đầu ====
function closeOfficialPopup() {
  document.getElementById('official-mode-popup').style.display = 'none';
  if (popupOrigin === 'unidentified') {
    document.getElementById('unidentified-user-screen').style.display = 'block';
    document.getElementById('hrm-main').style.display = 'none';
  } else if (popupOrigin === 'trial') {
    document.getElementById('hrm-main').style.display = 'block';
    document.getElementById('unidentified-user-screen').style.display = 'none';
  }
  popupOrigin = null;
  resetOrgCodeInput();
}

// ==== Gắn sự kiện cho các nút mở popup ====
function setupModeButtons() {
  // Nút Trải nghiệm
  const btnTrial = document.getElementById('btn-trial-mode');
if (btnTrial) {
  btnTrial.onclick = function () {
    btnTrial.disabled = true; // Disable tạm thời để tránh bấm nhanh liên tiếp

    fetch('https://rthrm.rtworkspace.com/services/fireEvent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: 'rthrm.user',
        user_trial: '1',
        project_code: PROJECT_CODE,
        username: USERNAME,
        email: USER_EMAIL,
        fullname: USER_FULLNAME,
        user_role: 'ea8018e243_Nhóm trải nghiệm sản phẩm',
        org_id: 'ea8018e243',
        org_name: 'Real-Time Analytics'
      })
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(() => {
      // Cập nhật trạng thái userType
      userType = 'trial';
      renderByUserType(); // Gọi lại UI đúng

      // Hiển thị thông báo thành công
      const container = document.querySelector('.mode-selection-container');
      if (container) {
        container.innerHTML = `
          <div style="font-size:1rem;line-height:1.6;text-align:center;">
            ${T.trialNotify.replace('{user}', getUserName()).replace('{email}', getUserEmail())}
          </div>
          <div style="text-align:center;margin-top:16px;">
            <button style="background: var(--primary-color, #009688);color:#fff;border:none;border-radius:4px;padding:6px 18px;font-size:0.95rem;" id="btn-close-notify-inplace">${T.close}</button>
          </div>
        `;
        document.getElementById('btn-close-notify-inplace').onclick = showUnidentifiedScreen;
      }

      // Disable nút 15s để tránh spam
      setTimeout(() => {
        btnTrial.disabled = false;
      }, 15000);
    })
    .catch(err => {
      console.error('Trial fireEvent error:', err);

      // Hiển thị thông báo lỗi
      const container = document.querySelector('.mode-selection-container');
      if (container) {
        container.innerHTML = `
          <div style="color:red;font-weight:500;margin-bottom:8px;text-align:center;">
            ${appLanguage === 'vi' ? 'Đã xảy ra lỗi khi gửi yêu cầu.<br>Vui lòng thử lại sau!' : 'An error occurred while submitting the request.<br>Please try again!'}
          </div>
          <div style="text-align:center;margin-top:16px;">
            <button style="background: var(--primary-color, #009688);color:#fff;border:none;border-radius:4px;padding:6px 18px;font-size:0.95rem;" id="btn-close-notify-inplace">${T.close}</button>
          </div>
        `;
        document.getElementById('btn-close-notify-inplace').onclick = showUnidentifiedScreen;
      }

      // Gửi lỗi: mở lại nút Trial User
      btnTrial.disabled = false;
    });
  };
}


  // Nút Chính thức
  const btnOfficial = document.getElementById('btn-official-mode');
  if (btnOfficial) {
    btnOfficial.onclick = function () {
      openOfficialPopup('unidentified');
    };
  }
}

// ==== Gắn sự kiện cho tag trial user (nút cam góc phải) ====
function setupTrialTagEvent() {
  const trialTag = document.getElementById('trial-user-tag');
  if (trialTag) {
    trialTag.onclick = function () {
  openOfficialPopup('trial');
};
  }
}

// ==== Gắn sự kiện đóng popup chính thức ====
function setupOfficialPopupEvents() {
  // Đóng bằng dấu X
  document.querySelectorAll('#official-mode-popup .modal-close-x, #official-mode-popup button[aria-label="Đóng"]').forEach(btn => {
    btn.onclick = closeOfficialPopup;
  });
  // Đóng khi click ra ngoài
  const officialPopup = document.getElementById('official-mode-popup');
  if (officialPopup) {
    officialPopup.addEventListener('click', function (e) {
      if (e.target === this) closeOfficialPopup();
    });
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  // 1. Gọi checkUserType
  await checkUserType();

  // 2. Cập nhật giao diện theo loại người dùng
  renderOfficialPopupLang();
  renderByUserType();

  // 3. Gắn các sự kiện
  setupModeButtons();
  setupTrialTagEvent();
  setupOfficialPopupEvents();
  setupOrgCodeEvents();
  setupRequestJoinEvent();
  setupCreateOrgEvent();

    const modalCreateOrg = document.getElementById('modal-create-org');
  if (modalCreateOrg) {
    const observer = new MutationObserver(() => {
  if (modalCreateOrg.style.display === 'flex') {
    renderOrgFormLang();
    document.getElementById('org-name-input').value = USER_ORG_NAME;
    document.getElementById('contact-name').value = USER_FULLNAME;
    document.getElementById('contact-phone').value = USER_PHONE;
    document.getElementById('contact-email').value = USER_EMAIL;
  }
});
    observer.observe(modalCreateOrg, { attributes: true, attributeFilter: ['style'] });
  }

  const btnCloseNotification = document.getElementById('btn-close-notification');
if (btnCloseNotification) {
  btnCloseNotification.textContent = T.close;
  btnCloseNotification.onclick = function () {
    document.getElementById('notification-popup').style.display = 'none';
    if (userType === 'unidentified') {
      showUnidentifiedScreen();
    } else if (userType === 'trial') {
      document.getElementById('hrm-main').style.display = 'block';
    } else if (userType === 'official') {
      document.getElementById('hrm-main').style.display = 'block';
    }
  };
}
function generateRandomId(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
  const form = document.getElementById('org-create-form');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const orgName = document.getElementById('org-name-input').value.trim();
    const shortName = document.getElementById('org-shortname').value.trim();
    const contactName = document.getElementById('contact-name').value.trim();
    const contactEmail = document.getElementById('contact-email').value.trim();
    const contactPhone = document.getElementById('contact-phone').value.trim();
    let orgId;
if (userType === 'trial') {
  orgId = 'p' + generateRandomId(9);
} else if (userType === 'unidentified') {
  orgId = USER_ORG_ID;
}

    const payload = {
      event_id: 'rthrm.neworg',
      new_org: '1',
      project_code: PROJECT_CODE,
      username: USERNAME,
      email: USER_EMAIL,
      fullname: USER_FULLNAME,
      org_id: orgId,
      org_name: shortName,
      user_role: 'ea8018e243_HRM Manager',
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone
    };

  fetch('https://rthrm.rtworkspace.com/services/fireEvent', {
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
  document.getElementById('notification-message').innerHTML = T.notify(orgName, contactEmail);
  document.getElementById('notification-popup').style.display = 'flex';
  form.reset();
})
.catch(err => {
  console.error('Submit error:', err);
  document.getElementById('modal-create-org').style.display = 'none';
  document.getElementById('notification-message').innerHTML = `
    <div style="color: red; font-weight: 500; margin-bottom: 8px; text-align:center;">${appLanguage === 'vi' ? 'Đã xảy ra lỗi khi gửi yêu cầu.<br>Vui lòng thử lại sau!' : 'An error occurred while submitting the request.<br>Please try again!'}</div>
  `;
  document.getElementById('notification-popup').style.display = 'flex';
});



  });
}

  // 4. Cập nhật ngôn ngữ, tiêu đề, label
  document.getElementById('month-title').textContent = T.monthTitle(T.monthNames[new Date().getMonth()], new Date().getFullYear());
  document.getElementById('week-title').textContent = T.weekTitle("14/04", "20/04");

  const weekdaysRow = document.getElementById('weekdays-row');
  weekdaysRow.innerHTML = '';
  T.weekdayNames.forEach(name => {
    const div = document.createElement('div');
    div.textContent = name;
    weekdaysRow.appendChild(div);
  });

  document.getElementById('loading-text').textContent = T.loading;
  document.getElementById('error').textContent = T.error;
  document.getElementById('view-history-label').textContent = T.checkinHistory;
  document.getElementById('label-leave').textContent = T.leave;
  document.getElementById('label-ot').textContent = T.ot;
  document.getElementById('label-salary').textContent = T.salary;
  document.getElementById('label-business').textContent = T.business;
  document.getElementById('label-rule').textContent = T.rule;
  document.getElementById('label-benefit').textContent = T.benefit;
  document.getElementById('label-task').textContent = T.task;
  document.getElementById('label-asset').textContent = T.asset;
  document.getElementById('label-expense').textContent = T.expense;
  document.getElementById('dashboard-btn').title = T.dashboard;
  document.getElementById('modal-title').textContent = T.dayDetail("dd/mm/yyyy");
});
    
  // JSON cho Nghỉ phép và Tăng ca
const actionBarJson = {
  leave: {
    actionID: 1,
    orderNumber: 1,
    type: "act_dm_view",
    alias: "t72ep_t72ep01a11",
    post: "{\"size\":1}"
  },
  ot: {
    actionID: 2,
    orderNumber: 2,
    type: "act_dm_view",
    alias: "t72ep_t72ep01a16",
    post: "{\"size\":1}"
  },
  salary: {
    actionID: 3,
    orderNumber: 3,
    type: "act_open_module",
    destinationCode: "my360",
    destinationType: "module"
  }
};
  async function fetchData(){
  showLoading(false);
  errorElem.style.display='none';
  try{
  const[attendanceResponse,leaveResponse,holidayResponse]=await Promise.all([
  fetch('https://es.rta.vn/hr_checkinout_list_v4/_search',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
  "size":10000,
  "collapse":{"field":"keyid_ins.raw"},
  "_source":{"includes":["rta_time_fm","view_mark","view_mark_lb","erp_salary_unit","chkin_time","chkout_time","erp_shift_lb","rta_date","hr_month","hr_year","nb_count","keyid_ins","erp_shift_id","rta_shift_id","chkin_time_fm","shift_lb_en","shift_lb_vi"]},
  "query":{"bool":{"must":[
  {"term":{"org_id.raw":{"value":USER_ORG_ID}}},
  {"term":{"username.raw":{"value":USERNAME}}},
  {"range":{"hr_year":{"gte":"now/y"}}}
  ]}},
  "sort":[{"endtime":{"order":"desc"}}]
  })
  }),
  fetch('https://es.rta.vn/hr_leave_tracking/_search',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
  "size":10000,
  "collapse":{"field":"keyid_ins.raw"},
  "_source":{"includes":["leave_status_id","erp_shift_lb","rta_date","nb_count","keyid_ins"]},
  "query":{"bool":{"must":[
  {"term":{"org_id.raw":{"value":USER_ORG_ID}}},
  {"term":{"username.raw":{"value":USERNAME}}},
  {"range":{"rta_date":{"gte":"now/y"}}}
  ]}},
  "sort":[{"endtime":{"order":"desc"}}]
  })
  }),
  fetch('https://es.rta.vn/erp_holiday/_search',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
  "size":10000,
  "collapse":{"field":"keyid_ins.raw"},
  "_source":{"includes":["erp_holiday_status_id","erp_holiday_lb","erp_shift_lb","rta_date","hr_month","hr_year","nb_count","keyid_ins"]},
  "query":{"bool":{"must":[
  {"range":{"nb_count":{"gt":"0"}}},
  {"term":{"org_id.raw":{"value":USER_ORG_ID}}}
  ]}},
  "sort":[{"endtime":{"order":"desc"}}]
  })
  })
  ]);
  const[attendanceResult,leaveResult,holidayResult]=await Promise.all([
  attendanceResponse.json(),
  leaveResponse.json(),
  holidayResponse.json()
  ]);
  attendanceData=attendanceResult.hits?attendanceResult.hits.hits.map(hit=>hit._source):[];
  leaveData=leaveResult.hits?leaveResult.hits.hits.map(hit=>hit._source):[];
  holidayData=holidayResult.hits?holidayResult.hits.hits.map(hit=>hit._source):[];
  leaveData=leaveData.filter(item=>[1,2,3,4,6].includes(parseInt(item.leave_status_id||0)));
  holidayData=holidayData.filter(item=>item.erp_holiday_status_id==1);
  leaveData=leaveData.filter(item=>parseFloat(item.nb_count||0)>0);
  latestCheckin=findLatestCheckin(attendanceData);
  updateLastCheckinInfo(latestCheckin);
  updateAttendanceActions();
  calculateZeroWorkDays();
  showLoading(false);
  if(attendanceData.length===0&&leaveData.length===0&&holidayData.length===0){
  errorElem.textContent = T.notFound;
  errorElem.style.display='block';
  return;
  }
  renderCalendar();
  }catch(error){
  showLoading(false);
  errorElem.textContent = `${T.error}: ${error.message}`;
  errorElem.style.display='block';
  }
  }

  function callAction(alias, size, collapseField, queryMust, sortField, sortOrder) {
  const postObj = {
    size: size,
    collapse: { field: collapseField },
    query: { bool: { must: queryMust } },
    sort: [{ [sortField]: { order: sortOrder } }]
  };
  const jsonObj = {
    type: "act_dm_view",
    alias: alias,
    post: JSON.stringify(postObj)
  };
  App.callActionButton(JSON.stringify(jsonObj));
}

function viewCheckinHistory() {
  callAction(
    "t72ep_t72ep01a1",
    300,
    "key_ins.raw",
    [
      { term: { "org_id.raw": { value: USER_ORG_ID } } },
      { term: { "username.raw": { value: USERNAME } } },
      { range: { "rta_date": { gt: "2024-12-31" } } }
    ],
    "endtime",
    "desc"
  );
}

function callActionArrow() {
  callAction(
    "t72ep_t72ep01a2",
    1,
    "username.raw",
    [
      { term: { "organization_id.raw": { value: USER_ORG_ID } } },
      { term: { "username.raw": { value: USERNAME } } }
    ],
    "added_date",
    "desc"
  );
}



  async function fetchDataNotif() {
      const res = await fetch('https://es.rta.vn/hrm_notif/_search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "size": 10000,
          "collapse": { "field": "key_ins.raw" },
          "query": {
            "bool": {
              "must": [
                { "term": { "org_id.raw": { "value": USER_ORG_ID } } }
              ]
            }
          },
          "sort": [{ "endtime": { "order": "desc" } }]
        })
      });
      const data = await res.json();
      const items = data.hits.hits.filter(i => i._source.status == 1);
      renderNotifCards(items.map(i => i._source));
    }   

const $=id=>document.getElementById(id);
const monthTitle=$('month-title');
const weekTitle=$('week-title');
const weekView=$('week-view');
const calendarView=$('calendar-view');
const loadingElem=$('loading');
const errorElem=$('error');
const expandToggle=$('expand-toggle');
const modalOverlay=$('modal-overlay');
const eventModal=$('event-modal');
const modalTitle=$('modal-title');
const modalContent=$('modal-content');
const closeModal=$('close-modal');
const prevMonthBtn=$('prev-month');
const nextMonthBtn=$('next-month');
const prevWeekBtn=$('prev-week');
const nextWeekBtn=$('next-week');
const lastCheckinTime=$('last-checkin-time');
const statusIndicator=$('status-indicator');
const viewHistoryBtn=$('view-history');
const monthHeader=document.querySelector('.month-header');
const weekHeader=document.querySelector('.week-header');
let currentDate=new Date();
let weekStartDate=new Date(currentDate);
let currentMonth=currentDate.getMonth();
let currentYear=currentDate.getFullYear();
let isMonthView=false;
let attendanceData=[];
let leaveData=[];
let holidayData=[];
let zeroWorkData=[];
let latestCheckin=null;
adjustToMonday(weekStartDate);
const monthNames = T.monthNames;
const weekdayNames = T.weekdayNames;
function formatDate(dateString){
if(!dateString)return'N/A';
const parts=dateString.split('-');
if(parts.length!==3)return dateString;
return`${parts[2]}/${parts[1]}/${parts[0]}`;
}
function formatDateWithWeekday(date){
const day=date.getDate().toString().padStart(2,'0');
const month=(date.getMonth()+1).toString().padStart(2,'0');
const year=date.getFullYear();
const weekday=T.weekdayNames[date.getDay()];
return`${weekday} ${day}/${month}/${year}`;
}
function adjustToMonday(date){
const day=date.getDay();
const diff=date.getDate()-day+(day===0?-6:1);
date.setDate(diff);
return date;
}
function updateWeekTitle(){
const weekEnd=new Date(weekStartDate);
weekEnd.setDate(weekStartDate.getDate()+6);
const startDay=weekStartDate.getDate().toString().padStart(2,'0');
const startMonth=(weekStartDate.getMonth()+1).toString().padStart(2,'0');
const endDay=weekEnd.getDate().toString().padStart(2,'0');
const endMonth=(weekEnd.getMonth()+1).toString().padStart(2,'0');
weekTitle.textContent = T.weekTitle(`${startDay}/${startMonth}`, `${endDay}/${endMonth}`);
}
function formatCheckInTime(timeString){
  if(!timeString)return 'N/A';
  try{
    const date=new Date(timeString);
    const weekday=T.weekdayNames[(date.getDay()+6)%7];
    const day=date.getDate().toString().padStart(2,'0');
    const month=(date.getMonth()+1).toString().padStart(2,'0');
    const year=date.getFullYear();
    const hours=date.getHours().toString().padStart(2,'0');
    const minutes=date.getMinutes().toString().padStart(2,'0');
    return`${weekday} ${day}/${month}/${year} ${hours}:${minutes}`;
  }catch(error){
    return timeString;
  }
}


function findLatestCheckin(data){
if(!data||data.length===0)return null;
const sorted=[...data].sort((a,b)=>{
const timeA=a.rta_time_fm?new Date(a.rta_time_fm).getTime():0;
const timeB=b.rta_time_fm?new Date(b.rta_time_fm).getTime():0;
return timeB-timeA;
});
return sorted[0];
}

function updateLastCheckinInfo(checkin){
    const statusTag = document.getElementById('last-checkin-status');
    if(!checkin){
      lastCheckinTime.textContent='--:--';
      statusIndicator.className='status-indicator';
      if(statusTag) statusTag.textContent = T.firstCheckin;
      return;
    }
    lastCheckinTime.textContent = formatCheckInTime(checkin.rta_time_fm);
    statusIndicator.className = 'status-indicator';
  
    // Xác định trạng thái dựa vào view_mark_lb
    let statusText = '';
    switch (checkin.view_mark_lb) {
      case 'IN':
        statusText = T.in;
        break;
      case 'TMPIN':
        statusText = T.tempin;
        break;
      case 'OUT':
        statusText = T.out;
        break;
      case 'TMPOUT':
        statusText = T.tempout;
        break;
      default:
        statusText = '';
    }
    if(statusTag) statusTag.textContent = statusText;
  
    // Giữ logic màu status-indicator như cũ
    const viewMark = parseInt(checkin.view_mark || 0);
    if(viewMark === 1){ statusIndicator.classList.add('status-green'); }
    else if(viewMark === 2){ statusIndicator.classList.add('status-blue'); }
    else if(viewMark === 3){ statusIndicator.classList.add('status-red'); }
  }
function calculateZeroWorkDays(){
zeroWorkData=[];
const year=currentYear;
const month=currentMonth;
const daysInMonth=new Date(year,month+1,0).getDate();
for(let day=1;day<=daysInMonth;day++){
const date=new Date(year,month,day);
const dayOfWeek=date.getDay();
if(dayOfWeek===0||dayOfWeek===6){
const formattedDay=day.toString().padStart(2,'0');
const formattedMonth=(month+1).toString().padStart(2,'0');
const formattedDate=`${year}-${formattedMonth}-${formattedDay}`;
const hasAttendance=attendanceData.some(item=>item.rta_date===formattedDate);
const hasLeave=leaveData.some(item=>item.rta_date===formattedDate);
const hasHoliday=holidayData.some(item=>item.rta_date===formattedDate);
if(!hasAttendance&&!hasLeave&&!hasHoliday){
zeroWorkData.push({
rta_date:formattedDate,
hr_month:month+1,
hr_year:year,
nb_count:"0"
});
}
}
}
}
function showLoading(show){loadingElem.style.display=show?'block':'none';}
function renderCalendar(){
updateMonthTitle();
updateWeekTitle();
if(isMonthView){renderMonthView();}
else{renderWeekView();}
}
function updateMonthTitle(){monthTitle.textContent = T.monthTitle(T.monthNames[currentMonth], currentYear);
}
function renderWeekView(){
weekView.innerHTML='';
for(let i=0;i<7;i++){
const date=new Date(weekStartDate);
date.setDate(weekStartDate.getDate()+i);
const dayCell=createDayCell(date);
weekView.appendChild(dayCell);
}
}
function renderMonthView(){
weekView.innerHTML='';
const firstDay=new Date(currentYear,currentMonth,1);
const lastDay=new Date(currentYear,currentMonth+1,0);
const daysInMonth=lastDay.getDate();
let firstDayOfWeek=firstDay.getDay()||7;
for(let i=1;i<firstDayOfWeek;i++){
  // Lấy ngày cuối của tháng trước
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  const date = new Date(prevYear, prevMonth, daysInPrevMonth - (firstDayOfWeek - i - 1));
  const dayCell = createDayCell(date, true); // true: là ngày ngoài tháng
  weekView.appendChild(dayCell);
}

for(let i=1;i<=daysInMonth;i++){
const date=new Date(currentYear,currentMonth,i);
const dayCell=createDayCell(date);
weekView.appendChild(dayCell);
}
const lastDayOfWeek=lastDay.getDay()||7;
for(let i=lastDayOfWeek+1;i<=7;i++){
  // Lấy ngày đầu của tháng sau
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const date = new Date(nextYear, nextMonth, i - lastDayOfWeek);
  const dayCell = createDayCell(date, true);
  weekView.appendChild(dayCell);
}
}
function createDayCell(date, isOutsideMonth = false) {
  const cell = document.createElement('div');
  cell.className = 'day-cell';
  if (date.getMonth() !== currentMonth) {
    cell.classList.add('outside-month');
  }
  const today = new Date();
if(date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()){
  cell.classList.add('today');
}
if(date.getMonth() !== currentMonth){
  cell.classList.add('empty');

}
const dayNumber=document.createElement('div');
dayNumber.className='day-number';
dayNumber.textContent=date.getDate();
cell.appendChild(dayNumber);
const formattedDay=date.getDate().toString().padStart(2,'0');
const formattedMonth=(date.getMonth()+1).toString().padStart(2,'0');
const formattedDate=`${date.getFullYear()}-${formattedMonth}-${formattedDay}`;
const eventDots=document.createElement('div');
eventDots.className='event-dots';
cell.appendChild(eventDots);
const attendanceEvents=filterEventsByDate(attendanceData,formattedDate);
const leaveEvents=filterEventsByDate(leaveData,formattedDate);
const holidayEvents=filterEventsByDate(holidayData,formattedDate);
const zeroEvents=filterEventsByDate(zeroWorkData,formattedDate);
if (attendanceEvents.length > 0) {
  attendanceEvents.forEach(event => {
    let dot = document.createElement('div');
    let count = Number.parseFloat(event.nb_count || 0).toFixed(1);
    if (event.erp_salary_unit == 1) {
      dot.className = 'event-dot attendance-day';
      dot.textContent = count;
    } else if (event.erp_salary_unit == 2) {
      dot.className = 'event-dot attendance-hour';
      dot.textContent = count;
    } else if (event.erp_salary_unit == 3) {
      dot.className = 'event-dot attendance-ot';
      dot.textContent = ''; // No number inside
    }
    eventDots.appendChild(dot); // Sửa 'container' thành 'eventDots'
  });
}
if(leaveEvents.length>0){
addEventDot(eventDots,'leave',calculateTotalCount(leaveEvents), formattedDate);
}
if(holidayEvents.length>0){
addEventDot(eventDots,'holiday',calculateTotalCount(holidayEvents), formattedDate);
}
if(zeroEvents.length>0&&(attendanceEvents.length>0||leaveEvents.length>0||holidayEvents.length>0)){
addEventDot(eventDots,'zero',0);
}
if(attendanceEvents.length>0||leaveEvents.length>0||holidayEvents.length>0){
cell.addEventListener('click',()=>{
showEventDetails(formattedDate,attendanceEvents,leaveEvents,holidayEvents);
});
}
return cell; 
}
function filterEventsByDate(events,dateString){
return events.filter(event=>event.rta_date===dateString);
}
function calculateTotalCount(events){
return events.reduce((total,event)=>{
return total+parseFloat(event.nb_count||0);
},0).toFixed(1);
}


function addEventDot(container, type, count, dateStr) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; 
  if (['attendance', 'leave', 'holiday'].includes(type)) {
    const parsedCount = parseFloat(count);
    if (dateStr === todayStr) {
      const dot = document.createElement('div');
      dot.className = `event-dot ${type}`;
      dot.textContent = Number.parseFloat(parsedCount.toFixed(1));
      container.appendChild(dot);
      return;
    }
    if (parsedCount > 0) {
      const dot = document.createElement('div');
      dot.className = `event-dot ${type}`;
      dot.textContent = Number.parseFloat(parsedCount.toFixed(1));
      container.appendChild(dot);
    }
  }
}

function showEventDetails(date, attendanceEvents, leaveEvents, holidayEvents) {
    const formattedDate = formatDate(date);
    modalTitle.textContent = T.dayDetail(formattedDate);
    let content = '';

    // Helper function để lấy label đơn vị
    function getUnitLabel(event) {
        if (event.erp_salary_unit == 1) {
            return appLanguage === 'en' ? 'Day(s)' : 'Ngày công';
        }
        if (event.erp_salary_unit == 2) {
            return appLanguage === 'en' ? 'Hour(s)' : 'Giờ công';
        }
        if (event.erp_salary_unit == 3) {
            return appLanguage === 'en' ? 'Overtime hour' : 'Giờ Tăng ca';
        }
        return T.unit; // Fallback
    }

    // Tạo hàm xử lý sự kiện click nút Report OT
    window.reportOTClick = function(shiftId) {
        const reportJson = {
            "actionID": 1,
            "orderNumber": 1,
            "type": "act_fill_form",
            "formID": "",
            "familyID": "HR_OVERTIME_2",
            "preload": [{
                "key": "rta_shift_txt",
                "value": shiftId
            }]
        };
        
        if (typeof App !== 'undefined' && typeof App.callActionButton === 'function') {
            App.callActionButton(JSON.stringify(reportJson));
        } else {
            showFlashMessage(T.featureNotSupported || 'Feature not supported');
        }
    };

    // Xử lý chấm công
    if (attendanceEvents.length > 0) {
        content += `<div class="event-list"><h4>${T.attendance}</h4>`;
        attendanceEvents.forEach(event => {
            content += `
            <div class="event-item">
                <div class="event-header">
                    <span class="event-title">${event.erp_shift_lb || T.attendance}</span>`;
            
            // Kiểm tra nếu là giờ tăng ca
            if (event.erp_salary_unit == 3) {
                // Hiển thị nút Báo cáo OT
                content += `
                    <button class="ot-report-btn" onclick="reportOTClick('${event.rta_shift_id || ''}')">
                        ${appLanguage === 'en' ? 'Report OT' : 'Báo cáo OT'}
                    </button>`;
            } else {
                // Hiển thị số công và đơn vị như bình thường
                content += `
                    <span class="event-count">
                        ${event.nb_count || '0'} ${getUnitLabel(event)}
                    </span>`;
            }
            
            content += `
                </div>
                ${event.chkin_time || event.chkout_time ? `
                <div class="event-details">
                    ${event.chkin_time ? `IN: ${event.chkin_time}` : ''}<br>
                    ${event.chkout_time ? `OUT: ${event.chkout_time}` : ''}
                </div>` : ''}
            </div>`;
        });
        content += `</div>`;
    }

    // Xử lý nghỉ phép (không thay đổi)
    if (leaveEvents.length > 0) {
        content += `<div class="event-list"><h4>${T.leaveDetail}</h4>`;
        leaveEvents.forEach(event => {
            content += `
            <div class="event-item">
                <div class="event-header">
                    <span class="event-title">${event.erp_shift_lb || T.leaveDetail}</span>
                    <span class="event-count">
                        ${event.nb_count || '0'} ${appLanguage === 'en' ? 'Day(s)' : 'Ngày công'}
                    </span>
                </div>
            </div>`;
        });
        content += `</div>`;
    }

    // Xử lý ngày lễ (không thay đổi)
    if (holidayEvents.length > 0) {
        content += `<div class="event-list"><h4>${T.holiday}</h4>`;
        holidayEvents.forEach(event => {
            content += `
            <div class="event-item">
                <div class="event-header">
                    <span class="event-title">${event.erp_holiday_lb || T.holiday}</span>
                    <span class="event-count">
                        ${event.nb_count || '0'} ${appLanguage === 'en' ? 'Day(s)' : 'Ngày công'}
                    </span>
                </div>
                ${event.erp_shift_lb ? `
                <div class="event-details">
                    ${event.erp_shift_lb}
                </div>` : ''}
            </div>`;
        });
        content += `</div>`;
    }

    modalContent.innerHTML = content || `<div class="event-item">${T.notFound}</div>`;
    modalOverlay.style.display = 'block';
    eventModal.style.display = 'block';
}





function toggleView(){
isMonthView=!isMonthView;
if(isMonthView){
expandToggle.textContent='▲';
calendarView.style.maxHeight='800px';
monthHeader.style.display='flex';
weekHeader.style.display='none';
}else{
expandToggle.textContent='▼';
calendarView.style.maxHeight='150px';
monthHeader.style.display='none';
weekHeader.style.display='flex';
}
renderCalendar();
}
function goToPrevMonth(){
currentMonth--;
if(currentMonth<0){
currentMonth=11;
currentYear--;
}
fetchData();
}
function goToNextMonth(){
currentMonth++;
if(currentMonth>11){
currentMonth=0;
currentYear++;
}
fetchData();
}
function goToPrevWeek(){
weekStartDate.setDate(weekStartDate.getDate()-7);
currentMonth=weekStartDate.getMonth();
currentYear=weekStartDate.getFullYear();
updateWeekTitle();
renderWeekView();
}
function goToNextWeek(){
weekStartDate.setDate(weekStartDate.getDate()+7);
currentMonth=weekStartDate.getMonth();
currentYear=weekStartDate.getFullYear();
updateWeekTitle();
renderWeekView();
}

expandToggle.addEventListener('click',toggleView);
prevMonthBtn.addEventListener('click',goToPrevMonth);
nextMonthBtn.addEventListener('click',goToNextMonth);
prevWeekBtn.addEventListener('click',goToPrevWeek);
nextWeekBtn.addEventListener('click',goToNextWeek);
viewHistoryBtn.addEventListener('click',viewCheckinHistory);
closeModal.addEventListener('click',()=>{
modalOverlay.style.display='none';
eventModal.style.display='none';
});
modalOverlay.addEventListener('click',()=>{
modalOverlay.style.display='none';
eventModal.style.display='none';
});
document.addEventListener('DOMContentLoaded',()=>{fetchData();});


function renderAttendanceActions(view_mark){
const container=document.getElementById('attendance-action-container');
container.innerHTML='';
let title='';
let buttons=[];
const BTN={
checkin_qr:{
label:'QR',
icon:`<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="6" height="6" stroke="currentColor" stroke-width="4" rx="2"/><rect x="15" y="3" width="6" height="6" stroke="currentColor" stroke-width="4" rx="2"/><rect x="3" y="15" width="6" height="6" stroke="currentColor" stroke-width="4" rx="2"/><rect x="9" y="9" width="6" height="6" fill="currentColor" fill-opacity="0.12"/><rect x="17" y="17" width="2" height="2" fill="currentColor"/><rect x="13" y="17" width="2" height="2" fill="currentColor"/><rect x="17" y="13" width="2" height="2" fill="currentColor"/></svg>`,
onClick:function(){
if(!latestCheckin)return;
const json={
actionID:1,
orderNumber:1,
type:"act_fill_form",
familyID:"HR_CHECKIN",
preload:[
{key:"time_txt",value:latestCheckin.rta_time_fm||""},
{key:"rta_type",value:"1"}
]
};
App.callActionButton(JSON.stringify(json));
}
},
checkin_remote:{
label: T.checkinRemote,
icon:`<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 48 48" fill="none"><path d="M24 6C16.268 6 10 12.268 10 20c0 7.732 10.5 18 14 21.5C27.5 38 38 27.732 38 20c0-7.732-6.268-14-14-14Z" stroke="currentColor" stroke-width="7" fill="none"/><circle cx="24" cy="20" r="5" stroke="currentColor" stroke-width="3" fill="none"/><path d="M34 41a10 4 0 1 1-20 0" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
onClick:function(){
if(!latestCheckin)return;
const json={
actionID:3,
orderNumber:1,
type:"act_fill_form",
familyID:"HR_CHECKIN",
preload:[
{key:"time_txt",value:latestCheckin.rta_time_fm||""},
{key:"rta_type",value:"2"}
]
};
App.callActionButton(JSON.stringify(json));
}
},

new_qr:{
label:'QR',
icon:`<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="6" height="6" stroke="currentColor" stroke-width="4" rx="2"/><rect x="15" y="3" width="6" height="6" stroke="currentColor" stroke-width="4" rx="2"/><rect x="3" y="15" width="6" height="6" stroke="currentColor" stroke-width="4" rx="2"/><rect x="9" y="9" width="6" height="6" fill="currentColor" fill-opacity="0.12"/><rect x="17" y="17" width="2" height="2" fill="currentColor"/><rect x="13" y="17" width="2" height="2" fill="currentColor"/><rect x="17" y="13" width="2" height="2" fill="currentColor"/></svg>`,
onClick:function(){

const json={
actionID:1,
orderNumber:1,
type:"act_fill_form",
familyID:"HR_CHECKIN",
preload:[
{key:"time_txt",value:"2024-01-01 00:00:00"},
{key:"rta_type",value:"1"}
]
};
App.callActionButton(JSON.stringify(json));
}
},
new_remote:{
label: T.checkinRemote,
icon:`<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 48 48" fill="none"><path d="M24 6C16.268 6 10 12.268 10 20c0 7.732 10.5 18 14 21.5C27.5 38 38 27.732 38 20c0-7.732-6.268-14-14-14Z" stroke="currentColor" stroke-width="7" fill="none"/><circle cx="24" cy="20" r="5" stroke="currentColor" stroke-width="3" fill="none"/><path d="M34 41a10 4 0 1 1-20 0" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
onClick:function(){

const json={
actionID:3,
orderNumber:1,
type:"act_fill_form",
familyID:"HR_CHECKIN",
preload:[
{key:"time_txt",value:"2024-01-01 00:00:00"},
{key:"rta_type",value:"2"}
]
};
App.callActionButton(JSON.stringify(json));
}
},


checkin_temp:{
label: T.checkinTemp,
icon:`<i class="fa fa-hourglass-half attendance-btn-icon"></i>`,
onClick:function(){
if(!latestCheckin)return;
const json={
actionID:7,
orderNumber:1,
type:"act_fill_form",
familyID:"HR_CHECKIN",
openArgs:{
erp_shift_id:latestCheckin.erp_shift_id||"",
rta_shift_id:latestCheckin.rta_shift_id||"",
rta_datetime_in:latestCheckin.chkin_time_fm||""
},
preload:[
{key:"rta_type",value:"3"},
{key:"shift_lb_en",value:latestCheckin.shift_lb_en||""},
{key:"shift_lb_vi",value:latestCheckin.shift_lb_vi||""},
{key:"time_txt",value:latestCheckin.rta_time_fm||""}
]
};
App.callActionButton(JSON.stringify(json));
}
},
checkout_qr:{
label:'QR',
icon:`<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="6" height="6" stroke="currentColor" stroke-width="4" rx="2"/><rect x="15" y="3" width="6" height="6" stroke="currentColor" stroke-width="4" rx="2"/><rect x="3" y="15" width="6" height="6" stroke="currentColor" stroke-width="4" rx="2"/><rect x="9" y="9" width="6" height="6" fill="currentColor" fill-opacity="0.12"/><rect x="17" y="17" width="2" height="2" fill="currentColor"/><rect x="13" y="17" width="2" height="2" fill="currentColor"/><rect x="17" y="13" width="2" height="2" fill="currentColor"/></svg>`,
onClick:function(){
if(!latestCheckin)return;
const json={
actionID:2,
orderNumber:1,
type:"act_fill_form",
familyID:"HR_CHECKOUT",
openArgs:{
erp_shift_id:latestCheckin.erp_shift_id||"",
rta_shift_id:latestCheckin.rta_shift_id||"",
rta_datetime_in:latestCheckin.chkin_time_fm||""
},
preload:[
{key:"rta_type",value:"1"},
{key:"shift_lb_en",value:latestCheckin.shift_lb_en||""},
{key:"shift_lb_vi",value:latestCheckin.shift_lb_vi||""},
{key:"time_txt",value:latestCheckin.rta_time_fm||""}
]
};
App.callActionButton(JSON.stringify(json));
}
},
checkout_remote:{
  label: T.checkinRemote,
icon:`<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 48 48" fill="none"><path d="M24 6C16.268 6 10 12.268 10 20c0 7.732 10.5 18 14 21.5C27.5 38 38 27.732 38 20c0-7.732-6.268-14-14-14Z" stroke="currentColor" stroke-width="7" fill="none"/><circle cx="24" cy="20" r="5" stroke="currentColor" stroke-width="3" fill="none"/><path d="M34 41a10 4 0 1 1-20 0" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
onClick:function(){
if(!latestCheckin)return;
const json={
actionID:4,
orderNumber:1,
type:"act_fill_form",
familyID:"HR_CHECKOUT",
openArgs:{
erp_shift_id:latestCheckin.erp_shift_id||"",
rta_shift_id:latestCheckin.rta_shift_id||"",
rta_datetime_in:latestCheckin.chkin_time_fm||""
},
preload:[
{key:"rta_type",value:"2"},
{key:"shift_lb_en",value:latestCheckin.shift_lb_en||""},
{key:"shift_lb_vi",value:latestCheckin.shift_lb_vi||""},
{key:"time_txt",value:latestCheckin.rta_time_fm||""}
]
};
App.callActionButton(JSON.stringify(json));
}
},
checkout_temp:{
  label: T.checkinTemp,
icon:`<i class="fa fa-clock-o attendance-btn-icon"></i>`,
onClick:function(){
if(!latestCheckin)return;
const json={
actionID:8,
orderNumber:1,
type:"act_fill_form",
familyID:"HR_CHECKOUT",
openArgs:{
erp_shift_id:latestCheckin.erp_shift_id||"",
rta_shift_id:latestCheckin.rta_shift_id||"",
rta_datetime_in:latestCheckin.chkin_time_fm||""
},
preload:[
{key:"rta_type",value:"3"},
{key:"shift_lb_en",value:latestCheckin.shift_lb_en||""},
{key:"shift_lb_vi",value:latestCheckin.shift_lb_vi||""},
{key:"time_txt",value:latestCheckin.rta_time_fm||""}
]
};
App.callActionButton(JSON.stringify(json));
}
}
};
if(view_mark==1){
title=T.attendanceActionCheckout || 'Check-Out';
buttons=[BTN.checkout_qr,BTN.checkout_remote,BTN.checkout_temp];
}else if(view_mark==3){
title=T.attendanceActionCheckin || 'Check-In';
buttons=[BTN.checkin_qr,BTN.checkin_remote];
}else if(view_mark==2){
title=T.attendanceActionCheckin || 'Check-In';
buttons=[BTN.checkin_temp];
}else if(view_mark==0){
title=T.attendanceActionCheckin || 'Check-In';
buttons=[BTN.new_qr,BTN.new_remote];
}
if(title){
container.innerHTML+=`<div class="attendance-action-title" style="color:#222;font-weight:bold;font-size:16px;padding-left:14px">${title}</div>`;
}
if(buttons.length){
let html=`<div class="attendance-action-buttons">`;
buttons.forEach((btn,idx)=>{
html+=`<button class="attendance-btn" type="button" onclick="attendanceButtonHandlers[${idx}]()">
<div class="attendance-btn-icon-bg">${btn.icon}</div>
<span class="attendance-btn-label">${btn.label}</span>
</button>`;
});
html+=`</div>`;
container.innerHTML+=html;
window.attendanceButtonHandlers=buttons.map(btn=>btn.onClick);
}
}
function updateAttendanceActions() {
  const view_mark = latestCheckin ? Number(latestCheckin.view_mark) : 0;
  renderAttendanceActions(view_mark);
}
updateAttendanceActions();



document.addEventListener('DOMContentLoaded', function () {
const actionBarScroll = document.querySelector('.action-bar-scroll');
const items = document.querySelectorAll('.action-bar-item');
const indicatorBar = document.querySelector('.indicator-bar');
let currentPage = 0;

function getIconsPerPage() {
if (window.innerWidth < 350) return 3;
if (window.innerWidth < 600) return 4;
if (window.innerWidth < 800) return 5;
return 10;
}

function calculateTotalPages() {
// Calculate how many icons fit on the screen
const iconsPerPage = getIconsPerPage();

// Calculate total width needed for all icons
const itemWidth = items[0].offsetWidth + 18; // 18 is the gap
const totalWidth = items.length * itemWidth;
const containerWidth = actionBarScroll.parentElement.clientWidth;

// If all icons fit completely within the container, return 1 page
if (totalWidth <= containerWidth) {
return 1;
}

// Otherwise calculate pages normally
return Math.ceil(items.length / iconsPerPage);
}

function updateCarousel(pageIdx) {
const iconsPerPage = getIconsPerPage();
const itemWidth = items[0].offsetWidth + 18; // 18 là gap

// Ẩn tất cả icon
items.forEach(item => {
item.style.display = 'none';
});

// Chỉ hiển thị icon thuộc trang hiện tại
const startIdx = pageIdx * iconsPerPage;
const endIdx = Math.min(startIdx + iconsPerPage, items.length);

for (let i = startIdx; i < endIdx; i++) {
if (items[i]) {
items[i].style.display = 'flex';
}
}

// Cập nhật dots
document.querySelectorAll('.indicator-dot').forEach(dot => dot.classList.remove('active'));
const dots = document.querySelectorAll('.indicator-dot');
if (dots[pageIdx]) dots[pageIdx].classList.add('active');
}

function renderIndicators() {
indicatorBar.innerHTML = '';
const totalPages = calculateTotalPages();

for (let i = 0; i < totalPages; i++) {
const dot = document.createElement('div');
dot.className = 'indicator-dot' + (i === currentPage ? ' active' : '');
dot.setAttribute('data-index', i);
dot.addEventListener('click', function () {
  updateCarousel(i);
});
indicatorBar.appendChild(dot);
}
}

// Swipe gesture
let touchStartX = 0;
let touchEndX = 0;
actionBarScroll.addEventListener('touchstart', function (e) {
touchStartX = e.changedTouches[0].screenX;
});
actionBarScroll.addEventListener('touchend', function (e) {
touchEndX = e.changedTouches[0].screenX;
handleGesture();
});
function handleGesture() {
const threshold = 40;
const totalPages = calculateTotalPages();
if (touchEndX < touchStartX - threshold && currentPage < totalPages - 1) {
updateCarousel(currentPage + 1);
}
if (touchEndX > touchStartX + threshold && currentPage > 0) {
updateCarousel(currentPage - 1);
}
}

function rerenderAll() {
renderIndicators();
updateCarousel(0);
}

// Khởi tạo ban đầu
rerenderAll();

// Cập nhật khi resize màn hình
window.addEventListener('resize', rerenderAll);
});

// Hiển thị flash message
function showFlashMessage(msg, duration = 1800) {
  let flash = document.getElementById('flash-message');
  if (!flash) {
    flash = document.createElement('div');
    flash.id = 'flash-message';
    document.body.appendChild(flash);
  }
  flash.style.position = 'fixed';
  flash.style.top = '32px';
  flash.style.left = '50%';
  flash.style.transform = 'translateX(-50%)';
  flash.style.background = 'rgba(0,0,0,0.87)';
  flash.style.color = '#fff';
  flash.style.padding = '8px 18px';
  flash.style.borderRadius = '8px';
  flash.style.fontSize = '15px';
  flash.style.zIndex = 9999;
  flash.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
  flash.style.opacity = 0;
  flash.style.transition = 'opacity 0.2s';
  flash.style.maxWidth = 'calc(100vw - 32px)';
  flash.style.textAlign = 'center';
  flash.style.pointerEvents = 'none';
  flash.textContent = msg;
  flash.style.opacity = 1;
  setTimeout(() => {
    flash.style.opacity = 0;
  }, duration);
}

document.querySelectorAll('.action-bar-item').forEach(item => {
  item.addEventListener('click', function() {
    const action = this.getAttribute('data-action');
    if (actionBarJson[action]) {
      // Gọi hàm backend nếu có
      if (typeof App !== 'undefined' && typeof App.callActionButton === 'function') {
        App.callActionButton(JSON.stringify(actionBarJson[action]));
      } else {
        showFlashMessage(T.noAppCallActionButton || 'App.callActionButton not found');
      }
    } else {
      showFlashMessage(T.featureNotSupported || 'Feature not supported');
    }
  });
});

function renderNotifCards(arr) {
  const card = document.getElementById('notif-card');
  card.innerHTML = arr.map((src, idx) => `
    <div class="notif-item" tabindex="0"
      onclick="showNotifModal('${escapeQuotes(src.title_vi)}', \`${escapeBackticks(src.hrm_html_vi)}\`)"
      onkeypress="if(event.key==='Enter'){showNotifModal('${escapeQuotes(src.title_vi)}', \`${escapeBackticks(src.hrm_html_vi)}\`)}"
      >
      <div class="notif-img" style="background-image: url('${src.hrm_img || ''}');"></div>
      <div class="notif-info">
        <div class="notif-title" title="${src.title_vi || ''}">${src.title_vi || ''}</div>
        <button class="notif-arrow" tabindex="-1" aria-hidden="true">
          &#10095;
        </button>
      </div>
      <div class="notif-time">
        ${calendarIconSVG()}
        <span>${src.endtime || ''}</span>
      </div>
    </div>
  `).join('');
}

function calendarIconSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/></svg>`;
}
function escapeQuotes(str) {
  return String(str || '').replace(/'/g, "\\'");
}
function escapeBackticks(str) {
  return String(str || '').replace(/`/g, '\\`');
}
window.showNotifModal = function(title, html) {
  const modalBg = document.getElementById('modal-bg');
  
  document.getElementById('modal-body2').innerHTML = html || '';
  modalBg.classList.add('show');
}
window.closeNotifModal = function() {
  document.getElementById('modal-bg').classList.remove('show');
}
document.getElementById('modal-bg').onclick = function(e) {
  if (e.target === this) closeNotifModal();
};
function closeModal2() {
  document.getElementById('modal-bg').classList.remove('show');
}
function autoRefreshAll() { 
  fetchData();        
  fetchDataNotif();   
}

document.addEventListener('DOMContentLoaded', function() {
  autoRefreshAll();
  setInterval(autoRefreshAll, 5000); 
});

document.addEventListener('DOMContentLoaded', function() {
  // Đăng ký sự kiện click cho nút Dashboard
  const dashboardButton = document.getElementById('dashboard-btn'); // Đúng với HTML
  if (dashboardButton) {
    dashboardButton.addEventListener('click', function() {
      const dashboardJson = {
        "actionID": 5,
        "orderNumber": 5,
        "type": "act_dm_view",
        "alias": "t72ep_t72ep01a5",
        "post": "{\"size\":1}"
      };
      
      if (typeof App !== 'undefined' && typeof App.callActionButton === 'function') {
        App.callActionButton(JSON.stringify(dashboardJson));
      } else {
        showFlashMessage(T.dashboardError || 'Cannot connect to dashboard!');
      }
    });
  }
});
