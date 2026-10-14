import "dotenv/config";
import express from "express";
import path from "node:path";

const app = express();
const port = Number(process.env.PORT || 3000);

const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

if (!groqApiKey) {
  console.error("ERROR: .env mein GROQ_API_KEY set karein.");
  process.exit(1);
}

console.log("Using Groq model:", groqModel);

app.use(express.json({ limit: "64kb" }));
app.use(express.static(path.resolve("public")));

const assistantRules = `
You are LocalBoost AI assistant.
Help with marketing, captions, coding, study, general knowledge and general questions.
Reply in user's language: Hindi, Hinglish or English.
Be concise, clear and helpful.
If user asks about LocalBoost AI, explain it is an AI assistant website for local businesses.
If user asks who created it, say Shubham Jaiswal created the website and chatbot interface.
Do not invent website prices or private details.
No live web search.
`;

async function callGroqWithRetry(messages, maxRetries = 2) {
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + groqApiKey
          },
          body: JSON.stringify({
            model: groqModel,
            messages,
            max_tokens: 250,
            temperature: 0.7
          })
        }
      );

      const rawText = await response.text();

      if (!response.ok) {
        console.error("Groq status:", response.status);
        console.error("Groq error:", rawText);

        if (response.status === 429 || response.status === 503) {
          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (attempt + 1))
            );
            continue;
          }
        }

        return { ok: false, status: response.status, error: rawText };
      }

      let data = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        data = null;
      }

      const reply = data?.choices?.[0]?.message?.content?.trim();

      if (reply) {
        return { ok: true, reply };
      }

      return { ok: false, status: 502, error: "Empty response" };
    } catch (error) {
      lastError = error;
      console.error(
        "Groq fetch attempt " + (attempt + 1) + " failed:",
        error.cause?.code || error.name
      );

      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
      }
    }
  }

  throw lastError;
}

app.post("/api/chat", async (req, res) => {
  const message = req.body?.message;
  const history = Array.isArray(req.body?.history) ? req.body.history : [];

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Invalid message." });
  }

  const messages = [
    { role: "system", content: assistantRules }
  ];

  for (const item of history.slice(-6)) {
    if (item && (item.role === "user" || item.role === "model")) {
      messages.push({
        role: item.role === "model" ? "assistant" : "user",
        content: item.text
      });
    }
  }

  messages.push({
    role: "user",
    content: message
  });

  try {
    const result = await callGroqWithRetry(messages);

    if (!result.ok) {
      let userMessage = "AI response nahi mila. Thodi der baad try karein.";

      if (result.status === 429) {
        userMessage = "Free quota ya rate limit khatam ho gayi. Thodi der baad try karein.";
      } else if (result.status === 401 || result.status === 403) {
        userMessage = "API key invalid, expired ya restricted hai.";
      } else if (result.status === 404) {
        userMessage = "Model ID galat hai ya available nahi hai.";
      } else if (result.status === 503) {
        userMessage = "AI model abhi busy hai. Thodi der baad try karein.";
      }

      return res.status(result.status).json({ error: userMessage });
    }

    return res.json({ reply: result.reply });
  } catch (error) {
    console.error("AI request error:", error.name);
    console.error("Error cause:", error.cause?.code || "unknown");

    return res.status(502).json({
      error: "AI server se connection nahi hua. Dobara try karein."
    });
  }
});

app.listen(port, () => {
  console.log(`Website running: http://localhost:${port}`);
});