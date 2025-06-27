const translations = {
    en: {
        // Page content
        pageTitle: 'Changelog',
        pageSubtitle: 'Stay up to date with the latest app updates and improvements',
        
        // Empty state
        emptyTitle: 'No Changelog Available',
        emptyDescription: 'Log does not exist. There are currently no updates to display.',
        
        // Footer
        footerText: 'Want to suggest a feature or report a bug?',
        contactLink: 'Contact our support team',
        
        // Modal
        modalTitle: 'Send Feedback',
        feedbackTypeLabel: 'Feedback Type',
        nameLabel: 'Name',
        phoneLabel: 'Phone',
        emailLabel: 'Email',
        messageLabel: 'Message *',
        messagePlaceholder: 'Please describe your suggestion or report the bug you encountered...',
        cancelBtn: 'Cancel',
        submitBtn: 'Submit Feedback',
        submittingBtn: 'Submitting...',
        
        // Feedback options
        optionSuggestion: 'Feature Suggestion',
        optionBug: 'Bug Report',
        optionGeneral: 'General Feedback',
        
        // Change types
        newFeatures: 'New Features',
        improvements: 'Improvements',
        bugFixes: 'Bug Fixes',
        
        // Toast messages
        successMessage: 'Feedback submitted successfully!',
        errorMessage: 'Failed to submit feedback. Please try again.',
        validationError: 'Please enter a message before submitting.',
        
        // Date format
        dateLocale: 'en-GB'
    },
    vi: {
        // Page content
        pageTitle: 'Nhật ký thay đổi',
        pageSubtitle: 'Cập nhật những thay đổi và cải tiến mới nhất của ứng dụng',
        
        // Empty state
        emptyTitle: 'Không có nhật ký thay đổi',
        emptyDescription: 'Nhật ký không tồn tại. Hiện tại không có cập nhật nào để hiển thị.',
        
        // Footer
        footerText: 'Muốn đề xuất tính năng hoặc báo lỗi?',
        contactLink: 'Liên hệ đội hỗ trợ của chúng tôi',
        
        // Modal
        modalTitle: 'Gửi phản hồi',
        feedbackTypeLabel: 'Loại phản hồi',
        nameLabel: 'Tên',
        phoneLabel: 'Số điện thoại',
        emailLabel: 'Email',
        messageLabel: 'Tin nhắn *',
        messagePlaceholder: 'Vui lòng mô tả đề xuất của bạn hoặc báo cáo lỗi bạn gặp phải...',
        cancelBtn: 'Hủy',
        submitBtn: 'Gửi phản hồi',
        submittingBtn: 'Đang gửi...',
        
        // Feedback options
        optionSuggestion: 'Đề xuất tính năng',
        optionBug: 'Báo lỗi',
        optionGeneral: 'Phản hồi chung',
        
        // Change types
        newFeatures: 'Tính năng mới',
        improvements: 'Cải tiến',
        bugFixes: 'Sửa lỗi',
        
        // Toast messages
        successMessage: 'Phản hồi đã được gửi thành công!',
        errorMessage: 'Không thể gửi phản hồi. Vui lòng thử lại.',
        validationError: 'Vui lòng nhập tin nhắn trước khi gửi.',
        
        // Date format
        dateLocale: 'vi-VN'
    }
};

// Function to get platform-specific version
function getPlatformVersion(entry) {
    if (!entry.version) return 'N/A';
    
    // Handle both old format (string) and new format (object)
    if (typeof entry.version === 'string') {
        return entry.version;
    }
    
    if (typeof entry.version === 'object') {
        // Check platform and return appropriate version
        const platform = APP_PLATFORM.toLowerCase();
        
        if (platform.includes('ios') && entry.version.ios) {
            return entry.version.ios;
        } else if (platform.includes('android') && entry.version.android) {
            return entry.version.android;
        } else {
            // Fallback: return the first available version
            return entry.version.ios || entry.version.android || 'N/A';
        }
    }
    
    return 'N/A';
}

