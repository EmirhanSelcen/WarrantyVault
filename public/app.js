const state = {
  token: localStorage.getItem("wv_token"),
  user: JSON.parse(localStorage.getItem("wv_user") || "null"),
  products: [],
  serviceRecords: []
};

const authView = document.querySelector("#authView");
const dashboardView = document.querySelector("#dashboardView");
const logoutButton = document.querySelector("#logoutButton");
const messageBox = document.querySelector("#message");
const productForm = document.querySelector("#productForm");
const serviceForm = document.querySelector("#serviceForm");
const productList = document.querySelector("#productList");
const serviceList = document.querySelector("#serviceList");
const welcomeText = document.querySelector("#welcomeText");

function showMessage(text, isError = false) {
  messageBox.textContent = text;
  messageBox.classList.toggle("error", isError);
  messageBox.classList.remove("hidden");
  setTimeout(() => messageBox.classList.add("hidden"), 3500);
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, { ...options, headers });
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      renderShell();
    }
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function saveSession(result) {
  state.token = result.token;
  state.user = result.user;
  localStorage.setItem("wv_token", result.token);
  localStorage.setItem("wv_user", JSON.stringify(result.user));
}

function clearSession() {
  state.token = null;
  state.user = null;
  state.products = [];
  state.serviceRecords = [];
  localStorage.removeItem("wv_token");
  localStorage.removeItem("wv_user");
}

function renderShell() {
  const isLoggedIn = Boolean(state.token);
  authView.classList.toggle("hidden", isLoggedIn);
  dashboardView.classList.toggle("hidden", !isLoggedIn);
  logoutButton.classList.toggle("hidden", !isLoggedIn);
  welcomeText.textContent = state.user ? `Signed in as ${state.user.name}` : "";

  if (isLoggedIn) {
    loadDashboard().catch((error) => showMessage(error.message, true));
  }
}

async function loadDashboard() {
  await loadProducts();
  await loadServiceRecords();
  renderProducts();
}

async function loadProducts() {
  const params = new URLSearchParams();
  const search = document.querySelector("#searchInput").value.trim();
  const category = document.querySelector("#categoryFilter").value.trim();
  const expiringSoon = document.querySelector("#expiringFilter").checked;

  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (expiringSoon) params.set("expiringSoon", "true");

  state.products = await api(`/api/products?${params.toString()}`);
  renderProductOptions();
  renderProducts();
}

async function loadServiceRecords() {
  state.serviceRecords = await api("/api/service-records");
  serviceList.innerHTML = state.serviceRecords.length
    ? state.serviceRecords.map(renderServiceRecord).join("")
    : "<p class=\"meta\">No service records yet.</p>";
  renderProducts();
}

function renderProducts() {
  productList.innerHTML = state.products.length
    ? state.products.map(renderProduct).join("")
    : "<p class=\"meta\">No products found.</p>";
}

function renderProduct(product) {
  const warranty = product.warranty || { status: "unknown", daysRemaining: null };
  const productRecords = state.serviceRecords.filter((record) => record.product_id === product.id);

  return `
    <article class="item">
      <div class="item-head">
        <div>
          <h3>${escapeHtml(product.name)}</h3>
          <p class="meta">${escapeHtml(product.brand)} &middot; ${escapeHtml(product.category)}</p>
        </div>
        <span class="status ${warranty.status}">${formatWarranty(warranty)}</span>
      </div>
      <p class="meta">
        Purchased: ${product.purchase_date} &middot; Warranty ends: ${product.warranty_end_date}<br />
        Serial: ${escapeHtml(product.serial_number || "Not entered")}<br />
        ${escapeHtml(product.notes || "")}
      </p>
      <div class="linked-records">
        <div class="linked-records-head">
          <strong>Service history</strong>
          <span>${productRecords.length} record${productRecords.length === 1 ? "" : "s"}</span>
        </div>
        ${
          productRecords.length
            ? productRecords.map(renderProductServiceRecord).join("")
            : "<p class=\"meta\">No service records for this product yet.</p>"
        }
      </div>
      <div class="item-actions">
        <button class="ghost" type="button" onclick="startServiceForProduct(${product.id})">Add service</button>
        <button class="ghost" type="button" onclick="editProduct(${product.id})">Edit</button>
        <button class="ghost" type="button" onclick="deleteProduct(${product.id})">Delete</button>
      </div>
    </article>
  `;
}

