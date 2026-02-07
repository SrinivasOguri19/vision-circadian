// contentScript.js

function extractColors() {
  const elements = document.querySelectorAll("*");
  let colors = [];

  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    const bg = style.backgroundColor;
    const color = style.color;

    if (bg && bg.startsWith("rgb")) colors.push(bg);
    if (color && color.startsWith("rgb")) colors.push(color);
  });

  return colors;
}

chrome.runtime.sendMessage({
  type: "COLORS_EXTRACTED",
  colors: extractColors()
});
