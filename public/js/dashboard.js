const LOCAL_LOST_ITEMS_KEY = "lostItems";
const LOCAL_FOUND_ITEMS_KEY = "foundItems";
const API = "http://localhost:5000/api";
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
    status: "Lost",
    posterName: "Alex J.",
    posterHandle: "alexj",
    createdAt: "2026-05-03T09:15:00Z"
  },
  {
    id: "demo-lost-2",
    title: "Student ID Card",
    category: "Documents",
    dateLost: "2026-05-02",
    location: "Cafeteria",
    description: "Student card in a clear plastic holder.",
    status: "Lost",
    posterName: "Priya R.",
    posterHandle: "priya_r",
    createdAt: "2026-05-02T14:30:00Z"
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
    status: "Found",
    posterName: "Kim L.",
    posterHandle: "kimlee",
    createdAt: "2026-05-04T11:00:00Z"
  },
  {
    id: "demo-found-2",
    title: "Car Keys",
    category: "Keys",
    dateFound: "2026-05-01",
    location: "Computer lab",
    description: "Key ring with two silver keys and a black tag.",
    status: "Found",
    posterName: "Dan O.",
    posterHandle: "dano_94",
    createdAt: "2026-05-01T16:45:00Z"
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

/* ===== HELPER: timeAgo ===== */
function timeAgo(iso) {
  if (!iso) return 'just now';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  const days = Math.floor(diff / 86400);
  return days === 1 ? 'Yesterday' : days + 'd ago';
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
    status: item.status || "Lost",
    posterName: item.posterName || "Anonymous",
    posterHandle: item.posterHandle || "user"
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
    posterName: item.posterName || "Anonymous",
    posterHandle: item.posterHandle || "user"
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

function createMatchCard(match) {
  const reasonText = match.reasons.length ? match.reasons.join(", ") : "possible text match";

  return `
    <div class="match-card">
      <span class="match-score">${match.score}% match</span>
      <h6><b>${escapeHtml(match.lostItem.title)}</b> may match <b>${escapeHtml(match.foundItem.title)}</b></h6>
      <p class="grey-text text-darken-1">${escapeHtml(reasonText)}</p>
      <p><b>Lost near:</b> ${escapeHtml(match.lostItem.location)}</p>
      <p><b>Found near:</b> ${escapeHtml(match.foundItem.location)}</p>
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

/* ===== NEW: FEED-STYLE CARD RENDERING ===== */
function createItemCard(item, dateLabel, dateValue) {
  const id = 'card-' + (item.id || Math.random().toString(36).slice(2));
  const posterInitials = (item.posterName || 'U').trim()
    .split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const avatarBg = item.status === 'Found' ? '#0F6E56' : '#1F1814';
  const badgeClass = item.status === 'Found' 
    ? 'style="background:#E6F4EA;color:#1A5C2E"'
    : 'style="background:#FFF0E0;color:#7A3D00"';
  const photoHtml = item.photo 
    ? `<img src="${item.photo}" style="width:100%;max-height:200px;object-fit:cover;border-radius:6px;border:1px solid #E8DFD0;margin:10px 0;" />`
    : '';

  return `
    <div style="background:var(--cream-card);border:1px solid #E8DFD0;padding:18px 20px;margin-bottom:0;transition:background .12s;cursor:pointer" id="post-${escapeHtml(id)}" onclick="alert('Engagement features available on /feed.html')">
      <div style="display:flex;gap:14px;align-items:flex-start">
        <!-- Avatar -->
        <div style="width:42px;height:42px;border-radius:50%;background:${avatarBg};color:#DDC9A0;font-family:'Playfair Display', serif;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${posterInitials}
        </div>
        <!-- Post body -->
        <div style="flex:1;min-width:0">
          <!-- Header -->
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;flex-wrap:wrap;font-size:13px">
            <span style="font-size:14px;font-weight:700;color:#2A1F18">${escapeHtml(item.posterName || 'Anonymous')}</span>
            <span style="font-size:12px;color:#6B5D52">@${escapeHtml(item.posterHandle || 'user')}</span>
            <span ${badgeClass} style="padding:2px 9px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.5px">${escapeHtml(item.status)}</span>
            <span style="font-size:12px;color:#6B5D52;margin-left:auto">${timeAgo(item.createdAt || item.date)}</span>
          </div>
          <!-- Title -->
          <div style="font-size:15px;font-weight:700;color:#2A1F18;margin-bottom:3px;font-family:'Playfair Display', serif">${escapeHtml(item.title)}</div>
          <!-- Meta -->
          <div style="font-size:12px;color:#6B5D52;margin-bottom:7px">
            📍 ${escapeHtml(item.location)} &nbsp;·&nbsp; ${dateLabel} ${escapeHtml(dateValue)}
          </div>
          <!-- Description -->
          <div style="font-size:13px;color:#6B5D52;line-height:1.5;margin-bottom:10px">
            ${escapeHtml(item.description)}
          </div>
          <!-- Photo if uploaded -->
          ${photoHtml}
        </div>
      </div>
    </div>
  `;
}

function renderItemGroup(items, listId, emptyId, countId, dateLabel, dateKey) {
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
  // Wrap in a container with proper styling
  const htmlContent = items.map(item => createItemCard(item, dateLabel, item[dateKey])).join("");
  list.innerHTML = `<div style="border:1px solid #E8DFD0;border-radius:6px;overflow:hidden">${htmlContent}</div>`;
}

function renderItems() {
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const allLostItems = getLostItems();
  const allFoundItems = getFoundItems();
  const lostItems = allLostItems.filter(item => itemMatchesSearch(item, searchTerm));
  const foundItems = allFoundItems.filter(item => itemMatchesSearch(item, searchTerm));

  renderPotentialMatches(allLostItems, allFoundItems);
  renderItemGroup(lostItems, "lostItemsList", "lostEmptyState", "lostCount", "Date lost", "dateLost");
  renderItemGroup(foundItems, "foundItemsList", "foundEmptyState", "foundCount", "Date found", "dateFound");
}

function togglePanel(panelId) {
  document.getElementById(panelId).classList.toggle("hide");
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