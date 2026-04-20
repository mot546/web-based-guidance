import "./styles/admin.css";

export function renderAdminView(root, session) {
  // 1. Build the Admin Dashboard Structure
  root.innerHTML = `
        <div class="admin-container">
            <aside class="admin-sidebar">
                <div class="brand">
                    <i class="material-icons">gavel</i>
                    <span>Admin Panel</span>
                </div>
                <nav>
                    <button class="nav-btn active" id="nav-appointments">
                        <i class="material-icons">calendar_today</i> Appointments
                    </button>
                    <button class="nav-btn" id="nav-students">
                        <i class="material-icons">people</i> Student Records
                    </button>
                    <button class="nav-btn" id="nav-reports">
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
                            <tbody id="appointmentsBody">
                                </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    `;

  // 2. Load the initial data into the table
  loadAdminData();

  // 3. Attach Listeners
  setupAdminListeners();
}

function loadAdminData() {
  const tableBody = document.getElementById("appointmentsBody");
  const appointments =
    JSON.parse(localStorage.getItem("gh_appointments")) || [];

  if (appointments.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="empty-row">No appointment requests found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = appointments
    .map(
      (app) => `
        <tr>
            <td>${app.studentName}</td>
            <td>${app.date}</td>
            <td>${app.time}</td>
            <td>${app.reason}</td>
            <td><span class="badge ${app.status.toLowerCase()}">${app.status}</span></td>
            <td>
                <button class="icon-btn edit" onclick="alert('Approve logic goes here')">
                    <i class="material-icons">check</i>
                </button>
                <button class="icon-btn delete" onclick="alert('Cancel logic goes here')">
                    <i class="material-icons">close</i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("");
}

function setupAdminListeners() {
  // Logout Logic
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("gh_session");
    window.location.reload();
  };

  // Search Logic
  document.getElementById("tableSearch").onkeyup = (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll("#appointmentsBody tr");
    rows.forEach((row) => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(term) ? "" : "none";
    });
  };
}
