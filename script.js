const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

const slides = document.querySelectorAll(".slide");
const previousSlideButton = document.getElementById("previousSlide");
const nextSlideButton = document.getElementById("nextSlide");
let currentSlide = 0;

function showSlide(index) {
  if (!slides.length) return;

  slides.forEach((slide) => slide.classList.remove("active"));
  slides[index].classList.add("active");
}

if (previousSlideButton && nextSlideButton && slides.length) {
  previousSlideButton.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  });

  nextSlideButton.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  });
}

const generatorForm = document.getElementById("generatorForm");
const formMessage = document.getElementById("formMessage");

if (generatorForm && formMessage) {
  generatorForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const businessName = document.getElementById("businessName").value.trim();

    formMessage.textContent =
      `Thanks${businessName ? `, ${businessName}` : ""}! Aapka form receive ho gaya. Real AI plan generation hum next phase mein connect karenge.`;

    generatorForm.reset();
  });
}