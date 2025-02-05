// Function to load user preferences from Chrome's storage
// This includes settings for filename format and ZIP packaging
function loadStoredPreferences() {
  return new Promise((resolve) => {
    // chrome.storage.sync.get allows saving settings across different devices
    // if the user is signed into Chrome
    chrome.storage.sync.get(
      {
        // Default values if no settings are found:
        // - useDisplayName: whether to use anime titles for filenames
        // - useZip: whether to combine downloads into a ZIP file
        useDisplayName: true,
        useZip: true,
      },
      (items) => {
        resolve(items);
      }
    );
  });
}

// Function to save individual preferences to Chrome's storage
// key: the setting name (useDisplayName or useZip)
// value: the boolean value of the setting (true/false)
function savePreference(key, value) {
  chrome.storage.sync.set({
    [key]: value,
  });
}

// Main function that creates and adds all UI elements to the page
function addCopyButton() {
  // Find the table container where we'll add our buttons
  const container = document.querySelector(".table-responsive");
  if (!container) return;

  // Create a container for all our buttons and controls
  // This will be placed above the torrent table
  const buttonContainer = document.createElement("div");
  buttonContainer.style.marginBottom = "10px";
  buttonContainer.style.display = "flex";
  buttonContainer.style.alignItems = "center";

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
  downloadAllButton.style.marginLeft = "10px";
  downloadAllButton.textContent = "Download All";
  downloadAllButton.addEventListener("click", downloadAllTorrents);

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

  // Create container for the filename format toggle
  const toggleContainer = document.createElement("div");
  toggleContainer.style.marginLeft = "15px";
  toggleContainer.style.display = "flex";
  toggleContainer.style.alignItems = "center";
  toggleContainer.style.fontWeight = "normal"; // Prevent bold text inheritance

  // Create checkbox for filename format toggle
  const toggleCheckbox = document.createElement("input");
  toggleCheckbox.type = "checkbox";
  toggleCheckbox.id = "renameToggle";
  toggleCheckbox.style.margin = "0 5px 0 0"; // Remove default margins

  // Create checkbox for ZIP format toggle
  const zipToggleCheckbox = document.createElement("input");
  zipToggleCheckbox.type = "checkbox";
  zipToggleCheckbox.id = "zipToggle";
  zipToggleCheckbox.style.margin = "0 5px 0 0"; // Remove default margins

  // Load user's saved preferences and apply them to the checkboxes
  loadStoredPreferences().then((prefs) => {
    toggleCheckbox.checked = prefs.useDisplayName;
    zipToggleCheckbox.checked = prefs.useZip;
  });

  // Save preferences whenever they change
  toggleCheckbox.addEventListener("change", (e) => {
    savePreference("useDisplayName", e.target.checked);
  });

  zipToggleCheckbox.addEventListener("change", (e) => {
    savePreference("useZip", e.target.checked);
  });

  // Create and style label for filename format toggle
  const toggleLabel = document.createElement("label");
  toggleLabel.htmlFor = "renameToggle";
  toggleLabel.textContent = "Use display name as filename";
  toggleLabel.style.margin = "0";
  toggleLabel.style.cursor = "pointer";
  toggleLabel.style.fontWeight = "normal";

  // Assemble filename format toggle components
  toggleContainer.appendChild(toggleCheckbox);
  toggleContainer.appendChild(toggleLabel);

  // Create container for ZIP format toggle
  const zipToggleContainer = document.createElement("div");
  zipToggleContainer.style.marginLeft = "15px";
  zipToggleContainer.style.display = "flex";
  zipToggleContainer.style.alignItems = "center";
  zipToggleContainer.style.fontWeight = "normal";

  // Create and style label for ZIP format toggle
  const zipToggleLabel = document.createElement("label");
  zipToggleLabel.htmlFor = "zipToggle";
  zipToggleLabel.textContent = "Combine downloads as ZIP";
  zipToggleLabel.style.margin = "0";
  zipToggleLabel.style.cursor = "pointer";
  zipToggleLabel.style.fontWeight = "normal";

  // Assemble ZIP format toggle components
  zipToggleContainer.appendChild(zipToggleCheckbox);
  zipToggleContainer.appendChild(zipToggleLabel);

  buttonContainer.appendChild(copyButton);
  buttonContainer.appendChild(copyAllButton);
  buttonContainer.appendChild(downloadButton);
  buttonContainer.appendChild(downloadAllButton);
  buttonContainer.appendChild(clearButton);
  buttonContainer.appendChild(selectionCounter);
  buttonContainer.appendChild(toggleContainer);
  buttonContainer.appendChild(zipToggleContainer);
  container.parentNode.insertBefore(buttonContainer, container);
}

