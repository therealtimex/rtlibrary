// Configuration
const INDEX_URL = 'https://es.rta.vn/llm_all_log/_search';
const CONTEXT_URL = 'https://es.rta.vn/ai_context_llm/_search';
const PROJECT_CODE = document.getElementsByName('projectCode')[0].content;
const USERNAME = document.getElementsByName('username')[0].content;
const CONTEXT_ID = document.getElementsByName('context_id')[0].content;

// Category colors - softer, business-friendly palette
const categoryColors = {'Automotive & Gas': '#4B89DC','Merchandise & Inventory': '#48CFAD','Office & Shipping': '#FFCE54','Utilities & Rent': '#967ADC','Repairs & Maintenance': '#F6BB42','Meals & Entertainment': '#8CC152','Travel': '#EC87C0','Professional Services': '#5D9CEC','Education, Health & Wellness': '#AC92EC','Miscellaneous': '#AAB2BD','default': '#CCD1D9'};

// Currency symbol mapping
const currencySymbols = {'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥', 'INR': '₹', 'CAD': 'C$', 'AUD': 'A$', 'SGD': 'S$', 'HKD': 'HK$', 'NZD': 'NZ$', 'MXN': 'Mex$', 'BRL': 'R$', 'CHF': 'CHF', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr', 'RUB': '₽', 'TRY': '₺', 'ZAR': 'R', 'KRW': '₩', 'VND': '₫'};

// Track chart instances
let charts = {};

// Fetch financial data using the project's API approach
async function fetchFinancialSummary(timeRange = 'now/M') {
    try {
        console.log('Fetching financial summary for range:', timeRange);
        
        const requestBody = {
            "size": 0,
            "query": {
                "bool": {
                    "must": [
                        { "term": { "project_code.keyword": { "value": PROJECT_CODE } } },
                        { "term": { "metadata.user_email_sso.keyword": { "value": USERNAME } } },
                        { "term": { "metadata.md_code.keyword": { "value": "keepy" } } },
                        { "term": { "context_id.keyword": { "value": CONTEXT_ID } } },
                        { "terms": { "session_name.keyword": [
                            "Extract and Organize Data into Spreadsheet",
                            "Extract and Organize Data into Spreadsheet - Active",
                            "Extract and Organize Data into Spreadsheet - Edited"
                        ]}},
                        { "exists": { "field": "output.data_formatted" }},
                        { "exists": { "field": "output.data_formatted.context_name" }},
                        { "range": { "output.data_formatted.transaction_date": { "gte": timeRange } } }
                    ]
                }
            },
            "aggs": {
                "by_month": {
                    "date_histogram": {
                        "field": "output.data_formatted.transaction_date",
                        "calendar_interval": "month"
                    },
                    "aggs": {
                        "by_currency": {
                            "terms": {
                                "field": "output.data.Currency.keyword"
                            },
                            "aggs": {
                                "total_amount": {
                                    "sum": { "field": "output.data.Amount" }
                                },
                                "by_category": {
                                    "terms": {
                                        "field": "output.data.Spend Category.keyword",
                                        "size": 10
                                    },
                                    "aggs": {
                                        "category_total": {
                                            "sum": { "field": "output.data.Amount" }
                                        }
                                    }
                                },
                                "by_context": {
                                    "terms": {
                                        "field": "output.data_formatted.context_name.keyword",
                                        "size": 10
                                    },
                                    "aggs": {
                                        "category_total": {
                                            "sum": { "field": "output.data.Amount" }
                                        }
                                    }
                                },
                                "top_expenses": {
                                    "top_hits": {
                                        "size": 5,
                                        "_source": ["output.data.Vendor", "output.data.Amount", "output.data.Transaction date", "output.data.Spend Category"],
                                        "sort": [{ "output.data.Amount": "desc" }]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const response = await fetch(INDEX_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            console.error('Server response:', response.status, response.statusText);
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.aggregations || !data.aggregations.by_month) {
            console.error('Invalid response structure:', data);
            throw new Error('Invalid data structure received from server');
        }

        return data;
    } catch (error) {
        console.error('Error fetching summary:', error);
        throw error;
    }
}

// Format currency values
function formatCurrency(amount, currencyCode = 'USD') {
    const symbol = currencySymbols[currencyCode] || currencyCode;
    
    if (['JPY', 'KRW', 'VND'].includes(currencyCode)) {
        return `${symbol}${Math.round(parseFloat(amount)).toLocaleString()}`;
    } else {
        return `${symbol}${parseFloat(amount).toFixed(2)}`;
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } catch (error) {
        console.warn('Error formatting date:', error);
        return dateString;
    }
}

// Get current month and year
function getCurrentMonthYear() {
    const now = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
}

// Check if a date is in the current month/year
function isCurrentMonthYear(dateString) {
    if (!dateString) return false;
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    } catch (error) {
        console.warn('Error checking date:', error);
        return false;
    }
}

// Process aggregated data
function processAggregatedData(esResponse) {
    console.log('Processing aggregated data:', esResponse);
    
    if (!esResponse?.aggregations?.by_month?.buckets) {
        console.error('Invalid response structure:', esResponse);
        return {
            currencies: {},
            totalReceipts: 0
        };
    }

    const monthlyData = {};
    
    esResponse.aggregations.by_month.buckets.forEach(monthBucket => {
        const monthKey = new Date(monthBucket.key).toISOString().slice(0, 7);
        
        monthlyData[monthKey] = {
            currencies: {},
            totalReceipts: 0
        };

        monthBucket.by_currency.buckets.forEach(currencyBucket => {
            const currency = currencyBucket.key;
                        
            monthlyData[monthKey].currencies[currency] = {
                totalAmount: currencyBucket.total_amount.value,
                receiptCount: currencyBucket.doc_count,
                categoryData: currencyBucket.by_category.buckets.map(cat => ({
                    name: cat.key,
                    amount: cat.category_total.value,
                    count: cat.doc_count,
                    percentage: (cat.category_total.value / currencyBucket.total_amount.value) * 100
                })),
                contextData: currencyBucket.by_context.buckets.map(ctx => ({
                    name: ctx.key,
                    amount: ctx.category_total.value,
                    count: ctx.doc_count,
                    percentage: (ctx.category_total.value / currencyBucket.total_amount.value) * 100
                })),
                expenses: currencyBucket.top_expenses.hits.hits.map(hit => ({
                    vendor: hit._source.output.data.Vendor,
                    amount: hit._source.output.data.Amount,
                    date: hit._source.output.data['Transaction date'],
                    category: hit._source.output.data['Spend Category']
                }))
            };

            monthlyData[monthKey].totalReceipts += currencyBucket.doc_count;
        });
    });

    return monthlyData;
}

// Render the summary view
function renderSummaryView(data) {
    console.log('Rendering summary view...');
    const container = document.getElementById('currency-summary-container');
    
    if (!data || Object.keys(data.currencies || {}).length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px; text-align: center;">
                <svg width="160" height="160" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="11" fill="var(--color_theme_neutral_light)" />
                    <g transform="translate(4, 4)">
                        <circle cx="7" cy="7" r="6" stroke="var(--color_theme_primary)" stroke-width="1.5" fill="var(--color_theme_surface)" />
                        <line x1="11.5" y1="11.5" x2="16" y2="16" stroke="var(--color_theme_primary)" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M7 4.5v5" stroke="var(--color_theme_accent)" stroke-width="1.5" stroke-linecap="round">
                            <animate attributeName="d" dur="1.5s" repeatCount="indefinite" values="M7 4.5v5;M7 6.5v1;M7 4.5v5" />
                        </path>
                    </g>
                    <circle cx="18" cy="6" r="1" fill="var(--color_theme_secondary)">
                        <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.3;1;0.3" />
                    </circle>
                    <circle cx="6" cy="18" r="1" fill="var(--color_theme_secondary)">
                        <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="1;0.3;1" />
                    </circle>
                </svg>
                <h3 style="font-size: 18px; margin-bottom: 10px; color: var(--color_theme_text_primary);">No Context Data Yet</h3>
                <p style="color: var(--color_theme_text_secondary); margin-bottom: 15px;">Add some receipts to this context and come back to see your expense dashboard.</p>
                </div>`;
        return;
    }

    const currencies = Object.keys(data.currencies || {});
    const currencyData = data.currencies || {};
    const currentMonth = getCurrentMonthYear();
    const multiCurrency = currencies.length > 1;
    const hasDateInconsistencies = false;
    
    let html = '';
    
    if (hasDateInconsistencies) {
        html += `
            <div class="warning-badge" style="display: inline-flex; margin-bottom: 16px;">
                <img src="rta://icon/bootstrap/exclamation-triangle-fill?color=__COLOR_THEME_SURFACE__" alt="Warning" width="12" height="12">
                <span>Some receipts have dates outside current period</span>
            </div>`;
    }
    
    // Only show currency tabs if multiple currencies exist
    if (currencies.length > 1) {
        html += `<div class="currency-tabs" style="margin: 0 0 8px 0;">`;
        currencies.forEach((currency, index) => {
            html += `<div class="currency-tab ${index === 0 ? 'active' : ''}" data-currency="${currency}">${currency}</div>`;
        });
        html += `</div>`;
    }
    
    currencies.forEach((currency, index) => {
        const currData = currencyData[currency];
        const isVisible = index === 0;
        
        html += `
            <div id="currency-section-${currency}" class="currency-section" style="display: ${isVisible ? 'block' : 'none'};">
                <div class="total-card">
                    <div class="total-amount">${formatCurrency(currData.totalAmount, currency)}</div>
                    <div class="total-meta">
                        <span>${currData.receiptCount} receipt${currData.receiptCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Spend Categories</div>
                    </div>
                    <div class="chart-container">
                        <canvas id="categories-chart-${currency}"></canvas>
                    </div>
                    <div class="category-legend" id="category-legend-${currency}"></div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Top Expenses</div>
                    </div>
                    <div class="expenses-list" id="expenses-list-${currency}">
                        ${renderExpensesList(currData.expenses, currency)}
                    </div>
                </div>
            </div>`;
    });
    
    container.innerHTML = html;
    
    renderCharts(currencies[0], currencyData[currencies[0]]);
    
    setupEventListeners(data);
}

// Render the expenses list
function renderExpensesList(expenses, currency) {
    if (!expenses || expenses.length === 0) {
        return `<div class="empty-state">No expenses found</div>`;
    }
    
    const topExpenses = expenses.slice(0, 5);
    let html = '';
    
    topExpenses.forEach(expense => {
        const categoryColor = categoryColors[expense.category] || categoryColors.default;
        const dateOutsideCurrent = !isCurrentMonthYear(expense.date);
        
        html += `
            <div class="expense-item">
                <div class="expense-left">
                    <div class="expense-color" style="background-color: ${categoryColor};"></div>
                    <div class="expense-details">
                        <div class="expense-merchant">${expense.vendor}</div>
                        <div class="expense-date">
                            ${formatDate(expense.date)}
                            ${dateOutsideCurrent ? `<span class="date-tiny-badge">Entry date</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="expense-right">
                    <div class="expense-category">${expense.category}</div>
                    <div class="expense-amount">${formatCurrency(expense.amount, currency)}</div>
                </div>
            </div>`;
    });
    
    return html;
}

// Render category legend
function renderCategoryLegend(currency, categories) {
    const legendContainer = document.getElementById(`category-legend-${currency}`);
    if (!legendContainer) return;
    
    const topCategories = categories.slice(0, 5);
    let legendHTML = '';
    
    topCategories.forEach(category => {
        const color = categoryColors[category.name] || categoryColors.default;
        const percentage = Math.round(category.percentage);
        
        legendHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${color};"></div>
                <span>${category.name} (${percentage}%)</span>
            </div>`;
    });
    
    if (categories.length > 5) {
        const otherCategories = categories.slice(5);
        const otherPercentage = Math.round(otherCategories.reduce((sum, cat) => sum + cat.percentage, 0));
        
        if (otherPercentage > 0) {
            legendHTML += `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${categoryColors.default};"></div>
                    <span>Other (${otherPercentage}%)</span>
                </div>`;
        }
    }
    
    legendContainer.innerHTML = legendHTML;
}

// Render charts for the selected currency
function renderCharts(currency, data) {
    console.log(`Rendering charts for ${currency}`);
    
    if (charts[`categories-${currency}`]) {
        charts[`categories-${currency}`].destroy();
    }
    
    renderCategoriesChart(currency, data);
    renderCategoryLegend(currency, data.categoryData);
}

// Render categories donut chart
function renderCategoriesChart(currency, data) {
    const canvasId = `categories-chart-${currency}`;
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.warn(`Canvas element not found: ${canvasId}`);
        return;
    }
    
    if (!data.categoryData || data.categoryData.length === 0) {
        canvas.parentNode.innerHTML = `
            <div class="chart-placeholder">
                <img src="rta://icon/bootstrap/pie-chart?color=__COLOR_THEME_TEXT_SECONDARY__" alt="No data" width="24" height="24" style="margin-bottom: 8px;">
                <span>No category data available</span>
            </div>`;
        return;
    }
    
    const topCategories = data.categoryData.slice(0, 5);
    let labels = topCategories.map(cat => cat.name);
    let values = topCategories.map(cat => cat.amount);
    let backgroundColors = topCategories.map(cat => categoryColors[cat.name] || categoryColors.default);
    
    if (data.categoryData.length > 5) {
        const otherCategories = data.categoryData.slice(5);
        const otherAmount = otherCategories.reduce((sum, cat) => sum + cat.amount, 0);
        
        if (otherAmount > 0) {
            labels.push('Other');
            values.push(otherAmount);
            backgroundColors.push(categoryColors.default);
        }
    }
    
    const ctx = canvas.getContext('2d');
    charts[`categories-${currency}`] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatCurrency(value, currency)} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// Setup event listeners for interactive elements
function setupEventListeners(data) {
    console.log('Setting up event listeners');
    const currencies = Object.keys(data.currencies || {});
    const multiCurrency = currencies.length > 1;
    
    if (multiCurrency) {
        document.querySelectorAll('.currency-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const currency = this.getAttribute('data-currency');
                console.log(`Currency tab clicked: ${currency}`);
                
                document.querySelectorAll('.currency-tab').forEach(t => {
                    t.classList.remove('active');
                });
                this.classList.add('active');
                
                document.querySelectorAll('.currency-section').forEach(section => {
                    section.style.display = 'none';
                });
                document.getElementById(`currency-section-${currency}`).style.display = 'block';
                
                renderCharts(currency, data.currencies[currency]);
            });
        });
    }
}

// Show error state
function showError(message, details = '') {
    const container = document.getElementById('currency-summary-container');
    container.innerHTML = `
        <div class="summary-header">
            <h1 class="summary-title">Summary</h1>
        </div>
        <div class="error-state">
            <img src="rta://icon/bootstrap/exclamation-triangle-fill?color=__COLOR_THEME_ERROR_TEXT__" alt="Error" width="16" height="16">
            <div>
                <div>${message}</div>
                ${details ? `<div class="error-details">${details}</div>` : ''}
                <button onclick="initializeApp()" class="retry-button">Retry</button>
            </div>
        </div>`;
}

function addTimeRangeSelector() {
    const ranges = [
        { value: 'now/M', label: 'This Month' },
        { value: 'now-1M/M', label: 'Last Month' },
        { value: 'now-3M/M', label: 'Last 3 Months' },
        { value: 'now-999y/M', label: 'All Time' }
    ];

    const container = document.getElementById('time-range-container');
    container.innerHTML = `
        <div class="time-range-selector">
            <select id="timeRange" class="form-select">
                ${ranges.map(range => 
                    `<option value="${range.value}" ${range.value === 'now-999y/M' ? 'selected' : ''}>${range.label}</option>`
                ).join('')}
            </select>
        </div>
    `;

    // Add change handler for time range
    document.getElementById('timeRange').addEventListener('change', async (e) => {
        await updateDashboardData(e.target.value);
    });
}

// Update dashboard data function
async function updateDashboardData(timeRange) {
    try {
        const container = document.getElementById('currency-summary-container');
        container.innerHTML = `<div class="loading-state">
            <img src="rta://icon/bootstrap/arrow-clockwise?color=__COLOR_THEME_TEXT_SECONDARY__" 
                 alt="Loading" width="24" height="24" class="loading-icon">
            <span>Loading financial data...</span>
        </div>`;
        
        const newData = await fetchFinancialSummary(timeRange);
        const newProcessedData = processAggregatedData(newData);
        const monthlyData = newProcessedData || {};
        
        if (!Object.keys(monthlyData).length) {
            renderSummaryView({
                currencies: {},
                totalReceipts: 0
            });
            return;
        }
        
        // Aggregate data for the selected time range
        const aggregatedData = {
            currencies: {},
            totalReceipts: 0
        };
        
        Object.values(monthlyData).forEach(monthData => {
            Object.entries(monthData.currencies).forEach(([currency, data]) => {
                if (!aggregatedData.currencies[currency]) {
                    aggregatedData.currencies[currency] = {
                        totalAmount: 0,
                        receiptCount: 0,
                        categoryData: [],
                        expenses: []
                    };
                }
                
                aggregatedData.currencies[currency].totalAmount += data.totalAmount;
                aggregatedData.currencies[currency].receiptCount += data.receiptCount;
                aggregatedData.totalReceipts += data.receiptCount;
                
                // Merge category data
                data.categoryData.forEach(category => {
                    const existingCategory = aggregatedData.currencies[currency].categoryData.find(c => c.name === category.name);
                    if (existingCategory) {
                        existingCategory.amount += category.amount;
                        existingCategory.count += category.count;
                    } else {
                        aggregatedData.currencies[currency].categoryData.push({...category});
                    }
                });

                // Merge context data
                if (data.contextData) {
                    if (!aggregatedData.currencies[currency].contextData) {
                        aggregatedData.currencies[currency].contextData = [];
                    }
                    data.contextData.forEach(context => {
                        const existingContext = aggregatedData.currencies[currency].contextData.find(c => c.name === context.name);
                        if (existingContext) {
                            existingContext.amount += context.amount;
                            existingContext.count += context.count;
                        } else {
                            aggregatedData.currencies[currency].contextData.push({...context});
                        }
                    });
                }
                
                aggregatedData.currencies[currency].expenses.push(...data.expenses);
            });
        });
        
        Object.values(aggregatedData.currencies).forEach(currencyData => {
            currencyData.categoryData.forEach(category => {
                category.percentage = (category.amount / currencyData.totalAmount) * 100;
            });
            currencyData.categoryData.sort((a, b) => b.amount - a.amount);
            currencyData.expenses.sort((a, b) => b.amount - a.amount);
            currencyData.expenses = currencyData.expenses.slice(0, 5);
        });
        
        renderSummaryView(aggregatedData);
    } catch (error) {
        console.error('Error updating data:', error);
        renderSummaryView({
            currencies: {},
            totalReceipts: 0
        });
    }
}

// Main initialization function
async function initializeApp() {
    try {
        addTimeRangeSelector();
        
        // Initial load with default range
        const rawData = await fetchFinancialSummary('now-999y/M');
        const processedData = processAggregatedData(rawData);
        const monthlyData = processedData || {};
        
        if (!Object.keys(monthlyData).length) {
            renderSummaryView({
                currencies: {},
                totalReceipts: 0
            });
            return;
        }
        
        // Aggregate all data across the selected time range
        const aggregatedData = {
            currencies: {},
            totalReceipts: 0
        };
        
        Object.values(monthlyData).forEach(monthData => {
            Object.entries(monthData.currencies).forEach(([currency, data]) => {
                if (!aggregatedData.currencies[currency]) {
                    aggregatedData.currencies[currency] = {
                        totalAmount: 0,
                        receiptCount: 0,
                        categoryData: [],
                        expenses: []
                    };
                }
                
                aggregatedData.currencies[currency].totalAmount += data.totalAmount;
                aggregatedData.currencies[currency].receiptCount += data.receiptCount;
                aggregatedData.totalReceipts += data.receiptCount;
                
                // Merge category data
                data.categoryData.forEach(category => {
                    const existingCategory = aggregatedData.currencies[currency].categoryData.find(c => c.name === category.name);
                    if (existingCategory) {
                        existingCategory.amount += category.amount;
                        existingCategory.count += category.count;
                    } else {
                        aggregatedData.currencies[currency].categoryData.push({...category});
                    }
                });

                // Merge context data
                if (data.contextData) {
                    if (!aggregatedData.currencies[currency].contextData) {
                        aggregatedData.currencies[currency].contextData = [];
                    }
                    data.contextData.forEach(context => {
                        const existingContext = aggregatedData.currencies[currency].contextData.find(c => c.name === context.name);
                        if (existingContext) {
                            existingContext.amount += context.amount;
                            existingContext.count += context.count;
                        } else {
                            aggregatedData.currencies[currency].contextData.push({...context});
                        }
                    });
                }
                
                aggregatedData.currencies[currency].expenses.push(...data.expenses);
            });
        });
        
        Object.values(aggregatedData.currencies).forEach(currencyData => {
            currencyData.categoryData.forEach(category => {
                category.percentage = (category.amount / currencyData.totalAmount) * 100;
            });
            currencyData.categoryData.sort((a, b) => b.amount - a.amount);
            currencyData.expenses.sort((a, b) => b.amount - a.amount);
            currencyData.expenses = currencyData.expenses.slice(0, 5);
        });
        
        renderSummaryView(aggregatedData);
        
    } catch (error) {
        console.error('App initialization error:', error);
        renderSummaryView({
            currencies: {},
            totalReceipts: 0
        });
    }
}

// Start the app when the document is loaded
document.addEventListener('DOMContentLoaded', initializeApp);