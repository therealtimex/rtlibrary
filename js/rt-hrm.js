// Xác định loại người dùng
let userType = 'unidentified'; 
const TRIAL_ORG_ID = 'ea8018e243';

// Hiện thông báo, ẩn giao diện khác
function showCombineResult(msg, color = '#222') {
  document.getElementById('combine-user-screen').style.display = 'none';
  document.getElementById('combine-result-screen').style.display = 'flex';
  const msgElem = document.getElementById('combine-result-message');
  msgElem.innerHTML = msg;
  msgElem.style.color = color;

  // Ẩn nút Đóng khi popup vừa hiện
  const btnClose = document.getElementById('combine-btn-close-result');
  if (btnClose) btnClose.style.display = 'none';

  // Hiện spinner nếu có
  const spinner = document.getElementById('combine-result-spinner');
  if (spinner) spinner.style.display = 'block';

  // Sau 60s mới hiện lại nút Đóng, ẩn spinner
  setTimeout(() => {
    if (btnClose) btnClose.style.display = 'block';
    if (spinner) spinner.style.display = 'none';
  }, 60000);
}



// Reset giao diện combine về trạng thái ban đầu
function resetCombineForm() {
  document.getElementById('combine-org-code').value = '';
  document.getElementById('combine-org-error').style.display = 'none';
  foundOrg = null;
  combineScreenMode = 'default';
  document.getElementById('combine-btn-confirm').textContent = T.confirm;
  document.getElementById('combine-btn-confirm').disabled = false;
}

// ==== Hàm đổi ngôn ngữ UI combine ====
function renderCombineLang() {
  const combineTitle = document.getElementById('combine-title');
  if (combineTitle) {
    combineTitle.innerHTML = T.welcome.replace('##user.name##', USER_FULLNAME || 'User');
  }
  const combineDesc = document.getElementById('combine-desc');
  if (combineDesc) combineDesc.textContent = T.desc;
  
  const combineOrgCode = document.getElementById('combine-org-code');
  if (combineOrgCode) combineOrgCode.placeholder = T.orgPlaceholder;
  
  const combineBtnConfirm = document.getElementById('combine-btn-confirm');
  if (combineBtnConfirm) combineBtnConfirm.textContent = T.confirm;
  
  const combineOr = document.getElementById('combine-or');
  if (combineOr) combineOr.textContent = T.or;
  
  const combineBtnCreateOrg = document.getElementById('combine-btn-create-org');
  if (combineBtnCreateOrg) combineBtnCreateOrg.textContent = T.createOrg;
  
  const combineBtnTrial = document.getElementById('combine-btn-trial');
  if (combineBtnTrial) combineBtnTrial.textContent = T.trial;
  
  // Update trial tag
  const trialTag = document.getElementById('trial-user-tag');
if (trialTag) {
  trialTag.innerHTML = `
  <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
    <div style="flex: 1; text-align: left;">${T.trialTag}</div>
    <button onclick="showCombineScreen()" style="
      background: #fff;
      border: 1px solid #FFCC80;
      border-radius: 4px;
      padding: 4px 12px;
      font-size: 13px;
      color: #333;
      font-weight: 500;
      white-space: nowrap;
    ">
      ${T.exitTrial}
    </button>
  </div>
`;
}

  // Update close button
  const btnCloseResult = document.getElementById('combine-btn-close-result');
  if (btnCloseResult) btnCloseResult.textContent = T.close;
}

