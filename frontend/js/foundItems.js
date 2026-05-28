const API = "http://localhost:5000/api";
const LOCAL_FOUND_ITEMS_KEY = "foundItems";
const MAX_PHOTO_SIZE_MB = 5;

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

function saveFoundItemLocally(item) {
  const existingItems = JSON.parse(localStorage.getItem(LOCAL_FOUND_ITEMS_KEY) || "[]");
  existingItems.unshift(item);
  localStorage.setItem(LOCAL_FOUND_ITEMS_KEY, JSON.stringify(existingItems));
}

function showSubmittedPreview(item) {
  document.getElementById("previewTitle").textContent = item.title;
  document.getElementById("previewCategory").textContent = item.category;
  document.getElementById("previewDate").textContent = item.dateFound;
  document.getElementById("previewLocation").textContent = item.location;
  document.getElementById("previewDescription").textContent = item.description;
  document.getElementById("submittedPreview").classList.remove("hide");
}

function resetFormFields() {
  document.getElementById("title").value = "";
  document.getElementById("category").value = "";
  document.getElementById("description").value = "";
  document.getElementById("dateFound").value = "";
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

function validateFoundItem({ title, category, description, dateFound, location, photoFile }) {
  let valid = true;

  if (!title) {
    document.getElementById("titleError").textContent = "Item title is required.";
    valid = false;
  } else if (title.length < 3) {
    document.getElementById("titleError").textContent = "Item title must be at least 3 characters.";
    valid = false;
  } else if (title.length > 80) {
    document.getElementById("titleError").textContent = "Item title must be 80 characters or less.";
    valid = false;
  }

  if (!category) {
    document.getElementById("categoryError").textContent = "Please select a category.";
    valid = false;
  }

  if (!description) {
    document.getElementById("descriptionError").textContent = "Description is required.";
    valid = false;
  } else if (description.length < 10) {
    document.getElementById("descriptionError").textContent = "Description must be at least 10 characters.";
    valid = false;
  } else if (description.length > 500) {
    document.getElementById("descriptionError").textContent = "Description must be 500 characters or less.";
    valid = false;
  }

  if (!dateFound) {
    document.getElementById("dateError").textContent = "Date found is required.";
    valid = false;
  } else {
    const selectedDate = new Date(dateFound);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      document.getElementById("dateError").textContent = "Date found cannot be in the future.";
      valid = false;
    }
  }

  if (!location) {
    document.getElementById("locationError").textContent = "Location is required.";
    valid = false;
  } else if (location.length < 3) {
    document.getElementById("locationError").textContent = "Location must be at least 3 characters.";
    valid = false;
  } else if (location.length > 120) {
    document.getElementById("locationError").textContent = "Location must be 120 characters or less.";
    valid = false;
  }

  if (photoFile) {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(photoFile.type)) {
      document.getElementById("photoError").textContent = "Only JPG or PNG files are allowed.";
      valid = false;
    } else if (photoFile.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      document.getElementById("photoError").textContent = `Photo must be smaller than ${MAX_PHOTO_SIZE_MB}MB.`;
      valid = false;
    }
  }

  return valid;
}

async function submitToBackend(item) {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const res = await fetch(`${API}/found`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: item.title,
      category: item.category,
      description: item.description,
      date: item.dateFound,
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

async function handleReportFound() {
  clearErrors();

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const dateFound = document.getElementById("dateFound").value.trim();
  const location = document.getElementById("location").value.trim();
  const photoFile = document.getElementById("photo").files[0];
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isValid = validateFoundItem({
    title,
    category,
    description,
    dateFound,
    location,
    photoFile
  });

  if (!isValid) return;

  const foundItem = {
    id: Date.now(),
    title,
    category,
    description,
    dateFound,
    location,
    photoName: photoFile ? photoFile.name : "",
    status: "Found",
    reporterEmail: user.email || "",
    reporterName: user.name || "",
    createdAt: new Date().toISOString()
  };

  try {
    const backendResponse = await submitToBackend(foundItem);

    if (backendResponse) {
      document.getElementById("formSuccess").textContent = "Found item submitted successfully.";
      showToast("Found item submitted successfully.");
    } else {
      saveFoundItemLocally(foundItem);
      document.getElementById("formSuccess").textContent = "Found item saved successfully for frontend demo.";
      showToast("Found item saved successfully.");
    }
  } catch (err) {
    saveFoundItemLocally(foundItem);
    document.getElementById("formSuccess").textContent = "Found item saved successfully for frontend demo.";
    showToast("Found item saved successfully.");
  }

  showSubmittedPreview(foundItem);
  resetFormFields();
}
