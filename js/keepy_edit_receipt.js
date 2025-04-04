// Generate form fields from JSON
function generateFormFields(receiptData) {
    const dynamicFields = document.getElementById('dynamicFields');
    dynamicFields.innerHTML = '';

    // Set image URL
    document.getElementById('receiptImage').src = receiptData.imageUrl;

    // Generate fields
    receiptData.fields.forEach(field => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'field-group';

        const fieldLabel = document.createElement('div');
        fieldLabel.className = 'field-label';
        fieldLabel.textContent = field.label;

        let fieldInput;

        if (field.type === 'select') {
            // Create a select element for dropdown
            fieldInput = document.createElement('select');
            fieldInput.className = 'field-value';
            fieldInput.id = field.id;

            // Add options for dropdowns
            if (field.id === 'Status') {
                const options = ['Active', 'Inactive'];
                options.forEach(optionValue => {
                    const option = document.createElement('option');
                    option.value = optionValue;
                    option.textContent = optionValue;
                    option.selected = field.value === optionValue;
                    fieldInput.appendChild(option);
                });
            } else if (field.id === 'Spend_Category') {
                const options = [
                    'Automotive & Gas',
                    'Merchandise & Inventory',
                    'Office & Shipping',
                    'Utilities & Rent',
                    'Repairs & Maintenance',
                    'Meals & Entertainment',
                    'Travel',
                    'Professional Services',
                    'Education, Health & Wellness',
                    'Miscellaneous'
                ];
                options.forEach(optionValue => {
                    const option = document.createElement('option');
                    option.value = optionValue;
                    option.textContent = optionValue;
                    option.selected = field.value === optionValue;
                    fieldInput.appendChild(option);
                });
            } else if (field.id.includes('Tax_Categories')) {
                const options = [
                    'Employee wages',
                    'Employee education expenses',
                    'Employee benefits',
                    'Rent or lease payments',
                    'Taxes for leased business property',
                    'Business interest on the debt for trade or business',
                    'Payroll taxes',
                    'Excise taxes',
                    'Personal property taxes',
                    'Insurance premiums',
                    'Self-employed health insurance',
                    'Business startup costs and organizational costs',
                    'Bad business debts',
                    'Travel, meals, and lodging to employees',
                    'Advertising and marketing costs',
                    'Car and truck expenses',
                    'Charitable contributions',
                    'Club dues and membership fees',
                    'Franchise, trademark, and trade name',
                    'Interview expense allowances',
                    'Legal and professional fees',
                    'Tax preparation fees',
                    'License and permits',
                    'Penalties and fines',
                    'Repairs',
                    'Subscriptions',
                    'Supplies and materials',
                    'Utilities',
                    'Depreciable assets',
                    'Payments to 1099 contractors',
                    'Home office',
                    'Client gifts',
                    'Continuing education',
                    '401(k) plan contributions',
                    'Removal of barriers for the disabled'
                ];
                options.forEach(optionValue => {
                    const option = document.createElement('option');
                    option.value = optionValue;
                    option.textContent = optionValue;
                    option.selected = field.value === optionValue;
                    fieldInput.appendChild(option);
                });
            } else if (field.id === 'Currency') {
                const options = ['USD', 'VND', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'SGD', 'HKD', 'NZD', 'MXN', 'BRL', 'CHF', 'SEK', 'NOK', 'DKK', 'RUB', 'TRY', 'ZAR', 'KRW'];
                options.forEach(optionValue => {
                    const option = document.createElement('option');
                    option.value = optionValue;
                    option.textContent = optionValue;
                    option.selected = field.value === optionValue;
                    fieldInput.appendChild(option);
                });
            }

            if (field.readonly) {
                fieldInput.disabled = true;
                fieldInput.style.backgroundColor = '#f5f5f5';
                fieldInput.style.color = '#666';
                fieldInput.style.cursor = 'not-allowed';
            }
        } else {
            // Create a regular input element
            fieldInput = document.createElement('input');
            fieldInput.type = field.type;
            fieldInput.className = 'field-value';
            fieldInput.id = field.id;
            fieldInput.value = field.value || '';
            if (field.placeholder) {
                fieldInput.placeholder = field.placeholder;
            }
            if (field.step) {
                fieldInput.step = field.step;
            }
            if (field.readonly) {
                fieldInput.setAttribute('readonly', true);
                fieldInput.style.backgroundColor = '#f5f5f5';
                fieldInput.style.color = '#666';
                fieldInput.style.cursor = 'not-allowed';
            }
        }

        fieldGroup.appendChild(fieldLabel);
        fieldGroup.appendChild(fieldInput);

        // Add error message if needed
        if (field.errorMessage) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.id = `${field.id}-error`;
            errorMessage.textContent = "⚠️ " + field.errorMessage;
            fieldGroup.appendChild(errorMessage);
        }

        dynamicFields.appendChild(fieldGroup);
    });
}

// Fetch category by user email
function fetchCategories(userEmail,contextID) {
    const esQuery = {
        "size": 100,
        "collapse": {
            "field": "ai_context_id.keyword"
        },
        "sort": [{
            "submission_date": {
                "order": "desc"
            }
        }],
        "query": {
            "bool": {
                "must": [{
                    "term": {
                        "user_email_sso.keyword": {
                            "value": userEmail
                        }
                    }
                }]
            }
        },
        "_source": {
            "includes": ["ai_context_id", "context_alias", "crm_title"]
        }
    };

    fetch('https://es.rta.vn/ai_context_llm/_search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(esQuery)
        })
        .then(response => response.json())
        .then(data => {
            const options = [];
            if (data.hits && data.hits.hits) {
                data.hits.hits.forEach(hit => {
                    const source = hit._source;
                    // Use ai_context_id instead of context_alias for the option ID
                    options.push({
                        id: source.ai_context_id,
                        name: source.crm_title
                    });
                });
            }
            const categorySelect = document.getElementById("category");
            if (categorySelect) {
                // Clear any existing options
                categorySelect.innerHTML = "";
                // Add a default option
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Select category";
                categorySelect.appendChild(defaultOption);
                // Add options from the query result
                options.forEach(option => {
                    const opt = document.createElement("option");
                    opt.value = option.id;
                    opt.textContent = option.name;
                    categorySelect.appendChild(opt);
                });
                // Set default selected value to the contextid constant
                categorySelect.value = contextID;
            }
        })
        .catch(err => {
            console.error("Error fetching categories:", err);
        });
}


// Generate review content
function generateReviewContent(receiptData) {
    const reviewContent = document.getElementById('reviewContent');
    reviewContent.innerHTML = '';

    // Get all field values
    const fieldValues = {};
    receiptData.fields.forEach(field => {
        const element = document.getElementById(field.id);
        fieldValues[field.id] = element ? element.value : '';
    });

    // Create HTML for review content
    receiptData.fields.forEach(field => {
        const item = document.createElement('div');
        item.className = 'review-item';

        const label = document.createElement('div');
        label.className = 'review-label';
        label.textContent = field.label;

        const value = document.createElement('div');
        value.className = 'review-value';
        value.textContent = fieldValues[field.id];

        item.appendChild(label);
        item.appendChild(value);
        reviewContent.appendChild(item);
    });
}

