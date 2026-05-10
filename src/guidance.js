import "./styles/guidance.css";
import emailjs from "@emailjs/browser";
emailjs.init("6_rFpZEVOh3AVEsIM");
// --- VIEW COMPONENTS ---

export function renderAppointmentsTable() {
  const rawAppointments = JSON.parse(localStorage.getItem("gh_appointments")) || [];
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
                        ? appointments.map(app => `
                        <tr>
                            <td data-label="Student">
                                <div class="user-info">
                                    <span class="user-name">${app.studentName}</span>
                                    <span class="user-email">${app.studentEmail || "no-email"}</span>
                                </div>
                            </td>
                            <td data-label="Category"><span class="type-tag">${app.type}</span></td>
                            <td data-label="Schedule">
                                <div class="date-info">
                                    <div>${app.date}</div>
                                    <small>${app.time}</small>
                                </div>
                            </td>
                            <td data-label="Status"><span class="status-pill ${app.status}">${app.status}</span></td>
                            <td data-label="Actions">
                                <div class="action-btns">
                                    <button class="btn-approve" onclick="openActionModal(${app.id}, 'approved')"><i class="material-icons">check</i></button>
                                    <button class="btn-reject" onclick="openActionModal(${app.id}, 'rejected')"><i class="material-icons">close</i></button>
                                </div>
                            </td>
                        </tr>`).join("")
                        : '<tr><td colspan="5" class="empty-row">No appointment requests found.</td></tr>'
                    }
                </tbody>
            </table>
        </div>
    </div>
  `;
}

function renderConfirmationModal(id, status) {
    const apps = JSON.parse(localStorage.getItem("gh_appointments")) || [];
    const app = apps.find(a => a.id === id);
    const isApprove = status === 'approved';

    return `
        <div id="statusModal" class="modal-overlay">
            <div class="modal-content">
                <h3>${isApprove ? 'Confirm Approval' : 'Reason for Rejection'}</h3>
                <p>Student: <strong>${app.studentName}</strong></p>
                
                <div class="modal-body">
                    ${isApprove ? `
                        <label>Update Schedule (Optional):</label>
                        <input type="time" id="modalTime" value="${app.time}">
                        <label>Notes/Instructions for Student:</label>
                    ` : `
                        <label>Reason for Rejection (Required):</label>
                    `}
                    <textarea id="modalNotes" placeholder="${isApprove ? 'e.g. Please bring your student ID...' : 'e.g. Schedule conflict, please choose another date.'}"></textarea>
                </div>

                <div class="modal-actions">
                    <button class="btn-cancel" onclick="closeModal()">Cancel</button>
                    <button class="btn-confirm ${status}" onclick="processStatusUpdate(${id}, '${status}')">
                        Confirm & Send Email
                    </button>
                </div>
            </div>
        </div>
    `;
}
window.openActionModal = (id, status) => {
    const modalContainer = document.createElement('div');
    modalContainer.id = "modal-root";
    modalContainer.innerHTML = renderConfirmationModal(id, status);
    document.body.appendChild(modalContainer);
};

window.closeModal = () => {
    const modal = document.getElementById("modal-root");
    if (modal) modal.remove();
};

window.processStatusUpdate = async (id, newStatus) => {
    const notes = document.getElementById("modalNotes").value;
    const newTime = document.getElementById("modalTime") ? document.getElementById("modalTime").value : null;

    if (newStatus === 'rejected' && !notes.trim()) {
        alert("Please provide a reason for rejection.");
        return;
    }

    let appointments = JSON.parse(localStorage.getItem("gh_appointments")) || [];
    
    // Find the specific appointment to get student details (Email, Name, etc.)
    const targetApp = appointments.find(a => a.id === id);

    if (!targetApp) {
        alert("Appointment not found.");
        return;
    }

    // Update local data
    appointments = appointments.map((app) => {
        if (app.id === id) {
            return { 
                ...app, 
                status: newStatus,
                counselorNotes: notes,
                time: newTime || app.time, 
                updatedAt: new Date().toISOString()
            };
        }
        return app;
    });

    localStorage.setItem("gh_appointments", JSON.stringify(appointments));
    
    // EmailJS Integration
    const templateParams = {
    subject_line: `Update: Your Appointment is ${newStatus.toUpperCase()}`,
    to_email: targetApp.studentEmail,
    recipient_name: targetApp.studentName,
    header_title: "Appointment Status Update",
    main_message: `Your guidance appointment request has been ${newStatus}. Please see the details and counselor notes below.`,
    app_type: targetApp.serviceType,
    app_date: targetApp.date,
    app_time: newTime || targetApp.time,
    status: newStatus,
    notes: notes || "No additional notes provided."
};

    try {
        // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual EmailJS IDs
        await emailjs.send('service_mtv9cbi', 'template_mublumh', templateParams);
    } catch (error) {
        console.error("Failed to send email:", error);
    }
    
    closeModal();

    // Refresh the table UI
    const content = document.getElementById("admin-dynamic-content");
    if (content) content.innerHTML = renderAppointmentsTable();

    if (window.addNotification) {
        window.addNotification(`Appointment for ${targetApp.studentName} has been ${newStatus}.`);
    }
};

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
                <button id="printStudentBtn" class="btn-secondary">
            <i class="material-icons">print</i> Export PDF
        </button>
            </div>
        </div>
    `;
}
function renderReports() {
  const stats = getAnalytics();
  const total = stats.totalApps || 1;

  return `
    <div class="admin-card">
        <div class="card-header">
            <h2><i class="material-icons">insights</i> Guidance Intelligence Dashboard</h2>
            <button id="printAnalyticsBtn" class="btn-primary">
            <i class="material-icons">download</i> Generate Report
        </button>
        </div>

        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-label">Total Requests</span>
                <span class="stat-value">${stats.totalApps}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Most Active Year</span>
                <span class="stat-value warning">${stats.mostActiveYear}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pending Triage</span>
                <span class="stat-value info">${stats.pending}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Students</span>
                <span class="stat-value success">${stats.totalStudents}</span>
            </div>
        </div>

        <div class="reports-main-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-top: 20px;">
            
            <div class="report-section">
                <h3><i class="material-icons">category</i> Request Type Distribution</h3>
                <div class="chart-container">
                    ${renderChartRow("Academic", stats.academic, (stats.academic/total)*100, "bg-blue")}
                    ${renderChartRow("Personal", stats.personal, (stats.personal/total)*100, "bg-red")}
                    ${renderChartRow("Career", stats.career, (stats.career/total)*100, "bg-green")}
                </div>
            </div>

            <div class="report-section">
                <h3><i class="material-icons">assignment_turned_in</i> Case Resolution Status</h3>
                <div class="chart-container">
                    ${renderChartRow("Approved", stats.statusBreakdown.approved, (stats.statusBreakdown.approved/total)*100, "bg-green")}
                    ${renderChartRow("Pending", stats.statusBreakdown.pending, (stats.statusBreakdown.pending/total)*100, "bg-orange")}
                    ${renderChartRow("Rejected", stats.statusBreakdown.rejected, (stats.statusBreakdown.rejected/total)*100, "bg-red")}
                </div>
            </div>

            <div class="report-section">
                <h3><i class="material-icons">leaderboard</i> Volume by Year Level</h3>
                <div class="chart-container">
                    ${Object.entries(stats.yearBreakdown).map(([year, count]) => 
                        renderChartRow(year, count, (count/total)*100, "bg-purple")
                    ).join('')}
                </div>
            </div>

            <div class="report-section">
                <h3><i class="material-icons">school</i> Volume by Course</h3>
                <div class="chart-container">
                    ${Object.keys(stats.courseBreakdown).length > 0 ? 
                        Object.entries(stats.courseBreakdown).map(([course, count]) => 
                            renderChartRow(course, count, (count/total)*100, "bg-cyan")
                        ).join('') : '<p class="empty-msg">No course data available yet.</p>'
                    }
                </div>
            </div>
            <div class="report-section">
    <h3><i class="material-icons">trending_up</i> Demand Pulse (Daily Avg)</h3>
    <div class="trend-highlight" style="padding: 20px; text-align: center; background: #f8fafc; border-radius: 8px;">
        <span style="font-size: 2.5rem; font-weight: 800; color: #3b82f6;">${stats.avgDaily}</span>
        <p style="margin-top: 5px; color: #64748b; font-size: 0.8rem;">Requests per active day</p>
    </div>
</div>
  `;
}

