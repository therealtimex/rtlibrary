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
      `<div style="color: #222; font-weight: 500; text-align: left;">${LANG[appLanguage].trialSuccess.replace('{org}', orgName)}</div>`;
  } else {
    document.getElementById('combine-result-message').innerHTML =
      `<div style="color: #222; font-weight: 500; text-align: left;">${LANG[appLanguage].notify(orgName, contactEmail)}</div>`;
  }
  startPollingLoop({
    orgId: isJoiningOrg ? foundOrg?.org_id : pendingOrgId,
    onSuccess: function () {
      USER_ORG_ID = foundOrg.org_id;
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
          <span style="font-weight: bold;">${T.exitTrial}</span>
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
          `<div style="color: #222; font-weight: 500; text-align: left;">${LANG[appLanguage].joinSuccess.replace('{org}', foundOrg.org_lb || foundOrg.org_name || code)}</div>`;
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


// ====== HRM-MAIN: LỊCH, TUẦN/THÁNG, ACTION BAR, MODAL, NOTIFICATION ======

let attendanceData = [], leaveData = [], holidayData = [], zeroWorkData = [], latestCheckin = null;
let currentDate = new Date();
let weekStartDate = new Date(currentDate);
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let isMonthView = false;
const $ = id => document.getElementById(id);
const monthTitle = $('month-title');
const weekTitle = $('week-title');
const weekView = $('week-view');
const calendarView = $('calendar-view');
const loadingElem = $('loading');
const errorElem = $('error');
const expandToggle = $('expand-toggle');
const modalOverlay = $('modal-overlay');
const eventModal = $('event-modal');
const modalTitle = $('modal-title');
const modalContent = $('modal-content');
const closeModal = $('close-modal');
const prevMonthBtn = $('prev-month');
const nextMonthBtn = $('next-month');
const prevWeekBtn = $('prev-week');
const nextWeekBtn = $('next-week');
const lastCheckinTime = $('last-checkin-time');
const statusIndicator = $('status-indicator');
const viewHistoryBtn = $('view-history');
const monthHeader = document.querySelector('.month-header');
const weekHeader = document.querySelector('.week-header');
const notifCard = $('notif-card');
const dashboardBtn = $('dashboard-btn');

const monthNames = T.monthNames;
const weekdayNames = T.weekdayNames;

function adjustToMonday(date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}
adjustToMonday(weekStartDate);

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
function formatCheckInTime(timeString) {
  if (!timeString) return 'N/A';
  try {
    const date = new Date(timeString);
    const weekday = T.weekdayNames[(date.getDay() + 6) % 7];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${weekday} ${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return timeString;
  }
}
function updateWeekTitle() {
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekStartDate.getDate() + 6);
  const startDay = weekStartDate.getDate().toString().padStart(2, '0');
  const startMonth = (weekStartDate.getMonth() + 1).toString().padStart(2, '0');
  const endDay = weekEnd.getDate().toString().padStart(2, '0');
  const endMonth = (weekEnd.getMonth() + 1).toString().padStart(2, '0');
  weekTitle.textContent = T.weekTitle(`${startDay}/${startMonth}`, `${endDay}/${endMonth}`);
}
function updateMonthTitle() {
  monthTitle.textContent = T.monthTitle(T.monthNames[currentMonth], currentYear);
}

function findLatestCheckin(data) {
  if (!data || data.length === 0) return null;
  const sorted = [...data].sort((a, b) => {
    const timeA = a.rta_time_fm ? new Date(a.rta_time_fm).getTime() : 0;
    const timeB = b.rta_time_fm ? new Date(b.rta_time_fm).getTime() : 0;
    return timeB - timeA;
  });
  return sorted[0];
}
function updateLastCheckinInfo(checkin) {
  const statusTag = $('last-checkin-status');
  if (!statusTag) return;
  if (!checkin) {
    lastCheckinTime.textContent = '--:--';
    statusIndicator.className = 'status-indicator';
    statusTag.textContent = T.firstCheckin;
    statusTag.className = 'checkin-status-tag';
    return;
  }
  lastCheckinTime.textContent = formatCheckInTime(checkin.rta_time_fm);
  statusIndicator.className = 'status-indicator';
  let statusText = '';
  let extraClass = '';
  switch (checkin.view_mark_lb) {
    case 'IN': statusText = T.in; break;
    case 'TMPIN': statusText = T.tempin; break;
    case 'OUT': statusText = T.out; extraClass = 'checkout'; break;
    case 'TMPOUT': statusText = T.tempout; extraClass = 'tempout'; break;
    default: statusText = ''; extraClass = '';
  }
  statusTag.textContent = statusText;
  statusTag.className = 'checkin-status-tag';
  if (extraClass) statusTag.classList.add(extraClass);
  const viewMark = parseInt(checkin.view_mark || 0);
  if (viewMark === 1) statusIndicator.classList.add('status-green');
  else if (viewMark === 2) statusIndicator.classList.add('status-blue');
  else if (viewMark === 3) statusIndicator.classList.add('status-red');
}

async function fetchData() {
  showLoading(true);
  errorElem.style.display = 'none';
  try {
    const [attendanceResponse, leaveResponse, holidayResponse] = await Promise.all([
      fetch('https://es.rta.vn/hr_checkinout_list_v4/_search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "size": 10000,
          "collapse": { "field": "keyid_ins.raw" },
          "_source": { "includes": ["rta_time_fm", "view_mark", "view_mark_lb", "erp_salary_unit", "chkin_time", "chkout_time", "erp_shift_lb", "rta_date", "hr_month", "hr_year", "nb_count", "keyid_ins", "erp_shift_id", "rta_shift_id", "chkin_time_fm", "shift_lb_en", "shift_lb_vi"] },
          "query": { "bool": { "must": [
            { "term": { "org_id.raw": { "value": USER_ORG_ID } } },
            { "term": { "username.raw": { "value": USERNAME } } },
            { "range": { "hr_year": { "gte": "now/y" } } }
          ] } },
          "sort": [{ "endtime": { "order": "desc" } }]
        })
      }),
      fetch('https://es.rta.vn/hr_leave_tracking/_search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "size": 10000,
          "collapse": { "field": "keyid_ins.raw" },
          "_source": { "includes": ["leave_status_id", "erp_shift_lb", "rta_date", "nb_count", "keyid_ins"] },
          "query": { "bool": { "must": [
            { "term": { "org_id.raw": { "value": USER_ORG_ID } } },
            { "term": { "username.raw": { "value": USERNAME } } },
            { "range": { "rta_date": { "gte": "now/y" } } }
          ] } },
          "sort": [{ "endtime": { "order": "desc" } }]
        })
      }),
      fetch('https://es.rta.vn/erp_holiday/_search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "size": 10000,
          "collapse": { "field": "keyid_ins.raw" },
          "_source": { "includes": ["erp_holiday_status_id", "erp_holiday_lb", "erp_shift_lb", "rta_date", "hr_month", "hr_year", "nb_count", "keyid_ins"] },
          "query": { "bool": { "must": [
            { "range": { "nb_count": { "gt": "0" } } },
            { "term": { "org_id.raw": { "value": USER_ORG_ID } } }
          ] } },
          "sort": [{ "endtime": { "order": "desc" } }]
        })
      })
    ]);
    const [attendanceResult, leaveResult, holidayResult] = await Promise.all([
      attendanceResponse.json(),
      leaveResponse.json(),
      holidayResponse.json()
    ]);
    attendanceData = attendanceResult.hits ? attendanceResult.hits.hits.map(hit => hit._source) : [];
    leaveData = leaveResult.hits ? leaveResult.hits.hits.map(hit => hit._source) : [];
    holidayData = holidayResult.hits ? holidayResult.hits.hits.map(hit => hit._source) : [];
    leaveData = leaveData.filter(item => [1,2,3,4,6].includes(parseInt(item.leave_status_id||0)));
    holidayData = holidayData.filter(item => item.erp_holiday_status_id == 1);
    leaveData = leaveData.filter(item => parseFloat(item.nb_count||0) > 0);
    latestCheckin = findLatestCheckin(attendanceData);
    updateLastCheckinInfo(latestCheckin);
    updateAttendanceActions();
    calculateZeroWorkDays();
    showLoading(false);
    if (attendanceData.length === 0 && leaveData.length === 0 && holidayData.length === 0) {
      errorElem.textContent = T.notFound;
      errorElem.style.display = 'block';
      return;
    }
    renderCalendar();
  } catch (error) {
    showLoading(false);
    errorElem.textContent = `${T.error}: ${error.message}`;
    errorElem.style.display = 'block';
  }
}