function renderProductServiceRecord(record) {
  return `
    <div class="linked-record">
      <div>
        <strong>${record.service_date}</strong>
        <p class="meta">${escapeHtml(record.provider)} &middot; ${Number(record.cost).toFixed(2)}</p>
      </div>
      <p class="meta">${escapeHtml(record.description)}</p>
      <button class="text-button" type="button" onclick="deleteServiceRecord(${record.id})">Delete</button>
    </div>
  `;
}

function renderServiceRecord(record) {
  return `
    <article class="item">
      <div class="item-head">
        <div>
          <h3>${escapeHtml(record.product_name)}</h3>
          <p class="meta">${record.service_date} &middot; ${escapeHtml(record.provider)} &middot; ${Number(record.cost).toFixed(2)}</p>
        </div>
      </div>
      <p class="meta">${escapeHtml(record.description)}</p>
      <div class="item-actions">
        <button class="ghost" type="button" onclick="deleteServiceRecord(${record.id})">Delete</button>
      </div>
    </article>
  `;
}

function renderProductOptions() {
  const select = serviceForm.elements.productId;
  select.innerHTML = state.products
    .map((product) => `<option value="${product.id}">${escapeHtml(product.name)}</option>`)
    .join("");
}

function formatWarranty(warranty) {
  if (warranty.status === "expired") return "Expired";
  if (warranty.status === "expiring-soon") return `${warranty.daysRemaining} days left`;
  if (warranty.status === "active") return `${warranty.daysRemaining} days left`;
  return "Unknown";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

window.editProduct = function editProduct(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product) return;

  productForm.elements.id.value = product.id;
  productForm.elements.name.value = product.name;
  productForm.elements.brand.value = product.brand;
  productForm.elements.category.value = product.category;
  productForm.elements.purchaseDate.value = product.purchase_date;
  productForm.elements.warrantyEndDate.value = product.warranty_end_date;
  productForm.elements.serialNumber.value = product.serial_number || "";
  productForm.elements.notes.value = product.notes || "";
  document.querySelector("#productFormTitle").textContent = "Edit product";
};

window.startServiceForProduct = function startServiceForProduct(id) {
  serviceForm.elements.productId.value = String(id);
  serviceForm.scrollIntoView({ behavior: "smooth", block: "center" });
  serviceForm.elements.serviceDate.focus();
};

window.deleteProduct = async function deleteProduct(id) {
  if (!confirm("Delete this product and its service records?")) return;
  try {
    await api(`/api/products/${id}`, { method: "DELETE" });
    showMessage("Product deleted.");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, true);
  }
};

window.deleteServiceRecord = async function deleteServiceRecord(id) {
  if (!confirm("Delete this service record?")) return;
  try {
    await api(`/api/service-records/${id}`, { method: "DELETE" });
    showMessage("Service record deleted.");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, true);
  }
};

document.querySelector("#registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const result = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(formToObject(event.currentTarget))
    });
    saveSession(result);
    renderShell();
  } catch (error) {
    alert(error.message);
  }
});

document.querySelector("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(formToObject(event.currentTarget))
    });
    saveSession(result);
    renderShell();
  } catch (error) {
    alert(error.message);
  }
});

logoutButton.addEventListener("click", () => {
  clearSession();
  renderShell();
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = formToObject(productForm);
  const id = data.id;
  delete data.id;

  try {
    await api(id ? `/api/products/${id}` : "/api/products", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(data)
    });
    productForm.reset();
    productForm.elements.id.value = "";
    document.querySelector("#productFormTitle").textContent = "Add product";
    showMessage("Product saved.");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, true);
  }
});

serviceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/service-records", {
      method: "POST",
      body: JSON.stringify(formToObject(serviceForm))
    });
    serviceForm.reset();
    showMessage("Service record saved.");
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, true);
  }
});

document.querySelector("#cancelEditButton").addEventListener("click", () => {
  productForm.reset();
  productForm.elements.id.value = "";
  document.querySelector("#productFormTitle").textContent = "Add product";
});

["#searchInput", "#categoryFilter", "#expiringFilter"].forEach((selector) => {
  document.querySelector(selector).addEventListener("input", () => {
    if (state.token) loadDashboard().catch((error) => showMessage(error.message, true));
  });
});

document.querySelector("#refreshButton").addEventListener("click", () => {
  loadDashboard().catch((error) => showMessage(error.message, true));
});

renderShell();
