// csCalculator.js

function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045
    ? c / 12.92
    : Math.pow((c + 0.055) / 1.055, 2.4);
}

// sRGB linear → CIE XYZ (D65 white point, IEC 61966-2-1 matrix)
function srgbLinearToXYZ(R, G, B) {
  return {
    X: 0.4124564 * R + 0.3575761 * G + 0.1804375 * B,
    Y: 0.2126729 * R + 0.7151522 * G + 0.0721750 * B,
    Z: 0.0193339 * R + 0.1191920 * G + 0.9503041 * B,
  };
}

// McCamy (1992): CIE xy chromaticity → CCT (valid ~2500–20000 K)
function xyzToCCT(X, Y, Z) {
  const s = X + Y + Z;
  if (s < 1e-6) return null;
  const x = X / s;
  const y = Y / s;
  const n = (x - 0.3320) / (y - 0.1858);
  const CCT = -449 * n * n * n + 3525 * n * n - 6823.3 * n + 5520.33;
  return CCT >= 1000 && CCT <= 20000 ? Math.round(CCT) : null;
}

// Melanopic lux from linearized sRGB.
// Coefficients: CIE S 026:2018 melanopic efficiency function integrated
// against standard sRGB primaries (D65). ipRGC peak ≈ 490 nm — blue-dominant.
function melanopicLuxFromLinear(R, G, B) {
  return 0.0016 * R + 0.0274 * G + 0.9710 * B;
}

// Duration + CLA based CS (Rea et al. model)
function calculateDurationAdjustedCS(CLA, exposureMinutes) {
  const t = exposureMinutes / 60;
  const E = t * CLA;
  return 0.7 * (1 - 1 / (1 + Math.pow(E / 355.7, 1.1026)));
}

// Returns { CLA, CCT }
// CCT: area-weighted correlated color temperature of visible screen content.
function computeCSFromColorAreas(colorAreas) {
  let melanopicSum = 0;
  let totalArea    = 0;
  let Xsum = 0, Ysum = 0, Zsum = 0;

  colorAreas.forEach(({ rgb, area }) => {
    const [r, g, b] = rgb;
    const R = srgbToLinear(r);
    const G = srgbToLinear(g);
    const B = srgbToLinear(b);

    melanopicSum += melanopicLuxFromLinear(R, G, B) * area;
    totalArea    += area;

    const { X, Y, Z } = srgbLinearToXYZ(R, G, B);
    Xsum += X * area;
    Ysum += Y * area;
    Zsum += Z * area;
  });

  if (totalArea === 0) return { CLA: 0, CCT: null };

  const CLA = (melanopicSum / totalArea) * 300;
  const CCT = xyzToCCT(Xsum, Ysum, Zsum);

  return { CLA, CCT };
}

function applyCircadianTimeWeight(cs) {
  const hour = new Date().getHours();
  let weight;
  if      (hour >= 6  && hour < 12) weight = 1.0;
  else if (hour >= 12 && hour < 17) weight = 0.6;
  else if (hour >= 17 && hour < 21) weight = 1.3;
  else                               weight = 1.6;
  return Math.min(cs * weight, 0.75);
}
