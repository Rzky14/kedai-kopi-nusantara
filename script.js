/* ==========================================================================
   Kedai Kopi Nusantara — Interaktivitas
   ========================================================================== */

(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* ---------- Fallback jika foto gagal dimuat ---------- */
    const FALLBACK_PARENTS = '.menu-image, .about-image, .gallery-item';
    const markBroken = (img) => {
        img.classList.add('is-broken');
        const parent = img.closest(FALLBACK_PARENTS);
        if (parent) parent.classList.add('img-fallback');
    };
    $$('img').forEach((img) => {
        if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
            markBroken(img);
        } else {
            img.addEventListener('error', () => markBroken(img), { once: true });
        }
    });

    /* ---------- Tahun otomatis di footer ---------- */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Navigasi mobile ---------- */
    const hamburger = $('#hamburger');
    const navMenu = $('#nav-menu');

    const setMenu = (open) => {
        navMenu.classList.toggle('active', open);
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
        document.body.style.overflow = open ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => {
        setMenu(!navMenu.classList.contains('active'));
    });

    // Tutup menu saat tautan dipilih atau tombol Escape ditekan
    $$('.nav-menu a').forEach((link) => {
        link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            setMenu(false);
            closeLightbox();
        }
    });

    /* ---------- Navbar berubah saat digulir ---------- */
    const navbar = $('#navbar');
    const onScrollNavbar = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    };

    /* ---------- Tombol kembali ke atas ---------- */
    const scrollTopBtn = $('#scrollTop');
    const onScrollTopBtn = () => {
        scrollTopBtn.classList.toggle('show', window.scrollY > 400);
    };

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    /* ---------- Tautan aktif sesuai bagian yang terlihat ---------- */
    const navLinks = $$('.nav-menu a[href^="#"]');
    const sections = navLinks
        .map((link) => $(link.getAttribute('href')))
        .filter(Boolean);

    const setActiveLink = (id) => {
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
    };

    if ('IntersectionObserver' in window && sections.length) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActiveLink(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach((section) => sectionObserver.observe(section));
    }

    // Gabungkan event scroll dalam satu handler (lebih ringan)
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            onScrollNavbar();
            onScrollTopBtn();
            ticking = false;
        });
    }, { passive: true });

    onScrollNavbar();
    onScrollTopBtn();

    /* ---------- Menu tabs (Kopi / Non-Kopi / Makanan) ---------- */
    const tabBtns = $$('.tab-btn');
    const menuGrids = $$('.menu-grid');

    const activateTab = (btn) => {
        tabBtns.forEach((b) => {
            const isActive = b === btn;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', String(isActive));
            b.tabIndex = isActive ? 0 : -1;
        });

        menuGrids.forEach((grid) => {
            grid.classList.toggle('active', grid.id === btn.dataset.tab);
        });
    };

    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => activateTab(btn));
    });

    // Navigasi panah kiri/kanan antar tab
    $('.menu-tabs')?.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const current = tabBtns.findIndex((b) => b.classList.contains('active'));
        const delta = e.key === 'ArrowRight' ? 1 : -1;
        const next = tabBtns[(current + delta + tabBtns.length) % tabBtns.length];
        next.focus();
        activateTab(next);
    });

    /* ---------- Nomor WhatsApp & pembuka pesan ---------- */
    const WA_NUMBER = '6281234567890';
    const openWhatsApp = (text) => {
        const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener');
    };

    /* ---------- Tombol pesan (diteruskan ke WhatsApp) ---------- */
    $$('.btn-order').forEach((btn) => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.menu-card');
            const menuItem = card.querySelector('h3').textContent;
            const price = card.querySelector('.price').textContent;

            openWhatsApp(`Halo Kedai Kopi Nusantara, saya ingin memesan ${menuItem} (${price}).`);
        });
    });

    /* ---------- Form kontak ---------- */
    const contactForm = $('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = contactForm.elements.name.value.trim();
            const email = contactForm.elements.email.value.trim();
            const phone = contactForm.elements.phone.value.trim();
            const message = contactForm.elements.message.value.trim();

            const text = [
                'Halo Kedai Kopi Nusantara,',
                message,
                '',
                `Nama: ${name}`,
                `Email: ${email}`,
                phone ? `Telepon: ${phone}` : null
            ].filter(Boolean).join('\n');

            openWhatsApp(text);
            contactForm.reset();
        });
    }

    /* ---------- Newsletter ---------- */
    const newsletterForm = $('#newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = newsletterForm.querySelector('input[type="email"]').value.trim();

            alert(`Terima kasih!\n\nAnda telah berlangganan newsletter dengan email: ${email}`);
            newsletterForm.reset();
        });
    }

    /* ---------- Lightbox galeri ---------- */
    const lightbox = $('#lightbox');
    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    let lastFocused = null;

    function openLightbox(src, alt) {
        lastFocused = document.activeElement;
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.hidden = false;
        lightboxClose.focus();
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (lightbox.hidden) return;
        lightbox.hidden = true;
        lightboxImg.src = '';
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    $$('.gallery-item').forEach((item) => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            openLightbox(img.currentSrc || img.src, img.alt);
        });
    });

    lightbox.addEventListener('click', closeLightbox);

    /* ---------- Animasi muncul saat digulir ---------- */
    const revealEls = $$('.reveal');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('in'));
    } else {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('in');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach((el, i) => {
            // Jeda kecil berurutan untuk elemen dalam satu grup
            el.style.transitionDelay = `${(i % 3) * 90}ms`;
            revealObserver.observe(el);
        });
    }

    /* ---------- Counter statistik ---------- */
    const animateCounter = (el) => {
        const target = Number(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();

        const frame = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(frame);
        };

        requestAnimationFrame(frame);
    };

    const statsEl = $('#hero-stats');
    if (statsEl) {
        const numbers = $$('.stat-number', statsEl);

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            // Tampilkan nilai akhir apa adanya
        } else {
            const statsObserver = new IntersectionObserver((entries, obs) => {
                if (!entries[0].isIntersecting) return;
                numbers.forEach((el) => {
                    el.textContent = '0' + (el.dataset.suffix || '');
                    animateCounter(el);
                });
                obs.disconnect();
            }, { threshold: 0.5 });

            statsObserver.observe(statsEl);
        }
    }
})();
