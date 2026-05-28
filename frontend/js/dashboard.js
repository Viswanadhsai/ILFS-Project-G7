const LOCAL_LOST_ITEMS_KEY = "lostItems";
const LOCAL_FOUND_ITEMS_KEY = "foundItems";
const API = "http://localhost:5000/api";
let backendLostItems = [];
let backendFoundItems = [];

const demoLostItems = [
  {
    title: "Black Laptop Sleeve",
    category: "Electronics",
    dateLost: "2026-05-03",
    location: "Library study area",
    description: "Black zip laptop sleeve with charger pocket.",
    status: "Lost"
  },
  {
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
    title: "Blue Backpack",
    category: "Bag",
    dateFound: "2026-05-04",
    location: "Main library entrance",
    description: "Blue backpack with a water bottle in the side pocket.",
    status: "Found"
  },
  {
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

function getLostItems() {
  const localItems = JSON.parse(localStorage.getItem(LOCAL_LOST_ITEMS_KEY) || "[]");
  return [...backendLostItems, ...localItems, ...demoLostItems];
}

function getFoundItems() {
  const localItems = JSON.parse(localStorage.getItem(LOCAL_FOUND_ITEMS_KEY) || "[]");
  return [...backendFoundItems, ...localItems, ...demoFoundItems];
}

function mapBackendLostItem(item) {
  return {
    id: item._id,
    title: item.name,
    category: item.category,
    dateLost: item.date,
    location: item.location,
    description: item.description || "",
    status: item.status || "Lost"
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
    status: item.status || "Found"
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

function itemMatchesSearch(item, searchTerm) {
  const searchableText = [
    item.title,
    item.category,
    item.location,
    item.description,
    item.status
  ].join(" ").toLowerCase();

  return searchableText.includes(searchTerm);
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

  return {
    lostItem,
    foundItem,
    score: Math.max(0, Math.min(score, 100)),
    reasons
  };
}

function getPotentialMatches(lostItems, foundItems) {
  return lostItems
    .flatMap(lostItem => foundItems.map(foundItem => scorePotentialMatch(lostItem, foundItem)))
    .filter(match => match.score >= 45)
    .sort((first, second) => second.score - first.score)
    .slice(0, 4);
}

function createClaimUrl(item, matchTitle = "") {
  const params = new URLSearchParams({
    itemTitle: item.title || "",
    category: item.category || "",
    location: item.location || "",
    matchTitle
  });

  return `claims.html?${params.toString()}`;
}

function createMatchCard(match) {
  const reasonText = match.reasons.length ? match.reasons.join(", ") : "possible text match";
  const claimUrl = createClaimUrl(match.foundItem, match.lostItem.title);

  return `
    <div class="match-card">
      <span class="match-score">${match.score}% match</span>
      <h6><b>${escapeHtml(match.lostItem.title)}</b> may match <b>${escapeHtml(match.foundItem.title)}</b></h6>
      <p class="grey-text text-darken-1">${escapeHtml(reasonText)}</p>
      <p><b>Lost near:</b> ${escapeHtml(match.lostItem.location)}</p>
      <p><b>Found near:</b> ${escapeHtml(match.foundItem.location)}</p>
      <a href="${escapeHtml(claimUrl)}" class="btn teal waves-effect waves-light claim-action">
        <i class="material-icons left">assignment</i>
        Claim Item
      </a>
    </div>
  `;
}

function renderPotentialMatches(lostItems, foundItems) {
  const matches = getPotentialMatches(lostItems, foundItems);
  const list = document.getElementById("potentialMatchesList");
  const emptyState = document.getElementById("matchesEmptyState");
  const count = document.getElementById("potentialMatchCount");

  count.textContent = matches.length;

  if (!matches.length) {
    list.innerHTML = "";
    emptyState.classList.remove("hide");
    return;
  }

  emptyState.classList.add("hide");
  list.innerHTML = matches.map(createMatchCard).join("");
}

function createItemCard(item, dateLabel, dateValue, itemType) {
  const claimButton = itemType === "Found"
    ? `
        <div class="claim-card-action">
          <a href="${escapeHtml(createClaimUrl(item))}" class="btn teal waves-effect waves-light claim-found-button">
            <i class="material-icons left">assignment</i>
            Claim This Item
          </a>
        </div>
      `
    : "";

  return `
    <div class="col s12 m6 l4">
      <div class="card item-card z-depth-1">
        <div class="card-content">
          <span class="status-chip">${escapeHtml(item.status)}</span>
          <span class="card-title teal-text">${escapeHtml(item.title)}</span>
          <p><b>Category:</b> ${escapeHtml(item.category)}</p>
          <p><b>${dateLabel}:</b> ${escapeHtml(dateValue)}</p>
          <p><b>Location:</b> ${escapeHtml(item.location)}</p>
          <p class="item-description">${escapeHtml(item.description)}</p>
          ${claimButton}
        </div>
      </div>
    </div>
  `;
}

function renderItemGroup(items, listId, emptyId, countId, dateLabel, dateKey, itemType) {
  const list = document.getElementById(listId);
  const emptyState = document.getElementById(emptyId);
  const count = document.getElementById(countId);

  count.textContent = items.length;

  if (!items.length) {
    list.innerHTML = "";
    emptyState.classList.remove("hide");
    return;
  }

  emptyState.classList.add("hide");
  list.innerHTML = items.map(item => createItemCard(item, dateLabel, item[dateKey], itemType)).join("");
}

function renderItems() {
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const allLostItems = getLostItems();
  const allFoundItems = getFoundItems();
  const lostItems = allLostItems.filter(item => itemMatchesSearch(item, searchTerm));
  const foundItems = allFoundItems.filter(item => itemMatchesSearch(item, searchTerm));

  renderPotentialMatches(allLostItems, allFoundItems);
  renderItemGroup(lostItems, "lostItemsList", "lostEmptyState", "lostCount", "Date lost", "dateLost", "Lost");
  renderItemGroup(foundItems, "foundItemsList", "foundEmptyState", "foundCount", "Date found", "dateFound", "Found");
}

function togglePanel(panelId) {
  document.getElementById(panelId).classList.toggle("hide");
}

function showProfileComingSoon(event) {
  event.preventDefault();

  if (window.M) {
    M.toast({ html: "User dashboard page will be connected later.", classes: "teal" });
  } else {
    alert("User dashboard page will be connected later.");
  }
}

function sendChatMessage() {
  const chatInput = document.getElementById("chatInput");
  const message = chatInput.value.trim();

  if (!message) return;

  const chatPanel = document.getElementById("chatPanel");
  const messageBox = document.createElement("div");
  messageBox.className = "chat-message outgoing";
  messageBox.textContent = message;
  chatPanel.insertBefore(messageBox, chatPanel.querySelector(".chat-input-row"));
  chatInput.value = "";
}

document.addEventListener("DOMContentLoaded", async () => {
  if (window.M) {
    M.Tooltip.init(document.querySelectorAll(".tooltipped"));
    M.updateTextFields();
  }

  await loadBackendItems();
  renderItems();
});