// Function to get platform-specific content for change lists
function getPlatformSpecificContent(entry, fieldName) {
    const localizedField = currentLanguage === 'vi' ? `${fieldName}_vi` : fieldName;
    const field = entry[localizedField];
    
    if (!field) {
        // Fallback to non-localized field if localized doesn't exist
        const fallbackField = entry[fieldName];
        if (!fallbackField) return [];
        
        // Handle both old array format and new object format
        if (Array.isArray(fallbackField)) {
            return fallbackField;
        }
        
        if (typeof fallbackField === 'object') {
            const platform = APP_PLATFORM.toLowerCase();
            if (platform.includes('ios') && fallbackField.ios) {
                return fallbackField.ios;
            } else if (platform.includes('android') && fallbackField.android) {
                return fallbackField.android;
            }
            // Fallback to first available platform
            return fallbackField.ios || fallbackField.android || [];
        }
        
        return [];
    }
    
    // Handle both old array format and new object format
    if (Array.isArray(field)) {
        return field;
    }
    
    if (typeof field === 'object') {
        const platform = APP_PLATFORM.toLowerCase();
        if (platform.includes('ios') && field.ios) {
            return field.ios;
        } else if (platform.includes('android') && field.android) {
            return field.android;
        } else {
            // Fallback to first available platform
            return field.ios || field.android || [];
        }
    }
    
    return [];
}

// Function to initialize translations
function initializeTranslations() {
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
    
    // Update page content
    // document.getElementById('page-title').textContent = t.pageTitle;
    document.getElementById('page-subtitle').textContent = t.pageSubtitle;
    
    // Update empty state
    document.getElementById('empty-title').textContent = t.emptyTitle;
    document.getElementById('empty-description').textContent = t.emptyDescription;
    
    // Update footer
    document.getElementById('footer-text').textContent = t.footerText;
    document.getElementById('contact-link').textContent = t.contactLink;
    
    // Update modal
    document.getElementById('modal-title').textContent = t.modalTitle;
    document.getElementById('feedback-type-label').textContent = t.feedbackTypeLabel;
    document.getElementById('name-label').textContent = t.nameLabel;
    document.getElementById('phone-label').textContent = t.phoneLabel;
    document.getElementById('email-label').textContent = t.emailLabel;
    document.getElementById('message-label').textContent = t.messageLabel;
    document.getElementById('feedback-message').placeholder = t.messagePlaceholder;
    document.getElementById('cancel-btn').textContent = t.cancelBtn;
    document.getElementById('submit-text').textContent = t.submitBtn;
    
    // Update feedback options
    document.getElementById('option-suggestion').textContent = t.optionSuggestion;
    document.getElementById('option-bug').textContent = t.optionBug;
    document.getElementById('option-general').textContent = t.optionGeneral;
    
    // Update toast messages
    document.getElementById('success-message').textContent = t.successMessage;
    document.getElementById('error-message').textContent = t.errorMessage;
}

