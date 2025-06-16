const translations = {
            vi: {
                header_title: 'Dashboard - RealTime CS',
                time_filter_title: 'Lọc thời gian',
                total_tickets_title: 'Tổng phiếu',
                new_tickets_title: 'Phiếu mới',
                processing_tickets_title: 'Đang xử lý',
                completed_tickets_title: 'Hoàn thành',
                hold_tickets_title: 'Tạm dừng',
                cancelled_tickets_title: 'Đã hủy',
                warranty_tickets_title: 'Bảo hành',
                closed_tickets_title: 'Đóng',
                quick_actions_title: 'Thao tác nhanh',
                create_category_btn: 'Tạo danh mục',
                settings_btn: 'Cài đặt',
                status_overview_title: 'Tình trạng phiếu',
                priority_chart_title: 'Phân bố độ ưu tiên',
                recent_activity_title: 'Hoạt động gần đây',
                error_text: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
                no_recent_activity: 'Không có hoạt động gần đây',
                today: 'hôm nay',
                week: 'tuần này',
                month: 'tháng này',
                quarter: 'quý này',
                year: 'năm này',
                yesterday: 'hôm qua',
                last_week: 'tuần trước',
                last_month: 'tháng trước',
                last_quarter: 'quý trước',
                last_year: 'năm trước',
                minutes_ago: 'phút trước',
                hours_ago: 'giờ trước',
                days_ago: 'ngày trước',
                created_new: 'Tạo mới',
                updated: 'Cập nhật',
                completed: 'Hoàn thành',
                closed: 'Đóng',
                new_ticket_desc: 'Tạo phiếu mới',
                completed_desc: 'Hoàn thành sửa chữa - Sẵn sàng lấy',
                status_update_desc: 'Cập nhật trạng thái',
                no_data: 'Không có dữ liệu'
            },
            en: {
                header_title: 'Dashboard - RealTime CS',
                time_filter_title: 'Time Filter',
                total_tickets_title: 'Total Tickets',
                new_tickets_title: 'New Tickets',
                processing_tickets_title: 'In Progress',
                completed_tickets_title: 'Completed',
                hold_tickets_title: 'On Hold',
                cancelled_tickets_title: 'Cancelled',
                warranty_tickets_title: 'Warranty',
                closed_tickets_title: 'Closed',
                quick_actions_title: 'Quick Actions',
                create_category_btn: 'Create Category',
                settings_btn: 'Settings',
                status_overview_title: 'Ticket Status',
                priority_chart_title: 'Priority Distribution',
                recent_activity_title: 'Recent Activity',
                error_text: 'Unable to load data. Please try again later.',
                no_recent_activity: 'No recent activity',
                today: 'today',
                week: 'this week',
                month: 'this month',
                quarter: 'this quarter',
                year: 'this year',
                yesterday: 'yesterday',
                last_week: 'last week',
                last_month: 'last month',
                last_quarter: 'last quarter',
                last_year: 'last year',
                minutes_ago: 'minutes ago',
                hours_ago: 'hours ago',
                days_ago: 'days ago',
                created_new: 'Created',
                updated: 'Updated',
                completed: 'Completed',
                closed: 'Closed',
                new_ticket_desc: 'New ticket created',
                completed_desc: 'Repair completed - Ready for pickup',
                status_update_desc: 'Status updated',
                no_data: 'No data available'
            }
        };

        // Status mapping for both languages
        const statusMapping = {
            'Received': {
                group: 'new-ticket',
                vi: 'Phiếu mới',
                en: 'New Ticket',
                class: 'badge-blue'
            },
            'Quote Pending': {
                group: 'processing',
                vi: 'Chờ báo giá',
                en: 'Quote Pending',
                class: 'badge-yellow'
            },
            'Quote Approved': {
                group: 'processing',
                vi: 'Đã duyệt báo giá',
                en: 'Quote Approved',
                class: 'badge-yellow'
            },
            'Diagnosed': {
                group: 'processing',
                vi: 'Đã chẩn đoán',
                en: 'Diagnosed',
                class: 'badge-yellow'
            },
            'Waiting for Parts': {
                group: 'processing',
                vi: 'Chờ linh kiện',
                en: 'Waiting for Parts',
                class: 'badge-yellow'
            },
            'Parts Ordered': {
                group: 'processing',
                vi: 'Đã đặt linh kiện',
                en: 'Parts Ordered',
                class: 'badge-yellow'
            },
            'Parts Received': {
                group: 'processing',
                vi: 'Đã nhận linh kiện',
                en: 'Parts Received',
                class: 'badge-yellow'
            },
            'In Progress': {
                group: 'processing',
                vi: 'Đang sửa chữa',
                en: 'In Progress',
                class: 'badge-yellow'
            },
            'Testing': {
                group: 'processing',
                vi: 'Đang kiểm tra',
                en: 'Testing',
                class: 'badge-yellow'
            },
            'Quality Check': {
                group: 'processing',
                vi: 'Kiểm tra chất lượng',
                en: 'Quality Check',
                class: 'badge-yellow'
            },
            'Completed': {
                group: 'completed',
                vi: 'Hoàn thành',
                en: 'Completed',
                class: 'badge-green'
            },
            'Ready for Pickup': {
                group: 'completed',
                vi: 'Sẵn sàng lấy',
                en: 'Ready for Pickup',
                class: 'badge-green'
            },
            'Delivered': {
                group: 'completed',
                vi: 'Đã giao',
                en: 'Delivered',
                class: 'badge-green'
            },
            'On Hold': {
                group: 'on-hold',
                vi: 'Tạm dừng',
                en: 'On Hold',
                class: 'badge-red'
            },
            'Waiting Customer': {
                group: 'on-hold',
                vi: 'Chờ khách hàng',
                en: 'Waiting Customer',
                class: 'badge-red'
            },
            'Cancelled': {
                group: 'cancelled',
                vi: 'Đã hủy',
                en: 'Cancelled',
                class: 'badge-gray'
            },
            'Warranty Claim': {
                group: 'warranty',
                vi: 'Bảo hành',
                en: 'Warranty Claim',
                class: 'badge-purple'
            },
            'Closed': {
                group: 'closed',
                vi: 'Đã đóng',
                en: 'Closed',
                class: 'badge-black'
            }
        };

        // Priority mapping
        const priorityMapping = {
            'High': {
                vi: 'Cao',
                en: 'High',
                class: 'dot-orange'
            },
            'Medium': {
                vi: 'Bình thường',
                en: 'Medium',
                class: 'dot-blue'
            },
            'Low': {
                vi: 'Thấp',
                en: 'Low',
                class: 'dot-green'
            }
        };

 function updateLanguage() {
            const t = translations[app_language];
            
            document.getElementById('time-filter-title').textContent = t.time_filter_title;
            document.getElementById('total-tickets-title').textContent = t.total_tickets_title;
            document.getElementById('new-tickets-title').textContent = t.new_tickets_title;
            document.getElementById('processing-tickets-title').textContent = t.processing_tickets_title;
            document.getElementById('completed-tickets-title').textContent = t.completed_tickets_title;
            document.getElementById('hold-tickets-title').textContent = t.hold_tickets_title;
            document.getElementById('cancelled-tickets-title').textContent = t.cancelled_tickets_title;
            document.getElementById('warranty-tickets-title').textContent = t.warranty_tickets_title;
            document.getElementById('parts-tickets-title').textContent = t.closed_tickets_title;
            document.getElementById('create-category-text').textContent = t.create_category_btn;
            document.getElementById('settings-text').textContent = t.settings_btn;
            document.getElementById('status-overview-title').textContent = t.status_overview_title;
            document.getElementById('priority-chart-title').textContent = t.priority_chart_title;
            document.getElementById('recent-activity-title').textContent = t.recent_activity_title;
            document.getElementById('error-text').textContent = t.error_text;

            // Update dropdown items
            const dropdownItems = document.querySelectorAll('.dropdown-item');
            dropdownItems.forEach(item => {
                const textKey = `data-text-${app_language}`;
                item.textContent = item.getAttribute(textKey);
            });

            // Update selected filter text
            const selectedItem = document.querySelector('.dropdown-item.selected');
            if (selectedItem) {
                document.getElementById('selected-time-filter').textContent = selectedItem.textContent;
            }
        }

