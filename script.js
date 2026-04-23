const words = ["Web Developer.", "Undergraduate Student."];
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
});

// Advanced Scroll Reveal with Stagger Effect
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Add visible class
      entry.target.classList.add('visible');
      // Unobserve after animating once to improve performance
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Select all elements with fade-up class
const fadeElements = document.querySelectorAll('.fade-up');

fadeElements.forEach((el, index) => {
  // Optional: add slight delay based on order for grid items
  if (el.classList.contains('skill-card') || el.classList.contains('project-card')) {
    el.style.transitionDelay = `${(index % 3) * 0.15}s`;
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
   2. NAVBAR ACTIVE STATE ON SCROLL
========================================= */
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // Deteksi jika user sedang berada di section tersebut
        if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').includes(current)) {
            item.classList.add('active');
        }
    });
});

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