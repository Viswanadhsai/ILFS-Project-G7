const API = "http://localhost:3000/api";

function escapeHtml(v) {
  return String(v || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function getInitials(name) {
  return (name || "?").trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ===== GET CURRENT USER ===== */
function getCurrentUser() {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

function saveUserToStorage(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

/* ===== LOAD USER PROFILE FROM MongoDB ===== */
async function loadUserProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return null;
  }

  try {
    const response = await fetch(`${API}/users/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error("Failed to load profile");
    }

    const user = await response.json();
    
    // Update localStorage with latest from MongoDB
    saveUserToStorage({
      id: user._id,
      name: user.name,
      username: user.username || "",
      email: user.email,
      role: user.role
    });

    return user;
  } catch (error) {
    console.error("Error loading profile:", error);
    // Fallback to localStorage
    return getCurrentUser();
  }
}

/* ===== RENDER PROFILE CARD ===== */
function renderProfileCard(user) {
  if (!user) return;
  
  document.getElementById("dashAvatar").textContent = getInitials(user.name);
  document.getElementById("dashName").textContent = user.name || "Guest User";
  document.getElementById("dashUsername").textContent = user.username ? "@" + user.username : "(no username)";
  document.getElementById("dashEmail").textContent = user.email || "";
  document.getElementById("dashRole").textContent = user.role === "admin" ? "Admin" : "Member";

  document.getElementById("editName").value = user.name || "";
  document.getElementById("editUsername").value = user.username || "";
  document.getElementById("editEmail").value = user.email || "";
}

/* ===== SECTION NAVIGATION ===== */
function showSection(name, btn) {
  document.querySelectorAll(".dash-section").forEach(s => s.classList.add("hide"));
  document.querySelectorAll(".dash-qnav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("section-" + name).classList.remove("hide");
  btn.classList.add("active");
}

/* ===== LOGOUT ===== */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

/* ===== REMOVE MOCK DATA - EMPTY ARRAYS ===== */
const demoLostItems = [];    
const demoFoundItems = [];  
const demoMatches = [];      

function statusClass(s) {
  return {
    Lost: "status-lost", Found: "status-found",
    Matched: "status-matched", Returned: "status-returned",
    "In Review": "status-lost"
  }[s] || "status-lost";
}

/* ===== RENDER STATS FROM MONGODB ===== */
function renderStats(lost, found) {
  // Count only REAL data from MongoDB + localStorage
  const resolved = [...lost, ...found].filter(i => i.status === "Returned" || i.status === "Matched").length;
  
  document.getElementById("statLost").textContent = lost.length;
  document.getElementById("statFound").textContent = found.length;
  document.getElementById("statResolved").textContent = resolved;
}

/* ===== RENDER ITEMS ===== */
function renderItems(items, listId, emptyId, dateLabel, dateKey) {
  const list = document.getElementById(listId);
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
        <div class="dash-item-title">${escapeHtml(item.title || item.name)}</div>
        <div class="dash-item-meta"><strong>Category:</strong> ${escapeHtml(item.category)}</div>
        <div class="dash-item-meta"><strong>${dateLabel}:</strong> ${escapeHtml(item[dateKey] || item.date)}</div>
        <div class="dash-item-meta"><strong>Location:</strong> ${escapeHtml(item.location)}</div>
        <div class="dash-item-desc">${escapeHtml(item.description)}</div>
      </div>
      <span class="dash-item-status ${statusClass(item.status)}">${escapeHtml(item.status || "Pending")}</span>
    </div>
  `).join("");
}

/* ===== RENDER MATCHES ===== */
function renderMatches(matches) {
  const list = document.getElementById("matchesList");
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

/* ===== LOAD ITEMS FROM MongoDB ===== */
async function loadUserItems() {
  const token = localStorage.getItem("token");
  if (!token) return { lost: [], found: [] };

  try {
    // Get lost items
    const lostRes = await fetch(`${API}/lost`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const lost = lostRes.ok ? await lostRes.json() : [];

    // Get found items
    const foundRes = await fetch(`${API}/found`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const found = foundRes.ok ? await foundRes.json() : [];

    return {
      lost: lost.map(item => ({
        ...item,
        title: item.name,
        dateLost: item.date
      })),
      found: found.map(item => ({
        ...item,
        title: item.name,
        dateFound: item.date
      }))
    };
  } catch (error) {
    console.error("Error loading items:", error);
    return { lost: [], found: [] };
  }
}

/* ===== VALIDATION ===== */
function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function clearErrors(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hide");
  });
}

function showMsg(id, text, isError) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? "#b91c1c" : "var(--gold-dark)";
  el.classList.remove("hide");
  setTimeout(() => el.classList.add("hide"), 3000);
}

/* ===== SAVE PERSONAL INFO TO MongoDB ===== */
async function savePersonalInfo() {
  clearErrors("nameError", "usernameError", "emailError");

  const name = document.getElementById("editName").value.trim();
  const username = document.getElementById("editUsername").value.trim();
  const email = document.getElementById("editEmail").value.trim();
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

  const token = localStorage.getItem("token");
  if (!token) {
    showMsg("infoMsg", "Please login first", true);
    return;
  }

  try {
    //  SEND TO MongoDB
    const response = await fetch(`${API}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        username: username || null,
        email
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Update failed");
    }

    const updatedUser = await response.json();

    //  SAVE TO localStorage
    saveUserToStorage({
      id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
    });

    renderProfileCard(updatedUser);
    showMsg("infoMsg", "Changes saved to MongoDB!", false);

  } catch (error) {
    showMsg("infoMsg", "Error: " + error.message, true);
  }
}

/* ===== SAVE PASSWORD TO MongoDB ===== */
async function savePassword() {
  clearErrors("currentPwError", "newPwError", "confirmPwError");

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  let valid = true;

  if (!currentPassword) {
    document.getElementById("currentPwError").classList.remove("hide");
    valid = false;
  }
  
  if (newPassword.length < 6) {
    document.getElementById("newPwError").classList.remove("hide");
    valid = false;
  }
  
  if (newPassword !== confirmPassword) {
    document.getElementById("confirmPwError").classList.remove("hide");
    valid = false;
  }

  if (!valid) return;

  const token = localStorage.getItem("token");
  if (!token) {
    showMsg("pwMsg", "Please login first", true);
    return;
  }

  try {
    //  SEND TO BACKEND TO UPDATE MongoDB
    const response = await fetch(`${API}/users/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Password update failed");
    }

    // ✅ Clear form
    ["currentPassword", "newPassword", "confirmPassword"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    document.getElementById("pwStrengthFill").style.width = "0";
    document.getElementById("pwStrengthLabel").textContent = "";
    
    showMsg("pwMsg", "Password updated in MongoDB!", false);

  } catch (error) {
    showMsg("pwMsg", "Error: " + error.message, true);
  }
}

/* ===== PASSWORD STRENGTH ===== */
function checkStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: "", color: "transparent", pct: "0%" },
    { label: "Weak", color: "#ef4444", pct: "25%" },
    { label: "Fair", color: "#f97316", pct: "50%" },
    { label: "Good", color: "#eab308", pct: "75%" },
    { label: "Strong", color: "#22c55e", pct: "100%" }
  ];

  const lvl = levels[Math.min(score, 4)];
  document.getElementById("pwStrengthFill").style.width = lvl.pct;
  document.getElementById("pwStrengthFill").style.background = lvl.color;
  document.getElementById("pwStrengthLabel").textContent = lvl.label;
}

function togglePw(id, btn) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
  btn.style.opacity = input.type === "text" ? "1" : "0.5";
}

/* ===== DELETE ACCOUNT ===== */
async function confirmDelete() {
  if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) {
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    localStorage.clear();
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch(`${API}/users/profile`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error("Failed to delete account");
    }

    localStorage.clear();
    window.location.href = "index.html";
  } catch (error) {
    alert("Error deleting account: " + error.message);
  }
}

/* ===== INITIALIZE PAGE ===== */
document.addEventListener("DOMContentLoaded", async () => {
  //  Load user from MongoDB
  const user = await loadUserProfile();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  renderProfileCard(user);

  // Load REAL items from MongoDB
  const { lost, found } = await loadUserItems();

  //  Render with REAL data only
  renderStats(lost, found);
  renderItems(lost, "lostList", "lostEmpty", "Date lost", "dateLost");
  renderItems(found, "foundList", "foundEmpty", "Date found", "dateFound");
  renderMatches([]);  // ← No mock matches, empty array

  // Password strength checker
  const pwInput = document.getElementById("newPassword");
  if (pwInput) {
    pwInput.addEventListener("input", e => checkStrength(e.target.value));
  }
});