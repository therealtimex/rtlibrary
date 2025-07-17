const translations = {
    vi: {
        pageTitle: "Biên Lai Xác Nhận Thanh Toán",
        subtitle: "Cảm ơn quý khách đã thanh toán!",
        downloadPdf: "Tải PDF",
        storeInfo: "Thông tin cửa hàng",
        storeName: "Tên cửa hàng:",
        storeAddress: "Địa chỉ:",
        storePhone: "Điện thoại:",
        storeEmail: "Email:",
        storeTaxCode: "Mã số thuế:",
        customerInfo: "Thông tin khách hàng",
        customerName: "Họ và tên:",
        customerPhone: "Số điện thoại:",
        customerEmail: "Email:",
        customerAddress: "Địa chỉ:",
        repairOrderInfo: "Thông tin đơn sửa chữa",
        repairTicketId: "Mã phiếu sửa chữa:",
        ticketCreatedDate: "Ngày tạo phiếu:",
        repairCompletedDate: "Ngày hoàn tất sửa chữa:",
        device: "Thiết bị:",
        issueDescription: "Mô tả lỗi:",
        technician: "Kỹ thuật viên:",
        serviceDetails: "Chi tiết dịch vụ",
        quantity: "Số lượng:",
        noServicesFound: "Không có dịch vụ nào được tìm thấy.",
        discountAndTax: "Giảm giá & Thuế",
        discount: "Giảm giá:",
        tax: "Thuế:",
        paymentInfo: "Thông tin thanh toán",
        paymentMethod: "Hình thức thanh toán:",
        paymentTime: "Thời gian thanh toán:",
        amountTransferred: "Số tiền đã thanh toán:",
        note: "Ghi chú:",
        totalCost: "Tổng chi phí:",
        paymentConfirmed: "Đã nhận thanh toán",
        confirmedBy: "Người xác nhận:",
        invoiceUrl: "Hóa đơn URL:",
        thankYou: "Cảm ơn quý khách!",
        errorLoadingData: "Đã xảy ra lỗi khi tải dữ liệu biên lai.",
        noTicketId: "Lỗi: Không có mã phiếu sửa chữa.",
        noInvoiceFound: "Không tìm thấy thông tin hóa đơn cho mã phiếu:",
        currencyUnit: "VND", 
        loadingDataError: "Error fetching data from API.",
        pleaseWait: "Dữ liệu biên lai chưa được tải. Vui lòng đợi.",
        },
    en: {
        pageTitle: "Payment Confirmation Receipt",
        subtitle: "Thank you for your payment!",
        downloadPdf: "Download PDF",
        storeInfo: "Store Information",
        storeName: "Store Name:",
        storeAddress: "Address:",
        storePhone: "Phone:",
        storeEmail: "Email:",
        storeTaxCode: "Tax Code:",
        customerInfo: "Customer Information",
        customerName: "Full Name:",
        customerPhone: "Phone Number:",
        customerEmail: "Email:",
        customerAddress: "Address:",
        repairOrderInfo: "Repair Order Information",
        repairTicketId: "Ticket ID:",
        ticketCreatedDate: "Creation Date:",
        repairCompletedDate: "Completion Date:",
        device: "Device:",
        issueDescription: "Issue:",
        technician: "Technician:",
        serviceDetails: "Service Details",
        quantity: "Quantity:",
        noServicesFound: "No services found.",
        discountAndTax: "Discount & Tax",
        discount: "Discount:",
        tax: "Tax:",
        paymentInfo: "Payment Information",
        paymentMethod: "Payment Method:",
        paymentTime: "Payment Time:",
        amountTransferred: "Amount Transferred:",
        note: "Note:",
        totalCost: "Total Cost:",
        paymentConfirmed: "Payment Confirmed",
        confirmedBy: "Confirmed By:",
        invoiceUrl: "Invoice URL:",
        thankYou: "Thank you!",
        errorLoadingData: "An error occurred while loading receipt data.",
        noTicketId: "Error: No repair ticket ID provided.",
        noInvoiceFound: "No Receipt details found for ticket ID:",
        currencyUnit: "USD", 
        loadingDataError: "Error fetching data from API.",
        pleaseWait: "Receipt data not loaded yet. Please wait.",
        }
};


// Function to format currency
function formatCurrency(amount, currency) {
    const langCode = currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(langCode).format(amount) + ' ' + currency;
}