// Hàm kiểm tra loại người dùng
async function checkUserType() {
  const userOrgId = USER_ORG_ID;
  
  if (userOrgId === TRIAL_ORG_ID) {
    userType = 'trial';
    return 'trial';
  }
  
  try {
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
  const combineScreen = document.getElementById('combine-user-screen');
  const trialTag = document.getElementById('trial-user-tag');

  if (userType === 'unidentified') {
    // Hiện màn hình combine, ẩn HRM
    if (hrmMain) hrmMain.style.display = 'none';
    if (combineScreen) combineScreen.style.display = 'flex';
    if (trialTag) trialTag.style.display = 'none';
  } else if (userType === 'trial') {
    // Hiện HRM, hiện tag "Người dùng trải nghiệm"
    if (hrmMain) hrmMain.style.display = 'block';
    if (combineScreen) combineScreen.style.display = 'none';
    if (trialTag) {
      trialTag.style.display = 'inline-block';
      trialTag.textContent = T.trialTag;
      
      // Thêm sự kiện click để mở giao diện combine
      trialTag.onclick = function() {
        combineScreenMode = 'trial-back';
        showCombineScreen();
      };
    }
  } else if (userType === 'official') {
    // Hiện HRM, ẩn tag trải nghiệm
    if (hrmMain) hrmMain.style.display = 'block';
    if (combineScreen) combineScreen.style.display = 'none';
    if (trialTag) trialTag.style.display = 'none';
  }
}

// ==== Hiển thị giao diện combine ====
function showCombineScreen() {
  document.getElementById('hrm-main').style.display = 'none';
  document.getElementById('combine-user-screen').style.display = 'flex';
  document.getElementById('combine-result-screen').style.display = 'none';
  document.getElementById('combine-org-code').value = '';
  document.getElementById('combine-org-error').style.display = 'none';
  foundOrg = null;
  document.getElementById('combine-btn-confirm').textContent = T.confirm;
  document.getElementById('combine-btn-confirm').disabled = false;
  // Ẩn tag trial user khi vào từ tag
  if (userType === 'trial' && combineScreenMode === 'trial-back') {
    document.getElementById('trial-user-tag').style.display = 'none';
  }
  renderCombineLang();
}

// ==== Ẩn giao diện combine, trở về HRM ====
function hideCombineScreen() {
  const hrmMain = document.getElementById('hrm-main');
  const combineScreen = document.getElementById('combine-user-screen');
  
  if (userType === 'trial' || userType === 'official') {
    if (hrmMain) hrmMain.style.display = 'block';
  }
  if (combineScreen) combineScreen.style.display = 'none';
}
const orgCodeInput = document.getElementById('combine-org-code');
const clearButton = document.getElementById('combine-org-clear');
const combineBtnConfirm = document.getElementById('combine-btn-confirm');

orgCodeInput.addEventListener('input', function() {
  clearButton.style.display = this.value.trim() ? 'block' : 'none';
  // Reset lại nút kiểm tra mã nếu cần
  combineBtnConfirm.textContent = T.confirm;
  combineBtnConfirm.disabled = false;
  foundOrg = null;
  document.getElementById('combine-org-error').style.display = 'none';
});

clearButton.addEventListener('click', function() {
  orgCodeInput.value = '';
  clearButton.style.display = 'none';
  combineBtnConfirm.textContent = T.confirm;
  combineBtnConfirm.disabled = false;
  foundOrg = null;
  document.getElementById('combine-org-error').style.display = 'none';
  orgCodeInput.focus();
});

// ==== Xử lý nút Confirm (nhập mã tổ chức) ====
document.addEventListener('DOMContentLoaded', function() {
  const combineBtnConfirm = document.getElementById('combine-btn-confirm');
  if (combineBtnConfirm) {
    combineBtnConfirm.onclick = async function () {
      const code = document.getElementById('combine-org-code').value.trim();
      const errorElem = document.getElementById('combine-org-error');
      errorElem.style.display = 'none';
      errorElem.style.color = '#e74c3c';
      
      if (!foundOrg) {
        // Bước 1: Tìm tổ chức
        if (!code) {
          errorElem.textContent = T.error_empty;
          errorElem.style.display = 'block';
          return;
        }
        this.disabled = true;
        this.textContent = T.confirm + '...';
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
          this.disabled = false;
          this.textContent = T.confirm;
          if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
            foundOrg = data.hits.hits[0]._source;
            errorElem.innerHTML = `<b class="org-name-found">${foundOrg.org_lb || foundOrg.org_name || code}</b>`;
            errorElem.style.display = 'block';
            this.textContent = appLanguage === 'vi' ? 'Yêu cầu tham gia' : 'Request to join';
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
        // Bước 2: Gửi yêu cầu tham gia
        this.disabled = true;
        this.textContent = (appLanguage === 'vi' ? 'Đang gửi...' : 'Sending...');
        try {
          await fetch('https://automation.rta.vn/webhook/rthrm-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_id: 'rthrm.user',
              user_trial: '0',
              project_code: PROJECT_CODE,
              data: [{
                username: USERNAME,
                fullname: USER_FULLNAME,
                user_role: 'ea8018e243_HRM Staff',
                cellphone: USER_PHONE && USER_PHONE.trim() ? USER_PHONE : '0',
                user_status: '1',
                email: USER_EMAIL,
                org_id: foundOrg.org_id,
                org_name: foundOrg.org_lb
              }]
            })
          });
          // Gửi thành công: hiện popup
          showCombineResult(T.joinSuccess.replace('{org}', foundOrg.org_lb || foundOrg.org_name || code), "#222");
          let pollingCount = 0;
const maxPolling = 24; // 24 lần * 5s = 120s
const pollingInterval = 5000; // 5 giây
const btnClose = document.getElementById('combine-btn-close-result');
const spinner = document.getElementById('combine-result-spinner');
const orgIdMoi = foundOrg.org_id;

if (btnClose) btnClose.style.display = 'none';
if (spinner) spinner.style.display = 'block';

const intervalId = setInterval(async () => {
  pollingCount++;
  try {
    const res = await fetch(`${PROJECT_URL}/api/dm/getData?token=your_token_here&dm_name=ss_user&max_order=0&format=json&mode=download&where=\`username\`="${USERNAME}"`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].organization_id === orgIdMoi) {
      clearInterval(intervalId);
      if (typeof App !== 'undefined' && typeof App.callActionButton === 'function') {
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
          renderByUserType();
          document.getElementById('combine-result-screen').style.display = 'none';
          document.getElementById('hrm-main').style.display = 'block';
          if (spinner) spinner.style.display = 'none';
        }, 3000);
      }
    } else if (pollingCount >= maxPolling) {
      clearInterval(intervalId);
      if (btnClose) btnClose.style.display = 'block';
      if (spinner) spinner.style.display = 'none';
    }
  } catch (err) {
    if (pollingCount >= maxPolling) {
      clearInterval(intervalId);
      if (btnClose) btnClose.style.display = 'block';
      if (spinner) spinner.style.display = 'none';
    }
  }
}, pollingInterval);





          
        } catch (err) {
          // Gửi lỗi: hiện lỗi đỏ dưới nút, giữ nguyên màn hình
          errorElem.style.color = '#e74c3c';
          errorElem.textContent = T.error;
          errorElem.style.display = 'block';
        }
        this.disabled = false;
        this.textContent = appLanguage === 'vi' ? 'Yêu cầu tham gia' : 'Request to join';
      }
    };
  }
});

