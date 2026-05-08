import "./styles/admin.css";

// --- VIEW COMPONENTS ---

function renderAppointmentsTable() {
  // 1. Get raw data from localStorage
  const rawAppointments =
    JSON.parse(localStorage.getItem("gh_appointments")) || [];

  // 2. Sort: Newest first
  const appointments = [...rawAppointments].sort((a, b) => b.id - a.id);

  return `
    <div class="table-card">
        <div class="table-header-main">
            <h2><i class="material-icons">event_note</i> Appointment Requests</h2>
            <div class="table-tools">
                <input type="text" id="tableSearch" placeholder="Search student name...">
            </div>
        </div>
        <div class="table-responsive">
            <table id="adminTable">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Type</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      appointments.length > 0
                        ? appointments
                            .map(
                              (app) => `
                        <tr>
                            <td data-label="Student">
                                <div class="user-info">
                                    <span class="user-name">${app.studentName}</span>
                                    <span class="user-email">${app.studentEmail || "no-email"}</span>
                                </div>
                            </td>
                            <td data-label="Category">
                                <span class="type-tag">${app.type}</span>
                            </td>
                            <td data-label="Schedule">
                                <div class="date-info">
                                    <div>${app.date}</div>
                                    <small>${app.time}</small>
                                </div>
                            </td>
                            <td data-label="Status">
                                <span class="status-pill ${app.status}">${app.status}</span>
                            </td>
                            <td data-label="Actions">
                                <div class="action-btns">
                                    <button class="btn-approve" onclick="updateAppStatus(${app.id}, 'approved')" title="Approve">
                                        <i class="material-icons">check</i>
                                    </button>
                                    <button class="btn-reject" onclick="updateAppStatus(${app.id}, 'rejected')" title="Reject">
                                        <i class="material-icons">close</i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `,
                            )
                            .join("")
                        : '<tr><td colspan="5" class="empty-row">No appointment requests found.</td></tr>'
                    }
                </tbody>
            </table>
        </div>
    </div>
  `;
} /* Inside src/admin.js */

window.updateAppStatus = (id, newStatus) => {
  // 1. Get the latest data
  let appointments = JSON.parse(localStorage.getItem("gh_appointments")) || [];

  // 2. Update the specific appointment
  appointments = appointments.map((app) => {
    if (app.id === id) return { ...app, status: newStatus };
    return app;
  });

  // 3. Save back to localStorage
  localStorage.setItem("gh_appointments", JSON.stringify(appointments));

  // 4. FIX: Safely find the content area
  const content = document.getElementById("dynamic-content");

  if (content) {
    // Re-render the specific view (Appointments Table)
    content.innerHTML = renderAppointmentsTable();
  } else {
    // Fallback: If the element is missing, refresh the whole page
    // to ensure data sync (useful for edge cases)
    window.location.reload();
  }
};
/* Inside src/admin.js */

