import "./styles/auth.css";

let isRegistering = false;

export function renderLoginPage(root, onLogin, onRegister) {
  root.innerHTML = `
    <div class="auth-container">
        <div class="auth-card glass-card" id="authCard">
            <h1><i class="material-icons">assignment_ind</i> Granby Gateway</h1>
            <p>${isRegistering ? "Join our school community" : "Sign in to access your portal"}</p>
            
            <div id="authError" class="error-banner hidden"></div>

            <div class="form-group">
                ${isRegistering ? `
                    <input type="text" id="regName" placeholder="Full Name" required>
                    <input type="email" id="regEmail" placeholder="Email Address" required>
                ` : ""}
                
                <input type="text" id="username" placeholder="Username or Email" required>
                <input type="password" id="password" placeholder="Password" required title="Must be 8+ characters with uppercase, number, and special character.">
                
                ${isRegistering ? `
                    <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
                ` : ""}

                <button id="authBtn" class="primary-btn">
                    ${isRegistering ? "Create Student Account" : "Sign In"}
                </button>
            </div>

            <div class="auth-footer">
                ${isRegistering ? "Already have an account?" : "New to Granby Gateway?"}
                <button id="toggleAuth" class="link-btn">
                    ${isRegistering ? "Sign In" : "Register Now"}
                </button>
            </div>
        </div>
    </div>
  `;

  const errorBanner = document.getElementById("authError");
  const authCard = document.getElementById("authCard");

  const showError = (message) => {
    errorBanner.innerText = message;
    errorBanner.classList.remove("hidden");
    authCard.classList.add("shake");
    setTimeout(() => authCard.classList.remove("shake"), 500);
  };

  document.getElementById("toggleAuth").onclick = () => {
    isRegistering = !isRegistering;
    renderLoginPage(root, onLogin, onRegister);
  };

  document.getElementById("authBtn").onclick = () => {
    const identifier = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value;
    errorBanner.classList.add("hidden");

    if (isRegistering) {
      const n = document.getElementById("regName").value.trim();
      const e = document.getElementById("regEmail").value.trim();
      const cp = document.getElementById("confirmPassword").value;

      if (!n || !e || !identifier || !p) return showError("All fields are required.");
      
      // Email Regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(e)) return showError("Invalid email format.");

      // Strong Password Regex: 8+ chars, 1 Upper, 1 Lower, 1 Num, 1 Special
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(p)) {
        return showError("Password needs 8+ chars, uppercase, number, and special char.");
      }

      if (p !== cp) return showError("Passwords do not match.");

      onRegister(n, identifier, p, e, showError); 
    } else {
      if (!identifier || !p) return showError("Please enter credentials.");
      onLogin(identifier, p, showError);
    }
  };
}