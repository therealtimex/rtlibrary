/**
 * Animation Utilities
 * Helper functions for animations and transitions
 */

window.AnimationUtils = class AnimationUtils {
    /**
     * Fade in element
     */
    static fadeIn(element, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            element.style.opacity = '0';
            element.style.display = '';
            
            const start = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = progress.toString();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    /**
     * Fade out element
     */
    static fadeOut(element, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            const start = performance.now();
            const startOpacity = parseFloat(getComputedStyle(element).opacity) || 1;
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = (startOpacity * (1 - progress)).toString();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    /**
     * Slide in from direction
     */
    static slideIn(element, direction = 'left', duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            const transforms = {
                left: 'translateX(-100%)',
                right: 'translateX(100%)',
                up: 'translateY(-100%)',
                down: 'translateY(100%)'
            };

            element.style.transform = transforms[direction] || transforms.left;
            element.style.transition = `transform ${duration}ms ease-out`;
            element.style.display = '';
            
            // Force reflow
            element.offsetHeight;
            
            element.style.transform = 'translate(0, 0)';
            
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    /**
     * Slide out to direction
     */
    static slideOut(element, direction = 'left', duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            const transforms = {
                left: 'translateX(-100%)',
                right: 'translateX(100%)',
                up: 'translateY(-100%)',
                down: 'translateY(100%)'
            };

            element.style.transition = `transform ${duration}ms ease-in`;
            element.style.transform = transforms[direction] || transforms.left;
            
            setTimeout(() => {
                element.style.display = 'none';
                element.style.transition = '';
                element.style.transform = '';
                resolve();
            }, duration);
        });
    }

    /**
     * Scale animation
     */
    static scale(element, fromScale = 0, toScale = 1, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            element.style.transform = `scale(${fromScale})`;
            element.style.transition = `transform ${duration}ms ease-out`;
            element.style.display = '';
            
            // Force reflow
            element.offsetHeight;
            
            element.style.transform = `scale(${toScale})`;
            
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    /**
     * Bounce animation
     */
    static bounce(element, intensity = 10, duration = 600) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            const keyframes = [
                { transform: 'translateY(0px)' },
                { transform: `translateY(-${intensity}px)` },
                { transform: 'translateY(0px)' },
                { transform: `translateY(-${intensity/2}px)` },
                { transform: 'translateY(0px)' }
            ];

            const animation = element.animate(keyframes, {
                duration,
                easing: 'ease-out'
            });

            animation.onfinish = () => resolve();
        });
    }

    /**
     * Shake animation
     */
    static shake(element, intensity = 5, duration = 500) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            const keyframes = [
                { transform: 'translateX(0px)' },
                { transform: `translateX(-${intensity}px)` },
                { transform: `translateX(${intensity}px)` },
                { transform: `translateX(-${intensity}px)` },
                { transform: `translateX(${intensity}px)` },
                { transform: 'translateX(0px)' }
            ];

            const animation = element.animate(keyframes, {
                duration,
                easing: 'ease-in-out'
            });

            animation.onfinish = () => resolve();
        });
    }

    /**
     * Pulse animation
     */
    static pulse(element, scale = 1.1, duration = 1000) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            const keyframes = [
                { transform: 'scale(1)' },
                { transform: `scale(${scale})` },
                { transform: 'scale(1)' }
            ];

            const animation = element.animate(keyframes, {
                duration,
                easing: 'ease-in-out',
                iterations: Infinity
            });

            // Return animation object so it can be stopped
            resolve(animation);
        });
    }

    /**
     * Rotate animation
     */
    static rotate(element, degrees = 360, duration = 1000) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            const keyframes = [
                { transform: 'rotate(0deg)' },
                { transform: `rotate(${degrees}deg)` }
            ];

            const animation = element.animate(keyframes, {
                duration,
                easing: 'linear'
            });

            animation.onfinish = () => resolve();
        });
    }

    /**
     * Float animation (for floating emojis)
     */
    static float(element, distance = 20, duration = 3000) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            const keyframes = [
                { transform: 'translateY(0px) rotate(0deg)' },
                { transform: `translateY(-${distance}px) rotate(5deg)` },
                { transform: 'translateY(0px) rotate(0deg)' }
            ];

            const animation = element.animate(keyframes, {
                duration,
                easing: 'ease-in-out',
                iterations: Infinity
            });

            resolve(animation);
        });
    }

    /**
     * Progress bar animation
     */
    static animateProgress(element, fromPercent = 0, toPercent = 100, duration = 1000) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            const start = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentPercent = fromPercent + (toPercent - fromPercent) * progress;
                element.style.width = `${currentPercent}%`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    /**
     * Typewriter effect
     */
    static typewriter(element, text, speed = 50) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            element.textContent = '';
            let i = 0;
            
            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            };
            
            type();
        });
    }

    /**
     * Stagger animation for multiple elements
     */
    static stagger(elements, animationFn, delay = 100) {
        if (!elements || !Array.isArray(elements)) return Promise.resolve();

        const promises = elements.map((element, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    animationFn(element).then(resolve);
                }, index * delay);
            });
        });

        return Promise.all(promises);
    }

    /**
     * Create CSS animation
     */
    static createCSSAnimation(name, keyframes, duration = 1000, easing = 'ease') {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ${name} {
                ${keyframes}
            }
            .${name} {
                animation: ${name} ${duration}ms ${easing};
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Remove all animations from element
     */
    static clearAnimations(element) {
        if (element) {
            element.getAnimations().forEach(animation => animation.cancel());
            element.style.animation = '';
            element.style.transition = '';
            element.style.transform = '';
        }
    }
}

// Make available globally
window.AnimationUtils = window.AnimationUtils;