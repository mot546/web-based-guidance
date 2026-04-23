import { renderLoginPage } from "./auth.js";
import { renderStudentView } from "./student.js";
import { renderAdminView } from "./admin.js";
import { renderLandingPage } from "./landing.js";
import "./styles/styles.css";

// --- DATABASE SEEDING ---
const seedUsers = () => {
  const existingUsers = localStorage.getItem("gh_users");
  if (!existingUsers) {
    const initialUsers = [
      { id: 1, user: "student", pass: "123", role: "student", name: "Alice" },
      {
        id: 2,
        user: "admin",
        pass: "123",
        role: "admin",
        name: "Mr. Bossbeza",
      },
    ];
    localStorage.setItem("gh_users", JSON.stringify(initialUsers));
  }
};
seedUsers();

// --- HANDLERS ---

/**
 * Handle Login: Validates credentials and updates app state
 */
function handleLogin(u, p) {
  const users = JSON.parse(localStorage.getItem("gh_users")) || [];
  const found = users.find((user) => user.user === u && user.pass === p);

  if (found) {
    localStorage.setItem(
      "gh_session",
      JSON.stringify({
        id: found.id,
        name: found.name,
        role: found.role,
      }),
    );
    // Note: We keep 'gh_entered' as true so they stay in the "app" area
    initApp();
  } else {
    alert("Invalid credentials! Please try again.");
  }
}

/**
 * Handle Registration: Adds new student to the local database
 */
function handleRegister(name, u, p) {
  const users = JSON.parse(localStorage.getItem("gh_users")) || [];
  
  if (users.find((user) => user.user === u)) {
    return alert("Username already exists!");
  }

  const newUser = { 
    id: Date.now(), 
    name, 
    user: u, 
    pass: p, 
    role: "student" 
  };

  users.push(newUser);
  localStorage.setItem("gh_users", JSON.stringify(users));

  alert("Registration successful! Switching to login...");
}

/**
 * Handle Logout: Clears session and returns to Landing Page
 */
function handleLogout() {
  localStorage.removeItem("gh_session");
  // CRITICAL: Remove this to show the Landing Page again on refresh
  sessionStorage.removeItem("gh_entered"); 
  window.location.reload();
}

// --- UPDATED MAIN ROUTER ---

function initApp() {
  const root = document.getElementById("app");
  const session = JSON.parse(localStorage.getItem("gh_session"));
  const hasEntered = sessionStorage.getItem("gh_entered");

  if (!session) {
    if (!hasEntered) {
      // Landing page takes an 'onGetStarted' callback
      renderLandingPage(root, () => {
        sessionStorage.setItem("gh_entered", "true");
        initApp();
      });
    } else {
      renderLoginPage(root, handleLogin, handleRegister);
    }
  } else {
    // Pass the centralized logout handler to the views
    if (session.role === "admin") {
      renderAdminView(root, session, handleLogout);
    } else {
      renderStudentView(root, session, handleLogout);
    }
  }
}
// This is the "Ignition Switch" that starts your app
document.addEventListener("DOMContentLoaded", initApp);