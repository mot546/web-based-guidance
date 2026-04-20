import "./styles/student.css";

// --- VIEW COMPONENTS ---
// These functions return the HTML for each specific tab

function renderDashboard() {
  return `
    <div class="stats-grid">
        <div class="stat-card">
            <i class="material-icons">pending_actions</i>
            <h3>Pending</h3>
            <p id="pending-count">0</p>
        </div>
        <div class="stat-card">
            <i class="material-icons">check_circle</i>
            <h3>Approved</h3>
            <p id="approved-count">0</p>
        </div>
    </div>
    <div class="upcoming-appointments">
        <h3>Your Appointments</h3>
        <div id="appointment-list" class="list-container">
            <p class="empty-msg">No appointments found. Use the sidebar to book one!</p>
        </div>
    </div>
  `;
}

function renderBookingForm() {
  return `
    <div class="card">
        <h3><i class="material-icons">add_circle</i> Book New Appointment</h3>
        <p>Fill out the form below to schedule a session with the guidance office.</p>
        <hr>
        <form id="appointment-form">
            <p><i>(Booking Form Logic will go here)</i></p>
        </form>
    </div>
  `;
}

function renderHistory() {
  return `
    <div class="card">
        <h3><i class="material-icons">history</i> My History</h3>
        <p>View your past completed guidance sessions and records.</p>
        <div class="list-container">
             <p class="empty-msg">No past records available.</p>
        </div>
    </div>
  `;
}

// --- MAIN RENDERER ---

export function renderStudentView(root, session) {
  root.innerHTML = `
    <div class="student-container">
        <aside class="sidebar">
            <h2><i class="material-icons">school</i> Granby Gateway</h2>
            <nav id="student-nav">
                <button class="nav-item active" data-target="dashboard" id="nav-dashboard">
                    <i class="material-icons">dashboard</i> Dashboard
                </button>
                <button class="nav-item" data-target="book" id="nav-book">
                    <i class="material-icons">event</i> Book Appointment
                </button>
                <button class="nav-item" data-target="records" id="nav-records">
                    <i class="material-icons">history</i> My History
                </button>
                <button class="nav-item logout" id="logoutBtn">
                    <i class="material-icons">logout</i> Logout
                </button>
            </nav>
        </aside>

        <main class="content-area">
            <header>
                <h1>Welcome back, ${session.name}!</h1>
                <span class="status-badge">Student Account</span>
            </header>

            <section id="dynamic-content">
                ${renderDashboard()}
            </section>
        </main>
    </div>
  `;

  setupStudentListeners();
}

// --- EVENT LISTENERS ---

function setupStudentListeners() {
  const content = document.getElementById("dynamic-content");
  const navButtons = document.querySelectorAll(".nav-item:not(.logout)");

  // Handle Tab Switching
  navButtons.forEach(btn => {
    btn.onclick = () => {
      // 1. Remove 'active' from all, add to clicked
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // 2. Switch Content based on data-target attribute
      const target = btn.getAttribute("data-target");
      
      if (target === "dashboard") {
        content.innerHTML = renderDashboard();
      } else if (target === "book") {
        content.innerHTML = renderBookingForm();
      } else if (target === "records") {
        content.innerHTML = renderHistory();
      }
    };
  });

  // Logout
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("gh_session");
    window.location.reload();
  };
}