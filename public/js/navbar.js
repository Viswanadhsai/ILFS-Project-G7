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
      <a href="register.html" class="nav-text-link">Signup</a>
      <a href="login.html" class="nav-text-link">Login</a>
    `;
  }

  // ===== LOGGED IN - ADMIN USER =====
  if (user.role === "admin") {
    return `
      <a href="main.html" class="nav-text-link">Main Page</a>
      <a href="dashboard.html" class="nav-text-link">My Dashboard</a>
      <a href="admin.html" class="nav-text-link">Admin Panel</a>
      <a href="#" onclick="handleLogout(); return false;" class="nav-text-link">Logout</a>
    `;
  }

  // ===== LOGGED IN - REGULAR USER =====
  return `
    <a href="main.html" class="nav-text-link">Main Page</a>
    <a href="report-lost.html" class="nav-text-link">Report Lost</a>
    <a href="report-found.html" class="nav-text-link">Report Found</a>
    <a href="dashboard.html" class="nav-text-link">My Dashboard</a>
    <a href="#" onclick="handleLogout(); return false;" class="nav-text-link">Logout</a>
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