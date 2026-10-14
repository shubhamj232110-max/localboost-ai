"use strict";


/* =========================================================
   LOCALBOOST AI — SHARED FRONTEND SCRIPT
========================================================= */


/* -------------------------
   Mobile navigation
------------------------- */


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


/* -------------------------
   Home-page slider
------------------------- */


const slides = document.querySelectorAll(".slide");
const previousSlideButton = document.getElementById("previousSlide");
const nextSlideButton = document.getElementById("nextSlide");
let currentSlide = 0;


function showSlide(index) {
  if (!slides.length) return;


  slides.forEach((slide) => slide.classList.remove("active"));
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


/* -------------------------
   Scroll reveal
------------------------- */


const revealElements = document.querySelectorAll(".reveal");


if ("IntersectionObserver" in window && revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );


  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}


/* -------------------------
   Home-page typewriter
------------------------- */


const typewriterText = document.getElementById("typewriterText");


if (typewriterText) {
  const fullText = typewriterText.textContent.trim();
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  if (prefersReducedMotion) {
    typewriterText.textContent = fullText;
    typewriterText.classList.add("typewriter-done");
  } else {
    typewriterText.textContent = "";
    let characterIndex = 0;


    function typeNextCharacter() {
      if (characterIndex < fullText.length) {
        typewriterText.textContent += fullText.charAt(characterIndex);
        characterIndex += 1;
        window.setTimeout(typeNextCharacter, 45);
      } else {
        typewriterText.classList.add("typewriter-done");
      }
    }


    window.setTimeout(typeNextCharacter, 400);
  }
}


/* -------------------------
   URL preselection
------------------------- */


const urlParams = new URLSearchParams(window.location.search);


const categorySelect = document.getElementById("category");


if (categorySelect && urlParams.get("category") === "gym") {
  categorySelect.value = "Gym / Fitness / Yoga";
}


const requestedPlanHidden = document.getElementById("requestedPlanHidden");
const requestedPlanSelect = document.getElementById("requestedPlan");
const planFromUrl = urlParams.get("plan");
const allowedPlans = ["free", "starter", "growth"];


if (planFromUrl && allowedPlans.includes(planFromUrl)) {
  if (requestedPlanHidden) {
    requestedPlanHidden.value = planFromUrl;
  }


  if (requestedPlanSelect) {
    requestedPlanSelect.value = planFromUrl;
  }
}


/* =========================================================
   GENERATOR MULTI-STEP FORM
========================================================= */


const generatorForm = document.getElementById("generatorForm");
const formSteps = Array.from(
  document.querySelectorAll("[data-form-step]")
);
const progressSteps = Array.from(
  document.querySelectorAll("[data-progress-step]")
);
const progressTrackFill = document.getElementById("progressTrackFill");
const progressTrackFillTwo = document.getElementById("progressTrackFillTwo");
const submitButton = document.getElementById("submitButton");
const formResponse = document.getElementById("formResponse");


let currentFormStep = 1;


function updateFormProgress(stepNumber) {
  progressSteps.forEach((item) => {
    const itemNumber = Number(item.dataset.progressStep);


    item.classList.toggle("active", itemNumber === stepNumber);
    item.classList.toggle("completed", itemNumber < stepNumber);
  });


  if (progressTrackFill) {
    progressTrackFill.style.width = stepNumber >= 2 ? "100%" : "0%";
  }


  if (progressTrackFillTwo) {
    progressTrackFillTwo.style.width = stepNumber >= 3 ? "100%" : "0%";
  }
}


function getFormStep(stepNumber) {
  return document.querySelector(`[data-form-step="${stepNumber}"]`);
}


function showFormStep(stepNumber, direction = "next") {
  const currentElement = getFormStep(currentFormStep);
  const nextElement = getFormStep(stepNumber);


  if (!nextElement) return;


  if (currentElement && currentElement !== nextElement) {
    currentElement.hidden = true;
    currentElement.classList.remove(
      "active",
      "leaving-next",
      "leaving-back"
    );
  }


  nextElement.hidden = false;
  nextElement.classList.remove("leaving-next", "leaving-back");
  nextElement.classList.add("active");


  currentFormStep = stepNumber;
  updateFormProgress(stepNumber);


  const firstField = nextElement.querySelector(
    'input:not([type="hidden"]), select, textarea'
  );


  if (firstField) {
    window.setTimeout(() => {
      firstField.focus({ preventScroll: true });
    }, 180);
  }
}


