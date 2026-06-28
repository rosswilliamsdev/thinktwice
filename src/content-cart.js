// ThinkTwice — cart page content script
// Intercepts "Proceed to Checkout", shows a full-screen cooling-off overlay,
// then re-triggers the real checkout when the user chooses to continue.
//
// Why an in-page overlay instead of a separate extension page: clicking
// Proceed to Checkout is a form submission carrying Amazon's session state.
// Redirecting to a chrome-extension:// page and back would risk losing that
// state. By overlaying the cart page and re-dispatching the original click, the
// native checkout flow runs untouched.

(() => {
  let enabled = true;

  // When true, the next Proceed-to-Checkout click is allowed straight through
  // (we set this right before re-dispatching the user's original click, so our
  // own synthetic click doesn't get intercepted again — avoids an infinite loop).
  let passthrough = false;

  // Find the Proceed-to-Checkout control the user actually clicked, if any.
  function matchedCheckoutButton(target) {
    const selector = THINKTWICE.PROCEED_TO_CHECKOUT_SELECTORS.join(',');
    return target.closest(selector);
  }

  // Capture-phase listener so we beat Amazon's own click handlers.
  function onClick(event) {
    if (!enabled || passthrough) return;
    const button = matchedCheckoutButton(event.target);
    if (!button) return;

    // Stop the native checkout from happening yet.
    event.preventDefault();
    event.stopImmediatePropagation();

    showOverlay(() => {
      // Continue: let the original click through this one time.
      passthrough = true;
      button.click();
    });
  }

  // Build the overlay DOM and kick off the countdown.
  function showOverlay(onContinue) {
    if (document.getElementById('tt-overlay')) return; // already showing

    const overlay = document.createElement('div');
    overlay.id = 'tt-overlay';
    overlay.innerHTML = `
      <div class="tt-prompt">Do you really need this?</div>
      <div class="tt-timer" id="tt-timer">${THINKTWICE.COUNTDOWN_SECONDS}</div>
      <div class="tt-sub">Take a moment. Most impulse buys feel less urgent after a short pause.</div>
      <div class="tt-actions">
        <button class="tt-leave" id="tt-leave">No, take me back</button>
        <button class="tt-continue" id="tt-continue" disabled>Continue to checkout</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const timerEl = overlay.querySelector('#tt-timer');
    const continueBtn = overlay.querySelector('#tt-continue');
    const leaveBtn = overlay.querySelector('#tt-leave');

    leaveBtn.addEventListener('click', () => removeOverlay());
    continueBtn.addEventListener('click', () => {
      removeOverlay();
      onContinue();
    });

    // TODO(you): implement the countdown — see runCountdown below.
    runCountdown(timerEl, continueBtn);
  }

  function removeOverlay() {
    document.getElementById('tt-overlay')?.remove();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // YOUR CONTRIBUTION
  //
  // Run the 30-second cooling-off countdown. This is the emotional core of the
  // extension, and there are real UX decisions baked into it:
  //
  //   • Cadence: tick once per second and update `timerEl.textContent`.
  //   • What happens at 0? The "Continue to checkout" button starts disabled
  //     (see overlay.css `.tt-continue:disabled`). Decide whether reaching 0
  //     should auto-proceed, or simply ENABLE the button and let the user make
  //     a deliberate final click. (The PRD's whole thesis is deliberate
  //     friction — auto-proceeding re-introduces the frictionless flow we set
  //     out to remove. But auto-proceed is arguably more "honest" about the
  //     30s promise. Your call.)
  //   • Cleanup: stop your interval when the overlay is gone so it doesn't tick
  //     forever (check `document.getElementById('tt-overlay')`, or clear it).
  //
  // @param {HTMLElement} timerEl   - the big number element to update
  // @param {HTMLButtonElement} continueBtn - disabled until the pause is over
  function runCountdown(timerEl, continueBtn) {
    let remaining = THINKTWICE.COUNTDOWN_SECONDS;
    const intervalId = setInterval(() => {
      // Stop ticking if the user already left ("No, take me back").
      if (!document.getElementById('tt-overlay')) {
        clearInterval(intervalId);
        return;
      }
      remaining -= 1;
      timerEl.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(intervalId);
        // Pause is over: enable the deliberate final click, don't auto-proceed.
        continueBtn.disabled = false;
        continueBtn.focus();
      }
    }, 1000);
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Attach interceptor in the capture phase.
  document.addEventListener('click', onClick, true);

  // Respect the popup toggle.
  chrome.storage.sync.get(THINKTWICE.STORAGE_KEY, (data) => {
    enabled = data[THINKTWICE.STORAGE_KEY] !== false;
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (THINKTWICE.STORAGE_KEY in changes) {
      enabled = changes[THINKTWICE.STORAGE_KEY].newValue !== false;
    }
  });
})();
