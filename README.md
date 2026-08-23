# VisionCircadian

**Know how your screen is affecting your body clock — in real time.**

VisionCircadian is a Chrome extension that measures the **Circadian Stimulus (CS)** of any webpage you visit. It analyzes the colors on screen, factors in how long you've been on the tab and the time of day, and gives you a live score showing how much your screen light is affecting your melatonin and sleep cycle.

[![Available on Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/visioncircadian/inaihipkambenjfmopmfoamojdcmeldn)

---

## Why It Matters

Screen light — especially blue-heavy light — suppresses melatonin and delays your circadian rhythm. This is well-established in photobiological research (Rea et al., CIE S 026:2018). The problem is that most people have no idea how stimulating their screen actually is at any given moment.

VisionCircadian makes that invisible signal visible:

- Using a **dark-themed** app at night? Your score stays low.
- Reading a bright white article? Your score spikes — even if you have Night Shift on.
- Been on the same tab for an hour? Cumulative exposure builds up in the score.

---

## How to Use

1. **Install** the extension from the [Chrome Web Store](https://chromewebstore.google.com/detail/visioncircadian/inaihipkambenjfmopmfoamojdcmeldn).
2. **Browse normally** — VisionCircadian runs automatically in the background.
3. **Check the badge** on the extension icon at any time:
   - **Green** — low circadian impact, minimal effect on sleep
   - **Yellow** — moderate impact, worth being aware of
   - **Red** — high impact, strong melatonin suppression
4. **Click the icon** to open the detailed popup showing:
   - **CS Score** — your overall circadian stimulus (0–0.75)
   - **Tab Exposure** — how long you've been on this tab
   - **CLA** — raw melanopic light level (ipRGC-weighted)
   - **Color Temperature** — how warm or cool your screen content is (in Kelvin)
   - **Time Weight** — biological sensitivity multiplier for the current hour

Hover over the **?** icon next to any metric for a plain-language explanation.

---

## How the Score Works

| CS Range | Level | Effect |
|---|---|---|
| 0.00 – 0.10 | Minimal | Negligible biological effect |
| 0.10 – 0.30 | Low | Slight circadian activation |
| 0.30 – 0.50 | Moderate | Noticeable alerting effect |
| 0.50 – 0.75 | High | Strong melatonin suppression |

The score is calculated using the **Rea et al. photobiological model**, which accounts for:
- **Melanopic lux** — blue-weighted light energy detected by intrinsically photosensitive retinal ganglion cells (ipRGCs)
- **Exposure duration** — cumulative dose on the current tab
- **Time of day** — your circadian system is most sensitive in the evening and at night

A warm amber tint is automatically applied to the page when your score is moderate or high, as a gentle reminder.

---

## Tips for Reducing Your Score at Night

- Switch to dark mode on websites and your OS
- Use apps with warm color palettes in the evening
- Reduce screen brightness after sunset
- Take breaks — even a few minutes away from the screen resets the exposure timer

---

## Privacy

VisionCircadian processes everything **locally on your device**. No data is ever collected, stored, or transmitted. [Read the full privacy policy.](https://srinivasoguri19.github.io/vision-circadian/visioncircadian/privacy.html)

---

## Version

Current release: **1.1.0**
