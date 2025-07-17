// fusesell-ai-login.js
// Multi-language definitions
const LANG = {
  vi: {
    // Banner texts
    trial_mode_title: "Chế độ trải nghiệm",
    trial_mode_desc:
      "Bạn đang sử dụng phiên bản dùng thử. Dữ liệu sẽ bị xóa sau 7 ngày.",
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
    trial_success:
      "Hệ thống đang xử lý yêu cầu sử dụng {appName} - Người dùng trải nghiệm cho <b>{user}</b>, vui lòng chờ hệ thống xác nhận thông tin và khởi tạo dữ liệu!",
    join_success:
      "Yêu cầu tham gia <b>{org}</b> của bạn đã được xử lý thành công",
    notify: (org, email) =>
      `Hệ thống đã hoàn tất khởi tạo <b>${org}</b>.Bạn có thể bắt đầu ngay bây giờ!`,
    trial_mode_subtitle: "Bạn đang sử dụng chế độ trải nghiệm",
    official_mode_subtitle: "Phiên bản chính thức",
    settings_alert: "Chức năng cài đặt tổ chức sẽ được phát triển",
    org_update_timeout:
      "Hệ thống chưa xác nhận được thông tin Tổ chức. Bạn vui lòng thử lại",
    org_update_error: "Lỗi khi kiểm tra cập nhật tổ chức.",
  },
  en: {
    // Banner texts
    trial_mode_title: "Trial Mode",
    trial_mode_desc:
      "You are using the trial version. Data will be deleted after 7 days.",
    setup_btn: "Upgrade",
    official_status: "Official",
    settings_btn: "Settings",

    // Welcome texts
    welcome_app: "Welcome to FuseSell AI",
    app_description: "AI Powered Sales Management System",

    // Setup dialog
    setup_org_title: "Organization Setup",
    setup_org_desc: "Choose how you want to use FuseSell AI",
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
    org_code_help:
      "Contact the organization administrator to get the invitation code",

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
    trial_success:
      "The system is processing the request to use {appName} - Trial User for <b>{user}</b>. Please wait for the system to confirm the information and initialize the data!",
    join_success:
      "Your request to join <b>{org}</b> has been successfully processed",
    notify: (org, email) =>
      `The system has successfully created the organization <b>${org}</b>. You can get started now!`,
    trial_mode_subtitle: "You are using trial mode",
    official_mode_subtitle: "Official Version",
    settings_alert: "Organization settings feature will be developed",
    org_update_timeout:
      "The system couldn't verify the organization information. Please try again",
    org_update_error: "Error checking organization update.",
  },
};

// Global variables
let userType = "trial";
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
  setText("trial-mode-title", T.trial_mode_title);
  var trialModeDescElem = document.getElementById("trial-mode-desc");
  if (trialModeDescElem) {
    trialModeDescElem.textContent = T.trial_mode_desc;
  }
  setText("btn-setup-trial", T.setup_btn);
  setText("official-status", T.official_status);
  // setText('btn-org-settings', T.settings_btn);

  // Setup dialog
  setText("setup-org-title", T.setup_org_title);
  setText("setup-org-desc", T.setup_org_desc);
  setText("create-org-title", T.create_org_title);
  setText("create-org-desc", T.create_org_desc);
  setText("join-org-title", T.join_org_title);
  setText("join-org-desc", T.join_org_desc);
  setText("btn-continue-trial", T.continue_trial);

  // Form labels and placeholders
  setText("org-name-label", T.org_name_label);
  setPlaceholder("org-name-input", T.org_name_placeholder);
  setText("org-shortname-label", T.org_shortname_label);
  setPlaceholder("org-shortname", T.org_shortname_placeholder);
  setText("business-type-label", T.business_type_label);
  setText("business-auto", T.business_auto);
  setText("business-electronics", T.business_electronics);
  setText("business-ac", T.business_ac);
  setText("business-appliance", T.business_appliance);
  setText("business-other", T.business_other);
  setText("contact-name-label", T.contact_name_label);
  setText("contact-email-label", T.contact_email_label);
  setText("contact-phone-label", T.contact_phone_label);
  setText("org-code-label", T.org_code_label);
  setPlaceholder("org-code-input", T.org_code_placeholder);
  setText("org-code-help", T.org_code_help);

  // Buttons
  setText("btn-back-create", T.back_btn);
  setText("btn-submit-org", T.create_org_btn);
  setText("btn-back-join", T.back_btn);
  setText("btn-confirm-join", T.join_btn);
  setText("btn-close-result", T.close_btn);
}

