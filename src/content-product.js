// ThinkTwice — product page content script
// Removes fast-purchase buttons (Buy Now, Add to Tomorrow's Delivery, etc.)
// on load and as Amazon dynamically injects them (PRD risk #1).

(() => {
  let enabled = true;

  // Hide every element matching the centralized fast-purchase selectors.
  // We hide rather than removeChild so Amazon's own scripts don't error when
  // they expect the node to still exist in the tree.
  function removeFastPurchaseButtons() {
    if (!enabled) return;
    const selector = THINKTWICE.FAST_PURCHASE_SELECTORS.join(',');
    for (const el of document.querySelectorAll(selector)) {
      // Walk up to the button's container row so we hide the whole control,
      // not just the inner <input>, avoiding an empty gap in the buy box.
      const target = el.closest('[id$="-announce"]') || el.closest('.a-button') || el;
      target.style.setProperty('display', 'none', 'important');
      target.setAttribute('data-thinktwice-removed', 'true');
    }
  }

  // Amazon re-renders the buy box dynamically, so observe the DOM and re-run
  // removal on any mutation. We debounce with requestAnimationFrame so a burst
  // of mutations only triggers one sweep.
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      removeFastPurchaseButtons();
    });
  });

  function start() {
    removeFastPurchaseButtons();
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Respect the popup toggle. Default to enabled if unset.
  chrome.storage.sync.get(THINKTWICE.STORAGE_KEY, (data) => {
    enabled = data[THINKTWICE.STORAGE_KEY] !== false;
    if (enabled) start();
  });

  // React live to toggle changes without requiring a page reload.
  chrome.storage.onChanged.addListener((changes) => {
    if (!(THINKTWICE.STORAGE_KEY in changes)) return;
    enabled = changes[THINKTWICE.STORAGE_KEY].newValue !== false;
    if (enabled) {
      start();
    } else {
      // Restore previously hidden buttons when disabled.
      for (const el of document.querySelectorAll('[data-thinktwice-removed]')) {
        el.style.removeProperty('display');
        el.removeAttribute('data-thinktwice-removed');
      }
    }
  });
})();
