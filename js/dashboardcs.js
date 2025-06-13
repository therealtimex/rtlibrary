// Update dashboard with aggregated data
function updateDashboardWithAggregations(statusAggs, priorityAggs) {
    updateMetricsFromAggs(statusAggs);
    updateStatusOverviewFromAggs(statusAggs);
    updatePriorityChartFromAggs(priorityAggs);
}

// Update metrics from aggregations
function updateMetricsFromAggs(statusAggs) {
    const total = statusAggs.reduce((sum, bucket) => sum + bucket.doc_count, 0);
    
    const completedStatuses = ['Completed', 'Ready for Pickup', 'Delivered', 'Closed'];
    const completed = statusAggs
        .filter(bucket => completedStatuses.includes(bucket.key))
        .reduce((sum, bucket) => sum + bucket.doc_count, 0);
    
    const processing = total - completed;
    
    const t = translations[app_language];
    const totalChange = `+${Math.floor(total * 0.15)} ${t[currentTimeFilter]}`;
    const processingChange = `+${Math.floor(processing * 0.1)} ${t[`last_${currentTimeFilter === 'today' ? 'yesterday' : currentTimeFilter.replace('this ', '')}`] || t.yesterday}`;
    const completedChange = `+${Math.floor(completed * 0.2)} ${t[currentTimeFilter]}`;
    
    document.getElementById('total-tickets').textContent = total;
    document.getElementById('processing-tickets').textContent = processing;
    document.getElementById('completed-tickets').textContent = completed;
    document.getElementById('total-change').textContent = totalChange;
    document.getElementById('processing-change').textContent = processingChange;
    document.getElementById('completed-change').textContent = completedChange;
}

// Update status overview from aggregations - Show as bar chart
function updateStatusOverviewFromAggs(statusAggs) {
    const statusOverview = document.getElementById('status-overview');
    statusOverview.innerHTML = '';

    const total = statusAggs.reduce((sum, bucket) => sum + bucket.doc_count, 0) || 1;
    const maxCount = Math.max(...statusAggs.map(bucket => bucket.doc_count), 1);

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
        statusCounts[bucket.key] = bucket.doc_count;
    });

    // Group statuses by type for coloring
    const statusTypes = {
        'Received': 'new',
        'Quote Pending': 'new',
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
        'Warranty Claim': 'warranty'
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
        <div class="status-value">${count}</div>
        <div class="status-bar-inner" style="height: ${height}%;"></div>
        <span class="status-label" title="${statusInfo[app_language]}">${statusInfo[app_language]}</span>
    `;
            statusOverview.appendChild(statusBar);
        }
    });

    // If no statuses found, show a message
    if (statusAggs.length === 0) {
        const t = translations[app_language];
        statusOverview.innerHTML = `<p class="text-center text-gray-500" style="width: 100%; display: flex; align-items: center; justify-content: center;">${t.no_data || 'Không có dữ liệu'}</p>`;
    }
}


// Update priority chart from aggregations
function updatePriorityChartFromAggs(priorityAggs) {
    const priorityChart = document.getElementById('priority-chart');
    priorityChart.innerHTML = '';
    
    const total = priorityAggs.reduce((sum, bucket) => sum + bucket.doc_count, 0) || 1;
    
    const priorityOrder = ['High', 'Medium', 'Low'];
    
    priorityOrder.forEach(priority => {
        const bucket = priorityAggs.find(b => b.key === priority);
        const count = bucket ? bucket.doc_count : 0;
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

// Get date range for time filter
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


        // Build Elasticsearch aggregation query
        function buildAggregationQuery(timeFilter) {
            const dateRange = getDateRange(timeFilter);
            
            return {
                size: 0, // We only want aggregations, not individual documents
                query: {
                    bool: {
                        must: [
                            { match: { "metadata.md_code": "realtimecs" } },
                            {
                                range: {
                                    "timestamp.keyword": {
                                        gte: dateRange.start,
                                        lte: dateRange.end
                                    }
                                }
                            }
                        ]
                    }
                },
                aggs: {
                    status_distribution: {
                        terms: {
                            field: "output.data_formatted.current_status.keyword",
                            size: 20
                        }
                    },
                    priority_distribution: {
                        terms: {
                            field: "output.data_formatted.priority.keyword",
                            size: 10
                        }
                }
            }
        }
    }


    // Update language
        function updateLanguage() {
            const t = translations[app_language];
            
            document.getElementById('time-filter-title').textContent = t.time_filter_title;
            document.getElementById('total-tickets-title').textContent = t.total_tickets_title;
            document.getElementById('processing-tickets-title').textContent = t.processing_tickets_title;
            document.getElementById('completed-tickets-title').textContent = t.completed_tickets_title;
            // document.getElementById('quick-actions-title').textContent = t.quick_actions_title;
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


 // Format relative time
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

// Update recent activity from aggregations
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
                                    (status === 'Completed' || status === 'Ready for Pickup' || status === 'Delivered') ? 'completed' : 'updated';
                
                const t = translations[app_language];
                const activityLabel = t[activityType === 'created' ? 'created_new' : activityType];
                const activityClass = activityType === 'created' ? 'badge-blue' : 
                                     activityType === 'completed' ? 'badge-green' : 'badge-yellow';
                
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
                            <span class="activity-ticket">#${data.order_id || ticket.session_id}</span>
                        </div>
                        <div class="activity-customer">
                            <i data-lucide="user" style="width: 10px; height: 10px;"></i>
                            <span>${data.customer_name || 'Unknown Customer'}</span>
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

 // Fetch data from API using aggregations
        async function fetchData() {
            try {
                document.getElementById('loading-container').style.display = 'flex';
                document.getElementById('dashboard-content').style.display = 'none';
                document.getElementById('error-message').style.display = 'none';

                const query = buildAggregationQuery(currentTimeFilter);
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(query)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                
                // Process aggregation results
                const statusAggs = data.aggregations.status_distribution.buckets;
                const priorityAggs = data.aggregations.priority_distribution.buckets;
                // Update the dashboard with aggregated data
                updateDashboardWithAggregations(statusAggs, priorityAggs);
                
                document.getElementById('loading-container').style.display = 'none';
                document.getElementById('dashboard-content').style.display = 'block';
                await fetchRecentActivities();
            } catch (error) {
                console.error('Error fetching data:', error);
                document.getElementById('loading-container').style.display = 'none';
                document.getElementById('error-message').style.display = 'block';
            }
        }


// Call action button
function callActionButton(action) {
    if (typeof App !== 'undefined' && App && typeof App.callActionButton === 'function') {
        App.callActionButton(JSON.stringify(action));
    } else {
        console.warn('App.callActionButton is not defined. Please ensure the native bridge is properly initialized.');
        alert('Action: ' + action.action + '\nData: ' + JSON.stringify(action.data)); // Fallback for web testing
    }
}