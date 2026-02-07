// popup.js

chrome.runtime.sendMessage({ type: "GET_CS" }, result => {
  if (!result) return;

  const cs = result.CS.toFixed(2);
  document.getElementById("cs").textContent = cs;

  let label = "Low impact";
  if (cs > 0.5) label = "High circadian impact";
  else if (cs > 0.3) label = "Moderate impact";

  document.getElementById("label").textContent = label;
});