function validateVisibleStep() {
  const currentElement = getFormStep(currentFormStep);


  if (!currentElement) return true;


  const fields = currentElement.querySelectorAll(
    "input, select, textarea"
  );


  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      field.focus();
      return false;
    }
  }


  return true;
}


document.querySelectorAll(".step-next").forEach((button) => {
  button.addEventListener("click", () => {
    if (!validateVisibleStep()) return;
    if (currentFormStep >= formSteps.length) return;


    const currentElement = getFormStep(currentFormStep);


    if (currentElement) {
      currentElement.classList.add("leaving-next");
    }


    const nextStep = currentFormStep + 1;


    window.setTimeout(() => {
      showFormStep(nextStep, "next");
    }, 180);
  });
});


document.querySelectorAll(".step-back").forEach((button) => {
  button.addEventListener("click", () => {
    if (currentFormStep <= 1) return;


    const currentElement = getFormStep(currentFormStep);


    if (currentElement) {
      currentElement.classList.add("leaving-back");
    }


    const previousStep = currentFormStep - 1;


    window.setTimeout(() => {
      showFormStep(previousStep, "back");
    }, 180);
  });
});


function setSubmitState(state, label) {
  if (!submitButton) return;


  const labelElement = submitButton.querySelector(".submit-button-label");


  submitButton.classList.remove("is-loading", "is-success", "is-error");


  if (state) {
    submitButton.classList.add(state);
  }


  if (labelElement && label) {
    labelElement.textContent = label;
  }


  submitButton.disabled = state === "is-loading" || state === "is-success";
}


function showFormResponse(message, isError = false) {
  if (!formResponse) return;


  formResponse.hidden = false;
  formResponse.textContent = message;
  formResponse.classList.toggle("error", isError);
}


if (generatorForm) {
  updateFormProgress(1);


  generatorForm.addEventListener("submit", async (event) => {
    event.preventDefault();


    if (!validateVisibleStep()) return;


    if (!generatorForm.checkValidity()) {
      const invalidField = generatorForm.querySelector(":invalid");
      const invalidStep = invalidField
        ? invalidField.closest("[data-form-step]")
        : null;


      if (invalidField && invalidStep) {
        const invalidStepNumber = Number(invalidStep.dataset.formStep);


        showFormStep(invalidStepNumber, "back");


        window.setTimeout(() => {
          invalidField.reportValidity();
          invalidField.focus();
        }, 200);
      } else {
        generatorForm.reportValidity();
      }


      return;
    }


    if (formResponse) {
      formResponse.hidden = true;
      formResponse.classList.remove("error");
      formResponse.textContent = "";
    }


    setSubmitState("is-loading", "Sending request…");


    try {
      const response = await fetch(generatorForm.action, {
        method: "POST",
        body: new FormData(generatorForm),
        headers: {
          Accept: "application/json"
        }
      });


      if (!response.ok) {
        throw new Error("Formspree submission failed.");
      }


      setSubmitState("is-success", "Request received ✓");


      window.setTimeout(function () {
        window.location.href = "thank-you.html";
      }, 500);


      generatorForm.reset();


      if (categorySelect && urlParams.get("category") === "gym") {
        categorySelect.value = "Gym / Fitness / Yoga";
      }


      if (requestedPlanHidden && planFromUrl && allowedPlans.includes(planFromUrl)) {
        requestedPlanHidden.value = planFromUrl;
      }


      currentFormStep = 1;


      formSteps.forEach((step, index) => {
        step.hidden = index !== 0;
        step.classList.toggle("active", index === 0);
        step.classList.remove("leaving-next", "leaving-back");
      });


      updateFormProgress(1);
    } catch (error) {
      setSubmitState("is-error", "Could not send — try again");
      showFormResponse(
        "We could not confirm your submission. Check your internet connection and try again.",
        true
      );


      window.setTimeout(() => {
        setSubmitState("", "Submit plan request →");
      }, 2200);
    }
  });
}


/* =========================================================
   LOCALBOOST ASSISTANT
   Gemini API + local rules fallback
========================================================= */


