// dm-template-handler.js: js for html templates
const showRelevantFields = () => {
    const toolType = document.querySelector('[data-tool-type]').textContent.toLowerCase();
    document.querySelectorAll('[data-if]').forEach(element => {
        element.style.display = element.dataset.if === toolType ? 'block' : 'none';
    });
};

document.addEventListener('DOMContentLoaded', showRelevantFields);
