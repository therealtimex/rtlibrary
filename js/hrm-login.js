let appLanguage = APP_LANGUAGE === "en" ? "en" : "vi";
const T = LANG[appLanguage];
let userType = checkUserType();

function checkUserType() {
  return ['ea8018e243', '324fd'].includes(USER_ORG_ID) ? 'trial' : 'official';
}
function updateCombineResultLang() {
  document.getElementById('combine-btn-close-result').textContent = LANG[appLanguage].close;
  document.getElementById('combine-btn-retry-result').textContent = LANG[appLanguage].retry;
}
function showPollingError() {
  updateCombineResultLang();
  document.getElementById('combine-result-message').innerHTML =
    `<div style="color: #dc3545; font-weight: 500; text-align: center;">${LANG[appLanguage].error}</div>`;
  document.getElementById('combine-btn-close-result').style.display = 'block';
  document.getElementById('combine-btn-retry-result').style.display = 'block';
  document.getElementById('combine-result-spinner').style.display = 'none';
}
let pollingIntervalId = null;
let pollingCount = 0;
const MAX_POLLING = 24;
function startPollingLoop({ orgId, onSuccess, onError }) {
  if (pollingIntervalId) clearInterval(pollingIntervalId);
  pollingCount = 0;
  document.getElementById('combine-result-spinner').style.display = 'block';
  document.getElementById('combine-btn-close-result').style.display = 'none';
  document.getElementById('combine-btn-retry-result').style.display = 'none';
  pollingIntervalId = setInterval(async () => {
    pollingCount++;
    try {
      const res = await fetch(`${PROJECT_URL}/api/dm/getData?token=your_token_here&dm_name=ss_user&max_order=0&format=json&mode=download&where=\`username\`="${USERNAME}"`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].organization_id === orgId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
        document.getElementById('combine-result-spinner').style.display = 'none';
        if (typeof onSuccess === 'function') onSuccess();
      } else if (pollingCount >= MAX_POLLING) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
        if (typeof onError === 'function') onError();
      }
    } catch (err) {
      if (pollingCount >= MAX_POLLING) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
        if (typeof onError === 'function') onError();
      }
    }
  }, 5000);
}
function startPollingCheckOrg() {
  document.getElementById('combine-btn-close-result').style.display = 'none';
  document.getElementById('combine-btn-retry-result').style.display = 'none';
  document.getElementById('combine-result-spinner').style.display = 'block';
  if (isJoiningOrg) {
    document.getElementById('combine-result-message').innerHTML =
      `<div style="color: #222; font-weight: 500; text-align: center;">${LANG[appLanguage].trialSuccess.replace('{org}', orgName)}</div>`;
  } else {
    document.getElementById('combine-result-message').innerHTML =
      `<div style="color: #222; font-weight: 500; text-align: center;">${LANG[appLanguage].notify(orgName, contactEmail)}</div>`;
  }
  startPollingLoop({
    orgId: isJoiningOrg ? foundOrg?.org_id : pendingOrgId,
    onSuccess: function () {
      if (typeof App !== 'undefined' && typeof App.callActionButton === 'function') {
        App.callActionButton(JSON.stringify({
          actionID: 24703,
          type: "act_fetch_rcm",
          label: "Fetch RCM"
        }));
        setTimeout(() => {
          App.callActionButton(JSON.stringify({
            actionID: 24704,
            type: "act_reload_app",
            label: "Reload App"
          }));
          renderByUserType();
          document.getElementById('combine-result-screen').style.display = 'none';
          document.getElementById('hrm-main').style.display = 'block';
          document.getElementById('combine-result-spinner').style.display = 'none';
        }, 3000);
      }
    },
    onError: showPollingError
  });
}
document.getElementById('combine-btn-retry-result').onclick = function () {
  startPollingCheckOrg();
};
document.getElementById('combine-btn-close-result').onclick = function () {
  if (pollingIntervalId) clearInterval(pollingIntervalId);
  pollingIntervalId = null;
  document.getElementById('combine-result-screen').style.display = 'none';
  resetCombineForm();
  document.getElementById('combine-user-screen').style.display = 'flex';
};
function resetCombineForm() {
  document.getElementById('combine-org-code').value = '';
  document.getElementById('combine-org-error').style.display = 'none';
  foundOrg = null;
  combineScreenMode = 'default';
  document.getElementById('combine-btn-confirm').textContent = T.confirm;
  document.getElementById('combine-btn-confirm').disabled = false;
  document.getElementById('combine-org-clear').style.display = 'none';
}
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
  const trialTag = document.getElementById('trial-user-tag');
  if (trialTag) {
    trialTag.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div style="flex: 1; text-align: left;">${T.trialTag}</div>
        <button onclick="combineScreenMode = 'default'; renderByUserType()" style="background: #fff; color: #444; border: 1px solid #FFCC80; border-radius: 8px;">
          ${T.exitTrial}
        </button>
      </div>
    `;
  }
  const btnCloseResult = document.getElementById('combine-btn-close-result');
  if (btnCloseResult) btnCloseResult.textContent = T.close;
}
function renderByUserType() {
  const hrmMain = document.getElementById('hrm-main');
  const combineScreen = document.getElementById('combine-user-screen');
  const trialTag = document.getElementById('trial-user-tag');
  if (userType === 'trial') {
    if (combineScreenMode === 'trial-back') {
      if (hrmMain) hrmMain.style.display = 'block';
      if (trialTag) trialTag.style.display = 'block';
      if (combineScreen) combineScreen.style.display = 'none';
      renderHRMMain();
    } else {
      if (combineScreen) combineScreen.style.display = 'flex';
      if (hrmMain) hrmMain.style.display = 'none';
      if (trialTag) trialTag.style.display = 'none';
    }
  } else {
    if (hrmMain) hrmMain.style.display = 'block';
    if (combineScreen) combineScreen.style.display = 'none';
    if (trialTag) trialTag.style.display = 'none';
    renderHRMMain();
  }
}

const orgCodeInput = document.getElementById('combine-org-code');
const clearButton = document.getElementById('combine-org-clear');
const btnConfirm = document.getElementById('combine-btn-confirm');
if (orgCodeInput && clearButton && btnConfirm) {
  orgCodeInput.addEventListener('input', function() {
    clearButton.style.display = this.value.trim() ? 'block' : 'none';
    btnConfirm.textContent = T.confirm;
    btnConfirm.disabled = false;
    foundOrg = null;
    document.getElementById('combine-org-error').style.display = 'none';
  });
  clearButton.addEventListener('click', function() {
    orgCodeInput.value = '';
    clearButton.style.display = 'none';
    btnConfirm.textContent = T.confirm;
    btnConfirm.disabled = false;
    foundOrg = null;
    document.getElementById('combine-org-error').style.display = 'none';
    orgCodeInput.focus();
  });
}
btnConfirm.onclick = async function () {
  const code = orgCodeInput.value.trim();
  const errorElem = document.getElementById('combine-org-error');
  errorElem.style.display = 'none';
  errorElem.style.color = '#e74c3c';
  if (!foundOrg) {
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
          "collapse":{"field":"org_id.raw"},
          "sort":[{"__system_update_timestamp__":{"order":"desc"}}],
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
    this.disabled = true;
    this.textContent = (appLanguage === 'vi' ? 'Đang gửi...' : 'Sending...');
    try {
      const jointype = typeof foundOrg.jointype !== 'undefined' ? foundOrg.jointype : null;
      let payload;
      let isNeedApproval = false;
      if (jointype === "0") {
        isNeedApproval = true;
        payload = {
          event_id: 'rthrm.user',
          user_trial: '2',
          project_code: PROJECT_CODE,
          data: [{
            username: USERNAME,
            fullname: USER_FULLNAME,
            cellphone: USER_PHONE && USER_PHONE.trim() ? USER_PHONE : '0',
            email: USER_EMAIL,
            org_id: foundOrg.org_id,
            org_name: foundOrg.org_lb
          }]
        };
      } else {
        payload = {
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
        };
      }
      await fetch('https://automation.rta.vn/webhook/rthrm-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (isNeedApproval) {
        document.getElementById('combine-user-screen').style.display = 'none';
        document.getElementById('combine-result-screen').style.display = 'flex';
        document.getElementById('combine-result-message').innerHTML =
          `<div style="color: #222; font-weight: 500; text-align: center;">${LANG[appLanguage].joinSuccess.replace('{org}', foundOrg.org_lb || foundOrg.org_name || code)}</div>`;
        document.getElementById('combine-btn-close-result').style.display = 'block';
        document.getElementById('combine-btn-retry-result').style.display = 'none';
        document.getElementById('combine-result-spinner').style.display = 'none';
        document.getElementById('combine-btn-close-result').onclick = function () {
          document.getElementById('combine-result-screen').style.display = 'none';
          resetCombineForm();
          document.getElementById('combine-user-screen').style.display = 'flex';
        };
      } else {
        isJoiningOrg = true;
        orgName = foundOrg.org_lb || foundOrg.org_name || code;
        startPollingCheckOrg();
        document.getElementById('combine-user-screen').style.display = 'none';
        document.getElementById('combine-result-screen').style.display = 'flex';
      }
    } catch (err) {
      errorElem.style.color = '#e74c3c';
      errorElem.textContent = T.error;
      errorElem.style.display = 'block';
    }
    this.disabled = false;
    this.textContent = appLanguage === 'vi' ? 'Yêu cầu tham gia' : 'Request to join';
  }
};
document.getElementById('combine-btn-trial').onclick = function () {
  userType = 'trial';
  combineScreenMode = 'trial-back';
  renderByUserType();
};
document.getElementById('combine-btn-create-org').onclick = function () {
  document.getElementById('combine-user-screen').style.display = 'none';
  document.getElementById('modal-create-org').style.display = 'flex';
  setTimeout(renderOrgFormLang, 50);
};
function closeModalCreateOrg() {
  document.getElementById('modal-create-org').style.display = 'none';
  combineScreenMode = 'default';
  renderByUserType();
}
function renderOrgFormLang() {
  const T = LANG[appLanguage];
  document.getElementById('org-form-title').textContent = appLanguage === 'vi' ? "Thông tin Tổ chức" : "Organization Information";
  document.getElementById('org-form-desc').textContent = appLanguage === 'vi'
    ? "Vui lòng cung cấp Thông tin để Hệ thống khởi tạo Tổ chức mới:"
    : "Please provide the information so the system can create a New organization:";
  document.getElementById('label-org-name').textContent = T.orgName;
  document.getElementById('label-org-short').textContent = T.shortName;
  document.getElementById('label-contact-name').textContent = T.contactName;
  document.getElementById('label-contact-email').textContent = T.contactEmail;
  document.getElementById('label-contact-phone').textContent = T.contactPhone;
  document.getElementById('btn-submit-org').textContent = T.submitBtn;
  document.getElementById('contact-name').value = USER_FULLNAME;
  document.getElementById('contact-phone').value = USER_PHONE;
  document.getElementById('contact-email').value = USER_EMAIL;
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
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const orgNameVal = document.getElementById('org-name-input').value.trim();
      const shortName = document.getElementById('org-shortname').value.trim() || orgNameVal;
      const contactName = document.getElementById('contact-name').value.trim();
      const contactEmailVal = document.getElementById('contact-email').value.trim();
      const contactPhone = document.getElementById('contact-phone').value.trim() || '0';
      const orgId = 'p' + generateRandomId(9);
      pendingOrgId = orgId;
      isJoiningOrg = false;
      orgName = orgNameVal;
      contactEmail = contactEmailVal;
      await fetch('https://automation.rta.vn/webhook/rthrm-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: 'rthrm.neworg',
          new_org: '1',
          project_code: PROJECT_CODE,
          user_language: APP_LANGUAGE,
          data: [{
            username: USERNAME,
            fullname: USER_FULLNAME,
            user_role: 'ea8018e243_HRM Manager',
            email: USER_EMAIL,
            cellphone: USER_PHONE && USER_PHONE.trim() ? USER_PHONE : '0',
            org_id: orgId,
            org_name_full: orgNameVal,
            org_name: shortName,
            contact_name: contactName,
            contact_email: contactEmailVal,
            contact_phone: contactPhone,
            context_title: `${orgNameVal}-HRM`,
            expiry_datetime: '2050-12-31',
            approval_mode: 'none',
            allowed_times_use: '500',
            rolegen: 'ea8018e243_HRM Staff',
            user_power: '10',
            typegen: 'registration'
          }]
        })
      });
      document.getElementById('modal-create-org').style.display = 'none';
      startPollingCheckOrg();
      document.getElementById('combine-result-screen').style.display = 'flex';
    } catch (err) {
      document.getElementById('modal-create-org').style.display = 'none';
      document.getElementById('notification-popup').style.display = 'flex';
      document.getElementById('notification-message').innerHTML = `
        <div style="color: #dc3545; font-weight: 500; text-align: center;">
          ${APP_LANGUAGE === 'vi'
            ? 'Lỗi hệ thống! Vui lòng thử lại sau.'
            : 'System error! Please try again later.'}
        </div>`;
    }
  });
}