const chatLauncher = document.getElementById("lbChatLauncher");
const chatWindow = document.getElementById("lbChatWindow");
const chatClose = document.getElementById("lbChatClose");
const chatBody = document.getElementById("lbChatBody");
const chatForm = document.getElementById("lbChatForm");
const chatInput = document.getElementById("lbChatInput");
const chatQuickActions = document.getElementById("lbChatQuickActions");


let welcomeShown = false;
let leadStep = "";
let leadData = {};
let chatHistory = [];


function scrollChatToBottom() {
  if (chatBody) {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}


function addChatMessage(html, sender = "bot") {
  if (!chatBody) return;


  const message = document.createElement("div");
  message.className = `lb-message ${sender}`;
  message.innerHTML = html;


  chatBody.appendChild(message);
  scrollChatToBottom();
}


function addUserChatMessage(text) {
  if (!chatBody) return;


  const message = document.createElement("div");
  message.className = "lb-message user";
  message.textContent = text;


  chatBody.appendChild(message);
  scrollChatToBottom();
}


function showChatTyping() {
  if (!chatBody || document.getElementById("lbTyping")) return;


  const typing = document.createElement("div");
  typing.className = "lb-typing";
  typing.id = "lbTyping";
  typing.innerHTML = "<span></span><span></span><span></span>";


  chatBody.appendChild(typing);
  scrollChatToBottom();
}


function removeChatTyping() {
  const typing = document.getElementById("lbTyping");


  if (typing) {
    typing.remove();
  }
}


function showChatWelcome() {
  if (welcomeShown) return;


  addChatMessage(
    "Namaste! 👋<br><br>" +
      "Main <strong>LocalBoost Assistant</strong> hoon. " +
      "Main marketing, coding, padhai, general knowledge aur LocalBoost services ke baare mein help kar sakta hoon.<br><br>" +
      "Aap kya jaanna chahte hain?"
  );


  welcomeShown = true;
}


function startChatLeadFlow() {
  leadData = {};
  leadStep = "name";


  addChatMessage(
    "Great! Main aapko free plan request form tak guide karta hoon.<br><br>" +
      "Pehle, aapka naam kya hai?"
  );
}


function continueChatLeadFlow(userText) {
  if (leadStep === "name") {
    leadData.name = userText;
    leadStep = "email";
    addChatMessage("Thanks! Aapka email address kya hai?");
    return true;
  }


  if (leadStep === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(userText)) {
      addChatMessage(
        "Please valid email address type karein, jaise name@example.com."
      );
      return true;
    }


    leadData.email = userText;
    leadStep = "businessType";


    addChatMessage(
      "Aapka business type kya hai?<br><br>" +
        "<strong>Gym, Salon, Restaurant, Shop, Coaching, Other</strong>"
    );


    return true;
  }


  if (leadStep === "businessType") {
    leadData.businessType = userText;
    leadStep = "businessName";
    addChatMessage("Aapke business ka naam kya hai?");
    return true;
  }


  if (leadStep === "businessName") {
    leadData.businessName = userText;
    leadStep = "city";
    addChatMessage("Aapka city ya area kya hai?");
    return true;
  }


  if (leadStep === "city") {
    leadData.city = userText;
    leadStep = "goal";


    addChatMessage(
      "Aapka main marketing goal kya hai?<br><br>" +
        "Example: more enquiries, bookings, walk-ins, Instagram growth."
    );


    return true;
  }


  if (leadStep === "goal") {
    leadData.goal = userText;
    leadStep = "";


    addChatMessage(
      `Thank you! 🙌<br><br>` +
        `Business: <strong>${leadData.businessName}</strong><br>` +
        `Category: <strong>${leadData.businessType}</strong><br>` +
        `City/Area: <strong>${leadData.city}</strong><br>` +
        `Goal: <strong>${leadData.goal}</strong><br><br>` +
        "Chat ke answers abhi form submission nahi hain. " +
        '<a href="generator.html">Official request form kholen →</a>'
    );


    return true;
  }


  return false;
}


