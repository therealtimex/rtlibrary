/**
 * Customer Manager - AppLocalStorage Implementation
 * Handles customer data management with pagination, search, and real-time updates
 */

class CustomerManager {
  constructor(config) {
    this.config = {
      itemsPerPage: 10,
      searchDelay: 500,
      scrollThreshold: 1000,
      ...config
    };

    this.state = {
      currentPage: 0,
      isLoading: false,
      hasMoreData: true,
      searchQuery: '',
      sortOrder: 'desc',
      loadedCount: 0
    };

    this.elements = {};
    this.searchTimeout = null;
  }

  // Initialize the manager
  init() {
    try {
      console.log('Initializing Customer Manager...');
      
      this.cacheElements();
      this.setupEvents();
      this.loadData();
      
      console.log('Customer Manager initialized successfully');
    } catch (error) {
      alert(`Customer Manager Init Error:\n${error.message}\n\nStack: ${error.stack}`);
      console.error('Customer Manager Init Error:', error);
    }
  }

  // Cache DOM elements
  cacheElements() {
    const elementIds = ['searchInput', 'clearSearch', 'customersList', 'customerCount', 'sortText', 'loading', 'empty', 'loadMore', 'endIndicator', 'refreshBtn'];
    
    this.elements = {};
    const missingElements = [];
    
    elementIds.forEach(id => {
      const element = document.getElementById(id);
      if (!element) {
        missingElements.push(id);
      }
      this.elements[id] = element;
    });
    
    if (missingElements.length > 0) {
      alert(`Missing DOM Elements:\n${missingElements.join(', ')}\n\nPlease check the HTML structure.`);
      console.error('Missing DOM elements:', missingElements);
    }
    
    console.log('DOM elements cached:', Object.keys(this.elements));
  }

