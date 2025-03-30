// Function to load user preferences from Firefox's storage
// This includes settings for filename format and ZIP packaging
function loadStoredPreferences() {
  return new Promise((resolve) => {
    // browser.storage.sync.get allows saving settings across different devices
    // if the user is signed into Firefox
    browser.storage.sync.get(
      {
        // Default values if no settings are found:
        // - useDisplayName: whether to use anime titles for filenames
        // - useZip: whether to combine downloads into a ZIP file
        // - showButtons: whether to show button controls
        // - showATLinks: whether to show Animetosho links
        // - showMagnetButtons: whether to show magnet copy buttons
        // - showQuickFilter: whether to show the Quick Filter button
        // - hideDeadTorrents: whether to hide dead torrents
        // - keywords: array of keywords for filtering
        // - keywordFilterEnabled: whether keyword filtering is enabled
        // - showFilterNotifications: whether to show filter notifications
        // - hideComments: whether to hide comments on view pages
        // - fileSizeFilterEnabled: whether to enable file size filtering
        // - fileSizeRange: the range for file size filtering
        useDisplayName: true,
        useZip: true,
        showButtons: true,
        showATLinks: true,
        showMagnetButtons: true,
        showQuickFilter: true,
        hideDeadTorrents: false,
        keywords: [],
        keywordFilterEnabled: false,
        showFilterNotifications: true,
        hideComments: false,
        fileSizeFilterEnabled: false,
        fileSizeRange: "less_than_1gb",
        showChangelogNav: true, // Add this line
      },
      (items) => {
        resolve(items);
      }
    );
  });
}

// Function to save individual preferences to Firefox's storage
// key: the setting name (useDisplayName or useZip)
// value: the boolean value of the setting (true/false)
function savePreference(key, value) {
  browser.storage.sync.set({
    [key]: value,
  });
}

// Main function that creates and adds all UI elements to the page
async function addCopyButton() {
  const prefs = await loadStoredPreferences();

  // If buttons are disabled, don't add the button container
  if (!prefs.showButtons) return;

  const container = document.querySelector(".table-responsive");
  if (!container) return;

  // Create a container for all our buttons and controls
  // This will be placed above the torrent table
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";
  buttonContainer.style.marginBottom = "10px";
  buttonContainer.style.display = "flex";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.fontFamily = "Segoe UI, Tahoma, sans-serif";
  buttonContainer.style.fontWeight = "500";

  // Create the "Copy Selected" button
  // Create the "Copy Selected" button
  // This copies magnet links of checked items
  const copyButton = document.createElement("button");
  copyButton.className = "copy-magnets-button";
  copyButton.textContent = "Copy Selected";
  copyButton.addEventListener("click", copySelectedMagnets);

  // Create the "Copy All" button
  // This copies all magnet links regardless of selection
  const copyAllButton = document.createElement("button");
  copyAllButton.className = "copy-magnets-button";
  copyAllButton.style.marginLeft = "10px";
  copyAllButton.textContent = "Copy All";
  copyAllButton.addEventListener("click", copyAllMagnets);

  // Create the "Download Selected" button
  // This downloads .torrent files for checked items
  const downloadButton = document.createElement("button");
  downloadButton.className = "copy-magnets-button download-button";
  downloadButton.style.marginLeft = "10px";
  downloadButton.textContent = "Download Selected";
  downloadButton.addEventListener("click", downloadSelectedTorrents);

  // Create the "Download All" button
  // This downloads all .torrent files on the page
  const downloadAllButton = document.createElement("button");
  downloadAllButton.className = "copy-magnets-button download-button";
  downloadAllButton.textContent = "Download All";
  downloadAllButton.addEventListener("click", downloadAllTorrents);

  // Add before the "Clear Selection" button
  const invertButton = document.createElement("button");
  invertButton.className = "copy-magnets-button";
  invertButton.style.marginLeft = "10px";
  invertButton.innerHTML = '<i class="fa fa-exchange"></i> Invert Selection';
  invertButton.addEventListener("click", invertSelection);

  // Create the "Clear Selection" button
  // This unchecks all checkboxes
  const clearButton = document.createElement("button");
  clearButton.className = "copy-magnets-button clear-button";
  clearButton.style.marginLeft = "10px";
  clearButton.textContent = "Clear Selection";
  clearButton.addEventListener("click", clearSelection);

  // Create a counter to show how many items are selected
  const selectionCounter = document.createElement("span");
  selectionCounter.className = "magnet-selection-counter";
  selectionCounter.style.marginLeft = "15px";
  selectionCounter.textContent = "0 selected";

  // Add a listener to update the counter whenever checkboxes change
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("magnet-checkbox")) {
      const checkedBoxes = document.querySelectorAll(
        ".magnet-checkbox:checked"
      ).length;
      selectionCounter.textContent = `${checkedBoxes} selected`;
    }
  });

  // Create Quick Filter button
  const quickFilterButton = document.createElement("button");
  quickFilterButton.className = "copy-magnets-button quick-filter-button";
  quickFilterButton.style.display = prefs.showQuickFilter ? "block" : "none";
  quickFilterButton.innerHTML = '<i class="fa fa-bolt"></i> Quick Search';
  quickFilterButton.addEventListener("click", showQuickFilterPopup);

  // Create Keyword Select button
  const keywordSelectButton = document.createElement("button");
  keywordSelectButton.className = "copy-magnets-button keyword-select-button";
  keywordSelectButton.style.marginRight = "10px";
  keywordSelectButton.innerHTML =
    '<i class="fa fa-check-square"></i> Keyword Select';
  keywordSelectButton.addEventListener("click", showKeywordSelectPopup);

  buttonContainer.appendChild(copyButton);
  buttonContainer.appendChild(copyAllButton);
  buttonContainer.appendChild(downloadButton);
  buttonContainer.appendChild(downloadAllButton);
  buttonContainer.appendChild(invertButton);
  buttonContainer.appendChild(keywordSelectButton);
  buttonContainer.appendChild(clearButton);
  buttonContainer.appendChild(selectionCounter);
  buttonContainer.appendChild(quickFilterButton);
  container.parentNode.insertBefore(buttonContainer, container);
}

