"use strict";

(function () {
  const chatLauncher = document.getElementById("lbChatLauncher");
  const chatWindow = document.getElementById("lbChatWindow");
  const chatClose = document.getElementById("lbChatClose");
  const chatBody = document.getElementById("lbChatBody");
  const chatForm = document.getElementById("lbChatForm");
  const chatInput = document.getElementById("lbChatInput");
  const quickActions = document.getElementById("lbChatQuickActions");
  const newChatButton = document.getElementById("lbChatNew");
  const statusText = document.getElementById("lbChatStatus");
  const sendButton = chatForm
    ? chatForm.querySelector('button[type="submit"]')
    : null;

  if (
    !chatLauncher ||
    !chatWindow ||
    !chatClose ||
    !chatBody ||
    !chatForm ||
    !chatInput ||
    !newChatButton ||
    !statusText ||
    !sendButton
  ) {
    console.error("Chatbot elements nahi mile. chatbot.html ke IDs check karein.");
    return;
  }

  let welcomeShown = false;
  let isWaitingForReply = false;
  let knowledgeEntries = [];
  let knowledgeLoadFailed = false;
  let lastTopicEntry = null;
  let lastUserQuestion = "";

  const knowledgeFiles = [
    "knowledge/general/general.jsonl",
    "knowledge/science/science.jsonl",
    "knowledge/science/artificial_intelligence.jsonl",
    "knowledge/maths/maths.jsonl",
    "knowledge/programming/programming.jsonl",
    "knowledge/hindi_english/hindi_english.jsonl",
    "knowledge/conversation/conversation.jsonl",
    "knowledge/reasoning/reasoning.jsonl",
    "knowledge/computer/computer.jsonl",
    "knowledge/writing/writing.jsonl",
    "knowledge/safety/safety.jsonl",
    "knowledge/conversation/shubham_profile.jsonl"
  ];

  const ignoredSearchWords = new Set([
    "a", "an", "and", "are", "can", "do", "does", "for", "how", "i",
    "in", "is", "it", "ka", "kya", "me", "mujhe", "of", "please", "the",
    "to", "what", "when", "where", "which", "who", "why", "with", "you",
    "hai", "hain", "ho", "kaise", "ke", "ki", "ko", "mein", "mujhko",
    "par", "se", "tha", "the", "thi", "tell", "about", "explain", "meaning",
    "definition", "information", "simple", "hindi", "samjhao", "karta",
    "karte", "work", "works", "working", "does"
  ]);

  function scrollChatToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = "lb-message " + sender;
    message.textContent = text;
    chatBody.appendChild(message);
    scrollChatToBottom();
  }

  function addTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "lb-typing";
    indicator.id = "lbChatTyping";
    indicator.setAttribute("role", "status");
    indicator.setAttribute("aria-label", "Jawab taiyar ho raha hai");

    for (let index = 0; index < 3; index += 1) {
      indicator.appendChild(document.createElement("span"));
    }

    chatBody.appendChild(indicator);
    scrollChatToBottom();
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById("lbChatTyping");
    if (indicator) indicator.remove();
  }

  function showWelcome() {
    if (welcomeShown) return;

    addMessage(
      "Namaste! Main LocalBoost AI hoon. Bataiye, aaj aap kis cheez mein madad chahte hain? Main koshish karunga ki jawab seedha aur kaam ka ho.",
      "bot"
    );
    welcomeShown = true;
  }

  function setBusy(busy) {
    isWaitingForReply = busy;
    chatInput.disabled = busy;
    sendButton.disabled = busy;
    newChatButton.disabled = busy;
    chatForm.setAttribute("aria-busy", String(busy));
  }

  function openChat() {
    chatWindow.classList.add("open");
    chatWindow.setAttribute("aria-hidden", "false");
    chatLauncher.setAttribute("aria-expanded", "true");
    showWelcome();

    window.setTimeout(function () {
      chatInput.focus();
    }, 150);
  }

  function closeChat() {
    chatWindow.classList.remove("open");
    chatWindow.setAttribute("aria-hidden", "true");
    chatLauncher.setAttribute("aria-expanded", "false");
  }

  function searchTokens(value) {
    return value
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}+#.]+/gu, " ")
      .split(/\s+/)
      .filter(function (word) {
        return word.length > 1 && !ignoredSearchWords.has(word);
      });
  }

  async function loadKnowledge() {
    const results = await Promise.allSettled(
      knowledgeFiles.map(async function (fileName) {
        const response = await fetch(fileName);
        if (!response.ok) {
          throw new Error(
            fileName + " load nahi hui. HTTP status: " + response.status
          );
        }

        const text = await response.text();
        return text
          .split(/\r?\n/)
          .filter(function (line) {
            return line.trim();
          })
          .map(function (line, index) {
            let entry;
            try {
              entry = JSON.parse(line);
            } catch {
              throw new Error(
                fileName + " ki line " + (index + 1) + " valid JSON nahi hai."
              );
            }

            if (
              !entry ||
              typeof entry.question !== "string" ||
              typeof entry.answer !== "string" ||
              !entry.question.trim() ||
              !entry.answer.trim()
            ) {
              throw new Error(
                fileName + " ki line " + (index + 1) +
                  " mein question aur answer dono strings hone chahiye."
              );
            }

            return {
              question: entry.question,
              answer: entry.answer,
              keywords: Array.isArray(entry.keywords)
                ? entry.keywords.filter(function (keyword) {
                    return typeof keyword === "string";
                  })
                : []
            };
          });
      })
    );

    results.forEach(function (result, index) {
      if (result.status === "fulfilled") {
        knowledgeEntries = knowledgeEntries.concat(result.value);
      } else {
        knowledgeLoadFailed = true;
        console.error(
          "Knowledge file nahi padh payi (" + knowledgeFiles[index] + "):",
          result.reason
        );
      }
    });

    statusText.textContent = knowledgeLoadFailed
      ? "Kuch jaankari abhi nahi mil rahi"
      : "Ready to help • Hindi & English";

    const statusDot = statusText.previousElementSibling;
    if (statusDot) {
      statusDot.classList.toggle("lb-chat-status-offline", knowledgeLoadFailed);
    }
  }

  function findKnowledgeEntry(userText) {
    const queryTokens = Array.from(new Set(searchTokens(userText)));
    if (queryTokens.length === 0 || knowledgeEntries.length === 0) return null;

    let bestEntry = null;
    let bestScore = 0;

    knowledgeEntries.forEach(function (entry) {
      const documentTokens = new Set(
        searchTokens(entry.question + " " + entry.keywords.join(" "))
      );
      let matchedTokens = 0;
      queryTokens.forEach(function (token) {
        if (documentTokens.has(token)) matchedTokens += 1;
      });

      if (matchedTokens === 0) return;

      const coverage = matchedTokens / queryTokens.length;
      const exactPhrase = searchTokens(entry.question).join(" ") ===
        queryTokens.join(" ");
      const score = coverage + (exactPhrase ? 1 : 0);

      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    });

    return bestScore >= 0.6 ? bestEntry : null;
  }

  function getGeneralKnowledgeReply(text) {
    if (
      text.includes("what is the date") ||
      text.includes("today's date") ||
      text.includes("todays date") ||
      text.includes("aaj ki date") ||
      text.includes("aaj tareekh") ||
      text.includes("आज की तारीख")
    ) {
      return "Aapke device ke mutabik aaj " +
        new Intl.DateTimeFormat("en-IN", {
          dateStyle: "long"
        }).format(new Date()) +
        " hai.";
    }

    if (
      text.includes("what time is it") ||
      text.includes("current time") ||
      text.includes("abhi kitne baje") ||
      text.includes("kitna time hua") ||
      text.includes("अभी कितने बजे")
    ) {
      return "Aapke device ke mutabik abhi " +
        new Intl.DateTimeFormat("en-IN", {
          timeStyle: "short"
        }).format(new Date()) +
        " baj rahe hain.";
    }

    if (
      /\b(how are you|how r u|kaise ho|kaisi ho|kaise hain|kya haal hai)\b/.test(text) ||
      text.includes("कैसे हो") ||
      text.includes("कैसी हो")
    ) {
      return "Main theek hoon aur aapki madad ke liye taiyar hoon! Aap kaise hain?";
    }

    if (
      text.includes("how old are you") ||
      text.includes("tumhari age") ||
      text.includes("aapki age") ||
      text.includes("tumhari umar") ||
      text.includes("aapki umar") ||
      text.includes("your age")
    ) {
      return "Meri insaanon jaisi umar nahi hai. Main LocalBoost website ka ek chhota computer chatbot hoon.";
    }

    if (
      text.includes("are you human") ||
      text.includes("are you real") ||
      text.includes("tum insaan") ||
      text.includes("aap insaan") ||
      text.includes("robot ho")
    ) {
      return "Main insaan nahi, website mein chalne wala ek chhota computer chatbot hoon. Mere jawab pehle se likhe rules par chalte hain.";
    }

    if (
      text.includes("can you help") ||
      text.includes("help me") ||
      text.includes("madad karoge") ||
      text.includes("meri madad") ||
      text.includes("मदद करोगे")
    ) {
      return "Haan, main koshish karunga! Aap general knowledge, simple maths, daily-life tips, ya LocalBoost aur marketing ke baare mein pooch sakte hain.";
    }

    if (
      text.includes("i love you") ||
      text.includes("love you") ||
      text.includes("main tumse pyaar") ||
      text.includes("मैं तुमसे प्यार")
    ) {
      return "Yeh bahut pyaari baat hai! Main AI chatbot hoon, isliye insaanon jaise jazbaat nahi hote, lekin main aapki madad ke liye yahan hoon.";
    }

    if (
      text.includes("favorite color") ||
      text.includes("favourite colour") ||
      text.includes("pasandida rang") ||
      text.includes("पसंदीदा रंग")
    ) {
      return "Meri apni pasand nahi hoti, lekin LocalBoost ki website ke rangon mein neela rang shamil hai. Aapka pasandida rang kaunsa hai?";
    }

    if (
      text.includes("i am bored") ||
      text.includes("i'm bored") ||
      text.includes("bore ho raha") ||
      text.includes("bore ho rahi") ||
      text.includes("बोर हो")
    ) {
      return "Chaliye kuch mazedaar karte hain! Aap mujhse ek GK sawaal, chhota joke ya simple maths ka sawaal pooch sakte hain—ya thodi walk/stretch kar sakte hain.";
    }

    if (
      text.includes("i feel sad") ||
      text.includes("i am sad") ||
      text.includes("i'm sad") ||
      text.includes("udaas hoon") ||
      text.includes("mann udaas") ||
      text.includes("मैं उदास")
    ) {
      return "Yeh sunkar afsos hua. Agar aap chahein to kisi bharosemand dost ya parivaar ke sadasya se baat karein. Aap mujhe bhi bata sakte hain ki kya hua—main sunne ki koshish karunga.";
    }

    if (
      text.includes("birthday wish") ||
      text.includes("birthday message") ||
      text.includes("janamdin ki badhai") ||
      text.includes("जन्मदिन की बधाई")
    ) {
      return "Yeh bhej sakte hain: \"Janamdin ki dher saari shubhkamnayein! Aapka aane wala saal khushiyon, sehat aur khoobsurat yaadon se bhara ho.\"";
    }

    if (
      text.includes("your name") ||
      text.includes("tumhara naam") ||
      text.includes("aapka naam") ||
      text.includes("naam kya hai")
    ) {
      return "Mera naam LocalBoost AI hai. Main aapki padhai, programming, general knowledge aur rozmarra ke sawaalon mein madad kar sakta hoon.";
    }

    if (
      text.includes("who made you") ||
      text.includes("who created you") ||
      text.includes("kisne banaya") ||
      text.includes("tumhe kisne banaya") ||
      text.includes("chatbot kisne banaya") ||
      text.includes("chatbot ko kisne banaya") ||
      text.includes("who created this chatbot")
    ) {
      return "Shubham Jaiswal ne LocalBoost chatbot banaya hai aur woh is project ke manager hain. Aap Shubham ke baare mein aur kya jaan-na chahenge?";
    }

    if (
      text.includes("weather") ||
      text.includes("mausam kaisa") ||
      text.includes("aaj ka mausam") ||
      text.includes("temperature today")
    ) {
      return "Mere paas live internet ya mausam ki jaankari nahi hai. Apne shehar ka latest weather phone ke weather app ya trusted forecast website par check karein.";
    }

    if (
      text.includes("current news") ||
      text.includes("latest news") ||
      text.includes("aaj ki khabar") ||
      text.includes("aaj ka rate") ||
      text.includes("share price today")
    ) {
      return "Mere paas live news, market rates ya current events ka access nahi hai. Latest jaankari ke liye trusted news ya official website check karein.";
    }

    if (
      text.includes("capital of india") ||
      text.includes("capital of bharat") ||
      text.includes("bharat ki rajdhani") ||
      text.includes("india ki rajdhani") ||
      text.includes("भारत की राजधानी")
    ) {
      return "Bharat (India) ki rajdhani New Delhi hai.";
    }

    if (
      text.includes("capital of france") ||
      text.includes("france ki rajdhani") ||
      text.includes("france capital")
    ) {
      return "France ki rajdhani Paris hai.";
    }

    if (
      text.includes("capital of japan") ||
      text.includes("japan ki rajdhani") ||
      text.includes("japan capital")
    ) {
      return "Japan ki rajdhani Tokyo hai.";
    }

    if (
      text.includes("largest ocean") ||
      text.includes("sabse bada mahasagar") ||
      text.includes("सबसे बड़ा महासागर")
    ) {
      return "Pacific Ocean duniya ka sabse bada mahasagar hai.";
    }

    if (
      text.includes("largest animal") ||
      text.includes("biggest animal") ||
      text.includes("sabse bada jaanwar") ||
      text.includes("सबसे बड़ा जानवर")
    ) {
      return "Blue whale (neeli whale) duniya ka sabse bada jaana-pehchaana jaanwar hai.";
    }

    if (
      text.includes("fastest land animal") ||
      text.includes("sabse tez jaanwar") ||
      text.includes("sabse tez zameeni")
    ) {
      return "Cheetah zameen par daudne wala sabse tez jaanwar maana jata hai.";
    }

    if (
      text.includes("largest planet") ||
      text.includes("sabse bada grah") ||
      text.includes("सबसे बड़ा ग्रह")
    ) {
      return "Jupiter (Brihaspati) hamare solar system ka sabse bada grah hai.";
    }

    if (
      text.includes("red planet") ||
      text.includes("lal grah") ||
      text.includes("लाल ग्रह")
    ) {
      return "Mars (Mangal) ko aam taur par laal grah kaha jata hai.";
    }

    if (
      text.includes("how many planets") ||
      text.includes("kitne grah") ||
      text.includes("planets in solar system") ||
      text.includes("solar system mein kitne")
    ) {
      return "Hamare solar system mein 8 grah hain. Pluto ko dwarf planet maana jata hai.";
    }

    if (
      text.includes("closest star") ||
      text.includes("nearest star") ||
      text.includes("sabse nazdeek tara")
    ) {
      return "Dharti ke sabse nazdeek tara Suraj hai. Hamare solar system ke bahar sabse nazdeek jaana-pehchana tara Proxima Centauri hai.";
    }

    if (
      text.includes("moon of earth") ||
      text.includes("earth ka natural satellite") ||
      text.includes("dharti ka upgrah") ||
      text.includes("पृथ्वी का उपग्रह")
    ) {
      return "Chand (Moon) Dharti ka natural satellite hai.";
    }

    if (
      text.includes("water boil") ||
      text.includes("boiling point of water") ||
      text.includes("paani kitne degree") ||
      text.includes("pani kitne degree") ||
      text.includes("पानी कितने डिग्री")
    ) {
      return "Samudra tal ke aas-paas normal hawa ke pressure par paani lagbhag 100°C par ubalta hai. Zyada unchai par boiling point kam ho sakta hai.";
    }

    if (
      text.includes("water freeze") ||
      text.includes("freezing point of water") ||
      text.includes("paani jamta") ||
      text.includes("pani jamta") ||
      text.includes("पानी जमता")
    ) {
      return "Normal hawa ke pressure par saaf paani lagbhag 0°C par jamta hai.";
    }

    if (
      text.includes("photosynthesis") ||
      text.includes("paudhe khana kaise") ||
      text.includes("plants make food")
    ) {
      return "Photosynthesis mein paudhe dhoop ki energy se hawa ka carbon dioxide aur paani istemal karke apna bhojan banate hain. Is process mein oxygen bhi nikalti hai.";
    }

    if (
      text.includes("what is gravity") ||
      text.includes("gravity kya") ||
      text.includes("गुरुत्वाकर्षण")
    ) {
      return "Gravity (gurutvakarshan) woh quwwat hai jiske kaaran mass wali cheezein ek-doosre ko kheenchti hain. Dharti ki gravity humein zameen par rakhti hai.";
    }

    if (
      text.includes("what is ai") ||
      text.includes("ai kya") ||
      text.includes("artificial intelligence") ||
      text.includes("एआई क्या")
    ) {
      return "AI (Artificial Intelligence) aise computer systems ko kehte hain jo data se patterns seekhkar kuch kaam karte hain, jaise sawaal samajhna, tasveer pehchanna ya text likhna. AI ki galti ho sakti hai.";
    }

    if (
      text.includes("what is internet") ||
      text.includes("internet kya") ||
      text.includes("इंटरनेट क्या")
    ) {
      return "Internet duniya bhar ke computers aur devices ko jodne wala network hai. Isse websites dekh sakte hain aur messages ya information bhej sakte hain.";
    }

    if (
      text.includes("independence day of india") ||
      text.includes("india became independent") ||
      text.includes("bharat kab azad") ||
      text.includes("भारत कब आज़ाद")
    ) {
      return "India ko 15 August 1947 ko azaadi mili. Bharat mein har saal 15 August ko Independence Day manaya jata hai.";
    }

    if (
      text.includes("republic day of india") ||
      text.includes("india became republic") ||
      text.includes("ganatantra diwas") ||
      text.includes("गणतंत्र दिवस")
    ) {
      return "Bharat ka Samvidhan 26 January 1950 ko lagu hua. Isi liye har saal 26 January ko Republic Day (Ganatantra Diwas) manaya jata hai.";
    }

    if (
      text.includes("who was mahatma gandhi") ||
      text.includes("mahatma gandhi kaun") ||
      text.includes("महात्मा गांधी कौन")
    ) {
      return "Mahatma Gandhi Bharat ke swatantrata aandolan ke pramukh neta the. Woh ahimsa aur satyagraha ke tareeqon ke liye jaane jaate hain.";
    }

    if (
      text.includes("taj mahal") &&
      (text.includes("where") ||
        text.includes("kahan") ||
        text.includes("kisne") ||
        text.includes("built") ||
        text.includes("banwaya"))
    ) {
      return "Taj Mahal Agra mein hai. Ise Mughal badshah Shah Jahan ne Mumtaz Mahal ki yaad mein banwaya tha.";
    }

    if (
      text.includes("healthy habit") ||
      text.includes("healthy kaise rahe") ||
      text.includes("sehatmand kaise") ||
      text.includes("health tips") ||
      text.includes("स्वस्थ कैसे")
    ) {
      return "Aam sehat ke liye balanced khana, niyamit neend, paani aur apni kshamta ke mutabik physical activity madadgar ho sakti hai. Yeh general jaankari hai, medical salah nahi; sehat ki chinta ho to doctor se baat karein.";
    }

    if (
      text.includes("study tips") ||
      text.includes("padhai kaise kare") ||
      text.includes("focus kaise karu") ||
      text.includes("how to study")
    ) {
      return "Padhai ke liye ek chhota topic chunein, 25 minute dhyaan se padhein, phir chhota break lein. Kitab band karke jo yaad hai woh likhna aur baad mein dobara revise karna madad kar sakta hai.";
    }

    if (
      text.includes("tell me a joke") ||
      text.includes("joke sunao") ||
      text.includes("ek chutkula") ||
      text.includes("jokes")
    ) {
      return "Ek chhota sa joke: Kitaab computer ke paas kyun gayi? Use apna data update karna tha!";
    }

    if (
      text.includes("motivate me") ||
      text.includes("motivation do") ||
      text.includes("i feel demotivated")
    ) {
      return "Bada kaam chhote kadam se shuru hota hai. Abhi sirf agla aasaan step chuniye—shuruaat bhi progress hai.";
    }

    const calculation = text.match(
      /(?:what is|calculate|solve|kitna hota hai|jodo|plus|multiply|divided by)?\s*(-?\d+(?:\.\d+)?)\s*([+\-*x×÷/])\s*(-?\d+(?:\.\d+)?)(?:\s*=\s*\??)?\s*[?]?$/i
    );
    if (calculation) {
      const first = Number(calculation[1]);
      const second = Number(calculation[3]);
      const operator = calculation[2];
      let result;

      if (operator === "+") result = first + second;
      if (operator === "-") result = first - second;
      if (operator === "*" || operator === "x" || operator === "×") {
        result = first * second;
      }
      if (operator === "/" || operator === "÷") {
        if (second === 0) return "Zero se divide nahi kar sakte.";
        result = first / second;
      }

      if (Number.isFinite(result)) {
        return "Jawab: " + Number(result.toFixed(6));
      }
    }

    return "";
  }

  function getReply(userText) {
    const text = userText.toLowerCase().trim();

    if (
      lastTopicEntry &&
      /\b(tell me more|more about it|explain more|elaborate|why is that|why so|iska example|aur batao|aur samjhao|thoda aur|uske baare mein aur|iske baare mein aur)\b/.test(text)
    ) {
      if (
        lastTopicEntry.question.toLowerCase().includes("shubham")
      ) {
        return "Shubham ke baare mein kis cheez ki detail jaan-na chahenge—unki padhai, projects, goals, ya skills?";
      }

      return "Is topic mein kis cheez par aur detail chahiye—koi example, reason, ya steps?";
    }

    if (
      lastUserQuestion &&
      /\b(what did i ask|what did i just ask|what was my question|maine kya poocha|maine abhi kya poocha|maine kya pucha|maine abhi kya pucha|mera pichla sawaal|mera last question)\b/.test(text)
    ) {
      return "Aapne abhi poocha tha: “" + lastUserQuestion + "”";
    }

    const knowledgeEntry = findKnowledgeEntry(userText);
    if (knowledgeEntry) {
      lastTopicEntry = knowledgeEntry;
      return knowledgeEntry.answer;
    }

    if (
      /^(hi|hello|hey|namaste|namaskar|hii+|good morning|good evening|good afternoon)\b/.test(
        text
      ) ||
      text.includes("नमस्ते") ||
      text.includes("नमस्कार")
    ) {
      return "Namaste! Kaise hain aap? Aap general knowledge, chhote maths ke sawaal, daily-life tips ya LocalBoost ke baare mein pooch sakte hain.";
    }

    if (
      /\b(thank you|thanks|shukriya|dhanyavaad)\b/.test(text) ||
      text.includes("धन्यवाद")
    ) {
      return "Aapka swagat hai! LocalBoost ke baare mein aur kuch poochna ho to poochhein.";
    }

    if (
      text.includes("who are you") ||
      text.includes("what can you do") ||
      text.includes("tum kaun") ||
      text.includes("aap kaun") ||
      text.includes("kya kar sakte")
    ) {
      return "Main LocalBoost AI hoon. Main LocalBoost aur uske projects ke baare mein, programming aur padhai ke kuch topics, general knowledge, simple maths, writing aur rozmarra ke sawaalon mein madad kar sakta hoon. Aap Hindi, Hinglish ya English mein pooch sakte hain.";
    }

    const generalKnowledgeReply = getGeneralKnowledgeReply(text);
    if (generalKnowledgeReply) return generalKnowledgeReply;

    if (
      text.includes("price") ||
      text.includes("pricing") ||
      text.includes("cost") ||
      text.includes("kitna") ||
      text.includes("कीमत") ||
      text.includes("दाम")
    ) {
      return "Sahi aur latest plan details ke liye website ka Pricing page dekhein:\npricing.html";
    }

    if (
      text.includes("free plan") ||
      text.includes("custom plan") ||
      text.includes("request plan") ||
      text.includes("plan request") ||
      text.includes("plan chahiye") ||
      text.includes("plan ban")
    ) {
      return "Apne business ke liye plan request karne ke liye official form kholen:\ngenerator.html";
    }

    if (
      text.includes("gym") ||
      text.includes("fitness") ||
      text.includes("workout")
    ) {
      return "Gym ke liye ek simple idea: hafte mein ek member-success post, ek useful workout tip aur ek trial-session invitation share karein. Offers aur claims post karne se pehle verify karein.\n\nGym Growth Plan:\ngym-growth-plan.html";
    }

    if (
      text.includes("salon") ||
      text.includes("restaurant") ||
      text.includes("cafe") ||
      text.includes("shop") ||
      text.includes("business idea") ||
      text.includes("marketing idea") ||
      text.includes("marketing tips")
    ) {
      return "Ek simple local marketing idea: apni service ya product ka chhota demo dikhayein, customer ki permission ke saath review share karein, aur post mein saaf batayein ki customer agla step kaise le sakta hai. Local offer ki shartein bilkul saaf likhein.";
    }

    if (
      text.includes("caption") ||
      text.includes("instagram post") ||
      text.includes("social media post")
    ) {
      return "Yeh ek basic caption template hai; brackets wali jagah apni sahi details bharein:\n\n\"Aapke liye [service/product] — [ek asli fayda]. Booking ya jaankari ke liye humein message karein. [Business name], [area].\"";
    }

    if (
      text.includes("reel") ||
      text.includes("short video") ||
      text.includes("video script")
    ) {
      return "Simple 15-second Reel format:\n1. Shuruat mein sawaal ya dikkat batayein.\n2. Apni service ka chhota demo dikhayein.\n3. Ek saaf call-to-action dein, jaise “details ke liye message karein”.";
    }

    if (
      text.includes("whatsapp") ||
      text.includes("broadcast") ||
      text.includes("customer message")
    ) {
      return "WhatsApp marketing mein sirf un customers ko message bhejein jinhone permission di ho. Messages useful aur kam rakhein, aur opt-out request ka respect karein.";
    }

    if (
      text.includes("feature") ||
      text.includes("service") ||
      text.includes("localboost") ||
      text.includes("what does")
    ) {
      return "LocalBoost local businesses ke marketing plans, content topics, captions, Reel scripts aur offer ideas mein madad karta hai. Details ke liye Features page dekhein:\nfeatures.html";
    }

    if (
      text.includes("bye") ||
      text.includes("good night") ||
      text.includes("alvida")
    ) {
      return "Phir milenge! LocalBoost website dekhne ke liye shukriya.";
    }

    return "Is sawaal par main pakka jawab nahi de pa raha. Thoda context ya koi specific detail share karenge? Main uske hisaab se behtar madad karne ki koshish karunga.";
  }

  function sendMessage(text) {
    if (isWaitingForReply) return;

    addMessage(text, "user");
    setBusy(true);
    addTypingIndicator();

    window.setTimeout(function () {
      removeTypingIndicator();
      addMessage(getReply(text), "bot");
      lastUserQuestion = text;
      setBusy(false);
      chatInput.focus();
    }, 350);
  }

  function startNewChat() {
    if (isWaitingForReply) return;

    chatBody.replaceChildren();
    welcomeShown = false;
    lastTopicEntry = null;
    lastUserQuestion = "";
    showWelcome();
    chatInput.focus();
  }

  const statusDot = statusText.previousElementSibling;
  if (statusDot) statusDot.classList.remove("lb-chat-status-offline");

  chatLauncher.addEventListener("click", function () {
    if (chatWindow.classList.contains("open")) {
      closeChat();
    } else {
      openChat();
    }
  });

  chatClose.addEventListener("click", closeChat);
  newChatButton.addEventListener("click", startNewChat);

  chatForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = chatInput.value.trim();
    if (!text || isWaitingForReply) return;

    chatInput.value = "";
    sendMessage(text);
  });

  if (quickActions) {
    quickActions.querySelectorAll("[data-question]").forEach(function (button) {
      button.addEventListener("click", function () {
        const question = button.dataset.question;
        if (question && !isWaitingForReply) sendMessage(question);
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeChat();
  });

  setBusy(true);
  loadKnowledge().finally(function () {
    setBusy(false);
  });
})();
