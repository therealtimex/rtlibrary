// Upload Image Module - Extracted from upload_image.html
// This file contains all JavaScript functionality for the upload image screen


// Initialize DOM elements
function initializeElements() {
    elements = {
        imagePreviewContainer: document.getElementById('imagePreviewContainer'),
        imagePreview: document.getElementById('imagePreview'),
        removeImageBtn: document.getElementById('removeImageBtn'),
        imageSelectionOptions: document.getElementById('imageSelectionOptions'),
        takePictureBtn: document.getElementById('takePictureBtn'),
        selectImageBtn: document.getElementById('selectImageBtn'),
        submitContainer: document.getElementById('submitContainer'),
        submitImageBtn: document.getElementById('submitImageBtn'),
        loadingContainer: document.getElementById('loadingContainer'),
        loadingText: document.getElementById('loadingText'),
        processingProgressContainer: document.getElementById('processingProgressContainer'),
        processingList: document.getElementById('processingList'),
        noProcessingItems: document.getElementById('noProcessingItems'),
        errorContainer: document.getElementById('errorContainer'),
        errorMessage: document.getElementById('errorMessage')
    };
}

// Initialize the screen
function initScreen() {
    initializeElements();
    
    // Set up event listeners
    elements.takePictureBtn.addEventListener('click', handleTakePicture);
    elements.selectImageBtn.addEventListener('click', handleSelectImage);
    elements.removeImageBtn.addEventListener('click', handleRemoveImage);
    elements.submitImageBtn.addEventListener('click', handleSubmitImage);

    // Initialize processing status display
    updateProcessingDisplay([]);
}

// Handle taking a picture with the camera
function handleTakePicture() {
    AppFile.takePicture("handleCapturedImage");
}

// Handle selecting an image from gallery
function handleSelectImage() {
    AppFile.pickFile("image/*", "handleCapturedImage");
}

// Global callback for handling captured/selected image
window.handleCapturedImage = function (result) {
    if (result.error) {
        showError("Failed to capture image: " + result.error);
        return;
    }

    selectedFile = result;
    elements.imagePreview.src = result.uri;
    elements.imagePreviewContainer.classList.remove('hidden');
    elements.submitContainer.classList.remove('hidden');
};

// Handle removing the selected image
function handleRemoveImage() {
    selectedFile = null;
    elements.imagePreview.src = '';
    elements.imagePreviewContainer.classList.add('hidden');
    elements.submitContainer.classList.add('hidden');
}

// Handle submitting the image
function handleSubmitImage() {
    if (!selectedFile || isUploading) return;

    isUploading = true;
    showLoading("Uploading image...");

    const filename = selectedFile.name || "image_" + Date.now() + ".jpg";

    Uploader.uploadFile(selectedFile.uri, filename, {
        onSuccess: (filePath) => {
            console.log("File uploaded successfully:", filePath);
            const selectedLessonType = document.querySelector('input[name="lessonDifficulty"]:checked').value;
            createImageRecord(filePath, selectedLessonType);
        },
        onError: (error) => {
            isUploading = false;
            hideLoading();
            showError("Upload failed: " + error);
        },
        onProgress: (progress) => {
            elements.loadingText.textContent = `Uploading image... ${progress}%`;
        }
    });
}

// Create a record in the images table
function createImageRecord(imageUrl, lessonType) {
    elements.loadingText.textContent = "Saving image data...";

    const metadata = {
        device: navigator.userAgent,
        timestamp: new Date().toISOString()
    };

    const imageData = {
        username: currentUsername,
        image_url: imageUrl,
        metadata: metadata,
        status: 'pending',
        lesson_type: lessonType
    };

    Data.create('images', imageData)
        .then(createdData => {
            console.log("Image record created:", createdData);

            if (createdData && createdData.length > 0) {
                elements.loadingText.textContent = "Submitting for AI analysis...";

                AIEnricher.submitForAIProcessing('images', createdData)
                    .then(aiResponse => {
                        console.log("AI processing initiated:", aiResponse);
                    })
                    .catch(aiError => {
                        console.error("AI processing request failed:", aiError);
                    });
            }

            setTimeout(() => {
                isUploading = false;
                hideLoading();
                handleRemoveImage();
                showSuccessMessage();
                updateProcessingDisplay(createdData);
            }, 1000);

            return createdData;
        })
        .catch(error => {
            isUploading = false;
            hideLoading();
            showError("Failed to save image: " + error.message);
        });
}

// UI Helper Functions
function showLoading(message) {
    elements.loadingText.textContent = message;
    elements.loadingContainer.classList.remove('hidden');
    elements.errorContainer.classList.add('hidden');
}

