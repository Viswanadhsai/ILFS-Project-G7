const LOCAL_LOST_ITEMS_KEY = "lostItems";
const LOCAL_FOUND_ITEMS_KEY = "foundItems";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getStoredArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (err) {
    return [];
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch (err) {
    return {};
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

function isCurrentUsersReport(item, user) {
  if (!item.reporterEmail) return true;
  return item.reporterEmail.toLowerCase() === String(user.email || "").toLowerCase();
}

function normaliseWords(value) {
  const stopWords = ["a", "an", "and", "at", "in", "near", "of", "on", "the", "to", "with"];

  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
}

function countSharedWords(firstWords, secondWords) {
  const secondWordSet = new Set(secondWords);
  return new Set(firstWords.filter(word => secondWordSet.has(word))).size;
}

function getItemWords(item) {
  return normaliseWords([
    item.title,
    item.category,
    item.location,
    item.description
  ].join(" "));
}

function getDaysBetween(firstDate, secondDate) {
  if (!firstDate || !secondDate) return null;

  const firstTime = new Date(firstDate).getTime();
  const secondTime = new Date(secondDate).getTime();

  if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) return null;

  return Math.round((secondTime - firstTime) / (1000 * 60 * 60 * 24));
}

function scorePotentialMatch(lostItem, foundItem) {
  let score = 0;
  const reasons = [];

  // compare category case-insensitively
  if (
    lostItem.category &&
    foundItem.category &&
    lostItem.category.toLowerCase() === foundItem.category.toLowerCase()
  ) {
    score += 35;
    reasons.push("same category");
  }

  const sharedWords = countSharedWords(getItemWords(lostItem), getItemWords(foundItem));
  if (sharedWords > 0) {
    score += Math.min(sharedWords * 12, 36);
    reasons.push(`${sharedWords} shared keyword${sharedWords === 1 ? "" : "s"}`);
  }

  const sharedLocationWords = countSharedWords(normaliseWords(lostItem.location), normaliseWords(foundItem.location));
  if (sharedLocationWords > 0) {
    score += 18;
    reasons.push("similar location");
  }

  const dayGap = getDaysBetween(lostItem.dateLost, foundItem.dateFound);
  if (dayGap !== null && dayGap >= 0 && dayGap <= 14) {
    score += 11;
    reasons.push("date range fits");
  } else if (dayGap !== null && dayGap < 0) {
    score -= 20;
  }

  const finalScore = Math.max(0, Math.min(score, 100));
  return {
    lostItem,
    foundItem,
    score: finalScore,
    reasons
  };
}

function getPotentialMatches(lostItems, foundItems) {
  const allScores = lostItems
    .flatMap(lostItem => foundItems.map(foundItem => scorePotentialMatch(lostItem, foundItem)));
  const filtered = allScores.filter(match => match.score >= 35);
  const sorted = filtered.sort((first, second) => second.score - first.score);
  return sorted;
}

function createReportRow(item, type) {
  const dateLabel = type === "Lost" ? "Date lost" : "Date found";
  const dateValue = type === "Lost" ? item.dateLost : item.dateFound;

  return `
    <div class="dashboard-list-item">
      <div>
        <span class="badge ${type === "Lost" ? "orange darken-2" : "teal"} white-text user-report-type">${type}</span>
        <h6><b>${escapeHtml(item.title)}</b></h6>
        <p class="grey-text text-darken-1">${escapeHtml(item.category)} | ${escapeHtml(item.location)}</p>
        <p><b>${dateLabel}:</b> ${escapeHtml(dateValue)}</p>
      </div>
      <span class="status-chip">${escapeHtml(item.status || type)}</span>
    </div>
  `;
}

function createMatchRow(match) {
  const reasonText = match.reasons.length ? match.reasons.join(", ") : "possible item match";

  return `
    <div class="dashboard-list-item">
      <div>
        <span class="match-score">${match.score}% match</span>
        <h6><b>${escapeHtml(match.lostItem.title)}</b> may match <b>${escapeHtml(match.foundItem.title)}</b></h6>
        <p class="grey-text text-darken-1">${escapeHtml(reasonText)}</p>
        <p><b>Lost:</b> ${escapeHtml(match.lostItem.location)} | <b>Found:</b> ${escapeHtml(match.foundItem.location)}</p>
      </div>
    </div>
  `;
}

function renderProfile(user) {
  document.getElementById("userName").textContent = user.name || "Frontend Demo User";
  document.getElementById("userEmail").textContent = user.email || "No email available";
  document.getElementById("userRole").textContent = user.role || "user";
}

function renderDashboard() {
  const user = getCurrentUser();
  const lostItems = getStoredArray(LOCAL_LOST_ITEMS_KEY).filter(item => isCurrentUsersReport(item, user));
  const foundItems = getStoredArray(LOCAL_FOUND_ITEMS_KEY).filter(item => isCurrentUsersReport(item, user));
  const reports = [
    ...lostItems.map(item => ({ item, type: "Lost" })),
    ...foundItems.map(item => ({ item, type: "Found" }))
  ].sort((first, second) => new Date(second.item.createdAt || 0) - new Date(first.item.createdAt || 0));
  const matches = getPotentialMatches(lostItems, foundItems);
  const openReports = reports.filter(report => !["Matched", "Returned"].includes(report.item.status)).length;

  renderProfile(user);

  document.getElementById("myLostCount").textContent = lostItems.length;
  document.getElementById("myFoundCount").textContent = foundItems.length;
  document.getElementById("myMatchCount").textContent = matches.length;
  document.getElementById("openReportCount").textContent = openReports;
  document.getElementById("myReportTotal").textContent = `${reports.length} total`;
  document.getElementById("matchUpdateTotal").textContent = `${matches.length} found`;

  const reportsList = document.getElementById("myReportsList");
  const reportsEmptyState = document.getElementById("reportsEmptyState");
  if (!reports.length) {
    reportsList.innerHTML = "";
    reportsEmptyState.classList.remove("hide");
  } else {
    reportsEmptyState.classList.add("hide");
    reportsList.innerHTML = reports.map(report => createReportRow(report.item, report.type)).join("");
  }

  const matchUpdatesList = document.getElementById("matchUpdatesList");
  const matchesEmptyState = document.getElementById("matchesEmptyState");
  if (!matches.length) {
    matchUpdatesList.innerHTML = "";
    matchesEmptyState.classList.remove("hide");
  } else {
    matchesEmptyState.classList.add("hide");
    matchUpdatesList.innerHTML = matches.slice(0, 5).map(createMatchRow).join("");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.M) {
    M.updateTextFields();
  }

  renderDashboard();
});