// Function to add a checkbox column to the torrent table
// This allows users to select individual torrents for batch operations
async function addCheckboxColumn() {
  const prefs = await loadStoredPreferences();

  // Add new column headers to the table
  const headerRow = document.querySelector("table.torrent-list thead tr");
  if (!headerRow) return;

  // Add AT column header if enabled and doesn't exist
  if (
    prefs.showATLinks &&
    !headerRow.querySelector('th.text-center[title="AT"]')
  ) {
    const atHeader = document.createElement("th");
    atHeader.className = "text-center";
    atHeader.style.width = "70px";
    atHeader.textContent = "AT";
    atHeader.title = "AT"; // Add title for identification
    const checkboxHeader = headerRow.querySelector(".magnet-checkbox-column");
    headerRow.insertBefore(atHeader, checkboxHeader);
  }

  // Add Magnet column header if enabled and doesn't exist
  if (
    prefs.showMagnetButtons &&
    !headerRow.querySelector('th.text-center[title="Magnet"]')
  ) {
    const magnetHeader = document.createElement("th");
    magnetHeader.className = "text-center";
    magnetHeader.style.width = "70px";
    magnetHeader.textContent = "Magnet";
    magnetHeader.title = "Magnet"; // Add title for identification
    const checkboxHeader = headerRow.querySelector(".magnet-checkbox-column");
    const atHeader = Array.from(
      headerRow.querySelectorAll("th.text-center")
    ).find((header) => header.textContent === "AT");

    if (atHeader) {
      headerRow.insertBefore(magnetHeader, atHeader.nextSibling);
    } else if (checkboxHeader) {
      headerRow.insertBefore(magnetHeader, checkboxHeader);
    } else {
      headerRow.appendChild(magnetHeader);
    }
  }

  // Add checkbox column header only if buttons are enabled and doesn't exist
  if (
    prefs.showButtons &&
    !headerRow.querySelector(".magnet-checkbox-column")
  ) {
    const checkboxHeader = document.createElement("th");
    checkboxHeader.className = "magnet-checkbox-column text-center";
    headerRow.appendChild(checkboxHeader);
  }

  // Keep track of last checked checkbox
  let lastChecked = null;

  // Add cells only if they don't exist
  const rows = document.querySelectorAll("table.torrent-list tbody tr");
  rows.forEach((row) => {
    // Add AT cell if enabled and doesn't exist
    if (prefs.showATLinks && !row.querySelector(".at-column")) {
      const atCell = document.createElement("td");
      atCell.className = "text-center at-column";

      const categoryLink = row.querySelector("td:first-child a");
      const isAnimeEnglish =
        categoryLink?.getAttribute("title") === "Anime - English-translated";

      if (isAnimeEnglish) {
        const titleLink = row.querySelector('td a[href^="/view/"]');
        if (titleLink) {
          const nyaaId = titleLink.href.split("/").pop();
          const atLink = document.createElement("a");
          atLink.href = `https://animetosho.org/view/n${nyaaId}`;
          atLink.target = "_blank";
          atLink.innerHTML = '<i class="fa fa-external-link"></i>';
          atLink.style.color = "#337ab7";
          atCell.appendChild(atLink);
        }
      }

      const checkboxCell = row.querySelector(".magnet-checkbox")?.closest("td");
      row.insertBefore(atCell, checkboxCell);
    }

    // Add magnet cell if enabled and doesn't exist
    if (prefs.showMagnetButtons && !row.querySelector(".magnet-column")) {
      const magnetCell = document.createElement("td");
      magnetCell.className = "text-center magnet-column";

      const linkCell = row.querySelector('td:has(a[href^="magnet:"])');
      if (linkCell) {
        const magnetLink = linkCell.querySelector('a[href^="magnet:"]');
        if (magnetLink) {
          const magnetButton = document.createElement("button");
          magnetButton.className = "magnet-button";
          magnetButton.innerHTML = '<i class="fa fa-magnet"></i> Copy';
          magnetButton.style.fontFamily = "Segoe UI, Tahoma, sans-serif";
          magnetButton.style.fontWeight = "500";
          magnetButton.addEventListener("click", () => {
            navigator.clipboard
              .writeText(magnetLink.href)
              .then(() => {
                showNotification("Magnet link copied to clipboard!", true);
              })
              .catch((err) => {
                console.error("Failed to copy magnet:", err);
                showNotification("Failed to copy magnet link", false);
              });
          });
          magnetCell.appendChild(magnetButton);
        }
      }

      const checkboxCell = row.querySelector(".magnet-checkbox")?.closest("td");
      const atCell = row.querySelector(".at-column");

      if (atCell) {
        row.insertBefore(magnetCell, atCell.nextSibling);
      } else if (checkboxCell) {
        row.insertBefore(magnetCell, checkboxCell);
      } else {
        row.appendChild(magnetCell);
      }
    }

    // Add checkbox cell only if buttons are enabled and doesn't exist
    if (prefs.showButtons && !row.querySelector(".magnet-checkbox")) {
      const checkboxCell = document.createElement("td");
      checkboxCell.className = "text-center";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "magnet-checkbox";

      checkbox.addEventListener("click", function (e) {
        if (!lastChecked) {
          lastChecked = this;
          return;
        }

        if (e.shiftKey) {
          const checkboxes = Array.from(
            document.querySelectorAll(".magnet-checkbox")
          );
          const start = checkboxes.indexOf(this);
          const end = checkboxes.indexOf(lastChecked);

          checkboxes
            .slice(Math.min(start, end), Math.max(start, end) + 1)
            .forEach((checkbox) => (checkbox.checked = this.checked));
        }

        lastChecked = this;
      });

      checkboxCell.appendChild(checkbox);
      row.appendChild(checkboxCell);
    }
  });
}

