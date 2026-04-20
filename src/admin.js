import "./styles/admin.css";

// --- VIEW COMPONENTS ---

function renderAppointmentsTable() {
  const appointments = JSON.parse(localStorage.getItem("gh_appointments")) || [];
  
  let rows = `<tr><td colspan="6" class="empty-row">No appointment requests found.</td></tr>`;
  
  if (appointments.length > 0) {
    rows = appointments.map((app) => `
        <tr>
            <td>${app.studentName}</td>
            <td>${app.date}</td>
            <td>${app.time}</td>
            <td>${app.reason}</td>
            <td><span class="badge ${app.status.toLowerCase()}">${app.status}</span></td>
            <td>
                <button class="icon-btn edit" data-id="${app.id}" title="Approve">
                    <i class="material-icons">check</i>
                </button>
                <button class="icon-btn delete" data-id="${app.id}" title="Cancel">
                    <i class="material-icons">close</i>
                </button>
            </td>
        </tr>
    `).join("");
  }

  return `
    <section class="table-section">
        <div class="table-card">
            <div class="table-header">
                <h3>Active Appointment Requests</h3>
                <input type="text" id="tableSearch" placeholder="Search students...">
            </div>
            <table id="appointmentsTable">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="appointmentsBody">${rows}</tbody>
            </table>
        </div>
    </section>
  `;
}

function renderStudentRecords() {
  return `
    <section class="placeholder-section">
        <div class="table-card">
            <h3><i class="material-icons">people</i> Student Records</h3>
            <p>Database of all registered students in the system.</p>
            <hr>
            <p><i>(Student management logic coming soon)</i></p>
        </div>
    </section>
  `;
}

function renderReports() {
  return `
    <section class="placeholder-section">
        <div class="table-card">
            <h3><i class="material-icons">bar_chart</i> Analytics & Reports</h3>
            <div class="stats-grid">
                <div class="stat-card"><h3>0</h3><p>Total Sessions</p></div>
                <div class="stat-card"><h3>0%</h3><p>Attendance Rate</p></div>
            </div>
        </div>
    </section>
  `;
}

// --- MAIN RENDERER ---

export function renderAdminView(root, session) {
  root.innerHTML = `
    <div class="admin-container">
        <aside class="admin-sidebar">
            <div class="brand">
                <i class="material-icons">gavel</i>
                <span>Admin Panel</span>
            </div>
            <nav id="admin-nav">
                <button class="nav-btn active" data-target="appointments">
                    <i class="material-icons">calendar_today</i> Appointments
                </button>
                <button class="nav-btn" data-target="students">
                    <i class="material-icons">people</i> Student Records
                </button>
                <button class="nav-btn" data-target="reports">
                    <i class="material-icons">bar_chart</i> Reports
                </button>
                <button class="nav-btn logout-btn" id="logoutBtn">
                    <i class="material-icons">power_settings_new</i> Logout
                </button>
            </nav>
        </aside>

        <main class="admin-main">
            <header class="admin-header">
                <div class="header-info">
                    <h1>Guidance Dashboard</h1>
                    <p>Welcome, ${session.name}</p>
                </div>
                <div class="header-actions">
                    <button class="primary-btn" id="refreshData">
                        <i class="material-icons">refresh</i>
                    </button>
                </div>
            </header>

            <div id="admin-dynamic-content">
                ${renderAppointmentsTable()}
            </div>
        </main>
    </div>
  `;

  setupAdminListeners();
}

// --- EVENT LISTENERS ---

function setupAdminListeners() {
  const content = document.getElementById("admin-dynamic-content");
  const navButtons = document.querySelectorAll(".nav-btn:not(.logout-btn)");

  // Tab Navigation Logic
  navButtons.forEach(btn => {
    btn.onclick = () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.getAttribute("data-target");

      if (target === "appointments") {
        content.innerHTML = renderAppointmentsTable();
        attachTableSearch(); // Re-attach search since DOM changed
      } else if (target === "students") {
        content.innerHTML = renderStudentRecords();
      } else if (target === "reports") {
        content.innerHTML = renderReports();
      }
    };
  });

  // Initial Search attachment
  attachTableSearch();

  // Logout Logic
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("gh_session");
    window.location.reload();
  };

  // Refresh Logic
  document.getElementById("refreshData").onclick = () => {
    window.location.reload();
  };
}

// Helper for Search functionality
function attachTableSearch() {
  const searchInput = document.getElementById("tableSearch");
  if (!searchInput) return;

  searchInput.onkeyup = (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll("#appointmentsBody tr");
    rows.forEach((row) => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(term) ? "" : "none";
    });
  };
}