function calculateZeroWorkDays() {
  zeroWorkData = [];
  const year = currentYear;
  const month = currentMonth;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const formattedDay = day.toString().padStart(2, '0');
      const formattedMonth = (month + 1).toString().padStart(2, '0');
      const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
      const hasAttendance = attendanceData.some(item => item.rta_date === formattedDate);
      const hasLeave = leaveData.some(item => item.rta_date === formattedDate);
      const hasHoliday = holidayData.some(item => item.rta_date === formattedDate);
      if (!hasAttendance && !hasLeave && !hasHoliday) {
        zeroWorkData.push({
          rta_date: formattedDate,
          hr_month: month + 1,
          hr_year: year,
          nb_count: "0"
        });
      }
    }
  }
}
function showLoading(show) { loadingElem.style.display = show ? 'block' : 'none'; }
function renderCalendar() {
  updateMonthTitle();
  updateWeekTitle();
  if (isMonthView) renderMonthView();
  else renderWeekView();
}
function renderWeekView() {
  weekView.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);
    const dayCell = createDayCell(date);
    weekView.appendChild(dayCell);
  }
}
function renderMonthView() {
  weekView.innerHTML = '';
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  let firstDayOfWeek = firstDay.getDay() || 7;
  for (let i = 1; i < firstDayOfWeek; i++) {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    const date = new Date(prevYear, prevMonth, daysInPrevMonth - (firstDayOfWeek - i - 1));
    const dayCell = createDayCell(date, true);
    weekView.appendChild(dayCell);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const dayCell = createDayCell(date);
    weekView.appendChild(dayCell);
  }
  const lastDayOfWeek = lastDay.getDay() || 7;
  for (let i = lastDayOfWeek + 1; i <= 7; i++) {
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
  if (date.getMonth() !== currentMonth) cell.classList.add('outside-month');
  const today = new Date();
  if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
    cell.classList.add('today');
  }
  if (date.getMonth() !== currentMonth) cell.classList.add('empty');
  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = date.getDate();
  cell.appendChild(dayNumber);
  const formattedDay = date.getDate().toString().padStart(2, '0');
  const formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
  const formattedDate = `${date.getFullYear()}-${formattedMonth}-${formattedDay}`;
  const eventDots = document.createElement('div');
  eventDots.className = 'event-dots';
  cell.appendChild(eventDots);
  const attendanceEvents = filterEventsByDate(attendanceData, formattedDate);
  const leaveEvents = filterEventsByDate(leaveData, formattedDate);
  const holidayEvents = filterEventsByDate(holidayData, formattedDate);
  const zeroEvents = filterEventsByDate(zeroWorkData, formattedDate);
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
        dot.textContent = '';
      }
      eventDots.appendChild(dot);
    });
  }
  if (leaveEvents.length > 0) addEventDot(eventDots, 'leave', calculateTotalCount(leaveEvents), formattedDate);
  if (holidayEvents.length > 0) addEventDot(eventDots, 'holiday', calculateTotalCount(holidayEvents), formattedDate);
  if (zeroEvents.length > 0 && (attendanceEvents.length > 0 || leaveEvents.length > 0 || holidayEvents.length > 0)) {
    addEventDot(eventDots, 'zero', 0);
  }
  if (attendanceEvents.length > 0 || leaveEvents.length > 0 || holidayEvents.length > 0) {
    cell.addEventListener('click', () => {
      showEventDetails(formattedDate, attendanceEvents, leaveEvents, holidayEvents);
    });
  }
  return cell;
}
function filterEventsByDate(events, dateString) {
  return events.filter(event => event.rta_date === dateString);
}
function calculateTotalCount(events) {
  return events.reduce((total, event) => total + parseFloat(event.nb_count || 0), 0).toFixed(1);
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
  function getUnitLabel(event) {
    if (event.erp_salary_unit == 1) return appLanguage === 'en' ? 'Day(s)' : 'Ngày công';
    if (event.erp_salary_unit == 2) return appLanguage === 'en' ? 'Hour(s)' : 'Giờ công';
    if (event.erp_salary_unit == 3) return appLanguage === 'en' ? 'Overtime hour' : 'Giờ Tăng ca';
    return T.unit;
  }
  window.reportOTClick = function(shiftId) {
    const reportJson = {
      "actionID": 1,
      "orderNumber": 1,
      "type": "act_fill_form",
      "formID": "",
      "familyID": "HR_OVERTIME_2",
      "preload": [{ "key": "rta_shift_txt", "value": shiftId }]
    };
    if (typeof App !== 'undefined' && typeof App.callActionButton === 'function') {
      App.callActionButton(JSON.stringify(reportJson));
    } else {
      showFlashMessage(T.featureNotSupported || 'Feature not supported');
    }
  };
  if (attendanceEvents.length > 0) {
    content += `<div class="event-list"><h4>${T.attendance}</h4>`;
    attendanceEvents.forEach(event => {
      content += `
      <div class="event-item">
        <div class="event-header">
          <span class="event-title">${event.erp_shift_lb || T.attendance}</span>`;
      if (event.erp_salary_unit == 3) {
        content += `<button class="ot-report-btn" onclick="reportOTClick('${event.rta_shift_id || ''}')">${appLanguage === 'en' ? 'Report OT' : 'Báo cáo OT'}</button>`;
      } else {
        content += `<span class="event-count">${event.nb_count || '0'} ${getUnitLabel(event)}</span>`;
      }
      content += `</div>
        ${event.chkin_time || event.chkout_time ? `<div class="event-details">${event.chkin_time ? `IN: ${event.chkin_time}` : ''}<br>${event.chkout_time ? `OUT: ${event.chkout_time}` : ''}</div>` : ''}
      </div>`;
    });
    content += `</div>`;
  }
  if (leaveEvents.length > 0) {
    content += `<div class="event-list"><h4>${T.leaveDetail}</h4>`;
    leaveEvents.forEach(event => {
      content += `
      <div class="event-item">
        <div class="event-header">
          <span class="event-title">${event.erp_shift_lb || T.leaveDetail}</span>
          <span class="event-count">${event.nb_count || '0'} ${appLanguage === 'en' ? 'Day(s)' : 'Ngày công'}</span>
        </div>
      </div>`;
    });
    content += `</div>`;
  }
  if (holidayEvents.length > 0) {
    content += `<div class="event-list"><h4>${T.holiday}</h4>`;
    holidayEvents.forEach(event => {
      content += `
      <div class="event-item">
        <div class="event-header">
          <span class="event-title">${event.erp_holiday_lb || T.holiday}</span>
          <span class="event-count">${event.nb_count || '0'} ${appLanguage === 'en' ? 'Day(s)' : 'Ngày công'}</span>
        </div>
        ${event.erp_shift_lb ? `<div class="event-details">${event.erp_shift_lb}</div>` : ''}
      </div>`;
    });
    content += `</div>`;
  }
  modalContent.innerHTML = content || `<div class="event-item">${T.notFound}</div>`;
  modalOverlay.style.display = 'block';
  eventModal.style.display = 'block';
}

