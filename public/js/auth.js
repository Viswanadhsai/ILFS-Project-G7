const API = "http://localhost:3000/api";
const LOCAL_USERS_KEY = "users";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearErrors() {
  document.querySelectorAll(".red-text").forEach(el => {
    el.textContent = "";
  });
}

function showToast(message) {
  if (window.M) {
    M.toast({ html: message, classes: "teal" });
  } else {
    alert(message);
  }
}

function getLocalUsers() {
  return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function startLocalSession(user) {
  localStorage.setItem("token", `frontend-demo-token-${Date.now()}`);
  localStorage.setItem("user", JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "user"
  }));
}

async function handleLogin() {
  clearErrors();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  let valid = true;

  if (!email) {
    document.getElementById("emailError").textContent = "Email is required.";
    valid = false;
  } else if (!isValidEmail(email)) {
    document.getElementById("emailError").textContent = "Enter a valid email.";
    valid = false;
  }

  if (!password) {
    document.getElementById("passwordError").textContent = "Password is required.";
    valid = false;
  }

  if (!valid) return;

  try {
    const res = await fetch(`${API}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed.");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role || "user"
    }));
    showToast("Login successful.");
    window.location.href = data.role === "admin" ? "admin.html" : "main.html";
  } catch (err) {
    const errorMessage = err.message || "Login failed";
    
    if (errorMessage.includes("Invalid email") || errorMessage.includes("Invalid password")) {
        document.getElementById("loginError").textContent = "Incorrect email or password.";
    } else if (errorMessage.includes("not found")) {
        document.getElementById("loginError").textContent = "Email not registered.";
    } else if (errorMessage.includes("network")) {
        document.getElementById("loginError").textContent = "Network error. Please check your connection.";
    } else {
        document.getElementById("loginError").textContent = errorMessage;
    }
  }
}

async function handleRegister() {
  clearErrors();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  let valid = true;

  if (!name) {
    document.getElementById("nameError").textContent = "Full name is required.";
    valid = false;
  }

  if (!email) {
    document.getElementById("emailError").textContent = "Email is required.";
    valid = false;
  } else if (!isValidEmail(email)) {
    document.getElementById("emailError").textContent = "Enter a valid email.";
    valid = false;
  }

  if (!password || password.length < 6) {
    document.getElementById("passwordError").textContent = "Password must be at least 6 characters.";
    valid = false;
  }

  if (confirmPassword !== password) {
    document.getElementById("confirmError").textContent = "Passwords do not match.";
    valid = false;
  }

  if (!valid) return;

  try {
    const res = await fetch(`${API}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Registration failed.");
    }

    showToast("Registered successfully. Please login.");
    setTimeout(() => window.location.href = "login.html", 1000);
  } catch (err) {
    const users = getLocalUsers();
    const userExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      document.getElementById("registerError").textContent = "This email is already registered for the frontend demo.";
      return;
    }

    users.push({
      id: Date.now(),
      name,
      email,
      password,
      role: "user"
    });

    saveLocalUsers(users);
    showToast("Registered successfully.");
    setTimeout(() => window.location.href = "login.html", 1000);
  }
}