function renderStudentRecords() {
  // 1. Get all users and filter for students
  const allUsers = JSON.parse(localStorage.getItem("gh_users")) || [];
  const students = allUsers.filter((user) => user.role === "student");

  return `
        <div class="admin-card">
            <div class="card-header">
                <h2><i class="material-icons">people</i> Student Directory</h2>
                <div class="table-tools">
                    <input type="text" id="studentSearch" placeholder="Search by name, course, or email...">
                </div>
            </div>
            <div class="table-container">
                <table id="studentTable">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Year Level</th>
                            <th>Course & Section</th>
                            <th>Email Address</th>
                            <th>Account ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          students.length > 0
                            ? students
                                .map(
                                  (std) => `
                            <tr>
                                <td class="user-name">
                                    <strong>${std.name}</strong>
                                </td>
                                <td>
                                    <span class="level-badge">${std.yearLevel || "N/A"}</span>
                                </td>
                                <td>
                                    <div class="course-info">
                                        <span class="course-text">${std.course || "N/A"}</span>
                                        <small class="section-text">${std.section ? `- ${std.section}` : ""}</small>
                                    </div>
                                </td>
                                <td>${std.email}</td>
                                <td><code class="id-badge">${std.id}</code></td>
                            </tr>
                        `,
                                )
                                .join("")
                            : '<tr><td colspan="5" class="empty-row">No registered students found.</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
function renderReports() {
  const stats = getAnalytics();

  // Calculate percentages for the progress bars
  const getWidth = (count) =>
    stats.totalApps > 0 ? (count / stats.totalApps) * 100 : 0;

  return `
        <div class="admin-card">
            <div class="card-header">
                <h2><i class="material-icons">analytics</i> System Analytics</h2>
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Requests</span>
                    <span class="stat-value">${stats.totalApps}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Approved</span>
                    <span class="stat-value success">${stats.approved}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Registered Students</span>
                    <span class="stat-value info">${stats.totalStudents}</span>
                </div>
            </div>

            <div class="reports-body">
                <h3>Appointment Type Distribution</h3>
                <div class="chart-mock">
                    <div class="chart-row">
                        <span>Academic</span>
                        <div class="progress-bar"><div class="progress" style="width: ${getWidth(stats.academic)}%"></div></div>
                        <span>${stats.academic}</span>
                    </div>
                    <div class="chart-row">
                        <span>Personal</span>
                        <div class="progress-bar"><div class="progress personal" style="width: ${getWidth(stats.personal)}%"></div></div>
                        <span>${stats.personal}</span>
                    </div>
                    <div class="chart-row">
                        <span>Career</span>
                        <div class="progress-bar"><div class="progress career" style="width: ${getWidth(stats.career)}%"></div></div>
                        <span>${stats.career}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderAdminSettings() {
  // Retrieve currently saved email or use a default
  const savedEmail =
    localStorage.getItem("admin_notification_email") || "jellopancake213@gmail.com";

  return `
        <div class="glass-card settings-card">
            <div class="card-header">
                <h2><i class="material-icons">settings</i> System Settings</h2>
                <p>Configure how the Guidance System handles notifications.</p>
            </div>
            
            <form id="settingsForm" class="settings-form">
                <div class="form-group">
                    <label for="adminEmail">Notification Recipient Email</label>
                    <p class="field-desc">This is where student appointment requests will be sent.</p>
                    <input type="email" id="adminEmail" value="${savedEmail}" required>
                </div>
                
                <div class="settings-actions">
                    <button type="submit" class="primary-btn">Save Configurations</button>
                </div>
            </form>
        </div>
    `;
}
function setupTableSearch() {
  const searchInput = document.getElementById("tableSearch");
  const table = document.getElementById("adminTable");

  // Debugging: Check if elements exist when function runs
  if (!searchInput || !table) {
    console.error("Search elements not found in DOM");
    return;
  }

  console.log("Search listener attached successfully");

  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase().trim();
    const tbody = table.querySelector("tbody");
    const rows = tbody.querySelectorAll("tr");

    rows.forEach((row) => {
      // This captures everything in the row (Name, Email, and Type)
      const rowText = row.textContent.toLowerCase();

      if (rowText.includes(filter)) {
        row.style.display = ""; // Show
      } else {
        row.style.display = "none"; // Hide
      }
    });
  });
}
function setupStudentSearch() {
  const searchInput = document.getElementById("studentSearch");
  const table = document.getElementById("studentTable");

  // Safety check: if the elements aren't there yet, stop
  if (!searchInput || !table) {
    console.error("Student search input or table not found!");
    return;
  }

  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase().trim();
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      // This gets all the text in the row (Name, Email, ID)
      const textValue = row.textContent.toLowerCase();

      if (textValue.includes(filter)) {
        row.style.display = ""; // Show
      } else {
        row.style.display = "none"; // Hide
      }
    });
  });
}

