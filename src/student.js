import "./styles/student.css";
import emailjs from '@emailjs/browser';
emailjs.init("6_rFpZEVOh3AVEsIM");

// --- VIEW COMPONENTS ---

function renderDashboard() {
  // Logic to fetch counts from localStorage
  const allAppointments = JSON.parse(localStorage.getItem("gh_appointments")) || [];
  const session = JSON.parse(localStorage.getItem("gh_session"));
  const myApps = allAppointments.filter(app => app.studentId === session.id);
  
  const pending = myApps.filter(a => a.status === "pending").length;
  const approved = myApps.filter(a => a.status === "approved").length;

  return `
    <div class="stats-grid">
        <div class="stat-card">
            <i class="material-icons">pending_actions</i>
            <h3>Pending</h3>
            <p id="pending-count">${pending}</p>
        </div>
        <div class="stat-card">
            <i class="material-icons">check_circle</i>
            <h3>Approved</h3>
            <p id="approved-count">${approved}</p>
        </div>
    </div>
    <div class="upcoming-appointments">
        <h3>Your Appointments</h3>
        <div id="appointment-list" class="list-container">
            ${myApps.length > 0 ? myApps.map(app => `
                <div class="appointment-item card">
                    <div class="app-info">
                        <strong>${app.type}</strong>
                        <span><i class="material-icons">event</i> ${app.date} at ${app.time}</span>
                    </div>
                    <span class="status-pill ${app.status}">${app.status}</span>
                </div>
            `).join('') : '<p class="empty-msg">No appointments found. Use the sidebar to book one!</p>'}
        </div>
    </div>
  `;
}

function renderBookingForm() {
  return `
    <div class="card booking-card">
        <h3><i class="material-icons">add_circle</i> Book New Appointment</h3>
        <p>Fill out the form below to schedule a session.</p>
        <hr>
        <div id="booking-error" class="error-banner hidden"></div>
        <form id="appointment-form">
            <div class="form-group">
                <label>Counseling Type</label>
                <select id="appType" required>
                    <option value="">Select a reason...</option>
                    <option value="Academic Guidance">Academic Guidance</option>
                    <option value="Personal Concern">Personal Concern</option>
                    <option value="Career Consultation">Career Consultation</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="appDate" required min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Time</label>
                <input type="time" id="appTime" required>
            </div>
            <div class="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea id="appNotes" placeholder="Tell us more about your concern..."></textarea>
            </div>
            <button type="submit" id="submitBooking" class="primary-btn">Confirm Booking</button>
        </form>
    </div>
  `;
}
function renderHistory() {
    // 1. Get the current logged-in user session
    const session = JSON.parse(localStorage.getItem("gh_session"));
    
    // 2. Get all appointments and filter for this specific student
    const allApps = JSON.parse(localStorage.getItem("gh_appointments")) || [];
    const myApps = allApps.filter(app => app.studentEmail === session.email);

    // 3. Sort so the most recent is at the top
    const sortedApps = [...myApps].sort((a, b) => b.id - a.id);

    return `
        <div class="student-card">
            <div class="card-header">
                <h2><i class="material-icons">history</i> My Appointment History</h2>
                <p>Track the status of your guidance requests below.</p>
            </div>
            <div class="history-list">
                ${sortedApps.length > 0 ? sortedApps.map(app => `
                    <div class="history-item ${app.status}">
                        <div class="history-main">
                            <div class="history-icon">
                                <i class="material-icons">${getStatusIcon(app.status)}</i>
                            </div>
                            <div class="history-info">
                                <span class="app-type">${app.type}</span>
                                <span class="app-date">${app.date} at ${app.time}</span>
                            </div>
                        </div>
                        <div class="history-status">
                            <span class="status-badge">${app.status.toUpperCase()}</span>
                        </div>
                    </div>
                `).join('') : `
                    <div class="empty-history">
                        <i class="material-icons">event_busy</i>
                        <p>You haven't made any appointments yet.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Helper to change the icon based on status
function getStatusIcon(status) {
    if (status === 'approved') return 'check_circle';
    if (status === 'rejected') return 'cancel';
    return 'pending';
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
      status: "pending"
    };

    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;

    // 1. Save to LocalStorage
    const allApps = JSON.parse(localStorage.getItem("gh_appointments")) || [];
    allApps.push(newApp);
    localStorage.setItem("gh_appointments", JSON.stringify(allApps));

    // 2. Send via EmailJS (Optional/Integration)
    const adminEmail = localStorage.getItem("admin_notification_email") || "admin@granby.edu";
    
    emailjs.send(
    'service_mtv9cbi', 
    'template_mublumh', 
    {
        to_email: adminEmail, // Ensure this is a real email in your localStorage settings!
        from_name: session.name,
        from_email: session.email, 
        app_type: newApp.type,
        app_date: newApp.date,
        app_time: newApp.time,
        message: newApp.notes
    }
    ).then((res) => {
        console.log("Email Sent Successfully!", res.status, res.text);
        alert("Success! Appointment booked and Admin notified.");
        window.location.reload();
    }).catch((err) => {
        // This alert will now tell you EXACTLY what EmailJS is complaining about
        console.error("EmailJS Detailed Error:", err);
        alert(`Email Error: ${err.text} (Code: ${err.status}). Booking still saved locally.`);
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
            <header>
                <div class="header-text">
                    <h1>Welcome, ${session.name}!</h1>
                </div>
            </header>
            <section id="dynamic-content">${renderDashboard()}</section>
        </main>
    </div>
  `;

  setupStudentListeners(onLogout, session);
}

function setupStudentListeners(onLogout, session) {
  const content = document.getElementById("dynamic-content");
  const navButtons = document.querySelectorAll(".nav-item:not(.logout)");

  navButtons.forEach((btn) => {
    btn.onclick = () => {
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.getAttribute("data-target");
      if (target === "dashboard") {
        content.innerHTML = renderDashboard();
      } else if (target === "book") {
        content.innerHTML = renderBookingForm();
        attachBookingListener(session); // Start listening for the form submit
      } else if (target === "records") {
        content.innerHTML = renderHistory();
      }
    };
  });

  document.getElementById("logoutBtn").onclick = onLogout;
}