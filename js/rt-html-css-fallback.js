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
        root.style.setProperty('--primary-color', '#9370DB');
        root.style.setProperty('--secondary-color', '#B19CD9');
        root.style.setProperty('--background-color', '#FFFFFF');
        root.style.setProperty('--accent-color', '#FFA07A');
        root.style.setProperty('--surface-color', '#E6E6FA');
        root.style.setProperty('--neutral_light-color', '#F5F5F5');
        root.style.setProperty('--text_primary-color', '#212121');
        root.style.setProperty('--text_secondary-color', '#424242');
    }

    // Check and set fallback colors if needed
    if (!isValidColor(style.getPropertyValue('--color_theme_primary').trim())) {
        root.style.setProperty('--color_theme_primary', '#9370DB');
        root.style.setProperty('--color_theme_secondary', '#B19CD9');
        root.style.setProperty('--color_theme_background', '#FFFFFF');
        root.style.setProperty('--color_theme_accent', '#FFA07A');
        root.style.setProperty('--color_theme_surface', '#E6E6FA');
        root.style.setProperty('--color_theme_neutral_light', '#F5F5F5');
        root.style.setProperty('--color_theme_text_primary', '#212121');
        root.style.setProperty('--color_theme_text_secondary', '#424242');
    }
});
