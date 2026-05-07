import "./styles/student.css";
import emailjs from "@emailjs/browser";
import {
  format,
  startOfMonth,
  endOfMonth,
  getDay,
  getDate,
  isSameMonth,
  isSameDay,
} from "date-fns";

emailjs.init("6_rFpZEVOh3AVEsIM");

// --- VIEW COMPONENTS ---
export function renderRightSidebar(myApps) {
  const now = new Date();

  // 1. Get the single next approved appointment
  const nextApp = myApps
    .filter(
      (a) => a.status.toLowerCase() === "approved" && new Date(a.date) >= now,
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  // 2. Build the Calendar HTML
  const startDay = getDay(startOfMonth(now));
  const totalDays = getDate(endOfMonth(now));
  const padding = Array(startDay).fill('<div class="day-num muted"></div>');
  const days = [];

  for (let d = 1; d <= totalDays; d++) {
    const currentIterationDate = new Date(now.getFullYear(), now.getMonth(), d);
    const isToday = isSameDay(currentIterationDate, now) ? "today" : "";
    const hasEvent = myApps.some(
      (app) =>
        isSameDay(new Date(app.date), currentIterationDate) &&
        app.status.toLowerCase() === "approved",
    )
      ? "has-event"
      : "";

    days.push(`<div class="day-num ${isToday} ${hasEvent}">${d}</div>`);
  }

  // 3. Return the Sidebar HTML string
  return `
        <aside class="right-sidebar">
            <div class="next-up-card">
                <div class="card-tag">NEXT SESSION</div>
                ${
                  nextApp
                    ? `
                    <div class="next-app-info">
                        <h2>${format(new Date(nextApp.date), "MMMM dd, yyyy")}</h2>
                        <p>${nextApp.time} | Guidance Office</p>
                    </div>
                `
                    : `<p style="font-size:0.8rem; color:#94a3b8; margin-top:10px;">No upcoming sessions.</p>`
                }
            </div>

            <div class="calendar-card">
                <div class="calendar-header">
                    <span style="font-weight:800;">${format(now, "MMMM yyyy")}</span>
                </div>
                <div class="calendar-grid">
                    <div class="day-name">S</div><div class="day-name">M</div><div class="day-name">T</div>
                    <div class="day-name">W</div><div class="day-name">T</div><div class="day-name">F</div>
                    <div class="day-name">S</div>
                    ${padding.join("")}${days.join("")}
                </div>
            </div>

            <div class="support-card">
                <h4>Support</h4>
                <p style="font-size: 0.85rem;">Office hours: 8AM - 5PM.</p>
            </div>
        </aside>
    `;
}
export function renderDashboard(session = {}) {
  // 1. Data Retrieval & Filtering
  const appointments =
    JSON.parse(localStorage.getItem("gh_appointments")) || [];
  const myApps = appointments.filter(
    (a) => a.studentId === session.id || a.studentEmail === session.email,
  );

  const pendingCount = myApps.filter((a) => a.status === "pending").length;
  const approvedCount = myApps.filter((a) => a.status === "approved").length;

  // 2. Return the combined view
  return `
        <div class="dashboard-wrapper">
            <div class="dashboard-main-col">
                <div class="dashboard-hero" style="padding-top: 40px;"> 
                    <span class="badge">Student Portal</span>
                    <h1>Welcome Back, ${session.name || "Student"}!</h1>
                    <p>You have <strong>${pendingCount}</strong> pending requests.</p>
                </div>

                <div class="stats-grid-horizontal">
                    <div class="stat-box">
                        <span class="label">Total Sessions</span>
                        <span class="value">${myApps.length}</span>
                    </div>
                    <div class="stat-box">
                        <span class="label">Confirmed</span>
                        <span class="value" style="color: #22c55e;">${approvedCount}</span>
                    </div>
                    <div class="stat-box">
                        <span class="label">Status</span>
                        <span class="value" style="font-size: 0.9rem; color: #3b82f6;">● Verified User</span>
                    </div>
                </div>

                <div class="table-card">
                    <div class="card-header-flex" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h3>Recent History</h3>
                        <button class="view-all-btn" onclick="document.querySelector('[data-target=records]').click()">View All</button>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr><th>Date</th><th>Type</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                ${
                                  myApps
                                    .slice(0, 5)
                                    .map(
                                      (app) => `
                                    <tr>
                                        <td><strong>${format(new Date(app.date), "MMMM dd, yyyy")}</strong></td>
                                        <td>${app.type}</td>
                                        <td><span class="status-pill ${app.status.toLowerCase()}">${app.status}</span></td>
                                    </tr>
                                `,
                                    )
                                    .join("") ||
                                  '<tr><td colspan="3" style="text-align:center; padding:20px;">No appointments yet.</td></tr>'
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            ${renderRightSidebar(myApps)}
        </div>
    `;
}
export function renderBookingForm(session = {}) {
  // 1. Get data for the sidebar
  const allAppointments =
    JSON.parse(localStorage.getItem("gh_appointments")) || [];
  const myApps = allAppointments.filter((a) => a.studentId === session.id);

  return `
    <div class="dashboard-wrapper">
        <div class="dashboard-main-col">
            <div class="dashboard-hero" style="padding-top: 40px;">
                <span class="badge">Scheduling</span>
                <h1>Book an Appointment</h1>
                <p>Select a date and time that works for you.</p>
            </div>

            <div class="table-card booking-container">
                <div id="booking-error" class="error-banner hidden"></div>
                
                <form id="appointment-form" class="styled-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="appType">Counseling Type</label>
                            <select id="appType" required>
                                <option value="">Select a reason...</option>
                                <option value="Academic Guidance">Academic Guidance</option>
                                <option value="Personal Concern">Personal Concern</option>
                                <option value="Career Consultation">Career Consultation</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row flex-row">
                        <div class="form-group">
                            <label for="appDate">Preferred Date</label>
                            <input type="date" id="appDate" required min="${new Date().toISOString().split("T")[0]}">
                        </div>
                        <div class="form-group">
                            <label for="appTime">Preferred Time</label>
                            <input type="time" id="appTime" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="appNotes">Additional Notes (Optional)</label>
                        <textarea id="appNotes" rows="4" placeholder="Briefly describe your concern..."></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="submit" id="submitBooking" class="primary-btn">
                            <i class="material-icons">check_circle</i> Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>

        ${renderRightSidebar(myApps)}
    </div>
  `;
}
export function renderHistory(session = {}) {
  // 1. Data Retrieval
  const allApps = JSON.parse(localStorage.getItem("gh_appointments")) || [];
  const myApps = allApps.filter((app) => app.studentEmail === session.email);

  // 2. Sort by ID (assuming higher ID = newer)
  const sortedApps = [...myApps].sort((a, b) => b.id - a.id);

  return `
        <div class="dashboard-wrapper">
            <div class="dashboard-main-col">
                <div class="dashboard-hero" style="padding-top: 40px;"> 
                    <span class="badge">Records</span>
                    <h1>Appointment History</h1>
                    <p>Track and manage your past and upcoming guidance requests.</p>
                </div>

                <div class="table-card history-container">
                    <div class="history-list">
                        ${
                          sortedApps.length > 0
                            ? sortedApps
                                .map(
                                  (app) => `
                            <div class="history-item ${app.status.toLowerCase()}">
                                <div class="history-main">
                                    <div class="history-icon">
                                        <i class="material-icons">${getStatusIcon(app.status)}</i>
                                    </div>
                                    <div class="history-info">
                                        <span class="app-type">${app.type}</span>
                                        <span class="app-date">${format(new Date(app.date), "MMMM dd, yyyy")} • ${app.time}</span>
                                    </div>
                                </div>
                                <div class="history-status">
                                    <span class="status-badge">${app.status.toUpperCase()}</span>
                                </div>
                            </div>
                        `,
                                )
                                .join("")
                            : `
                            <div class="empty-history">
                                <i class="material-icons">event_busy</i>
                                <p>You haven't made any appointments yet.</p>
                            </div>
                        `
                        }
                    </div>
                </div>
            </div>

            ${renderRightSidebar(myApps)}
        </div>
    `;
}
function getStatusIcon(status) {
  switch (status.toLowerCase()) {
    case "approved":
      return "check_circle";
    case "pending":
      return "schedule";
    case "rejected":
      return "cancel";
    default:
      return "event";
  }
}
// --- LOGIC FUNCTIONS ---

function attachBookingListener(session) {
  const form = document.getElementById("appointment-form");
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("submitBooking");
    const errorBanner = document.getElementById("booking-error");

    const newApp = {
      id: Date.now(),
      studentId: session.id,
      studentName: session.name,
      studentEmail: session.email,
      type: document.getElementById("appType").value,
      date: document.getElementById("appDate").value,
      time: document.getElementById("appTime").value,
      notes: document.getElementById("appNotes").value,
      status: "pending",
    };

    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;

    // 1. Save to LocalStorage
    const allApps = JSON.parse(localStorage.getItem("gh_appointments")) || [];
    allApps.push(newApp);
    localStorage.setItem("gh_appointments", JSON.stringify(allApps));

    // 2. Send via EmailJS (Optional/Integration)
    const adminEmail =
      localStorage.getItem("admin_notification_email") || "admin@granby.edu";

    emailjs
      .send("service_mtv9cbi", "template_mublumh", {
        to_email: adminEmail, // Ensure this is a real email in your localStorage settings!
        from_name: session.name,
        from_email: session.email,
        app_type: newApp.type,
        app_date: newApp.date,
        app_time: newApp.time,
        message: newApp.notes,
      })
      .then((res) => {
        console.log("Email Sent Successfully!", res.status, res.text);
        alert("Success! Appointment booked and Admin notified.");
        window.location.reload();
      })
      .catch((err) => {
        // This alert will now tell you EXACTLY what EmailJS is complaining about
        console.error("EmailJS Detailed Error:", err);
        alert(
          `Email Error: ${err.text} (Code: ${err.status}). Booking still saved locally.`,
        );
        window.location.reload();
      });
  };
}

