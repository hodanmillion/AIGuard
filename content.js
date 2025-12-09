
// PII_MVP – Content Script (ChatGPT-hardened, simple UX)
// Runs on AI chat tools and gently blocks/warns on PII before it's sent.

const MVP_AI_HOSTS = [
  "chat.openai.com",
  "chatgpt.com",
  "openai.com",
  "claude.ai",
  "poe.com",
  "gemini.google.com",
  "perplexity.ai",
  "copilot.microsoft.com",
  "www.bing.com",
  "grok.com",
  "pi.ai"
];

function mvpIsAiHost(hostname) {
  return MVP_AI_HOSTS.some(h => hostname === h || hostname.endsWith("." + h));
}

const MVP_HOST = window.location.hostname;

// Lightweight settings cache
const MVP_SETTINGS = {
  protectionMode: "block_and_alert" // "block_and_alert" | "warn_only" | "off"
};

chrome.storage.sync.get({ protectionMode: "block_and_alert" }, (items) => {
  MVP_SETTINGS.protectionMode = items.protectionMode || "block_and_alert";
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.protectionMode) {
    MVP_SETTINGS.protectionMode = changes.protectionMode.newValue || "block_and_alert";
  }
});

// ---------- PII detection ----------

function mvpMaskEmail(email) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return user[0] + "***@" + domain;
}

function mvpDetectPii(text) {
  const emailRegex = /\b\S+@\S+\.\S+\b/g;
  const ccRegex = /\b(?:\d[ -]*?){13,16}\b/g;
  const phoneRegex = /\b\+?\d[\d\-\s]{6,}\d\b/g;

  const piiTypes = [];
  const matches = [];

  if (emailRegex.test(text)) {
    piiTypes.push("email");
    const m = text.match(emailRegex)[0];
    matches.push(mvpMaskEmail(m));
  }

  if (ccRegex.test(text)) {
    piiTypes.push("credit_card");
    const last4 = (text.match(/\d{4}\b/) || ["????"])[0];
    matches.push("XXXX-XXXX-XXXX-" + last4);
  }

  if (phoneRegex.test(text)) {
    piiTypes.push("phone");
    matches.push("phone: ****");
  }

  return {
    hasPii: piiTypes.length > 0,
    piiTypes,
    maskedSample: matches[0] || "redacted"
  };
}

// ---------- DOM helpers ----------

function mvpGetActiveInput() {
  // Prefer the element the user is currently typing into
  const active = document.activeElement;
  if (active && (active.tagName === "TEXTAREA" || active.isContentEditable)) {
    return active;
  }

  // Otherwise, grab the last non-readonly textarea in a form
  const candidates = Array.from(
    document.querySelectorAll("form textarea, textarea")
  ).filter(el => !el.readOnly && !el.disabled);
  if (candidates.length) return candidates[candidates.length - 1];

  // Fallback: generic contenteditable
  const editable = document.querySelector("div[contenteditable='true']");
  return editable || null;
}

function mvpGetText(el) {
  if (!el) return "";
  if ("value" in el) return el.value;
  return el.innerText || "";
}

function mvpClearText(el) {
  if (!el) return;
  if ("value" in el) el.value = "";
  else el.innerText = "";
}

function mvpShowToast(message, modeLabel) {
  try {
    const existing = document.getElementById("pii-mvp-banner");
    if (existing) existing.remove();

    const banner = document.createElement("div");
    banner.id = "pii-mvp-banner";
    Object.assign(banner.style, {
      position: "fixed",
      bottom: "16px",
      right: "16px",
      zIndex: "2147483647",
      padding: "10px 14px",
      borderRadius: "10px",
      fontSize: "13px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: "#111827",
      color: "#f9fafb",
      boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      maxWidth: "280px"
    });

    const icon = document.createElement("div");
    icon.textContent = "🛡️";
    icon.style.fontSize = "16px";

    const wrap = document.createElement("div");

    const title = document.createElement("div");
    title.textContent = "PII Guard";
    title.style.fontWeight = "600";

    const msg = document.createElement("div");
    msg.textContent = message;

    const mode = document.createElement("div");
    mode.textContent = modeLabel;
    mode.style.fontSize = "11px";
    mode.style.opacity = "0.75";

    wrap.appendChild(title);
    wrap.appendChild(msg);
    wrap.appendChild(mode);

    banner.appendChild(icon);
    banner.appendChild(wrap);
    document.body.appendChild(banner);

    setTimeout(() => banner.remove(), 3500);
  } catch (e) {
    console.log("PII_MVP:", message, modeLabel);
  }
}

// ---------- Core logic ----------

function mvpHandlePotentialSend() {
  const mode = MVP_SETTINGS.protectionMode;
  if (mode === "off") return;

  const input = mvpGetActiveInput();
  if (!input) return;

  const text = mvpGetText(input);
  if (!text) return;

  const detected = mvpDetectPii(text);
  if (!detected.hasPii) return;

  const site = window.location.hostname;

  if (mode === "block_and_alert") {
    mvpClearText(input);
    mvpShowToast(
      "We blocked this message because it looks like customer or personal data.",
      "Mode: Block & alert"
    );
  } else if (mode === "warn_only") {
    mvpShowToast(
      "This looks like PII. Please double-check before sending.",
      "Mode: Warn only (not blocked)"
    );
  }

  chrome.runtime.sendMessage(
    {
      type: "PII_DETECTED",
      text,
      detected,
      site,
      length: text.length,
      mode
    },
    () => {}
  );
}

function mvpAttachGlobalListeners() {
  if (document.documentElement.dataset.piiMvpAttached === "1") return;
  document.documentElement.dataset.piiMvpAttached = "1";

  // 1) Capture Enter presses anywhere on the page.
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // Let our handler inspect the active field first.
        mvpHandlePotentialSend();

        if (MVP_SETTINGS.protectionMode === "block_and_alert") {
          // In block mode, stop the send if we just cleared PII.
          // If no PII was found, handler is a no-op and this is harmless.
          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    true
  );

  // 2) Also watch clicks on generic "send" buttons in forms (for mice/touch).
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      const isButton =
        target.tagName === "BUTTON" ||
        target.closest("button[type='submit'], button[data-testid='send-button']");

      if (!isButton) return;

      mvpHandlePotentialSend();

      if (MVP_SETTINGS.protectionMode === "block_and_alert") {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  console.log("[PII_MVP] Global listeners attached on", MVP_HOST);
}

// Only run on AI chat sites
if (mvpIsAiHost(MVP_HOST)) {
  console.log("[PII_MVP] AI site detected:", MVP_HOST);
  mvpAttachGlobalListeners();
}