// Function to show temporary notifications to the user
// These notifications provide feedback about actions (success/failure)
// message: The text to show in the notification
// isSuccess: Controls the color (green for success, red for failure)
function showNotification(message, isSuccess = true) {
  // Create or find the container for notifications
  // This container is fixed to the bottom-right corner of the screen
  let container = document.querySelector(".magnet-notification-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "magnet-notification-container";
    document.body.appendChild(container);
  }

  // Create the notification element
  const notification = document.createElement("div");
  notification.className = "magnet-notification";
  notification.textContent = message;
  // Set color based on success/failure
  notification.style.backgroundColor = isSuccess ? "#4CAF50" : "#f44336";

  container.appendChild(notification);

  // Force firefox to process the element before animation
  notification.offsetHeight;

  // Show the notification with a slide-in animation
  notification.classList.add("show");

  // Remove the notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    // Wait for fade-out animation before removing
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Function to copy magnet links from selected torrents
// This only copies links for torrents that have their checkbox checked
function copySelectedMagnets() {
  const selectedMagnets = [];
  const rows = document.querySelectorAll("table.torrent-list tbody tr");

  // Loop through all rows and collect magnet links from checked rows
  rows.forEach((row) => {
    const checkbox = row.querySelector(".magnet-checkbox");
    if (checkbox && checkbox.checked) {
      const magnetLink = row.querySelector('a[href^="magnet:"]');
      if (magnetLink) {
        selectedMagnets.push(magnetLink.href);
      }
    }
  });

  // If we found any magnet links, copy them to clipboard
  if (selectedMagnets.length > 0) {
    const magnetText = selectedMagnets.join("\n"); // One link per line
    navigator.clipboard
      .writeText(magnetText)
      .then(() => {
        showNotification(
          `${selectedMagnets.length} Magnet links copied to clipboard!`,
          true
        );
      })
      .catch((err) => {
        console.error("Failed to copy magnets:", err);
        showNotification("Failed to copy magnet links", false);
      });
  } else {
    showNotification("No magnet links selected!", false);
  }
}

// Function to copy ALL magnet links from the page
// This ignores the checkbox selection state
function copyAllMagnets() {
  const allMagnets = [];
  const rows = document.querySelectorAll("table.torrent-list tbody tr");

  // Loop through all visible rows and collect magnet links
  rows.forEach((row) => {
    // Skip hidden rows (dead torrents)
    if (row.style.display === "none") return;

    const magnetLink = row.querySelector('a[href^="magnet:"]');
    if (magnetLink) {
      allMagnets.push(magnetLink.href);
    }
  });

  // If we found any magnet links, copy them to clipboard
  if (allMagnets.length > 0) {
    const magnetText = allMagnets.join("\n"); // One link per line
    navigator.clipboard
      .writeText(magnetText)
      .then(() => {
        showNotification(
          `Copied ${allMagnets.length} magnet links to clipboard!`,
          true
        );
      })
      .catch((err) => {
        console.error("Failed to copy magnets:", err);
        showNotification("Failed to copy magnet links", false);
      });
  } else {
    showNotification("No magnet links found!", false);
  }
}

// Function to update the selection counter display
// Shows how many torrents are currently selected
function updateSelectionCounter(selectionCounter) {
  const checkedBoxes = document.querySelectorAll(
    ".magnet-checkbox:checked"
  ).length;
  selectionCounter.textContent = `${checkedBoxes} selected`;
}

// Function to clear all selected checkboxes
// Shows a notification if there's nothing to clear
function clearSelection() {
  const checkboxes = document.querySelectorAll(".magnet-checkbox:checked");
  if (checkboxes.length === 0) {
    showNotification("No checkboxes are selected to clear!", false);
    return;
  }

  const selectionCounter = document.querySelector(".magnet-selection-counter");
  if (!selectionCounter) return;

  // Uncheck all selected checkboxes
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Reset the selection counter
  selectionCounter.textContent = "0 selected";
  showNotification("Selection cleared", true);
}

// Function to get the correct title from a row
function getTitleFromRow(row) {
  const titleCell = row.querySelector('td[colspan="2"]');
  if (!titleCell) return null;

  // Get the view link (this will always be the title link, not comments)
  // We specifically look for the last link in the cell to avoid the comment link
  const links = titleCell.querySelectorAll('a[href^="/view/"]');

  const titleLink = links[links.length - 1]; // Get the last view link (the actual title)

  return titleLink?.title || titleLink?.textContent || null;
}

// Function to download selected torrent files
// Downloads are combined into a ZIP if the ZIP option is enabled
async function downloadSelectedTorrents() {
  const selectedTorrents = [];
  const rows = document.querySelectorAll("table.torrent-list tbody tr");

  // Collect information about selected torrents
  rows.forEach((row) => {
    const checkbox = row.querySelector(".magnet-checkbox");
    if (checkbox && checkbox.checked) {
      const torrentLink = row.querySelector('a[href$=".torrent"]');
      const title = getTitleFromRow(row);
      if (torrentLink && title) {
        selectedTorrents.push({
          url: torrentLink.href,
          filename: title,
        });
      }
    }
  });

  // Start download process if we found any torrents
  if (selectedTorrents.length > 0) {
    await downloadTorrents(selectedTorrents, "selected_torrents.zip");
  } else {
    showNotification("No torrents selected!", false);
  }
}

// Function to download all torrent files on the page
// Downloads are combined into a ZIP if the ZIP option is enabled
async function downloadAllTorrents() {
  const allTorrents = [];
  const rows = document.querySelectorAll("table.torrent-list tbody tr");

  // Collect information about all visible torrents
  rows.forEach((row) => {
    // Skip hidden rows (dead torrents)
    if (row.style.display === "none") return;

    const torrentLink = row.querySelector('a[href$=".torrent"]');
    const title = getTitleFromRow(row);
    if (torrentLink && title) {
      allTorrents.push({
        url: torrentLink.href,
        filename: title,
      });
    }
  });

  // Start download process if we found any torrents
  if (allTorrents.length > 0) {
    await downloadTorrents(allTorrents, "all_torrents.zip");
  } else {
    showNotification("No torrents found!", false);
  }
}

// Function to create and show a progress notification
// Returns the notification element for updating progress
function createProgressNotification() {
  // Find or create the container for notifications
  let container = document.querySelector(".magnet-notification-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "magnet-notification-container";
    document.body.appendChild(container);
  }

  // Create the notification element
  const notification = document.createElement("div");
  notification.className = "magnet-notification show";
  notification.style.backgroundColor = "#4CAF50";
  container.appendChild(notification);

  return notification;
}

function sanitizeFilename(filename) {
  // Replace any of the invalid characters with an underscore
  return filename.replace(/[<>:"/\\|?*]/g, "_");
}

// Function to download torrents and package them into a ZIP file
// torrents: Array of torrent objects with url and filename
// zipName: Name of the output ZIP file
async function downloadTorrentsAsZip(torrents, zipName) {
  try {
    // Initialize ZIP creation and progress tracking
    const zip = new JSZip();
    let completedDownloads = 0;
    const progressNotification = createProgressNotification();
    const prefs = await loadStoredPreferences();

    // Update initial progress
    progressNotification.textContent = `Progress: 0/${torrents.length} files`;

    // Helper function to convert Blob to Base64
    const blobToBase64 = (blob) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    for (const torrent of torrents) {
      try {
        // Add delay between requests (500ms)
        if (completedDownloads > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Download the torrent file with explicit response type
        const response = await fetch(torrent.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the blob with explicit type
        const blob = await response.blob();
        const base64Data = await blobToBase64(blob);

        // Use appropriate filename based on stored preference and sanitize it
        const filename = prefs.useDisplayName
          ? sanitizeFilename(torrent.filename) + ".torrent"
          : torrent.url.split("/").pop();

        // Add file to ZIP using base64
        zip.file(filename, base64Data.split(",")[1], { base64: true });

        // Update progress notification
        completedDownloads++;
        progressNotification.textContent = `Progress: ${completedDownloads}/${torrents.length} files`;
      } catch (error) {
        console.error(`Failed to fetch torrent: ${torrent.filename}`, error);
      }
    }

    // Generate and download the ZIP file
    progressNotification.textContent = "Generating ZIP file...";

    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 5 },
    });

    // Trigger ZIP download
    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = zipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(zipUrl);

    // Show completion notification
    progressNotification.textContent = "ZIP file download complete!";
    setTimeout(() => {
      progressNotification.classList.remove("show");
      setTimeout(() => progressNotification.remove(), 300);
    }, 3000);
  } catch (error) {
    console.error("Download failed:", error);
    showNotification("Failed to create ZIP file: " + error.message, false);
  }
}

// Function to download individual torrent files one at a time
// This is used when ZIP option is disabled or only one file is selected
// torrents: Array of torrent objects with url and filename
async function downloadIndividualTorrents(torrents) {
  const prefs = await loadStoredPreferences();
  const progressNotification = createProgressNotification();
  let completedDownloads = 0;

  // Show progress notification
  progressNotification.textContent = `Progress: 0/${torrents.length} files`;

  // Download files sequentially to avoid overwhelming the browser
  for (const torrent of torrents) {
    try {
      // Fetch the torrent file
      const response = await fetch(torrent.url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();

      const filename = prefs.useDisplayName
        ? torrent.filename + ".torrent"
        : torrent.url.split("/").pop();

      // Create temporary link element to trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object to prevent memory leaks
      URL.revokeObjectURL(link.href);

      // Update progress notification
      completedDownloads++;
      progressNotification.textContent = `Progress: ${completedDownloads}/${torrents.length} files`;
    } catch (error) {
      console.error(`Failed to download torrent: ${torrent.filename}`, error);
    }
  }

  // Show completion message and remove notification after delay
  progressNotification.textContent = "Download complete!";
  setTimeout(() => {
    progressNotification.classList.remove("show");
    setTimeout(() => progressNotification.remove(), 300);
  }, 3000);
}

// Main download function that handles both individual and ZIP downloads
// torrents: Array of torrent objects to download
// zipName: Name to use for ZIP file if ZIP option is enabled
async function downloadTorrents(torrents, zipName) {
  // Check user's ZIP preference
  const prefs = await loadStoredPreferences();

  // Use individual downloads if only one file or ZIP is disabled
  // Otherwise use ZIP download
  if (torrents.length === 1 || !prefs.useZip) {
    await downloadIndividualTorrents(torrents);
  } else {
    await downloadTorrentsAsZip(torrents, zipName);
  }
}

// Function to show changelog notification
async function showChangelog() {
  // Get current version from manifest
  const manifest = browser.runtime.getManifest();
  const currentVersion = manifest.version;

  // Get stored version and dismissed states
  const { lastVersion, changelogDismissed, tempDismissed } =
    await browser.storage.sync.get([
      "lastVersion",
      "changelogDismissed",
      "tempDismissed",
    ]);

  // Reset tempDismissed if version is different
  if (currentVersion !== lastVersion) {
    await browser.storage.sync.set({ tempDismissed: false });
  }

  // Show if:
  // 1. Version is different and not permanently dismissed OR
  // 2. Same version but not temporarily or permanently dismissed
  if (
    (currentVersion !== lastVersion && !changelogDismissed) ||
    (currentVersion === lastVersion && !tempDismissed && !changelogDismissed)
  ) {
    const container = document.createElement("div");
    container.className = "changelog-container";
    container.innerHTML = `
      <div class="changelog-header">
        <span class="changelog-title">What's New</span>
        <span class="changelog-version">v${currentVersion}</span>
      </div>
      <div class="changelog-content">
        • Fixed bug where forward slash (/) in filenames would create unwanted subfolders in ZIP downloads<br>
        • Fixed potential download issues if some torrent names would have Windows-incompatible characters (like :, *, ?, ", etc.)
      </div>
      <div class="changelog-actions">
        <button class="changelog-button okay">Okay</button>
        <button class="changelog-button dont-show">Don't show again</button>
      </div>
      <div class="changelog-footer">
        <a href="/changelog" style="color: #337ab7; text-decoration: underline; font-size: 14px;">View changelog page</a>
      </div>
    `;

    document.body.appendChild(container);

    // Handle "Don't show again" button - permanent dismissal
    container
      .querySelector(".changelog-button.dont-show")
      .addEventListener("click", async () => {
        await browser.storage.sync.set({
          lastVersion: currentVersion,
          changelogDismissed: true,
        });
        container.classList.add("hiding");
        setTimeout(() => container.remove(), 300);
      });

    // Handle "Okay" button - temporary dismissal until next version
    container
      .querySelector(".changelog-button.okay")
      .addEventListener("click", async () => {
        await browser.storage.sync.set({
          lastVersion: currentVersion,
          tempDismissed: true,
        });
        container.classList.add("hiding");
        setTimeout(() => container.remove(), 300);
      });

    // Store new version
    await browser.storage.sync.set({ lastVersion: currentVersion });
  }
}

// Add message listener for real-time updates
browser.runtime.onMessage.addListener((message) => {
  if (message.type === "settingChanged") {
    handleSettingChange(message.setting, message.value);
  }
});

async function handleSettingChange(setting, value) {
  switch (setting) {
    case "showButtons":
      if (value) {
        initializeExtension(false);
      } else {
        // Remove button container if it exists
        document.querySelector(".button-container")?.remove();

        // Remove checkbox header and cells
        const checkboxHeader = document.querySelector(
          ".magnet-checkbox-column"
        );
        if (checkboxHeader) {
          checkboxHeader.remove();
        }

        // Remove all checkbox cells
        document.querySelectorAll(".magnet-checkbox").forEach((checkbox) => {
          const cell = checkbox.closest("td");
          if (cell) {
            cell.remove();
          }
        });
      }
      break;
    case "showMagnetButtons":
      if (!value) {
        // Remove magnet header and cells immediately if disabled
        const magnetHeaders = document.querySelectorAll("th.text-center");
        magnetHeaders.forEach((header) => {
          if (header.textContent === "Magnet") {
            header.remove();
          }
        });

        // Remove all magnet cells
        document.querySelectorAll(".magnet-column").forEach((cell) => {
          cell.remove();
        });

        // Remove magnet button from view page if it exists
        if (window.location.pathname.startsWith("/view/")) {
          const magnetButton = document.querySelector(".magnet-button");
          if (magnetButton) {
            magnetButton.remove();
          }
        }
      } else {
        // Add only the magnet column
        const headerRow = document.querySelector("table.torrent-list thead tr");
        if (headerRow) {
          const magnetHeader = document.createElement("th");
          magnetHeader.className = "text-center";
          magnetHeader.style.width = "70px";
          magnetHeader.textContent = "Magnet";

          // Find the correct position to insert the magnet header
          const checkboxHeader = headerRow.querySelector(
            ".magnet-checkbox-column"
          );
          const atHeader = Array.from(
            headerRow.querySelectorAll("th.text-center")
          ).find((header) => header.textContent === "AT");

          if (atHeader) {
            // If AT column exists, insert after it
            headerRow.insertBefore(magnetHeader, atHeader.nextSibling);
          } else if (checkboxHeader) {
            // If no AT column, insert before checkbox
            headerRow.insertBefore(magnetHeader, checkboxHeader);
          } else {
            // If neither exists, append to end
            headerRow.appendChild(magnetHeader);
          }
        }

        // Add magnet cells
        const rows = document.querySelectorAll("table.torrent-list tbody tr");
        rows.forEach((row) => {
          const magnetCell = document.createElement("td");
          magnetCell.className = "text-center magnet-column";

          const linkCell = row.querySelector('td:has(a[href^="magnet:"])');
          if (linkCell) {
            const magnetLink = linkCell.querySelector('a[href^="magnet:"]');
            if (magnetLink) {
              const magnetButton = document.createElement("button");
              magnetButton.className = "magnet-button";
              magnetButton.innerHTML = '<i class="fa fa-magnet"></i> Copy';
              magnetButton.style.fontFamily = "Segoe UI, Tahoma, sans-serif";
              magnetButton.style.fontWeight = "500";
              magnetButton.addEventListener("click", () => {
                navigator.clipboard
                  .writeText(magnetLink.href)
                  .then(() => {
                    showNotification("Magnet link copied to clipboard!", true);
                  })
                  .catch((err) => {
                    console.error("Failed to copy magnet:", err);
                    showNotification("Failed to copy magnet link", false);
                  });
              });
              magnetCell.appendChild(magnetButton);
            }
          }

          // Find the correct position to insert the magnet cell
          const checkboxCell = row
            .querySelector(".magnet-checkbox")
            ?.closest("td");
          const atCell = row.querySelector(".at-column");

          if (atCell) {
            // If AT cell exists, insert after it
            row.insertBefore(magnetCell, atCell.nextSibling);
          } else if (checkboxCell) {
            // If no AT cell, insert before checkbox
            row.insertBefore(magnetCell, checkboxCell);
          } else {
            // If neither exists, append to end
            row.appendChild(magnetCell);
          }
        });

        // Add magnet button to view page if we're on one
        if (window.location.pathname.startsWith("/view/")) {
          addMagnetButtonToViewPage();
        }
      }
      break;
    case "showATLinks":
      if (!value) {
        // Remove AT header and cells immediately if disabled
        const atHeaders = document.querySelectorAll("th.text-center");
        atHeaders.forEach((header) => {
          if (header.textContent === "AT") {
            header.remove();
          }
        });

        // Remove all AT cells
        document.querySelectorAll(".at-column").forEach((cell) => {
          cell.remove();
        });

        // Remove Animetosho row from view page if it exists
        const animeRow = Array.from(document.querySelectorAll(".row")).find(
          (row) => row.textContent.includes("Animetosho:")
        );
        if (animeRow) {
          const infoHashKbd = animeRow.querySelector("kbd");
          if (infoHashKbd) {
            // Create new row with just the info hash
            const newRow = document.createElement("div");
            newRow.className = "row";
            newRow.innerHTML = `
              <div class="col-md-offset-6 col-md-1">Info hash:</div>
              <div class="col-md-5"><kbd>${infoHashKbd.textContent}</kbd></div>
            `;
            animeRow.replaceWith(newRow);
          }
        }
      } else {
        // Add AT column to table
        const headerRow = document.querySelector("table.torrent-list thead tr");
        if (headerRow) {
          const atHeader = document.createElement("th");
          atHeader.className = "text-center";
          atHeader.style.width = "70px";
          atHeader.textContent = "AT";

          // Always insert AT before Magnet and Checkbox
          const magnetHeader = Array.from(
            headerRow.querySelectorAll("th.text-center")
          ).find((header) => header.textContent === "Magnet");
          const checkboxHeader = headerRow.querySelector(
            ".magnet-checkbox-column"
          );

          if (magnetHeader) {
            headerRow.insertBefore(atHeader, magnetHeader);
          } else if (checkboxHeader) {
            headerRow.insertBefore(atHeader, checkboxHeader);
          } else {
            headerRow.appendChild(atHeader);
          }
        }

        // Add AT cells
        const rows = document.querySelectorAll("table.torrent-list tbody tr");
        rows.forEach((row) => {
          const atCell = document.createElement("td");
          atCell.className = "text-center at-column";

          const categoryLink = row.querySelector("td:first-child a");
          const isAnimeEnglish =
            categoryLink?.getAttribute("title") ===
            "Anime - English-translated";

          if (isAnimeEnglish) {
            const titleLink = row.querySelector('td a[href^="/view/"]');
            if (titleLink) {
              const nyaaId = titleLink.href.split("/").pop();
              const atLink = document.createElement("a");
              atLink.href = `https://animetosho.org/view/n${nyaaId}`;
              atLink.target = "_blank";
              atLink.innerHTML = '<i class="fa fa-external-link"></i>';
              atLink.style.color = "#337ab7";
              atCell.appendChild(atLink);
            }
          }

          // Always insert AT cell before Magnet and Checkbox
          const magnetCell = row.querySelector(".magnet-column");
          const checkboxCell = row
            .querySelector(".magnet-checkbox")
            ?.closest("td");

          if (magnetCell) {
            row.insertBefore(atCell, magnetCell);
          } else if (checkboxCell) {
            row.insertBefore(atCell, checkboxCell);
          } else {
            row.appendChild(atCell);
          }
        });

        // Add Animetosho link to view page
        addAnimetoshoToViewPage();
      }
      break;
    case "showQuickFilter":
      const quickFilterButton = document.querySelector(".quick-filter-button");
      if (quickFilterButton) {
        if (!value) {
          quickFilterButton.classList.add("hiding");
          setTimeout(() => {
            quickFilterButton.style.display = "none";
          }, 300);
        } else {
          quickFilterButton.style.display = "block";
          // Force firefox to process the display change
          quickFilterButton.offsetHeight;
          quickFilterButton.classList.remove("hiding");
        }
      }

      // Close Quick Filter popup if it's open and setting is turned off
      if (!value) {
        const popup = document.querySelector(".quick-filter-popup");
        const overlay = document.querySelector(".quick-filter-overlay");
        if (popup && overlay) {
          popup.classList.add("hiding");
          overlay.classList.add("hiding");
          setTimeout(() => {
            popup.remove();
            overlay.remove();
          }, 300);
        }
      }
      break;
    case "hideDeadTorrents":
      // Don't reset display state when disabling dead torrents filter
      const prefs = await loadStoredPreferences();
      const rows = document.querySelectorAll("table.torrent-list tbody tr");

      // Apply all active filters in one pass to prevent flicker
      rows.forEach((row) => {
        const title = getTitleFromRow(row);
        const sizeCell = row.querySelector("td:nth-of-type(4)");
        const seedersCell = row.querySelector("td:nth-of-type(6)");
        const leechersCell = row.querySelector("td:nth-of-type(7)");

        const seeders = seedersCell ? parseInt(seedersCell.textContent) : 0;
        const leechers = leechersCell ? parseInt(leechersCell.textContent) : 0;
        const sizeInBytes = sizeCell ? convertToBytes(sizeCell.textContent) : 0;

        // Check all active filters at once
        const isDead = value && seeders === 0 && leechers === 0;
        const wrongSize =
          prefs.fileSizeFilterEnabled &&
          !isInSizeRange(sizeInBytes, prefs.fileSizeRange);
        const containsKeyword =
          prefs.keywordFilterEnabled &&
          prefs.keywords.some((keyword) =>
            title?.toLowerCase().includes(keyword.toLowerCase())
          );

        // Only update display if needed
        const shouldHide = isDead || wrongSize || containsKeyword;
        if (shouldHide) {
          row.style.display = "none";
        } else {
          row.style.display = "";
        }
      });

      // Show notification only if dead torrents filter was disabled
      if (!value && prefs.showFilterNotifications) {
        showNotification("Dead torrents filter disabled", true);
      }
      break;
    case "keywordFilterEnabled":
      filterByKeywords(true); // Pass true to force notification
      break;
    case "showFilterNotifications":
      // Implementation for showFilterNotifications setting
      break;
    case "hideComments":
      if (window.location.pathname.startsWith("/view/")) {
        const comments = document.getElementById("comments");
        if (comments) {
          comments.style.display = value ? "none" : "block";
        }
      }
      break;
    case "fileSizeFilterEnabled":
      filterByFileSize();
      break;
    case "fileSizeRange":
      filterByFileSize();
      break;
    case "showChangelogNav":
      if (!value) {
        // Find and remove the changelog nav item
        const navList = document.querySelector(".nav.navbar-nav");
        const changelogItem = Array.from(
          navList?.querySelectorAll("li") || []
        ).find((li) => li.textContent.trim() === "Changelog");
        if (changelogItem) {
          changelogItem.remove();
        }
      } else {
        // Add the changelog nav item
        addChangelogNavItem();
      }
      break;
  }
}

// Function to add Animetosho link to torrent view pages
async function addAnimetoshoToViewPage() {
  // Check if we're on a view page and AT links are enabled
  if (!window.location.pathname.startsWith("/view/")) return;

  const prefs = await loadStoredPreferences();
  if (!prefs.showATLinks) return;

  // Check if it's an English-translated anime
  const categoryLinks = document.querySelectorAll(".row .col-md-5 a");
  const isAnime = Array.from(categoryLinks).some(
    (link) => link.textContent === "Anime"
  );
  const isEnglish = Array.from(categoryLinks).some(
    (link) => link.textContent === "English-translated"
  );

  if (!isAnime || !isEnglish) return;

  // Get the torrent ID from the URL
  const torrentId = window.location.pathname.split("/").pop();

  // Find the info hash row
  const infoHashRow = Array.from(document.querySelectorAll(".row")).find(
    (row) => row.textContent.includes("Info hash:")
  );

  if (!infoHashRow) return;

  // Get the info hash content, removing the offset class
  const infoHashContent = infoHashRow.innerHTML.replace(
    "col-md-offset-6 col-md-1",
    "col-md-1"
  );

  // Create the new row structure
  const newRow = document.createElement("div");
  newRow.className = "row";
  newRow.innerHTML = `
    <div class="col-md-1">Animetosho:</div>
    <div class="col-md-5">
      <a rel="noopener noreferrer nofollow" href="https://animetosho.org/view/n${torrentId}">
        https://animetosho.org/view/n${torrentId}
      </a>
    </div>
    ${infoHashContent}
  `;

  // Replace the old row with the new one
  infoHashRow.replaceWith(newRow);
}

// Function to invert the current selection state of all checkboxes
function invertSelection() {
  const checkboxes = document.querySelectorAll(".magnet-checkbox");
  let invertedCount = 0;

  checkboxes.forEach((checkbox) => {
    // Only invert selection for visible rows
    const row = checkbox.closest("tr");
    if (row && row.style.display !== "none") {
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) invertedCount++;
    }
  });

  // Update the selection counter
  const selectionCounter = document.querySelector(".magnet-selection-counter");
  if (selectionCounter) {
    const checkedBoxes = document.querySelectorAll(
      ".magnet-checkbox:checked"
    ).length;
    selectionCounter.textContent = `${checkedBoxes} selected`;
  }

  showNotification(
    `Selection inverted (${invertedCount} items selected)`,
    true
  );
}

// Function to show Quick Filter popup
function showQuickFilterPopup() {
  const popup = document.createElement("div");
  popup.className = "quick-filter-popup";
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    min-width: 320px;
    max-width: 400px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  const content = `
    <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Quick Search</h3>
    
    <div class="filter-group" style="margin-bottom: 18px;">
      <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Anime Name:</label>
      <input type="text" id="anime-name" class="filter-input" style="
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s, box-shadow 0.2s;
      ">
    </div>

    <div class="filter-group" style="margin-bottom: 18px;">
      <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Encoder:</label>
      <input type="text" id="encoder-name" class="filter-input" style="
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s, box-shadow 0.2s;
      ">
    </div>

    <div class="filter-group" style="margin-bottom: 18px;">
      <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Quality:</label>
      <select id="quality" class="filter-select" style="
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        background-color: white;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
      ">
        <option value="">Select Quality</option>
        <option value="480p">480p</option>
        <option value="720p">720p</option>
        <option value="1080p">1080p</option>
        <option value="2160p">2160p (4K)</option>
      </select>
    </div>

    <div class="filter-group" style="margin-bottom: 18px;">
      <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Format:</label>
      <select id="format" class="filter-select" style="
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        background-color: white;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
      ">
        <option value="">Select Format</option>
        <option value="264">H264/AVC</option>
        <option value="x265">x265/HEVC</option>
        <option value="AV1">AV1</option>
        <option value="VP9">VP9</option>
      </select>
    </div>

    <div class="filter-group" style="margin-bottom: 18px;">
      <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Source:</label>
      <select id="source" class="filter-select" style="
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        background-color: white;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
      ">
        <option value="">Select Source</option>
        <option value="BD">BD (Blu-ray)</option>
        <option value="Web">Web (Streaming Service)</option>
        <option value="DVD">DVD</option>
      </select>
    </div>

    <div class="filter-group" style="margin-bottom: 18px;">
      <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Category:</label>
      <select id="category" class="filter-select" style="
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        background-color: white;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
      ">
        <option value="0">All categories</option>
        <option value="1">Anime Music Video</option>
        <option value="2">English-translated</option>
        <option value="3">Non-English-translated</option>
        <option value="4">Raw</option>
      </select>
    </div>

    <div class="filter-group" style="margin-bottom: 25px;">
      <div style="display: flex; gap: 20px;">
        <label style="display: flex; align-items: center; font-size: 14px; cursor: pointer;">
          <input type="checkbox" id="dual-audio" style="
            margin: 0;
            margin-right: 8px;
            cursor: pointer;
          ">
          <span style="font-weight: 500;">Dual Audio</span>
        </label>
        <label style="display: flex; align-items: center; font-size: 14px; cursor: pointer;">
          <input type="checkbox" id="season-pack" style="
            margin: 0;
            margin-right: 8px;
            cursor: pointer;
          ">
          <span style="font-weight: 500;">Season Pack</span>
        </label>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button id="reset-filter" class="copy-magnets-button clear-button" style="
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      ">Reset</button>
      <button id="cancel-filter" class="copy-magnets-button" style="
        padding: 8px 16px;
        border: none;
        background: #337ab7;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      ">Cancel</button>
      <button id="apply-filter" class="copy-magnets-button" style="
        padding: 8px 16px;
        border: none;
        background: #337ab7;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      ">Search</button>
    </div>
  `;

  popup.innerHTML = content;

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "quick-filter-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(popup);
  document.body.style.overflow = "hidden";

  // Add hover effects for inputs and buttons
  const style = document.createElement("style");
  style.textContent = `
    .quick-filter-popup {
      animation: popupFadeIn 0.3s ease;
    }

    .quick-filter-overlay {
      animation: overlayFadeIn 0.3s ease;
    }

    @keyframes popupFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .quick-filter-popup.hiding {
      animation: popupFadeOut 0.3s ease;
    }

    .quick-filter-overlay.hiding {
      animation: overlayFadeOut 0.3s ease;
    }

    @keyframes popupFadeOut {
      from {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      to {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.96);
      }
    }

    @keyframes overlayFadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    .quick-filter-popup input:focus,
    .quick-filter-popup select:focus {
      outline: none;
      border-color: #337ab7;
      box-shadow: 0 0 0 3px rgba(51, 122, 183, 0.1);
    }
    .quick-filter-popup input:hover,
    .quick-filter-popup select:hover {
      border-color: #337ab7;
    }
    #cancel-filter:hover,
    #apply-filter:hover {
      background-color: #286090;
    }
  `;
  document.head.appendChild(style);

  // Dark mode styles
  if (document.body.classList.contains("dark")) {
    popup.style.background = "#34353b";
    popup.style.color = "#ffffff";
    const inputs = popup.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.style.background = "#232327";
      input.style.color = "#ffffff";
      input.style.border = "1px solid #666";
    });

    // Update dark mode specific hover styles
    const darkStyle = document.createElement("style");
    darkStyle.textContent = `
      .dark .quick-filter-popup input:hover,
      .dark .quick-filter-popup select:hover {
        border-color: #4a89dc;
      }
      .dark #cancel-filter,
      .dark #apply-filter {
        color: #ffffff;
        background: #337ab7;
      }
      .dark #cancel-filter:hover,
      .dark #apply-filter:hover {
        background-color: #286090;
      }
    `;
    document.head.appendChild(darkStyle);
  }

  // Add Enter key handler for text inputs
  const textInputs = [
    document.getElementById("anime-name"),
    document.getElementById("encoder-name"),
  ];

  textInputs.forEach((input) => {
    input.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent default form submission
        document.getElementById("apply-filter").click();
      }
    });
  });

  // Handle reset
  document.getElementById("reset-filter").addEventListener("click", () => {
    // Check if any filters are active before resetting
    const hasActiveFilters =
      document.getElementById("anime-name").value.trim() ||
      document.getElementById("encoder-name").value.trim() ||
      document.getElementById("quality").value ||
      document.getElementById("format").value ||
      document.getElementById("source").value ||
      document.getElementById("category").value !== "0" ||
      document.getElementById("dual-audio").checked ||
      document.getElementById("season-pack").checked;

    // Only show reset notification if there were active filters
    if (hasActiveFilters) {
      document.getElementById("anime-name").value = "";
      document.getElementById("encoder-name").value = "";
      document.getElementById("quality").value = "";
      document.getElementById("format").value = "";
      document.getElementById("source").value = "";
      document.getElementById("category").value = "0";
      document.getElementById("dual-audio").checked = false;
      document.getElementById("season-pack").checked = false;
      showNotification("All filters have been reset", true);
    } else {
      showNotification("No active filters to reset", false);
    }
  });

  // Handle search
  document.getElementById("apply-filter").addEventListener("click", () => {
    const searchParams = [];
    const category = document.getElementById("category").value;

    const animeName = document.getElementById("anime-name").value.trim();
    const encoder = document.getElementById("encoder-name").value.trim();
    const quality = document.getElementById("quality").value;
    const format = document.getElementById("format").value;
    const source = document.getElementById("source").value;
    const dualAudio = document.getElementById("dual-audio").checked;
    const seasonPack = document.getElementById("season-pack").checked;

    if (animeName) searchParams.push(animeName);
    if (encoder) searchParams.push(encoder);
    if (quality) searchParams.push(quality);
    if (format) searchParams.push(format);
    if (source) searchParams.push(source);
    if (dualAudio) searchParams.push("Dual");
    if (seasonPack) searchParams.push("Season");

    // Check if any filter option is selected
    const hasFilters =
      animeName ||
      encoder ||
      quality ||
      format ||
      source ||
      dualAudio ||
      seasonPack ||
      category;

    if (!hasFilters) {
      showNotification(
        "No filter options selected. Please select at least one option to search.",
        false
      );
      return;
    }

    const searchQuery = searchParams.join(" ");
    const categoryParam = category === "0" ? "0_0" : `1_${category}`;
    window.location.href = `${
      window.location.origin
    }/?f=0&c=${categoryParam}&q=${encodeURIComponent(searchQuery)}`;
  });

  // Handle cancel
  const closePopup = () => {
    popup.classList.add("hiding");
    overlay.classList.add("hiding");
    document.body.style.overflow = "";

    // Wait for animations to finish before removing elements
    popup.addEventListener(
      "animationend",
      () => {
        popup.remove();
      },
      { once: true }
    );

    overlay.addEventListener(
      "animationend",
      () => {
        overlay.remove();
      },
      { once: true }
    );
  };

  document
    .getElementById("cancel-filter")
    .addEventListener("click", closePopup);
  overlay.addEventListener("click", closePopup);
}

