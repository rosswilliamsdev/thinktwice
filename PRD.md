# ThinkTwice — Project Requirements Document

> **Type:** Public (Chrome Web Store release)
> **Status:** Draft
> **Last Updated:** 2026-06-28

---

## Problem Statement

Amazon's UX is engineered to minimize friction between impulse and purchase — one-click Buy Now, urgency cues, and a frictionless checkout flow. ThinkTwice removes the Buy Now button entirely and inserts a deliberate pause at the cart stage (Proceed to Checkout) to give users a chance to reconsider before money leaves their account.

---

## Goals & Non-Goals

### Goals
- Remove all fast-purchase buttons from Amazon product pages entirely (Buy Now, Add to Tomorrow's Delivery, and similar), forcing the slower Add to Cart → cart → checkout path
- Interrupt "Proceed to Checkout" with a 30-second cooling-off page
- Present a simple, distraction-free prompt: "Do you really need this?"
- Ship a polished, trustworthy extension to the Chrome Web Store

### Non-Goals
- Support for any site other than Amazon (v1)
- Intercepting Place Order at the end of checkout
- Tracking purchases, spending, or savings data
- Backend, accounts, or sync across devices
- Configurable timer duration (v1)

---

## Feature List & Scope

### In Scope
- **Remove fast-purchase buttons** — hides Buy Now, Add to Tomorrow's Delivery, and similar fast-purchase buttons on Amazon product pages via content script DOM manipulation. Targets maintained as a centralized list for easy updates.
- **Proceed to Checkout interception** — clicking Proceed to Checkout redirects to a ThinkTwice countdown page for 30 seconds before continuing
- **Cooling-off page** — displays a countdown timer and the prompt "Do you really need this?"
- **Extension popup** — minimal UI (on/off toggle) to enable or disable ThinkTwice
- **Chrome Web Store listing** — icon, description, screenshots, privacy policy

### Out of Scope
- Fast-purchase button interception (buttons are removed, not intercepted)
- Place Order interception
- Non-Amazon sites
- Purchase history or savings tracking
- Timer customization
- Firefox or other browsers

---

## v1 Scope / Phasing

### v1 (MVP)
- Remove fast-purchase buttons from Amazon product pages (Buy Now, Add to Tomorrow's Delivery, and similar)
- Proceed to Checkout interception with 30-second countdown page
- "Do you really need this?" prompt on countdown page
- Extension popup with on/off toggle
- Chrome Web Store submission (icon, screenshots, privacy policy)

### Future Phases
- Configurable timer duration
- "Still want it?" moment after timer — confirm or abandon
- Savings tracker ("You've paused X purchases this month")
- Other retailers (Walmart, Target, etc.)

---

## Tech Stack & Architecture Notes

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Extension     | Chrome Manifest V3                |
| Language      | Vanilla JS                        |
| UI            | HTML/CSS (popup + countdown page) |
| Packaging     | Chrome Web Store (zip upload)     |
| Framework     | None                              |

**Architecture notes:**
- Content script runs on `amazon.com` product pages — removes fast-purchase buttons from the DOM on page load and on DOM mutations (Amazon renders dynamically). Primary targeting strategy: `[formaction*="/checkout/entry/buynow"]` as a catch-all for any button routing through Buy Now checkout, supplemented by specific IDs (`#buy-now-button`, `#add-to-delivery-desktop-button`, etc.) as needed. All selectors centralized in one config.
- Second content script (or same script scoped to cart page) — intercepts Proceed to Checkout click, captures destination URL, redirects to internal countdown page
- Countdown page is an extension page (`chrome-extension://`) — runs 30-second timer, then redirects to the originally captured URL on completion
- Popup toggles the extension on/off via `chrome.storage.sync`
- No external network calls, no backend, no user data stored outside local extension storage

---

## Constraints

- **Platform:** Desktop only (Chrome on desktop); mobile browsers not supported
- **Team:** Solo
- **Budget / Infra:** None (no backend)
- **Store requirements:** Must include privacy policy, 128px icon, and at least 1 screenshot for Web Store submission
- **Selector maintenance:** Amazon DOM updates may break button targeting — all fast-purchase button selectors must be centralized in one config object and easy to update

---

## Open Questions & Risks

| # | Question / Risk | Status |
|---|-----------------|--------|
| 1 | Amazon renders fast-purchase buttons dynamically — content script must handle DOM mutations (MutationObserver), not just initial page load | Open |
| 2 | Confirm MV3 content script → extension page redirect works reliably for Proceed to Checkout interception | Open |
| 3 | Does removing fast-purchase buttons affect any Amazon edge cases (gifting, Subscribe & Save, Amazon Fresh)? | Open |
| 4 | Privacy policy copy needed for Web Store submission | Open |
| 5 | User can bypass countdown by pressing browser back button — acceptable by design? | Open |