// Function to format date based on current language
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(t.dateLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

// Function to create SVG icons
function createIcon(type) {
    const icons = {
        calendar: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>`,
        plus: `<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>`,
        wrench: `<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>`,
        bug: `<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>`,
        chevron: `<svg class="w-5 h-5 text-gray-400 chevron transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>`
    };
    return icons[type] || '';
}

// Function to create a list of changes
function createChangesList(changes, type) {
    if (!changes || changes.length === 0) return '';

    const typeConfig = {
        new_features: {
            label: t.newFeatures,
            icon: 'plus',
            badgeClass: 'bg-green-100 text-green-800 border-green-200'
        },
        improvements: {
            label: t.improvements,
            icon: 'wrench',
            badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
        },
        bug_fixes: {
            label: t.bugFixes,
            icon: 'bug',
            badgeClass: 'bg-red-100 text-red-800 border-red-200'
        }
    };

    const config = typeConfig[type];
    if (!config) return '';

    const listItems = changes.map(change => `
        <li class="flex items-start gap-2 text-gray-700">
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
            <span class="leading-relaxed">${change}</span>
        </li>
    `).join('');

    return `
        <div class="space-y-3">
            <div class="flex items-center gap-2">
                ${createIcon(config.icon)}
                <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${config.badgeClass}">
                    ${config.label}
                </span>
            </div>
            <ul class="space-y-2 ml-6">
                ${listItems}
            </ul>
        </div>
    `;
}

// Function to create a changelog entry
function createChangelogEntry(entry, isLatest = false) {
    const formattedDate = formatDate(entry.release_date);
    const platformVersion = getPlatformVersion(entry);
    
    // Get platform-specific content based on current platform
    const newFeatures = getPlatformSpecificContent(entry, 'new_features');
    const improvements = getPlatformSpecificContent(entry, 'improvements');
    const bugFixes = getPlatformSpecificContent(entry, 'bug_fixes');
    
    // Create sections for each change type
    const sections = [
        createChangesList(newFeatures, 'new_features'),
        createChangesList(improvements, 'improvements'),
        createChangesList(bugFixes, 'bug_fixes')
    ].filter(section => section !== '').join('');

    if (isLatest) {
        // Latest version - always expanded
        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 font-mono">
                            ${platformVersion}
                        </span>
                        <div class="flex items-center gap-2 text-sm text-gray-600">
                            ${createIcon('calendar')}
                            ${formattedDate}
                        </div>
                    </div>
                    <div class="space-y-6">
                        ${sections}
                    </div>
                </div>
            </div>
        `;
    } else {
        // Older versions - collapsible
        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="p-6 cursor-pointer hover:bg-gray-50 transition-colors" onclick="toggleCollapse(this)">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 font-mono">
                                ${platformVersion}
                            </span>
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                                ${createIcon('calendar')}
                                ${formattedDate}
                            </div>
                        </div>
                        ${createIcon('chevron')}
                    </div>
                </div>
                <div class="px-6 pb-6" style="display: none;">
                    <div class="space-y-6">
                        ${sections}
                    </div>
                </div>
            </div>
        `;
    }
}

// Function to show empty state
function showEmptyState() {
    const container = document.getElementById('changelog-container');
    const emptyState = document.getElementById('empty-state');
    
    if (container) container.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
}

// Function to hide empty state
function hideEmptyState() {
    const container = document.getElementById('changelog-container');
    const emptyState = document.getElementById('empty-state');
    
    if (container) container.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
}

// Function to toggle collapse state
function toggleCollapse(element) {
    const content = element.nextElementSibling;
    const chevron = element.querySelector('.chevron');
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        chevron.classList.add('rotated');
    } else {
        content.style.display = 'none';
        chevron.classList.remove('rotated');
    }
}

// Modal Functions
function openFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Use values from the config object
    document.getElementById('feedback-name').value = configUser.userFullName || '';
    document.getElementById('feedback-phone').value = configUser.userPhone || '';
    document.getElementById('feedback-email').value = configUser.userEmail || '';

    // Focus on the message textarea
    setTimeout(() => {
        document.getElementById('feedback-message').focus();
    }, 100);
}

function closeFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    const modalContent = modal.querySelector('.bg-white');
    
    // Add exit animation
    modalContent.classList.remove('modal-enter');
    modalContent.classList.add('modal-exit');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Reset form and animations
        document.getElementById('feedback-form').reset();
        
        // Reset default values
        document.getElementById('feedback-name').value = configUser.userFullName || '';
        document.getElementById('feedback-phone').value = configUser.userPhone || '';
        document.getElementById('feedback-email').value = configUser.userEmail || '';
        
        modalContent.classList.remove('modal-exit');
        modalContent.classList.add('modal-enter');
        
        // Reset submit button state
        resetSubmitButton();
    }, 300);
}

// Toast Functions
function showToast(type, message = '') {
    const toastId = type === 'success' ? 'success-toast' : 'error-toast';
    const toast = document.getElementById(toastId);
    
    if (type === 'error' && message) {
        document.getElementById('error-message').textContent = message;
    }
    
    toast.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 5000);
}

// Submit button state management
function setSubmitLoading(loading) {
    const submitBtn = document.getElementById('submit-feedback');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');
    
    if (loading) {
        submitBtn.disabled = true;
        submitText.textContent = t.submittingBtn;
        submitSpinner.classList.remove('hidden');
        submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
        submitBtn.disabled = false;
        submitText.textContent = t.submitBtn;
        submitSpinner.classList.add('hidden');
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

function resetSubmitButton() {
    setSubmitLoading(false);
}

// Form submission handler
async function submitFeedback(formData) {
    const apiUrl = 'https://workflow.realtimex.co/api/v1/executions/webhook/flowai/feedback_app/input';
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: formData.get('type'),
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                message: formData.get('message'),
                timestamp: new Date().toISOString(),
                source: 'changelog_feedback',
                language: currentLanguage,
                platform: APP_PLATFORM,
                project_code: currentProject
            })
        });

        if (response.ok) {
            showToast('success');
            closeFeedbackModal();
        } else {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showToast('error', `${t.errorMessage}: ${error.message}`);
    }
}