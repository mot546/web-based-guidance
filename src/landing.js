import "./styles/landing.css";

export function renderLandingPage(root, onGetStarted) {
    root.innerHTML = `
        <div class="landing-page">
            <nav class="glass-nav">
                <div class="logo">
                    <i class="material-icons">gavel</i>
                    <span>Granby Gateway</span>
                </div>
                <button class="nav-login" id="navLoginBtn">Sign In</button>
            </nav>

            <section class="hero">
                <div class="hero-content">
                    <span class="badge">New: 2026 Academic Portal</span>
                    <h1>Your Academic Success, <br><span class="highlight">Simplified.</span></h1>
                    <p>Connect with guidance counselors, manage appointments, and track your records through the secure Granby College portal.</p>
                    <div class="cta-group">
                        <button class="btn-primary" id="getStartedBtn">
                            Get Started <i class="material-icons">arrow_forward</i>
                        </button>
                        <button class="btn-secondary" id="viewServicesBtn">View Services</button>
                    </div>
                </div>
            </section>

            <section class="features-grid" id="services-section">
                <div class="glass-card">
                    <div class="icon-box"><i class="material-icons">calendar_month</i></div>
                    <h3>Smart Booking</h3>
                    <p>No more queues. Book your guidance sessions in seconds.</p>
                </div>
                <div class="glass-card">
                    <div class="icon-box"><i class="material-icons">insights</i></div>
                    <h3>Live Analytics</h3>
                    <p>Real-time status updates on all your pending requests.</p>
                </div>
                <div class="glass-card">
                    <div class="icon-box"><i class="material-icons">lock</i></div>
                    <h3>Encrypted</h3>
                    <p>Your records are protected with industry-standard security.</p>
                </div>
            </section>

            <section class="team-section" id="team-section">
                <div class="section-header">
                    <h2>Project Team</h2>
                    <p>Our Team Members behind this Project</p>
                </div>
                <div class="team-grid">
                    <div class="member-card">
                        <div class="member-avatar"><i class="material-icons">person</i></div>
                        <h3>Jhefrei Gaspar</h3>
                        <span>Project Lead</span>
                    </div>
                    <div class="member-card">
                        <div class="member-avatar"><i class="material-icons">person</i></div>
                        <h3>Antonio Jaucian IV</h3>
                        <span>Developer</span>
                    </div>
                    <div class="member-card">
                        <div class="member-avatar"><i class="material-icons">person</i></div>
                        <h3>Rhaessian Mhaye Delfin</h3>
                        <span>Developer</span>
                    </div>
                    <div class="member-card">
                        <div class="member-avatar"><i class="material-icons">person</i></div>
                        <h3>Christine Mae Bombeza</h3>
                        <span>Developer</span>
                    </div>
                    <div class="member-card">
                        <div class="member-avatar"><i class="material-icons">person</i></div>
                        <h3>Hans Balasbas</h3>
                        <span>Documentation</span>
                    </div>
                    <div class="member-card">
                        <div class="member-avatar"><i class="material-icons">person</i></div>
                        <h3>Argenjeff Argente</h3>
                        <span>Documentation</span>
                    </div>
                </div>
            </section>
        </div>
    `;

    // Listeners
    document.getElementById("getStartedBtn").onclick = onGetStarted;
    document.getElementById("navLoginBtn").onclick = onGetStarted;

    // View Services Smooth Scroll
    document.getElementById("viewServicesBtn").onclick = () => {
        const target = document.getElementById("services-section");
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    };
}