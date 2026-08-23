// tintOverlay.js
(function () {

  if (document.getElementById("circadianTint")) return;

  const overlay = document.createElement("div");
  overlay.id = "circadianTint";

  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.pointerEvents = "none";
  overlay.style.mixBlendMode = "multiply";
  overlay.style.zIndex = 999999;

  document.body.appendChild(overlay);

  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === "SET_TINT") {
      overlay.style.background = msg.color;
      overlay.style.opacity = msg.opacity;
    }
  });

})();
