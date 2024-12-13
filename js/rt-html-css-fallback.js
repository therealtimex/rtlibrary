document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const style = getComputedStyle(root);

    // Default theme colors
    const defaultColors = {
        primary: '#2c3e50',
        secondary: '#3498db',
        background: '#f8f9fa',
        accent: '#f5f5f5'
    };

    function isValidColor(color) {
        if (!color) return false;
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }

    function setFallbackColors(prefix) {
        const colorTypes = ['primary', 'secondary', 'background', 'accent'];
        
        colorTypes.forEach(type => {
            const varName = `--${prefix}${type}`;
            const currentColor = style.getPropertyValue(varName).trim();
            
            if (!isValidColor(currentColor)) {
                root.style.setProperty(varName, defaultColors[type]);
            }
        });
    }

    // Check both naming conventions
    setFallbackColors('');
    setFallbackColors('color_theme_');
});
