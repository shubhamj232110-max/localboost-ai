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
    "knowledge/general/everyday_gk.jsonl",
    "knowledge/maths/maths.jsonl",
    "knowledge/programming/programming.jsonl",
    "knowledge/hindi_english/hindi_english.jsonl",
    "knowledge/conversation/conversation.jsonl",
    "knowledge/conversation/everyday.jsonl",
    "knowledge/conversation/daily_life.jsonl",
    "knowledge/conversation/shubham_overview.jsonl",
    "knowledge/reasoning/reasoning.jsonl",
    "knowledge/computer/computer.jsonl",
    "knowledge/writing/writing.jsonl",
    "knowledge/safety/safety.jsonl",
    "knowledge/conversation/shubham_profile.jsonl"
  ];

  const ignoredSearchWords = new Set([
    "a", "an", "and", "are", "about", "at", "can", "could", "describe",
    "definition", "detail", "details", "do", "does", "explain", "for",
    "give", "hai", "hain", "ho", "how", "hota", "hoti", "hote", "hua", "hui",
    "hue", "i", "in", "information", "info", "is", "it", "ka", "kaise",
    "kare", "karen", "karein", "karna", "karo", "karu", "karun", "karta",
    "karte", "ke", "ki", "kind", "kindly", "ko", "kuch", "me", "mein",
    "kya", "meaning", "more", "mujhe", "mujhko", "of", "on", "par", "please",
    "plz", "se", "simple", "the", "to", "what", "when", "where", "which",
    "tha", "thi", "who", "why", "with", "would", "work", "working", "works", "you",
    "batao", "btao", "bta", "bataye", "bataiye", "bare", "baare", "zara",
    "hindi", "samjhao", "tell", "know", "want", "well", "as",
    "also", "just",
    "kijiye", "sakte", "sakti", "sakta", "bata",
    "iska", "iski", "iske", "iss", "yeh", "ye", "woh", "vo",
    "matlab", "arth",
    "मुझे", "बताओ", "बताइए", "बताएं", "क्या", "है", "हैं", "किस",
    "कौन", "कैसे", "करता", "करती", "होता", "होती", "में", "का", "की",
    "के", "को", "से", "पर", "और", "एक", "मेरा", "मेरी", "आप", "तुम",
    "यह", "इसका", "इसकी", "इसके", "कृपया", "समझाओ", "जानकारी"
  ]);

  const searchSynonyms = new Map([
    ["capital", "rajdhani"],
    ["creator", "create"],
    ["created", "create"],
    ["developer", "create"],
    ["developed", "create"],
    ["built", "create"],
    ["made", "create"],
    ["education", "padhai"],
    ["study", "padhai"],
    ["studied", "padhai"],
    ["studies", "padhai"],
    ["school", "padhai"],
    ["college", "padhai"],
    ["goals", "goal"],
    ["objectives", "goal"],
    ["dreams", "goal"],
    ["skills", "skill"],
    ["technologies", "technology"],
    ["tech", "technology"],
    ["qualities", "khubi"],
    ["strengths", "khubi"],
    ["traits", "khubi"],
    ["hobbies", "hobby"],
    ["interests", "interest"],
    ["project", "project"],
    ["plans", "plan"],
    ["programming", "programming"],
    ["coding", "programming"],
    ["software", "programming"],
    ["computer", "computer"],
    ["computing", "computer"],
    ["problem", "problem"],
    ["problems", "problem"],
    ["sawaal", "question"],
    ["sawal", "question"],
    ["questions", "question"],
    ["question", "question"]
  ]);

  const spellingAndMeaningVariants = new Map([
    ["btao", "batao"],
    ["bataye", "batao"],
    ["bataiye", "batao"],
    ["btaye", "batao"],
    ["baare", "bare"],
    ["baaray", "bare"],
    ["baray", "bare"],
    ["shubhamji", "shubham"],
    ["jaiswalji", "jaiswal"],
    ["padhayi", "padhai"],
    ["padhaai", "padhai"],
    ["studies", "padhai"],
    ["studied", "padhai"],
    ["studying", "padhai"],
    ["student", "padhai"],
    ["students", "padhai"],
    ["padhte", "padhai"],
    ["padhta", "padhai"],
    ["padhti", "padhai"],
    ["padh", "padhai"],
    ["parhai", "padhai"],
    ["course", "padhai"],
    ["courses", "padhai"],
    ["language", "language"],
    ["languages", "language"],
    ["schooling", "padhai"],
    ["education", "padhai"],
    ["skills", "skill"],
    ["abilities", "skill"],
    ["capabilities", "skill"],
    ["talents", "skill"],
    ["technologies", "technology"],
    ["tech", "technology"],
    ["strengths", "khubi"],
    ["qualities", "khubi"],
    ["achievements", "achievement"],
    ["achieved", "achievement"],
    ["creator", "create"],
    ["creators", "create"],
    ["created", "create"],
    ["developer", "create"],
    ["developed", "create"],
    ["built", "create"],
    ["made", "create"],
    ["programmer", "programming"],
    ["programmers", "programming"],
    ["coding", "programming"],
    ["goals", "goal"],
    ["dreams", "goal"],
    ["objectives", "goal"],
    ["hobbies", "hobby"],
    ["interests", "interest"],
    ["projects", "project"],
    ["priorities", "priority"],
    ["relationships", "relationship"],
    ["love", "pyaar"],
    ["pyar", "pyaar"],
    ["affection", "pyaar"],
    ["worried", "worry"],
    ["worrying", "worry"],
    ["overthinking", "overthink"],
    ["overthinker", "overthink"],
    ["stressed", "stress"],
    ["stressing", "stress"],
    ["anxious", "anxiety"],
    ["nervous", "anxiety"],
    ["sadness", "sad"],
    ["loneliness", "lonely"],
    ["confused", "confusion"],
    ["confusing", "confusion"],
    ["improve", "improvement"],
    ["improving", "improvement"],
    ["improvements", "improvement"],
    ["manage", "management"],
    ["managing", "management"],
    ["managed", "management"],
    ["remember", "memory"],
    ["remembering", "memory"],
    ["recall", "memory"],
    ["reply", "response"],
    ["respond", "response"],
    ["responding", "response"],
    ["answer", "response"],
    ["answers", "response"],
    ["difference", "difference"],
    ["differences", "difference"],
    ["compare", "comparison"],
    ["comparing", "comparison"],
    ["comparison", "comparison"],
    ["formula", "formula"],
    ["formulas", "formula"],
    ["equation", "formula"],
    ["equations", "formula"]
  ]);

  let indexedKnowledge = [];

  function scrollChatToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = "lb-message " + sender;
    if (sender === "bot") {
      const linkPattern = /https:\/\/[^\s]+/g;
      let cursor = 0;
      let match;

      while ((match = linkPattern.exec(text)) !== null) {
        const url = match[0].replace(/[),.;!?]+$/, "");
        if (!url) continue;

        message.appendChild(
          document.createTextNode(text.slice(cursor, match.index))
        );

        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = url;
        message.appendChild(link);
        message.appendChild(
          document.createTextNode(match[0].slice(url.length))
        );
        cursor = match.index + match[0].length;
      }

      message.appendChild(document.createTextNode(text.slice(cursor)));
    } else {
      message.textContent = text;
    }
    chatBody.appendChild(message);
    scrollChatToBottom();
  }

  function isProfileQuestion(question, reply) {
    const text = question.toLowerCase();
    const response = reply.toLowerCase();
    const asksAboutShubham = isAboutShubhamQuestion(text);
    const asksWhoCreated =
      /\b(who made you|who created you|who created this chatbot|creator|developer|kisne banaya|tumhe kisne banaya|tumko kisne banaya|chatbot kisne banaya|chatbot ko kisne banaya)\b/.test(text);

    return asksAboutShubham ||
      asksWhoCreated ||
      (response.includes("shubham jaiswal") &&
        (response.includes("project manager") ||
          response.includes("chatbot banaya")));
  }

  function isAboutShubhamQuestion(question) {
    const mentionsShubham = /\b(?:shubham|jaiswal)\b/.test(question);
    const normalizedQuestion = searchTokens(question).join(" ");
    const asksAboutHim =
      /\b(?:about|who|profile|bio|tell|describe|goal|skill|education|study|project|quality|qualities|strength|interest|career|padhai|kaun|bata\w*|bare|baare|khubi|college|exam|startup)\b/.test(question) ||
      /\b(?:mere|my)\s+(?:bare|baare)\b/.test(question) ||
      /\b(?:ke|par|pe)\s+(?:bare|baare)\b/.test(question) ||
      /\b(?:padhai|goal|skill|technology|project|khubi|career|college|exam|startup|profile|interest)\b/.test(normalizedQuestion);

    return mentionsShubham && asksAboutHim;
  }

  function isFullShubhamProfileRequest(question) {
    if (/^\s*(?:shubham|shubham jaiswal|jaiswal)\s*[?.!]*\s*$/.test(question)) {
      return true;
    }

    if (!isAboutShubhamQuestion(question)) return false;

    const normalizedQuestion = searchTokens(question).join(" ");
    const asksSpecificTopic =
      /\b(?:goal|skill|programming|language|technology|padhai|project|khubi|career|college|exam|startup|priority|interest)\b/.test(normalizedQuestion) ||
      /\b(?:education|study|project|quality|strength|career|exam|startup|priorit\w*)\b/.test(question);
    return !asksSpecificTopic;
  }

  function findShubhamTopicEntry(question) {
    if (!/\b(?:shubham|jaiswal)\b/.test(question)) return null;
    const normalizedQuestion = searchTokens(question).join(" ");

    const topics = [
      {
        pattern: /\b(?:education|padhai|study|school|college)\b/,
        question: "Shubham ki padhai aur education kya hai?"
      },
      {
        pattern: /\b(?:goal|goals|sapne|career plans|future)\b/,
        question: "Shubham ke goals aur career plans kya hain?"
      },
      {
        pattern: /\b(?:skill|programming|technology|language)\b/,
        question: "Shubham ko kaun si programming languages aur technologies aati hain?"
      },
      {
        pattern: /\b(?:mps|municipal problem spotter)\b/,
        question: "Shubham ka Municipal Problem Spotter project kya hai?"
      },
      {
        pattern: /\b(?:local boost|localboost|startup)\b/,
        question: "Shubham ka Local Boost AI project kya karta hai?"
      },
      {
        pattern: /\b(?:learning style|kaise padhana|coding samjhana|feedback)\b/,
        question: "Shubham ko kaise padhana ya programming samjhani chahiye?"
      },
      {
        pattern: /\b(?:ssc|cgl|chsl|schedule|timetable)\b/,
        question: "Shubham ki SSC aur college ki padhai ka schedule kya hai?"
      },
      {
        pattern: /\b(?:strength|strengths|khubi|improve|improvement)\b/,
        question: "Shubham ki strengths aur improvement ke areas kya hain?"
      },
      {
        pattern: /\b(?:priorit|priority|priorities)\b/,
        question: "Shubham ki abhi ki priorities kya hain?"
      }
    ];
    const matchedTopic = topics.find(function (topic) {
      return topic.pattern.test(normalizedQuestion) ||
        topic.pattern.test(question);
    });

    return matchedTopic
      ? knowledgeEntries.find(function (entry) {
          return entry.question === matchedTopic.question;
        }) || null
      : null;
  }

  function addProfileSuggestions() {
    const suggestions = [
      ["Shubham ka full profile", "Shubham Jaiswal ke baare mein sab kuch batao"],
      ["Padhai aur education", "Shubham ki padhai aur education kya hai?"],
      ["Goals aur career plans", "Shubham ke goals aur sapne kya hain?"],
      ["Programming skills", "Shubham ko kaun si programming languages aur technologies aati hain?"],
      ["MPS project", "Shubham ka Municipal Problem Spotter project kya hai?"],
      ["Local Boost AI", "Shubham ka Local Boost AI startup kya karta hai?"],
      ["Learning style", "Shubham ko kaise padhana ya programming samjhani chahiye?"],
      ["SSC aur college plans", "Shubham ki SSC aur college ki padhai ka schedule kya hai?"],
      ["Strengths aur improvement", "Shubham apni kaun si strengths aur skills improve karna chahte hain?"],
      ["Current priorities", "Shubham ki abhi ki priorities kya hain?"]
    ];
    const group = document.createElement("div");
    group.className = "lb-profile-suggestions";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Shubham ke baare mein aur sawaal");

    const label = document.createElement("span");
    label.className = "lb-profile-suggestions-label";
    label.textContent = "Shubham ke baare mein aur jaaniye";
    group.appendChild(label);

    suggestions.forEach(function (suggestion) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = suggestion[0];
      button.addEventListener("click", function () {
        if (isWaitingForReply) return;
        group.remove();
        sendMessage(suggestion[1]);
      });
      group.appendChild(button);
    });

    chatBody.querySelectorAll(".lb-profile-suggestions").forEach(function (existingGroup) {
      existingGroup.remove();
    });
    chatBody.appendChild(group);
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
      })
      .map(function (word) {
        const variant = spellingAndMeaningVariants.get(word) || word;
        return searchSynonyms.get(variant) || variant;
      });
  }

  function editDistanceAtMostOne(first, second) {
    if (Math.abs(first.length - second.length) > 1) return false;

    if (
      first.length === second.length &&
      first.length > 1
    ) {
      for (let index = 0; index < first.length - 1; index += 1) {
        if (
          first[index] !== second[index] &&
          first[index] === second[index + 1] &&
          first[index + 1] === second[index] &&
          first.slice(index + 2) === second.slice(index + 2)
        ) {
          return true;
        }
      }
    }

    let firstIndex = 0;
    let secondIndex = 0;
    let differences = 0;

    while (firstIndex < first.length && secondIndex < second.length) {
      if (first[firstIndex] === second[secondIndex]) {
        firstIndex += 1;
        secondIndex += 1;
        continue;
      }

      differences += 1;
      if (differences > 1) return false;

      if (first.length > second.length) {
        firstIndex += 1;
      } else if (second.length > first.length) {
        secondIndex += 1;
      } else {
        firstIndex += 1;
        secondIndex += 1;
      }
    }

    if (firstIndex < first.length || secondIndex < second.length) {
      differences += 1;
    }

    return differences <= 1;
  }

  function prepareKnowledgeIndex() {
    const documentFrequency = new Map();

    indexedKnowledge = knowledgeEntries.map(function (entry) {
      const questionVariants = [entry.question].concat(entry.aliases || [])
        .map(function (question) {
          return searchTokens(question);
        });
      const questionTokens = new Set(
        questionVariants.reduce(function (tokens, variant) {
          return tokens.concat(variant);
        }, [])
      );
      const keywordTokens = new Set(searchTokens(entry.keywords.join(" ")));
      const allTokens = new Set([...questionTokens, ...keywordTokens]);

      allTokens.forEach(function (token) {
        documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
      });

      return {
        entry: entry,
        questionTokens: questionTokens,
        questionVariants: questionVariants,
        keywordTokens: keywordTokens,
        allTokens: allTokens
      };
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

        const text = (await response.text()).replace(/^\uFEFF/, "").trim();
        let entries;

        try {
          entries = JSON.parse(text);
        } catch {
          try {
            entries = JSON.parse("[" + text.replace(/^,\s*/, "") + "]");
          } catch {
            entries = text
              .split(/\r?\n/)
              .filter(function (line) {
                return line.trim();
              })
              .map(function (line, index) {
                try {
                  return JSON.parse(line);
                } catch {
                  throw new Error(
                    fileName + " ki line " + (index + 1) +
                      " valid JSON nahi hai."
                  );
                }
              });
          }
        }

        if (!Array.isArray(entries)) entries = [entries];

        return entries.map(function (entry, index) {
          if (
            !entry ||
            typeof entry.question !== "string" ||
            typeof entry.answer !== "string" ||
            !entry.question.trim() ||
            !entry.answer.trim()
          ) {
            throw new Error(
              fileName + " ke record " + (index + 1) +
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
              : [],
            aliases: Array.isArray(entry.aliases)
              ? entry.aliases.filter(function (alias) {
                  return typeof alias === "string" && alias.trim();
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

    prepareKnowledgeIndex();
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
    if (queryTokens.length === 0 || indexedKnowledge.length === 0) return null;

    const queryWeights = new Map();
    queryTokens.forEach(function (token) {
      const tokenFrequency = indexedKnowledge.reduce(function (count, item) {
        return count + (item.allTokens.has(token) ? 1 : 0);
      }, 0);
      queryWeights.set(
        token,
        Math.log(1 + (indexedKnowledge.length + 1) / (tokenFrequency + 1))
      );
    });

    const rankedMatches = [];

    indexedKnowledge.forEach(function (record) {
      let totalWeight = 0;
      let matchedWeight = 0;
      let questionWeight = 0;
      let questionMatchedWeight = 0;
      let keywordMatchedWeight = 0;
      let exactMatches = 0;
      let fuzzyMatches = 0;

      queryTokens.forEach(function (token) {
        const weight = queryWeights.get(token);
        totalWeight += weight;
        const inQuestion = record.questionTokens.has(token);
        if (inQuestion) questionWeight += weight;

        const exactMatch = record.allTokens.has(token);
        let matched = exactMatch;
        if (!matched && token.length >= 5) {
          matched = Array.from(record.allTokens.keys()).some(function (candidate) {
            return candidate.length >= 5 &&
              editDistanceAtMostOne(token, candidate);
          });
        }
        if (!matched) return;

        matchedWeight += weight;
        exactMatches += 1;
        if (!exactMatch) fuzzyMatches += 1;
        if (inQuestion) {
          questionMatchedWeight += weight;
        } else if (record.keywordTokens.has(token)) {
          keywordMatchedWeight += weight;
        }
      });

      if (matchedWeight === 0 || totalWeight === 0) return;

      const queryCoverage = matchedWeight / totalWeight;
      const questionCoverage = questionWeight === 0
        ? 0
        : questionMatchedWeight / questionWeight;
      const coverage = exactMatches / queryTokens.length;
      const score =
        queryCoverage * 0.52 +
        questionCoverage * 0.32 +
        (keywordMatchedWeight > 0 ? 0.06 : 0) +
        (coverage === 1 ? 0.05 : 0) -
        (fuzzyMatches / queryTokens.length) * 0.08;
      const exactPhrase = record.questionVariants.some(function (variant) {
        return variant.length === queryTokens.length &&
          variant.every(function (token, index) {
            return token === queryTokens[index];
          });
      });

      rankedMatches.push({
        entry: record.entry,
        score: score,
        coverage: coverage,
        queryCoverage: queryCoverage,
        exactPhrase: exactPhrase
      });
    });

    rankedMatches.sort(function (first, second) {
      return (
        Number(second.exactPhrase) - Number(first.exactPhrase) ||
        second.score - first.score
      );
    });

    const best = rankedMatches[0];
    const next = rankedMatches[1];
    const minimumCoverage = queryTokens.length === 1 ? 1 : 0.65;
    if (
      !best ||
      best.queryCoverage < 0.62 ||
      best.coverage < minimumCoverage ||
      (next && !best.exactPhrase && best.score - next.score < 0.025)
    ) {
      return null;
    }

    return best.entry;
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
      /\bai\s+kya\b/.test(text) ||
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

  function getEmotionReply(text) {
    if (
      /\b(?:want to die|want to kill myself|kill myself|end my life|self[- ]harm|hurt myself|thinking about suicide|suicidal)\b/.test(text) ||
      /(?:khudkushi|aatmahatya|khud ko (?:khatam|nuksan)|jeene ka mann nahi|mar jana chahta|mar jana chahti)/.test(text)
    ) {
      return "Mujhe afsos hai ki aap itni mushkil feeling se guzar rahe hain. Agar aapko lagta hai ki abhi khud ko nuksan pahunch sakta hai, akela na rahen—abhi kisi bharosemand insaan ko batayein aur local emergency service ya nearest hospital se madad lein. Agar aap India mein hain, Tele-MANAS ki official support information yahan hai: https://telemanas.mohfw.gov.in/ Kya aap is waqt turant khatre mein hain?";
    }

    const positiveEmotionWords = ["happy", "excited", "proud", "relieved"];
    if (
      (
        /\b(?:i am|i'm|feeling|feel|so|really)?\s*(?:happy|excited|proud|relieved)\b/.test(text) ||
        /(?:bahut khush|khushi ho rahi|aaj achha lag|maza aa raha)/.test(text)
      ) &&
      !hasNegatedEmotion(text, positiveEmotionWords)
    ) {
      return "Yeh sunkar achha laga! Kya koi khaas baat hui jiski wajah se aap khush ya excited hain?";
    }

    const stressEmotionWords = ["stressed", "stress", "overwhelmed"];
    if (
      /\b(?:stressed|stress|overwhelmed|under pressure|too much pressure)\b/.test(text) ||
      /(?:tension ho rahi|bahut tension|pareshan hoon|dabav mehsoos|kaam ka pressure)/.test(text)
    ) {
      if (!hasNegatedEmotion(text, stressEmotionWords)) {
        return "Lagta hai abhi kaafi pressure mehsoos ho raha hai. Ek chhota step lein: jo sabse zaroori hai use likhein, phir sirf agle 10 minute ka kaam chunein. Kisi bharosemand dost ya gharwale se baat karna bhi madad kar sakta hai. NHS mental-wellbeing tips: https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/";
      }
    }

    const anxietyEmotionWords = ["anxious", "nervous", "worried", "scared", "afraid", "panic"];
    if (
      /\b(?:anxious|nervous|worried|scared|afraid|panic)\b/.test(text) ||
      /(?:ghabrahat|ghabra raha|ghabra rahi|dar lag raha|chinta ho rahi)/.test(text)
    ) {
      if (!hasNegatedEmotion(text, anxietyEmotionWords)) {
        return "Yeh feeling uncomfortable ho sakti hai. Abhi ek pal ruk kar dheere saans lein, aas-paas ki kisi ek cheez par dhyaan dein, aur dekhein ki is waqt kaunsa chhota kaam aapke control mein hai. Agar aap chahein, bataiye kis baat ko lekar ghabrahat hai.";
      }
    }

    const lonelinessEmotionWords = ["lonely", "alone", "isolated"];
    if (
      /\b(?:lonely|alone|isolated|left out)\b/.test(text) ||
      /(?:akela mehsoos|akeli mehsoos|tanha|koi saath nahi)/.test(text)
    ) {
      if (!hasNegatedEmotion(text, lonelinessEmotionWords)) {
        return "Akela mehsoos karna bhaari lag sakta hai. Agar mumkin ho to kisi bharosemand dost ya family member ko ek chhota message bhejein—sirf baat shuru karna bhi theek hai. NHS mental-wellbeing tips mein logon se jude rehne ki salah hai: https://www.nhs.uk/mental-health/self-help/tips-and-support/cope-with-depression/";
      }
    }

    const sadnessEmotionWords = ["sad", "down", "heartbroken", "upset", "crying", "unhappy"];
    if (
      /\b(?:sad|down|heartbroken|upset|crying|unhappy)\b/.test(text) ||
      /\bnot happy\b/.test(text) ||
      /(?:udaas|dukhi|mann kharab|rona aa raha|dil toot gaya)/.test(text)
    ) {
      if (!hasNegatedEmotion(text, sadnessEmotionWords)) {
        return "Yeh sunkar afsos hua. Aap chahein to bata sakte hain kya hua—main bina judge kiye sunne ki koshish karunga. Kisi bharosemand insaan se baat karna aur routine mein chhote steps rakhna bhi madadgar ho sakta hai. NHS guidance: https://www.nhs.uk/mental-health/self-help/tips-and-support/cope-with-depression/";
      }
    }

    const angerEmotionWords = ["angry", "furious", "irritated", "annoyed"];
    if (
      /\b(?:angry|furious|irritated|annoyed)\b/.test(text) ||
      /(?:bahut gussa|gussa aa raha|chidchida)/.test(text)
    ) {
      if (!hasNegatedEmotion(text, angerEmotionWords)) {
        return "Gussa aana kabhi-kabhi hota hai. Reply ya decision dene se pehle thoda pause lein; phir sochiye ki aapko kis baat ki zaroorat hai aur use shaant tareeqe se kaise kehna hai. Kya hua tha?";
      }
    }

    return "";
  }

  function hasNegatedEmotion(text, emotionWords) {
    return emotionWords.some(function (word) {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const negatedEmotion = new RegExp(
        "\\b(?:not|never|dont|don't|doesn't|isn't|aren't|wasn't|weren't)\\b" +
          "(?:\\s+[a-z']+){0,3}\\s+" +
          escapedWord +
          "\\b"
      );
      return negatedEmotion.test(text);
    });
  }

  function getNavbarDestination(question) {
    const text = question.toLowerCase().trim();
    const destinations = [
      {
        pattern: /\b(?:home(?:\s*page)?|homepage|main page|mukhya page)\b/,
        label: "Home",
        href: "index.html"
      },
      {
        pattern: /\b(?:how it works|how does (?:localboost )?work|kaise kaam karta(?: hai)?)\b/,
        label: "How it works",
        href: "how-it-works.html"
      },
      {
        pattern: /\b(?:features?|suvidha(?:ein)?|localboost(?: ai)? kya karta(?: hai)?)\b/,
        label: "Features",
        href: "features.html"
      },
      {
        pattern: /\b(?:pricing|price|cost|fees?|kitne ka|keemat|kimat|daam|subscription)\b/,
        label: "Pricing",
        href: "pricing.html"
      },
      {
        pattern: /\b(?:resources?|guides?|resource page)\b/,
        label: "Resources",
        href: "resources.html"
      },
      {
        pattern: /\b(?:gym|fitness)[-\s]+(?:growth[-\s]+)?plan\b|\bgym page\b/,
        label: "Gym Plan",
        href: "gym-growth-plan.html"
      },
      {
        pattern: /\b(?:free plan|custom plan|request a plan|get my plan|plan ban(?:ao|ayein|ana)|generator page|open generator)\b/,
        label: "Get my plan",
        href: "generator.html"
      }
    ];
    const destination = destinations.find(function (item) {
      return item.pattern.test(text);
    });

    if (!destination) return null;

    const pagePath = new URL(destination.href, document.baseURI).pathname;
    const navLink = Array.from(
      document.querySelectorAll("header.navbar nav a, nav.nav-links a")
    ).find(function (link) {
      return new URL(link.href, document.baseURI).pathname === pagePath;
    });

    return {
      label: destination.label,
      href: navLink ? navLink.href : new URL(destination.href, document.baseURI).href
    };
  }

  function getReply(userText) {
    const text = userText.toLowerCase().trim();
    const emotionReply = getEmotionReply(text);
    if (emotionReply) return emotionReply;

    if (
      /\b(?:local\s*boost|localboost)\b/.test(text) &&
      /\b(?:what is|what does|tell me about|about|kya hai|kya karta|kaam karta|samjhao)\b/.test(text)
    ) {
      return "LocalBoost AI ek project hai jo local dukaanon aur businesses ko marketing ideas, captions aur plans banane mein madad karta hai. Seedhe shabdon mein, yeh unhe online apne business ko promote karne mein help karta hai. Iske saare features abhi available hain, yeh zaroori nahi.";
    }

    if (isFullShubhamProfileRequest(text)) {
      const profileEntry = knowledgeEntries.find(function (entry) {
        return entry.question === "Shubham Jaiswal ke baare mein sab kuch batao";
      });
      if (profileEntry) {
        lastTopicEntry = profileEntry;
        return profileEntry.answer;
      }
    }

    const shubhamTopicEntry = findShubhamTopicEntry(text);
    if (shubhamTopicEntry) {
      lastTopicEntry = shubhamTopicEntry;
      return shubhamTopicEntry.answer;
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

    return "Mujhe is sawaal ka jawab nahi pata, sorry.";
  }

  function sendMessage(text) {
    if (isWaitingForReply) return;

    addMessage(text, "user");
    setBusy(true);
    addTypingIndicator();

    window.setTimeout(function () {
      removeTypingIndicator();
      let destination = null;
      let shouldSuggestProfile = false;

      try {
        destination = getNavbarDestination(text);
        const reply = destination
          ? destination.label + " page khol raha hoon..."
          : getReply(text);
        addMessage(reply, "bot");
        lastUserQuestion = text;
        shouldSuggestProfile =
          !destination && isProfileQuestion(text, reply);
      } catch (error) {
        console.error("Chatbot jawab taiyar nahi kar paya:", error);
        addMessage(
          "Maaf kijiye, abhi jawab dene mein dikkat aa rahi hai. Kripya dobara poochhein.",
          "bot"
        );
      } finally {
        setBusy(false);
        chatInput.focus();
      }

      if (destination) {
        window.location.assign(destination.href);
        return;
      }
      if (shouldSuggestProfile) addProfileSuggestions();
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
