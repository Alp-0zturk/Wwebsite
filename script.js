// Function to convert text to double-struck Unicode style
function toDoubleStruck(text) {
    const doubleStruckMap = {
        'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 'D': '𝔻', 'E': '𝔼', 'F': '𝔽', 'G': '𝔾',
        'H': 'ℍ', 'I': '𝕀', 'J': '𝕁', 'K': '𝕂', 'L': '𝕃', 'M': '𝕄', 'N': 'ℕ',
        'O': '𝕆', 'P': 'ℙ', 'Q': 'ℚ', 'R': 'ℝ', 'S': '𝕊', 'T': '𝕋', 'U': '𝕌',
        'V': '𝕍', 'W': '𝕎', 'X': '𝕏', 'Y': '𝕐', 'Z': 'ℤ',
        'a': '𝕒', 'b': '𝕓', 'c': '𝕔', 'd': '𝕕', 'e': '𝕖', 'f': '𝕗', 'g': '𝕘',
        'h': '𝕙', 'i': '𝕚', 'j': '𝕛', 'k': '𝕜', 'l': '𝕝', 'm': '𝕞', 'n': '𝕟',
        'o': '𝕠', 'p': '𝕡', 'q': '𝕢', 'r': '𝕣', 's': '𝕤', 't': '𝕥', 'u': '𝕦',
        'v': '𝕧', 'w': '𝕨', 'x': '𝕩', 'y': '𝕪', 'z': '𝕫',
        '0': '𝟘', '1': '𝟙', '2': '𝟚', '3': '𝟛', '4': '𝟜', '5': '𝟝', '6': '𝟞',
        '7': '𝟟', '8': '𝟠', '9': '𝟡'
    };
    
    return text.split('').map(char => {
        return doubleStruckMap[char] || char;
    }).join('');
}

// Apply double-struck style to headers and artist name
function applyDoubleStruckStyle() {
    const selectors = [
        '.artist-name',
        '.logo',
        '.section-title',
        '.item__info h3',
        '.release-title',
        '.shop-item-title',
        '.cart-header h3'
    ];

    selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
            if (el && el.textContent && el.textContent.trim().length > 0) {
                el.textContent = toDoubleStruck(el.textContent);
            }
        });
    });
}

function applyDoubleStruckAfterFont() {
    const fontName = 'STIX Two Math';
    if (document.fonts && typeof document.fonts.load === 'function') {
        document.fonts.load(`16px "${fontName}"`).then(() => {
            applyDoubleStruckStyle();
        }).catch(() => {
            console.warn(`${fontName} failed to load — applying transformation anyway.`);
            applyDoubleStruckStyle();
        });
    } else {
        applyDoubleStruckStyle();
    }
}

// Tab Navigation
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

function syncCartVisibility(activeTab) {
    if (!cartIcon || !cartElement) return;
    const onShop = activeTab === 'shop';
    cartIcon.classList.toggle('visible', onShop);
    if (!onShop) {
        cartElement.classList.remove('open');
    }
}

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        // Remove active class from all tabs and contents
        navTabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
        syncCartVisibility(targetTab);
    });
});

// Shopping Cart Functionality
let cart = [];
const cartIcon = document.getElementById('cart-icon');
const cartElement = document.getElementById('cart');
const cartItems = document.querySelector('.cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const closeCartBtn = document.querySelector('.close-cart-btn');
const checkoutBtn = document.querySelector('.checkout-btn');

// Add to cart
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const itemName = btn.getAttribute('data-item');
        const itemPrice = parseFloat(btn.getAttribute('data-price'));
        
        cart.push({
            name: itemName,
            price: itemPrice
        });
        
        updateCart();
        showCartNotification();
    });
});