// ==== Xử lý nút Trial user ====
document.addEventListener('DOMContentLoaded', function() {
  const combineBtnTrial = document.getElementById('combine-btn-trial');
  if (combineBtnTrial) {
    combineBtnTrial.onclick = async function () {
      // Nếu là trial user và vào từ tag, chỉ quay lại HRM, không gửi request, không hiện thông báo
      if (userType === 'trial' && typeof combineScreenMode !== 'undefined' && combineScreenMode === 'trial-back') {
        document.getElementById('combine-user-screen').style.display = 'none';
        document.getElementById('hrm-main').style.display = 'block';
        document.getElementById('trial-user-tag').style.display = 'inline-block';
        combineScreenMode = 'default';
        return;
      }
      
      // Trường hợp user chưa xác định: gửi request
      const btn = this;
      const errorElem = document.getElementById('combine-org-error');
      btn.disabled = true;
      btn.textContent = appLanguage === 'vi' ? 'Đang xử lý...' : 'Processing...';
      
      try {
        await fetch('https://automation.rta.vn/webhook/rthrm-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: 'rthrm.user',
            user_trial: '1',
            project_code: PROJECT_CODE,
            data: [{
              username: USERNAME,
              fullname: USER_FULLNAME,
              user_role: 'ea8018e243_HRM - User Trial',
              cellphone: USER_PHONE && USER_PHONE.trim() ? USER_PHONE : '0',
              user_status: '1',
              email: USER_EMAIL,
              org_id: 'ea8018e243',
              org_name: 'HRM Demo'
            }]
          })
        });
        // Thành công: hiện popup
        showCombineResult(T.trialSuccess.replace('{user}', USER_FULLNAME), "#222");


        let pollingCount = 0;
const maxPolling = 24; // 24 lần * 5s = 120s
const pollingInterval = 5000; // 5 giây
const btnClose = document.getElementById('combine-btn-close-result');
const spinner = document.getElementById('combine-result-spinner');
const orgIdMoi = 'ea8018e243';

if (btnClose) btnClose.style.display = 'none';
if (spinner) spinner.style.display = 'block';

const intervalId = setInterval(async () => {
  pollingCount++;
  try {
    const res = await fetch(`${PROJECT_URL}/api/dm/getData?token=your_token_here&dm_name=ss_user&max_order=0&format=json&mode=download&where=\`username\`="${USERNAME}"`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].organization_id === orgIdMoi) {
      clearInterval(intervalId);
      if (typeof App !== 'undefined' && typeof App.callActionButton === 'function') {
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
          renderByUserType();
          document.getElementById('combine-result-screen').style.display = 'none';
          document.getElementById('hrm-main').style.display = 'block';
          if (spinner) spinner.style.display = 'none';
        }, 3000);
      }
    } else if (pollingCount >= maxPolling) {
      clearInterval(intervalId);
      if (btnClose) btnClose.style.display = 'block';
      if (spinner) spinner.style.display = 'none';
    }
  } catch (err) {
    if (pollingCount >= maxPolling) {
      clearInterval(intervalId);
      if (btnClose) btnClose.style.display = 'block';
      if (spinner) spinner.style.display = 'none';
    }
  }
}, pollingInterval);

        
      } catch (err) {
      
        errorElem.style.color = '#e74c3c';
        errorElem.textContent = T.error;
        errorElem.style.display = 'block';
      }
      btn.disabled = false;
      btn.textContent = T.trial;
    };
  }
});