// Fixed Helper: Corrects the "Full Bar" visual bug
function renderChartRow(label, count, width, colorClass) {
    const barWidth = count > 0 ? width : 0;
    return `
        <div class="chart-row" style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="width: 130px; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${label}</span>
            <div style="flex-grow: 1; height: 10px; background: #f1f5f9; border-radius: 5px; margin: 0 12px; overflow: hidden;">
                <div class="${colorClass}" style="width: ${barWidth}%; height: 100%; border-radius: 5px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);"></div>
            </div>
            <span style="font-weight: bold; width: 25px; text-align: right;">${count}</span>
        </div>
    `;
}

export function renderGuidanceSettings() {
  const savedEmail = localStorage.getItem("admin_notification_email") || "jellopancake213@gmail.com";

  return `
    <div class="glass-card settings-card">
        <div class="card-header">
            <h2><i class="material-icons">settings</i> System Settings</h2>
            <p>Configure notifications and security credentials.</p>
        </div>
        
        <form id="settingsForm" class="settings-form">
            <div class="form-group">
                <label for="adminEmail">Notification Recipient Email</label>
                <input type="email" id="adminEmail" value="${savedEmail}" required>
            </div>
            <button type="submit" class="primary-btn">Update Email</button>
        </form>

        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e2e8f0;">

        <div class="settings-form">
            <div class="form-group">
                <label>Change Administrator Password</label>
                <div class="input-wrapper password-wrapper">
                    <input type="password" id="newPassword" placeholder="Enter new password">
                    <button type="button" class="toggle-password" data-target="newPassword">
                        <i class="material-icons">visibility</i>
                    </button>
                </div>
            </div>

            <div id="otpContainer" class="form-group hidden" style="margin-top: 15px;">
                <label for="otpInput">Enter 6-Digit OTP sent to ${savedEmail}</label>
                <div class="input-wrapper password-wrapper">
                    <input type="password" id="otpInput" maxlength="6" placeholder="000000" style="letter-spacing: 5px; text-align: center; font-weight: bold;">
                    <button type="button" class="toggle-password" data-target="otpInput">
                        <i class="material-icons">visibility</i>
                    </button>
                </div>
                <button type="button" id="verifyOtpBtn" class="primary-btn" style="margin-top: 10px; background: #8b5cf6;">Verify & Save Password</button>
            </div>

            <div class="settings-actions" id="passActionContainer">
                <button type="button" id="requestOtpBtn" class="btn-secondary">Request OTP to Change Password</button>
            </div>
        </div>
    </div>
  `;
}
function renderLogs() {
  // 1. Retrieve all appointment data [cite: 1, 18, 95]
  const appointments = JSON.parse(localStorage.getItem("gh_appointments")) || [];
  
  // 2. Filter for activities that have been processed (have an updatedAt timestamp) 
  const activities = appointments
    .filter(app => app.updatedAt) 
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return `
    <div class="admin-card">
        <div class="card-header">
            <h2><i class="material-icons">history</i> System Activity Logs</h2>
            <p class="subtitle">Tracking all recent status changes and counselor actions.</p>
        </div>
        <div class="log-container">
            ${activities.length > 0 ? activities.map(log => `
                <div class="log-entry">
                    <div class="log-icon ${log.status}">
                        <i class="material-icons">${log.status === 'approved' ? 'check_circle' : 'cancel'}</i>
                    </div>
                    <div class="log-details">
                        <p><strong>${log.status.toUpperCase()}</strong>: Appointment for <span>${log.studentName}</span></p>
                        <small>Action taken on: ${new Date(log.updatedAt).toLocaleString()}</small>
                        ${log.counselorNotes ? `<div class="log-notes">Note: "${log.counselorNotes}"</div>` : ''}
                    </div>
                </div>
            `).join('') : '<p class="empty-msg">No recent activity found.</p>'}
        </div>
    </div>
  `;
}
function setupTableSearch() {
    const searchInput = document.getElementById("tableSearch");
    const table = document.getElementById("adminTable");

    // Safety check: Exit if elements aren't on the screen yet
    if (!searchInput || !table) {
        console.warn("Search initialization skipped: Elements not found in current view.");
        return;
    }

    // Using .oninput for immediate results as the user types
    searchInput.oninput = () => {
        const filter = searchInput.value.toLowerCase().trim();
        const tbody = table.querySelector("tbody");
        
        if (!tbody) return;

        const rows = tbody.querySelectorAll("tr");

        rows.forEach((row) => {
            // 1. Ignore the "No requests found" row if it's visible
            if (row.classList.contains("empty-row")) return;

            // 2. Capture all text in the row (Student Name, Email, Category, etc.)
            const rowText = row.textContent.toLowerCase();

            // 3. Toggle visibility based on the filter
            if (rowText.includes(filter)) {
                row.style.display = ""; // Show row
                row.style.animation = "fadeIn 0.3s ease"; // Optional: adds a smooth transition
            } else {
                row.style.display = "none"; // Hide row
            }
        });

        // 4. Handle "No Results" state visually (Optional)
        const visibleRows = Array.from(rows).filter(r => r.style.display !== "none");
        handleNoSearchResults(tbody, visibleRows.length, filter);
    };
}

