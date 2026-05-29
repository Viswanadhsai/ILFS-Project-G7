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

async function handleReportLost() {
  clearErrors();

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const dateLost = document.getElementById("dateLost").value.trim();
  const location = document.getElementById("location").value.trim();
  const photoFile = document.getElementById("photo").files[0];
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  let valid = true;

  if (!title) {
    document.getElementById("titleError").textContent = "Item title is required.";
    valid = false;
  }

  if (!category) {
    document.getElementById("categoryError").textContent = "Please select a category.";
    valid = false;
  }

  if (!description) {
    document.getElementById("descriptionError").textContent = "Description is required.";
    valid = false;
  }

  if (!dateLost) {
    document.getElementById("dateError").textContent = "Date lost is required.";
    valid = false;
  }

  if (!location) {
    document.getElementById("locationError").textContent = "Location is required.";
    valid = false;
  }

  if (photoFile) {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(photoFile.type)) {
      document.getElementById("photoError").textContent = "Only JPG or PNG files are allowed.";
      valid = false;
    }
  }

  if (!valid) return;

  const lostItem = {
    id: Date.now(),
    title,
    category,
    description,
    dateLost,
    location,
    photoName: photoFile ? photoFile.name : "",
    status: "Lost",
    reporterEmail: user.email || "",
    reporterName: user.name || "",
    createdAt: new Date().toISOString()
  };

  try {
    const backendResponse = await submitToBackend(lostItem);

    if (backendResponse) {
      document.getElementById("formSuccess").textContent = "Lost item submitted successfully.";
      showToast("Lost item submitted successfully.");
    } else {
      saveLostItemLocally(lostItem);
      document.getElementById("formSuccess").textContent = "Lost item saved successfully for frontend demo.";
      showToast("Lost item saved successfully.");
    }
  } catch (err) {
    saveLostItemLocally(lostItem);
    document.getElementById("formSuccess").textContent = "Lost item saved successfully for frontend demo.";
    showToast("Lost item saved successfully.");
  }

  // notify other pages (dashboard) that items changed
  try {
    const bc = new BroadcastChannel("ilfs-items");
    bc.postMessage({ type: "update" });
    bc.close();
  } catch (e) {
    localStorage.setItem("ilfs_refresh", Date.now().toString());
  }

  showSubmittedPreview(lostItem);
  resetFormFields();
}
