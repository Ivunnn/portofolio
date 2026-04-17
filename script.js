const words = ["Web Developer.", "GIS Enthusiast.", "Freelancer."];
let i = 0;
let timer;
let isDeleting = false;
let currentWord = "";
let currentIndex = 0;

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
            timer = setTimeout(typeEffect, 1500); // Pause before deleting
            return;
        }

        if (isDeleting && currentWord === "") {
            isDeleting = false;
            i++;
            if (i == words.length) {
                i = 0; // Loop back
            }
        }
    }
    
    const speed = isDeleting ? 50 : 100;
    timer = setTimeout(typeEffect, speed);
}

// Start typing effect when page loads
document.addEventListener("DOMContentLoaded", function() {
    typeEffect();
});

// Reveal elements on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = 0;
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.8s ease-out';
    observer.observe(section);
});