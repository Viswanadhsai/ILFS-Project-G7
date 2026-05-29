const LOCAL_CLAIMS_KEY = "claims";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getStoredClaims() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CLAIMS_KEY) || "[]");
  } catch (err) {
    return [];
  }
}

function saveStoredClaims(claims) {
  localStorage.setItem(LOCAL_CLAIMS_KEY, JSON.stringify(claims));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch (err) {
    return {};
  }
}

function clearClaimMessages() {
  document.querySelectorAll(".red-text, .green-text").forEach(el => {
    el.textContent = "";
  });
}

function populateClaimForm() {
  const params = new URLSearchParams(window.location.search);
  const user = getCurrentUser();

  document.getElementById("itemTitle").value = params.get("itemTitle") || "";
  document.getElementById("category").value = params.get("category") || "";
  document.getElementById("location").value = params.get("location") || "";
  document.getElementById("matchTitle").value = params.get("matchTitle") || "";
  document.getElementById("claimantName").value = user.name || "";
  document.getElementById("claimantEmail").value = user.email || "";

  if (window.M) {
    M.updateTextFields();
    M.textareaAutoResize(document.getElementById("proof"));
  }
}

function createClaimCard(claim) {
  return `
    <div class="claim-card">
      <span class="status-chip">${escapeHtml(claim.status)}</span>
      <h6><b>${escapeHtml(claim.itemTitle)}</b></h6>
      <p class="grey-text text-darken-1">${escapeHtml(claim.category)} | ${escapeHtml(claim.location)}</p>
      ${claim.matchTitle ? `<p><b>Related lost report:</b> ${escapeHtml(claim.matchTitle)}</p>` : ""}
      <p><b>Claimant:</b> ${escapeHtml(claim.claimantName)} (${escapeHtml(claim.claimantEmail)})</p>
      <p><b>Proof:</b> ${escapeHtml(claim.proof)}</p>
      <p class="grey-text text-darken-1"><b>Submitted:</b> ${escapeHtml(new Date(claim.createdAt).toLocaleString())}</p>
    </div>
  `;
}

function renderClaims() {
  const claims = getStoredClaims();
  const claimsList = document.getElementById("claimsList");
  const emptyState = document.getElementById("claimsEmptyState");
  const claimCount = document.getElementById("claimCount");

  claimCount.textContent = `${claims.length} total`;

  if (!claims.length) {
    claimsList.innerHTML = "";
    emptyState.classList.remove("hide");
    return;
  }

  emptyState.classList.add("hide");
  claimsList.innerHTML = claims.map(createClaimCard).join("");
}

function submitClaim() {
  clearClaimMessages();

  const itemTitle = document.getElementById("itemTitle").value.trim();
  const category = document.getElementById("category").value.trim();
  const location = document.getElementById("location").value.trim();
  const matchTitle = document.getElementById("matchTitle").value.trim();
  const claimantName = document.getElementById("claimantName").value.trim();
  const claimantEmail = document.getElementById("claimantEmail").value.trim();
  const proof = document.getElementById("proof").value.trim();

  let valid = true;

  if (!itemTitle) {
    document.getElementById("itemTitleError").textContent = "Item title is required.";
    valid = false;
  }

  if (!claimantName) {
    document.getElementById("claimantNameError").textContent = "Your name is required.";
    valid = false;
  }

  if (!claimantEmail) {
    document.getElementById("claimantEmailError").textContent = "Your email is required.";
    valid = false;
  }

  if (!proof || proof.length < 10) {
    document.getElementById("proofError").textContent = "Please provide at least 10 characters of proof.";
    valid = false;
  }

  if (!valid) return;

  const claims = getStoredClaims();
  claims.unshift({
    id: Date.now(),
    itemTitle,
    category,
    location,
    matchTitle,
    claimantName,
    claimantEmail,
    proof,
    status: "Pending Review",
    createdAt: new Date().toISOString()
  });

  saveStoredClaims(claims);
  document.getElementById("claimSuccess").textContent = "Claim submitted successfully.";
  document.getElementById("proof").value = "";

  if (window.M) {
    M.toast({ html: "Claim submitted successfully.", classes: "teal" });
    M.updateTextFields();
  }

  renderClaims();
}

document.addEventListener("DOMContentLoaded", () => {
  populateClaimForm();
  renderClaims();
});
