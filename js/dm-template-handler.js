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
async function fetchThumbnails() {
    const container = document.querySelector(".thumbnails-container");
    const containerId = container.dataset.id;
    const apiUrl = containerId
        ? `https://jsonplaceholder.typicode.com/photos?albumId=${containerId}`
        : "https://jsonplaceholder.typicode.com/photos?_limit=10";

    container.innerHTML = "<p>Loading thumbnails...</p>";

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch thumbnails");
        }

        const images = await response.json();

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
        console.error(error);
        container.innerHTML = "<p>Failed to load thumbnails.</p>";
    }
}

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
    const apiUrl = 'https://api.realtimex.co/v1/keys/google/maps';

    // Set up request options
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Uncomment the line below if you need to include an authorization token
            // 'Authorization': `Bearer YOUR_ACCESS_TOKEN`
        }
    };

    try {
        const response = await fetch(apiUrl, requestOptions);

        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();
        
        return data.api_key; // Return the API key for further use
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

