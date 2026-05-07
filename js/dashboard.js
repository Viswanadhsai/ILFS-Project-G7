const LOCAL_LOST_ITEMS_KEY = "lostItems";

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
  return [...localItems, ...demoLostItems];
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

function createItemCard(item, dateLabel, dateValue) {
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
  list.innerHTML = items.map(item => createItemCard(item, dateLabel, item[dateKey])).join("");
}

function renderItems() {
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const lostItems = getLostItems().filter(item => itemMatchesSearch(item, searchTerm));
  const foundItems = demoFoundItems.filter(item => itemMatchesSearch(item, searchTerm));

  renderItemGroup(lostItems, "lostItemsList", "lostEmptyState", "lostCount", "Date lost", "dateLost");
  renderItemGroup(foundItems, "foundItemsList", "foundEmptyState", "foundCount", "Date found", "dateFound");
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

document.addEventListener("DOMContentLoaded", () => {
  if (window.M) {
    M.Tooltip.init(document.querySelectorAll(".tooltipped"));
    M.updateTextFields();
  }

  renderItems();
});
