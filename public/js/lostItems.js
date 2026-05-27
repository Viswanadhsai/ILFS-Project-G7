const API = "http://localhost:5000/api";
const LOCAL_LOST_ITEMS_KEY = "lostItems";

document.addEventListener("DOMContentLoaded", () => {
  if (window.M) {
    M.FormSelect.init(document.querySelectorAll("select"));
    M.updateTextFields();
  }
});

function clearErrors() {
  document.querySelectorAll(".red-text, .green-text").forEach(el => {
    el.textContent = "";
  });
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

function showToast(message) {
  if (window.M) {
    M.toast({ html: message, classes: "teal" });
  } else {
    alert(message);
  }
}

function saveLostItemLocally(item) {
  const existingItems = JSON.parse(localStorage.getItem(LOCAL_LOST_ITEMS_KEY) || "[]");
  existingItems.unshift(item);
  localStorage.setItem(LOCAL_LOST_ITEMS_KEY, JSON.stringify(existingItems));
}

function showSubmittedPreview(item) {
  document.getElementById("previewTitle").textContent = item.title;
  document.getElementById("previewCategory").textContent = item.category;
  document.getElementById("previewDate").textContent = item.dateLost;
  document.getElementById("previewLocation").textContent = item.location;
  document.getElementById("previewDescription").textContent = item.description;
  document.getElementById("submittedPreview").classList.remove("hide");
}

function resetFormFields() {
  document.getElementById("title").value = "";
  document.getElementById("category").value = "";
  document.getElementById("description").value = "";
  document.getElementById("dateLost").value = "";
  document.getElementById("location").value = "";
  document.getElementById("photo").value = "";

  const filePath = document.querySelector(".file-path");
  if (filePath) filePath.value = "";

  if (window.M) {
    M.updateTextFields();
    M.FormSelect.init(document.querySelectorAll("select"));
    M.textareaAutoResize(document.getElementById("description"));
  }
}

async function submitToBackend(item) {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const res = await fetch(`${API}/lost`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: item.title,
      category: item.category,
      description: item.description,
      date: item.dateLost,
      location: item.location,
      image: item.photoName
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Submission failed.");
  }

  return data;
}

function handleReportLost() {
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const dateLost = document.getElementById("dateLost").value;
  const location = document.getElementById("location").value.trim();
  const photoInput = document.getElementById("photo");
 
  // Validation
  const titleError = document.getElementById("titleError");
  const categoryError = document.getElementById("categoryError");
  const descriptionError = document.getElementById("descriptionError");
  const dateError = document.getElementById("dateError");
  const locationError = document.getElementById("locationError");
 
  titleError.textContent = !title ? "Title is required" : "";
  categoryError.textContent = !category ? "Category is required" : "";
  descriptionError.textContent = !description ? "Description is required" : "";
  dateError.textContent = !dateLost ? "Date lost is required" : "";
  locationError.textContent = !location ? "Location is required" : "";
 
  if (!title || !category || !description || !dateLost || !location) return;
 
  const formError = document.getElementById("formError");
  const formSuccess = document.getElementById("formSuccess");
 
  // ===== NEW: Handle photo upload =====
  if (photoInput.files.length > 0) {
    const file = photoInput.files[0];
    const reader = new FileReader();
 
    reader.onload = (e) => {
      const photoDataUrl = e.target.result; // data:image/jpeg;base64,...
 
      const item = {
        id: "lost-" + Date.now(),
        title,
        category,
        dateLost,
        location,
        description,
        status: "Lost",
        photo: photoDataUrl, // ← STORE THE DATA URL
        posterName: currentUser?.name || "Anonymous",
        posterHandle: currentUser?.email?.split("@")[0] || "user",
        createdAt: new Date().toISOString()
      };
 
      const items = JSON.parse(localStorage.getItem("lostItems") || "[]");
      items.push(item);
      localStorage.setItem("lostItems", JSON.stringify(items));
 
      formSuccess.textContent = "Lost item reported successfully!";
      formError.textContent = "";
 
      // Show preview
      const preview = document.getElementById("submittedPreview");
      document.getElementById("previewTitle").textContent = title;
      document.getElementById("previewCategory").textContent = category;
      document.getElementById("previewDate").textContent = dateLost;
      document.getElementById("previewLocation").textContent = location;
      document.getElementById("previewDescription").textContent = description;
      preview.classList.remove("hide");
 
      // Reset form
      setTimeout(() => {
        document.getElementById("title").value = "";
        document.getElementById("category").value = "";
        document.getElementById("description").value = "";
        document.getElementById("dateLost").value = "";
        document.getElementById("location").value = "";
        photoInput.value = "";
        document.querySelector(".file-path").value = "";
        formSuccess.textContent = "";
        preview.classList.add("hide");
        if (window.M) M.updateTextFields();
      }, 3000);
    };
 
    reader.readAsDataURL(file); // ← Convert file to base64 data URL
  } else {
    // No photo uploaded — still save the item without a photo
    const item = {
      id: "lost-" + Date.now(),
      title,
      category,
      dateLost,
      location,
      description,
      status: "Lost",
      // NO photo property
      posterName: currentUser?.name || "Anonymous",
      posterHandle: currentUser?.email?.split("@")[0] || "user",
      createdAt: new Date().toISOString()
    };
 
    const items = JSON.parse(localStorage.getItem("lostItems") || "[]");
    items.push(item);
    localStorage.setItem("lostItems", JSON.stringify(items));
 
    formSuccess.textContent = "Lost item reported successfully!";
    formError.textContent = "";
 
    // Show preview
    const preview = document.getElementById("submittedPreview");
    document.getElementById("previewTitle").textContent = title;
    document.getElementById("previewCategory").textContent = category;
    document.getElementById("previewDate").textContent = dateLost;
    document.getElementById("previewLocation").textContent = location;
    document.getElementById("previewDescription").textContent = description;
    preview.classList.remove("hide");
 
    // Reset form
    setTimeout(() => {
      document.getElementById("title").value = "";
      document.getElementById("category").value = "";
      document.getElementById("description").value = "";
      document.getElementById("dateLost").value = "";
      document.getElementById("location").value = "";
      photoInput.value = "";
      document.querySelector(".file-path").value = "";
      formSuccess.textContent = "";
      preview.classList.add("hide");
      if (window.M) M.updateTextFields();
    }, 3000);
  }
}