// ==== Xử lý nút đóng popup kết quả ====
document.addEventListener('DOMContentLoaded', function() {
  var btnCloseResult = document.getElementById('combine-btn-close-result');
  if (btnCloseResult) {
    btnCloseResult.onclick = function () {
      document.getElementById('combine-result-screen').style.display = 'none';
      document.getElementById('combine-result-spinner').style.display = 'none';
      btnCloseResult.style.display = 'block';
      // Reset về trạng thái ban đầu
      foundOrg = null;
      combineScreenMode = 'default';
      document.getElementById('combine-org-code').value = '';
      document.getElementById('combine-org-error').style.display = 'none';
      document.getElementById('combine-btn-confirm').textContent = T.confirm;
      document.getElementById('combine-btn-confirm').disabled = false;
      // Hiện lại màn hình ban đầu
      if (userType === 'unidentified') {
        document.getElementById('combine-user-screen').style.display = 'flex';
      } else {
        document.getElementById('hrm-main').style.display = 'block';
        if (userType === 'trial') {
          document.getElementById('trial-user-tag').style.display = 'inline-block';
        }
      }
    };
  }
});

// ==== Xử lý nút Create new organization ====
document.addEventListener('DOMContentLoaded', function() {
  const combineBtnCreateOrg = document.getElementById('combine-btn-create-org');
  if (combineBtnCreateOrg) {
    combineBtnCreateOrg.onclick = function () {
      document.getElementById('combine-user-screen').style.display = 'none';
      document.getElementById('modal-create-org').style.display = 'flex';
      setTimeout(renderOrgFormLang, 50);
    };
  }
});

// ==== Đóng modal tạo tổ chức ====
function closeModalCreateOrg() {
  document.getElementById('modal-create-org').style.display = 'none';
  showCombineScreen();
}

