// Array of supported Nyaa domains from manifest.json
const supportedDomains = [
  "nyaa.si",
  "nyaa.eu",
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

// Update badge when tabs change
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await browser.tabs.get(activeInfo.tabId);
  updateBadge(tab.url);
});

// Update badge when URLs change
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    updateBadge(changeInfo.url);
  }
});

function updateBadge(url) {
  if (url && isNyaaSite(url)) {
    browser.browserAction.setBadgeText({ text: "On" });
    browser.browserAction.setBadgeBackgroundColor({ color: "#4CAF50" });
  } else {
    browser.browserAction.setBadgeText({ text: "" });
  }
}
