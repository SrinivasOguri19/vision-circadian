// csCalculator.js

function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045
    ? c / 12.92
    : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Approx melanopic weighting
function melanopicLuxFromRGB(r, g, b) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);

  return (
    0.001 * R +
    0.018 * G +
    0.981 * B
  );
}

// Logistic CS function
function claToCS(CLA) {
  const k = 1.1;
  const x0 = 2.0;

  return 0.75 / (1 + Math.exp(-k * (Math.log10(CLA + 1) - x0)));
}

// MAIN API (global)
function computeCSFromColors(colors) {
  let melanopicSum = 0;

  colors.forEach(rgb => {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    melanopicSum += melanopicLuxFromRGB(r, g, b);
  });

  const avgMelanopic = melanopicSum / colors.length;

  const CLA = avgMelanopic * 300; // screen luminance scaling
  const CS = claToCS(CLA);

  return { CLA, CS };
}