// ==== Đặt lại ngôn ngữ và label cho form tạo tổ chức ====
function renderOrgFormLang() {
  const T = LANG[appLanguage];
  const orgFormTitle = document.getElementById('org-form-title');
  if (orgFormTitle) {
    orgFormTitle.textContent = (appLanguage === 'vi') 
      ? "Thông tin Tổ chức" 
      : "Organization Information";
  }

  const orgFormDesc = document.getElementById('org-form-desc');
  if (orgFormDesc) {
    orgFormDesc.textContent = (appLanguage === 'vi')
      ? "Vui lòng cung cấp Thông tin để Hệ thống khởi tạo Tổ chức mới:" 
      : "Please provide the information so the system can create a New organization:";
    orgFormDesc.style.fontStyle = 'italic';  
    orgFormDesc.style.fontWeight = 'bold';  
    orgFormDesc.style.color = '#000'; 
  }
  
  const labelOrgName = document.getElementById('label-org-name');
  if (labelOrgName) labelOrgName.textContent = T.orgName;
  
  const labelOrgShort = document.getElementById('label-org-short');
  if (labelOrgShort) labelOrgShort.textContent = T.shortName;
  
  const labelContactName = document.getElementById('label-contact-name');
  if (labelContactName) labelContactName.textContent = T.contactName;
  
  const labelContactEmail = document.getElementById('label-contact-email');
  if (labelContactEmail) labelContactEmail.textContent = T.contactEmail;
  
  const labelContactPhone = document.getElementById('label-contact-phone');
  if (labelContactPhone) labelContactPhone.textContent = T.contactPhone;
  
  const btnSubmitOrg = document.getElementById('btn-submit-org');
  if (btnSubmitOrg) btnSubmitOrg.textContent = T.submitBtn;
  
  // Pre-fill contact info
  const contactName = document.getElementById('contact-name');
  if (contactName) contactName.value = USER_FULLNAME;
  
  const contactPhone = document.getElementById('contact-phone');
  if (contactPhone) contactPhone.value = USER_PHONE;
  
  const contactEmail = document.getElementById('contact-email');
  if (contactEmail) contactEmail.value = USER_EMAIL;
}

function generateRandomId(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

document.addEventListener('DOMContentLoaded', async function () {
  document.getElementById('hrm-main').style.display = 'none';
  document.getElementById('combine-user-screen').style.display = 'none';
  document.getElementById('trial-user-tag').style.display = 'none';
  document.getElementById('auth-loading').style.display = 'block';

  if (!USER_ORG_ID || USER_ORG_ID.trim() === '') {
    return;
  }

  await checkUserType();
  renderByUserType(); 

  document.getElementById('auth-loading').style.display = 'none';
  renderCombineLang();
  

const form = document.getElementById('org-create-form');
let pendingOrgId = null;

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const orgName = document.getElementById('org-name-input').value.trim();
    let shortName = document.getElementById('org-shortname').value.trim();
    if (!shortName) shortName = orgName;

    const contactName = document.getElementById('contact-name').value.trim();
    const contactEmail = document.getElementById('contact-email').value.trim();
    const contactPhone = document.getElementById('contact-phone').value.trim();

    let orgId;
    if (userType === 'trial' || USER_ORG_ID === '324fd') {
      orgId = 'p' + generateRandomId(9);
    } else if (userType === 'unidentified') {
      orgId = USER_ORG_ID;
    }

    pendingOrgId = orgId;

    const payload = {
      event_id: 'rthrm.neworg',
      new_org: '1',
      project_code: PROJECT_CODE,
      user_language: APP_LANGUAGE,
      data: [{
        username: USERNAME,
        fullname: USER_FULLNAME,
        user_role: 'ea8018e243_HRM Manager',
        email: USER_EMAIL,
        cellphone: USER_PHONE?.trim() || '0',
        user_status: '1',
        org_id: orgId,
        org_name_full: orgName,
        org_name: shortName,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone || '0',
        context_title: `${orgName}-HRM`,
        number_codes: '1',
        expiry_datetime: '2050-12-31',
        approval_mode: 'none',
        allowed_times_use: '500',
        rolegen: 'ea8018e243_HRM Staff',
        user_power: '10',
        typegen: 'registration'
      }]
    };

    fetch('https://automation.rta.vn/webhook/rthrm-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      document.getElementById('modal-create-org').style.display = 'none';
      showCombineResult(T.notify(orgName, contactEmail), "#222");
      form.reset();
      
      const btnClose = document.getElementById('combine-btn-close-result');
const spinner = document.getElementById('combine-result-spinner');
if (btnClose) btnClose.style.display = 'none';
if (spinner) spinner.style.display = 'block';

let pollingCount = 0;
const maxPolling = 24; // 24 lần * 5s = 120s
const pollingInterval = 5000; // 5 giây
const orgIdMoi = pendingOrgId;

const intervalId = setInterval(async () => {
  pollingCount++;
  try {
    const res = await fetch(`${PROJECT_URL}/api/dm/getData?token=your_token_here&dm_name=ss_user&max_order=0&format=json&mode=download&where=\`username\`="${USERNAME}"`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].organization_id === orgIdMoi) {
      clearInterval(intervalId);
      if (typeof App !== 'undefined' && typeof App.callActionButton === 'function') {
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
          renderByUserType();
          document.getElementById('combine-result-screen').style.display = 'none';
          document.getElementById('hrm-main').style.display = 'block';
          if (spinner) spinner.style.display = 'none';
        }, 3000);
      }
    } else if (pollingCount >= maxPolling) {
      clearInterval(intervalId);
      if (btnClose) btnClose.style.display = 'block';
      if (spinner) spinner.style.display = 'none';
    }
  } catch (err) {
    if (pollingCount >= maxPolling) {
      clearInterval(intervalId);
      if (btnClose) btnClose.style.display = 'block';
      if (spinner) spinner.style.display = 'none';
    }
  }
}, pollingInterval);



      
    .catch(err => {
      console.error('Submit error:', err);
      document.getElementById('modal-create-org').style.display = 'none';
      document.getElementById('notification-message').innerHTML = `
        <div style="color: red; font-weight: 500; margin-bottom: 8px; text-align:center;">
          ${appLanguage === 'vi'
            ? 'Đã xảy ra lỗi khi gửi yêu cầu.<br>Vui lòng thử lại sau!'
            : 'An error occurred while submitting the request.<br>Please try again!'}
        </div>`;
      document.getElementById('notification-popup').style.display = 'flex';
    });
  });
}




  // 4. Setup notification close button
  const btnCloseNotification = document.getElementById('btn-close-notification');
  if (btnCloseNotification) {
    btnCloseNotification.textContent = T.close;
    btnCloseNotification.onclick = function () {
      document.getElementById('notification-popup').style.display = 'none';
      if (userType === 'unidentified') {
        showCombineScreen();
      } else if (userType === 'trial' || userType === 'official') {
        hideCombineScreen();
      }
    };
  }

  // 5. Cập nhật ngôn ngữ, tiêu đề, label cho HRM
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

