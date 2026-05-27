function escapeHtml(v) {
  return String(v || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function getInitials(name) {
  return (name || "?").trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ── load and save user ── */

function loadUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
}

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

/* ── render profile card with user data ── */

function renderProfileCard(user) {
  document.getElementById("dashAvatar").textContent   = getInitials(user.name);
  document.getElementById("dashName").textContent     = user.name     || "Guest User";
  document.getElementById("dashUsername").textContent = user.username ? "@" + user.username : "";
  document.getElementById("dashEmail").textContent    = user.email    || "";
  document.getElementById("dashRole").textContent     = user.role === "admin" ? "Admin" : "Member";

  document.getElementById("editName").value     = user.name     || "";
  document.getElementById("editUsername").value = user.username || "";
  document.getElementById("editEmail").value    = user.email    || "";
}

/* ── section navigation ── */

function showSection(name, btn) {
  document.querySelectorAll(".dash-section").forEach(s => s.classList.add("hide"));
  document.querySelectorAll(".dash-qnav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("section-" + name).classList.remove("hide");
  btn.classList.add("active");
}

/* ── logout ── */

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

const LOCAL_LOST_KEY  = "lostItems";
const LOCAL_FOUND_KEY = "foundItems";
 
const demoLostItems = [
  { title: "Black Laptop Sleeve", category: "Electronics", dateLost: "2026-05-03", location: "Library study area",    description: "Black zip laptop sleeve with charger pocket.",             status: "Lost"    },
  { title: "Student ID Card",     category: "Documents",   dateLost: "2026-05-02", location: "Cafeteria",             description: "Student card in a clear plastic holder.",                status: "Matched" }
];
 
const demoFoundItems = [
  { title: "Blue Backpack", category: "Bag", dateFound: "2026-05-04", location: "Main library entrance", description: "Blue backpack with a water bottle in the side pocket.", status: "Found" }
];
 
const demoMatches = [
  { score: 82, lost: "Black Laptop Sleeve", found: "Blue Backpack", reason: "same category, 2 shared keywords", lostLoc: "Library study area",  foundLoc: "Main library entrance" },
  { score: 61, lost: "Student ID Card",     found: "Car Keys",      reason: "similar location, date range fits", lostLoc: "Cafeteria",           foundLoc: "Computer lab"          }
];
 
function statusClass(s) {
  return {
    Lost: "status-lost", Found: "status-found",
    Matched: "status-matched", Returned: "status-returned",
    "In Review": "status-lost"
  }[s] || "status-lost";
}
 
function renderStats(lost, found) {
  const resolved = [...lost, ...found].filter(i => i.status === "Returned" || i.status === "Matched").length;
  document.getElementById("statLost").textContent     = lost.length;
  document.getElementById("statFound").textContent    = found.length;
  document.getElementById("statResolved").textContent = resolved;
}
 
function renderItems(items, listId, emptyId, dateLabel, dateKey) {
  const list  = document.getElementById(listId);
  const empty = document.getElementById(emptyId);
 
  if (!items.length) {
    list.innerHTML = "";
    empty.classList.remove("hide");
    return;
  }
 
  empty.classList.add("hide");
 
  list.innerHTML = items.map(item => `
    <div class="dash-item-card">
      <div class="dash-item-info">
        <div class="dash-item-title">${escapeHtml(item.title)}</div>
        <div class="dash-item-meta"><strong>Category:</strong> ${escapeHtml(item.category)}</div>
        <div class="dash-item-meta"><strong>${dateLabel}:</strong> ${escapeHtml(item[dateKey])}</div>
        <div class="dash-item-meta"><strong>Location:</strong> ${escapeHtml(item.location)}</div>
        <div class="dash-item-desc">${escapeHtml(item.description)}</div>
      </div>
      <span class="dash-item-status ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
    </div>
  `).join("");
}
 
function renderMatches(matches) {
  const list  = document.getElementById("matchesList");
  const empty = document.getElementById("matchesEmpty");
 
  if (!matches.length) {
    list.innerHTML = "";
    empty.classList.remove("hide");
    return;
  }
 
  empty.classList.add("hide");
 
  list.innerHTML = matches.map(m => `
    <div class="dash-match-card">
      <span class="dash-match-score">${m.score}% match</span>
      <div class="dash-match-title">${escapeHtml(m.lost)} &amp; ${escapeHtml(m.found)}</div>
      <div class="dash-match-reason">${escapeHtml(m.reason)}</div>
      <div class="dash-match-loc">
        <strong>Lost near:</strong> ${escapeHtml(m.lostLoc)} &middot;
        <strong>Found near:</strong> ${escapeHtml(m.foundLoc)}
      </div>
    </div>
  `).join("");
}
 
/* ── init ── */
 
document.addEventListener("DOMContentLoaded", () => {
  const user  = loadUser();
  const lost  = [...(JSON.parse(localStorage.getItem(LOCAL_LOST_KEY)  || "[]")), ...demoLostItems];
  const found = [...(JSON.parse(localStorage.getItem(LOCAL_FOUND_KEY) || "[]")), ...demoFoundItems];
  renderProfileCard(user);
  renderStats(lost, found);
  renderItems(lost,  "lostList",  "lostEmpty",  "Date lost",  "dateLost");
  renderItems(found, "foundList", "foundEmpty", "Date found", "dateFound");
  renderMatches(demoMatches);
});