// --- MAIN RENDERER ---
export function renderAdminView(root, session, onLogout) {
  root.innerHTML = `
    <div class="admin-container">

        <aside class="sidebar" id="admin-sidebar">
            <div class="sidebar-header">
                <div class="brand">
                    <i class="material-icons">gavel</i>
                    <span>Admin Panel</span>
                </div>
            </div>
            
            <nav id="admin-nav">
                <button class="nav-item active" data-target="appointments">
                    <i class="material-icons">calendar_today</i> Appointments
                </button>
                <button class="nav-item" data-target="students">
                    <i class="material-icons">people</i> Student Records
                </button>
                <button class="nav-item" data-target="reports">
                    <i class="material-icons">bar_chart</i> Reports
                </button>
                <button class="nav-item" data-target="settings">
                    <i class="material-icons">settings</i> Settings
                </button>
                <button class="nav-item logout" id="adminLogoutBtn">
                    <i class="material-icons">power_settings_new</i> Logout
                </button>
            </nav>
        </aside>

        <div class="sidebar-overlay" id="admin-overlay"></div>

        <main class="content-area">
            <header class="view-header">
                <div class="header-info">
                    <h1>Guidance Dashboard</h1>
                    <span class="status-badge admin-badge">Good day! ${session.name}</span>
                </div>
                <div class="header-actions">
                    <button class="btn-secondary icon-only" id="refreshData" title="Refresh">
                        <i class="material-icons">refresh</i>
                    </button>
                </div>
            </header>

            <section id="admin-dynamic-content">
                ${renderAppointmentsTable()}
            </section>
        </main>
    </div>
  `;

  // Passing onLogout to the listener
  setupAdminListeners(onLogout);
}
// --- EVENT LISTENERS ---

function setupAdminListeners(onLogout) {
  const content = document.getElementById("admin-dynamic-content");
  const navButtons = document.querySelectorAll(".nav-item:not(.logout)");

  // Mobile elements
  const sidebar = document.getElementById("admin-sidebar");
  const overlay = document.getElementById("admin-overlay");
  const menuToggle = document.getElementById("admin-menu-toggle");
  const closeBtn = document.getElementById("admin-close-sidebar");

  const toggleMenu = () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  };

  if (menuToggle) menuToggle.onclick = toggleMenu;
  if (closeBtn) closeBtn.onclick = toggleMenu;
  if (overlay) overlay.onclick = toggleMenu;

  // Tab Navigation Logic
  navButtons.forEach((btn) => {
    btn.onclick = () => {
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.getAttribute("data-target");

      if (target === "appointments") {
        content.innerHTML = renderAppointmentsTable();
        setTimeout(() => {
          setupTableSearch();
        }, 0);
      } else if (target === "students") {
        content.innerHTML = renderStudentRecords();
        setTimeout(() => {
          setupStudentSearch();
        }, 0);
      } else if (target === "reports") {
        content.innerHTML = renderReports();
      } else if (target === "settings") {
        content.innerHTML = renderAdminSettings();
        attachSettingsListener();
      }

      // Auto-close on mobile
      if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
        toggleMenu();
      }
    };
  });
  function attachSettingsListener() {
    const form = document.getElementById("settingsForm");
    if (!form) return;

    form.onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById("adminEmail").value;

      // Save to localStorage
      localStorage.setItem("admin_notification_email", email);

      // Visual feedback
      const btn = form.querySelector("button");
      btn.innerText = "Settings Saved!";
      btn.style.background = "#10b981"; // Success green

      setTimeout(() => {
        btn.innerText = "Save Configurations";
        btn.style.background = ""; // Revert to primary
      }, 2000);
    };
  }

  // Centralized Logout
  document.getElementById("adminLogoutBtn").onclick = onLogout;

  document.getElementById("refreshData").onclick = () =>
    window.location.reload();
}

function getAnalytics() {
  const apps = JSON.parse(localStorage.getItem("gh_appointments")) || [];
  const users = JSON.parse(localStorage.getItem("gh_users")) || [];

  return {
    totalApps: apps.length,
    approved: apps.filter((a) => a.status === "approved").length,
    pending: apps.filter((a) => a.status === "pending").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
    totalStudents: users.filter((u) => u.role === "student").length,
    // Breakdown by type
    academic: apps.filter((a) => a.type === "Academic Guidance").length,
    personal: apps.filter((a) => a.type === "Personal Concern").length,
    career: apps.filter((a) => a.type === "Career Consultation").length,
  };
}