// ==== JSON cho Nghỉ phép và Tăng ca ====
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
      "collapse": { "field": "keyid.raw" },
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
  const todayStr = new Date().toISOString().split('T')[0]; 

  const items = data.hits.hits.filter(i => {
    const src = i._source;
    return src.status == 1 && src.endday >= todayStr;
  });

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

function updateLastCheckinInfo(checkin) {
  const statusTag = document.getElementById('last-checkin-status');
  if (!statusTag) return;
  // Hiển thị thời gian checkin
  if (!checkin) {
    lastCheckinTime.textContent = '--:--';
    statusIndicator.className = 'status-indicator';
    statusTag.textContent = T.firstCheckin;
    statusTag.className = 'checkin-status-tag'; // Giữ nguyên màu mặc định
    return;
  }
  lastCheckinTime.textContent = formatCheckInTime(checkin.rta_time_fm);
  statusIndicator.className = 'status-indicator';


  let statusText = '';
  let extraClass = '';
  switch (checkin.view_mark_lb) {
    case 'IN':
      statusText = T.in;
      extraClass = ''; 
      break;
    case 'TMPIN':
      statusText = T.tempin;
      extraClass = '';
      break;
    case 'OUT':
      statusText = T.out;
      extraClass = 'checkout'; 
      break;
    case 'TMPOUT':
      statusText = T.tempout;
      extraClass = 'tempout'; 
      break;
    default:
      statusText = '';
      extraClass = '';
  }
  statusTag.textContent = statusText;
  // Reset class về mặc định rồi thêm class màu nếu cần
  statusTag.className = 'checkin-status-tag';
  if (extraClass) statusTag.classList.add(extraClass);

  // Màu chấm tròn trạng thái (giữ nguyên logic cũ)
  const viewMark = parseInt(checkin.view_mark || 0);
  if (viewMark === 1) {
    statusIndicator.classList.add('status-green');
  } else if (viewMark === 2) {
    statusIndicator.classList.add('status-blue');
  } else if (viewMark === 3) {
    statusIndicator.classList.add('status-red');
  }
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

let lastCheckinTimeValue = null;
let checkCount = 0;
let intervalId = null;
const maxChecks = 12;

function checkLastCheckinChange() {
  fetchData();
  checkCount++;
  if (latestCheckin && latestCheckin.rta_time_fm !== lastCheckinTimeValue) {
    clearInterval(intervalId);
    intervalId = null;
    return;
  }
  if (checkCount >= maxChecks) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
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
  label: T.checkoutRemote,
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

// Ẩn tạm thời các nút QR và Tạm thời
  buttons = buttons.filter(btn => btn.label !== 'QR' && btn.label !== T.checkinTemp);

  
if(title){
container.innerHTML+=`<div class="attendance-action-title" style="color:#222;font-weight:bold;font-size:16px;padding-left:14px"></div>`;
}
if(buttons.length){
let html=`<div class="attendance-action-buttons">`;
buttons.forEach((btn, idx) => {
  let extraClass = '';
  const plainLabel = btn.label.replace(/<[^>]+>/g, '').trim().toUpperCase();
  if (plainLabel === 'HẾT CA' || plainLabel === 'CHECK-OUT') {
    extraClass = 'checkout-end';
  }
  html += `<button class="attendance-btn ${extraClass}" type="button" onclick="attendanceButtonHandlers[${idx}]()">
    <div class="attendance-btn-icon-bg">${btn.icon}</div>
    <span class="attendance-btn-label">${btn.label}</span>
  </button>`;
});

html+=`</div>`;
container.innerHTML+=html;
window.attendanceButtonHandlers = buttons.map(btn => function() {
      btn.onClick();
      if (latestCheckin) {
        lastCheckinTimeValue = latestCheckin.rta_time_fm;
      } else {
        lastCheckinTimeValue = null;
      }
      checkCount = 0;
      if (intervalId) {
        clearInterval(intervalId);
      }
      intervalId = setInterval(checkLastCheckinChange, 5000);
    });
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
  card.innerHTML = arr.map((src, idx) => {
    // Lấy đúng nội dung và tiêu đề theo ngôn ngữ
    const title = appLanguage === 'en' ? (src.title_en || src.title_vi || '') : (src.title_vi || src.title_en || '');
    const html = appLanguage === 'en' ? (src.hrm_html_en || src.hrm_html_vi || '') : (src.hrm_html_vi || src.hrm_html_en || '');
    return `
      <div class="notif-item" tabindex="0"
        onclick="showNotifModal('${escapeQuotes(title)}', \`${escapeBackticks(html)}\`)"
        onkeypress="if(event.key==='Enter'){showNotifModal('${escapeQuotes(title)}', \`${escapeBackticks(html)}\`)}"
      >
        <div class="notif-img" style="background-image: url('${src.hrm_img || ''}');"></div>
        <div class="notif-info">
          <div class="notif-title" title="${title}">${title}</div>
          <button class="notif-arrow" tabindex="-1" aria-hidden="true">
            &#10095;
          </button>
        </div>
        <div class="notif-time">
          ${calendarIconSVG()}
          <span>${src.endtime || ''}</span>
        </div>
      </div>
    `;
  }).join('');
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
document.addEventListener('DOMContentLoaded', function() {
    const notifCloseBtn = document.getElementById('notif-close-btn');
    if (notifCloseBtn) {
      notifCloseBtn.textContent = appLanguage === 'vi' ? 'ĐÓNG' : 'CLOSE';
    }
  });

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
  setInterval(autoRefreshAll, 60 * 60 * 1000);
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

async function fetchAndPopulateProfile() {
  try {
    const response = await fetch('https://es.rta.vn/ss_userlist_v2/_search', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        size: 1,
        collapse: { field: 'username.raw' },
        query: {
          bool: {
            must: [
              { term: { 'username.raw': { value: USERNAME } } },
              { term: { 'organization_id.raw': { value: USER_ORG_ID } } }
            ]
          }
        },
        sort: [{ added_date: { order: 'desc' } }]
      })
    });

    const data = await response.json();
    const user = data.hits?.hits[0]?._source;

    if (user) {
      document.querySelector('.profile-image img').src = user.pr_photo_path || 'https://eventlog.rta.vn/assets/d23217dc-67cd-4f7a-9824-7dbf2b9934b3';
      document.querySelector('.profile-name').textContent =
        (user.fullname && user.fullname.trim() !== "") ? user.fullname : USER_FULLNAME;
      document.querySelector('.profile-position').textContent = `${user.title || ''} - ${user.department || ''}`;
    } else {
      console.warn('Không tìm thấy dữ liệu người dùng.');
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu user profile:', error);
  }
}

// Gọi hàm sau khi DOM tải xong
document.addEventListener('DOMContentLoaded', fetchAndPopulateProfile);