// Generate random ID
function generateRandomId(length = 9) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
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
    userType = "trial";
    isTrialMode = true;
    return "trial";
  } else {
    userType = "official";
    isTrialMode = false;
    return "official";
  }
}

async function checkOrgInfoData() {
  const apiUrl = "https://es.rta.vn/nerp_org/_search";

  // Ensure trialOrgId is always an array
  const trialOrgIds = Array.isArray(config.trialOrgId)
    ? config.trialOrgId
    : [config.trialOrgId];

  const query = {
    sort: [{ __system_update_timestamp__: "desc" }],
    query: {
      bool: {
        must: [
          { term: { "username.raw": { value: config.username } } },
          { term: { "project_code.raw": { value: config.projectCode } } },
        ],
        must_not: [{ terms: { "org_id.raw": trialOrgIds } }],
      },
    },
    size: 1,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    });

    const data = await response.json();
    // Check if data is returned
    return data.hits.total.value > 0; // Return true if data exists, false otherwise
  } catch (error) {
    console.error("Error calling Elasticsearch API:", error);
    return false; // Return false if an error occurs
  }
}

function pollOrgUpdate(
  originalOrgId,
  resultMessage,
  maxAttempts = 3,
  interval = 5000
) {
  let attempts = 0;
  let tipIndex = 0;
  let tipInterval;

  // Extract helpful tips from FAQs
  const fuseSellTips = {
    en: [
      "FuseSell AI is an advanced sales management system that leverages artificial intelligence to optimize your entire sales lifecycle.",
      "FuseSell AI features a comprehensive 60-stage sales process covering everything from pre-sales to post-sale customer engagement.",
      "You can create specialized teams for different products or market segments, each with their own sales strategies.",
      "FuseSell AI automates email outreach, follow-up scheduling, content generation, and customer engagement.",
      "The AI learns from your preferences and optimizes communications for better results.",
      "You can customize AI-generated content to match your brand voice and sales approach in the Settings tab.",
      "FuseSell AI provides detailed email tracking, showing delivery status, open rates, and engagement metrics.",
      "The Home tab shows all your recent processes with current stages and progress indicators.",
      "Customer contacts are automatically saved from your sales processes and can be accessed through the 'Customers' section.",
      "FuseSell AI has three main tabs: Home (sales processes), Events (tasks), and Settings (configuration).",
    ],
    vi: [
      "FuseSell AI là một hệ thống quản lý bán hàng tiên tiến sử dụng trí tuệ nhân tạo để tối ưu hóa toàn bộ vòng đời bán hàng của bạn.",
      "FuseSell AI có quy trình bán hàng 60 giai đoạn toàn diện bao gồm mọi thứ từ hoạt động tiền bán hàng đến tương tác và giữ chân khách hàng sau bán hàng.",
      "Bạn có thể tạo các nhóm chuyên biệt cho các sản phẩm hoặc phân khúc thị trường khác nhau, mỗi nhóm có chiến lược bán hàng riêng.",
      "FuseSell AI tự động hóa tiếp cận email, lên lịch theo dõi, tạo nội dung và tương tác khách hàng.",
      "AI học từ sở thích của bạn và tối ưu hóa giao tiếp để có kết quả tốt hơn.",
      "Bạn có thể tùy chỉnh nội dung do AI tạo ra để phù hợp với giọng điệu thương hiệu và phương pháp bán hàng của bạn trong tab Cài đặt.",
      "FuseSell AI cung cấp theo dõi email chi tiết, hiển thị trạng thái gửi, tỷ lệ mở và số liệu tương tác.",
      "Tab Trang chủ hiển thị tất cả các quy trình gần đây của bạn với các giai đoạn hiện tại và chỉ báo tiến độ.",
      "Liên hệ khách hàng được tự động lưu từ quy trình bán hàng của bạn và có thể được truy cập thông qua phần 'Khách hàng'.",
      "FuseSell AI có ba tab chính: Trang chủ (quy trình bán hàng), Sự kiện (nhiệm vụ), và Cài đặt (cấu hình).",
    ],
  };

  function displayRetryUI(message) {
    const retryPopup = document.getElementById("retry-popup");
    const retryMessage = document.getElementById("retry-popup-message");
    const btnRetryPopup = document.getElementById("btn-retry-popup");

    if (retryMessage) {
      retryMessage.textContent = message;
    }

    if (retryPopup) {
      retryPopup.classList.remove("hidden");
    }

    if (btnRetryPopup) {
      btnRetryPopup.onclick = function () {
        // hide popup retry
        retryPopup.classList.add("hidden");
        // ReShow spinner
        showProcessingUI();
        attempts = 0; // Reset the number of tests again
        checkUpdate();
      };
    }
  }

  function showProcessingUI() {
    // Clear any existing interval
    if (tipInterval) clearInterval(tipInterval);

    // Remove any existing overlay
    const existingOverlay = document.getElementById("processing-overlay");
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create a completely new processing overlay
    const overlay = document.createElement("div");
    overlay.id = "processing-overlay";

    // Style the overlay with inline styles to ensure it works regardless of CSS
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.padding = "20px";

    // Add the overlay to the document body
    document.body.appendChild(overlay);

    // Create the content container
    const processingContainer = document.createElement("div");
    processingContainer.id = "processing-container";
    processingContainer.style.maxWidth = "500px";
    processingContainer.style.width = "100%";
    processingContainer.style.textAlign = "center";
    overlay.appendChild(processingContainer);

    // Create spinner with CSS animation
    const spinnerDiv = document.createElement("div");
    spinnerDiv.innerHTML = `
      <div style="margin: 0 auto; width: 50px; height: 50px; border: 5px solid rgba(0, 0, 0, 0.1); border-radius: 50%; border-top-color: #4f46e5; animation: spin 1s ease-in-out infinite;"></div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    processingContainer.appendChild(spinnerDiv);

    // Create processing label
    const spinnerLabel = document.createElement("div");
    spinnerLabel.innerHTML = `<div style="margin-top: 15px; font-size: 18px; font-weight: 600; color: #4f46e5;">${T.processing}</div>`;
    processingContainer.appendChild(spinnerLabel);

    // Create wait message
    const waitMessage = document.createElement("div");
    waitMessage.style.margin = "15px 0";
    waitMessage.style.color = "#666";
    waitMessage.style.fontSize = "14px";
    waitMessage.innerHTML =
      currentLang === "vi"
        ? "Quá trình này có thể mất một chút thời gian. Hãy khám phá một số mẹo hữu ích trong khi chờ đợi! 😊"
        : "This process may take a moment. Explore some helpful tips while you wait! 😊";
    processingContainer.appendChild(waitMessage);

    // Create the tip element with a colorful design - using ONLY inline styles for reliability
    const tipElement = document.createElement("div");
    tipElement.id = "fusesell-tip";

    // Apply all styles inline to ensure they work regardless of CSS
    tipElement.style.margin = "20px auto";
    tipElement.style.padding = "16px";
    tipElement.style.borderRadius = "8px";
    tipElement.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    tipElement.style.maxWidth = "450px";
    tipElement.style.transition = "all 0.5s ease";

    // Define color themes
    const colorThemes = [
      {
        bg: "linear-gradient(135deg, #EFF6FF, #EEF2FF)",
        text: "#1E40AF",
        icon: "#3B82F6",
        border: "#BFDBFE",
      },
      {
        bg: "linear-gradient(135deg, #ECFDF5, #F0FDF4)",
        text: "#065F46",
        icon: "#10B981",
        border: "#A7F3D0",
      },
      {
        bg: "linear-gradient(135deg, #F5F3FF, #EEF2FF)",
        text: "#5B21B6",
        icon: "#8B5CF6",
        border: "#C7D2FE",
      },
      {
        bg: "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
        text: "#92400E",
        icon: "#F59E0B",
        border: "#FDE68A",
      },
    ];

    const theme = colorThemes[Math.floor(Math.random() * colorThemes.length)];

    // Apply the selected theme using inline styles
    tipElement.style.background = theme.bg;
    tipElement.style.color = theme.text;
    tipElement.style.border = `1px solid ${theme.border}`;

    // Create the tip content with pure inline styles (no CSS classes)
    tipElement.innerHTML = `
        <div style="display: flex; align-items: flex-start;">
          <svg style="width: 24px; height: 24px; margin-right: 12px; flex-shrink: 0; color: ${
            theme.icon
          };" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p style="font-weight: 500; margin-bottom: 8px; font-size: 16px;">${
              currentLang === "vi" ? "💡 Mẹo FuseSell AI" : "💡 FuseSell AI Tip"
            }</p>
            <p id="tip-content" style="line-height: 1.5;">${
              fuseSellTips[currentLang][0]
            }</p>
          </div>
        </div>
      `;

    // Safely append the tip element to the appropriate container
    try {
      if (processingContainer) {
        // If we have a dedicated container, simply append to it
        processingContainer.appendChild(tipElement);
      } else if (spinner && spinner.parentNode) {
        // If we have a spinner, append after it
        spinner.parentNode.appendChild(tipElement);
      } else {
        // Fallback: append to body if nothing else works
        document.body.appendChild(tipElement);
      }
      console.log("Tip element added successfully:", tipElement.id);
    } catch (err) {
      console.error("Error adding tip element:", err);
      // Fallback: try to add to body as a last resort
      try {
        document.body.appendChild(tipElement);
        console.log("Tip element added to body as fallback");
      } catch (e) {
        console.error("Failed to add tip element to body:", e);
      }
    }

    // Update tip content every 5 seconds with enhanced animation
    tipInterval = setInterval(() => {
      const tipContent = document.getElementById("tip-content");
      const tipElement = document.getElementById("fusesell-tip");

      if (tipContent && tipElement) {
        tipIndex = (tipIndex + 1) % fuseSellTips[currentLang].length;

        // Add enhanced transition effects
        tipContent.style.opacity = "0";
        tipElement.style.transform = "translateY(5px)";

        // Define color themes with inline style values
        const colorThemes = [
          {
            bg: "linear-gradient(135deg, #EFF6FF, #EEF2FF)",
            text: "#1E40AF",
            icon: "#3B82F6",
            border: "#BFDBFE",
          },
          {
            bg: "linear-gradient(135deg, #ECFDF5, #F0FDF4)",
            text: "#065F46",
            icon: "#10B981",
            border: "#A7F3D0",
          },
          {
            bg: "linear-gradient(135deg, #F5F3FF, #EEF2FF)",
            text: "#5B21B6",
            icon: "#8B5CF6",
            border: "#C7D2FE",
          },
          {
            bg: "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
            text: "#92400E",
            icon: "#F59E0B",
            border: "#FDE68A",
          },
        ];

        const theme =
          colorThemes[Math.floor(Math.random() * colorThemes.length)];

        setTimeout(() => {
          // Update content
          tipContent.textContent = fuseSellTips[currentLang][tipIndex];

          // Update styles using inline style properties
          tipElement.style.background = theme.bg;
          tipElement.style.color = theme.text;
          tipElement.style.borderColor = theme.border;

          // Update icon color
          const icon = tipElement.querySelector("svg");
          if (icon) {
            icon.style.color = theme.icon;
          }

          // Add fade-in and bounce-back effect
          tipContent.style.opacity = "1";
          tipElement.style.transform = "translateY(0)";
        }, 300);
      }
    }, 5000);
  }

  function hideProcessingUI() {
    // Clear any existing interval
    if (tipInterval) clearInterval(tipInterval);

    // Remove the overlay
    const overlay = document.getElementById("processing-overlay");
    if (overlay) {
      overlay.remove();
    }

    // For backward compatibility, also hide the old spinner if it exists
    const spinner = document.getElementById("loading-spinner");
    if (spinner) {
      spinner.classList.add("hidden");
    }
  }

  // Show the enhanced processing UI
  showProcessingUI();

  const checkUpdate = () => {
    fetch(
      `${config.projectURL}/api/dm/getData?token=your_token_here&dm_name=ss_user&max_order=0&format=json&mode=download&where=\`username\`="${config.username}"`
    )
      .then((res) => res.json())
      .then((data) => {
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          data[0].organization_id !== originalOrgId
        ) {
          // If organization_id has changed, conducted 2 actions:
          hideProcessingUI(); // Hide the UI first

          App.callActionButton(
            JSON.stringify({
              actionID: 24703,
              orderNumber: 1,
              type: "act_fetch_rcm",
              label: "Fetch RCM",
            })
          );
          setTimeout(() => {
            App.callActionButton(
              JSON.stringify({
                actionID: 24704,
                orderNumber: 2,
                type: "act_reload_app",
                label: "Reload App",
              })
            );
            // Show Popup results
            showResult(resultMessage);
          }, 3000);
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkUpdate, interval);
          } else {
            hideProcessingUI();
            displayRetryUI(T.org_update_timeout);
          }
        }
      })
      .catch((err) => {
        console.error("Lỗi polling:", err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkUpdate, interval);
        } else {
          hideProcessingUI();
          // Enhanced error message with source identification and more details
          const errorMsg = `
            <div class="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <div class="font-medium text-red-700">[ERROR SOURCE: POLLING UPDATE]</div>
              <div>${T.org_update_error}</div>
              <div class="text-sm text-gray-600 mt-2">
                Error: ${err.message || "Unknown"}<br>
                Time: ${new Date().toLocaleTimeString()}<br>
                Attempts: ${attempts}/${maxAttempts}<br>
                URL: ${config.projectURL}/api/dm/getData
              </div>
            </div>
          `;
          displayRetryUI(errorMsg);
        }
      });
  };

  setTimeout(checkUpdate, 5000);
  // checkUpdate();
}

