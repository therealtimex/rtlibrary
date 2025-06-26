// Language translations
const translations = {
    en: {
        loading: "Loading repair status...",
        lastUpdated: "Last updated:",
        ticketInfo: "Ticket Status",
        ticketIssue: "Ticket Issue",
        customerInfo: "Customer Information",
        deviceInfo: "Device Information",
        name: "Name:",
        phone: "Phone:",
        email: "Email:",
        brand: "Brand:",
        model: "Model:",
        type: "Type:",
        ticketProgress: "Ticket Progress",
        overallProgress: "Overall Progress",
        assignedTechnician: "Assigned Technician",
        ticketDocumentation: "Ticket Documentation",
        latestUpdate: "Latest Update",
        messageLabel: "❓Have a question or need to provide additional information?",
        messagePlaceholder: "Ask a question or provide additional information about your device...",
        sendMessage: "Send Message",
        sending: "Sending...",
        errorTitle: "Unable to Load Repair Status",
        errorMessage: "We're having trouble loading your repair information. Please try again or contact support.",
        tryAgain: "Try Again",
        // Status translations
        statusReceived: "Device Received",
        statusDiagnosisParts: "Diagnosis & Parts",
        statusRepairProgress: "Repair in Progress",
        statusCompleted: "Completed",
        statusReadyPickup: "Ready for Pickup",
        statusDescReceived: "Device received and initial processing",
        statusDescDiagnosisParts: "Assessment and parts procurement",
        statusDescRepairProgress: "Active repair and testing",
        statusDescCompleted: "Repair completed successfully",
        statusDescReadyPickup: "Device ready for collection",
        // Individual status translations
        "Received": "Received",
        "Quote Pending": "Quote Pending",
        "Quote Approved": "Quote Approved",
        "Diagnosed": "Diagnosed",
        "Waiting for Parts": "Waiting for Parts",
        "Parts Ordered": "Parts Ordered",
        "Parts Received": "Parts Received",
        "In Progress": "In Progress",
        "Testing": "Testing",
        "Quality Check": "Quality Check",
        "Completed": "Completed",
        "Ready for Pickup": "Ready for Pickup",
        "Delivered": "Delivered",
        // Progress text
        complete: "Complete",
        pending: "Pending",
        inProgress: "In Progress",
        // Messages
        messageSentSuccess: "Message sent successfully! Your technician will receive your message shortly.",
        messageSentError: "Failed to send message. Please try again or contact support.",
        messageRequired: "Please enter a message before sending.",
        noImagesAvailable: "No repair documentation images available yet.",
        updated: "Updated"
    },
    vi: {
        loading: "Đang tải trạng thái sửa chữa...",
        lastUpdated: "Cập nhật lần cuối:",
        ticketInfo: "Thông Tin Phiếu",
        ticketIssue: "Vấn Đề Thiết Bị",
        customerInfo: "Thông Tin Khách Hàng",
        deviceInfo: "Thông Tin Thiết Bị",
        name: "Tên:",
        phone: "Điện thoại:",
        email: "Email:",
        brand: "Thương hiệu:",
        model: "Mẫu:",
        type: "Loại:",
        ticketProgress: "Tiến Độ Sửa Chữa",
        overallProgress: "Tiến Độ Tổng Thể",
        assignedTechnician: "Kỹ Thuật Viên Phụ Trách",
        ticketDocumentation: "Tài Liệu Phiếu Sửa Chữa",
        latestUpdate: "Cập Nhật Mới Nhất",
        messageLabel: "❓Bạn có câu hỏi hoặc cần cung cấp thêm thông tin?",
        messagePlaceholder: "Đặt câu hỏi hoặc cung cấp thêm thông tin về thiết bị của bạn...",
        sendMessage: "Gửi Tin Nhắn",
        sending: "Đang gửi...",
        errorTitle: "Không Thể Tải Trạng Thái Sửa Chữa",
        errorMessage: "Chúng tôi gặp sự cố khi tải thông tin sửa chữa của bạn. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
        tryAgain: "Thử Lại",
        // Status translations
        statusReceived: "Đã Nhận Thiết Bị",
        statusDiagnosisParts: "Chẩn Đoán & Linh Kiện",
        statusRepairProgress: "Đang Sửa Chữa",
        statusCompleted: "Hoàn Thành",
        statusReadyPickup: "Sẵn Sàng Lấy Hàng",
        statusDescReceived: "Đã nhận thiết bị và xử lý ban đầu",
        statusDescDiagnosisParts: "Đánh giá và mua sắm linh kiện",
        statusDescRepairProgress: "Sửa chữa và kiểm tra tích cực",
        statusDescCompleted: "Sửa chữa hoàn thành thành công",
        statusDescReadyPickup: "Thiết bị sẵn sàng để lấy",
        // Individual status translations
        "Received": "Đã Nhận",
        "Quote Pending": "Chờ Báo Giá",
        "Quote Approved": "Đã Duyệt Báo Giá",
        "Diagnosed": "Đã Chẩn Đoán",
        "Waiting for Parts": "Chờ Linh Kiện",
        "Parts Ordered": "Đã Đặt Linh Kiện",
        "Parts Received": "Đã Nhận Linh Kiện",
        "In Progress": "Đang Thực Hiện",
        "Testing": "Đang Kiểm Tra",
        "Quality Check": "Kiểm Tra Chất Lượng",
        "Completed": "Hoàn Thành",
        "Ready for Pickup": "Sẵn Sàng Lấy Hàng",
        "Delivered": "Đã Giao Hàng",
        // Progress text
        complete: "Hoàn Thành",
        pending: "Chờ Xử Lý",
        inProgress: "Đang Thực Hiện",
        // Messages
        messageSentSuccess: "Tin nhắn đã được gửi thành công! Kỹ thuật viên sẽ nhận được tin nhắn của bạn sớm.",
        messageSentError: "Không thể gửi tin nhắn. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
        messageRequired: "Vui lòng nhập tin nhắn trước khi gửi.",
        noImagesAvailable: "Chưa có hình ảnh tài liệu sửa chữa nào.",
        updated: "Đã cập nhật"
    }
};

