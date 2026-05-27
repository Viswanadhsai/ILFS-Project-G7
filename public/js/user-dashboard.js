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

/* ── init ── */

document.addEventListener("DOMContentLoaded", () => {
  const user = loadUser();
  renderProfileCard(user);
});