function getDateRange(filter) {
            const now = new Date();
            let startDate, endDate = now;

            switch(filter) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - now.getDay());
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'quarter':
                    const quarter = Math.floor(now.getMonth() / 3);
                    startDate = new Date(now.getFullYear(), quarter * 3, 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            }

            return {
                start: startDate.toISOString(),
                end: endDate.toISOString()
            };
        }


function updateDashboardWithAggregations(statusAggs, priorityAggs) {
            updateMetricsFromAggs(statusAggs);
            updateStatusOverviewFromAggs(statusAggs);
            updatePriorityChartFromAggs(priorityAggs);
        }


function updateMetricsFromAggs(statusAggs) {
            // Sử dụng distinct_session_count thay vì doc_count
            const total = statusAggs.reduce((sum, bucket) => sum + bucket.distinct_session_count.value, 0);
            
            // Nhóm các trạng thái theo loại
            const statusGroups = {
                new: ['Received'],
                processing: ['Quote Pending','Quote Approved', 'Diagnosed', 'In Progress', 'Testing', 'Quality Check', 'Parts Received', 'Waiting for Parts', 'Parts Ordered'],
                completed: ['Completed', 'Ready for Pickup', 'Delivered'],
                hold: ['On Hold', 'Waiting Customer'],
                cancelled: ['Cancelled'],
                warranty: ['Warranty Claim'],
                closed: ['Closed']
            };
            
            // Tính tổng cho từng nhóm
            const counts = {
                new: statusAggs
                    .filter(bucket => statusGroups.new.includes(bucket.key))
                    .reduce((sum, bucket) => sum + bucket.distinct_session_count.value, 0),
                processing: statusAggs
                    .filter(bucket => statusGroups.processing.includes(bucket.key))
                    .reduce((sum, bucket) => sum + bucket.distinct_session_count.value, 0),
                completed: statusAggs
                    .filter(bucket => statusGroups.completed.includes(bucket.key))
                    .reduce((sum, bucket) => sum + bucket.distinct_session_count.value, 0),
                hold: statusAggs
                    .filter(bucket => statusGroups.hold.includes(bucket.key))
                    .reduce((sum, bucket) => sum + bucket.distinct_session_count.value, 0),
                cancelled: statusAggs
                    .filter(bucket => statusGroups.cancelled.includes(bucket.key))
                    .reduce((sum, bucket) => sum + bucket.distinct_session_count.value, 0),
                warranty: statusAggs
                    .filter(bucket => statusGroups.warranty.includes(bucket.key))
                    .reduce((sum, bucket) => sum + bucket.distinct_session_count.value, 0),
                closed: statusAggs
                    .filter(bucket => statusGroups.closed.includes(bucket.key))
                    .reduce((sum, bucket) => sum + bucket.distinct_session_count.value, 0)
            };
            
            
            // Cập nhật giá trị cho từng khối
            document.getElementById('total-tickets').textContent = total;
            document.getElementById('new-tickets').textContent = counts.new;
            document.getElementById('processing-tickets').textContent = counts.processing;
            document.getElementById('completed-tickets').textContent = counts.completed;
            document.getElementById('hold-tickets').textContent = counts.hold;
            document.getElementById('cancelled-tickets').textContent = counts.cancelled;
            document.getElementById('warranty-tickets').textContent = counts.warranty;
            document.getElementById('closed-tickets').textContent = counts.closed;
        }


 function updateStatusOverviewFromAggs(statusAggs) {
            const statusOverview = document.getElementById('status-overview');
            statusOverview.innerHTML = '';

            // Sử dụng distinct_session_count thay vì doc_count
            const total = statusAggs.reduce((sum, bucket) => sum + bucket.distinct_session_count.value, 0) || 1;
            const maxCount = Math.max(...statusAggs.map(bucket => bucket.distinct_session_count.value), 1);

            // Define all possible statuses with their colors
            const allStatuses = [
                'Received', 'Quote Pending', 'Quote Approved', 'Diagnosed',
                'Waiting for Parts', 'Parts Ordered', 'Parts Received',
                'In Progress', 'Testing', 'Quality Check', 'Completed',
                'Ready for Pickup', 'Delivered', 'On Hold',
                'Waiting Customer', 'Cancelled', 'Warranty Claim', 'Closed'
            ];

            // Create a map of actual counts from aggregation
            const statusCounts = {};
            statusAggs.forEach(bucket => {
                statusCounts[bucket.key] = bucket.distinct_session_count.value;
            });

            // Group statuses by type for coloring
            const statusTypes = {
                'Received': 'new',
                'Quote Pending': 'processing',
                'Quote Approved': 'processing',
                'Diagnosed': 'processing',
                'Waiting for Parts': 'processing',
                'Parts Ordered': 'processing',
                'Parts Received': 'processing',
                'In Progress': 'processing',
                'Testing': 'processing',
                'Quality Check': 'processing',
                'Completed': 'completed',
                'Ready for Pickup': 'completed',
                'Delivered': 'completed',
                'Closed': 'completed',
                'On Hold': 'hold',
                'Waiting Customer': 'hold',
                'Cancelled': 'cancelled',
                'Warranty Claim': 'warranty',
                'Closed': 'closed'
            };

            allStatuses.forEach(status => {
                const count = statusCounts[status] || 0;
                const height = maxCount > 0 ? Math.max((count / maxCount) * 100, count > 0 ? 5 : 0) : 0;
                const statusInfo = statusMapping[status];
                const statusType = statusTypes[status] || 'new';

                if (statusInfo) {
                    const statusBar = document.createElement('div');
                    statusBar.className = 'status-bar';
                    statusBar.setAttribute('data-type', statusType);
                    statusBar.innerHTML = `
    <div class="status-tooltip">${statusInfo[app_language]}: ${count}</div>
    <div class="status-bar-inner" style="height: ${height}%;">
        <div class="status-value-inside">${count}</div>
    </div>
    <span class="status-label" title="${statusInfo[app_language]}">${statusInfo[app_language]}</span>
`;
        
        // Thêm sự kiện click để hiển thị alert với số lượng
        statusBar.addEventListener('click', function() {
            alert(`${statusInfo[app_language]}: ${count} phiếu`);
        });
        
                    statusOverview.appendChild(statusBar);
                }
            });

            // If no statuses found, show a message
            if (statusAggs.length === 0) {
                const t = translations[app_language];
                statusOverview.innerHTML = `<p class="text-center text-gray-500" style="width: 100%; display: flex; align-items: center; justify-content: center;">${t.no_data || 'Không có dữ liệu'}</p>`;
            }
        }