function hideLoading() {
    elements.loadingContainer.classList.add('hidden');
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorContainer.classList.remove('hidden');
    elements.loadingContainer.classList.add('hidden');
}

function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed inset-x-0 top-10 mx-auto w-4/5 max-w-sm bg-theme-success text-white p-4 rounded-lg shadow-lg flex items-center justify-center';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        <span>Image uploaded successfully!</span>
    `;
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 500);
    }, 3000);
}

// Processing Display Functions
function updateProcessingDisplay(processingData) {
    if (!processingData || processingData.length === 0) {
        elements.processingList.innerHTML = '';
        elements.noProcessingItems.classList.remove('hidden');
        return;
    }

    elements.noProcessingItems.classList.add('hidden');
    const sortedData = processingData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const processingItemsHtml = sortedData.map(item => {
        const statusIcon = getStatusIcon(item.status);
        const statusColor = getStatusColor(item.status);
        const createdTime = formatDateTime(item.created_at);

        return `
            <div class="bg-theme-surface rounded-lg p-4 shadow-sm border-l-4 ${statusColor}">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                        <div class="relative">
                            <img id="thumb-${item.id}" src="" alt="Processing image" 
                                 class="w-16 h-16 object-cover rounded-lg shadow-sm bg-gray-200"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400" style="display: none;">
                                <i class="fas fa-image text-xl"></i>
                            </div>
                            <div class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
                                ${statusIcon}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-sm font-medium text-theme-text-primary">Creating English Lesson</span>
                            <span class="text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(item.status)}">
                                ${item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
                            </span>
                        </div>
                        <p class="text-xs text-theme-text-secondary mb-2">
                            Created: ${createdTime}
                        </p>
                        
                        ${getStatusContent(item.status)}
                    </div>
                    
                    <div class="flex-shrink-0 ml-2">
                        ${item.status === 'pending' ? `
                            <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-theme-primary"></div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    elements.processingList.innerHTML = processingItemsHtml;

    sortedData.forEach(item => {
        if (item.image_url) {
            loadImageThumbnail(item.id, item.image_url);
        }
    });
}

// Status helper functions
function getStatusIcon(status) {
    if (!status) return '<i class="fas fa-question-circle text-theme-text-secondary"></i>';

    switch (status) {
        case 'pending':
            return '<i class="fas fa-clock text-theme-warning"></i>';
        case 'completed':
            return '<i class="fas fa-check-circle text-theme-success"></i>';
        case 'failed':
            return '<i class="fas fa-exclamation-circle text-theme-danger"></i>';
        default:
            return '<i class="fas fa-question-circle text-theme-text-secondary"></i>';
    }
}

function getStatusColor(status) {
    if (!status) return 'border-theme-text-secondary';

    switch (status) {
        case 'pending':
            return 'border-theme-warning';
        case 'completed':
            return 'border-theme-success';
        case 'failed':
            return 'border-theme-danger';
        default:
            return 'border-theme-text-secondary';
    }
}

function getStatusBadgeClass(status) {
    if (!status) return 'bg-gray-100 text-gray-600';

    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'failed':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

function getStatusContent(status) {
    switch (status) {
        case 'pending':
            return `
                <div class="mt-3">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-theme-primary h-2 rounded-full animate-pulse" style="width: 60%"></div>
                    </div>
                    <p class="text-xs text-theme-text-secondary mt-1">Analyzing image content...</p>
                </div>
            `;
        case 'completed':
            return `
                <div class="mt-2">
                    <p class="text-xs text-theme-success">✓ Lesson created successfully!</p>
                </div>
            `;
        case 'failed':
            return `
                <div class="mt-2">
                    <p class="text-xs text-theme-danger">✗ Failed to create lesson</p>
                </div>
            `;
        default:
            return '';
    }
}

// Utility functions
function formatDateTime(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleString();
    } catch (error) {
        return 'Invalid date';
    }
}

function loadImageThumbnail(itemId, imageUrl) {
    const thumbnailElement = document.getElementById(`thumb-${itemId}`);
    if (!thumbnailElement || !imageUrl) return;

    // Use public URL format for displaying images
    const publicImageUrl = `https://app.realtimex.co/storage/v1/object/public/${imageUrl}`;

    thumbnailElement.src = publicImageUrl;
    thumbnailElement.style.display = 'block';
    thumbnailElement.nextElementSibling.style.display = 'none';

    // Handle image load error
    thumbnailElement.onerror = function () {
        console.error('Failed to load thumbnail for item', itemId, ':', publicImageUrl);
        this.style.display = 'none';
        this.nextElementSibling.style.display = 'flex';
    };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initScreen);