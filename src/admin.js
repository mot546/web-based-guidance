/**
 * Renders the Super Admin View
 * @param {HTMLElement} root - The root element
 * @param {Object} session - Current admin session data
 * @param {Function} onLogout - Logout handler
 */
export function renderAdminView(root, session, onLogout) {
    root.innerHTML = `
    <div class="admin-container">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h2><i class="material-icons">security</i> Admin Portal</h2>
                <p>System Control Center</p>
            </div>
            <nav id="admin-nav">
                <button class="nav-item active" data-target="staff">
                    <i class="material-icons">badge</i> Manage Staff
                </button>
                <button class="nav-item" data-target="announcements">
                    <i class="material-icons">campaign</i> Global Broadcast
                </button>
                <button class="nav-item" data-target="system">
                    <i class="material-icons">settings_suggest</i> System Health
                </button>
                <button class="nav-item logout" id="logoutBtn">
                    <i class="material-icons">logout</i> Logout
                </button>
            </nav>
        </aside>
        <main class="content-area">
            <div id="admin-dynamic-content">
                </div>
        </main>
    </div>
    `;

    setupAdminListeners(onLogout, session);
}

function setupAdminListeners(onLogout, session) {
    const content = document.getElementById("admin-dynamic-content");
    const navButtons = document.querySelectorAll(".nav-item:not(.logout)");

    navButtons.forEach((btn) => {
        btn.onclick = () => {
            navButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const target = btn.getAttribute("data-target");
            renderSection(target, content);
        };
    });

    document.getElementById("logoutBtn").onclick = onLogout;

    // Initial Section
    renderSection("staff", content);
}

function renderSection(target, container) {
    if (target === "staff") {
        renderStaffManager(container);
    } else if (target === "announcements") {
        container.innerHTML = `
            <div class="admin-card">
                <h2><i class="material-icons">campaign</i> Create Global Broadcast</h2>
                <p class="subtitle">This message will appear to all Students and Guidance Counselors.</p>
                <textarea id="broadcastMsg" placeholder="Type announcement here..." rows="4" class="admin-input"></textarea>
                <button class="primary-btn" onclick="alert('Broadcast sent!')">Post Announcement</button>
            </div>
        `;
    } else {
        container.innerHTML = `<div class="admin-card"><h2>Module coming soon...</h2></div>`;
    }
}

function renderStaffManager(container) {
    const users = JSON.parse(localStorage.getItem("gh_users")) || [];
    const staff = users.filter(u => u.role === "guidance");

    container.innerHTML = `
        <div class="admin-card full-width">
            <div class="card-header">
                <h2><i class="material-icons">groups</i> Guidance Counselor Directory</h2>
                <button class="primary-btn" id="addStaffBtn">
                    <i class="material-icons">person_add</i> Add Counselor
                </button>
            </div>
            <div class="table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${staff.length > 0 ? staff.map(c => `
                            <tr>
                                <td><strong>${c.name}</strong></td>
                                <td>${c.email}</td>
                                <td><span class="badge guidance">Guidance</span></td>
                                <td>
                                    <button class="icon-btn delete" onclick="removeUser(${c.id})">
                                        <i class="material-icons">delete_forever</i>
                                    </button>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No guidance staff found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("addStaffBtn").onclick = () => {
        const name = prompt("Enter Counselor Full Name:");
        const email = prompt("Enter Counselor Email:");
        const password = prompt("Create temporary password:");

        if (name && email && password) {
            addUser(name, email, password, "guidance");
            renderStaffManager(container);
        }
    };
}

// Global functions for logic
window.removeUser = (id) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
        const users = JSON.parse(localStorage.getItem("gh_users")) || [];
        const filtered = users.filter(u => u.id !== id);
        localStorage.setItem("gh_users", JSON.stringify(filtered));
        window.location.reload(); 
    }
};

function addUser(name, email, pass, role) {
    const users = JSON.parse(localStorage.getItem("gh_users")) || [];
    const newUser = {
        id: Date.now(),
        name,
        email,
        user: email.split('@')[0], // simple username generation
        pass,
        role
    };
    users.push(newUser);
    localStorage.setItem("gh_users", JSON.stringify(users));
    alert("Counselor added successfully!");
}