function updatePriorityChartFromAggs(priorityAggs) {
            const priorityChart = document.getElementById('priority-chart');
            priorityChart.innerHTML = '';
            
            // Sử dụng distinct_session_count thay vì doc_count
            const total = priorityAggs.reduce((sum, bucket) => sum + bucket.distinct_session_count.value, 0) || 1;
            
            const priorityOrder = ['High', 'Medium', 'Low'];
            
            priorityOrder.forEach(priority => {
                const bucket = priorityAggs.find(b => b.key === priority);
                const count = bucket ? bucket.distinct_session_count.value : 0;
                const percentage = Math.round((count / total) * 100);
                const priorityInfo = priorityMapping[priority];
                
                if (priorityInfo) {
                    const priorityItem = document.createElement('div');
                    priorityItem.className = 'priority-item';
                    priorityItem.innerHTML = `
                        <div class="priority-left">
                            <div class="priority-dot ${priorityInfo.class}"></div>
                            <span class="priority-label">${priorityInfo[app_language]}</span>
                        </div>
                        <div class="priority-right">
                            <div class="progress-bar">
                                <div class="progress-fill ${priorityInfo.class}" style="width: ${percentage}%;"></div>
                            </div>
                            <span class="priority-count">${count}</span>
                        </div>
                    `;
                    priorityChart.appendChild(priorityItem);
                }
            });
        }

