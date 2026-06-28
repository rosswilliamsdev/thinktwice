// ThinkTwice — centralized configuration
// All Amazon DOM selectors live here so they're easy to update when Amazon
// changes its markup (PRD constraint: "Selector maintenance").
//
// This file is loaded as the first content script, so `THINKTWICE` is available
// to the other content scripts on the page.

const THINKTWICE = {
  // How long the cooling-off pause lasts, in seconds.
  COUNTDOWN_SECONDS: 30,

  // chrome.storage key for the on/off toggle.
  STORAGE_KEY: 'enabled',

  // Fast-purchase buttons to remove from product pages.
  // Primary strategy: match anything routing through the Buy Now checkout
  // (formaction catch-all), supplemented by specific known IDs.
  FAST_PURCHASE_SELECTORS: [
    '[formaction*="/checkout/entry/buynow"]', // catch-all: any Buy Now form button
    '#buy-now-button',
    '#oneClickBuyButton',
    '#add-to-delivery-desktop-button', // "Add to Tomorrow's Delivery"
    '#addToDeliveryButton',
  ],

  // "Proceed to Checkout" buttons on the cart page that should trigger the pause.
  PROCEED_TO_CHECKOUT_SELECTORS: [
    '#sc-buy-box-ptc-button',
    'input[name="proceedToCheckout"]',
    'input[name="proceedToRetailCheckout"]',
    '[data-feature-id="proceed-to-checkout-action"]',
  ],
};
