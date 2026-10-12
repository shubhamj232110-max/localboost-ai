# LocalBoost basic chatbot

This is a small, browser-based chatbot for common LocalBoost questions,
selected general knowledge, simple arithmetic, everyday conversation, and
sample topics in the `knowledge/` folder. It searches the local JSONL question
and answer files for a close keyword match; it does not train an AI model or
need an API key, AI account, Node.js server, or separately installed AI model.

Knowledge categories are `general`, `science`, `maths`, `programming`,
`hindi_english`, `conversation`, `reasoning`, `computer`, `writing`, and
`safety`. Add one JSON object per line to the relevant category file. Every
object must have a `question` and an `answer`; optional `keywords` help match
alternate ways of asking the question:

```json
{"question":"Python kya hai?","answer":"Python ek programming language hai.","keywords":["python","programming","coding"]}
```

The chatbot only retrieves saved answers. It cannot invent a new answer from
documents or handle every possible question. PDF extraction, semantic/vector
search, and fine-tuning are not implemented. Keep entries accurate, safe, and
legally usable; verify important answers.

Open the website through its existing static website address or a static file
preview so the `knowledge/` JSONL files can be fetched. Opening files directly
with a `file://` address may prevent the shared page sections and knowledge
files from loading in some browsers.