// Function to format date based on language
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const langCode = currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
    return date.toLocaleDateString(langCode);
}

// Function to format datetime based on language
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const langCode = currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
    return date.toLocaleString(langCode);
}

// Function to fetch data and populate the receipt
async function loadAndPopulateData(ticketId) {
    const lang = translations[currentLanguage];
    if (!ticketId) {
        console.error(lang.noTicketId);
        document.body.innerHTML = `<h1>${lang.noTicketId}</h1>`;
        return;
    }

    
    const repairDetailsQuery = {
        "size": 1, "collapse": { "field": "session_id.keyword" }, "sort": [{ "timestamp.keyword": "desc" }],
        "_source": { "excludes": ["__system_update_timestamp__"] },
        "query": { "bool": { "must": [
            { "terms": { "event_type.keyword": ["CS-UPDATE"] } },
            { "term": { "output.event_type.keyword": { "value": "CS_INVOICE" } } },
            { "term": { "output.data_formatted.order_id.keyword": { "value": ticketId } } }
        ]}}
    };

    const orderQueryBody = {
        "size": 1, "collapse": { "field": "session_id.keyword" }, "sort": [{ "timestamp.keyword": "desc" }],
        "_source": { "excludes": ["__system_update_timestamp__"] },
        "query": { "bool": {
            "must": [
                { "terms": { "event_type.keyword": ["CS-ORD"] } },
                { "term": { "output.data_formatted.order_id.keyword": { "value": ticketId } } }
            ],
            "must_not": [
                { "terms": { "output.data_formatted.current_status.keyword": ["Closed", "Close", "close", "closed", "Đóng", "đóng", "Customer Replied", "Sent SMS"] } },
                { "terms": { "session_name.keyword": ["Processing-Done"] } }
            ]
        }}
    };

    const GenerateReceiptnQuery = {
        "size": 1, "collapse": { "field": "session_id.keyword" }, "sort": [{ "timestamp.keyword": "desc" }],
        "_source": { "excludes": ["__system_update_timestamp__"] },
        "query": { "bool": { "must": [
            { "terms": { "event_type.keyword": ["CS-UPDATE"] } },
            { "term": { "output.data_formatted.current_status.keyword": { "value": "Generate Receipt" } } },
            { "term": { "output.data_formatted.order_id.keyword": { "value": ticketId } } }
        ]}}
    };

    const paymentQueryBody = {
        "size": 1,
        "collapse": {
            "field": "session_id.keyword"
        },
        "sort": [{
            "__system_update_timestamp__": "desc"
        }],
        "query": {
            "bool": {
                "must": [{
                    "terms": {
                        "session_id.keyword": ["CS-PAYMENT"]
                    }
                }, {
                    "term": {
                        "event_type.keyword": {
                            "value": "CS-SETTINGS"
                        }
                    }
                }, {
                    "bool": {
                        "should": [{
                            "terms": {
                                "metadata.org_id.keyword": [orgId]
                            }
                        }]
                    }
                }]
            }
        }
    };

    try {
        const [repairResponse, orderResponse, paymentResponse, GenerateReceiptnResponse] = await Promise.all([
            fetch( API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(repairDetailsQuery) }),
            fetch( API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderQueryBody) }),
            fetch( API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(paymentQueryBody) }),
            fetch( API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(GenerateReceiptnQuery) })
        ]);

        if (!repairResponse.ok || !orderResponse.ok || !GenerateReceiptnResponse.ok || !paymentResponse.ok) {
            console.error(lang.loadingDataError);
            document.body.innerHTML = `<h1>${lang.errorLoadingData} ${ticketId}</h1>`;
            return;
        }

        const repairDetailsData = await repairResponse.json();
        console.log("repairDetailsData:", JSON.stringify(repairDetailsData));
        const orderData = await orderResponse.json();
        console.log("orderData:", JSON.stringify(orderData));
        const paymentData = await paymentResponse.json();
        console.log("paymentData:", JSON.stringify(paymentData));
        const GenerateReceiptnData = await GenerateReceiptnResponse.json();
        console.log("GenerateReceiptnData:", JSON.stringify(GenerateReceiptnData));
        const repairInfo = repairDetailsData.hits?.hits[0]?._source.output.data_formatted || {};
        const customerInfo = orderData.hits?.hits[0]?._source.output.data_formatted || {};
        const storeInfo = paymentData.hits?.hits[0]?._source.output.data_formatted || {};
        const GenerateReceiptnInfo = GenerateReceiptnData.hits?.hits[0]?._source.output.data_formatted || {};

        if (Object.keys(GenerateReceiptnInfo).length === 0) {
            console.error(lang.noInvoiceFound, ticketId);
            document.body.innerHTML = `<h1>${lang.noInvoiceFound} ${ticketId}</h1>`;
            return;
        }

        receiptData = {
            // Store info
            storeName: storeInfo.store_name || storeInfo.data?.store_name || "",
            storeAddress: storeInfo.store_address || storeInfo.data?.store_address || "",
            storePhone: storeInfo.store_phone_number || storeInfo.data?.store_phone_number || "",
            storeEmail: storeInfo.store_email || storeInfo.data?.store_email || "",
            storeTaxCode: "",
            
            // Customer info
            customerName: customerInfo.customer_name || "",
            customerPhone: customerInfo.customer_phone || "",
            customerEmail: customerInfo.customer_email || "",
            customerAddress: customerInfo.customer_address || "",
            
            // Repair info
            ticketId: ticketId,
            ticketCreatedDate: customerInfo.created_date || new Date().toISOString(),
            repairCompletedDate: repairInfo.invoice_date || new Date().toISOString(),
            deviceName: [customerInfo.device_brand, customerInfo.device_model, customerInfo.device_type].filter(Boolean).join('-') || "",
            deviceIssue: customerInfo.customer_reported_issue || "",
            technicianName: customerInfo.technician_name || "",

            // Payment info
            paymentMethod: GenerateReceiptnInfo.payment_method || "",
            paidDatetime: GenerateReceiptnInfo.paid_datetime || "",
            amountTransferred: GenerateReceiptnInfo.amount_transferred || 0,
            paymentNote: GenerateReceiptnInfo.note || "",
            discount: repairInfo.discount,
            tax: repairInfo.tax,
            // Service items and totals
            items: repairInfo.items || [],
            totalAmount: parseFloat(repairInfo.total_amount || 0),
            
            // Additional info
            confirmedBy: GenerateReceiptnInfo.confirmed_by || "",
            languageEmail: customerInfo.language_email || 'vi',
            currency: repairInfo.currency || 'USD'
        };

        populateReceipt(receiptData);

    } catch (error) {
        console.error("Failed to load or populate data:", error);
        document.body.innerHTML = `<h1>${lang.errorLoadingData}</h1>`;
    }
}

