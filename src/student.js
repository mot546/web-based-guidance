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
            <p><i>(coming soon)</i></p>
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

export function renderStudentView(root, session, onLogout) {
  root.innerHTML = `
    <div class="student-container">
        <button id="menu-toggle" class="menu-btn mobile-only">
            <i class="material-icons">menu</i>
        </button>

        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h2><i class="material-icons">school</i> Granby Gateway</h2>
                <button id="close-sidebar" class="close-btn mobile-only">
                    <i class="material-icons">close</i>
                </button>
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

        <div class="sidebar-overlay" id="sidebar-overlay"></div>

        <main class="content-area">
            <header>
                <div class="header-text">
                    <h1>Welcome back, ${session.name}!</h1>
                    <span class="status-badge">Student Account</span>
                </div>
            </header>

            <section id="dynamic-content">
                ${renderDashboard()}
            </section>
        </main>
    </div>
  `;

  // Pass the logout handler to the listener setup
  setupStudentListeners(onLogout);
}
// --- EVENT LISTENERS ---

function setupStudentListeners(onLogout) {
  const content = document.getElementById("dynamic-content");
  const navButtons = document.querySelectorAll(".nav-item:not(.logout)");
  
  // Mobile elements
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const menuToggle = document.getElementById("menu-toggle");
  const closeSidebar = document.getElementById("close-sidebar");

  // --- 1. MOBILE MENU LOGIC ---
  const toggleMenu = () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  };

  if (menuToggle) menuToggle.onclick = toggleMenu;
  if (closeSidebar) closeSidebar.onclick = toggleMenu;
  if (overlay) overlay.onclick = toggleMenu;

  // --- 2. TAB SWITCHING LOGIC ---
  navButtons.forEach((btn) => {
    btn.onclick = () => {
      // Update active button state
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Render the correct view
      const target = btn.getAttribute("data-target");
      if (target === "dashboard") {
        content.innerHTML = renderDashboard();
      } else if (target === "book") {
        content.innerHTML = renderBookingForm();
      } else if (target === "records") {
        content.innerHTML = renderHistory();
      }

      // AUTO-CLOSE: If on mobile, close the sidebar after clicking a link
      if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
        toggleMenu();
      }
    };
  });

  // --- 3. LOGOUT LOGIC ---
  // Use the handler passed from index.js for a clean redirect to landing
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = onLogout;
  }
}