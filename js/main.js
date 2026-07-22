/* ============================================================
   CJ.Plug Website - Main JavaScript
   Pure vanilla JS, no framework dependencies
   ============================================================ */

(function () {
    'use strict';

    // ----- DOM References -----
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    const allNavLinks = navLinks.querySelectorAll('a');

    // ----- Navbar Scroll Effect -----
    function onScroll() {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ----- Mobile Menu Toggle -----
    function toggleMobileMenu() {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }

    mobileToggle.addEventListener('click', toggleMobileMenu);

    allNavLinks.forEach(function (link) {
        link.addEventListener('click', closeMobileMenu);
    });

    // ----- Scroll Animation (Intersection Observer) -----
    const animatedElements = document.querySelectorAll('[data-animate]');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        animatedElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        // Fallback: show all immediately
        animatedElements.forEach(function (el) {
            el.classList.add('animate-visible');
        });
    }

    // ----- Feature Card Mouse Glow Effect -----
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });

    // ----- Smooth Scroll for Anchor Links (with offset) -----
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = navbar.offsetHeight + 16;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ----- Active Nav Link Highlight on Scroll -----
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNavLink() {
        const scrollPos = window.scrollY + navbar.offsetHeight + 80;

        sections.forEach(function (section) {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;

            if (scrollPos >= top && scrollPos < bottom) {
                const id = section.getAttribute('id');
                allNavLinks.forEach(function (link) {
                    link.style.color = '';
                    if (link.getAttribute('href') === '#' + id) {
                        link.style.color = 'var(--color-primary-light)';
                    }
                });
            }
        });
    }

    // ----- Back to Top Button -----
    const backToTop = document.getElementById('backToTop');

    function updateBackToTop() {
        if (window.scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    // ----- Combined Scroll Handler (throttled) -----
    let ticking = false;
    function scrollHandler() {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                onScroll();
                updateActiveNavLink();
                updateBackToTop();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', scrollHandler, { passive: true });

    // ----- Initial calls -----
    onScroll();
    updateBackToTop();

    // ----- Lightbox -----
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.querySelector('.lightbox-close');
    let lightboxTrigger = null;

    function openLightbox(src, triggerEl) {
        lightboxTrigger = triggerEl || null;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus the close button for keyboard accessibility
        if (lightboxClose) {
            lightboxClose.focus();
        }
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightboxImg.src = '';
        document.body.style.overflow = '';
        // Return focus to the element that triggered the lightbox
        if (lightboxTrigger) {
            lightboxTrigger.focus();
        }
    }

    // Click on lightbox overlay to close
    lightbox.addEventListener('click', closeLightbox);

    // Close button click & keyboard
    lightboxClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closeLightbox();
    });

    lightboxClose.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            closeLightbox();
        }
    });

    // ESC to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Prevent clicks on lightbox image from closing the overlay
    lightboxImg.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    // ----- Screenshot Click Handlers (replaces inline onclick) -----
    document.querySelectorAll('.screenshot-img').forEach(function (img) {
        img.addEventListener('click', function () {
            openLightbox(this.src, this);
        });

        // Keyboard support: Enter or Space to open lightbox
        img.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(this.src, this);
            }
        });

        // Make images focusable and indicate they're interactive
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', '点击放大: ' + img.alt);
    });

    // ----- Copy Button for Code Blocks -----
    document.querySelectorAll('.code-block').forEach(function (block) {
        const codeEl = block.querySelector('code');
        if (!codeEl) return;

        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.type = 'button';
        btn.textContent = '复制';
        btn.setAttribute('aria-label', '复制代码');

        btn.addEventListener('click', function () {
            const text = codeEl.textContent;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    btn.textContent = '已复制';
                    btn.classList.add('copied');
                    setTimeout(function () {
                        btn.textContent = '复制';
                        btn.classList.remove('copied');
                    }, 2000);
                }).catch(function () {
                    fallbackCopy(text, btn);
                });
            } else {
                fallbackCopy(text, btn);
            }
        });

        block.appendChild(btn);
    });

    function fallbackCopy(text, btn) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            btn.textContent = '已复制';
            btn.classList.add('copied');
            setTimeout(function () {
                btn.textContent = '复制';
                btn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            btn.textContent = '失败';
            setTimeout(function () {
                btn.textContent = '复制';
            }, 2000);
        }
        document.body.removeChild(textarea);
    }

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ----- FAQ Accordion -----
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(function (question) {
        question.addEventListener('click', function () {
            const item = this.closest('.faq-item');
            const isOpen = item.classList.contains('open');

            // Close all other items
            document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
                openItem.classList.remove('open');
                openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current item
            if (!isOpen) {
                item.classList.add('open');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ----- Download Toast -----
    const toast = document.getElementById('toast');
    const downloadBtns = document.querySelectorAll('.download-card a');
    downloadBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            toast.textContent = '正在下载，请稍候...';
            toast.classList.add('visible');
            setTimeout(function () {
                toast.classList.remove('visible');
            }, 3000);
        });
    });

})();