// Function to hide dead torrents
async function filterDeadTorrents(isInitialLoad = false) {
  const prefs = await loadStoredPreferences();
  if (!prefs.hideDeadTorrents) {
    // Instead of showing all rows, reapply other active filters
    const rows = document.querySelectorAll("table.torrent-list tbody tr");
    rows.forEach((row) => (row.style.display = ""));

    // Reapply other active filters
    if (prefs.keywordFilterEnabled) {
      filterByKeywords(false);
    }
    if (prefs.fileSizeFilterEnabled) {
      filterByFileSize();
    }
    return;
  }

  const rows = document.querySelectorAll("table.torrent-list tbody tr");
  let hiddenCount = 0;

  rows.forEach((row) => {
    // Changed selectors to be more specific and reliable
    const seedersCell = row.querySelector("td:nth-of-type(6)");
    const leechersCell = row.querySelector("td:nth-of-type(7)");

    if (seedersCell && leechersCell) {
      const seeders = parseInt(seedersCell.textContent);
      const leechers = parseInt(leechersCell.textContent);

      if (seeders === 0 && leechers === 0) {
        row.style.display = "none";
        hiddenCount++;
      } else {
        // Only show if not hidden by other filters
        if (row.style.display === "none") {
          const title = getTitleFromRow(row);
          const sizeCell = row.querySelector("td:nth-of-type(4)");
          const sizeInBytes = sizeCell
            ? convertToBytes(sizeCell.textContent)
            : 0;

          // Check other filters before showing
          const showByKeyword =
            !prefs.keywordFilterEnabled ||
            !prefs.keywords.some((keyword) =>
              title?.toLowerCase().includes(keyword.toLowerCase())
            );
          const showBySize =
            !prefs.fileSizeFilterEnabled ||
            isInSizeRange(sizeInBytes, prefs.fileSizeRange);

          if (showByKeyword && showBySize) {
            row.style.display = "";
          }
        }
      }
    }
  });

  if (hiddenCount > 0 && prefs.showFilterNotifications && isInitialLoad) {
    showNotification(
      `Hidden ${hiddenCount} dead torrent${hiddenCount === 1 ? "" : "s"}`,
      true
    );
  }
}

