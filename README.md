# ThinkTwice

A Chrome extension that removes Amazon's fast-purchase buttons and inserts a
30-second cooling-off pause before checkout — giving you a chance to reconsider
before money leaves your account.

## How it works

- **Removes fast-purchase buttons** (Buy Now, Add to Tomorrow's Delivery) from
  product pages, forcing the slower Add to Cart → cart → checkout path.
- **Pauses checkout** — clicking "Proceed to Checkout" shows a full-screen
  30-second countdown with the prompt _"Do you really need this?"_ before letting
  the native checkout continue.
- **On/off toggle** in the popup.
- **No tracking, no backend, no data collection.** See [PRIVACY.md](PRIVACY.md).

## Project layout

| File | Purpose |
|------|---------|
| `manifest.json` | Manifest V3 config — content scripts, popup, icons, permissions |
| `src/config.js` | **Centralized selectors** & settings — edit here when Amazon's DOM changes |
| `src/content-product.js` | Removes fast-purchase buttons (with `MutationObserver`) |
| `src/content-cart.js` | Intercepts checkout, shows the cooling-off overlay |
| `src/overlay.css` | Styles for the full-screen countdown overlay |
| `src/popup.{html,css,js}` | On/off toggle UI |
| `icons/` | 16 / 48 / 128 px icons |

## Install (development)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select this folder
4. Visit an Amazon product page or cart to test

## Packaging for the Web Store

Zip the project root (excluding `.git`) and upload at the
[Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
A privacy policy ([PRIVACY.md](PRIVACY.md)), a 128px icon, and at least one
screenshot are required.
