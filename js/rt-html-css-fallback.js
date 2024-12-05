// Check if theme variables are valid color codes
document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const style = getComputedStyle(root);

    function isValidColor(color) {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }

    // Check and set fallback colors if needed
    if (!isValidColor(style.getPropertyValue('--primary-color').trim())) {
        root.style.setProperty('--primary-color', '#2c3e50');
        root.style.setProperty('--secondary-color', '#3498db');
        root.style.setProperty('--background-color', '#f8f9fa');
    }
});