function showResult(msg, color = "#333") {
  const setupDialog = document.getElementById("setup-dialog");
  if (setupDialog) setupDialog.classList.add("hidden");

  const resultScreen = document.getElementById("result-screen");
  if (resultScreen) resultScreen.classList.remove("hidden");

  const msgElem = document.getElementById("result-message");
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
  const trialBanner = document.getElementById("trial-banner");
  const officialBanner = document.getElementById("official-banner");
  const orgNameDisplay = document.getElementById("org-name-display");
  const orgIdDisplay = document.getElementById("org-id-display");
  const userDisplay = document.getElementById("org-user-display");
  const orgInfoButton = document.getElementById("org-info-button");

  // const welcomeSubtitle = document.getElementById('welcome-subtitle');

  if (isTrialMode) {
    // Show trial banner
    if (trialBanner) trialBanner.classList.remove("hidden");
    if (officialBanner) officialBanner.classList.add("hidden");
    // if (welcomeSubtitle) welcomeSubtitle.textContent = T.trial_mode_subtitle;
  } else {
    // Show official banner
    if (officialBanner) officialBanner.classList.remove("hidden");
    if (trialBanner) trialBanner.classList.add("hidden");

    // Update organization info
    if (orgNameDisplay)
      orgNameDisplay.textContent = config.userOrgName || "Your Organization";
    if (orgIdDisplay) orgIdDisplay.textContent = `ID: ${config.userOrgId}`;
    if (userDisplay) userDisplay.textContent = `${config.userFullName}`;
    // if (welcomeSubtitle) welcomeSubtitle.textContent = `${config.userOrgName || 'Your Organization'} - ${T.official_mode_subtitle}`;

    // Check data from elasticsearch
    const hasOrgInfoData = await checkOrgInfoData();

    // Hide/Show button based on the results
    if (orgInfoButton) {
      if (hasOrgInfoData) {
        orgInfoButton.classList.remove("hidden");
      } else {
        orgInfoButton.classList.add("hidden");
      }
    }
  }
}