function toggleView() {
 
  isMonthView = !isMonthView;
  if (isMonthView) {
    expandToggle.textContent = '▲';
    calendarView.style.maxHeight = '800px';
    monthHeader.style.display = 'flex';
    weekHeader.style.display = 'none';
  } else {
    expandToggle.textContent = '▼';
    calendarView.style.maxHeight = '150px';
    monthHeader.style.display = 'none';
    weekHeader.style.display = 'flex';
  }
  renderCalendar();
}
function goToPrevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  updateMonthTitle();
  renderCalendar();
}
function goToNextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  updateMonthTitle();
  renderCalendar();
}
function goToPrevWeek() {
  weekStartDate.setDate(weekStartDate.getDate() - 7);
  currentMonth = weekStartDate.getMonth();
  currentYear = weekStartDate.getFullYear();
  updateWeekTitle();
  renderWeekView();
}
function goToNextWeek() {
  weekStartDate.setDate(weekStartDate.getDate() + 7);
  currentMonth = weekStartDate.getMonth();
  currentYear = weekStartDate.getFullYear();
  updateWeekTitle();
  renderWeekView();
}


viewHistoryBtn.addEventListener('click', viewCheckinHistory);
closeModal.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
  eventModal.style.display = 'none';
});
modalOverlay.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
  eventModal.style.display = 'none';
});

