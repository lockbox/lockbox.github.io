
// Theme management - default to dark
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
}

function updateThemeToggle(theme) {
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
        toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Code copy functionality
function copyCode(button) {
    const codeBlock = button.closest('.code-header').nextElementSibling;
    const code = codeBlock.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = 'copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Add line numbers to code blocks
function addLineNumbers() {
    document.querySelectorAll('pre code').forEach((block) => {
        const lines = block.textContent.split('\n').length;
        if (lines > 5) {
            const lineNumbers = Array.from({length: lines}, (_, i) => i + 1).join('\n');
            const lineNumberEl = document.createElement('span');
            lineNumberEl.className = 'line-numbers';
            lineNumberEl.textContent = lineNumbers;
            block.parentElement.insertBefore(lineNumberEl, block);
        }
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Reading time calculator
function calculateReadingTime() {
    // Check if reading time is enabled via Hugo site params
    const showReadingTime = document.querySelector('meta[name="show-reading-time"]');
    if (!showReadingTime || showReadingTime.content !== 'true') {
        return;
    }
    
    const article = document.querySelector('article.post-content');
    if (article) {
        const text = article.textContent;
        const wordsPerMinute = 200;
        const wordCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);
        
        const readingTimeEl = document.createElement('span');
        readingTimeEl.className = 'reading-time';
        readingTimeEl.textContent = `⏱ ${readingTime} min read`;
        
        const postMeta = document.querySelector('.post-meta');
        if (postMeta && !postMeta.querySelector('.reading-time')) {
            postMeta.appendChild(readingTimeEl);
        }
    }
}

// Terminal typing effect
function typewriterEffect(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    element.classList.add('terminal-cursor');
    
    function type() {
        if (i < text.length) {
            element.textContent = text.substring(0, i + 1);
            i++;
            setTimeout(type, speed);
        } else {
            element.classList.remove('terminal-cursor');
        }
    }
    
    type();
}

// Add hover effect to logo
function initLogoEffect() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('mouseenter', () => {
            logo.style.filter = 'hue-rotate(90deg)';
        });
        logo.addEventListener('mouseleave', () => {
            logo.style.filter = 'none';
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    addLineNumbers();
    initSmoothScroll();
    calculateReadingTime();
    initLogoEffect();
    
    // Add terminal typing effect to hero tagline on page load
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        const originalText = tagline.textContent;
        typewriterEffect(tagline, originalText, 30);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 't' to toggle theme
    if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && 
            activeElement.tagName !== 'TEXTAREA') {
            toggleTheme();
        }
    }
    
    // Press '/' for search (when implemented)
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && 
            activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            console.log('Search not yet implemented');
        }
    }
});

// Console Easter egg
console.log('%c> stumbl.ing', 'color: #ff6b35; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px rgba(255, 107, 53, 0.5);');
console.log('%c[*] Systems loaded. Ready for reverse engineering.', 'color: #ff8c42; font-family: monospace;');
console.log('%c[!] Found a bug? Report it at https://github.com/lockbox/lockbox.github.io', 'color: #8b949e; font-family: monospace;');
 
