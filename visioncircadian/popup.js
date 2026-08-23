const csValue       = document.getElementById("csValue");
const csSmall       = document.getElementById("csSmall");
const impactBadge   = document.getElementById("impactBadge");
const gaugeFill     = document.getElementById("gaugeFill");
const exposureValue = document.getElementById("exposureValue");
const claValue      = document.getElementById("claValue");
const cctValue      = document.getElementById("cctValue");
const timeWeightEl  = document.getElementById("timeWeightValue");
const headerDot     = document.getElementById("headerDot");

function csColorClass(cs) {
  if (cs < 0.30) return "low";
  if (cs < 0.50) return "medium";
  return "high";
}

function impactText(cs) {
  if (cs >= 0.50) return "High Impact";
  if (cs >= 0.30) return "Moderate Impact";
  if (cs >= 0.10) return "Low Impact";
  return "Minimal Impact";
}

function cctColorClass(cct) {
  if (cct < 3500) return "cct-warm";
  if (cct > 5500) return "cct-cool";
  return "cct-neutral";
}

function timeWeightLabel() {
  const h = new Date().getHours();
  if (h >= 6  && h < 12) return "×1.0  morning";
  if (h >= 12 && h < 17) return "×0.6  afternoon";
  if (h >= 17 && h < 21) return "×1.3  evening";
  return "×1.6  night";
}

function formatMinutes(mins) {
  if (mins < 1) return "<1";
  return Math.floor(mins).toString();
}

function render(result) {
  if (!result || typeof result.CS !== "number" || Number.isNaN(result.CS)) {
    headerDot.classList.add("loading");
    csValue.textContent     = "--";
    csValue.className       = "score-value";
    csSmall.textContent     = "--";
    impactBadge.textContent = "Calculating…";
    impactBadge.className   = "impact-badge";
    gaugeFill.style.width   = "0%";
    gaugeFill.className     = "gauge-fill";
    exposureValue.innerHTML = '-- <span class="metric-unit">min</span>';
    claValue.textContent    = "--";
    cctValue.innerHTML      = '-- <span class="metric-unit">K</span>';
    timeWeightEl.textContent = "--";
    return;
  }

  headerDot.classList.remove("loading");

  const cs  = result.CS;
  const cls = csColorClass(cs);

  csValue.textContent = cs.toFixed(2);
  csValue.className   = "score-value " + cls;
  csSmall.textContent = cs.toFixed(2);

  impactBadge.textContent = impactText(cs);
  impactBadge.className   = "impact-badge " + cls + "-badge";

  gaugeFill.style.width = (Math.min(cs / 0.75, 1) * 100).toFixed(1) + "%";
  gaugeFill.className   = "gauge-fill " + cls + "-gauge";

  headerDot.style.background =
    cls === "low" ? "#2ecc71" : cls === "medium" ? "#f1c40f" : "#e74c3c";

  const mins = typeof result.exposureMinutes === "number" ? result.exposureMinutes : 0;
  exposureValue.innerHTML = formatMinutes(mins) + ' <span class="metric-unit">min</span>';

  claValue.textContent = typeof result.CLA === "number" ? result.CLA.toFixed(1) : "--";

  if (typeof result.CCT === "number") {
    const cctK   = Math.round(result.CCT / 100) * 100; // round to nearest 100 K
    const cctCls = cctColorClass(result.CCT);
    cctValue.innerHTML =
      `<span class="${cctCls}">${cctK.toLocaleString()}</span> <span class="metric-unit">K</span>`;
  } else {
    cctValue.innerHTML = '-- <span class="metric-unit">K</span>';
  }

  timeWeightEl.textContent = timeWeightLabel();
}

function poll() {
  chrome.runtime.sendMessage({ type: "GET_CS" }, result => {
    render(result);
    setTimeout(poll, 1000);
  });
}

poll();