function handleNoSearchResults(tbody, visibleCount, filter) {
    let noResultRow = tbody.querySelector(".no-search-results");

    if (visibleCount === 0 && filter !== "") {
        if (!noResultRow) {
            noResultRow = document.createElement("tr");
            noResultRow.className = "no-search-results";
            noResultRow.innerHTML = `
                <td colspan="100%" style="text-align: center; padding: 20px; color: #64748b;">
                    <i class="material-icons" style="vertical-align: middle;">search_off</i>
                    No matches found for "${filter}"
                </td>
            `;
            tbody.appendChild(noResultRow);
        }
    } else if (noResultRow) {
        noResultRow.remove();
    }
}
export function setupStudentSearch() {
  const searchInput = document.getElementById("studentSearch");
  const table = document.getElementById("studentTable");

  if (!searchInput || !table) return;

  searchInput.oninput = () => {
    const filter = searchInput.value.toLowerCase().trim();
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      // Don't filter the "No registered students" row
      if (row.classList.contains("empty-row")) return;

      // row.textContent captures Name, Course, Email, and ID all at once
      const text = row.textContent.toLowerCase();
      
      if (text.includes(filter)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  };
}

// --- MAIN RENDERER ---
export function renderGuidanceView(root, session, onLogout) {
  root.innerHTML = `
    <div class="admin-container">
        <aside class="sidebar" id="admin-sidebar">
            <div class="sidebar-header">
                <div class="brand">
                    <i class="material-icons">gavel</i>
                    <div class="brand-info">
                        <span class="brand-name">Granby Gateway</span>
                        <span class="system-tag">v2.4.0 High-Volume</span>
                    </div>
                </div>
            </div>

            <div class="nav-label">Main Menu</div>
            <div class="sidebar-search">
                <i class="material-icons">search</i>
                <input type="text" id="globalNavSearch" class="search" placeholder="Quick find">
            </div>
            
            <nav id="admin-nav">
                <div class="nav-group">
                    <div class="nav-label">Operations</div>
                    <button class="nav-item active" data-target="appointments">
                        <i class="material-icons">calendar_today</i> 
                        <span>Appointments</span>
                        <span class="badge" id="pendingBadge">0</span>
                    </button>
                    <button class="nav-item" data-target="students">
                        <i class="material-icons">people</i> 
                        <span>Student Records</span>
                    </button>

                    <div class="nav-label">Analysis & Reports</div>
                    <button class="nav-item" data-target="reports">
                        <i class="material-icons">bar_chart</i> 
                        <span>Analytics Dashboard</span>
                    </button>
                    <button class="nav-item" data-target="logs">
                        <i class="material-icons">history</i> 
                        <span>Activity Logs</span>
                    </button>

                    <div class="nav-label">System</div>
                    <button class="nav-item" data-target="settings">
                        <i class="material-icons">settings</i> 
                        <span>Settings</span>
                    </button>
                </div>

                <div class="nav-footer">
                    <button class="nav-item logout" id="adminLogoutBtn">
                        <i class="material-icons">power_settings_new</i> 
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
        </aside>

        <main class="content-area">
            <header class="view-header">
                <div class="header-info">
                    <h1>Guidance Dashboard</h1>
                    <span class="status-badge admin-badge">Good day! ${session.name}</span>
                </div>
                <div class="header-actions">
    <div class="notification-wrapper" style="position: relative;">
        <button class="btn-secondary icon-only" id="notificationBtn" title="Notifications">
            <i class="material-icons">notifications</i>
            <span class="notification-badge" id="notifBadge">0</span>
        </button>
        <div class="notification-dropdown hidden" id="notificationDropdown">
            <div class="notif-header">
                <span>Notifications</span>
                <button id="clearNotifs">Clear All</button>
            </div>
            <div class="notif-body" id="notifBody">
                <p class="empty-notif">No new notifications</p>
            </div>
        </div>
    </div>
</div>
            </header>

            <section id="admin-dynamic-content">
                ${renderAppointmentsTable()}
            </section>
        </main>
    </div>
  `;

  setupAdminListeners(onLogout);
  updateSidebarBadges();
}
function updateSidebarBadges() {
    const apps = JSON.parse(localStorage.getItem("gh_appointments")) || [];
    const pendingCount = apps.filter(a => a.status === 'pending').length;
    const badge = document.getElementById('pendingBadge');
    if (badge) {
        badge.innerText = pendingCount;
        badge.style.display = pendingCount > 0 ? 'block' : 'none';
    }
}
// --- EVENT LISTENERS ---

function setupAdminListeners(onLogout) {
    const content = document.getElementById("admin-dynamic-content");
    const navButtons = document.querySelectorAll(".nav-item:not(.logout)");
    const globalSearch = document.getElementById("globalNavSearch");

    // 1. Tab Navigation Logic
    navButtons.forEach((btn) => {
        btn.onclick = () => {
            navButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const target = btn.getAttribute("data-target");

            if (target === "appointments") {
                content.innerHTML = renderAppointmentsTable();
                setupTableSearch();
            } else if (target === "students") {
                content.innerHTML = renderStudentRecords();
                setupStudentSearch();
            } else if (target === "reports") {
                content.innerHTML = renderReports();
            } else if (target === "settings") {
                content.innerHTML = renderGuidanceSettings();
                attachSettingsListener(); 
            } else if (target === "logs") {
                content.innerHTML = renderLogs();
            }

            if (globalSearch) globalSearch.value = "";

            const sidebar = document.getElementById("admin-sidebar");
            if (window.innerWidth <= 768 && sidebar?.classList.contains("active")) {
                toggleMenu();
            }
        };
    });

    // 2. Global Search Logic
    if (globalSearch) {
        globalSearch.oninput = (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll("#admin-dynamic-content tbody tr");
            rows.forEach((row) => {
                if (row.classList.contains("empty-row")) return;
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(searchTerm) ? "" : "none";
            });
        };
    }

    // 3. Settings Form & OTP Logic
    function attachSettingsListener() {
        const form = document.getElementById("settingsForm");
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const email = document.getElementById("adminEmail").value;
                localStorage.setItem("admin_notification_email", email);
                const btn = form.querySelector("button");
                btn.innerText = "Settings Saved!";
                btn.style.background = "#10b981";
                setTimeout(() => {
                    btn.innerText = "Save Configurations";
                    btn.style.background = "";
                }, 2000);
            };
        }

        let generatedOTP = null;
        const requestBtn = document.getElementById("requestOtpBtn");
        const verifyBtn = document.getElementById("verifyOtpBtn");
        const otpContainer = document.getElementById("otpContainer");
        const newPassInput = document.getElementById("newPassword");
        const otpInput = document.getElementById("otpInput");

        if (requestBtn) {
            requestBtn.onclick = async () => {
                const newPass = newPassInput.value;
                if (newPass.length < 8) return alert("Password must be at least 8 characters long.");

                const session = JSON.parse(localStorage.getItem("gh_user_session"));
                const savedNotification = localStorage.getItem("admin_notification_email");
                const recipientEmail = savedNotification || (session ? session.email : "jellopancake213@gmail.com");

                generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
                
                const now = new Date();
                const expiryTime = new Date(now.getTime() + 15 * 60000).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });

                const templateParams = {
                    to_email: recipientEmail,
                    otp_code: generatedOTP,   
                    time: expiryTime
                };

                requestBtn.innerText = "Sending OTP...";
                requestBtn.disabled = true;

                try {
                    await emailjs.send('service_mtv9cbi', 'template_gbmoria', templateParams);
                    alert(`OTP Sent to ${recipientEmail}`);
                    otpContainer.classList.remove("hidden");
                    requestBtn.classList.add("hidden");
                } catch (error) {
                    console.error("EmailJS Error:", error);
                    alert("Failed to send OTP.");
                    requestBtn.disabled = false;
                    requestBtn.innerText = "Request OTP to Change Password";
                }
            };
        }

        if (verifyBtn) {
            verifyBtn.onclick = () => {
                if (otpInput.value.trim() === generatedOTP) {
                    const users = JSON.parse(localStorage.getItem("gh_users")) || [];
                    const adminIndex = users.findIndex(u => u.role === 'guidance');
                    
                    if (adminIndex !== -1) {
                        users[adminIndex].pass = newPassInput.value;
                        localStorage.setItem("gh_users", JSON.stringify(users));

                        const session = JSON.parse(localStorage.getItem("gh_user_session"));
                        if (session) {
                            session.pass = newPassInput.value;
                            localStorage.setItem("gh_user_session", JSON.stringify(session));
                        }

                        alert("Success! Your password has been updated.");
                        otpContainer.classList.add("hidden");
                        newPassInput.value = "";
                        otpInput.value = "";
                        requestBtn.classList.remove("hidden");
                        requestBtn.disabled = false;
                        requestBtn.innerText = "Request OTP to Change Password";
                    }
                } else {
                    alert("Invalid OTP code.");
                }
            };
        }

        const toggleButtons = document.querySelectorAll(".settings-card .toggle-password");
        toggleButtons.forEach((btn) => {
            btn.onclick = () => {
                const targetId = btn.getAttribute("data-target");
                const input = document.getElementById(targetId);
                const icon = btn.querySelector("i");
                if (input.type === "password") {
                    input.type = "text";
                    icon.innerText = "visibility_off";
                } else {
                    input.type = "password";
                    icon.innerText = "visibility";
                }
            };
        });
    }

    // 4. Notification System Logic
    const notifBtn = document.getElementById("notificationBtn");
    const notifDropdown = document.getElementById("notificationDropdown");
    const notifBadge = document.getElementById("notifBadge");
    const notifBody = document.getElementById("notifBody");
    const clearNotifs = document.getElementById("clearNotifs");
    const appointments = JSON.parse(localStorage.getItem("gh_appointments")) || [];
    const pendingApps = appointments.filter(app => app.status === "pending");

    
    if (notifBtn) {
        notifBtn.onclick = (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle("hidden");
            if (!notifDropdown.classList.contains("hidden")) {
                notifBadge.style.display = "none";
                notifBadge.innerText = "0";
            }
        };
    }

    // Close notification when clicking outside
    document.addEventListener("click", (e) => {
        if (notifDropdown && !notifDropdown.contains(e.target)) {
            notifDropdown.classList.add("hidden");
        }
    });

    if (clearNotifs) {
        clearNotifs.onclick = () => {
            notifBody.innerHTML = '<p class="empty-notif">No new notifications</p>';
        };
    }

    // Global helper to add a notification from anywhere
    window.addNotification = (message) => {
        const emptyMsg = notifBody.querySelector(".empty-notif");
        if (emptyMsg) emptyMsg.remove();

        const notifItem = document.createElement("div");
        notifItem.className = "notif-item";
        notifItem.innerHTML = `
            <p>${message}</p>
            <small>${new Date().toLocaleTimeString()}</small>
        `;
        notifBody.prepend(notifItem);

        const currentCount = parseInt(notifBadge.innerText || 0);
        notifBadge.innerText = currentCount + 1;
        notifBadge.style.display = "block";
    };
    if (pendingApps.length > 0) {
        window.addNotification(`You have ${pendingApps.length} pending appointment(s) to review.`);
    }

    // 5. Global Action Listeners
    content.addEventListener("click", (e) => {
        if (e.target.closest("#printStudentBtn")) printReport("students");
        if (e.target.closest("#printAnalyticsBtn")) printReport("analytics");
    });

    const logoutBtn = document.getElementById("adminLogoutBtn");
    if (logoutBtn) logoutBtn.onclick = onLogout;
}
function getAnalytics() {
  const apps = JSON.parse(localStorage.getItem("gh_appointments")) || [];
  const users = JSON.parse(localStorage.getItem("gh_users")) || [];

  // Updated yearBreakdown to include Irregular status
  const yearBreakdown = { 
    "1st Year": 0, 
    "2nd Year": 0, 
    "3rd Year": 0, 
    "4th Year": 0,
    "Irregular": 0 
  };
  const courseBreakdown = {};
  const statusBreakdown = { pending: 0, approved: 0, rejected: 0 };
  
  const dailyTrends = {}; 
  const reasonFrequency = {}; 

  apps.forEach(app => {
    // 1. Status Tracking
    if (statusBreakdown[app.status] !== undefined) statusBreakdown[app.status]++;

    // 2. Daily Volume Trend
    const date = new Date(app.createdAt || Date.now()).toLocaleDateString();
    dailyTrends[date] = (dailyTrends[date] || 0) + 1;



    // 4. Demographic cross-referencing
    const student = users.find(u => u.email === app.studentEmail);
    if (student) {
      if (student.yearLevel && yearBreakdown[student.yearLevel] !== undefined) {
        yearBreakdown[student.yearLevel]++;
      }
      if (student.course) {
        courseBreakdown[student.course] = (courseBreakdown[student.course] || 0) + 1;
      }
    }
  });

  const dates = Object.keys(dailyTrends);
  const avgDaily = dates.length ? (apps.length / dates.length).toFixed(1) : 0;

  // Notification Logic
const notifBtn = document.getElementById("notificationBtn");
const notifDropdown = document.getElementById("notificationDropdown");
const notifBadge = document.getElementById("notifBadge");
const notifBody = document.getElementById("notifBody");

if (notifBtn) {
    notifBtn.onclick = (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle("hidden");
        // Reset badge when opened
        notifBadge.style.display = "none";
    };
}

// Close dropdown when clicking outside
document.addEventListener("click", () => {
    if (notifDropdown) notifDropdown.classList.add("hidden");
});

// Function to add a notification (call this whenever an action happens)
window.addNotification = (message) => {
    const emptyMsg = notifBody.querySelector(".empty-notif");
    if (emptyMsg) emptyMsg.remove();

    const notifItem = document.createElement("div");
    notifItem.className = "notif-item";
    notifItem.innerHTML = `
        <p>${message}</p>
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    notifBody.prepend(notifItem);

    notifBadge.innerText = parseInt(notifBadge.innerText || 0) + 1;
    notifBadge.style.display = "block";
};

  return {
    totalApps: apps.length,
    approved: statusBreakdown.approved,
    pending: statusBreakdown.pending,
    totalStudents: users.filter(u => u.role === "student").length,
    // Safely handling type checks with optional chaining
    academic: apps.filter(a => a.type?.toLowerCase().includes("academic")).length,
    personal: apps.filter(a => a.type?.toLowerCase().includes("personal")).length,
    career: apps.filter(a => a.type?.toLowerCase().includes("career")).length,
    yearBreakdown,
    courseBreakdown,
    statusBreakdown,
    reasonFrequency,
    avgDaily,
    mostActiveYear: Object.keys(yearBreakdown).reduce((a, b) => 
      yearBreakdown[a] > yearBreakdown[b] ? a : b, "N/A"
    )
  };
}

export function printReport(type) {
  const stats = getAnalytics();
  const allUsers = JSON.parse(localStorage.getItem("gh_users")) || [];
  const students = allUsers.filter((user) => user.role === "student");

  let printContent = "";

  if (type === "analytics") {
    printContent = `
      <h1>Guidance Intelligence Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      
      <h3>Summary Statistics</h3>
      <table border="1" style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Total Requests</td><td>${stats.totalApps}</td></tr>
          <tr><td>Most Active Year</td><td>${stats.mostActiveYear}</td></tr>
          <tr><td>Total Students</td><td>${stats.totalStudents}</td></tr>
          <tr><td>Daily Average</td><td>${stats.avgDaily}</td></tr>
        </tbody>
      </table>

      <h3>Volume by Category</h3>
      <table border="1" style="width:100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th>Category</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Academic</td><td>${stats.academic}</td><td>${((stats.academic/stats.totalApps)*100).toFixed(1)}%</td></tr>
          <tr><td>Personal</td><td>${stats.personal}</td><td>${((stats.personal/stats.totalApps)*100).toFixed(1)}%</td></tr>
          <tr><td>Career</td><td>${stats.career}</td><td>${((stats.career/stats.totalApps)*100).toFixed(1)}%</td></tr>
        </tbody>
      </table>
    `;
  } else if (type === "students") {
    printContent = `
      <h1>Student Directory Export</h1>
      <p>Total Registered Students: ${students.length}</p>
      <table border="1" style="width:100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th>Student Name</th>
            <th>Year Level</th>
            <th>Course</th>
            <th>Email</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(std => `
            <tr>
              <td>${std.name}</td>
              <td>${std.yearLevel || 'N/A'}</td>
              <td>${std.course || 'N/A'}</td>
              <td>${std.email}</td>
              <td>${std.id}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  const win = window.open("", "PRINT", "height=600,width=800");
  win.document.write(`
    <html>
      <head>
        <title>Export - Granby Gateway</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { margin-top: 10px; }
          th, td { padding: 8px; text-align: left; }
          h1 { color: #1e293b; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}