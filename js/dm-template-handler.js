// dm-template-handler.js: js for html templates

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