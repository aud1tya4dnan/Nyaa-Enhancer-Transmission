function addCopyButton() {
  const container = document.querySelector(".table-responsive");
  if (!container) return;

  const buttonContainer = document.createElement("div");
  buttonContainer.style.marginBottom = "10px";
  buttonContainer.style.display = "flex";
  buttonContainer.style.alignItems = "center";

  const copyButton = document.createElement("button");
  copyButton.className = "copy-magnets-button";
  copyButton.textContent = "Copy Selected";
  copyButton.addEventListener("click", copySelectedMagnets);

  const copyAllButton = document.createElement("button");
  copyAllButton.className = "copy-magnets-button";
  copyAllButton.style.marginLeft = "10px";
  copyAllButton.textContent = "Copy All";
  copyAllButton.addEventListener("click", copyAllMagnets);

  const clearButton = document.createElement("button");
  clearButton.className = "copy-magnets-button clear-button";
  clearButton.style.marginLeft = "10px";
  clearButton.textContent = "Clear Selection";
  clearButton.addEventListener("click", clearSelection);

  const selectionCounter = document.createElement("span");
  selectionCounter.className = "magnet-selection-counter";
  selectionCounter.style.marginLeft = "15px";
  selectionCounter.textContent = "0 selected";

  // Update counter when checkboxes change
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
  buttonContainer.appendChild(clearButton);
  buttonContainer.appendChild(selectionCounter);
  container.parentNode.insertBefore(buttonContainer, container);
}

function addCheckboxColumn() {
  // Add header column
  const headerRow = document.querySelector("table.torrent-list thead tr");
  if (!headerRow) return;

  const checkboxHeader = document.createElement("th");
  checkboxHeader.className = "magnet-checkbox-column text-center";
  headerRow.appendChild(checkboxHeader);

  // Add checkbox to each row
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

function showNotification(message, isSuccess = true) {
  let container = document.querySelector(".magnet-notification-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "magnet-notification-container";
    document.body.appendChild(container);
  }

  const notification = document.createElement("div");
  notification.className = "magnet-notification";
  notification.textContent = message;
  notification.style.backgroundColor = isSuccess ? "#4CAF50" : "#f44336";

  container.appendChild(notification);

  // Force reflow to ensure transition works
  notification.offsetHeight;

  // Add show class to trigger transition
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function copySelectedMagnets() {
  const selectedMagnets = [];
  const rows = document.querySelectorAll("table.torrent-list tbody tr");

  rows.forEach((row) => {
    const checkbox = row.querySelector(".magnet-checkbox");
    if (checkbox && checkbox.checked) {
      const magnetLink = row.querySelector('a[href^="magnet:"]');
      if (magnetLink) {
        selectedMagnets.push(magnetLink.href);
      }
    }
  });

  if (selectedMagnets.length > 0) {
    const magnetText = selectedMagnets.join("\n");
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

function copyAllMagnets() {
  const allMagnets = [];
  const rows = document.querySelectorAll("table.torrent-list tbody tr");

  rows.forEach((row) => {
    const magnetLink = row.querySelector('a[href^="magnet:"]');
    if (magnetLink) {
      allMagnets.push(magnetLink.href);
    }
  });

  if (allMagnets.length > 0) {
    const magnetText = allMagnets.join("\n");
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

function updateSelectionCounter(selectionCounter) {
  const checkedBoxes = document.querySelectorAll(
    ".magnet-checkbox:checked"
  ).length;
  selectionCounter.textContent = `${checkedBoxes} selected`;
}

function clearSelection() {
  const checkboxes = document.querySelectorAll(".magnet-checkbox:checked");
  if (checkboxes.length === 0) {
    showNotification("No checkboxes are selected to clear!", false);
    return;
  }

  const selectionCounter = document.querySelector(".magnet-selection-counter");
  if (!selectionCounter) return;

  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  selectionCounter.textContent = "0 selected";
  showNotification("Selection cleared", true);
}

// Initialize when the page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    addCopyButton();
    addCheckboxColumn();
  });
} else {
  addCopyButton();
  addCheckboxColumn();
}
