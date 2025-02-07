// Handle tab switching
document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons and content
    document
      .querySelectorAll(".nav-button")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));

    // Add active class to clicked button and corresponding content
    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");
  });
});

// Function to update dependent toggles
function updateDependentToggles(buttonsEnabled) {
  const dependentToggles = ["displayNameToggle", "zipToggle"];

  dependentToggles.forEach((toggleId) => {
    const toggle = document.querySelector(`[data-toggle="${toggleId}"]`);
    const toggleContainer = toggle.closest(".setting-item");

    if (buttonsEnabled) {
      toggleContainer.style.opacity = "1";
      toggleContainer.style.pointerEvents = "auto";
    } else {
      toggleContainer.style.opacity = "0.5";
      toggleContainer.style.pointerEvents = "none";
    }

    // Add transition for smooth animation
    toggleContainer.style.transition = "opacity 0.3s ease";
  });
}

// Initialize toggle states from storage
browser.storage.sync.get(
  {
    useDisplayName: true,
    useZip: true,
    showButtons: true,
    showATLinks: true,
    showMagnetButtons: true,
    changelogDismissed: false,
  },
  (items) => {
    document
      .querySelector('[data-toggle="displayNameToggle"]')
      .setAttribute("aria-checked", items.useDisplayName);
    document
      .querySelector('[data-toggle="zipToggle"]')
      .setAttribute("aria-checked", items.useZip);
    document
      .querySelector('[data-toggle="showButtonsToggle"]')
      .setAttribute("aria-checked", items.showButtons);
    document
      .querySelector('[data-toggle="showATLinksToggle"]')
      .setAttribute("aria-checked", items.showATLinks);
    document
      .querySelector('[data-toggle="showMagnetButtonsToggle"]')
      .setAttribute("aria-checked", items.showMagnetButtons);
    document
      .querySelector('[data-toggle="changelogToggle"]')
      .setAttribute("aria-checked", !items.changelogDismissed);

    // Initialize dependent toggles state
    updateDependentToggles(items.showButtons);
  }
);

// Add click handlers for toggle buttons
document.querySelectorAll(".toggle-button").forEach((button) => {
  button.addEventListener("click", () => {
    const isChecked = button.getAttribute("aria-checked") === "true";
    const newState = !isChecked;
    button.setAttribute("aria-checked", newState);

    // Save the new state
    let setting;
    switch (button.dataset.toggle) {
      case "displayNameToggle":
        setting = "useDisplayName";
        break;
      case "zipToggle":
        setting = "useZip";
        break;
      case "showButtonsToggle":
        setting = "showButtons";
        browser.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
              type: "settingChanged",
              setting: "showButtons",
              value: newState,
            });
          }
        );
        updateDependentToggles(newState);
        break;
      case "showATLinksToggle":
        setting = "showATLinks";
        browser.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
              type: "settingChanged",
              setting: "showATLinks",
              value: newState,
            });
          }
        );
        break;
      case "showMagnetButtonsToggle":
        setting = "showMagnetButtons";
        browser.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
              type: "settingChanged",
              setting: "showMagnetButtons",
              value: newState,
            });
          }
        );
        break;
      case "changelogToggle":
        setting = "changelogDismissed";
        browser.storage.sync.set({
          changelogDismissed: !newState,
          tempDismissed: !newState,
        });
        return;
    }
    browser.storage.sync.set({ [setting]: newState });
  });
});

// Get version from manifest.json and update the version number in popup
fetch(browser.runtime.getURL("manifest.json"))
  .then((response) => response.json())
  .then((manifest) => {
    document.querySelector(".version-number").textContent = manifest.version;
  });
