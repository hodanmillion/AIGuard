
const badgeEl = document.getElementById("statusBadge");
const siteEl = document.getElementById("siteLabel");
const modeEl = document.getElementById("modeLabel");
const countEl = document.getElementById("countLabel");
const btnSettings = document.getElementById("openSettings");

function setBadge(onAi, mode) {
  if (!onAi || mode === "off") {
    badgeEl.textContent = "Inactive";
    badgeEl.className = "badge badge-off";
  } else {
    badgeEl.textContent = "Protecting";
    badgeEl.className = "badge badge-on";
  }
}

function loadStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    let host = "unknown";
    try {
      host = tab?.url ? new URL(tab.url).hostname : "unknown";
    } catch (e) {}

    siteEl.textContent = host;

    chrome.storage.sync.get(
      {
        protectionMode: "block_and_alert",
        blockedCount: 0
      },
      (items) => {
        const mode = items.protectionMode || "block_and_alert";
        const count = items.blockedCount || 0;

        const modeText =
          mode === "block_and_alert"
            ? "Block & alert"
            : mode === "warn_only"
            ? "Warn only"
            : "Off";

        modeEl.textContent = modeText;
        countEl.textContent = String(count);

        const aiHosts = [
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
        const onAi = aiHosts.some((h) => host === h || host.endsWith("." + h));

        setBadge(onAi, mode);
      }
    );
  });
}

btnSettings.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

document.addEventListener("DOMContentLoaded", loadStatus);