// Add this after filterDeadTorrents function
function observeTableChanges() {
  const tableBody = document.querySelector("table.torrent-list tbody");
  if (!tableBody) return;

  let isInitialLoad = true;
  const observer = new MutationObserver((mutations) => {
    if (isInitialLoad) {
      isInitialLoad = false;
      return;
    }
    filterDeadTorrents();
  });

  observer.observe(tableBody, {
    childList: true,
    subtree: true,
  });
}

// Add new function for keyword filtering
async function filterByKeywords(isInitialLoad = false) {
  const prefs = await loadStoredPreferences();
  if (!prefs.keywordFilterEnabled) {
    // Show all rows that aren't hidden by other filters
    const rows = document.querySelectorAll("table.torrent-list tbody tr");
    rows.forEach((row) => {
      if (row.style.display === "none") {
        // Check other active filters before showing
        const seedersCell = row.querySelector("td:nth-of-type(6)");
        const leechersCell = row.querySelector("td:nth-of-type(7)");
        const sizeCell = row.querySelector("td:nth-of-type(4)");

        const seeders = seedersCell ? parseInt(seedersCell.textContent) : 0;
        const leechers = leechersCell ? parseInt(leechersCell.textContent) : 0;
        const sizeInBytes = sizeCell ? convertToBytes(sizeCell.textContent) : 0;

        const showByDead = !(
          seeders === 0 &&
          leechers === 0 &&
          prefs.hideDeadTorrents
        );
        const showBySize =
          !prefs.fileSizeFilterEnabled ||
          isInSizeRange(sizeInBytes, prefs.fileSizeRange);

        if (showByDead && showBySize) {
          row.style.display = "";
        }
      }
    });
    return;
  }

  const rows = document.querySelectorAll("table.torrent-list tbody tr");
  let hiddenCount = 0;

  rows.forEach((row) => {
    const title = getTitleFromRow(row);
    if (!title) return;

    // Check all active filters
    const seedersCell = row.querySelector("td:nth-of-type(6)");
    const leechersCell = row.querySelector("td:nth-of-type(7)");
    const sizeCell = row.querySelector("td:nth-of-type(4)");

    const seeders = seedersCell ? parseInt(seedersCell.textContent) : 0;
    const leechers = leechersCell ? parseInt(leechersCell.textContent) : 0;
    const sizeInBytes = sizeCell ? convertToBytes(sizeCell.textContent) : 0;

    const containsKeyword = prefs.keywords.some((keyword) =>
      title.toLowerCase().includes(keyword.toLowerCase())
    );
    const isDead = seeders === 0 && leechers === 0 && prefs.hideDeadTorrents;
    const wrongSize =
      prefs.fileSizeFilterEnabled &&
      !isInSizeRange(sizeInBytes, prefs.fileSizeRange);

    if (containsKeyword || isDead || wrongSize) {
      if (row.style.display !== "none") {
        row.style.display = "none";
        if (containsKeyword) hiddenCount++;
      }
    } else {
      row.style.display = "";
    }
  });

  if (hiddenCount > 0 && prefs.showFilterNotifications && isInitialLoad) {
    showNotification(
      `Hidden ${hiddenCount} torrent${
        hiddenCount === 1 ? "" : "s"
      } matching keywords`,
      true
    );
  }
}

