const NOTIF_KEY = "tracehub_notifications";

const defaultNotifications = [
  {
    id: 1,
    type: "match",
    icon: "🔍",
    text: "<strong>82% match found!</strong> Your lost <strong>Black Laptop Sleeve</strong> may match a found <strong>Blue Backpack</strong> near the library.",
    time: "2 minutes ago",
    unread: true,
    actions: [{ label: "View Match", primary: true }, { label: "Dismiss" }]
  },
  {
    id: 2,
    type: "match",
    icon: "🔍",
    text: "<strong>61% match found!</strong> Your lost <strong>Student ID Card</strong> may match a found item at the Computer Lab.",
    time: "1 hour ago",
    unread: true,
    actions: [{ label: "View Match", primary: true }, { label: "Dismiss" }]
  },
  {
    id: 3,
    type: "report",
    icon: "📋",
    text: "Your lost item report <strong>Black Laptop Sleeve</strong> has been submitted successfully.",
    time: "3 hours ago",
    unread: true,
    actions: [{ label: "View Report", primary: false }]
  },
  {
    id: 4,
    type: "report",
    icon: "📋",
    text: "A new found item <strong>Blue Backpack</strong> has been reported near the Main Library entrance.",
    time: "5 hours ago",
    unread: false,
    actions: [{ label: "View Item", primary: false }]
  },
  {
    id: 5,
    type: "system",
    icon: "📣",
    text: "<strong>TraceHub tip:</strong> Add detailed descriptions and photos to improve match accuracy.",
    time: "Yesterday",
    unread: false,
    actions: []
  },
  {
    id: 6,
    type: "system",
    icon: "✅",
    text: "Welcome to <strong>TraceHub</strong>! Your account is ready.",
    time: "2 days ago",
    unread: false,
    actions: [{ label: "Get Started", primary: true }]
  }
];

let notifications = [];
let currentFilter = "all";

function loadNotifications() {
  const stored = localStorage.getItem(NOTIF_KEY);
  notifications = stored ? JSON.parse(stored) : [...defaultNotifications];
}

function saveNotifications() {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
}

function getFiltered() {
  if (currentFilter === "all") return notifications;
  return notifications.filter(n => n.type === currentFilter);
}

function updateUnreadCount() {
  const unread = notifications.filter(n => n.unread).length;
  const el     = document.getElementById("unreadCount");
  el.textContent = unread > 0 ? `${unread} unread` : "All caught up";
}

function renderNotifications() {
  const list     = document.getElementById("notifList");
  const empty    = document.getElementById("notifEmpty");
  const filtered = getFiltered();

  updateUnreadCount();

  if (!filtered.length) {
    list.innerHTML = "";
    empty.classList.remove("hide");
    return;
  }

  empty.classList.add("hide");

  list.innerHTML = filtered.map(n => `
    <div class="notif-item ${n.unread ? "unread" : ""}" id="notif-${n.id}" onclick="markRead(${n.id})">
      <div class="notif-dot-wrap"><span class="notif-dot"></span></div>
      <div class="notif-icon">${n.icon}</div>
      <div class="notif-body">
        <p class="notif-text">${n.text}</p>
        <p class="notif-meta">${n.time}</p>
        ${n.actions && n.actions.length ? `
          <div class="notif-actions">
            ${n.actions.map(a => `
              <button class="notif-action-btn ${a.primary ? "primary" : ""}"
                onclick="event.stopPropagation(); handleAction(${n.id}, '${a.label}')">
                ${a.label}
              </button>
            `).join("")}
          </div>
        ` : ""}
      </div>
      <button class="notif-dismiss"
        onclick="event.stopPropagation(); dismissNotif(${n.id})"
        aria-label="Dismiss notification">&times;</button>
    </div>
  `).join("");
}

function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderNotifications();
}

function markRead(id) {
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.unread = false;
    saveNotifications();
    renderNotifications();
  }
}

function dismissNotif(id) {
  notifications = notifications.filter(n => n.id !== id);
  saveNotifications();
  renderNotifications();
}

function markAllRead() {
  notifications.forEach(n => n.unread = false);
  saveNotifications();
  renderNotifications();
}

function clearAll() {
  const filtered    = getFiltered();
  const filteredIds = new Set(filtered.map(n => n.id));
  notifications     = notifications.filter(n => !filteredIds.has(n.id));
  saveNotifications();
  renderNotifications();
}

function handleAction(id, label) {
  markRead(id);
  if (label === "View Match")  window.location.href = "main.html";
  if (label === "View Report") window.location.href = "main.html";
  if (label === "View Item")   window.location.href = "main.html";
  if (label === "Get Started") window.location.href = "report-lost.html";
  if (label === "Dismiss")     dismissNotif(id);
}

document.addEventListener("DOMContentLoaded", () => {
  loadNotifications();
  renderNotifications();
});