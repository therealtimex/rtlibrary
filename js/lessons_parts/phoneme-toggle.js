console.log('Loading inline phoneme-toggle-fix.js...');

// Override the original displayResults function to change button icons
const originalDisplayResults = window.displayResults;
window.displayResults = function(result) {
    // Call original function
    originalDisplayResults.call(this, result);
    
    // Change all chevron icons to more appropriate icons for floating panels
    setTimeout(() => {
        // Change mobile chevrons
        document.querySelectorAll('[id^="chevron-"]').forEach((chevron, index) => {
            if (chevron.id.includes('desktop')) return; // Skip desktop ones for now
            
            chevron.className = 'fas fa-external-link-alt text-blue-500 transition-transform duration-200 text-lg sm:hidden';
            chevron.title = 'View phoneme analysis';
        });
        
        // Change desktop chevrons  
        document.querySelectorAll('[id^="chevron-desktop-"]').forEach((chevron, index) => {
            chevron.className = 'hidden sm:block fas fa-external-link-alt text-blue-500 transition-transform duration-200 text-lg';
            chevron.title = 'View phoneme analysis';
        });
        
        console.log('✅ Changed chevron icons to external-link icons');
    }, 100);
};

// Fixed phoneme breakdown toggle function - shows floating panel
window.togglePhonemeBreakdown = function(wordIndex) {
    console.log('🔍 Inline togglePhonemeBreakdown called with wordIndex:', wordIndex);
    
    const phonemesDiv = document.getElementById(`phonemes-${wordIndex}`);
    const chevron = document.getElementById(`chevron-${wordIndex}`);
    const chevronDesktop = document.getElementById(`chevron-desktop-${wordIndex}`);

    console.log('🔍 Elements found:', {
        phonemesDiv: !!phonemesDiv,
        chevron: !!chevron,
        chevronDesktop: !!chevronDesktop
    });

    if (!phonemesDiv) {
        console.error('❌ phonemesDiv not found for wordIndex:', wordIndex);
        return;
    }

    const isHidden = phonemesDiv.classList.contains('hidden');
    console.log('🔍 Current state - isHidden:', isHidden);
    
    if (isHidden) {
        // Show phonemes inline
        console.log('📖 Showing phonemes breakdown inline');
        
        // Step 1: Remove hidden class first
        phonemesDiv.classList.remove('hidden');
        
        // Step 2: Fix all modal containers to allow expansion
        const resultsModal = document.getElementById('pronunciation-results-modal');
        if (resultsModal) {
            // Fix the main modal container
            const modalContainer = resultsModal.querySelector('.bg-theme-surface');
            if (modalContainer) {
                modalContainer.style.maxHeight = 'none !important';
                modalContainer.style.height = 'auto !important';
                modalContainer.style.overflow = 'visible !important';
                console.log('🔧 Fixed main modal container');
            }
            
            // Fix the modal content area
            const modalContent = resultsModal.querySelector('.overflow-y-auto');
            if (modalContent) {
                modalContent.style.maxHeight = 'none !important';
                modalContent.style.height = 'auto !important';
                modalContent.style.overflow = 'visible !important';
                console.log('🔧 Fixed modal content area');
            }
        }
        
        // Step 3: Fix the results content container
        const modalResults = document.getElementById('modal-pronunciation-results');
        if (modalResults) {
            modalResults.style.maxHeight = 'none !important';
            modalResults.style.height = 'auto !important';
            modalResults.style.overflow = 'visible !important';
            console.log('🔧 Fixed modal results container');
        }
        
        // Step 4: Fix all parent containers up the DOM tree
        let currentElement = phonemesDiv.parentElement;
        let level = 0;
        while (currentElement && level < 8) { // Go up more levels
            const computedStyle = window.getComputedStyle(currentElement);
            
            // Fix overflow
            if (computedStyle.overflow === 'hidden' || computedStyle.overflowY === 'hidden') {
                currentElement.style.overflow = 'visible !important';
                currentElement.style.overflowY = 'visible !important';
                currentElement.setAttribute('data-overflow-fixed', 'true');
                console.log(`🔧 Fixed overflow at level ${level}:`, currentElement.tagName, currentElement.className);
            }
            
            // Fix max-height constraints
            if (computedStyle.maxHeight && computedStyle.maxHeight !== 'none') {
                currentElement.style.maxHeight = 'none !important';
                currentElement.setAttribute('data-maxheight-fixed', 'true');
                console.log(`🔧 Fixed maxHeight at level ${level}:`, currentElement.tagName);
            }
            
            currentElement = currentElement.parentElement;
            level++;
        }
        
        // Step 5: Force phonemes div to display with enhanced styling and force positioning
        phonemesDiv.style.cssText = `
            display: block !important;
            visibility: visible !important;
            height: auto !important;
            min-height: 300px !important;
            opacity: 1 !important;
            position: relative !important;
            background: #f0f9ff !important;
            border: 3px solid #3b82f6 !important;
            border-radius: 12px !important;
            margin: 20px 0 !important;
            padding: 30px !important;
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3) !important;
            z-index: 10000 !important;
            animation: slideDown 0.3s ease-out !important;
            width: 100% !important;
            max-width: none !important;
            overflow: visible !important;
            transform: translateY(0) !important;
        `;
        
        // Step 5.1: Also force the content inside to be visible
        const allChildren = phonemesDiv.querySelectorAll('*');
        allChildren.forEach((child, index) => {
            child.style.display = 'block !important';
            child.style.visibility = 'visible !important';
            child.style.opacity = '1 !important';
            if (child.classList.contains('grid')) {
                child.style.display = 'grid !important';
            }
            if (child.classList.contains('flex')) {
                child.style.display = 'flex !important';
            }
        });
        
        // Step 5.2: Test content removed - no longer needed
        
        // Step 6: Add animation keyframes if not already present
        if (!document.getElementById('phoneme-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'phoneme-animation-styles';
            style.textContent = `
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                        max-height: 0;
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                        max-height: 1000px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Step 7: Debug what's inside phonemesDiv and ensure content is visible
        console.log('🔍 Phonemes div content:', phonemesDiv.innerHTML);
        console.log('🔍 Phonemes div computed style:', window.getComputedStyle(phonemesDiv));
        
        const phonemeGrids = phonemesDiv.querySelectorAll('.grid');
        console.log('🔍 Found grids:', phonemeGrids.length);
        phonemeGrids.forEach((grid, index) => {
            grid.style.display = 'grid !important';
            grid.style.visibility = 'visible !important';
            console.log(`🔍 Grid ${index} styled:`, grid.style.cssText);
        });
        
        // Step 8: Force position and scroll - more aggressive approach
        setTimeout(() => {
            // Try to force the modal to scroll to show this content
            const pronunciationModal = document.getElementById('pronunciation-results-modal');
            if (pronunciationModal) {
                const scrollableArea = pronunciationModal.querySelector('.overflow-y-auto');
                if (scrollableArea) {
                    scrollableArea.scrollTop = scrollableArea.scrollHeight;
                    console.log('📜 Scrolled modal to bottom to show phonemes');
                }
            }
            
            // Also try regular scroll into view
            phonemesDiv.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest',
                inline: 'nearest'
            });
            
            // Final check - add position absolute as last resort if still not visible
            const rect = phonemesDiv.getBoundingClientRect();
            console.log('📐 Phoneme div position:', rect);
            
            if (rect.height === 0 || rect.width === 0) {
                console.log('⚠️ Element has no size, creating inline replacement');
                
                // Insert phonemes OUTSIDE the modal completely - after the modal backdrop
                const pronunciationModal = document.getElementById('pronunciation-results-modal');
                if (pronunciationModal) {
                    // Create inline phoneme expansion outside the modal
                    const inlinePhonemes = document.createElement('div');
                    inlinePhonemes.id = `inline-phonemes-${wordIndex}`;
                    inlinePhonemes.style.cssText = `
                        position: fixed !important;
                        bottom: 20px !important;
                        right: 20px !important;
                        background: #f0f9ff !important;
                        border: 3px solid #3b82f6 !important;
                        border-radius: 16px !important;
                        padding: 24px !important;
                        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25) !important;
                        animation: slideIn 0.3s ease-out !important;
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        z-index: 1000000 !important;
                        width: 400px !important;
                        max-width: 90vw !important;
                        max-height: 60vh !important;
                        overflow-y: auto !important;
                    `;
                    
                    // Add phoneme content header with close button
                    const header = document.createElement('div');
                    header.style.cssText = `
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        margin-bottom: 16px !important;
                        padding-bottom: 12px !important;
                        border-bottom: 2px solid #cbd5e1 !important;
                    `;
                    header.innerHTML = `
                        <div style="display: flex !important; align-items: center !important;">
                            <i class="fas fa-microscope" style="color: #3b82f6 !important; margin-right: 8px !important;"></i>
                            <span style="font-weight: bold !important; color: #1f2937 !important; font-size: 16px !important;">Phoneme Analysis</span>
                        </div>
                        <button onclick="window.closePhonemePanel(${wordIndex})" 
                                style="background: #dc2626 !important; color: white !important; border: none !important; width: 28px !important; height: 28px !important; border-radius: 50% !important; cursor: pointer !important; font-size: 14px !important; display: flex !important; align-items: center !important; justify-content: center !important;">
                            ✕
                        </button>
                    `;
                    
                    // Clone the phoneme content
                    const contentDiv = document.createElement('div');
                    contentDiv.innerHTML = phonemesDiv.innerHTML;
                    contentDiv.style.cssText = `
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        line-height: 1.6 !important;
                    `;
                    
                    // Assemble inline phonemes
                    inlinePhonemes.appendChild(header);
                    inlinePhonemes.appendChild(contentDiv);
                    
                    // Add slide-in animation keyframes
                    if (!document.getElementById('phoneme-slide-styles')) {
                        const style = document.createElement('style');
                        style.id = 'phoneme-slide-styles';
                        style.textContent = `
                            @keyframes slideIn {
                                from {
                                    opacity: 0;
                                    transform: translateX(100%);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateX(0);
                                }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                    
                    // Insert directly into body (outside modal)
                    document.body.appendChild(inlinePhonemes);
                    
                    console.log('✅ Created floating phoneme panel outside modal');
                } else {
                    console.error('❌ Could not find pronunciation modal');
                }
            } else {
                console.log('✅ Element has proper size, should be visible inline');
            }
            
            console.log('✅ Phonemes expanded inline and scrolled into view');
        }, 100);
        
        // Update icons (no rotation for external-link icons)
        if (chevron) {
            chevron.classList.remove('fa-external-link-alt');
            chevron.classList.add('fa-times');
            chevron.style.color = '#dc2626 !important';
            chevron.title = 'Close phoneme analysis';
        }
        if (chevronDesktop) {
            chevronDesktop.classList.remove('fa-external-link-alt');
            chevronDesktop.classList.add('fa-times');
            chevronDesktop.style.color = '#dc2626 !important';
            chevronDesktop.title = 'Close phoneme analysis';
        }
        
    } else {
        // Hide phonemes
        console.log('📖 Hiding phonemes breakdown');
        
        // Add collapse animation
        phonemesDiv.style.animation = 'slideUp 0.3s ease-out';
        
        setTimeout(() => {
            phonemesDiv.classList.add('hidden');
            phonemesDiv.style.cssText = '';
            
            // Test div cleanup removed - no longer needed
            
            // Remove inline phonemes if it exists  
            const inlinePhonemes = document.getElementById(`inline-phonemes-${wordIndex}`);
            if (inlinePhonemes) {
                inlinePhonemes.style.animation = 'slideUp 0.3s ease-out';
                setTimeout(() => {
                    inlinePhonemes.remove();
                }, 300);
                console.log('🗑️ Removed inline phoneme expansion');
            }
            
            // Reset all modal containers
            const resultsModal = document.getElementById('pronunciation-results-modal');
            if (resultsModal) {
                const modalContainer = resultsModal.querySelector('.bg-theme-surface');
                if (modalContainer) {
                    modalContainer.style.maxHeight = '';
                    modalContainer.style.height = '';
                    modalContainer.style.overflow = '';
                }
                
                const modalContent = resultsModal.querySelector('.overflow-y-auto');
                if (modalContent) {
                    modalContent.style.maxHeight = '';
                    modalContent.style.height = '';
                    modalContent.style.overflow = '';
                }
            }
            
            const modalResults = document.getElementById('modal-pronunciation-results');
            if (modalResults) {
                modalResults.style.maxHeight = '';
                modalResults.style.height = '';
                modalResults.style.overflow = '';
            }
            
            // Reset all fixed parent containers
            const fixedElements = document.querySelectorAll('[data-overflow-fixed="true"]');
            fixedElements.forEach(element => {
                element.style.overflow = '';
                element.style.overflowY = '';
                element.removeAttribute('data-overflow-fixed');
            });
            
            const maxHeightFixed = document.querySelectorAll('[data-maxheight-fixed="true"]');
            maxHeightFixed.forEach(element => {
                element.style.maxHeight = '';
                element.removeAttribute('data-maxheight-fixed');
            });
            
        }, 300);
        
        // Add collapse animation keyframe
        if (!document.getElementById('phoneme-collapse-styles')) {
            const style = document.createElement('style');
            style.id = 'phoneme-collapse-styles';
            style.textContent = `
                @keyframes slideUp {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                        max-height: 1000px;
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-10px);
                        max-height: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Reset icons back to external-link
        if (chevron) {
            chevron.classList.remove('fa-times');
            chevron.classList.add('fa-external-link-alt');
            chevron.style.color = '#3b82f6 !important';
            chevron.title = 'View phoneme analysis';
        }
        if (chevronDesktop) {
            chevronDesktop.classList.remove('fa-times');
            chevronDesktop.classList.add('fa-external-link-alt');
            chevronDesktop.style.color = '#3b82f6 !important';
            chevronDesktop.title = 'View phoneme analysis';
        }
    }
};

// Function to close phoneme panel and reset icons properly
window.closePhonemePanel = function(wordIndex) {
    console.log('🔒 Closing phoneme panel for word:', wordIndex);
    
    // Remove the panel
    const inlinePhonemes = document.getElementById(`inline-phonemes-${wordIndex}`);
    if (inlinePhonemes) {
        inlinePhonemes.remove();
    }
    
    // CRITICAL: Reset phonemesDiv to hidden state
    const phonemesDiv = document.getElementById(`phonemes-${wordIndex}`);
    if (phonemesDiv) {
        phonemesDiv.classList.add('hidden');
        phonemesDiv.style.cssText = '';
        console.log('🔧 Reset phonemesDiv to hidden state');
    }
    
    // Reset icons back to external-link state
    const chevron = document.getElementById(`chevron-${wordIndex}`);
    const chevronDesktop = document.getElementById(`chevron-desktop-${wordIndex}`);
    
    if (chevron) {
        chevron.classList.remove('fa-times');
        chevron.classList.add('fa-external-link-alt');
        chevron.style.color = '#3b82f6 !important';
        chevron.title = 'View phoneme analysis';
    }
    if (chevronDesktop) {
        chevronDesktop.classList.remove('fa-times');
        chevronDesktop.classList.add('fa-external-link-alt');
        chevronDesktop.style.color = '#3b82f6 !important';
        chevronDesktop.title = 'View phoneme analysis';
    }
    
    // Reset all modal containers back to original state
    const resultsModal = document.getElementById('pronunciation-results-modal');
    if (resultsModal) {
        const modalContainer = resultsModal.querySelector('.bg-theme-surface');
        if (modalContainer) {
            modalContainer.style.maxHeight = '';
            modalContainer.style.height = '';
            modalContainer.style.overflow = '';
        }
        
        const modalContent = resultsModal.querySelector('.overflow-y-auto');
        if (modalContent) {
            modalContent.style.maxHeight = '';
            modalContent.style.height = '';
            modalContent.style.overflow = '';
        }
    }
    
    const modalResults = document.getElementById('modal-pronunciation-results');
    if (modalResults) {
        modalResults.style.maxHeight = '';
        modalResults.style.height = '';
        modalResults.style.overflow = '';
    }
    
    // Reset all fixed parent containers
    const fixedElements = document.querySelectorAll('[data-overflow-fixed="true"]');
    fixedElements.forEach(element => {
        element.style.overflow = '';
        element.style.overflowY = '';
        element.removeAttribute('data-overflow-fixed');
    });
    
    const maxHeightFixed = document.querySelectorAll('[data-maxheight-fixed="true"]');
    maxHeightFixed.forEach(element => {
        element.style.maxHeight = '';
        element.removeAttribute('data-maxheight-fixed');
    });
    
    console.log('✅ Phoneme panel closed and all states reset');
};

console.log('✅ Inline phoneme toggle fix loaded - shows expansion in original position');