// Add to message listener
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "keywordsUpdated") {
    browser.storage.sync.set({ keywords: message.keywords }, () => {
      filterByKeywords(true); // Always pass true to show notifications
    });
  }
});

// Initialize the extension when the page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeExtension(true);
  });
} else {
  initializeExtension(true);
}

async function initializeExtension(isInitialLoad = false) {
  addCopyButton();
  addCheckboxColumn();
  addAnimetoshoToViewPage();
  addMagnetButtonToViewPage();
  showChangelog();
  filterDeadTorrents(isInitialLoad);
  observeTableChanges();
  filterByKeywords(isInitialLoad);
  toggleComments();
  filterByFileSize();
  handleChangelogPage();
  addChangelogNavItem();
}

async function addMagnetButtonToViewPage() {
  // Check if we're on a view page
  if (!window.location.pathname.startsWith("/view/")) return;

  const prefs = await loadStoredPreferences();
  if (!prefs.showMagnetButtons) return;

  // Find the magnet link
  const magnetLink = document.querySelector('a[href^="magnet:"]');
  if (!magnetLink) return;

  // Create the magnet button
  const magnetButton = document.createElement("button");
  magnetButton.className = "magnet-button";
  magnetButton.innerHTML = '<i class="fa fa-magnet"></i> Copy';
  magnetButton.style.fontFamily = "Segoe UI, Tahoma, sans-serif";
  magnetButton.style.fontWeight = "500";
  magnetButton.style.marginLeft = "10px";

  // Add click handler
  magnetButton.addEventListener("click", () => {
    navigator.clipboard
      .writeText(magnetLink.href)
      .then(() => {
        showNotification("Magnet link copied to clipboard!", true);
      })
      .catch((err) => {
        console.error("Failed to copy magnet:", err);
        showNotification("Failed to copy magnet link", false);
      });
  });

  // Insert the button after the magnet link
  magnetLink.parentNode.insertBefore(magnetButton, magnetLink.nextSibling);
}

