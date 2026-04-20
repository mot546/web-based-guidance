// Variable to track if we are showing Login or Register
import './styles/auth.css';
let isRegistering = false;

export function renderLoginPage(root, onLogin, onRegister) {
    root.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <h1><i class="material-icons">assignment_ind</i> Granby Gateway</h1>
                <p>${isRegistering ? 'Join our school community' : 'Sign in to access your portal'}</p>
                
                <div class="form-group">
                    ${isRegistering ? `
                        <input type="text" id="regName" placeholder="Full Name" autocomplete="name">
                    ` : ''}
                    <input type="text" id="username" placeholder="Username" autocomplete="username">
                    <input type="password" id="password" placeholder="Password" autocomplete="current-password">
                    
                    <button id="authBtn" class="primary-btn">
                        ${isRegistering ? 'Create Student Account' : 'Sign In'}
                    </button>
                </div>

                <div class="auth-footer">
                    ${isRegistering ? 'Already have an account?' : "New to GuidanceHub?"}
                    <button id="toggleAuth" class="link-btn">
                        ${isRegistering ? 'Sign In' : 'Register Now'}
                    </button>
                </div>
            </div>
        </div>
    `;

    // Toggle between Login and Register
    document.getElementById('toggleAuth').onclick = () => {
        isRegistering = !isRegistering;
        renderLoginPage(root, onLogin, onRegister); 
    };

    // Action Button
    document.getElementById('authBtn').onclick = () => {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;

        if (isRegistering) {
            const n = document.getElementById('regName').value;
            onRegister(n, u, p); // We pass the data back to index.js
        } else {
            onLogin(u, p); // We pass the data back to index.js
        }
    };
}