// Update cart display
function updateCart() {
    cartCount.textContent = cart.length;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
    } else {
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            total += item.price;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <button class="remove-item-btn" data-index="${index}">&times;</button>
            `;
            cartItems.appendChild(cartItem);
        });
        
        cartTotal.textContent = total.toFixed(2);
        
        // Add remove functionality
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCart();
            });
        });
    }
}

// Show cart notification
function showCartNotification() {
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 200);
}

// Open/close cart
cartIcon.addEventListener('click', () => {
    cartElement.classList.add('open');
});

closeCartBtn.addEventListener('click', () => {
    cartElement.classList.remove('open');
});

// Close cart when clicking outside
document.addEventListener('click', (e) => {
    if (!cartElement.contains(e.target) && !cartIcon.contains(e.target)) {
        cartElement.classList.remove('open');
    }
});

// Checkout
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // In a real application, this would redirect to a payment processor
    // For now, we'll show an alert
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    alert(`Redirecting to checkout...\n\nTotal: $${total.toFixed(2)}\n\nIn a real application, this would connect to a payment processor like Stripe or PayPal.`);
    
    // Optionally clear cart after checkout
    // cart = [];
    // updateCart();
    // cartElement.classList.remove('open');
});

// Gallery parallax with Lenis smooth scroll and GSAP ScrollTrigger
let lenis = null;
let galleryScrollTriggers = [];
let isLenisInitialized = false;

function initLenis() {
    if (isLenisInitialized || typeof Lenis === 'undefined') return;
    
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });
    
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }
    
    isLenisInitialized = true;
}

function initGalleryParallax() {
    const galleryContainer = document.getElementById('gallery');
    if (!galleryContainer) return;
    
    const galleryItems = galleryContainer.querySelectorAll('.gallery__item');
    
    if (galleryItems.length === 0) return;
    
    // Check if GSAP and ScrollTrigger are loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded yet');
        return;
    }
    
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Initialize Lenis
    initLenis();
    
    // Function to create ScrollTriggers with proper speed-based parallax
    function createScrollTriggers() {
        // Kill existing triggers first
        galleryScrollTriggers.forEach(trigger => {
            if (trigger && trigger.kill) trigger.kill();
        });
        galleryScrollTriggers = [];
        
        // Get gallery container for unified trigger
        const gallery = galleryContainer.querySelector('.gallery');
        if (!gallery) return;
        
        // Store item speeds for reference
        const itemSpeeds = new Map();
        galleryItems.forEach((item) => {
            const speed = parseFloat(item.getAttribute('data-speed')) || 1;
            const layer = item.getAttribute('data-layer') || '1';
            itemSpeeds.set(item, { speed, layer });
            gsap.set(item, { y: 0 });
            console.log(`Item Layer ${layer} - Speed: ${speed}x`);
        });
        
        // Create ScrollTrigger animations for each item
        // Use gallery as trigger but calculate movement based on individual speeds
        galleryItems.forEach((item, index) => {
            const { speed, layer } = itemSpeeds.get(item);
            
            // Calculate parallax movement - speed directly multiplies the movement
            // Layer 1 (1.0): moves 800px * 1.0 = 800px
            // Layer 2 (1.5): moves 800px * 1.5 = 1200px  
            // Layer 3 (1.9): moves 800px * 1.9 = 1520px
            const baseMovement = 800;
            const parallaxAmount = baseMovement * speed;
            
            // Create animation - the key is that each item has a different end position
            // which creates different movement speeds
            const scrollTrigger = gsap.to(item, {
                y: -parallaxAmount,
                ease: 'none',
                scrollTrigger: {
                    trigger: gallery,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                }
            });
            
            galleryScrollTriggers.push(scrollTrigger);
        });
        
        // Refresh ScrollTrigger to recalculate positions
        ScrollTrigger.refresh();
    }
    
    // Check if gallery tab is active
    const checkGalleryActive = () => {
        const isActive = galleryContainer.classList.contains('active');
        
        if (isActive) {
            // Wait for elements to be visible and then create triggers
            setTimeout(() => {
                // Ensure gallery is visible
                const gallery = galleryContainer.querySelector('.gallery');
                if (gallery && galleryItems.length > 0) {
                    // Force a layout recalculation
                    gallery.offsetHeight;
                    
                    // Create ScrollTriggers
                    createScrollTriggers();
                    
                    // Also add direct scroll handler as backup
                    const handleDirectScroll = () => {
                        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                        const galleryRect = gallery.getBoundingClientRect();
                        const galleryTop = scrollY + galleryRect.top;
                        const scrollProgress = Math.max(0, Math.min(1, (scrollY - galleryTop + window.innerHeight) / (galleryRect.height + window.innerHeight)));
                        
                        galleryItems.forEach((item) => {
                            const speed = parseFloat(item.getAttribute('data-speed')) || 1;
                            const baseMovement = 800;
                            const parallaxAmount = baseMovement * speed * scrollProgress;
                            item.style.transform = `translateY(${-parallaxAmount}px)`;
                        });
                    };
                    
                    window.addEventListener('scroll', handleDirectScroll, { passive: true });
                    handleDirectScroll(); // Initial call
                    
                    // Store handler for cleanup
                    galleryContainer._scrollHandler = handleDirectScroll;
                    
                    // Refresh again after a short delay to ensure everything is calculated
                    setTimeout(() => {
                        ScrollTrigger.refresh();
                    }, 200);
                }
            }, 150);
        } else {
            // Kill all ScrollTriggers when tab is inactive
            galleryScrollTriggers.forEach(trigger => {
                if (trigger && trigger.kill) trigger.kill();
            });
            galleryScrollTriggers = [];
            
            // Remove direct scroll handler if it exists
            if (galleryContainer._scrollHandler) {
                window.removeEventListener('scroll', galleryContainer._scrollHandler);
                delete galleryContainer._scrollHandler;
            }
            
            // Reset transforms
            galleryItems.forEach((item) => {
                gsap.set(item, { y: 0, clearProps: 'transform' });
                item.style.transform = '';
            });
        }
    };
    
    // Initial check
    checkGalleryActive();
    
    // Update on tab change
    const observer = new MutationObserver(checkGalleryActive);
    observer.observe(galleryContainer, { attributes: true, attributeFilter: ['class'] });
    
    // Refresh ScrollTrigger on resize
    window.addEventListener('resize', () => {
        if (galleryContainer.classList.contains('active')) {
            ScrollTrigger.refresh();
        }
    }, { passive: true });
}

function initGalleryBackgroundVideo() {
    const galleryContainer = document.getElementById('gallery');
    const videoStack = document.querySelector('.gallery-bg-video-stack');
    if (!galleryContainer || !videoStack) return;

    const videoSrc = videoStack.getAttribute('data-video-src');
    if (!videoSrc) return;

    const syncVideoPlayback = () => {
        const videos = videoStack.querySelectorAll('.gallery-bg-video');
        videos.forEach((video) => {
            video.playbackRate = 0.5;
            if (galleryContainer.classList.contains('active')) {
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {});
                }
            } else {
                video.pause();
            }
        });
    };

    const buildVideoTiles = () => {
        const stackHeight = Math.max(
            videoStack.scrollHeight,
            videoStack.clientHeight,
            galleryContainer.scrollHeight,
            galleryContainer.clientHeight
        );
        const tileCount = Math.max(1, Math.ceil(stackHeight / window.innerHeight) + 1);
        videoStack.innerHTML = '';

        for (let i = 0; i < tileCount; i++) {
            const tile = document.createElement('div');
            tile.className = 'gallery-bg-video-tile';

            const video = document.createElement('video');
            video.className = 'gallery-bg-video';
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'auto';

            const source = document.createElement('source');
            source.src = videoSrc;
            source.type = 'video/mp4';
            video.appendChild(source);

            video.addEventListener('loadedmetadata', () => {
                video.playbackRate = 0.5;
            });

            tile.appendChild(video);
            videoStack.appendChild(tile);
        }

        syncVideoPlayback();
    };

    const observer = new MutationObserver(() => {
        if (galleryContainer.classList.contains('active')) {
            // Rebuild after layout updates when gallery tab becomes visible.
            setTimeout(buildVideoTiles, 50);
        } else {
            syncVideoPlayback();
        }
    });
    observer.observe(galleryContainer, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('resize', buildVideoTiles, { passive: true });

    buildVideoTiles();
}

// Initialize gallery parallax when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for external scripts to load
        setTimeout(initGalleryParallax, 500);
        initGalleryBackgroundVideo();
    });
} else {
    setTimeout(initGalleryParallax, 500);
    initGalleryBackgroundVideo();
}

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize cart
updateCart();
syncCartVisibility(document.querySelector('.nav-tab.active')?.getAttribute('data-tab') || 'home');



// Authentication
// Replace with your Google OAuth Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = '100812908325-kdkpcm0svbldkdmggi7fuuves14j3ce0.apps.googleusercontent.com';

const AUTH_USERS_KEY = 'wweb_users';
const AUTH_SESSION_KEY = 'wweb_session';

function initAuth() {
    const authModal = document.getElementById('auth-modal');
    const signInBtn = document.getElementById('sign-in-btn');
    const registerBtn = document.getElementById('register-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    const authModalClose = document.getElementById('auth-modal-close');
    const authModalOverlay = document.getElementById('auth-modal-overlay');
    const authSwitchBtn = document.getElementById('auth-switch-btn');
    const signInForm = document.getElementById('sign-in-form');
    const registerForm = document.getElementById('register-form');

    if (!authModal) return;

    let authMode = 'sign-in';

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    }

    function getSession() {
        try {
            return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY));
        } catch {
            return null;
        }
    }

    function setSession(user) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
            email: user.email,
            name: user.name,
            provider: user.provider
        }));
    }

    function clearSession() {
        localStorage.removeItem(AUTH_SESSION_KEY);
    }

    async function hashPassword(password) {
        const data = new TextEncoder().encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Password strength checker: requires at least 9 chars, upper, lower, number and special
    function isStrongPassword(pw) {
        if (!pw || typeof pw !== 'string') return false;
        if (pw.length < 9) return false;
        const hasLower = /[a-z]/.test(pw);
        const hasUpper = /[A-Z]/.test(pw);
        const hasNumber = /[0-9]/.test(pw);
        const hasSpecial = /[!@#$%^&*(),.?"{}|<>[\]\\\/~;:_+=\-`]/.test(pw);
        return hasLower && hasUpper && hasNumber && hasSpecial;
    }

    function showAuthError(formId, message) {
        const errorEl = document.getElementById(`${formId}-error`);
        if (!errorEl) return;
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    function clearAuthErrors() {
        document.querySelectorAll('.auth-error').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
    }

    function updateAuthUI() {
        const session = getSession();
        const guestEl = document.getElementById('auth-guest');
        const userEl = document.getElementById('auth-user');
        const userNameEl = document.getElementById('auth-user-name');

        if (session) {
            guestEl?.classList.add('hidden');
            userEl?.classList.remove('hidden');
            if (userNameEl) userNameEl.textContent = session.name || session.email;
        } else {
            guestEl?.classList.remove('hidden');
            userEl?.classList.add('hidden');
        }
    }

    function setAuthMode(mode) {
        authMode = mode;
        const title = document.getElementById('auth-modal-title');
        const subtitle = document.getElementById('auth-modal-subtitle');
        const switchText = document.getElementById('auth-switch-text');
        const switchBtn = document.getElementById('auth-switch-btn');

        clearAuthErrors();

        if (mode === 'sign-in') {
            signInForm?.classList.remove('hidden');
            registerForm?.classList.add('hidden');
            if (title) title.textContent = 'Sign In';
            if (subtitle) subtitle.textContent = 'Welcome back';
            if (switchText) switchText.textContent = "Don't have an account?";
            if (switchBtn) switchBtn.textContent = 'Register';
        } else {
            signInForm?.classList.add('hidden');
            registerForm?.classList.remove('hidden');
            if (title) title.textContent = 'Register';
            if (subtitle) subtitle.textContent = 'Create your account';
            if (switchText) switchText.textContent = 'Already have an account?';
            if (switchBtn) switchBtn.textContent = 'Sign In';
        }
    }

    function openAuthModal(mode = 'sign-in') {
        setAuthMode(mode);
        authModal.classList.add('open');
        authModal.setAttribute('aria-hidden', 'false');
        renderGoogleButton();
    }

    function closeAuthModal() {
        authModal.classList.remove('open');
        authModal.setAttribute('aria-hidden', 'true');
        signInForm?.reset();
        registerForm?.reset();
        clearAuthErrors();
    }

    function loginUser(user) {
        setSession(user);
        updateAuthUI();
        closeAuthModal();
    }

    function handleGoogleCredential(response) {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            const user = {
                email: payload.email,
                name: payload.name || payload.email.split('@')[0],
                provider: 'google'
            };

            const users = getUsers();
            const existing = users.find(u => u.email === user.email);
            if (!existing) {
                users.push(user);
                saveUsers(users);
            }

            loginUser(user);
        } catch {
            showAuthError(authMode === 'sign-in' ? 'sign-in' : 'register', 'Google sign-in failed. Please try again.');
        }
    }

    function renderGoogleButton() {
        const container = document.getElementById('google-auth-btn');
        if (!container) return;

        container.innerHTML = '';

        if (typeof google === 'undefined' || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
            container.innerHTML = '<p class="auth-error" style="display:block;text-align:center;">Add your Google Client ID in script.js to enable Google sign-in.</p>';
            return;
        }

        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredential
        });

        google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: container.offsetWidth || 340,
            text: authMode === 'register' ? 'signup_with' : 'signin_with'
        });
    }

    signInBtn?.addEventListener('click', () => openAuthModal('sign-in'));
    registerBtn?.addEventListener('click', () => openAuthModal('register'));
    authModalClose?.addEventListener('click', closeAuthModal);
    authModalOverlay?.addEventListener('click', closeAuthModal);

    authSwitchBtn?.addEventListener('click', () => {
        setAuthMode(authMode === 'sign-in' ? 'register' : 'sign-in');
        renderGoogleButton();
    });

    signOutBtn?.addEventListener('click', () => {
        clearSession();
        updateAuthUI();
    });

    signInForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthErrors();

        const email = document.getElementById('sign-in-email').value.trim().toLowerCase();
        const password = document.getElementById('sign-in-password').value;
        const users = getUsers();
        const user = users.find(u => u.email === email && u.provider === 'local');

        if (!user) {
            showAuthError('sign-in', 'No account found with this email.');
            return;
        }

        const passwordHash = await hashPassword(password);
        if (user.passwordHash !== passwordHash) {
            showAuthError('sign-in', 'Incorrect password.');
            return;
        }

        loginUser({ email: user.email, name: user.name, provider: 'local' });
    });

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthErrors();

        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim().toLowerCase();
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const users = getUsers();

        if (password !== confirm) {
            showAuthError('register', 'Passwords do not match.');
            return;
        }

        // Enforce length and strength requirements
        if (!isStrongPassword(password)) {
            showAuthError('register', 'Password must be at least 9 characters and include uppercase, lowercase, a number, and a special character.');
            return;
        }

        if (users.some(u => u.email === email)) {
            showAuthError('register', 'An account with this email already exists.');
            return;
        }

        const passwordHash = await hashPassword(password);
        users.push({ email, name, passwordHash, provider: 'local' });
        saveUsers(users);
        loginUser({ email, name, provider: 'local' });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal.classList.contains('open')) {
            closeAuthModal();
        }
    });

    updateAuthUI();

    if (typeof google !== 'undefined') {
        renderGoogleButton();
    } else {
        window.addEventListener('load', renderGoogleButton);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

// Apply double-struck text after ensuring the math font is available
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyDoubleStruckAfterFont);
} else {
    applyDoubleStruckAfterFont();
}

