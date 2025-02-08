// Array of supported Nyaa domains from manifest.json
const supportedDomains = [
  "nyaa.si",
  "nya.iss.one",
  "nyaa.ink",
  "nyaa.land",
  "nyaa.digital",
  "ny.iss.one",
];

// Check if a URL matches any supported domain
function isNyaaSite(url) {
  return supportedDomains.some((domain) => url.includes(domain));
}

// Update badge and popup state when tab changes
browser.tabs.onActivated.addListener((activeInfo) => {
  browser.tabs.get(activeInfo.tabId, (tab) => {
    updateBadge(tab.url);
    updatePopupState(tab.url);
  });
});

// Update badge and popup state when URL changes
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    updateBadge(changeInfo.url);
    updatePopupState(changeInfo.url);
  }
});

function updateBadge(url) {
  if (url && isNyaaSite(url)) {
    browser.action.setBadgeText({ text: "On" });
    browser.action.setBadgeBackgroundColor({ color: "#4CAF50" });
  } else {
    browser.action.setBadgeText({ text: "" });
  }
}

function updatePopupState(url) {
  if (url && isNyaaSite(url)) {
    browser.action.enable();
    browser.action.setPopup({ popup: "popup.html" });
  } else {
    browser.action.disable();
    browser.action.setPopup({ popup: "" });
  }
}