async function toggleComments() {
  // Only run on view pages
  if (!window.location.pathname.startsWith("/view/")) return;

  const prefs = await loadStoredPreferences();
  const comments = document.getElementById("comments");
  if (!comments) return;

  // Set initial display style based on preference
  comments.style.display = prefs.hideComments ? "none" : "block";
}

// Function to convert size string to bytes
function convertToBytes(sizeStr) {
  const [value, unit] = sizeStr.trim().split(" ");
  const numValue = parseFloat(value);

  switch (unit) {
    case "Bytes":
      return numValue;
    case "KiB":
      return numValue * 1024;
    case "MiB":
      return numValue * 1024 * 1024;
    case "GiB":
      return numValue * 1024 * 1024 * 1024;
    case "TiB":
      return numValue * 1024 * 1024 * 1024 * 1024;
    default:
      return 0;
  }
}

// Function to check if size is within selected range
function isInSizeRange(sizeInBytes, range) {
  switch (range) {
    case "less_than_256mb":
      return sizeInBytes < 256 * 1024 * 1024;
    case "less_than_512mb":
      return sizeInBytes < 512 * 1024 * 1024;
    case "less_than_768mb":
      return sizeInBytes < 768 * 1024 * 1024;
    case "less_than_1gb":
      return sizeInBytes < 1024 * 1024 * 1024;
    case "greater_than_1gb":
      return sizeInBytes > 1024 * 1024 * 1024;
    case "greater_than_5gb":
      return sizeInBytes > 5 * 1024 * 1024 * 1024;
    case "greater_than_10gb":
      return sizeInBytes > 10 * 1024 * 1024 * 1024;
    case "greater_than_20gb":
      return sizeInBytes > 20 * 1024 * 1024 * 1024;
    default:
      return true;
  }
}

async function filterByFileSize() {
  const prefs = await loadStoredPreferences();
  const rows = document.querySelectorAll("table.torrent-list tbody tr");
  let hiddenCount = 0;

  if (!prefs.fileSizeFilterEnabled) {
    // Show all rows that aren't hidden by other filters
    rows.forEach((row) => {
      if (row.style.display === "none") {
        const title = getTitleFromRow(row);
        const seedersCell = row.querySelector("td:nth-of-type(6)");
        const leechersCell = row.querySelector("td:nth-of-type(7)");

        const seeders = seedersCell ? parseInt(seedersCell.textContent) : 0;
        const leechers = leechersCell ? parseInt(leechersCell.textContent) : 0;

        const showByDead = !(
          seeders === 0 &&
          leechers === 0 &&
          prefs.hideDeadTorrents
        );
        const showByKeyword =
          !prefs.keywordFilterEnabled ||
          !prefs.keywords.some((keyword) =>
            title?.toLowerCase().includes(keyword.toLowerCase())
          );

        if (showByDead && showByKeyword) {
          row.style.display = "";
        }
      }
    });
    return;
  }

  rows.forEach((row) => {
    const title = getTitleFromRow(row);
    const sizeCell = row.querySelector("td:nth-of-type(4)");
    if (!sizeCell) return;

    // Check all active filters
    const seedersCell = row.querySelector("td:nth-of-type(6)");
    const leechersCell = row.querySelector("td:nth-of-type(7)");

    const seeders = seedersCell ? parseInt(seedersCell.textContent) : 0;
    const leechers = leechersCell ? parseInt(leechersCell.textContent) : 0;
    const sizeInBytes = convertToBytes(sizeCell.textContent);

    const wrongSize = !isInSizeRange(sizeInBytes, prefs.fileSizeRange);
    const isDead = seeders === 0 && leechers === 0 && prefs.hideDeadTorrents;
    const containsKeyword =
      prefs.keywordFilterEnabled &&
      prefs.keywords.some((keyword) =>
        title?.toLowerCase().includes(keyword.toLowerCase())
      );

    if (wrongSize || isDead || containsKeyword) {
      if (row.style.display !== "none") {
        row.style.display = "none";
        if (wrongSize) hiddenCount++;
      }
    } else {
      row.style.display = "";
    }
  });

  if (hiddenCount > 0 && prefs.showFilterNotifications) {
    showNotification(
      `Hidden ${hiddenCount} torrent${
        hiddenCount === 1 ? "" : "s"
      } by file size`,
      true
    );
  }
}