function formatRelativeTime(timestamp) {
            const now = new Date();
            const ticketTime = new Date(timestamp);
            const diffMs = now - ticketTime;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            const t = translations[app_language];
            
            if (diffMins < 60) {
                return `${diffMins} ${t.minutes_ago}`;
            } else if (diffHours < 24) {
                return `${diffHours} ${t.hours_ago}`;
            } else {
                return `${diffDays} ${t.days_ago}`;
            }
        }


function updateRecentActivityFromAggs(recentTickets) {
            const recentActivityList = document.getElementById('recent-activity-list');
            recentActivityList.innerHTML = '';
            
            if (recentTickets.length === 0) {
                const t = translations[app_language];
                recentActivityList.innerHTML = `<p class="text-center text-gray-500">${t.no_recent_activity}</p>`;
                return;
            }
            
            recentTickets.slice(0, 5).forEach(hit => {
                const ticket = hit._source;
                const data = ticket.output?.data_formatted || {};
                
                const status = data.current_status || 'Received';
                const activityType = status === 'Received' ? 'created' :
                     (status === 'Completed' || status === 'Ready for Pickup' || status === 'Delivered') ? 'completed' :
                     status === 'Closed' ? 'closed' : 'updated';
                
                const t = translations[app_language];
                const activityLabel = t[activityType === 'created' ? 'created_new' : activityType];
                const activityClass = activityType === 'created' ? 'badge-blue' : 
                                     activityType === 'completed' ? 'badge-green' : 
                                     activityType === 'closed' ? 'badge-gray' :'badge-yellow';
                
                const statusInfo = statusMapping[status];
                const statusLabel = statusInfo ? statusInfo[app_language] : status;
                
                const description = activityType === 'created' ? 
                    `${t.new_ticket_desc} - ${data.customer_reported_issue || ''}` : 
                    activityType === 'completed' ? t.completed_desc : 
                    `${t.status_update_desc} - ${statusLabel}`;
                
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <div class="activity-content">
                        <div class="activity-header">
                            <span class="badge ${activityClass}">${activityLabel}</span>
                            <span class="activity-ticket">#${data.order_id}</span>
                        </div>
                        <div class="activity-customer">
                            <i data-lucide="user" style="width: 10px; height: 10px;"></i>
                            <span>${data.customer_name || ''}</span>
                        </div>
                        <p class="activity-description">${description}</p>
                        <p class="activity-time">${formatRelativeTime(ticket.timestamp)}</p>
                    </div>
                `;
                recentActivityList.appendChild(activityItem);
                
                // Re-initialize icons for the new content
                lucide.createIcons({
                    icons: {
                        user: true
                    },
                    root: activityItem
                });
            });
        }


