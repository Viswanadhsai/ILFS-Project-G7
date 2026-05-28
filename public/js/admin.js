const LOCAL_LOST_ITEMS_KEY = "lostItems";
const LOCAL_FOUND_ITEMS_KEY = "foundItems";
const ADMIN_STATUS_KEY = "adminItemStatuses";
const API = "http://localhost:3000/api";  // ← UPDATED TO MATCH SERVER PORT
let backendLostItems = [];
let backendFoundItems = [];

const demoLostItems = [
  {
    id: "demo-lost-1",
    title: "Black Laptop Sleeve",
    category: "Electronics",
    dateLost: "2026-05-03",
    location: "Library study area",
    description: "Black zip laptop sleeve with charger pocket.",
    status: "Lost"
  },
  {
    id: "demo-lost-2",
    title: "Student ID Card",
    category: "Documents",
    dateLost: "2026-05-02",
    location: "Cafeteria",
    description: "Student card in a clear plastic holder.",
    status: "Lost"
  }
];

const demoFoundItems = [
  {
    id: "demo-found-1",
    title: "Blue Backpack",
    category: "Bag",
    dateFound: "2026-05-04",
    location: "Main library entrance",
    description: "Blue backpack with a water bottle in the side pocket.",
    status: "Found"
  },
  {
    id: "demo-found-2",
    title: "Car Keys",
    category: "Keys",
    dateFound: "2026-05-01",
    location: "Computer lab",
    description: "Key ring with two silver keys and a black tag.",
    status: "Found"
  }
];

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

function getStatusMap() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_STATUS_KEY) || "{}");
  } catch (err) {
    return {};
  }
}

function setStatusMap(statusMap) {
  localStorage.setItem(ADMIN_STATUS_KEY, JSON.stringify(statusMap));
}

function mapBackendLostItem(item) {
  return {
    id: item._id,
    title: item.name,
    category: item.category,
    dateLost: item.date,
    location: item.location,
    description: item.description || "",
    status: item.status || "Lost",
    source: "backend"
  };
}

function mapBackendFoundItem(item) {
  return {
    id: item._id,
    title: item.name,
    category: item.category,
    dateFound: item.date,
    location: item.location,
    description: item.description || "",
    status: item.status || "Found",
    source: "backend"
  };
}

async function loadBackendItems() {
  try {
    const [lostResponse, foundResponse] = await Promise.all([
      fetch(`${API}/lost`),
      fetch(`${API}/found`)
    ]);

    if (!lostResponse.ok || !foundResponse.ok) return;

    const lostItems = await lostResponse.json();
    const foundItems = await foundResponse.json();

    backendLostItems = lostItems.map(mapBackendLostItem);
    backendFoundItems = foundItems.map(mapBackendFoundItem);
  } catch (err) {
    backendLostItems = [];
    backendFoundItems = [];
  }
}