function showKeywordSelectPopup() {
  const popup = document.createElement("div");
  popup.className = "quick-filter-popup"; // Reuse existing popup styles
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    min-width: 320px;
    max-width: 400px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  const content = `
    <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Keyword Select</h3>
    
    <div class="filter-group" style="margin-bottom: 18px;">
      <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Enter Keyword:</label>
      <input type="text" id="keyword-select-input" class="filter-input" style="
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s, box-shadow 0.2s;
      ">
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button id="cancel-select" class="copy-magnets-button" style="
        padding: 8px 16px;
        border: none;
        background: #337ab7;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      ">Cancel</button>
      <button id="apply-select" class="copy-magnets-button" style="
        padding: 8px 16px;
        border: none;
        background: #337ab7;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      ">Select</button>
    </div>
  `;

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "quick-filter-overlay"; // Changed from "popup-overlay"
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  `;

  popup.innerHTML = content;
  document.body.appendChild(overlay);
  document.body.appendChild(popup);
  document.body.style.overflow = "hidden";

  // Add hover effects and animations for inputs and buttons
  const style = document.createElement("style");
  style.textContent = `
    .quick-filter-popup {
      animation: popupFadeIn 0.3s ease;
    }

    .quick-filter-overlay {
      animation: overlayFadeIn 0.3s ease;
    }

    @keyframes popupFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .quick-filter-popup.hiding {
      animation: popupFadeOut 0.3s ease;
    }

    .quick-filter-overlay.hiding {
      animation: overlayFadeOut 0.3s ease;
    }

    @keyframes popupFadeOut {
      from {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      to {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.96);
      }
    }

    @keyframes overlayFadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    .quick-filter-popup input:focus {
      outline: none;
      border-color: #337ab7;
      box-shadow: 0 0 0 3px rgba(51, 122, 183, 0.1);
    }
    .quick-filter-popup input:hover {
      border-color: #337ab7;
    }
    #cancel-select:hover,
    #apply-select:hover {
      background-color: #286090;
    }
  `;
  document.head.appendChild(style);

  // Add dark mode styles if needed
  if (document.body.classList.contains("dark")) {
    popup.style.background = "#34353b";
    popup.style.color = "#ffffff";
    const input = popup.querySelector("input");
    input.style.background = "#232327";
    input.style.color = "#ffffff";
    input.style.border = "1px solid #666";
  }

  // Handle Enter key
  document
    .getElementById("keyword-select-input")
    .addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("apply-select").click();
      }
    });

  // Handle selection
  document.getElementById("apply-select").addEventListener("click", () => {
    const keyword = document
      .getElementById("keyword-select-input")
      .value.trim()
      .toLowerCase();
    if (!keyword) {
      showNotification("Please enter a keyword to select", false);
      return;
    }

    const rows = document.querySelectorAll("table.torrent-list tbody tr");
    let matchCount = 0;

    rows.forEach((row) => {
      const title = getTitleFromRow(row);
      const checkbox = row.querySelector(".magnet-checkbox");

      if (title && checkbox && title.toLowerCase().includes(keyword)) {
        checkbox.checked = true;
        matchCount++;
      }
    });

    if (matchCount > 0) {
      showNotification(
        `Selected ${matchCount} torrent${
          matchCount === 1 ? "" : "s"
        } matching "${keyword}"`,
        true
      );
      // Update selection counter if it exists
      const counter = document.querySelector(".magnet-selection-counter");
      if (counter) {
        const totalChecked = document.querySelectorAll(
          ".magnet-checkbox:checked"
        ).length;
        counter.textContent = `${totalChecked} selected`;
      }
    } else {
      showNotification(`No torrents found matching "${keyword}"`, false);
    }

    closePopup();
  });

  // Handle cancel and close
  const closePopup = () => {
    popup.classList.add("hiding");
    overlay.classList.add("hiding");
    document.body.style.overflow = "";

    // Wait for animations to finish before removing elements
    popup.addEventListener(
      "animationend",
      () => {
        popup.remove();
      },
      { once: true }
    );

    overlay.addEventListener(
      "animationend",
      () => {
        overlay.remove();
      },
      { once: true }
    );
  };

  document
    .getElementById("cancel-select")
    .addEventListener("click", closePopup);
  overlay.addEventListener("click", closePopup);
}

async function handleChangelogPage() {
  // Only run on the changelog page
  if (window.location.pathname !== "/changelog") return;

  // Get the main container element (where the 404 message is)
  const mainContainer = document.querySelector(".container h1")?.parentElement;
  if (!mainContainer) return;

  // Update page title
  document.title = "Changelog :: Nyaa";

  // Clear the 404 content
  mainContainer.innerHTML = "";

  // Add changelog content
  const changelogContent = document.createElement("div");
  changelogContent.className = "changelog-page";
  changelogContent.innerHTML = `
    <h1>Nyaa Enhancer Changelog</h1>
    <div class="changelog-repo">
      <p>This is an open source project. View the source code and contribute on 
        <a href="https://github.com/Arad119/Nyaa-Enhancer" target="_blank" class="repo-link">
          <i class="fa fa-github"></i> GitHub
        </a>
      </p>
    </div>
    <div class="version-entry">
      <h2>
        Version 1.7.2
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.7.2" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Fixed bug where forward slash (/) in filenames would create unwanted subfolders in ZIP downloads</li>
        <li>Fixed potential download issues if some torrent names would have Windows-incompatible characters (like :, *, ?, ", etc.)</li>
      </ul>
    </div>
    <div class="version-entry">
      <h2>
        Version 1.7.1
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.7.1" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Fixed bug where the selection counter wasn't updating when using the "Invert Selection" button</li>
      </ul>
    </div>
    <div class="version-entry">
      <h2>
        Version 1.7.0
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.7.0" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Added clear explanation of what the keyword filter does</li>
        <li>Added a Keyword Select button to quickly select all torrents with a specific keyword</li>
        <li>Added changelog page to easily see what's new in each version</li>
        <li>Fixed bug where filter-related notifications did not respect the Show Notifications setting</li>
      </ul>
    </div>
    <div class="version-entry">
      <h2>
        Version 1.6.2
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.6.2" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Fixed bug where disabling "Show Button Controls" didn't properly remove checkbox columns</li>
        <li>Fixed bug where re-enabling "Show Button Controls" caused duplicate AT and Magnet columns</li>
      </ul>
    </div>
      <div class="version-entry">
      <h2>
        Version 1.6.1
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.6.1" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Added organized categories in settings menu for easier navigation</li>
        <li>Added new filtering options:</li>
        <ul>
          <li>Hide dead torrents (0 Seeders & 0 Leechers)</li>
          <li>Filter torrents by keywords</li>
          <li>Filter torrents by file size</li>
        </ul>
        <li>Added new view page features:</li>
        <ul>
          <li>Copy Magnet button on torrent pages</li>
          <li>Option to hide comments</li>
        </ul>
        <li>Removed support for nyaa.eu domain due to compatibility issues</li>
        <li>Renamed Quick Filter to Quick Search</li>
      </ul>
    </div>
    <div class="version-entry">
      <h2>Version 1.5.0
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.5.0" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Added Quick Filter feature to easily search for specific anime, encoders, quality, format, and source</li>
        <li>Added Invert Selection button</li>
        <li>Added ability to select everything in between two checkboxes (Shift+Click)</li>
      </ul>
    </div>
    <div class="version-entry">
      <h2>Version 1.4.2
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.4.2" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Removed unnecessary downloads permission to improve security and privacy</li>
      </ul>
    </div>
    <div class="version-entry">
      <h2>Version 1.4.1
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.4.1" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Added rate limiting (500ms delay) between torrent downloads when using ZIP option to prevent HTTP 429 errors (Too Many Requests sent in a given amount of time)</li>
        <li>Fixed bug where torrent files would incorrectly use comment count as filename</li>
        <li>Fixed bug where not all torrent files would get downloaded when using ZIP option</li>
      </ul>
    </div>
    <div class="version-entry">
      <h2>Version 1.4.0
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.4.0" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Added Animetosho links column for supported torrents (English-translated anime)</li>
        <li>Added Animetosho link to view page for supported torrents</li>
        <li>Added magnet copy buttons column with one-click copying</li>
        <li>Added toggles for all features in extension popup</li>
      </ul>
    </div>
    <div class="version-entry">
      <h2>Version 1.3.1
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.3.1" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Added badge indicator for supported sites</li>
        <li>Moved toggles to the extension popup</li>
        <li>Added changelog notification</li>
        <li>Added changelog toggle in popup settings</li>
        <li>Adjusted styling</li>
      </ul>
    </div>
    <div class="version-entry">
      <h2>Version 1.2.1
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.2.1" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Added Torrent File Downloads:</li>
        <ul>
          <li>Download selected .torrent files directly</li>
          <li>Batch download all torrents on the page</li>
          <li>Combine multiple downloads into a single ZIP file</li>
          <li>Track download progress with visual notifications</li>
        </ul>
        <li>Added Customization Options:</li>
        <ul>
          <li>Choose between original or display names for downloaded torrent files</li>
          <li>Toggle between individual or ZIP downloads</li>
        </ul>
      </ul>
    </div>
    <div class="version-entry">
      <h2>Version 1.0.0
        <a href="https://github.com/Arad119/Nyaa-Enhancer/releases/tag/v1.0.0" target="_blank" class="version-link">
          <i class="fa fa-github"></i> View Release
        </a>
      </h2>
      <ul>
        <li>Adds checkboxes next to each torrent entry</li>
        <li>"Copy Selected" button to copy only checked magnet links.</li>
        <li>"Copy All" button to copy all magnet links on the page</li>
        <li>"Clear Selection" button to uncheck all boxes</li>
        <li>Selection counter showing number of selected items</li>
        <li>Toast notifications for user feedback</li>
        <li>Support for multiple Nyaa mirror domains</li>
      </ul>
    </div>
  `;

  mainContainer.appendChild(changelogContent);
}

async function addChangelogNavItem() {
  const prefs = await loadStoredPreferences();
  if (!prefs.showChangelogNav) return;

  // Find the navigation list that contains "RSS"
  const navList = document.querySelector(".nav.navbar-nav");
  const rssItem = Array.from(navList?.querySelectorAll("li") || []).find(
    (li) => li.textContent.trim() === "RSS"
  );

  if (navList && rssItem) {
    // Create new changelog list item
    const changelogItem = document.createElement("li");
    const changelogLink = document.createElement("a");
    changelogLink.href = "/changelog";
    changelogLink.textContent = "Changelog";
    changelogItem.appendChild(changelogLink);

    // Insert after the RSS item
    rssItem.insertAdjacentElement("afterend", changelogItem);
  }
}
