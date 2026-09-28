document.addEventListener("DOMContentLoaded", () => {

    // 1. Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 0.7,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.2,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) lenis.scrollTo(targetElement, { offset: -80 });
        });
    });

    // 2. Vanilla Tilt
    VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
        max: 10,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
    });

    // 3. Typing Effect (dijalankan setelah preloader selesai)
    const words = ["a Web Developer.", "ready to work.", "open to opportunities."];
    let i = 0;
    let timer;
    let isDeleting = false;
    let currentWord = "";
    let currentIndex = 0;
    const outputElement = document.getElementById("typewriter");

    function typeEffect() {
        if (i < words.length) {
            if (!isDeleting && currentIndex <= words[i].length) {
                currentWord = words[i].substring(0, currentIndex);
                currentIndex++;
                outputElement.innerHTML = currentWord;
            }
            if (isDeleting && currentIndex <= words[i].length) {
                currentWord = words[i].substring(0, currentIndex);
                currentIndex--;
                outputElement.innerHTML = currentWord;
            }
            if (currentIndex === words[i].length) {
                isDeleting = true;
                clearTimeout(timer);
                timer = setTimeout(typeEffect, 2000);
                return;
            }
            if (isDeleting && currentWord === "") {
                isDeleting = false;
                i++;
                if (i === words.length) i = 0;
            }
        }
        const speed = isDeleting ? 50 : 100;
        timer = setTimeout(typeEffect, speed);
    }

    // 4. Scroll Reveal (dijalankan setelah preloader selesai)
    const revealElements = document.querySelectorAll('.reveal');
    const scrollProgress = document.getElementById('scroll-progress');
    const navbar = document.getElementById('navbar');

    function initReveal() {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => revealObserver.observe(el));

        setTimeout(() => {
            revealElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) el.classList.add('active');
            });
        }, 300);
    }

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (docHeight > 0) {
            scrollProgress.style.width = `${(scrollY / docHeight) * 100}%`;
        }

        if (scrollY > 50) {
            navbar.classList.add('py-3');
            navbar.classList.remove('py-6');
        } else {
            navbar.classList.add('py-6');
            navbar.classList.remove('py-3');
        }
    });

    // 5. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileIcon = mobileMenuBtn.querySelector('i');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
        const isOpen = mobileMenu.classList.contains('opacity-100');
        if (isOpen) {
            mobileMenu.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
            mobileMenu.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
            mobileIcon.classList.remove('fa-xmark');
            mobileIcon.classList.add('fa-bars');
        } else {
            mobileMenu.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-4');
            mobileMenu.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
            mobileIcon.classList.remove('fa-bars');
            mobileIcon.classList.add('fa-xmark');
        }
    }

    mobileMenuBtn.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

    // 6. Preloader
    const SHOW_ONCE_PER_SESSION = false; // ubah ke false jika ingin tampil setiap refresh
    const DURATION = 3000;              // durasi loading tetap (ms)

    const preloader = document.getElementById('preloader');
    const barEl = document.getElementById('pre-bar-fill');

    function startSite() {
        document.body.classList.remove('is-loading');
        lenis.start();
        initReveal();
        typeEffect();
    }

    let alreadySeen = false;
    try { alreadySeen = SHOW_ONCE_PER_SESSION && sessionStorage.getItem('preloaderShown') === '1'; } catch (e) {}

    if (alreadySeen) {
        preloader.remove();
        startSite();
    } else {
        lenis.stop();
        window.scrollTo(0, 0);

        const startTime = performance.now();

        function finish() {
            try { sessionStorage.setItem('preloaderShown', '1'); } catch (e) {}
            setTimeout(() => {
                preloader.classList.add('leaving');   // logo zoom + overlay fade
                setTimeout(startSite, 500);           // hero mulai muncul saat overlay memudar
                setTimeout(() => preloader.remove(), 1500);
            }, 300);
        }

        function tick(now) {
            const t = Math.min((now - startTime) / DURATION, 1);
            const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            barEl.style.transform = `scaleX(${eased})`;

            if (t < 1) requestAnimationFrame(tick);
            else finish();
        }
        requestAnimationFrame(tick);
    }
});