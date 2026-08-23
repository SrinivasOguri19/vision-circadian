function parseRGB(color) {
  const m = color.match(/\d+/g);
  if (!m) return null;
  return m.slice(0, 3).map(Number);
}

function collectColorAreas() {
  const elements = document.body.querySelectorAll("*");
  const viewportArea = window.innerWidth * window.innerHeight;

  const results = [];

  elements.forEach(el => {
    const style = getComputedStyle(el);

    if (style.visibility === "hidden" || style.display === "none") return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const area =
      Math.max(0, Math.min(rect.right, window.innerWidth) -
      Math.max(rect.left, 0)) *
      Math.max(0, Math.min(rect.bottom, window.innerHeight) -
      Math.max(rect.top, 0));

    if (area <= 0) return;

    // Prefer background, fallback to text
    let color = style.backgroundColor;
    if (color === "rgba(0, 0, 0, 0)") {
      color = style.color;
    }

    const rgb = parseRGB(color);
    if (!rgb) return;

    results.push({ rgb, area });
  });

  return results;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "COLLECT_COLOR_AREAS") {
    sendResponse(collectColorAreas());
  }
});
