// dm-template-handler.js: js for html templates
// hide empty element
function hideEmptyElements() {
    const dmElements = document.querySelectorAll('.dm');
    dmElements.forEach(dm => {
      const dmValue = dm.querySelector('.dm-value');
      if (dmValue && !dmValue.textContent.trim()) {
        dm.style.display = 'none';
      }
    });
  }
  window.addEventListener('load', hideEmptyElements);
  
  
// used in auto-interaction
const showRelevantFields = () => {
    const toolType = document.querySelector('[data-tool-type]').textContent.toLowerCase();
    document.querySelectorAll('[data-if]').forEach(element => {
        element.style.display = element.dataset.if === toolType ? 'block' : 'none';
    });
};

document.addEventListener('DOMContentLoaded', showRelevantFields);

// used in demo-load-element-via-api.html
function fetchThumbnails() {
    const container = document.querySelector(".thumbnails-container");
    if (!container) return;

    const containerId = container.dataset.id;
    const apiUrl = containerId
        ? `https://jsonplaceholder.typicode.com/photos?albumId=${containerId}`
        : "https://jsonplaceholder.typicode.com/photos?_limit=10";

    container.innerHTML = "<p>Loading thumbnails...</p>";

    if (window.App && typeof window.App.callApi === 'function') {
        App.callApi(
            apiUrl,
            'GET',
            '',
            JSON.stringify({'Content-Type': 'application/json'}),
            false, // includeToken: false for public API
            'handleThumbnailResponse'
        );
    } else {
        console.error('App.callApi not available.');
        container.innerHTML = "<p>Failed to load thumbnails. App bridge not available.</p>";
    }
}

window.handleThumbnailResponse = function(payload) {
    const container = document.querySelector(".thumbnails-container");
    if (payload.status === 'error') {
        console.error('API error:', payload.error);
        container.innerHTML = "<p>Failed to load thumbnails.</p>";
        return;
    }

    try {
        const images = JSON.parse(payload.data);

        if (images.length === 0) {
            container.style.display = "none"; // Hide the container if no images are returned
            return;
        }

        container.innerHTML = ""; // Clear loading message

        images.forEach(image => {
            const img = document.createElement("img");
            img.src = image.thumbnailUrl; // API response structure
            img.alt = image.title || "Thumbnail";
            img.classList.add("thumbnail");
            img.dataset.fullImageUrl = image.url; // Store full image URL

            img.addEventListener("click", () => openModal(image.url));
            container.appendChild(img);
        });
    } catch (error) {
        console.error('Parse error:', error);
        container.innerHTML = "<p>Failed to load thumbnails.</p>";
    }
};

function openModal(imageUrl) {
    const modal = document.querySelector(".modal");
    const modalImage = modal.querySelector("img");
    const downloadBtn = modal.querySelector(".download-btn");

    modalImage.src = imageUrl;
    downloadBtn.href = imageUrl;
    downloadBtn.download = "image.jpg";

    modal.classList.add("active");
}

function closeModal() {
    const modal = document.querySelector(".modal");
    modal.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", fetchThumbnails);

// get mapKey 
async function fetchGoogleMapsApiKey() {
    const apiUrl = 'https://db.rtworkspace.com/api/v1/keys/google/maps'; // Corrected endpoint as per migration log

    return new Promise((resolve) => {
        if (!window.App || typeof window.App.callApi !== 'function') {
            console.error('App.callApi not available');
            resolve(null);
            return;
        }

        const callbackName = `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        window[callbackName] = function(payload) {
            delete window[callbackName];
            if (payload.status === 'error') {
                console.error('API error:', payload.error);
                resolve(null);
                return;
            }
            try {
                const data = JSON.parse(payload.data);
                resolve(data.api_key); // Return the API key
            } catch (e) {
                console.error('Parse error:', e);
                resolve(null);
            }
        };

        App.callApi(
            apiUrl,
            'GET',
            '',
            JSON.stringify({'Content-Type': 'application/json'}),
            true, // includeToken: true for db.rtworkspace.com
            callbackName
        );
    });
}
