
const oWebhook = document.getElementById("webhookUrl");
const oEmployee = document.getElementById("employeeId");
const oTeam = document.getElementById("teamName");
const oManager = document.getElementById("managerEmail");
const oMode = document.getElementById("protectionMode");
const oCompany = document.getElementById("companyName");
const oSave = document.getElementById("saveBtn");
const oStatus = document.getElementById("status");

function loadSettings() {
  chrome.storage.sync.get(
    {
      webhookUrl: "",
      employeeId: "",
      teamName: "",
      managerEmail: "",
      protectionMode: "block_and_alert",
      companyName: ""
    },
    (items) => {
      oWebhook.value = items.webhookUrl || "";
      oEmployee.value = items.employeeId || "";
      oTeam.value = items.teamName || "";
      oManager.value = items.managerEmail || "";
      oMode.value = items.protectionMode || "block_and_alert";
      oCompany.value = items.companyName || "";
    }
  );
}

function saveSettings() {
  const webhookUrl = oWebhook.value.trim();
  const employeeId = oEmployee.value.trim();
  const teamName = oTeam.value.trim();
  const managerEmail = oManager.value.trim();
  const protectionMode = oMode.value;
  const companyName = oCompany.value.trim();

  chrome.storage.sync.set(
    {
      webhookUrl,
      employeeId,
      teamName,
      managerEmail,
      protectionMode,
      companyName
    },
    () => {
      oStatus.textContent = "Saved.";
      setTimeout(() => (oStatus.textContent = ""), 1600);
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  oSave.addEventListener("click", saveSettings);
});