  // Setup event listeners
  setupEvents() {
    // Search events
    this.elements.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      this.elements.clearSearch.classList.toggle('hidden', !query);
      
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => this.performSearch(query), this.config.searchDelay);
    });

    this.elements.clearSearch.addEventListener('click', () => {
      this.elements.searchInput.value = '';
      this.elements.clearSearch.classList.add('hidden');
      this.performSearch('');
    });

    // Infinite scroll
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - this.config.scrollThreshold) {
        this.loadMoreCustomers();
      }
    });
  }

  // Data loading
  loadData() {
    try {
      if (this.state.isLoading || !this.state.hasMoreData) return;
      
      // Check dependencies
      if (typeof AppLocalStorage === 'undefined') {
        throw new Error('AppLocalStorage is not available');
      }

      if (!window.APP_CONFIG || !window.APP_CONFIG.filters) {
        throw new Error('APP_CONFIG is not properly configured');
      }
      
      this.state.isLoading = true;
      this.showLoading();

      const params = {
        limit: this.config.itemsPerPage,
        offset: this.state.currentPage * this.config.itemsPerPage,
        sort_by: 'date_created',
        sort_order: this.state.sortOrder,
        filters: window.APP_CONFIG.filters
      };

      if (this.state.searchQuery) {
        params.search = this.state.searchQuery;
        params.search_fields = ['customer_name', 'contact_name', 'customer_email', 'customer_phone'];
      }

      console.log('Loading data with params:', params);
      AppLocalStorage.fetchData(JSON.stringify(params), 'dataCallback');
      
    } catch (error) {
      this.state.isLoading = false;
      this.hideLoading();
      alert(`Load Data Error:\n${error.message}\n\nPlease check the console for more details.`);
      console.error('Load Data Error:', error);
      this.showError(error.message);
    }
  }

  // Data callback
  dataCallback(result) {
    try {
      console.log('Data callback received:', result);
      
      this.state.isLoading = false;
      this.hideLoading();

      if (result && result.error) {
        alert(`Data Error:\n${result.error}\n\nPlease check your data source or try refreshing.`);
        this.showError(result.error);
        return;
      }

      if (!result) {
        alert('Warning: Received null/undefined result from AppLocalStorage.\n\nThis might indicate a configuration issue.');
        console.warn('Null result received from AppLocalStorage');
        this.showError('No data received from storage');
        return;
      }

    if (!result || result.length === 0) {
      if (this.state.currentPage === 0) {
        this.showEmpty();
      } else {
        this.state.hasMoreData = false;
        this.hideLoadMore();
        this.showEndIndicator();
      }
      return;
    }

    const customers = result.map(c => ({
      ...c,
      customer_name: c.customer_name || 'Unknown Customer',
      customer_id: c.customer_id || c.id || '',
      id: c.id || c.customer_id || ''
    }));

    if (this.state.currentPage === 0) {
      this.renderCustomers(customers);
    } else {
      this.appendCustomers(customers);
    }

    this.state.loadedCount += customers.length;
    this.state.currentPage++;
    this.updateCount();

    if (result.length < this.config.itemsPerPage) {
      this.state.hasMoreData = false;
      this.hideLoadMore();
      this.showEndIndicator();
    } else {
      this.showLoadMore();
    }

    this.hideEmpty();
  }

  // Render customers
  renderCustomers(customers) {
    this.elements.customersList.innerHTML = customers.map(c => this.createCard(c)).join('');
  }

  appendCustomers(customers) {
    this.elements.customersList.insertAdjacentHTML('beforeend', customers.map(c => this.createCard(c)).join('');
  }

  // Create customer card
  createCard(customer) {
    const name = this.escapeHtml(customer.customer_name);
    const contact = customer.contact_name ? this.escapeHtml(customer.contact_name) : '';
    const email = customer.customer_email ? this.escapeHtml(customer.customer_email) : '';
    const phone = customer.customer_phone ? this.escapeHtml(customer.customer_phone) : '';
    const avatar = this.getAvatar(customer.customer_name, customer.contact_name, customer.image_url);

    return `
      <div class="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-start space-x-3">
          ${avatar}
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-base">${name}</h3>
            ${contact ? `<p class="text-sm text-gray-600">Contact: ${contact}</p>` : ''}
            
            <div class="mt-3 space-y-1 text-sm text-gray-600">
              ${phone ? `<div class="flex items-center"><i class="fas fa-phone w-4 mr-2"></i>${phone}</div>` : ''}
              ${email ? `<div class="flex items-center"><i class="fas fa-envelope w-4 mr-2"></i>${email}</div>` : ''}
              <div class="flex items-center">
                <i class="fas fa-calendar-plus w-4 mr-2"></i>Added: ${this.formatDate(customer.date_created)}
              </div>
            </div>

            <div class="mt-4 flex flex-col items-end space-y-2">
              <div class="flex space-x-2">
                <button onclick="customerManager.viewSalesHistory('${customer.customer_id}')" 
                  class="bg-theme-info text-white px-4 py-2 rounded text-sm hover:opacity-90">
                  Sales History
                </button>
                <button onclick="customerManager.viewDetails('${customer.customer_id}', '${name.replace(/'/g, "\\'")}', '${customer.id}')" 
                  class="bg-theme-success text-white px-4 py-2 rounded text-sm hover:opacity-90">
                  Details
                </button>
              </div>
              <button onclick="customerManager.startNewSale('${customer.task_id || ''}', '${customer.customer_id}')" 
                class="bg-theme-primary text-white px-4 py-2 rounded text-sm hover:opacity-90">
                Start New Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Utility functions
  getAvatar(name, contact, imageUrl) {
    if (imageUrl) {
      return `<img src="${imageUrl}" alt="${this.escapeHtml(name)}" class="w-12 h-12 rounded-full object-cover">`;
    }
    const displayName = contact || name || 'Unknown';
    const letter = displayName.charAt(0).toUpperCase();
    return `<div class="w-12 h-12 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold text-lg">${letter}</div>`;
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // State management
  resetState() {
    this.state.currentPage = 0;
    this.state.hasMoreData = true;
    this.state.loadedCount = 0;
    this.elements.customersList.innerHTML = '';
    this.hideLoadMore();
    this.hideEndIndicator();
  }

  updateCount() {
    const text = this.state.hasMoreData ? `Showing ${this.state.loadedCount}+ customers` : `Showing ${this.state.loadedCount} customers`;
    this.elements.customerCount.textContent = text;
  }

  // UI state functions
  showLoading() { this.elements.loading.classList.remove('hidden'); }
  hideLoading() { this.elements.loading.classList.add('hidden'); }
  showEmpty() { 
    this.elements.empty.classList.remove('hidden'); 
    this.elements.customerCount.textContent = 'No customers found'; 
  }
  hideEmpty() { this.elements.empty.classList.add('hidden'); }
  showLoadMore() { this.elements.loadMore.classList.remove('hidden'); }
  hideLoadMore() { this.elements.loadMore.classList.add('hidden'); }
  showEndIndicator() { this.elements.endIndicator.classList.remove('hidden'); }
  hideEndIndicator() { this.elements.endIndicator.classList.add('hidden'); }

  showError(error) {
    this.elements.customersList.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-3"></i>
        <p class="text-red-600 text-lg font-semibold">Error loading customers</p>
        <p class="text-sm text-gray-500 mt-1">${this.escapeHtml(error)}</p>
        <button onclick="customerManager.refreshData()" class="mt-4 bg-theme-primary text-white py-2 px-4 rounded text-sm">
          Try Again
        </button>
      </div>
    `;
  }

  // Action functions
  performSearch(query) {
    this.state.searchQuery = query;
    this.resetState();
    this.showLoading();
    this.loadData();
  }

  toggleSort() {
    this.state.sortOrder = this.state.sortOrder === 'desc' ? 'asc' : 'desc';
    this.elements.sortText.textContent = this.state.sortOrder === 'desc' ? 'Newest' : 'Oldest';
    this.resetState();
    this.showLoading();
    this.loadData();
  }

  refreshData() {
    const icon = this.elements.refreshBtn.querySelector('i');
    icon.classList.add('fa-spin');
    this.elements.refreshBtn.disabled = true;
    
    this.resetState();
    this.showLoading();
    this.loadData();
    
    setTimeout(() => {
      icon.classList.remove('fa-spin');
      this.elements.refreshBtn.disabled = false;
    }, 1000);
  }

  loadMoreCustomers() {
    this.loadData();
  }

  // Enhanced onUpdate
  handleUpdate(data) {
    if (typeof data === 'object' && data.hasData !== undefined) {
      if (data.hasData) {
        if (this.state.currentPage <= 1 || this.state.loadedCount === 0) {
          this.resetState();
          this.loadData();
        } else {
          this.showNotification();
        }
      } else {
        this.showEmpty();
        this.elements.customersList.innerHTML = '';
      }
    }
  }

  showNotification() {
    const existing = document.getElementById('notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-theme-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 cursor-pointer';
    notification.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>New customers available - Click to refresh';
    document.body.appendChild(notification);
    
    notification.onclick = () => {
      this.resetState();
      this.loadData();
      notification.remove();
    };
    
    setTimeout(() => notification.remove(), 5000);
  }

  // Navigation functions
  navigateToScreen(screenId, args = {}, get = {}, screenNumber = "", postBody = "") {
    try {
      if (typeof App === 'undefined' || !App.callActionButton) {
        throw new Error('App framework is not available or callActionButton method is missing');
      }

      const actionData = {
        actionID: 99, orderNumber: 1, type: "act_dm_view", label: "no label",
        screen: screenNumber || "", alias: `fusesellai_${screenId}`, args
      };
      if (postBody) actionData.post = postBody;
      if (Object.keys(get).length > 0) actionData.get = get;
      
      console.log('Navigating with action data:', actionData);
      App.callActionButton(JSON.stringify(actionData));
    } catch (error) {
      alert(`Navigation Error:\n${error.message}\n\nScreen: ${screenId}`);
      console.error('Navigation Error:', error);
    }
  }

  openGoogleSheet() {
    this.navigateToScreen('fusesellai02obj802', {});
  }

  viewDetails(customerId, customerName, customerRecordId) {
    App.callActionButton(JSON.stringify({
      actionID: 24703, orderNumber: 1, type: "act_dm_view", label: "Details",
      alias: "fusesellai_fusesellai02obj801",
      args: { customerId, customerName },
      get: { filter: `{"_and":[{"id":{"_eq":"${customerRecordId}"}}]}` }
    }));
  }

  viewSalesHistory(customerId) {
    App.callActionButton(JSON.stringify({
      actionID: 24701, orderNumber: 1, visible: "true", type: "act_dm_view",
      label: "Sales History", alias: "fusesellai_fusesellai02obj10",
      args: { customerId },
      post: window.APP_CONFIG.salesHistoryQuery.replace('${customerId}', customerId)
    }));
  }

  startNewSale(taskId, customerId) {
    App.callActionButton(JSON.stringify({
      actionID: 24702, orderNumber: 1, type: "act_fill_form",
      label: "Start New Sale with Another Team", familyID: "GS_INIT_PLAN",
      preload: [{ key: "task_id", value: taskId }, { key: "customer_id", value: customerId }]
    }));
  }
}

// Note: customerManager variable is declared globally in the HTML file