// --- MAIN RENDERER ---

export function renderStudentView(root, session, onLogout) {
  root.innerHTML = `
    <div class="student-container">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h2><i class="material-icons">school</i> Granby Gateway</h2>
            </div>
            <nav id="student-nav">
                <button class="nav-item active" data-target="dashboard">
                    <i class="material-icons">dashboard</i> Dashboard
                </button>
                <button class="nav-item" data-target="book">
                    <i class="material-icons">event</i> Book Appointment
                </button>
                <button class="nav-item" data-target="records">
                    <i class="material-icons">history</i> My History
                </button>
                <button class="nav-item logout" id="logoutBtn">
                    <i class="material-icons">logout</i> Logout
                </button>
            </nav>
        </aside>
        <main class="content-area">
            <section id="dynamic-content">${renderDashboard(session)}</section>
        </main>
    </div>
  `;

  setupStudentListeners(onLogout, session);
}

function setupStudentListeners(onLogout, session) {
  const content = document.getElementById("dynamic-content");
  const navButtons = document.querySelectorAll(".nav-item:not(.logout)");
  const sidebar = document.getElementById("sidebar");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.onclick = (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("active");
    };
  }

  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 768 &&
      sidebar.classList.contains("active") &&
      !sidebar.contains(e.target) &&
      e.target !== mobileMenuBtn
    ) {
      sidebar.classList.remove("active");
    }
  });

  navButtons.forEach((btn) => {
    btn.onclick = () => {
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (window.innerWidth <= 768) {
        sidebar.classList.remove("active");
      }

      const target = btn.getAttribute("data-target");

      // FIX: Pass 'session' into these function calls
      if (target === "dashboard") {
        content.innerHTML = renderDashboard(session);
      } else if (target === "book") {
        content.innerHTML = renderBookingForm(session);
        attachBookingListener(session);
      } else if (target === "records") {
        content.innerHTML = renderHistory(session);
      }
    };
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = onLogout;
  }
}