// Function to add a checkbox column to the torrent table
// This allows users to select individual torrents for batch operations
function addCheckboxColumn() {
  // Add a new column header to the table for checkboxes
  const headerRow = document.querySelector("table.torrent-list thead tr");
  if (!headerRow) return;

  const checkboxHeader = document.createElement("th");
  checkboxHeader.className = "magnet-checkbox-column text-center";
  headerRow.appendChild(checkboxHeader);

  // Add checkboxes to each row in the table
  // These checkboxes allow users to select which torrents they want to process
  const rows = document.querySelectorAll("table.torrent-list tbody tr");
  rows.forEach((row) => {
    const checkboxCell = document.createElement("td");
    checkboxCell.className = "text-center";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "magnet-checkbox";

    checkboxCell.appendChild(checkbox);
    row.appendChild(checkboxCell);
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

  // Force browser to process the element before animation
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

  // Loop through all rows and collect all magnet links
  rows.forEach((row) => {
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
      const titleLink = row.querySelector('td a[href^="/view/"]');
      if (torrentLink && titleLink) {
        selectedTorrents.push({
          url: torrentLink.href,
          filename: titleLink.title || titleLink.textContent,
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

  // Collect information about all torrents
  rows.forEach((row) => {
    const torrentLink = row.querySelector('a[href$=".torrent"]');
    const titleLink = row.querySelector('td a[href^="/view/"]');
    if (torrentLink && titleLink) {
      allTorrents.push({
        url: torrentLink.href,
        filename: titleLink.title || titleLink.textContent,
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

// Function to download torrents and package them into a ZIP file
// torrents: Array of torrent objects with url and filename
// zipName: Name of the output ZIP file
async function downloadTorrentsAsZip(torrents, zipName) {
  try {
    // Initialize ZIP creation and progress tracking
    const zip = new JSZip();
    let completedDownloads = 0;
    const progressNotification = createProgressNotification();
    const useAnimeTitle = document.getElementById("renameToggle").checked;

    // Update initial progress
    progressNotification.textContent = `Progress: 0/${torrents.length} files`;

    // Create an array of promises for parallel downloads
    const fetchPromises = torrents.map(async (torrent) => {
      try {
        // Download the torrent file with explicit response type
        const response = await fetch(torrent.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the blob with explicit type
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        // Use appropriate filename based on user preference
        const filename = useAnimeTitle
          ? torrent.filename + ".torrent"
          : torrent.url.split("/").pop();

        // Add file to ZIP using arrayBuffer
        zip.file(filename, arrayBuffer);

        // Update progress notification
        completedDownloads++;
        progressNotification.textContent = `Progress: ${completedDownloads}/${torrents.length} files`;
      } catch (error) {
        console.error(`Failed to fetch torrent: ${torrent.filename}`, error);
      }
    });

    // Wait for all downloads to complete
    await Promise.all(fetchPromises);

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
  // Get user preference for filename format
  const useAnimeTitle = document.getElementById("renameToggle").checked;
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

      // Use appropriate filename based on user preference
      const filename = useAnimeTitle
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
  const useZip = document.getElementById("zipToggle").checked;

  // Use individual downloads if only one file or ZIP is disabled
  // Otherwise use ZIP download
  if (torrents.length === 1 || !useZip) {
    await downloadIndividualTorrents(torrents);
  } else {
    await downloadTorrentsAsZip(torrents, zipName);
  }
}

// Initialize the extension when the page loads
// This ensures the DOM is ready before we add our UI elements
if (document.readyState === "loading") {
  // If the document is still loading, wait for DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    addCopyButton();
    addCheckboxColumn();
  });
} else {
  // If the document is already loaded, add UI elements immediately
  addCopyButton();
  addCheckboxColumn();
}