// Setup event handlers
function setupEventHandlers() {
  // Setup trial button (from trial banner)
  var btnSetupTrial = document.getElementById("btn-setup-trial");
  if (btnSetupTrial) {
    // btnSetupTrial.onclick = function() {
    //   showSetupDialog();
    // };

    btnSetupTrial.addEventListener("click", function () {
      const actionData = {
        actionID: 99,
        orderNumber: 1,
        type: "act_dm_view",
        label: "no label",
        screen: "fusesellaisub-fusesellai01-fusesellai01obj1000-screen1001",
        alias: "fusesellai_fusesellai01obj1000",
        args: { user_type: userType },
      };
      App.callActionButton(JSON.stringify(actionData));
    });
  }

  // Organization settings button (from official banner)
  // document.getElementById('btn-org-settings').onclick = function() {
  //     alert(T.settings_alert);
  // };

  // Close setup dialog
  var btnCloseSetup = document.getElementById("btn-close-setup");
  if (btnCloseSetup) {
    btnCloseSetup.addEventListener("click", function () {
      hideSetupDialog();
    });
  }

  var btnCreateOrg = document.getElementById("btn-create-org");
  if (btnCreateOrg) {
    btnCreateOrg.addEventListener("click", function () {
      // Hide setup-org-desc
      var setupOrgDesc = document.getElementById("setup-org-desc");
      if (setupOrgDesc) setupOrgDesc.classList.add("hidden");
      // Hide selection setup
      var setupSelection = document.getElementById("setup-selection");
      if (setupSelection) setupSelection.classList.add("hidden");
      // Show form create org
      var createOrgForm = document.getElementById("create-org-form");
      if (createOrgForm) createOrgForm.classList.remove("hidden");
      // Setup default value for form
      var contactName = document.getElementById("contact-name");
      if (contactName) contactName.value = config.userFullName;
      var contactEmail = document.getElementById("contact-email");
      if (contactEmail) contactEmail.value = config.userEmail;
      var contactPhone = document.getElementById("contact-phone");
      if (contactPhone) contactPhone.value = config.userPhone;
    });
  }

  var btnJoinOrg = document.getElementById("btn-join-org");
  if (btnJoinOrg) {
    btnJoinOrg.addEventListener("click", function () {
      // Hide setup-org-desc
      var setupOrgDesc = document.getElementById("setup-org-desc");
      if (setupOrgDesc) setupOrgDesc.classList.add("hidden");
      // Hide selection setup
      var setupSelection = document.getElementById("setup-selection");
      if (setupSelection) setupSelection.classList.add("hidden");
      // Show form join Org
      var joinOrgForm = document.getElementById("join-org-form");
      if (joinOrgForm) joinOrgForm.classList.remove("hidden");
    });
  }

  // Continue trial button
  // document.getElementById('btn-continue-trial').onclick = function() {
  //     hideSetupDialog();
  // };
  var btnContinueTrial = document.getElementById("btn-continue-trial");
  if (btnContinueTrial) {
    btnContinueTrial.addEventListener("click", function () {
      const actionData = {
        actionID: 99,
        orderNumber: 1,
        type: "act_exit",
        label: "no label",
      };
      App.callActionButton(JSON.stringify(actionData));
    });
  }

  var btnBackCreate = document.getElementById("btn-back-create");
  if (btnBackCreate) {
    btnBackCreate.addEventListener("click", function () {
      var createOrgForm = document.getElementById("create-org-form");
      if (createOrgForm) createOrgForm.classList.add("hidden");
      var setupSelection = document.getElementById("setup-selection");
      if (setupSelection) setupSelection.classList.remove("hidden");
      // Show the description of setup-org-desc
      var setupOrgDesc = document.getElementById("setup-org-desc");
      if (setupOrgDesc) setupOrgDesc.classList.remove("hidden");
    });
  }

  var btnBackJoin = document.getElementById("btn-back-join");
  if (btnBackJoin) {
    btnBackJoin.addEventListener("click", function () {
      var joinOrgForm = document.getElementById("join-org-form");
      if (joinOrgForm) joinOrgForm.classList.add("hidden");
      var setupSelection = document.getElementById("setup-selection");
      if (setupSelection) setupSelection.classList.remove("hidden");
      // Show the description of setup-org-desc
      var setupOrgDesc = document.getElementById("setup-org-desc");
      if (setupOrgDesc) setupOrgDesc.classList.remove("hidden");
    });
  }

  // Create org form submit
  var orgCreateForm = document.getElementById("org-create-form");
  if (orgCreateForm) {
    orgCreateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const orgName = document.getElementById("org-name-input").value.trim();
      let shortName = document.getElementById("org-shortname").value.trim();
      if (!shortName) shortName = orgName;
      const contactName = document.getElementById("contact-name").value.trim();
      const contactEmail = document
        .getElementById("contact-email")
        .value.trim();
      const contactPhone = document
        .getElementById("contact-phone")
        .value.trim();

      let orgId;
      if (userType === "trial") {
        orgId = "s" + generateRandomId();
      } else if (userType === "official") {
        orgId = config.userOrgId;
      }

      const payload = {
        event_id: `rt${config.appShortName.toLowerCase()}.neworg`,
        new_org: "1",
        project_code: config.projectCode,
        data: [
          {
            username: config.username,
            fullname: config.userFullName,
            user_role: config.userRoledefault,
            email: config.userEmail,
            cellphone:
              config.userPhone && config.userPhone.trim()
                ? config.userPhone
                : "0",
            user_status: "1",
            org_id: orgId,
            org_name: shortName,
            contact_name: contactName,
            contact_email: contactEmail,
            contact_phone: contactPhone || "0",
            context_title: `${shortName}-${config.appShortName}`,
          },
        ],
      };

      fetch(config.apiEndpoints.webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(() => {
          // Hide the entry interface completely by setting the style display = 'none'
          const createOrgFormElem = document.getElementById("create-org-form");
          if (createOrgFormElem) {
            createOrgFormElem.style.display = "none";
          }
          const setupSelectionElem = document.getElementById("setup-selection");
          if (setupSelectionElem) {
            setupSelectionElem.style.display = "none";
          }

          const originalOrgId = config.userOrgId;
          pollOrgUpdate(originalOrgId, T.notify(orgName, contactEmail));
          // Display results screen
          // showResult(T.notify(orgName, contactEmail));
          orgCreateForm.reset();
        })
        .catch((err) => {
          console.error("Submit error:", err);

          // Create a more visible and informative error message
          const errorTitle =
            currentLang === "vi"
              ? "[LỖI: TẠO TỔ CHỨC] Không thể tạo tổ chức"
              : "[ERROR: CREATE ORGANIZATION] Unable to create organization";

          const errorDesc =
            currentLang === "vi"
              ? "Đã xảy ra lỗi khi tạo tổ chức. Vui lòng kiểm tra kết nối mạng và thử lại."
              : "An error occurred while creating your organization. Please check your network connection and try again.";

          const networkStatus = navigator.onLine
            ? currentLang === "vi"
              ? "Đã kết nối"
              : "Connected"
            : currentLang === "vi"
            ? "Mất kết nối"
            : "Disconnected";

          const errorDetails = `
            <div class="error-container p-4 border border-red-200 rounded-lg bg-red-50">
              <div class="flex items-center mb-3">
                <svg class="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="text-red-700 font-medium text-lg">${errorTitle}</div>
              </div>
              
              <div class="text-gray-700 mb-4">${errorDesc}</div>
              
              <div class="bg-white p-3 rounded border border-gray-200 mb-3">
                <div class="font-medium mb-1">${
                  currentLang === "vi" ? "Thông tin lỗi:" : "Error information:"
                }</div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div class="text-gray-600">${
                    currentLang === "vi" ? "Thời gian:" : "Time:"
                  }</div>
                  <div>${new Date().toLocaleTimeString()}</div>
                  
                  <div class="text-gray-600">${
                    currentLang === "vi"
                      ? "Trạng thái mạng:"
                      : "Network status:"
                  }</div>
                  <div>${networkStatus}</div>
                  
                  <div class="text-gray-600">${
                    currentLang === "vi" ? "Mã lỗi:" : "Error code:"
                  }</div>
                  <div>${err.status || "N/A"}</div>
                  
                  <div class="text-gray-600">${
                    currentLang === "vi" ? "Thông báo lỗi:" : "Error message:"
                  }</div>
                  <div class="text-red-600">${
                    err.message ||
                    (currentLang === "vi" ? "Không xác định" : "Unknown")
                  }</div>
                </div>
              </div>
              
              <div class="text-sm text-gray-600">
                ${
                  currentLang === "vi"
                    ? "Vui lòng chụp màn hình lỗi này và gửi cho bộ phận hỗ trợ nếu vấn đề vẫn tiếp diễn."
                    : "Please take a screenshot of this error and send it to support if the problem persists."
                }
              </div>
            </div>
          `;

          showResult(errorDetails, "#333");
        });
    });
  }

  // Join org confirm button
  var btnConfirmJoin = document.getElementById("btn-confirm-join");
  if (btnConfirmJoin) {
    btnConfirmJoin.addEventListener("click", async function () {
      var orgCodeInput = document.getElementById("org-code-input");
      const code = orgCodeInput ? orgCodeInput.value.trim() : "";
      const errorElem = document.getElementById("org-error");
      if (errorElem) errorElem.style.display = "none";

      if (!foundOrg) {
        if (!code) {
          if (errorElem) {
            errorElem.textContent = T.error_empty;
            errorElem.style.display = "block";
          }
          return;
        }
        this.disabled = true;
        this.textContent = T.confirm_btn + "...";
        try {
          const response = await fetch(config.apiEndpoints.orgSearch, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              size: 1,
              query: {
                bool: { must: [{ term: { "org_id.raw": { value: code } } }] },
              },
            }),
          });
          const data = await response.json();
          this.disabled = false;
          this.textContent = T.confirm_btn;
          if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
            foundOrg = data.hits.hits[0]._source;
            if (errorElem) {
              errorElem.innerHTML = `<b class="org-name-found">${
                foundOrg.org_lb || foundOrg.org_name || code
              }</b>`;
              errorElem.style.display = "block";
              errorElem.style.color = "#16a75c";
            }
            this.textContent = T.request_join;
          } else {
            if (errorElem) {
              errorElem.textContent = T.error_notfound;
              errorElem.style.display = "block";
            }
          }
        } catch (err) {
          console.error("Join organization search error:", err);
          this.disabled = false;
          this.textContent = T.confirm_btn;
          if (errorElem) {
            // Create a more informative error message with source identification
            const errorMsg = `
              <div class="bg-red-50 p-2 rounded">
                <div class="font-medium text-red-700">[ERROR: JOIN ORG - SEARCH]</div>
                <div>${T.error}</div>
                <div class="text-xs text-gray-600 mt-1">
                  ${
                    err.message || "Unknown error"
                  } (${new Date().toLocaleTimeString()})
                </div>
              </div>
            `;
            errorElem.innerHTML = errorMsg;
            errorElem.style.display = "block";
          }
        }
      } else {
        // Hide the input interface of join-org-form
        var joinOrgFormElem = document.getElementById("join-org-form");
        if (joinOrgFormElem) {
          joinOrgFormElem.style.display = "none";
        }
        // Disable the send button and update label
        this.disabled = true;
        this.textContent = T.sending;
        try {
          await fetch(config.apiEndpoints.webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event_id: `rt${config.appShortName.toLowerCase()}.user`,
              user_trial: "0",
              project_code: config.projectCode,
              data: [
                {
                  username: config.username,
                  fullname: config.userFullName,
                  user_role: config.userRoledefault,
                  cellphone:
                    config.userPhone &&
                    config.userPhone.trim() &&
                    !/^n\/?a$/i.test(config.userPhone.trim())
                      ? config.userPhone
                      : "0",
                  user_status: "1",
                  email: config.userEmail,
                  org_id: foundOrg.org_id,
                  org_name: foundOrg.org_lb,
                },
              ],
            }),
          });
          const originalOrgId = config.userOrgId;
          pollOrgUpdate(
            originalOrgId,
            T.join_success.replace(
              "{org}",
              foundOrg.org_lb || foundOrg.org_name || code
            )
          );
          // showResult(T.join_success.replace('{org}', foundOrg.org_lb || foundOrg.org_name || code));
        } catch (err) {
          console.error("Join organization error:", err);

          if (errorElem) {
            // Create a more informative error message with source identification
            const errorMsg = `
              <div class="bg-red-50 p-2 rounded">
                <div class="font-medium text-red-700">[ERROR: JOIN ORG - SUBMIT]</div>
                <div>${T.error}</div>
                <div class="text-xs text-gray-600 mt-1">
                  Error joining organization. Details: ${
                    err.message || "Unknown error"
                  } (${new Date().toLocaleTimeString()})
                </div>
              </div>
            `;
            errorElem.innerHTML = errorMsg;
            errorElem.style.display = "block";
          }
        }
        this.disabled = false;
        this.textContent = T.request_join;
      }
    });
  }

  // Close result button
  var btnCloseResult = document.getElementById("btn-close-result");
  if (btnCloseResult) {
    btnCloseResult.addEventListener("click", function () {
      const actionData = {
        actionID: 99,
        orderNumber: 1,
        type: "act_exit",
        label: "no label",
      };
      App.callActionButton(JSON.stringify(actionData));

      // var resultScreen = document.getElementById('result-screen');
      // if (resultScreen) resultScreen.classList.add('hidden');
    });
  }

  // Setup org info button (from official banner)
  const orgInfoButton = document.getElementById("org-info-button");
  if (orgInfoButton) {
    orgInfoButton.addEventListener("click", function () {
      const actionData = {
        actionID: 99,
        orderNumber: 1,
        type: "act_dm_view",
        label: "no label",
        screen: "fusesellaisub-fusesellai01-fusesellai01obj1000-screen1002",
        alias: "fusesellai_fusesellai01obj1000",
      };
      App.callActionButton(JSON.stringify(actionData));
    });
  }
}

// Initialize the application
function initFuseSellAI(configObj) {
  config = configObj;
  currentLang = config.appLanguage || "en";
  T = LANG[currentLang] || LANG.en;

  // Apply language first
  applyLanguage();

  setupEventHandlers();
  checkUserType().then(() => {
    showBanner();
    // Re-initialize Lucide icons after DOM changes
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  });
}

// Export for global access
window.initFuseSellAI = initFuseSellAI;
