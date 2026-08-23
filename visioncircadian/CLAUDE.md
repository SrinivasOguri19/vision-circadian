# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

VisionCircadian is a Chrome Extension (Manifest V3) that estimates the circadian stimulus (CS) of the user's current screen by sampling DOM element colors and applying a photobiological model.

## Loading the extension

No build step. Load directly in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select this directory

After code changes, click the reload icon on the extension card in `chrome://extensions`.

## Architecture

The data flow runs in a tight 1-second loop:

```
background.js (service worker)
  └─ imports csCalculator.js at startup (importScripts)
  └─ every 1s: injects colorAreaCollector.js into active tab
       └─ COLLECT_COLOR_AREAS message → content script returns [{rgb, area}]
  └─ computeCSFromColorAreas() → raw CS
  └─ applyCircadianTimeWeight() → time-adjusted CS (capped at 0.75)
  └─ updateBadge() + applyTintToTab() → visual feedback
  └─ stores latestResult for popup polling

popup.js (runs in popup context)
  └─ polls background every 1s via GET_CS message
  └─ displays CS value with color class (low/medium/high)
```

### Files and roles

| File | Role |
|------|------|
| `manifest.json` | MV3 manifest; permissions: `scripting`, `activeTab`, `tabs` |
| `background.js` | Service worker; orchestrates sampling loop, badge, tint |
| `csCalculator.js` | Pure math: sRGB linearization → melanopic lux → CLA → CS (logistic curve) + time-of-day weighting |
| `colorAreaCollector.js` | Content script; walks DOM, clips elements to viewport, returns `{rgb, area}[]` |
| `tintOverlay.js` | Content script; injects/updates a warm-orange `<div>` overlay based on CS |
| `popup.html` / `popup.js` | Popup UI; polls background for CS and renders it |

### CS thresholds

| CS range | Color | Tint opacity |
|----------|-------|--------------|
| < 0.30 | green | none |
| 0.30–0.50 | yellow | 0.12 |
| ≥ 0.50 | red | 0.25 |

### Time-of-day weights (in `applyCircadianTimeWeight`)

Morning (6–12): ×1.0 · Afternoon (12–17): ×0.6 · Evening (17–21): ×1.3 · Night: ×1.6. Result is capped at 0.75.

## Key constraint

`csCalculator.js` is loaded in the **service worker** via `importScripts()`, so it must remain a plain script with no ES module syntax (`import`/`export`). All functions it exposes must be globals.