function populateReceipt(data) {
    const lang = translations[currentLanguage];

    document.title = `${lang.pageTitle} ${data.ticketId}`;
    document.getElementById('page-title').textContent = lang.pageTitle;
    document.getElementById('receipt-title').textContent = lang.pageTitle;
    document.getElementById('receipt-subtitle').textContent = lang.subtitle;
    document.querySelector('.pdf-download-btn').setAttribute('data-after', lang.downloadPdf); // Update tooltip

    // Store info
    document.getElementById('store-info-title').textContent = lang.storeInfo;
    document.getElementById('label-store-name').textContent = lang.storeName;
    document.getElementById('label-store-address').textContent = lang.storeAddress;
    document.getElementById('label-store-phone').textContent = lang.storePhone;
    document.getElementById('label-store-email').textContent = lang.storeEmail;
    // document.getElementById('label-store-tax-code').textContent = lang.storeTaxCode;
    document.getElementById('store-name').textContent = data.storeName || "";
    document.getElementById('store-address').textContent = data.storeAddress || "";
    document.getElementById('store-phone').textContent = data.storePhone || "";
    document.getElementById('store-email').textContent = data.storeEmail || "";
    // document.getElementById('store-tax-code').textContent = data.storeTaxCode|| "";
    
    // Customer info
    document.getElementById('customer-info-title').textContent = lang.customerInfo;
    document.getElementById('label-customer-name').textContent = lang.customerName;
    document.getElementById('label-customer-phone').textContent = lang.customerPhone;
    document.getElementById('label-customer-email').textContent = lang.customerEmail;
    document.getElementById('label-customer-address').textContent = lang.customerAddress;
    document.getElementById('customer-name').textContent = data.customerName || "";
    document.getElementById('customer-phone').textContent = data.customerPhone || "";
    document.getElementById('customer-email').textContent = data.customerEmail || "";
    document.getElementById('customer-address').textContent = data.customerAddress || "";
    
    // Repair info
    document.getElementById('repair-order-info-title').textContent = lang.repairOrderInfo;
    document.getElementById('label-repair-ticket-id').textContent = lang.repairTicketId;
    document.getElementById('label-ticket-created-date').textContent = lang.ticketCreatedDate;
    document.getElementById('label-repair-completed-date').textContent = lang.repairCompletedDate;
    document.getElementById('label-device-name').textContent = lang.device;
    document.getElementById('label-device-issue').textContent = lang.issueDescription;
    document.getElementById('label-technician-name').textContent = lang.technician;
    document.getElementById('repair-ticket-id').textContent = data.ticketId || "";
    document.getElementById('ticket-created-date').textContent = formatDate(data.ticketCreatedDate);
    document.getElementById('repair-completed-date').textContent = formatDate(data.repairCompletedDate);
    document.getElementById('device-name').textContent = data.deviceName || "";
    document.getElementById('device-issue').textContent = data.deviceIssue || "";
    document.getElementById('technician-name').textContent = data.technicianName || "";

    // Service Items
    document.getElementById('service-details-title').textContent = lang.serviceDetails;
    // Discount and Tax
    // document.getElementById('discount-tax-title').textContent = lang.discountAndTax;
    document.getElementById('label-discount').textContent = lang.discount;
    document.getElementById('label-tax').textContent = lang.tax;
    document.getElementById('discount-amount').textContent = formatCurrency(data.discount, data.currency);
    document.getElementById('tax-amount').textContent = formatCurrency(data.tax, data.currency);

    // Payment info
    document.getElementById('payment-info-title').textContent = lang.paymentInfo;
    document.getElementById('label-payment-method').textContent = lang.paymentMethod;
    document.getElementById('label-paid-datetime').textContent = lang.paymentTime;
    document.getElementById('label-amount-transferred').textContent = lang.amountTransferred;
    document.getElementById('label-payment-note').textContent = lang.note;
    document.getElementById('payment-method').textContent = data.paymentMethod || "";
    document.getElementById('paid-datetime').textContent = formatDateTime(data.paidDatetime);
    document.getElementById('amount-transferred').textContent = formatCurrency(data.amountTransferred, data.currency);
    document.getElementById('payment-note').textContent = data.paymentNote || "";
    document.getElementById('payment-confirmed-text').textContent = lang.paymentConfirmed;
    document.getElementById('label-confirmed-by').textContent = lang.confirmedBy;
    document.getElementById('confirm-person-name').textContent = data.confirmedBy || "";


    // Format total amount
    document.getElementById('label-total-cost').textContent = lang.totalCost;
    const formattedTotalAmount = formatCurrency(data.totalAmount, data.currency);
    document.getElementById('total-amount').textContent = formattedTotalAmount;

    // Populate service items
    const itemsContainer = document.getElementById('service-items');
    itemsContainer.innerHTML = '';
    if (data.items.length > 0) {
        data.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'service-item';
            itemElement.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${lang.quantity}: ${item.quantity}</p>
                </div>
                <div class="item-price">${formatCurrency(parseFloat(item.amount || 0), data.currency)}</div>
            `;
            itemsContainer.appendChild(itemElement);
        });
    } else {
        itemsContainer.innerHTML = `<div class="service-item"><p>${lang.noServicesFound}</p></div>`;
    }

    // Update language toggle button text
    document.getElementById('lang-toggle-btn').textContent = currentLanguage === 'vi' ? 'English' : 'Tiếng Việt';
}

function generatePDF() {
    const lang = translations[currentLanguage];
    if (!receiptData || !receiptData.ticketId) {
        alert(lang.pleaseWait);
        return;
    }

    const element = document.querySelector('.card');
    const body = document.body;

    // Add a class to the body to force desktop layout for PDF generation
    body.classList.add('pdf-export');

    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `receipt-${receiptData.ticketId}-${currentLanguage}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, logging: true, dpi: 192, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate PDF from the element
    html2pdf().set(opt).from(element).save().then(() => {
        // Remove the class from the body after PDF is generated
        body.classList.remove('pdf-export');
    });
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
    populateReceipt(receiptData); // Repopulate with new language
}

document.addEventListener('DOMContentLoaded', function() {
    loadAndPopulateData(ticketId);
});