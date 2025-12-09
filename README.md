
# 📌 **PII Guard – Browser Extension**

### **Real-Time Protection Against Leaking Emails, Phone Numbers, Credit Cards & Customer Data Into AI Tools**

PII Guard is a lightweight, privacy-first Chrome extension designed to **automatically detect and block sensitive information (PII)** before it can be submitted to AI chat platforms such as:

* ChatGPT
* Gemini
* Claude
* Perplexity
* Grok
* and any other AI chat website

The extension runs **100% locally in the browser** — no data is ever sent to external servers.

---

# 🚨 Why This Exists

Millions of people accidentally paste sensitive customer or corporate data into AI chats every day.
Companies have no visibility or control over these leaks.

Existing solutions are either:

* too complex,
* require a backend,
* require enterprise deployment, or
* only work with one AI tool.

PII Guard solves this with **zero setup** and **instant on-browser protection**.

---

# ✨ Key Features

### ✅ **Real-time PII detection**

Detects:

* Emails
* Phone numbers
* Credit card numbers
* API keys (coming soon)
* Addresses (coming soon)
* Custom patterns (coming soon)

### ✅ **Blocks messages BEFORE they’re sent**

Messages containing detected PII are:

* prevented from being submitted
* highlighted
* replaced with a clean “PII Detected” warning overlay

### ✅ **Alert Mode & Block Mode**

* **Alert Mode:** Warns the user but allows sending
* **Block Mode:** Fully blocks sending until the PII is removed

### ✅ **Cross-AI support**

Works on all major AI chat platforms automatically:

* ChatGPT
* chat.openai.com
* Gemini
* Claude
* Perplexity
* Custom AI chats

### ✅ **Local-only detection (Privacy-First)**

All scanning is done **locally via RegExp & DOM hooks**.
Nothing leaves your machine.
No API keys required.

### ✅ **Clean UI Overlay**

Shows a modern banner:

* “PII Detected”
* Count of detected items
* A “Go Back” option
* Mode indicator

---

# 🧩 How It Works (Technical Overview)

* A `content.js` script injects into pages matching AI domains.
* The extension listens to:

  * textarea changes
  * contenteditable divs
  * input events
  * Enter / Send button clicks
* When user attempts to submit a message:

  * The text is scanned using regex classifiers.
  * If PII is found, preventDefault() is triggered.
  * A UI overlay warns the user and blocks submission.

No interception of private browsing.
No backend calls.
No external logs.

---

# ⚙️ Architecture

```
/PII-Guard
 ├── manifest.json
 ├── content.js
 ├── bg.js
 ├── popup.html
 ├── popup.js
 ├── styles/
 ├── icons/
 └── README.md
```

* **manifest.json** → Defines permissions and AI domains
* **content.js** → PII detection & blocking logic
* **bg.js** → Optional webhook logging (off by default)
* **popup.html / popup.js** → User settings (mode, toggle, logs)
* **icons/** → Extension branding

---

# 🔐 Permissions Required

```json
"permissions": [
  "storage",
  "scripting",
  "activeTab",
  "webRequest",
  "webRequestBlocking"
],
"host_permissions": ["<all_urls>"]
```

All data stays local unless user turns on an **optional webhook** (off by default).

---

# 🛠 Installation (Dev Mode)

1. Download or clone the repo
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select the extension folder

---

# 🧪 Testing

Try typing any of the following into ChatGPT/Gemini:

* `john.doe@example.com`
* `613-555-1234`
* `4111-1111-1111-1111`

The extension should:

* detect
* block
* show the overlay

---

# 📦 Future Roadmap

### Coming Soon:

* Custom regex rules
* Org-wide policies
* Admin console
* API key detection
* Cloud DLP integration
* Allowlist / blocklist for AI domains
* Firefox & Edge support

---

# 🧑‍💻 Contributors

**PII Guard** is built by:
`Hodan Mohamoud`
Security engineer • Product builder • Founder

---

# 💬 Feedback / Issues

Open an issue or DM me on LinkedIn for early access or testing.