const API_URL = 'https://es.rta.vn/llm_all_log/_search';

// Language switching functionality
        function initializeLanguageSwitcher() {
            const languageToggle = document.getElementById('language-toggle');
            const languageDropdown = document.getElementById('language-dropdown');
            const languageOptions = document.querySelectorAll('.language-option');

            // Toggle dropdown
            languageToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                languageDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                languageDropdown.classList.remove('show');
            });

            // Handle language selection
            languageOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const selectedLang = option.dataset.lang;
                    switchLanguage(selectedLang);
                    languageDropdown.classList.remove('show');
                });
            });

            switchLanguage(currentLanguage);
        }

        function switchLanguage(lang) {
            currentLanguage = lang;
            localStorage.setItem('preferredLanguage', lang);

            // Update language toggle display
            const currentFlag = document.getElementById('current-flag');
            const currentLang = document.getElementById('current-lang');

            if (lang === 'vi') {
                currentFlag.textContent = '🇻🇳';
                currentLang.textContent = 'VI';
            } else {
                currentFlag.textContent = '🇺🇸';
                currentLang.textContent = 'EN';
            }

            // Update active language option
            document.querySelectorAll('.language-option').forEach(option => {
                option.classList.toggle('active', option.dataset.lang === lang);
            });

            // Update HTML lang attribute
            document.documentElement.lang = lang;

            // Translate all elements
            translatePage();
        }

        function translatePage() {
            const elements = document.querySelectorAll('[data-translate]');
            elements.forEach(element => {
                const key = element.dataset.translate;
                if (translations[currentLanguage] && translations[currentLanguage][key]) {
                    element.textContent = translations[currentLanguage][key];
                }
            });

            // Handle placeholder translations
            const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
            placeholderElements.forEach(element => {
                const key = element.dataset.translatePlaceholder;
                if (translations[currentLanguage] && translations[currentLanguage][key]) {
                    element.placeholder = translations[currentLanguage][key];
                }
            });

            // Update progress percentage text if it exists
            const progressElement = document.getElementById('progress-percentage');
            if (progressElement && progressElement.textContent.includes('%')) {
                const percentage = progressElement.textContent.match(/\d+/)[0];
                progressElement.textContent = `${percentage}% ${translations[currentLanguage].complete}`;
            }

            // Call loadRepairData to refresh content after language switch
            loadRepairData();
        }

        function translateStatus(status) {
            if (translations[currentLanguage] && translations[currentLanguage][status]) {
                return translations[currentLanguage][status];
            }
            return status; // Return original if no translation found
        }



        // Simplified 5-stage status mapping with multilingual support
        const STATUS_GROUPS = [{
                name: 'Device Received',
                nameKey: 'statusReceived',
                description: 'Device received and initial processing',
                descKey: 'statusDescReceived',
                statuses: ['Received', 'Quote Pending', 'Quote Approved']
            },
            {
                name: 'Diagnosis & Parts',
                nameKey: 'statusDiagnosisParts',
                description: 'Assessment and parts procurement',
                descKey: 'statusDescDiagnosisParts',
                statuses: ['Diagnosed', 'Waiting for Parts', 'Parts Ordered', 'Parts Received']
            },
            {
                name: 'Repair in Progress',
                nameKey: 'statusRepairProgress',
                description: 'Active repair and testing',
                descKey: 'statusDescRepairProgress',
                statuses: ['In Progress', 'Testing', 'Quality Check']
            },
            {
                name: 'Completed',
                nameKey: 'statusCompleted',
                description: 'Repair completed successfully',
                descKey: 'statusDescCompleted',
                statuses: ['Completed']
            },
            {
                name: 'Ready for Pickup',
                nameKey: 'statusReadyPickup',
                description: 'Device ready for collection',
                descKey: 'statusDescReadyPickup',
                statuses: ['Ready for Pickup', 'Delivered']
            }
        ];

        function getStatusGroup(currentStatus) {
            for (let i = 0; i < STATUS_GROUPS.length; i++) {
                if (STATUS_GROUPS[i].statuses.includes(currentStatus)) {
                    return {
                        group: STATUS_GROUPS[i],
                        index: i
                    };
                }
            }
            // Default to first group if status not found
            return {
                group: STATUS_GROUPS[0],
                index: 0
            };
        }

        // Status color mapping for groups
        const STATUS_COLORS = {
            'Device Received': {
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-800',
                badge: 'bg-green-100 text-green-800'
            },
            'Diagnosis & Parts': {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-800',
                badge: 'bg-blue-100 text-blue-800'
            },
            'Repair in Progress': {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-800',
                badge: 'bg-blue-100 text-blue-800'
            },
            'Completed': {
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-800',
                badge: 'bg-green-100 text-green-800'
            },
            'Ready for Pickup': {
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                text: 'text-emerald-800',
                badge: 'bg-emerald-100 text-emerald-800'
            },
            // Keep individual status colors for badge display
            'Received': {
                badge: 'bg-green-100 text-green-800'
            },
            'Quote Pending': {
                badge: 'bg-yellow-100 text-yellow-800'
            },
            'Quote Approved': {
                badge: 'bg-green-100 text-green-800'
            },
            'Diagnosed': {
                badge: 'bg-blue-100 text-blue-800'
            },
            'Waiting for Parts': {
                badge: 'bg-yellow-100 text-yellow-800'
            },
            'Parts Ordered': {
                badge: 'bg-blue-100 text-blue-800'
            },
            'Parts Received': {
                badge: 'bg-green-100 text-green-800'
            },
            'In Progress': {
                badge: 'bg-blue-100 text-blue-800'
            },
            'Testing': {
                badge: 'bg-purple-100 text-purple-800'
            },
            'Quality Check': {
                badge: 'bg-indigo-100 text-indigo-800'
            },
            'Completed': {
                badge: 'bg-green-100 text-green-800'
            },
            'Ready for Pickup': {
                badge: 'bg-emerald-100 text-emerald-800'
            },
            'Delivered': {
                badge: 'bg-green-100 text-green-800'
            }
        };

        // Load repair data on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize language switcher
            initializeLanguageSwitcher();

            // Get order ID from URL parameter FIRST
            const urlParams = new URLSearchParams(window.location.search);
            const orderIdFromUrl = urlParams.get('ticket_id');
            
            if (orderIdFromUrl) {
                ORDER_ID = orderIdFromUrl;
                console.log("=== ORDER_ID set from URL ===", ORDER_ID);
                loadRepairData(); // Chỉ load khi có ORDER_ID
            } else {
                console.log("=== No ticket_id in URL ===");
                showError(); // Hiển thị lỗi nếu không có ticket_id
            }
        });

        async function loadRepairData() {
            console.log("=== order id ===",ORDER_ID)
            try {
                const queryBody = {
                    "size": 1000,
                    "collapse": {
                        "field": "session_id.keyword"
                    },
                    "sort": [{
                        "timestamp.keyword": "desc"
                    }],
                    "_source": {
                        "excludes": ["__system_update_timestamp__"]
                    },
                    "query": {
                        "bool": {
                            "must": [{
                                    "term": {
                                        "event_type.keyword": {
                                            "value": "CS-UPDATE"
                                        }
                                    }
                                },
                                {
                                    "term": {
                                        "output.data_formatted.order_id.keyword": {
                                            "value": ORDER_ID
                                        }
                                    }
                                }
                            ],
                            "must_not": [{
                                    "terms": {
                                        "output.data_formatted.current_status.keyword": ["Closed", "Close", "close", "closed", "Đóng", "đóng", "Customer Replied"]
                                    }
                                },
                                {
                                    "terms": {
                                        "session_name.keyword": ["Processing-Done"]
                                    }
                                }
                            ]
                        }
                    }
                };

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(queryBody)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("=== data ===", data);

                if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
                    console.log("=== data orig ===", data.hits.hits);
                    populateRepairData(data.hits.hits);
                    hideLoading();
                } else {
                    throw new Error('No repair data found');
                }

            } catch (error) {
                console.error('Error loading repair data:', error);
                showError();
            }
        }

        function populateRepairData(hits) {
            console.log("=== hits===", hits);
            // Sort ASC: oldest → newest
            const sortedByAsc = [...hits].sort((a, b) =>
                new Date(a._source.timestamp.replace(" ", "T")) - new Date(b._source.timestamp.replace(" ", "T"))
            );

            // Sort DESC: newest → oldest
            const sortedByDesc = [...hits].sort((a, b) =>
                new Date(b._source.timestamp.replace(" ", "T")) - new Date(a._source.timestamp.replace(" ", "T"))
            );

            const initialData = sortedByAsc[0]._source;
            const latestUpdate = sortedByDesc[0]._source;

            console.log("=== Initial Data (First Record) ===", initialData);
            console.log("=== Latest Update (Most Recent) ===", latestUpdate);

            // Populate basic information
            const orderData = latestUpdate.output.data_formatted;
            const initialOrderData = initialData.output.data_formatted;

            // Update header information
            document.getElementById('ticket-id-top').textContent = '#' + (orderData.order_id || ORDER_ID);
            document.getElementById('ticket-id').textContent = orderData.order_id || ORDER_ID;
            document.getElementById('last-updated').textContent = formatDateTime(latestUpdate.timestamp);
            document.getElementById('created-date').textContent = `${formatDate(initialData.timestamp)}`;

            // Update status badge
            updateStatusBadge(orderData.current_status);

            // Update issue information
            document.getElementById('repair-issue').textContent = initialOrderData.customer_reported_issue || 'Repair needed';
            document.getElementById('device-info').textContent = `${initialOrderData.device_brand || ''} ${initialOrderData.device_model || ''}`.trim();

            // Update customer information
            document.getElementById('customer-name').textContent = initialOrderData.customer_name || 'N/A';
            document.getElementById('customer-phone').textContent = initialOrderData.customer_phone || 'N/A';
            document.getElementById('customer-email').textContent = initialOrderData.customer_email || 'N/A';

            // Update device information
            document.getElementById('device-brand').textContent = initialOrderData.device_brand || 'N/A';
            document.getElementById('device-model').textContent = initialOrderData.device_model || 'N/A';
            document.getElementById('device-type').textContent = capitalizeFirst(initialOrderData.device_type) || 'N/A';

            // Update technician information
            updateTechnicianInfo(initialOrderData);

            // Update latest update section
            document.getElementById('latest-update-time').textContent = `${translations[currentLanguage].updated} ${formatDateTime(latestUpdate.timestamp)}`;
            document.getElementById('latest-update-notes').textContent = orderData.notes || orderData.content_update || 'No additional notes';

            // Generate timeline
            generateTimeline(sortedByAsc, orderData.current_status);

            // Handle images
            handleRepairImages(hits);
        }

        function updateStatusBadge(currentStatus) {
            const statusBadge = document.getElementById('status-badge');
            const statusIndicator = document.getElementById('status-indicator');
            const statusText = document.getElementById('current-status');

            const colors = STATUS_COLORS[currentStatus] || STATUS_COLORS['In Progress'];

            statusBadge.className = `flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${colors.badge}`;
            statusIndicator.className = `w-2 h-2 rounded-full animate-pulse ${currentStatus === 'In Progress' ? 'bg-blue-500' : 'bg-green-500'}`;
            statusText.textContent = translateStatus(currentStatus);
        }

        function updateTechnicianInfo(orderData) {
            const technicianName = orderData.technician_name || 'Unassigned';
            const technicianId = orderData.technician_id || 'N/A';

            document.getElementById('technician-name').textContent = technicianName;
            document.getElementById('technician-id').textContent = `ID: ${technicianId}`;
        }

        function generateTimeline(hits, currentStatus) {
            const timeline = document.getElementById('status-timeline');
            const {
                group: currentGroup,
                index: currentGroupIndex
            } = getStatusGroup(currentStatus);
            const progress = Math.round(((currentGroupIndex + 1) / STATUS_GROUPS.length) * 100);

            // Update progress bar
            document.getElementById('progress-percentage').textContent = `${progress}% ${translations[currentLanguage].complete}`;
            document.getElementById('progress-bar').style.width = `${progress}%`;

            // Create status map from hits
            const statusMap = {};
            const groupStatusMap = {};

            hits.forEach(hit => {
                const status = hit._source.output.data_formatted.current_status;
                const timestamp = hit._source.timestamp;
                const notes = hit._source.output.data_formatted.content_update || '';

                statusMap[status] = {
                    timestamp,
                    notes
                };

                // Map to groups
                const {
                    group,
                    index
                } = getStatusGroup(status);
                if (!groupStatusMap[group.name] || new Date(timestamp) > new Date(groupStatusMap[group.name].timestamp)) {
                    groupStatusMap[group.name] = {
                        timestamp,
                        notes,
                        actualStatus: status
                    };
                }
            });

            // Generate timeline HTML
            timeline.innerHTML = '';

            STATUS_GROUPS.forEach((statusGroup, index) => {
                const isCompleted = index < currentGroupIndex;
                const isCurrent = index === currentGroupIndex;
                const isPending = index > currentGroupIndex;

                let statusClass, iconContent, timeContent, detailsContent;

                if (isCompleted) {
                    statusClass = 'bg-green-50 border-green-200 shadow-sm';
                    iconContent = '<span class="text-white text-sm font-bold">✓</span>';
                    const groupData = groupStatusMap[statusGroup.name];
                    timeContent = groupData ? formatDateTime(groupData.timestamp) : translations[currentLanguage].complete;
                    detailsContent = groupData ? `${translateStatus(groupData.actualStatus)}: ${groupData.notes}` : translations[currentLanguage][statusGroup.descKey];
                } else if (isCurrent) {
                    statusClass = 'bg-blue-50 border-blue-200 shadow-sm ring-2 ring-blue-200';
                    iconContent = '<div class="w-4 h-4 bg-white rounded-full animate-pulse"></div>';
                    const groupData = groupStatusMap[statusGroup.name];
                    timeContent = groupData ? formatDateTime(groupData.timestamp) : translations[currentLanguage].inProgress;
                    detailsContent = groupData ? `${translateStatus(groupData.actualStatus)}: ${groupData.notes}` : `${translations[currentLanguage].inProgress}: ${translateStatus(currentStatus)}`;
                } else {
                    statusClass = 'bg-gray-50 border-gray-200 shadow-sm';
                    iconContent = `<span class="text-gray-500 text-sm font-semibold">${index + 1}</span>`;
                    timeContent = translations[currentLanguage].pending;
                    detailsContent = translations[currentLanguage][statusGroup.descKey];
                }

                const iconBgClass = isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300';
                const textColorClass = isCompleted ? 'text-green-800' : isCurrent ? 'text-blue-800' : 'text-gray-600';
                const noteColorClass = isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500';
                const timeColorClass = isCompleted ? 'text-green-500' : isCurrent ? 'text-blue-500' : 'text-gray-400';

                timeline.innerHTML += `
                    <div class="flex items-center space-x-4 p-3 ${statusClass} rounded-xl border">
                        <div class="w-10 h-10 ${iconBgClass} rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            ${iconContent}
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-semibold ${textColorClass} text-lg">${translations[currentLanguage][statusGroup.nameKey]}</p>
                                    <p class="text-sm ${noteColorClass} mt-1">${detailsContent}</p>
                                </div>
                                <span class="text-xs ${timeColorClass} font-semibold bg-white bg-opacity-50 px-2 py-1 rounded">${timeContent}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }


        
        function getDefaultStatusDescription(status) {
            const descriptions = {
                'Received': 'Device received and logged into our system',
                'Quote Pending': 'Preparing repair quote for customer approval',
                'Quote Approved': 'Repair quote approved by customer',
                'Diagnosed': 'Initial diagnosis and assessment completed',
                'Waiting for Parts': 'Waiting for replacement parts to arrive',
                'Parts Ordered': 'Replacement parts have been ordered',
                'Parts Received': 'Parts received and quality verified',
                'In Progress': 'Repair work is currently underway',
                'Testing': 'Device functionality testing in progress',
                'Quality Check': 'Final quality assurance and inspection',
                'Completed': 'Repair completed successfully',
                'Ready for Pickup': 'Device ready for customer collection',
                'Delivered': 'Device delivered to customer'
            };
            return descriptions[status] || 'Status update';
        }

        // Slider control functions
        function moveSlide(direction) {
            currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
            updateSlider();
        }

        function goToSlide(index) {
            currentSlide = index;
            updateSlider();
        }

        function updateSlider() {
            const container = document.getElementById('media-slider-container');
            if (container) {
                container.style.transform = `translateX(-${currentSlide * 100}%)`;

                // Update dots
                const dots = document.querySelectorAll('.media-slider-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentSlide);
                });

                // Update thumbnails
                const thumbnails = document.querySelectorAll('.media-thumbnail');
                thumbnails.forEach((thumb, index) => {
                    thumb.classList.toggle('active', index === currentSlide);
                });
            }
        }

        let currentSlide = 0;
        let totalSlides = 0;

        function handleRepairImages(hits) {
            const imagesContainer = document.getElementById('repair-images');
            const images = [];

            // Collect all image URLs from hits
            hits.forEach(hit => {
                if (hit._source.output.files) {
                    const files = hit._source.output.files.split(',').map(url => url.trim()).filter(url => url);
                    images.push(...files);
                }
                if (hit._source.input.attachments) {
                    const attachments = hit._source.input.attachments.split(',').map(url => url.trim()).filter(url => url);
                    images.push(...attachments);
                }
            });

            // Remove duplicates
            const uniqueImages = [...new Set(images)];

            // Global variable for slider
            totalSlides = uniqueImages.length;

            if (uniqueImages.length > 0) {
                const sliderContent = `
                    <div class="media-slider">
                        <div class="media-slider-container" id="media-slider-container">
                            ${uniqueImages.map((url, index) => `<div class="media-slide"><img src="${url}" alt="Device image ${index + 1}" onerror="this.onerror=null;this.src='https://via.placeholder.com/500x300?text=Image+Unavailable';" /></div>`).join("")}
                        </div>
                        ${uniqueImages.length > 1 ? `
                            <div class="media-slider-arrow prev" onclick="moveSlide(-1)">&#10094;</div>
                            <div class="media-slider-arrow next" onclick="moveSlide(1)">&#10095;</div>
                        ` : ''}
                    </div>
                    ${uniqueImages.length > 1 ? `
                        <div class="media-slider-nav" id="media-slider-nav">
                            ${uniqueImages.map((_, index) => `<div class="media-slider-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>`).join("")}
                        </div>
                        <div class="media-thumbnail-container" id="media-thumbnails">
                            ${uniqueImages.map((url, index) => `<img class="media-thumbnail ${index === 0 ? 'active' : ''}" src="${url}" onclick="goToSlide(${index})" alt="Thumbnail ${index + 1}">`).join("")}
                        </div>
                    ` : ''}
                `;

                imagesContainer.innerHTML = sliderContent;

                // Update slider initially
                updateSlider();
            } else {
                imagesContainer.innerHTML = `
                    <div class="col-span-full text-center py-8 text-gray-500">
                        <p>${translations[currentLanguage].noImagesAvailable}</p>
                    </div>
                `;
            }
        }

        function hideLoading() {
            document.getElementById('loading-overlay').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            document.getElementById('error-state').style.display = 'none';
        }

        function showError() {
            document.getElementById('loading-overlay').style.display = 'none';
            document.getElementById('error-state').style.display = 'block';
        }

        function formatDateTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleString(currentLanguage === 'vi' ? 'vi-VN' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function formatDate(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleDateString(currentLanguage === 'vi' ? 'vi-VN' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        function capitalizeFirst(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        // Message sending functionality
        async function sendMessage() {
            const messageTextarea = document.getElementById('message');
            const sendBtn = document.getElementById('send-message-btn');
            const btnText = document.getElementById('btn-text');
            const btnLoading = document.getElementById('btn-loading');
            const messageStatus = document.getElementById('message-status');
            const ticketId = document.getElementById('ticket-id').textContent;

            const message = messageTextarea.value.trim();

            if (!message) {
                showMessage(translations[currentLanguage].messageRequired, 'error');
                return;
            }

            sendBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            sendBtn.classList.add('opacity-75', 'cursor-not-allowed');

            try {
                const response = await fetch('https://workflow.realtimex.co/api/v1/executions/webhook/flowai/realtimecs_feedback/input', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        ticket_id: ticketId
                    })
                });

                if (response.ok) {
                    showMessage(translations[currentLanguage].messageSentSuccess, 'success');
                    messageTextarea.value = '';
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                showMessage(translations[currentLanguage].messageSentError, 'error');
            } finally {
                sendBtn.disabled = false;
                btnText.classList.remove('hidden');
                btnLoading.classList.add('hidden');
                sendBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        }

        function showMessage(text, type) {
            const messageStatus = document.getElementById('message-status');
            messageStatus.classList.remove('hidden');

            if (type === 'success') {
                messageStatus.className = 'mb-4 p-4 bg-green-50 border border-green-200 rounded-md';
                messageStatus.innerHTML = `
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium text-green-800">${text}</p>
                        </div>
                    </div>
                `;
            } else {
                messageStatus.className = 'mb-4 p-4 bg-red-50 border border-red-200 rounded-md';
                messageStatus.innerHTML = `
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium text-red-800">${text}</p>
                        </div>
                    </div>
                `;
            }

            if (type === 'success') {
                setTimeout(() => {
                    messageStatus.classList.add('hidden');
                }, 5000);
            }
        }

        // Keyboard shortcut for sending message
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('message').addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                }
            });
        });