const API = "http://localhost:3000/api";
const LOCAL_LOST_ITEMS_KEY = "lostItems";
const MAX_PHOTO_SIZE_MB = 5;

function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}
const currentUser = getCurrentUser();

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
  const token = localStorage.getItem("token");

  if (!token) {
    formError.textContent = "Please login first";
    window.location.href = "login.html";
    return;
  }

  // ===== PHOTO HANDLING =====
  if (photoInput.files.length > 0) {
    const file = photoInput.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const photoDataUrl = e.target.result; // data:image/jpeg;base64,...

      const item = {
        id: "lost-" + Date.now(),
        title,
        category,
        dateLost,
        location,
        description,
        status: "Lost",
        photo: photoDataUrl,
        posterName: currentUser?.name || "Anonymous",
        posterHandle: currentUser?.email?.split("@")[0] || "user",
        createdAt: new Date().toISOString()
      };

      try {
        // ✅ SUBMIT TO BACKEND
        const res = await fetch(`${API}/lost`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: title,
            category,
            location,
            date: dateLost,
            description,
            image: photoDataUrl  // ✅ Send photo to backend
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Submission failed");
        }

        // ✅ Also save to localStorage as backup
        const items = JSON.parse(localStorage.getItem(LOCAL_LOST_ITEMS_KEY) || "[]");
        items.push(item);
        localStorage.setItem(LOCAL_LOST_ITEMS_KEY, JSON.stringify(items));

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

        // ✅ REDIRECT TO MAIN PAGE AFTER 2 SECONDS
        setTimeout(() => {
          window.location.href = "main.html";
        }, 2000);

      } catch (error) {
        formError.textContent = "Error: " + error.message;
      }
    };

    reader.readAsDataURL(file);
  } else {
    // No photo - still submit
    try {
      const res = await fetch(`${API}/lost`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: title,
          category,
          location,
          date: dateLost,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Submission failed");
      }

      // ✅ Also save to localStorage as backup
      const item = {
        id: "lost-" + Date.now(),
        title,
        category,
        dateLost,
        location,
        description,
        status: "Lost",
        posterName: currentUser?.name || "Anonymous",
        posterHandle: currentUser?.email?.split("@")[0] || "user",
        createdAt: new Date().toISOString()
      };

      const items = JSON.parse(localStorage.getItem(LOCAL_LOST_ITEMS_KEY) || "[]");
      items.push(item);
      localStorage.setItem(LOCAL_LOST_ITEMS_KEY, JSON.stringify(items));

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

      // ✅ REDIRECT TO MAIN PAGE AFTER 2 SECONDS
      setTimeout(() => {
        window.location.href = "main.html";
      }, 2000);

    } catch (error) {
      formError.textContent = "Error: " + error.message;
    }
  }
}