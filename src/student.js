import './styles/student.css';
export function renderStudentView(root, session) {
    // 1. Create the Layout Structure
    root.innerHTML = `
        <div class="student-container">
            <aside class="sidebar">
                <h2><i class="material-icons">school</i> Granby Gateway</h2>
                <nav>
                    <button class="nav-item active" id="nav-dashboard">
                        <i class="material-icons">dashboard</i> Dashboard
                    </button>
                    <button class="nav-item" id="nav-book">
                        <i class="material-icons">event</i> Book Appointment
                    </button>
                    <button class="nav-item" id="nav-records">
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
                </section>
            </main>
        </div>
    `;

    // 2. Attach Event Listeners
    setupStudentListeners();
}

function setupStudentListeners() {
    // Logout logic (calling the function we defined in index.js)
    document.getElementById('logoutBtn').onclick = () => {
        localStorage.removeItem('gh_session');
        window.location.reload();
    };

    // Placeholder for Navigation Logic
    document.getElementById('nav-book').onclick = () => {
        const content = document.getElementById('dynamic-content');
        content.innerHTML = '<h3>Booking Form Coming Soon...</h3>';
    };
}