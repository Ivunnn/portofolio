const words = ["a Web Developer.", "an Informatics Graduate."];
let i = 0;
let timer;
let isDeleting = false;
let currentWord = "";
let currentIndex = 0;

// Typing Effect
function typeEffect() {
  const outputElement = document.getElementById("typed-output");
  
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

    if (currentIndex == words[i].length) {
      isDeleting = true;
      clearTimeout(timer);
      timer = setTimeout(typeEffect, 1500);
      return;
    }

    if (isDeleting && currentWord === "") {
      isDeleting = false;
      i++;
      if (i == words.length) {
        i = 0;
      }
    }
  }
  
  const speed = isDeleting ? 50 : 100;
  timer = setTimeout(typeEffect, speed);
}

document.addEventListener("DOMContentLoaded", function() {
  typeEffect();

  // Momen entrance hero: memicu animasi berurutan begitu halaman siap
  const heroContent = document.getElementById("heroContent");
  const heroImage = document.querySelector(".hero-image.hero-item");
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (heroContent) heroContent.classList.add("loaded");
      if (heroImage) heroImage.classList.add("loaded");
    }, 80);
  });
});

/* =========================================
   SCROLL REVEAL (dengan variasi arah: up, left, right, zoom)
========================================= */
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Elemen dengan animasi reveal saat scroll (kartu skill/project, section title, dsb)
const revealElements = document.querySelectorAll('.reveal, .fade-up, .title-reveal');

revealElements.forEach((el, index) => {
  // Beri sedikit delay bertahap khusus untuk grid card agar muncul berurutan
  if (el.classList.contains('skill-card') || el.classList.contains('project-card')) {
    const siblings = el.parentElement.children;
    const localIndex = Array.prototype.indexOf.call(siblings, el);
    el.style.transitionDelay = `${(localIndex % 3) * 0.15}s`;
  }
  observer.observe(el);
});

/* =========================================
   1. HAMBURGER MENU LOGIC
========================================= */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');
const hamburgerIcon = document.querySelector('.hamburger i');

// Buka/Tutup Menu
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
    
    // Ubah icon burger jadi silang (X)
    if(navLinks.classList.contains('nav-active')) {
        hamburgerIcon.classList.remove('fa-bars');
        hamburgerIcon.classList.add('fa-xmark');
    } else {
        hamburgerIcon.classList.remove('fa-xmark');
        hamburgerIcon.classList.add('fa-bars');
    }
});

// Tutup menu otomatis saat link diklik
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('nav-active');
        hamburgerIcon.classList.remove('fa-xmark');
        hamburgerIcon.classList.add('fa-bars');
    });
});

/* =========================================
   2. NAVBAR ACTIVE STATE + SHRINK ON SCROLL
========================================= */
const sections = document.querySelectorAll('section');
const navbar = document.querySelector('.navbar');
const scrollProgress = document.getElementById('scrollProgress');
const backToTopBtn = document.getElementById('backToTop');
const blob1 = document.getElementById('blob1');
const blob2 = document.getElementById('blob2');

let ticking = false;

function handleScroll() {
    const scrollY = window.pageYOffset;

    // Navbar mengecil & lebih solid saat discroll
    if (navbar) {
        navbar.classList.toggle('scrolled', scrollY > 40);
    }

    // Progress bar scroll di bagian atas halaman
    if (scrollProgress) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        scrollProgress.style.width = `${progress}%`;
    }

    // Tombol back-to-top muncul setelah scroll cukup jauh
    if (backToTopBtn) {
        backToTopBtn.classList.toggle('show', scrollY > 500);
    }

    // Efek parallax halus pada blob latar belakang
    if (blob1) blob1.style.transform = `translateY(${scrollY * 0.12}px)`;
    if (blob2) blob2.style.transform = `translateY(${scrollY * -0.1}px)`;

    // Deteksi section aktif untuk navigasi
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').includes(current)) {
            item.classList.add('active');
        }
    });

    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
    }
});

// Jalankan sekali di awal supaya state sesuai posisi scroll saat reload
handleScroll();

// Klik tombol back-to-top untuk scroll halus ke atas
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* =========================================
   3. BASIC SECURITY (ANTI-INSPECT & COPY)
========================================= */
// Matikan Klik Kanan
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Matikan Shortcut Inspect Element (F12, Ctrl+Shift+I, Ctrl+U, dll)
document.onkeydown = function(e) {
    if (e.keyCode == 123) { // F12
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { // Ctrl+Shift+I
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) { // Ctrl+Shift+C
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { // Ctrl+Shift+J
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { // Ctrl+U (View Source)
        return false;
    }
};