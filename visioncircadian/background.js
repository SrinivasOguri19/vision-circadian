// background.js

importScripts("csCalculator.js");

let latestResult = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "COLORS_EXTRACTED") {
    latestResult = computeCSFromColors(msg.colors);
  }

  if (msg.type === "GET_CS") {
    sendResponse(latestResult);
  }
});
