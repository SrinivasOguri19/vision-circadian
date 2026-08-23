const csLabel = document.getElementById("cs");
const infoPanel = document.getElementById("infoPanel");
const labelEl = document.getElementById("label");

// Initial state
csLabel.textContent = "--";
csLabel.className = "score";

function colorClass(cs) {
  if (cs < 0.30) return "low";
  if (cs < 0.50) return "medium";
  return "high";
}

function impactLabel(cs) {
  if (cs > 0.5) return "High circadian impact";
  if (cs > 0.3) return "Moderate impact";
  return "Low impact";
}

function loadCS() {
  chrome.runtime.sendMessage({ type: "GET_CS" }, result => {
    // Defensive guard (this fixes your crash)
    if (
      !result ||
      typeof result.CS !== "number" ||
      Number.isNaN(result.CS)
    ) {
      csLabel.textContent = "--";
      csLabel.className = "score";
      labelEl.textContent = "Circadian Stimulus";
      return;
    }

    const cs = result.CS;

    csLabel.textContent = cs.toFixed(2);
    csLabel.className = "score " + colorClass(cs);
    labelEl.textContent = impactLabel(cs);
  });
}

// Auto-refresh every second
function autoRefreshPopup() {
  loadCS();
  setTimeout(autoRefreshPopup, 1000);
}

autoRefreshPopup();

// =========================
// INFO BUTTON
// =========================
document.getElementById("infoBtn").onclick = () => {
  infoPanel.style.display =
    infoPanel.style.display === "none" ? "block" : "none";
};
