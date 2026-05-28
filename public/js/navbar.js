// navbar.js - Centralized navbar for entire TraceHub app with improved styling
// Include this script in every HTML file: <script src="js/navbar.js"></script>

const API = "http://localhost:3000/api";

// Get current logged-in user
function getCurrentUser() {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Get navbar HTML based on user state
function getNavbarHTML() {
  const token = localStorage.getItem("token");
  const user = getCurrentUser();

  // ===== NOT LOGGED IN - LANDING PAGE =====
  if (!token || !user) {
    return `
      <a href="register.html" class="nav-btn nav-btn-outline">Signup</a>
      <a href="login.html" class="nav-btn nav-btn-solid">Login</a>
    `;
  }

  // ===== LOGGED IN - ADMIN USER =====
  if (user.role === "admin") {
    return `
      <a href="main.html" class="nav-btn">Main Page</a>
      <a href="dashboard.html" class="nav-btn">My Dashboard</a>
      <a href="admin.html" class="nav-btn">Admin Panel</a>
      <a href="#" onclick="handleLogout(); return false;" class="nav-btn nav-btn-logout">Logout</a>
    `;
  }

  // ===== LOGGED IN - REGULAR USER =====
  return `
    <a href="main.html" class="nav-btn">Main Page</a>
    <a href="report-lost.html" class="nav-btn">Report Lost</a>
    <a href="report-found.html" class="nav-btn">Report Found</a>
    <a href="dashboard.html" class="nav-btn">My Dashboard</a>
    <a href="#" onclick="handleLogout(); return false;" class="nav-btn nav-btn-logout">Logout</a>
  `;
}

// Handle logout
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// Initialize navbar on page load
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("navbar-container");
  if (container) {
    container.innerHTML = getNavbarHTML();
  }
});