// ====== Attendance Action Buttons ======
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
function renderAttendanceActions(view_mark) {
  const container = document.getElementById('attendance-action-container');
  container.innerHTML = '';
  let buttons = [];
  const BTN = {
    checkin_remote: {
      label: T.checkinRemote,
      icon: `<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 48 48" fill="none"><path d="M24 6C16.268 6 10 12.268 10 20c0 7.732 10.5 18 14 21.5C27.5 38 38 27.732 38 20c0-7.732-6.268-14-14-14Z" stroke="currentColor" stroke-width="7" fill="none"/><circle cx="24" cy="20" r="5" stroke="currentColor" stroke-width="3" fill="none"/><path d="M34 41a10 4 0 1 1-20 0" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
      onClick: function () {
        // Nếu latestCheckin null thì time_txt = "2024-01-01 00:00:00"
        const timeValue = latestCheckin && latestCheckin.rta_time_fm
          ? latestCheckin.rta_time_fm
          : "2024-01-01 00:00:00";
        const json = {
          actionID: 3,
          orderNumber: 1,
          type: "act_fill_form",
          familyID: "HR_CHECKIN",
          preload: [
            { key: "time_txt", value: timeValue },
            { key: "rta_type", value: "2" }
          ]
        };
        if (typeof App !== 'undefined' && typeof App.callActionButton === 'function') {
          App.callActionButton(JSON.stringify(json));
        } else {
          showFlashMessage(T.noAppCallActionButton || 'App.callActionButton not found');
        }
      }
    },
    checkout_remote: {
      label: T.checkoutRemote,
      icon: `<svg class="attendance-btn-icon" width="32" height="32" viewBox="0 0 48 48" fill="none"><path d="M24 6C16.268 6 10 12.268 10 20c0 7.732 10.5 18 14 21.5C27.5 38 38 27.732 38 20c0-7.732-6.268-14-14-14Z" stroke="currentColor" stroke-width="7" fill="none"/><circle cx="24" cy="20" r="5" stroke="currentColor" stroke-width="3" fill="none"/><path d="M34 41a10 4 0 1 1-20 0" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
      onClick: function () {
        if (!latestCheckin) return;
        const json = {
          actionID: 4,
          orderNumber: 1,
          type: "act_fill_form",
          familyID: "HR_CHECKOUT",
          openArgs: {
            erp_shift_id: latestCheckin.erp_shift_id || "",
            rta_shift_id: latestCheckin.rta_shift_id || "",
            rta_datetime_in: latestCheckin.chkin_time_fm || ""
          },
          preload: [
            { key: "rta_type", value: "2" },
            { key: "shift_lb_en", value: latestCheckin.shift_lb_en || "" },
            { key: "shift_lb_vi", value: latestCheckin.shift_lb_vi || "" },
            { key: "time_txt", value: latestCheckin.rta_time_fm || "" }
          ]
        };
        if (typeof App !== 'undefined' && typeof App.callActionButton === 'function') {
          App.callActionButton(JSON.stringify(json));
        } else {
          showFlashMessage(T.noAppCallActionButton || 'App.callActionButton not found');
        }
      }
    }
  };

  if (view_mark == 1) {
    buttons = [BTN.checkout_remote];
  } else {
    buttons = [BTN.checkin_remote];
  }

  if (buttons.length) {
    let html = `<div class="attendance-action-buttons">`;
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
    html += `</div>`;
    container.innerHTML += html;

    window.attendanceButtonHandlers = buttons.map(btn => function () {
      btn.onClick();
      if (latestCheckin) lastCheckinTimeValue = latestCheckin.rta_time_fm;
      else lastCheckinTimeValue = null;
      checkCount = 0;
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(checkLastCheckinChange, 5000);
    });
  }
}

