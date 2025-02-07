// Function to load user preferences from Browsers's storage
// This includes settings for filename format and ZIP packaging
function loadStoredPreferences() {
  return new Promise((resolve) => {
    // browser.storage.sync.get allows saving settings across different devices
    // if the user is signed into Browser
    browser.storage.sync.get(
      {
        // Default values if no settings are found:
        // - useDisplayName: whether to use anime titles for filenames
        // - useZip: whether to combine downloads into a ZIP file
        // - showButtons: whether to show button controls
        // - showATLinks: whether to show AnimeToSho links
        // - showMagnetButtons: whether to show magnet copy buttons
        useDisplayName: true,
        useZip: true,
        showButtons: true,
        showATLinks: true,
        showMagnetButtons: true,
      },
      (items) => {
        resolve(items);
      }
    );
  });
}

// Function to save individual preferences to Browser's storage
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

  buttonContainer.appendChild(copyButton);
  buttonContainer.appendChild(copyAllButton);
  buttonContainer.appendChild(downloadButton);
  buttonContainer.appendChild(downloadAllButton);
  buttonContainer.appendChild(clearButton);
  buttonContainer.appendChild(selectionCounter);
  container.parentNode.insertBefore(buttonContainer, container);
}

// Function to add a checkbox column to the torrent table
// This allows users to select individual torrents for batch operations
async function addCheckboxColumn() {
  const prefs = await loadStoredPreferences();

  // Add new column headers to the table
  const headerRow = document.querySelector("table.torrent-list thead tr");
  if (!headerRow) return;

  // Add AT column header if enabled
  if (prefs.showATLinks) {
    const atHeader = document.createElement("th");
    atHeader.className = "text-center";
    atHeader.style.width = "70px";
    atHeader.textContent = "AT";
    const checkboxHeader = headerRow.querySelector(".magnet-checkbox-column");
    headerRow.insertBefore(atHeader, checkboxHeader);
  }

  // Add Magnet column header if enabled
  if (prefs.showMagnetButtons) {
    const magnetHeader = document.createElement("th");
    magnetHeader.className = "text-center";
    magnetHeader.style.width = "70px";
    magnetHeader.textContent = "Magnet";
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

  // Add checkbox column header only if buttons are enabled
  if (prefs.showButtons) {
    const checkboxHeader = document.createElement("th");
    checkboxHeader.className = "magnet-checkbox-column text-center";
    headerRow.appendChild(checkboxHeader);
  }

  // Add cells to each row in the table
  const rows = document.querySelectorAll("table.torrent-list tbody tr");
  rows.forEach((row) => {
    // Create AT cell with link if enabled
    if (prefs.showATLinks) {
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
      row.insertBefore(atCell, row.lastElementChild?.nextSibling);
    }

    // Create magnet cell if enabled
    if (prefs.showMagnetButtons) {
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
      row.insertBefore(magnetCell, row.lastElementChild?.nextSibling);
    }

    // Add checkbox cell only if buttons are enabled
    if (prefs.showButtons) {
      const checkboxCell = document.createElement("td");
      checkboxCell.className = "text-center";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "magnet-checkbox";
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
    const prefs = await loadStoredPreferences();

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

        // Use appropriate filename based on stored preference
        const filename = prefs.useDisplayName
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
        • Added Animetosho links column for supported torrents<br>
        • Added Animetosho link to view page for supported torrents<br>
        • Added magnet copy buttons column<br>
        • Added toggles for all features
      </div>
      <div class="changelog-actions">
        <button class="changelog-button okay">Okay</button>
        <button class="changelog-button dont-show">Don't show again</button>
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
      const buttonContainer = document.querySelector(".button-container");
      if (!value) {
        // Handle button container fade out
        if (buttonContainer) {
          buttonContainer.classList.add("hiding");
          await new Promise((r) => setTimeout(r, 300)); // Wait for animation
          buttonContainer.style.display = "none";
        }
        // Remove checkbox header and cells immediately
        const checkboxHeader = document.querySelector(
          ".magnet-checkbox-column"
        );
        if (checkboxHeader) checkboxHeader.remove();
        document.querySelectorAll(".magnet-checkbox").forEach((checkbox) => {
          const cell = checkbox.closest("td");
          if (cell) cell.remove();
        });
      } else {
        // If enabling buttons, remove old container and create new one
        if (buttonContainer) {
          buttonContainer.remove();
        }
        await addCopyButton();

        // Add only the checkbox column
        const headerRow = document.querySelector("table.torrent-list thead tr");
        if (headerRow) {
          const checkboxHeader = document.createElement("th");
          checkboxHeader.className = "magnet-checkbox-column text-center";
          headerRow.appendChild(checkboxHeader);
        }

        // Add checkbox cells
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

// Initialize the extension when the page loads
// This ensures the DOM is ready before we add our UI elements
if (document.readyState === "loading") {
  // If the document is still loading, wait for DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    addCopyButton();
    addCheckboxColumn();
    addAnimetoshoToViewPage();
    showChangelog();
  });
} else {
  // If the document is already loaded, add UI elements immediately
  addCopyButton();
  addCheckboxColumn();
  addAnimetoshoToViewPage();
  showChangelog();
}
