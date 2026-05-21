// ============================================
// DOM ELEMENTS
// ============================================
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('navMenu');
const hamburger = document.getElementById('hamburger');
const themeToggle = document.getElementById('themeToggle');
const backToTop = document.getElementById('backToTop');
const scrollProgress = document.getElementById('scrollProgress');
const loading = document.getElementById('loading');
const html = document.documentElement;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // Hide loading animation
    setTimeout(() => {
        loading.classList.add('hidden');
    }, 1500);

    // Initialize theme
    initializeTheme();
    
    // Setup event listeners
    setupEventListeners();
});

// ============================================
// EVENT LISTENERS SETUP
// ============================================
function setupEventListeners() {
    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Close mobile menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('scroll-link')) {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (!link.classList.contains('btn-join')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Back to top button
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Scroll events
    window.addEventListener('scroll', handleScroll);
}

// ============================================
// SCROLL HANDLERS
// ============================================
function handleScroll() {
    // Update scroll progress bar
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollHeight) * 100;
    scrollProgress.style.width = scrolled + '%';

    // Show/hide back to top button
    if (window.scrollY > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }

    // Update navbar style on scroll
    if (window.scrollY > 50) {
        navbar.style.background = getComputedStyle(document.body).getPropertyValue('--bg-primary');
        navbar.style.backdropFilter = 'blur(20px)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = document.body.classList.contains('dark-mode') 
            ? 'rgba(15, 23, 42, 0.7)' 
            : 'rgba(255, 255, 255, 0.7)';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.boxShadow = 'none';
    }

    // Update active nav link
    updateActiveNavLink();
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Testimonial Slider Functionality
    document.addEventListener('DOMContentLoaded', function() {
        const sliderWrapper = document.getElementById('testimonialSlider');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const dotsContainer = document.getElementById('testimonialDots');
        
        if (!sliderWrapper) return;
        
        const cards = sliderWrapper.querySelectorAll('.testimonial-card-item');
        const cardCount = cards.length;
        let currentIndex = 0;
        
        // Function to update dots
        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        // Function to scroll to specific card
        function scrollToCard(index) {
            if (index < 0) index = 0;
            if (index >= cardCount) index = cardCount - 1;
            currentIndex = index;
            
            const card = cards[currentIndex];
            if (card) {
                card.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
            updateDots();
        }
        
        // Create dots
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < cardCount; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => scrollToCard(i));
                dotsContainer.appendChild(dot);
            }
        }
        
        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentIndex < cardCount - 1) {
                    scrollToCard(currentIndex + 1);
                } else {
                    scrollToCard(0); // Loop back to first
                }
            });
        }
        
        // Prev button
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    scrollToCard(currentIndex - 1);
                } else {
                    scrollToCard(cardCount - 1); // Loop to last
                }
            });
        }
        
        // Update active dot on scroll
        let scrollTimeout;
        sliderWrapper.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPosition = sliderWrapper.scrollLeft;
                const cardWidth = cards[0]?.offsetWidth || 0;
                const gap = 30; // match gap in css
                const newIndex = Math.round(scrollPosition / (cardWidth + gap));
                if (newIndex !== currentIndex && newIndex >= 0 && newIndex < cardCount) {
                    currentIndex = newIndex;
                    updateDots();
                }
            }, 100);
        });
        
        // Auto slide (optional - uncomment if desired)
        // let autoSlide = setInterval(() => {
        //     if (currentIndex < cardCount - 1) {
        //         scrollToCard(currentIndex + 1);
        //     } else {
        //         scrollToCard(0);
        //     }
        // }, 5000);
        // 
        // sliderWrapper.addEventListener('mouseenter', () => clearInterval(autoSlide));
        // sliderWrapper.addEventListener('mouseleave', () => {
        //     autoSlide = setInterval(() => {
        //         if (currentIndex < cardCount - 1) {
        //             scrollToCard(currentIndex + 1);
        //         } else {
        //             scrollToCard(0);
        //         }
        //     }, 5000);
        // });
    });

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        const href = link.getAttribute('href');
        const element = document.querySelector(href);
        
        if (element && href !== '#') {
            e.preventDefault();
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// ============================================
// LAZY LOADING FOR IMAGES
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// FORM HANDLING (for future use)
// ============================================
function handleFormSubmit(formElement) {
    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(formElement);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        console.log('Form submitted:', data);
        
        // Show success message
        showNotification('Pesan terkirim! Terima kasih telah menghubungi kami.', 'success');
        
        // Reset form
        formElement.reset();
    });
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Throttle function for scroll events
function throttle(func, wait) {
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

// Debounce function
function debounce(func, wait) {
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

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Reduce motion for users who prefer it
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
    const style = document.createElement('style');
    style.textContent = `
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// ACCESSIBILITY IMPROVEMENTS
// ============================================

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    // Close mobile menu with Escape
    if (e.key === 'Escape') {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }

    // Skip to main content with Alt+M
    if (e.altKey && e.key === 'm') {
        const mainContent = document.querySelector('main') || document.querySelector('section');
        if (mainContent) {
            mainContent.focus();
        }
    }
});

// Add focus trap for mobile menu
function setupFocusTrap() {
    const menu = navMenu;
    const focusableElements = menu.querySelectorAll('a, button');
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    menu.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
}

// Initialize when menu is opened
hamburger.addEventListener('click', () => {
    if (navMenu.classList.contains('active')) {
        setupFocusTrap();
        navMenu.querySelector('a').focus();
    }
});

console.log('[v0] IKRAM Website initialized successfully');
