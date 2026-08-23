//background.js
importScripts("csCalculator.js");

let latestResult = null;
let latestTabId = null;
let autoTimer = null;


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
  let color = "rgb(255,120,0)";

  if (cs >= 0.50) opacity = 0.25;
  else if (cs >= 0.30) opacity = 0.12;

  chrome.scripting.executeScript({
    target: { tabId },
    files: ["tintOverlay.js"]
  });

  chrome.tabs.sendMessage(tabId, {
    type: "SET_TINT",
    opacity,
    color
  }, () => {
    if (chrome.runtime.lastError) {
      // ignore if no listener yet
    }
  });
}


// =================================
// SCREEN CAPTURE + CS COMPUTE
// =================================
async function collectAndCompute(tab) {
  if (!tab.url || tab.url.startsWith("chrome://")) return;

  await ensureCollector(tab.id);

  chrome.tabs.sendMessage(
    tab.id,
    { type: "COLLECT_COLOR_AREAS" },
    (colorAreas) => {
      if (chrome.runtime.lastError || !colorAreas) return;

      let result = computeCSFromColorAreas(colorAreas);
      result.CS = applyCircadianTimeWeight(result.CS);

      latestResult = result;
      latestTabId = tab.id;

      updateBadge(result.CS);
      applyTintToTab(result.CS, tab.id);
    }
  );
}


function startAutoCS() {
  if (autoTimer) return;

  autoTimer = setInterval(() => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      tabs => {
        if (!tabs || !tabs[0]) return;
        collectAndCompute(tabs[0]);
      }
    );
  }, 1000); // every 1 second
}

startAutoCS();


chrome.tabs.onActivated.addListener(() => {
  latestResult = null;
  latestTabId = null;

  chrome.action.setBadgeText({ text: "" });
});
async function ensureCollector(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["colorAreaCollector.js"]
    });
  } catch (e) {
    // Ignore errors (unsupported pages)
  }
}


// =================================
// MESSAGE HANDLER
// =================================
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  


  if (msg.type === "GET_CS") {
  sendResponse({
    ...latestResult,
    valid: sender.tab && sender.tab.id === latestTabId
  });
  return;
}

}


);
