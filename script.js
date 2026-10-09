// Mobile navigation menu
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

// Home page slider
const slides = document.querySelectorAll(".slide");
const previousSlideButton = document.getElementById("previousSlide");
const nextSlideButton = document.getElementById("nextSlide");

let currentSlide = 0;

function showSlide(index) {
  if (!slides.length) return;

  slides.forEach((slide) => {
    slide.classList.remove("active");
  });

  slides[index].classList.add("active");
}

if (slides.length && previousSlideButton && nextSlideButton) {
  previousSlideButton.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  });

  nextSlideButton.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  });
}

// Formspree AJAX Submission & Smooth Redirect
document.addEventListener("DOMContentLoaded", () => {
  const generatorForm = document.getElementById("generatorForm");

  if (generatorForm) {
    generatorForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const submitButton = generatorForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      const formData = new FormData(generatorForm);

      try {
        const response = await fetch("https://formspree.io/f/mwlvoygo", {
          method: "POST",
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          // Direct thank-you page redirect
          window.location.href = "thank-you.html";
        } else {
          alert("Submission failed. Please try again.");
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Mera free plan generate karein →";
          }
        }
      } catch (error) {
        alert("Network error. Please check your connection.");
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Mera free plan generate karein →";
        }
      }
    });
  }
});