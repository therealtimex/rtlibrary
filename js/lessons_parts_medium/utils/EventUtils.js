/**
 * Event Utilities
 * Helper functions for event handling and delegation
 */

window.EventUtils = class EventUtils {
    constructor() {
        this.listeners = new Map();
        this.delegatedListeners = new Map();
    }

    /**
     * Add event listener with automatic cleanup tracking
     */
    static addEventListener(element, event, handler, options = {}) {
        if (!element || !event || !handler) return null;

        const wrappedHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        };

        element.addEventListener(event, wrappedHandler, options);

        // Return cleanup function
        return () => {
            element.removeEventListener(event, wrappedHandler, options);
        };
    }

    /**
     * Add event delegation
     */
    static addEventDelegate(container, selector, event, handler) {
        if (!container || !selector || !event || !handler) return null;

        const delegatedHandler = (e) => {
            const target = e.target.closest(selector);
            if (target && container.contains(target)) {
                try {
                    handler(e, target);
                } catch (error) {
                    console.error(`Error in delegated event handler for ${event}:`, error);
                }
            }
        };

        container.addEventListener(event, delegatedHandler);

        // Return cleanup function
        return () => {
            container.removeEventListener(event, delegatedHandler);
        };
    }

    /**
     * Add multiple event listeners
     */
    static addMultipleListeners(element, events, handler, options = {}) {
        if (!element || !events || !handler) return [];

        const cleanupFunctions = events.map(event => 
            this.addEventListener(element, event, handler, options)
        );

        // Return cleanup function for all listeners
        return () => {
            cleanupFunctions.forEach(cleanup => cleanup && cleanup());
        };
    }

    /**
     * Debounced event listener
     */
    static addDebouncedListener(element, event, handler, delay = 300, options = {}) {
        if (!element || !event || !handler) return null;

        let timeout;
        const debouncedHandler = (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                try {
                    handler(e);
                } catch (error) {
                    console.error(`Error in debounced event handler for ${event}:`, error);
                }
            }, delay);
        };

        return this.addEventListener(element, event, debouncedHandler, options);
    }

    /**
     * Throttled event listener
     */
    static addThrottledListener(element, event, handler, limit = 100, options = {}) {
        if (!element || !event || !handler) return null;

        let inThrottle = false;
        const throttledHandler = (e) => {
            if (!inThrottle) {
                try {
                    handler(e);
                } catch (error) {
                    console.error(`Error in throttled event handler for ${event}:`, error);
                }
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };

        return this.addEventListener(element, event, throttledHandler, options);
    }

    /**
     * One-time event listener
     */
    static addOneTimeListener(element, event, handler) {
        if (!element || !event || !handler) return null;

        const oneTimeHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error(`Error in one-time event handler for ${event}:`, error);
            }
            element.removeEventListener(event, oneTimeHandler);
        };

        element.addEventListener(event, oneTimeHandler);

        // Return cleanup function
        return () => {
            element.removeEventListener(event, oneTimeHandler);
        };
    }

    /**
     * Wait for event (Promise-based)
     */
    static waitForEvent(element, event, timeout = 5000) {
        return new Promise((resolve, reject) => {
            let timeoutId;
            
            const handler = (e) => {
                clearTimeout(timeoutId);
                element.removeEventListener(event, handler);
                resolve(e);
            };

            element.addEventListener(event, handler);

            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    element.removeEventListener(event, handler);
                    reject(new Error(`Event ${event} timeout after ${timeout}ms`));
                }, timeout);
            }
        });
    }

    /**
     * Custom event dispatcher
     */
    static dispatch(element, eventName, detail = {}) {
        if (!element || !eventName) return false;

        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });

        return element.dispatchEvent(event);
    }

    /**
     * Touch event helpers
     */
    static addTouchListeners(element, handlers = {}) {
        if (!element) return null;

        const cleanupFunctions = [];
        
        // Touch start
        if (handlers.onTouchStart) {
            cleanupFunctions.push(
                this.addEventListener(element, 'touchstart', handlers.onTouchStart, { passive: false })
            );
        }

        // Touch move
        if (handlers.onTouchMove) {
            cleanupFunctions.push(
                this.addEventListener(element, 'touchmove', handlers.onTouchMove, { passive: false })
            );
        }

        // Touch end
        if (handlers.onTouchEnd) {
            cleanupFunctions.push(
                this.addEventListener(element, 'touchend', handlers.onTouchEnd, { passive: false })
            );
        }

        // Swipe detection
        if (handlers.onSwipe) {
            let startX, startY, startTime;

            const touchStart = (e) => {
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                startTime = Date.now();
            };

            const touchEnd = (e) => {
                if (!startX || !startY) return;

                const touch = e.changedTouches[0];
                const endX = touch.clientX;
                const endY = touch.clientY;
                const endTime = Date.now();

                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const deltaTime = endTime - startTime;

                // Minimum swipe distance and maximum time
                const minDistance = 50;
                const maxTime = 300;

                if (Math.abs(deltaX) > minDistance && deltaTime < maxTime) {
                    const direction = deltaX > 0 ? 'right' : 'left';
                    handlers.onSwipe({ direction, deltaX, deltaY, deltaTime });
                } else if (Math.abs(deltaY) > minDistance && deltaTime < maxTime) {
                    const direction = deltaY > 0 ? 'down' : 'up';
                    handlers.onSwipe({ direction, deltaX, deltaY, deltaTime });
                }

                startX = startY = startTime = null;
            };

            cleanupFunctions.push(
                this.addEventListener(element, 'touchstart', touchStart, { passive: true })
            );
            cleanupFunctions.push(
                this.addEventListener(element, 'touchend', touchEnd, { passive: true })
            );
        }

        // Return cleanup function
        return () => {
            cleanupFunctions.forEach(cleanup => cleanup && cleanup());
        };
    }

    /**
     * Keyboard event helpers
     */
    static addKeyboardListeners(element, handlers = {}) {
        if (!element) return null;

        const cleanupFunctions = [];

        const keyHandler = (e) => {
            const key = e.key.toLowerCase();
            const code = e.code;

            // Specific key handlers
            if (handlers[key]) {
                handlers[key](e);
            }

            // Key combinations
            if (e.ctrlKey && handlers.ctrl) {
                handlers.ctrl(e, key);
            }
            if (e.altKey && handlers.alt) {
                handlers.alt(e, key);
            }
            if (e.shiftKey && handlers.shift) {
                handlers.shift(e, key);
            }

            // Arrow keys
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key) && handlers.arrow) {
                handlers.arrow(e, key.replace('arrow', ''));
            }

            // Enter key
            if (key === 'enter' && handlers.enter) {
                handlers.enter(e);
            }

            // Escape key
            if (key === 'escape' && handlers.escape) {
                handlers.escape(e);
            }

            // Space key
            if (key === ' ' && handlers.space) {
                handlers.space(e);
            }
        };

        cleanupFunctions.push(
            this.addEventListener(element, 'keydown', keyHandler)
        );

        if (handlers.keyup) {
            cleanupFunctions.push(
                this.addEventListener(element, 'keyup', handlers.keyup)
            );
        }

        // Return cleanup function
        return () => {
            cleanupFunctions.forEach(cleanup => cleanup && cleanup());
        };
    }

    /**
     * Form event helpers
     */
    static addFormListeners(form, handlers = {}) {
        if (!form) return null;

        const cleanupFunctions = [];

        // Form submission
        if (handlers.onSubmit) {
            cleanupFunctions.push(
                this.addEventListener(form, 'submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    handlers.onSubmit(data, e);
                })
            );
        }

        // Input changes
        if (handlers.onChange) {
            cleanupFunctions.push(
                this.addEventDelegate(form, 'input, select, textarea', 'change', (e, target) => {
                    handlers.onChange(target.value, target.name, e);
                })
            );
        }

        // Input events (real-time)
        if (handlers.onInput) {
            cleanupFunctions.push(
                this.addEventDelegate(form, 'input, textarea', 'input', (e, target) => {
                    handlers.onInput(target.value, target.name, e);
                })
            );
        }

        // Return cleanup function
        return () => {
            cleanupFunctions.forEach(cleanup => cleanup && cleanup());
        };
    }

    /**
     * Remove all event listeners from element
     */
    static removeAllListeners(element) {
        if (!element) return;

        // Clone element to remove all listeners
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        return newElement;
    }

    /**
     * Prevent default and stop propagation
     */
    static prevent(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    /**
     * Get event coordinates
     */
    static getCoordinates(e) {
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
        return {
            x: e.clientX,
            y: e.clientY
        };
    }
}

// Make available globally
window.EventUtils = window.EventUtils;