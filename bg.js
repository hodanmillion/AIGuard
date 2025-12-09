
// PII_MVP – Background (Simple, ChatGPT fix build)

const MVP_DEFAULT_WEBHOOK =
  "https://script.google.com/macros/s/<ID>/exec";

const MVP_DEFAULT_EMPLOYEE = "anonymous";

function mvpGetSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        webhookUrl: MVP_DEFAULT_WEBHOOK,
        employeeId: MVP_DEFAULT_EMPLOYEE,
        companyName: "Example Corp",
        managerEmail: "",
        protectionMode: "block_and_alert",
        blockedCount: 0
      },
      (items) => resolve(items)
    );
  });
}

async function mvpHandlePiiDetected(message, sender, sendResponse) {
  try {
    const settings = await mvpGetSettings();
    const {
      webhookUrl,
      employeeId,
      companyName,
      managerEmail,
      blockedCount
    } = settings;

    if (!webhookUrl) {
      sendResponse({ ok: false, reason: "no_webhook" });
      return;
    }

    const newCount = (blockedCount || 0) + 1;
    chrome.storage.sync.set({ blockedCount: newCount });

    const payload = {
      event: "pii_attempt",
      employeeId,
      companyName,
      managerEmail,
      site: message.site || (sender?.url ? new URL(sender.url).hostname : "unknown"),
      piiTypes: message.detected?.piiTypes || [],
      maskedSample: message.detected?.maskedSample || "redacted",
      fullTextLength: message.length || 0,
      mode: message.mode || settings.protectionMode || "block_and_alert",
      timestamp: new Date().toISOString()
    };

    fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload)
    }).catch(() => {});

    sendResponse({ ok: true });
  } catch (e) {
    console.error("PII_MVP background error:", e);
    sendResponse({ ok: false, error: String(e) });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "PII_DETECTED") {
    mvpHandlePiiDetected(message, sender, sendResponse);
    return true;
  }
  return false;
});
