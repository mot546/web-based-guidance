import "./styles/auth.css";

let isRegistering = false;

/**
 * Renders the Login/Registration Page
 * @param {HTMLElement} root - The root element to render into
 * @param {Function} onLogin - Callback for login attempts
 * @param {Function} onRegister - Callback for registration attempts
 */
export function renderLoginPage(root, onLogin, onRegister) {
    root.innerHTML = `
    <div class="auth-container">
        <div class="auth-card glass-card" id="authCard">
            <div id="authContent">
                <div class="brand-section">
                    <h1><i class="material-icons">assignment_ind</i> Granby Gateway</h1>
                    <p id="authSubtitle">${isRegistering ? "Join our school community" : "Sign in to access your portal"}</p>
                </div>
                
                <div id="authError" class="error-banner hidden"></div>

                <div class="form-group">
                    ${isRegistering ? `
                        <div class="input-wrapper plain">
                            <input type="text" id="regName" placeholder="Full Name" required>
                        </div>
                        <div class="input-wrapper plain">
                            <input type="email" id="regEmail" placeholder="Email Address" required>
                        </div>
                        
                        <div class="input-wrapper plain">
                            <select id="regYearLevel" required>
                                <option value="" disabled selected>Select Year Level</option>
                                <optgroup label="High School">
                                    <option value="7">Grade 7</option>
                                    <option value="8">Grade 8</option>
                                    <option value="9">Grade 9</option>
                                    <option value="10">Grade 10</option>
                                    <option value="11">Grade 11</option>
                                    <option value="12">Grade 12</option>
                                </optgroup>
                                <optgroup label="College">
                                    <option value="1st Year">1st Year College</option>
                                    <option value="2nd Year">2nd Year College</option>
                                    <option value="3rd Year">3rd Year College</option>
                                    <option value="4th Year">4th Year College</option>
                                </optgroup>
                            </select>
                        </div>

                        <div class="input-group-row">
                            <div class="input-wrapper plain">
                                <input type="text" id="regCourse" placeholder="Course (e.g. BSIT / Grade School)" required>
                            </div>
                            <div class="input-wrapper plain">
                                <input type="text" id="regSection" placeholder="Section" required>
                            </div>
                        </div>
                    ` : ""}
                    
                    <div class="input-wrapper plain">
                        <input type="text" id="username" placeholder="Username" required>
                    </div>

                    <div class="input-wrapper plain password-wrapper">
                        <input type="password" id="password" placeholder="Password" required 
                               title="Must be 8+ characters with uppercase, number, and special character.">
                        <button type="button" class="toggle-password" data-target="password">
                            <i class="material-icons">visibility</i>
                        </button>
                    </div>
                    
                    ${isRegistering ? `
                        <div class="input-wrapper plain password-wrapper">
                            <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
                            <button type="button" class="toggle-password" data-target="confirmPassword">
                                <i class="material-icons">visibility</i>
                            </button>
                        </div>
                    ` : ""}

                    <button id="authBtn" class="primary-btn">
                        ${isRegistering ? "Create Student Account" : "Sign In"}
                    </button>
                </div>

                <div class="auth-footer">
                    <span>${isRegistering ? "Already have an account?" : "New to Granby Gateway?"}</span>
                    <button id="toggleAuth" class="link-btn">
                        ${isRegistering ? "Sign In" : "Register Now"}
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;

    const errorBanner = document.getElementById("authError");
    const authCard = document.getElementById("authCard");
    const authContent = document.getElementById("authContent");

    // --- HELPERS ---
    const showError = (message) => {
        errorBanner.innerText = message;
        errorBanner.classList.remove("hidden");
        authCard.classList.add("shake");
        setTimeout(() => authCard.classList.remove("shake"), 500);
    };

    const showSuccess = () => {
        authContent.innerHTML = `
            <div class="success-state">
                <div class="success-icon">
                    <i class="material-icons">check_circle</i>
                </div>
                <h2>Account Created!</h2>
                <p>Welcome to <strong>Granby Gateway</strong>. Your account is ready.</p>
                <div class="loader-bar"></div>
                <p class="redirect-text">Redirecting to login...</p>
            </div>
        `;

        setTimeout(() => {
            isRegistering = false;
            renderLoginPage(root, onLogin, onRegister);
        }, 3000);
    };

    // --- EVENT LISTENERS ---
    document.getElementById("toggleAuth").onclick = () => {
        isRegistering = !isRegistering;
        renderLoginPage(root, onLogin, onRegister);
    };

    // Password Toggle Logic
    const toggleButtons = root.querySelectorAll(".toggle-password");
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

    document.getElementById("authBtn").onclick = () => {
        const identifier = document.getElementById("username").value.trim();
        const p = document.getElementById("password").value;
        errorBanner.classList.add("hidden");

        if (isRegistering) {
            const n = document.getElementById("regName").value.trim();
            const e = document.getElementById("regEmail").value.trim();
            const yl = document.getElementById("regYearLevel").value;
            const course = document.getElementById("regCourse").value.trim();
            const sec = document.getElementById("regSection").value.trim();
            const cp = document.getElementById("confirmPassword").value;

            // Validation
            if (!n || !e || !yl || !course || !sec || !identifier || !p)
                return showError("All fields are required.");

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(e))
                return showError("Please enter a valid email address.");

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(p)) {
                return showError("Password needs 8+ chars, uppercase, number, and special char.");
            }

            if (p !== cp) return showError("Passwords do not match.");

            // Sending to main logic
            onRegister(n, identifier, p, e, yl, course, sec, showError, showSuccess);
        } else {
            if (!identifier || !p) return showError("Please enter your credentials.");
            onLogin(identifier, p, showError);
        }
    };
}