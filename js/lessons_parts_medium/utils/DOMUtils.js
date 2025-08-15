/**
 * DOM Utilities
 * Helper functions for DOM manipulation
 */

window.DOMUtils = class DOMUtils {
    /**
     * Create DOM element with attributes and children
     */
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else if (key === 'textContent') {
                element.textContent = attributes[key];
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, attributes[key]);
            } else if (key === 'style' && typeof attributes[key] === 'object') {
                Object.assign(element.style, attributes[key]);
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    /**
     * Find element by selector
     */
    static find(selector, parent = document) {
        return parent.querySelector(selector);
    }

    /**
     * Find all elements by selector
     */
    static findAll(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }

    /**
     * Add class to element
     */
    static addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    }

    /**
     * Remove class from element
     */
    static removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    }

    /**
     * Toggle class on element
     */
    static toggleClass(element, className) {
        if (element && className) {
            element.classList.toggle(className);
        }
    }

    /**
     * Check if element has class
     */
    static hasClass(element, className) {
        return element && className && element.classList.contains(className);
    }

    /**
     * Set element attributes
     */
    static setAttributes(element, attributes) {
        if (element && attributes) {
            Object.keys(attributes).forEach(key => {
                element.setAttribute(key, attributes[key]);
            });
        }
    }

    /**
     * Remove element from DOM
     */
    static remove(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    /**
     * Clear element content
     */
    static clear(element) {
        if (element) {
            element.innerHTML = '';
        }
    }

    /**
     * Show element
     */
    static show(element) {
        if (element) {
            element.style.display = '';
        }
    }

    /**
     * Hide element
     */
    static hide(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * Check if element is visible
     */
    static isVisible(element) {
        return element && element.offsetParent !== null;
    }

    /**
     * Get element position
     */
    static getPosition(element) {
        if (!element) return { top: 0, left: 0 };
        
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        };
    }

    /**
     * Scroll to element
     */
    static scrollTo(element, behavior = 'smooth') {
        if (element) {
            element.scrollIntoView({ behavior, block: 'center' });
        }
    }

    /**
     * Create progress bar element
     */
    static createProgressBar(progress, className = 'progress-bar') {
        const container = this.createElement('div', { className: `${className}-container` });
        const bar = this.createElement('div', { className });
        const fill = this.createElement('div', { 
            className: `${className}-fill`,
            style: { width: `${progress}%` }
        });
        
        bar.appendChild(fill);
        container.appendChild(bar);
        
        return container;
    }

    /**
     * Create button element
     */
    static createButton(text, className = 'btn', onClick = null) {
        const button = this.createElement('button', {
            className,
            textContent: text
        });
        
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        
        return button;
    }

    /**
     * Create input element
     */
    static createInput(type = 'text', attributes = {}) {
        return this.createElement('input', {
            type,
            ...attributes
        });
    }

    /**
     * Create textarea element
     */
    static createTextarea(attributes = {}) {
        return this.createElement('textarea', attributes);
    }

    /**
     * Debounce function calls
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function calls
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Make available globally
window.DOMUtils = window.DOMUtils;