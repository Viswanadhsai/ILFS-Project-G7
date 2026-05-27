const NOTIF_KEY = "tracehub_notifications";
 
const defaultNotifications = [
  {
    id: 1,
    type: "match",
    icon: "🔍",
    text: "<strong>82% match found!</strong> Your lost <strong>Black Laptop Sleeve</strong> may match a found <strong>Blue Backpack</strong> near the library.",
    time: "2 minutes ago",
    unread: true
  },
  {
    id: 2,
    type: "match",
    icon: "🔍",
    text: "<strong>61% match found!</strong> Your lost <strong>Student ID Card</strong> may match a found item at the Computer Lab.",
    time: "1 hour ago",
    unread: true
  },
  {
    id: 3,
    type: "report",
    icon: "📋",
    text: "Your lost item report <strong>Black Laptop Sleeve</strong> has been submitted successfully.",
    time: "3 hours ago",
    unread: true
  },
  {
    id: 4,
    type: "report",
    icon: "📋",
    text: "A new found item <strong>Blue Backpack</strong> has been reported near the Main Library entrance.",
    time: "5 hours ago",
    unread: false
  },
  {
    id: 5,
    type: "system",
    icon: "📣",
    text: "<strong>TraceHub tip:</strong> Add detailed descriptions and photos to improve match accuracy.",
    time: "Yesterday",
    unread: false
  },
  {
    id: 6,
    type: "system",
    icon: "✅",
    text: "Welcome to <strong>TraceHub</strong>! Your account is ready.",
    time: "2 days ago",
    unread: false
  }
];
 
let notifications = [];
 
function loadNotifications() {
  const stored = localStorage.getItem(NOTIF_KEY);
  notifications = stored ? JSON.parse(stored) : [...defaultNotifications];
}
 
function saveNotifications() {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
}
 
function renderNotifications() {
  const list  = document.getElementById("notifList");
  const empty = document.getElementById("notifEmpty");
 
  if (!notifications.length) {
    list.innerHTML = "";
    empty.classList.remove("hide");
    return;
  }
 
  empty.classList.add("hide");
 
  list.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.unread ? "unread" : ""}" id="notif-${n.id}">
      <div class="notif-dot-wrap"><span class="notif-dot"></span></div>
      <div class="notif-icon">${n.icon}</div>
      <div class="notif-body">
        <p class="notif-text">${n.text}</p>
        <p class="notif-meta">${n.time}</p>
      </div>
    </div>
  `).join("");
}
 
document.addEventListener("DOMContentLoaded", () => {
  loadNotifications();
  renderNotifications();
});