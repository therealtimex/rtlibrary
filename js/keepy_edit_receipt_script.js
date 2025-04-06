// Function to convert input JSON to receipt data format
    function convertInputJsonToReceiptData(jsonData) {
        const convertedData = {
            title: "Receipt Details",
            imageUrl: jsonData["Image Link"] || "",
            fields: [],
           webhookUrl: "https://workflow.realtimex.co/api/v1/executions/webhook/flowai/keepy_initial_document_processor/input"
        };

        for (const [key, value] of Object.entries(jsonData)) {
            if (key === "Image Link") continue;

            let type = "text";
            let step = null;
            if (key === "Amount") {
                type = "number";
                step = "0.01";
            } else if (key === "Transaction date") {
                type = "date";
            } else if (key === "Currency") {
                type = "select";
            } else if (key === "Status" || key === "Spend Category" || key === "Tax Categories (experimental)") {
                type = "select";
            }

            const preserveKeys = ["Tax Categories (experimental)", "Receipt Received time (UTC)", "Ref no (internal use)"];
            const id = preserveKeys.includes(key) ? key : key.replace(/[ ()]/g, '_');
            const label = key;
            const placeholder = `Enter ${key.toLowerCase()}`;

            const field = {
                id,
                label,
                type,
                value: value || "",
                placeholder
            };

            if (key === "Receipt Received time (UTC)" || key === "Ref no (internal use)") {
                field.readonly = true;
            }

            if (step) field.step = step;
            if (key === "Transaction date") {
                field.required = true;
                field.errorMessage = "Please enter a valid date";
            }
            if (key === "Amount") {
                field.required = true;
                field.errorMessage = "Please enter a valid amount";
            }
            if (key === "Currency") {
                field.required = true;
                field.errorMessage = "Please select a currency";
            }

            convertedData.fields.push(field);
        }

        const categoryField = {
            id: "category",
            label: "Category",
            type: "select",
            value: "",
            placeholder: "Select category"
        };
        const insertIndex = convertedData.fields.findIndex(field =>
            field.label === "Receipt Received time (UTC)" || field.label === "Ref no (internal use)"
        );
        if (insertIndex !== -1) {
            convertedData.fields.splice(insertIndex, 0, categoryField);
        } else {
            convertedData.fields.push(categoryField);
        }

        return convertedData;
    }

    // Initialize receipt data from input JSON
    let receiptData = convertInputJsonToReceiptData(inputJson);

    // Check if we're in admin mode (add ?admin=true to URL)
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true';

    if (isAdminMode) {
        document.body.classList.add('admin-mode');
        document.getElementById('jsonEditor').style.display = 'block';
        document.getElementById('jsonEditor').value = JSON.stringify(inputJson, null, 2);
    }

    // Generate form fields from JSON here
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
                   'Employee wages', 'Employee education expenses', 'Employee benefits', 'Rent or lease payments', 'Taxes for leased business property', 'Business interest on the debt for trade or business', 'Payroll taxes', 'Excise taxes', 'Personal property taxes', 'Insurance premiums', 'Self-employed health insurance', 'Business startup costs and organizational costs', 'Bad business debts', 'Travel, meals, and lodging to employees', 'Advertising and marketing costs', 'Car and truck expenses', 'Charitable contributions', 'Club dues and membership fees', 'Franchise, trademark, and trade name', 'Interview expense allowances', 'Legal and professional fees', 'Tax preparation fees', 'License and permits', 'Penalties and fines', 'Repairs', 'Subscriptions', 'Supplies and materials', 'Utilities', 'Depreciable assets', 'Payments to 1099 contractors', 'Home office', 'Client gifts', 'Continuing education', '401(k) plan contributions', 'Removal of barriers for the disabled'
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
    const esQuery = { "size": 100, "collapse": { "field": "ai_context_id.keyword" }, "sort": [{ "submission_date": { "order": "desc" } }], "query": { "bool": { "must": [{ "term": { "user_email_sso.keyword": { "value": userEmail } } }] } }, "_source": { "includes": ["ai_context_id", "context_alias", "crm_title"] } };

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

    // Utility: supported file extensions check
    const supportedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'];

    function isSupportedFile(url) {
        const lowerUrl = url.toLowerCase();
        return supportedExtensions.some(ext => lowerUrl.endsWith(ext));
    }

    function updateViewImageBtnVisibility() {
        const viewImageBtn = document.getElementById('viewImageBtn');
        if (receiptData.imageUrl && isSupportedFile(receiptData.imageUrl)) {
            viewImageBtn.style.display = 'block';
        } else {
            viewImageBtn.style.display = 'none';
        }
    }

    // Initialize the form
    generateFormFields(receiptData);
    updateViewImageBtnVisibility();
    fetchCategories(userEmail,contextID=contextid);

    // Toggle JSON Editor
    const toggleJsonEditor = document.getElementById('toggleJsonEditor');
    const jsonEditor = document.getElementById('jsonEditor');

    toggleJsonEditor.addEventListener('click', function() {
        if (jsonEditor.style.display === 'none' || jsonEditor.style.display === '') {
            jsonEditor.style.display = 'block';
            toggleJsonEditor.textContent = 'Hide JSON Editor';
        } else {
            jsonEditor.style.display = 'none';
            toggleJsonEditor.textContent = 'Show JSON Editor';
        }
    });

    // Apply JSON button
    const applyJsonBtn = document.getElementById('applyJsonBtn');

    applyJsonBtn.addEventListener('click', function() {
        try {
            const jsonData = JSON.parse(jsonEditor.value);
            const convertedData = convertInputJsonToReceiptData(jsonData);

            // Cập nhật dữ liệu và giao diện
            receiptData = convertedData;
            generateFormFields();
            alert('JSON applied successfully!');
        } catch (error) {
            alert('JSON Error: ' + error.message);
        }
    });

    // Image modal
    const imageModal = document.getElementById('imageModal');
    const viewImageBtn = document.getElementById('viewImageBtn');
    const closeBtn = document.getElementsByClassName('close')[0];
    closeBtn.addEventListener('click', function() {
        imageModal.style.display = 'none';
    });


    viewImageBtn.addEventListener('click', function() {
        const url = receiptData.imageUrl;
        const lowerUrl = url.toLowerCase();

        // Get the modal content area and clear previous content
        const modalContent = document.querySelector('#imageModal .modal-content');
        modalContent.innerHTML = '';

        if (lowerUrl.endsWith('.pdf')) {
            // For PDF, use an iframe
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = "100%";
            iframe.style.height = "80vh"; // Adjust height as needed
            iframe.style.border = "none";
            modalContent.appendChild(iframe);

        } else if (
           lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.gif') || lowerUrl.endsWith('.bmp') || lowerUrl.endsWith('.svg')
        ) {
            // For images, use an <img> element
            const img = document.createElement('img');
            img.src = url;
            img.className = "modal-image";
            img.style.width = "100%";
            img.style.height = "auto";
            modalContent.appendChild(img);

        } else {
            // For unsupported file types, show a message
            modalContent.innerHTML = '<p>File type not supported for display.</p>';
        }

        imageModal.style.display = 'block';
    });



    window.addEventListener('click', function(event) {
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });

    // Review modal
    const reviewModal = document.getElementById('reviewModal');
    const reviewBtn = document.getElementById('reviewButton');
    const reviewCloseBtn = document.getElementsByClassName('review-close')[0];
    const closeReviewBtn = document.getElementById('closeReviewBtn');

    // API Info modal
    const apiInfoModal = document.getElementById('apiInfoModal');
    const apiCloseBtn = document.getElementsByClassName('api-close')[0];
    apiCloseBtn.addEventListener('click', function() {
        apiInfoModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === apiInfoModal) {
            apiInfoModal.style.display = 'none';
        }
    });
    
    // generate review here
    reviewBtn.addEventListener('click', function() {
        generateReviewContent(receiptData);
        reviewModal.style.display = 'block';
    });
    // Add event listener for the close (X) button in Review modal
    document.getElementsByClassName('review-close')[0].addEventListener('click', function() {
        reviewModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === reviewModal) {
            reviewModal.style.display = 'none';
        }
    });

    // Form validation
    document.getElementById('receiptForm').addEventListener('submit', function(e) {
        e.preventDefault();

        let isValid = true;

        // Validate required fields
        receiptData.fields.forEach(field => {
            if (field.required) {
                const element = document.getElementById(field.id);
                const errorElement = document.getElementById(`${field.id}-error`);

                if (!element.value) {
                    if (errorElement) {
                        errorElement.style.display = 'block';
                    }
                    isValid = false;
                } else {
                    if (errorElement) {
                        errorElement.style.display = 'none';
                    }
                }
            }
        });

        if (isValid) {
            // Here you would normally send the data to your backend
            alert('Dữ liệu đã được lưu thành công!');
        }
    });

    // Sync button - gọi API webhook
    document.getElementById('syncButton').addEventListener('click', function() {
        // Validate required fields
        let isValid = true;
        receiptData.fields.forEach(field => {
            if (field.required) {
                const element = document.getElementById(field.id);
                if (!element.value || element.value.trim() === '') {
                    isValid = false;
                    const errorElement = document.getElementById(`${field.id}-error`);
                    if (errorElement) {
                        errorElement.style.display = 'block';
                    }
                } else {
                    const errorElement = document.getElementById(`${field.id}-error`);
                    if (errorElement) {
                        errorElement.style.display = 'none';
                    }
                }
            }
        });
        if (!isValid) {
            return;
        }
        const output = {};
        receiptData.fields.forEach(field => {
            const element = document.getElementById(field.id);
            const preserveKeys = ["Tax Categories (experimental)", "Receipt Received time (UTC)", "Ref no (internal use)"];
            let originalKey = field.id;
            if (!preserveKeys.includes(field.id)) {
                originalKey = field.id.replace(/_/g, ' ');
            }
            if (element) {
                if (field.type === 'number' && element.value !== "") {
                    output[originalKey] = parseFloat(element.value);
                } else {
                    output[originalKey] = element.value;
                }
                // If the field is 'category', also store the category name
                if (field.id === "category") {
                    const selectedOption = element.options[element.selectedIndex];
                    if (selectedOption) {
                        output["categoryName"] = selectedOption.text;
                    }
                }
            }
        });
        const data = {
            metadata: inputMetadata,
            context_id: contextid,
            context_name: contextname,
            operation_id: operationid,
            session_id: sessionid,
            output: output
        };
        const syncStatus = document.getElementById('syncStatus');
        syncStatus.style.display = 'block';
        syncStatus.style.backgroundColor = '#FFF9C4';
        syncStatus.textContent = 'Syncing data...';
        document.getElementById('syncDetails').textContent = 'Sending your updates to the system...';
        document.getElementById('apiStatus').textContent = 'Processing...';
        document.getElementById('apiStatus').style.color = '#FFC107';
        document.getElementById('syncDetails').textContent = 'Hệ thống đã tiếp nhận yêu cầu và sẽ cập nhật khi xong';
        apiInfoModal.style.display = 'block';
        console.log('Calling webhook with data:', data);
        console.log('Webhook URL:', receiptData.webhookUrl);

        fetch(receiptData.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.text())
            .then(text => {
                console.log('Raw response:', text);

                document.getElementById('apiStatus').textContent = 'Completed';
                document.getElementById('apiStatus').style.color = '#4CAF50';
                try {
                    const json = JSON.parse(text);
                    let responseMessage = 'The system has received your update request and is currently processing it.';
                    if (json.id) {
                        responseMessage += `<div style="margin-top: 10px;">Reference ID: ${json.id}</div>`;
                    }

                    document.getElementById('syncDetails').innerHTML = responseMessage;
                    const syncStatus = document.getElementById('syncStatus');
                    syncStatus.style.backgroundColor = '#E8F5E9';
                    syncStatus.textContent = 'Update successful! Your changes have been saved.';
                    setTimeout(() => {
                        syncStatus.style.display = 'none';
                    }, 5000);
                } catch (e) {
                    console.log('Not JSON format:', e);
                    document.getElementById('syncDetails').textContent = 'Update completed, but system details are not available.';
                }
            })
            .catch(error => {
                console.error('Error:', error);

                // Cập nhật thông báo lỗi
                const syncStatus = document.getElementById('syncStatus');
                syncStatus.style.backgroundColor = '#FFEBEE';
                syncStatus.textContent = 'Update failed. Please try again later.';
                setTimeout(() => {
                    syncStatus.style.display = 'none';
                }, 5000);

                // Cập nhật thông báo lỗi trong modal
                document.getElementById('apiStatus').textContent = 'Failed';
                document.getElementById('apiStatus').style.color = '#F44336'; // Error color
                document.getElementById('syncDetails').textContent = 'The system could not process your request at this time. Please try again later or contact support if the problem persists.';
            });
    });

