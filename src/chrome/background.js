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
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    updateBadge(tab.url);
    updatePopupState(tab.url);
  });
});

// Update badge and popup state when URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    updateBadge(changeInfo.url);
    updatePopupState(changeInfo.url);
  }
});

function updateBadge(url) {
  if (url && isNyaaSite(url)) {
    chrome.action.setBadgeText({ text: "On" });
    chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}

function updatePopupState(url) {
  if (url && isNyaaSite(url)) {
    chrome.action.enable();
    chrome.action.setPopup({ popup: "popup.html" });
  } else {
    chrome.action.disable();
    chrome.action.setPopup({ popup: "" });
  }
}
