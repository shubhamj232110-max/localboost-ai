"use strict";

async function loadFragment(elementId, fileName) {
  const target = document.getElementById(elementId);

  if (!target) {
    throw new Error("Placeholder nahi mila: " + elementId);
  }

  const response = await fetch(fileName);

  if (!response.ok) {
    throw new Error(
      fileName + " load nahi hua. HTTP status: " + response.status
    );
  }

  target.innerHTML = await response.text();
}

function loadScript(fileName) {
  return new Promise(function (resolve, reject) {
    const existingScript = document.querySelector(
      'script[data-loaded-file="' + fileName + '"]'
    );

    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = fileName;
    script.dataset.loadedFile = fileName;

    script.onload = function () {
      resolve();
    };

    script.onerror = function () {
      reject(new Error(fileName + " load nahi hui."));
    };

    document.body.appendChild(script);
  });
}

async function loadSharedLayout() {
  try {
    // Pehle HTML fragments placeholders mein load honge.
    await Promise.all([
      loadFragment("sharedFooter", "footer.html"),
      loadFragment("sharedChatbot", "chatbot.html")
    ]);

    // Ab chatbot ke elements page par hain, isliye chatbot.js kaam karegi.
    await loadScript("chatbot.js");

    // Phir site-wide navigation, slider aur form wali script load hogi.
    await loadScript("script.js");

    console.log("Footer, chatbot aur site script load ho gaye.");
  } catch (error) {
    console.error("Shared layout error:", error);
  }
}

loadSharedLayout();