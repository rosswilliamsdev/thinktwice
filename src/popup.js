// ThinkTwice — popup toggle logic
const STORAGE_KEY = 'enabled';

const toggle = document.getElementById('toggle');
const statusLabel = document.getElementById('status-label');

function render(enabled) {
  toggle.checked = enabled;
  statusLabel.textContent = enabled ? 'On' : 'Off';
}

// Load current state (default: on).
chrome.storage.sync.get(STORAGE_KEY, (data) => {
  render(data[STORAGE_KEY] !== false);
});

// Persist on change; content scripts react via storage.onChanged.
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  render(enabled);
  chrome.storage.sync.set({ [STORAGE_KEY]: enabled });
});
