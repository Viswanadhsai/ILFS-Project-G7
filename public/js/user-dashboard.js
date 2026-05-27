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

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
 
function clearErrors(...ids) {
  ids.forEach(id => document.getElementById(id).classList.add("hide"));
}
 
function showMsg(id, text, isError) {
  const el       = document.getElementById(id);
  el.textContent = text;
  el.style.color = isError ? "#b91c1c" : "var(--gold-dark)";
  el.classList.remove("hide");
  setTimeout(() => el.classList.add("hide"), 3000);
}
 
function savePersonalInfo() {
  clearErrors("nameError", "usernameError", "emailError");
 
  const name     = document.getElementById("editName").value.trim();
  const username = document.getElementById("editUsername").value.trim();
  const email    = document.getElementById("editEmail").value.trim();
  let valid = true;
 
  if (!name) {
    document.getElementById("nameError").classList.remove("hide");
    valid = false;
  }
  if (username.length > 0 && (username.length < 3 || /\s/.test(username))) {
    document.getElementById("usernameError").classList.remove("hide");
    valid = false;
  }
  if (!isValidEmail(email)) {
    document.getElementById("emailError").classList.remove("hide");
    valid = false;
  }
  if (!valid) return;
 
  const user    = loadUser();
  user.name     = name;
  user.username = username;
  user.email    = email;
  saveUser(user);
  renderProfileCard(user);
  showMsg("infoMsg", "Changes saved!", false);
}
 
function savePassword() {
  clearErrors("currentPwError", "newPwError", "confirmPwError");
 
  const current = document.getElementById("currentPassword").value;
  const newPw   = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;
  let valid = true;
 
  if (!current) {
    document.getElementById("currentPwError").classList.remove("hide");
    valid = false;
  }
  if (newPw.length < 6) {
    document.getElementById("newPwError").classList.remove("hide");
    valid = false;
  }
  if (newPw !== confirm) {
    document.getElementById("confirmPwError").classList.remove("hide");
    valid = false;
  }
  if (!valid) return;
 
  const user = loadUser();
  if (user.password && user.password !== current) {
    document.getElementById("currentPwError").textContent = "Current password is incorrect.";
    document.getElementById("currentPwError").classList.remove("hide");
    return;
  }
 
  user.password = newPw;
  saveUser(user);
 
  ["currentPassword", "newPassword", "confirmPassword"].forEach(id => {
    document.getElementById(id).value = "";
  });
 
  document.getElementById("pwStrengthFill").style.width = "0";
  document.getElementById("pwStrengthLabel").textContent = "";
  showMsg("pwMsg", "Password updated!", false);
}
 
function checkStrength(pw) {
  let score = 0;
  if (pw.length >= 6)           score++;
  if (pw.length >= 10)          score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
 
  const levels = [
    { label: "",       color: "transparent", pct: "0%"   },
    { label: "Weak",   color: "#ef4444",     pct: "25%"  },
    { label: "Fair",   color: "#f97316",     pct: "50%"  },
    { label: "Good",   color: "#eab308",     pct: "75%"  },
    { label: "Strong", color: "#22c55e",     pct: "100%" }
  ];
 
  const lvl = levels[Math.min(score, 4)];
  document.getElementById("pwStrengthFill").style.width      = lvl.pct;
  document.getElementById("pwStrengthFill").style.background = lvl.color;
  document.getElementById("pwStrengthLabel").textContent     = lvl.label;
}
 
function togglePw(id, btn) {
  const input = document.getElementById(id);
  input.type  = input.type === "password" ? "text" : "password";
  btn.style.opacity = input.type === "text" ? "1" : "0.5";
}
 
function confirmDelete() {
  if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
    localStorage.clear();
    window.location.href = "index.html";
  }
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

  document.getElementById("newPassword").addEventListener("input", e => checkStrength(e.target.value));
});

