// ================== Utilities ===================
function getLocalEmployees() {
  return JSON.parse(localStorage.getItem("employees") || "[]");
}

function saveLocalEmployees(data) {
  localStorage.setItem("employees", JSON.stringify(data));
  console.log("Saved to localStorage:", data);
}

// ================== Global Variables ===================
let mockData = typeof mockEmployees !== "undefined" ? mockEmployees : [];
let currentPage = 1;
let itemsPerPage = 10;
let currentEmployees = [];
let filteredEmployees = [];

// ================== DOMContentLoaded ===================
document.addEventListener("DOMContentLoaded", function () {
  const listContainer = document.getElementById("employee-list-container");

  // ========== Load Employees ==========
  function loadEmployees() {
    const localData = getLocalEmployees();
    currentEmployees = localData.length > 0 ? [...localData] : [...mockData];
    filteredEmployees = [...currentEmployees];
  }

  // ========== Render Dashboard ==========
  function renderDashboard() {
    if (!listContainer) return;

    listContainer.innerHTML = "";

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayList = filteredEmployees.slice(startIndex, endIndex);

    if (displayList.length === 0) {
      listContainer.innerHTML = "<p class='ml-3'>No employees found.</p>";
      return;
    }

    displayList.forEach(emp => {
      const cardWrapper = document.createElement("div");
      cardWrapper.className = "col-md-3 mb-4 d-flex";

      cardWrapper.innerHTML = `
        <div class="employee-card shadow-sm p-3 w-500">
          <h5>${emp.firstName} ${emp.lastName}</h5>
          <p><strong>Email:</strong> ${emp.email}</p>
          <p><strong>Department:</strong> ${emp.department}</p>
          <p><strong>Role:</strong> ${emp.role}</p>
          <div class="d-flex justify-content-between">
            <button class="edit-btn" data-id="${emp.id}">Edit</button>
            <button class="delete-btn" data-id="${emp.id}">Delete</button>
          </div>
        </div>
      `;

      listContainer.appendChild(cardWrapper);
    });

    attachEvents();
  }

  // ========== Attach Edit/Delete Events ==========
  function attachEvents() {
    document.querySelectorAll(".delete-btn").forEach(btn =>
      btn.addEventListener("click", function () {
        const id = parseInt(this.getAttribute("data-id"));
        let localData = getLocalEmployees();
        localData = localData.filter(emp => emp.id !== id);
        saveLocalEmployees(localData);
        loadEmployees();
        applyFilters();
      })
    );

    document.querySelectorAll(".edit-btn").forEach(btn =>
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        window.location.href = `add-edit-form.html?id=${id}`;
      })
    );
  }

  // ========== Apply Filters ==========
  function applyFilters() {
    loadEmployees();

    const query = document.getElementById("search-input")?.value.toLowerCase() || "";
    const fname = document.getElementById("filter-firstname")?.value.toLowerCase() || "";
    const dept = document.getElementById("filter-department")?.value.toLowerCase() || "";
    const role = document.getElementById("filter-role")?.value.toLowerCase() || "";
    const sortKey = document.getElementById("sort-select")?.value || "";

    filteredEmployees = currentEmployees.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      return (
        (fullName.includes(query) || emp.email.toLowerCase().includes(query)) &&
        emp.firstName.toLowerCase().includes(fname) &&
        emp.department.toLowerCase().includes(dept) &&
        emp.role.toLowerCase().includes(role)
      );
    });

    if (sortKey) {
      filteredEmployees.sort((a, b) => a[sortKey].localeCompare(b[sortKey]));
    }

    currentPage = 1;
    renderDashboard();
  }

  // ========== Filter Sidebar Toggle ==========
  const filterToggleBtn = document.getElementById("filter-toggle");
  const filterSidebar = document.getElementById("filter-sidebar");

  if (filterToggleBtn && filterSidebar) {
    filterToggleBtn.addEventListener("click", () => {
      filterSidebar.classList.toggle("hidden");
    });
  }

  // ========== Bind Events ==========
  document.getElementById("search-input")?.addEventListener("input", applyFilters);
  document.getElementById("apply-filter")?.addEventListener("click", applyFilters);

  document.getElementById("reset-filter")?.addEventListener("click", () => {
    document.getElementById("filter-firstname").value = "";
    document.getElementById("filter-department").value = "";
    document.getElementById("filter-role").value = "";
    applyFilters();
  });

  document.getElementById("sort-select")?.addEventListener("change", applyFilters);

  document.getElementById("show-count")?.addEventListener("change", function () {
    itemsPerPage = parseInt(this.value);
    currentPage = 1;
    renderDashboard();
  });

  // ========== Form Page Handling ==========
  const form = document.getElementById("employee-form");

  if (form) {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("id");
    let localData = getLocalEmployees();

    if (editId) {
      const emp = localData.find(e => e.id == editId) || mockData.find(e => e.id == editId);
      if (emp) {
        document.getElementById("first-name").value = emp.firstName;
        document.getElementById("last-name").value = emp.lastName;
        document.getElementById("email").value = emp.email;
        document.getElementById("department").value = emp.department;
        document.getElementById("role").value = emp.role;
        document.getElementById("form-title") && (document.getElementById("form-title").textContent = "Edit Employee");
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let localData = getLocalEmployees();
      const allEmployees = [...mockData, ...localData];
      const maxId = allEmployees.length ? Math.max(...allEmployees.map(emp => emp.id)) : 0;

      const data = {
        id: editId ? parseInt(editId) : maxId + 1,
        firstName: document.getElementById("first-name").value.trim(),
        lastName: document.getElementById("last-name").value.trim(),
        email: document.getElementById("email").value.trim(),
        department: document.getElementById("department").value.trim(),
        role: document.getElementById("role").value.trim()
      };

      if (!data.firstName || !data.lastName || !data.email || !data.department || !data.role) {
        alert("All fields are required.");
        return;
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(data.email)) {
        alert("Please enter a valid email.");
        return;
      }

      let updatedLocalData;
      if (editId) {
        updatedLocalData = localData.map(emp => emp.id == editId ? data : emp);
        alert("Employee updated successfully.");
      } else {
        updatedLocalData = [...localData, data];
        alert("New employee added successfully.");
      }

      saveLocalEmployees(updatedLocalData);
      window.location.href = "dashboard.html";
    });

    document.getElementById("cancel-btn")?.addEventListener("click", () => {
      alert("are you sure you want to cancel?")
      window.location.href = "dashboard.html";
    });
  }

  // ========== Initial Load & Render ==========
  loadEmployees();
  renderDashboard();
});
