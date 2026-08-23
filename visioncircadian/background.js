//background.js
importScripts("csCalculator.js");

// tabId → { startTime: number, result: object|null }
const tabData = new Map();
let latestActiveTabId = null;


// =================================
// BADGE
// =================================
function updateBadge(cs) {
  const text = cs.toFixed(2);
  let color;
  if (cs < 0.30) color = "#2ecc71";
  else if (cs < 0.50) color = "#f1c40f";
  else color = "#e74c3c";
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}


// =================================
// TINT
// =================================
function applyTintToTab(cs, tabId) {
  let opacity = 0;
  const color = "rgb(255,120,0)";
  if (cs >= 0.50) opacity = 0.25;
  else if (cs >= 0.30) opacity = 0.12;

  chrome.scripting.executeScript({ target: { tabId }, files: ["tintOverlay.js"] });
  chrome.tabs.sendMessage(tabId, { type: "SET_TINT", opacity, color }, () => {
    if (chrome.runtime.lastError) {}
  });
}


// =================================
// SCREEN CAPTURE + CS COMPUTE
// =================================
async function collectAndCompute(tab) {
  if (!tab.url || tab.url.startsWith("chrome://")) return;

  await ensureCollector(tab.id);

  if (!tabData.has(tab.id)) {
    tabData.set(tab.id, { startTime: Date.now(), result: null });
  }
  const entry = tabData.get(tab.id);

  chrome.tabs.sendMessage(tab.id, { type: "COLLECT_COLOR_AREAS" }, (colorAreas) => {
    if (chrome.runtime.lastError || !colorAreas) return;

    const { CLA, CCT }     = computeCSFromColorAreas(colorAreas);
    const exposureMinutes  = (Date.now() - entry.startTime) / 60000;
    const CS = applyCircadianTimeWeight(calculateDurationAdjustedCS(CLA, exposureMinutes));

    entry.result = { CLA, CS, CCT, exposureMinutes };

    updateBadge(CS);
    applyTintToTab(CS, tab.id);
  });
}

async function ensureCollector(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["colorAreaCollector.js"] });
  } catch (e) {}
}


// =================================
// STARTUP
// =================================
// Seed the active tab so the popup has a record immediately on install/restart.
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs && tabs[0]) {
    latestActiveTabId = tabs[0].id;
    tabData.set(latestActiveTabId, { startTime: Date.now(), result: null });
  }
});

setInterval(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) collectAndCompute(tabs[0]);
  });
}, 1000);


// =================================
// TAB LIFECYCLE
// =================================
chrome.tabs.onActivated.addListener(({ tabId }) => {
  latestActiveTabId = tabId;
  // Create a new record only if this tab has never been seen.
  // Revisiting a tab keeps its existing result and start time.
  if (!tabData.has(tabId)) {
    tabData.set(tabId, { startTime: Date.now(), result: null });
  }
  chrome.action.setBadgeText({ text: "" });
});

// Clean up closed tabs so the Map doesn't grow unbounded.
chrome.tabs.onRemoved.addListener((tabId) => {
  tabData.delete(tabId);
});


// =================================
// MESSAGE HANDLER
// =================================
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_CS") {
    const entry = latestActiveTabId ? tabData.get(latestActiveTabId) : null;
    sendResponse(entry ? entry.result : null);
    return;
  }
});