function getChatReply(userText) {
  const text = userText.toLowerCase().trim();


  if (
    text.includes("free custom plan") ||
    text.includes("free plan") ||
    text.includes("request plan") ||
    text.includes("custom plan")
  ) {
    startChatLeadFlow();
    return null;
  }


  if (
    text.includes("gym") ||
    text.includes("fitness") ||
    text.includes("workout") ||
    text.includes("biceps")
  ) {
    return (
      "Gym plan mein local content ideas, Reel hooks, offer concepts, " +
      "Google Business Profile actions aur member-engagement ideas ho sakte hain.<br><br>" +
      '<a href="gym-growth-plan.html">Open Gym Growth Plan →</a>'
    );
  }


  if (
    text.includes("price") ||
    text.includes("pricing") ||
    text.includes("cost") ||
    text.includes("kitna") ||
    text.includes("₹")
  ) {
    return (
      "Pricing page par proposed plans diye gaye hain. Button se request form khulta hai; " +
      "abhi website payment collect nahi karti.<br><br>" +
      '<a href="pricing.html">View Pricing →</a>'
    );
  }


  if (
    text.includes("service") ||
    text.includes("feature") ||
    text.includes("localboost") ||
    text.includes("what do you do")
  ) {
    return (
      "LocalBoost plans mein content topics, captions, Reel scripts, offer ideas " +
      "aur opted-in customers ke liye WhatsApp draft ideas shamil ho sakte hain.<br><br>" +
      '<a href="features.html">See Features →</a>'
    );
  }


  if (
    text.includes("whatsapp") ||
    text.includes("message") ||
    text.includes("broadcast")
  ) {
    return (
      "WhatsApp promotional messages sirf un logon ko bhejein jinhone updates paane ki permission di ho. " +
      "Opt-out requests ko respect karein."
    );
  }


  if (
    text.includes("reel") ||
    text.includes("instagram") ||
    text.includes("caption") ||
    text.includes("content")
  ) {
    return (
      "Aap plan mein phone-friendly Reel scripts, captions aur CTAs request kar sakte hain. " +
      "Post karne se pehle offers, prices aur business details verify karein."
    );
  }


  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("hey") ||
    text.includes("namaste")
  ) {
    return (
      "Namaste! Aap Gym, Salon, Restaurant ya kisi aur local business ke liye plan request kar sakte hain. " +
      "Aapko kis cheez mein help chahiye?"
    );
  }


  return null;
}


async function replyToChat(userText) {
  showChatTyping();

  chatHistory.push({ role: "user", text: userText });

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        history: chatHistory.slice(-8)
      })
    });

    const data = await response.json();
    removeChatTyping();

    const reply = data.reply || data.error || "Maaf kijiye, jawab nahi mila.";

    chatHistory.push({ role: "model", text: reply });

    addChatMessage(reply);
  } catch (error) {
    removeChatTyping();

    const handledAsLeadFlow = continueChatLeadFlow(userText);

    if (!handledAsLeadFlow) {
      const localReply = getChatReply(userText);

      if (localReply) {
        chatHistory.push({ role: "model", text: localReply });
        addChatMessage(localReply);
      } else {
        addChatMessage(
          "Server se connection nahi hua. Dobara try karein."
        );
      }
    }
  }
}


function openChat() {
  if (!chatWindow || !chatLauncher) return;


  chatWindow.classList.add("open");
  chatWindow.setAttribute("aria-hidden", "false");
  chatLauncher.setAttribute("aria-expanded", "true");


  showChatWelcome();


  window.setTimeout(() => {
    if (chatInput) chatInput.focus();
  }, 200);
}


function closeChat() {
  if (!chatWindow || !chatLauncher) return;


  chatWindow.classList.remove("open");
  chatWindow.setAttribute("aria-hidden", "true");
  chatLauncher.setAttribute("aria-expanded", "false");
}


if (chatLauncher) {
  chatLauncher.addEventListener("click", () => {
    if (chatWindow && chatWindow.classList.contains("open")) {
      closeChat();
    } else {
      openChat();
    }
  });
}


if (chatClose) {
  chatClose.addEventListener("click", closeChat);
}


if (chatForm && chatInput) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();


    const userText = chatInput.value.trim();


    if (!userText) return;


    addUserChatMessage(userText);
    chatInput.value = "";
    replyToChat(userText);
  });
}


if (chatQuickActions) {
  chatQuickActions.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.question;


      if (!question) return;


      addUserChatMessage(question);
      replyToChat(question);
    });
  });
}