function updateAttendanceActions() {
  const view_mark = latestCheckin ? Number(latestCheckin.view_mark) : 0;
  renderAttendanceActions(view_mark);
}

// ====== Action Bar ======
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

// ====== Lịch sử chấm công & mũi tên profile ======
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

// ====== Notification ======
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
    return src.erp_status == 1 && src.endday >= todayStr;
  });
  renderNotifCards(items.map(i => i._source));
}
function renderNotifCards(arr) {
  notifCard.innerHTML = arr.map((src, idx) => {
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
          <button class="notif-arrow" tabindex="-1" aria-hidden="true">&#10095;</button>
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
  const modalBg = $('modal-bg');
  $('modal-body2').innerHTML = html || '';
  modalBg.classList.add('show');
};
window.closeNotifModal = function() {
  $('modal-bg').classList.remove('show');
};
$('modal-bg').onclick = function(e) {
  if (e.target === this) closeNotifModal();
};
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

// ====== Dashboard Button ======
if (dashboardBtn) {
  dashboardBtn.onclick = function () {
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
  };
}

// ====== Auto refresh (60 phút) ======
function autoRefreshAll() {
  fetchData();
  fetchDataNotif();
}
setInterval(autoRefreshAll, 60 * 60 * 1000);

// ====== Hàm khởi tạo HRM-MAIN sau combine ======
function renderHRMMain() {
  // Reset trạng thái lịch
  currentDate = new Date();
  weekStartDate = new Date(currentDate);
  currentMonth = currentDate.getMonth();
  currentYear = currentDate.getFullYear();
  isMonthView = false;
  adjustToMonday(weekStartDate);

  // Cập nhật label, tiêu đề, ngày trong tuần
  updateMonthTitle();
  updateWeekTitle();
  const weekdaysRow = $('weekdays-row');
  weekdaysRow.innerHTML = '';
  T.weekdayNames.forEach(name => {
    const div = document.createElement('div');
    div.textContent = name;
    weekdaysRow.appendChild(div);
  });
  $('loading-text').textContent = T.loading;
  $('error').textContent = T.error;
  $('view-history-label').textContent = T.checkinHistory;
  $('label-leave').textContent = T.leave;
  $('label-ot').textContent = T.ot;
  $('label-salary').textContent = T.salary;
  $('label-business').textContent = T.business;
  $('label-rule').textContent = T.rule;
  $('label-benefit').textContent = T.benefit;
  $('label-task').textContent = T.task;
  $('label-asset').textContent = T.asset;
  $('label-expense').textContent = T.expense;
  $('dashboard-btn').title = T.dashboard;
  $('modal-title').textContent = T.dayDetail("dd/mm/yyyy");

  // Gắn lại sự kiện

  prevMonthBtn.onclick = goToPrevMonth;
  nextMonthBtn.onclick = goToNextMonth;
  prevWeekBtn.onclick = goToPrevWeek;
  nextWeekBtn.onclick = goToNextWeek;
  viewHistoryBtn.onclick = viewCheckinHistory;
  closeModal.onclick = () => {
    modalOverlay.style.display = 'none';
    eventModal.style.display = 'none';
  };
  modalOverlay.onclick = () => {
    modalOverlay.style.display = 'none';
    eventModal.style.display = 'none';
  };
  if (dashboardBtn) {
    dashboardBtn.onclick = function () {
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
    };
  }
  // Action bar
  document.querySelectorAll('.action-bar-item').forEach(item => {
    item.onclick = function () {
      const action = this.getAttribute('data-action');
      if (actionBarJson[action]) {
        if (typeof App !== 'undefined' && typeof App.callActionButton === 'function') {
          App.callActionButton(JSON.stringify(actionBarJson[action]));
        } else {
          showFlashMessage(T.noAppCallActionButton || 'App.callActionButton not found');
        }
      } else {
        showFlashMessage(T.featureNotSupported || 'Feature not supported');
      }
    };
  });

  // Fetch dữ liệu
  fetchData();
  fetchDataNotif();
  // KHÔNG gọi fetchAndPopulateProfile()
}


document.addEventListener('DOMContentLoaded', function () {
  userType = checkUserType();
  renderByUserType();
  renderCombineLang();
  renderCalendar();
  document.getElementById('auth-loading').style.display = 'none';
  document.getElementById('expand-toggle').addEventListener('click', toggleView);

  // Xử lý avatar
  const profileImageDiv = document.querySelector('.profile-image');
  if (!photoPath) {
    profileImageDiv.innerHTML = '<img src="https://eventlog.rta.vn/assets/d23217dc-67cd-4f7a-9824-7dbf2b9934b3" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
  } else {
    profileImageDiv.innerHTML = '<img src="' + photoPath + '" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
  }

  // Xử lý vị trí chức danh
  const profilePositionElem = document.querySelector('.profile-position');
  if ((!title || title.trim() === '') && userType === 'trial') {
    profilePositionElem.textContent = 'Nhân viên - Phòng Kinh doanh';
  } else {
    profilePositionElem.textContent = `${title} - ${department}`;
  }
  
  
});

