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

function computeCSFromColorAreas(colorAreas) {
  let melanopicSum = 0;
  let totalArea = 0;

  colorAreas.forEach(({ rgb, area }) => {
    const [r, g, b] = rgb;
    const melanopic = melanopicLuxFromRGB(r, g, b);

    melanopicSum += melanopic * area;
    totalArea += area;
  });

  if (totalArea === 0) return { CLA: 0, CS: 0 };

  const avgMelanopic = melanopicSum / totalArea;

  const CLA = avgMelanopic * 300; // screen luminance scaling
  const CS = claToCS(CLA);

  return { CLA, CS };
}

function computeCSFromPixels(pixels) {
  let melanopicSum = 0;

  pixels.forEach(([r, g, b]) => {
    melanopicSum += melanopicLuxFromRGB(r, g, b);
  });
  if (pixels.length === 0) return { CLA: 0, CS: 0 };


  const avgMelanopic = melanopicSum / pixels.length;

  const CLA = avgMelanopic * 300;

  return {
    CLA,
    CS: claToCS(CLA)
  };
}
function applyCircadianTimeWeight(cs) {

  const hour = new Date().getHours();

  // Biological sensitivity model
  let weight;

  if (hour >= 6 && hour < 12) weight = 1.0;      // morning
  else if (hour >= 12 && hour < 17) weight = 0.6; // afternoon
  else if (hour >= 17 && hour < 21) weight = 1.3; // evening
  else weight = 1.6;                              // night

  return Math.min(cs * weight, 0.75);
}