function createAdminId(type, item) {
  const dateValue = item.dateLost || item.dateFound || item.createdAt || "";
  const sourceId = item.id || item.title || "";
  const safeSourceId = String(sourceId).replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeDateValue = String(dateValue).replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${type.toLowerCase()}-${safeSourceId}-${safeDateValue}`;
}

function getAdminItems() {
  const statusMap = getStatusMap();
  const lostItems = [...backendLostItems, ...getStoredArray(LOCAL_LOST_ITEMS_KEY), ...demoLostItems].map(item => ({
    ...item,
    type: "Lost",
    date: item.dateLost,
    adminId: createAdminId("Lost", item)
  }));
  const foundItems = [...backendFoundItems, ...getStoredArray(LOCAL_FOUND_ITEMS_KEY), ...demoFoundItems].map(item => ({
    ...item,
    type: "Found",
    date: item.dateFound,
    adminId: createAdminId("Found", item)
  }));

  return [...lostItems, ...foundItems].map(item => ({
    ...item,
    status: statusMap[item.adminId] || item.status || item.type
  }));
}

function itemMatchesFilters(item) {
  const searchTerm = document.getElementById("adminSearch").value.trim().toLowerCase();
  const typeFilter = document.getElementById("typeFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;
  const searchableText = [
    item.title,
    item.category,
    item.location,
    item.description,
    item.status,
    item.type
  ].join(" ").toLowerCase();

  return searchableText.includes(searchTerm)
    && (typeFilter === "all" || item.type === typeFilter)
    && (statusFilter === "all" || item.status === statusFilter);
}

function normaliseWords(value) {
  const stopWords = ["a", "an", "and", "at", "in", "near", "of", "on", "the", "to", "with"];

  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
}

function getItemWords(item) {
  return normaliseWords([
    item.title,
    item.category,
    item.location,
    item.description
  ].join(" "));
}

function countSharedWords(firstWords, secondWords) {
  const secondWordSet = new Set(secondWords);
  return new Set(firstWords.filter(word => secondWordSet.has(word))).size;
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

  if (lostItem.category && lostItem.category === foundItem.category) {
    score += 35;
    reasons.push("same category");
  }

  const sharedWords = countSharedWords(getItemWords(lostItem), getItemWords(foundItem));
  if (sharedWords > 0) {
    const keywordScore = Math.min(sharedWords * 12, 36);
    score += keywordScore;
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

  return {
    lostItem,
    foundItem,
    score: Math.max(0, Math.min(score, 100)),
    reasons
  };
}

function getPotentialMatches(items) {
  const lostItems = items.filter(item => item.type === "Lost" && item.status !== "Returned");
  const foundItems = items.filter(item => item.type === "Found" && item.status !== "Returned");

  return lostItems
    .flatMap(lostItem => foundItems.map(foundItem => scorePotentialMatch(lostItem, foundItem)))
    .filter(match => match.score >= 45)
    .sort((first, second) => second.score - first.score)
    .slice(0, 6);
}

function createMatchCard(match) {
  const reasonText = match.reasons.length ? match.reasons.join(", ") : "possible text match";

  return `
    <div class="admin-match-card">
      <div>
        <span class="admin-match-score">${match.score}% match</span>
        <h6><b>${escapeHtml(match.lostItem.title)}</b> + <b>${escapeHtml(match.foundItem.title)}</b></h6>
        <p class="grey-text text-darken-1">${escapeHtml(reasonText)}</p>
        <p>
          <b>Lost:</b> ${escapeHtml(match.lostItem.location)} (${escapeHtml(match.lostItem.dateLost)})
          <br>
          <b>Found:</b> ${escapeHtml(match.foundItem.location)} (${escapeHtml(match.foundItem.dateFound)})
        </p>
      </div>
      <button class="btn teal waves-effect waves-light" onclick="markItemsAsMatched('${escapeHtml(match.lostItem.adminId)}', '${escapeHtml(match.foundItem.adminId)}')">
        Match
      </button>
    </div>
  `;
}

function renderPotentialMatches(items) {
  const matches = getPotentialMatches(items);
  const matchList = document.getElementById("matchList");
  const emptyState = document.getElementById("matchEmptyState");

  document.getElementById("matchCount").textContent = `${matches.length} match${matches.length === 1 ? "" : "es"}`;

  if (!matches.length) {
    matchList.innerHTML = "";
    emptyState.classList.remove("hide");
    return;
  }

  emptyState.classList.add("hide");
  matchList.innerHTML = matches.map(createMatchCard).join("");
}

function updateStats(items, visibleItems) {
  document.getElementById("totalReports").textContent = items.length;
  document.getElementById("lostReports").textContent = items.filter(item => item.type === "Lost").length;
  document.getElementById("foundReports").textContent = items.filter(item => item.type === "Found").length;
  document.getElementById("resolvedReports").textContent = items.filter(item => item.status === "Returned").length;
  document.getElementById("visibleReports").textContent = `${visibleItems.length} shown`;
}

function createStatusSelect(item) {
  const statuses = ["Lost", "Found", "In Review", "Matched", "Returned"];

  return `
    <select class="browser-default admin-status-select" onchange="updateItemStatus('${escapeHtml(item.adminId)}', this.value)">
      ${statuses.map(status => `
        <option value="${status}" ${item.status === status ? "selected" : ""}>${status}</option>
      `).join("")}
    </select>
  `;
}

function createAdminRow(item) {
  const typeClass = item.type === "Lost" ? "orange darken-2" : "teal";

  return `
    <tr>
      <td>
        <b>${escapeHtml(item.title)}</b>
        <span class="admin-table-subtext">${escapeHtml(item.category)}</span>
        <span class="admin-table-subtext">${escapeHtml(item.description)}</span>
      </td>
      <td><span class="badge ${typeClass} white-text admin-type-badge">${escapeHtml(item.type)}</span></td>
      <td>${escapeHtml(item.location)}</td>
      <td>${escapeHtml(item.date)}</td>
      <td>${createStatusSelect(item)}</td>
      <td>
        <button class="icon-button tooltipped" data-tooltip="Mark as returned" onclick="updateItemStatus('${escapeHtml(item.adminId)}', 'Returned')" aria-label="Mark ${escapeHtml(item.title)} as returned">
          <i class="material-icons">assignment_turned_in</i>
        </button>
        <button class="icon-button danger tooltipped" data-tooltip="Delete local report" onclick="deleteLocalItem('${escapeHtml(item.adminId)}')" aria-label="Delete ${escapeHtml(item.title)}">
          <i class="material-icons">delete</i>
        </button>
      </td>
    </tr>
  `;
}

function renderAdminItems() {
  const items = getAdminItems();
  const visibleItems = items.filter(itemMatchesFilters);
  const tableBody = document.getElementById("adminItemsTable");
  const emptyState = document.getElementById("adminEmptyState");

  updateStats(items, visibleItems);
  renderPotentialMatches(items);

  if (!visibleItems.length) {
    tableBody.innerHTML = "";
    emptyState.classList.remove("hide");
    return;
  }

  emptyState.classList.add("hide");
  tableBody.innerHTML = visibleItems.map(createAdminRow).join("");

  if (window.M) {
    M.Tooltip.init(document.querySelectorAll(".tooltipped"));
  }
}

function updateItemStatus(adminId, status) {
  const statusMap = getStatusMap();
  statusMap[adminId] = status;
  setStatusMap(statusMap);
  renderAdminItems();

  if (window.M) {
    M.toast({ html: "Report status updated.", classes: "teal" });
  }
}

function markItemsAsMatched(lostAdminId, foundAdminId) {
  const statusMap = getStatusMap();
  statusMap[lostAdminId] = "Matched";
  statusMap[foundAdminId] = "Matched";
  setStatusMap(statusMap);
  renderAdminItems();

  if (window.M) {
    M.toast({ html: "Items marked as matched.", classes: "teal" });
  }
}

function deleteLocalItem(adminId) {
  const localKey = adminId.startsWith("lost-") ? LOCAL_LOST_ITEMS_KEY : LOCAL_FOUND_ITEMS_KEY;
  const localItems = getStoredArray(localKey);
  const nextItems = localItems.filter(item => {
    const itemId = createAdminId(adminId.startsWith("lost-") ? "Lost" : "Found", item);
    return itemId !== adminId;
  });

  if (nextItems.length === localItems.length) {
    if (window.M) {
      M.toast({ html: "Demo records cannot be deleted.", classes: "teal" });
    }
    return;
  }

  localStorage.setItem(localKey, JSON.stringify(nextItems));
  renderAdminItems();

  if (window.M) {
    M.toast({ html: "Local report deleted.", classes: "teal" });
  }
}

function resetDemoData() {
  localStorage.removeItem(ADMIN_STATUS_KEY);
  renderAdminItems();

  if (window.M) {
    M.toast({ html: "Admin demo statuses reset.", classes: "teal" });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  })();
 
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }
 
  if (currentUser.role !== "admin") {
    window.location.href = "main.html";
    return;
  }
  /* end auth guard */
 
  if (window.M) {
    M.FormSelect.init(document.querySelectorAll("select"));
    M.updateTextFields();
  }
 
  await loadBackendItems();
  renderAdminItems();
});
 
