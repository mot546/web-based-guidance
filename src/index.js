import { renderLoginPage } from "./auth.js";
import { renderStudentView } from "./student.js";
import { renderGuidanceView } from "./guidance.js";
import { renderLandingPage } from "./landing.js";
import { renderAdminView } from "./admin.js"
import "./styles/styles.css";
emailjs.init("6_rFpZEVOh3AVEsIM");
import emailjs from "@emailjs/browser";

const seedUsers = () => {
  const existingUsers = localStorage.getItem("gh_users");
  if (!existingUsers) {
    const initialUsers = [
      {
        id: 1,
        user: "student",
        pass: "123",
        role: "student",
        name: "Rhae",
        email: "rhae@granby.edu",
        yearLevel: "1st Year",
        course: "BSIT",
        section: "1A"
      },
      {
        id: 2,
        user: "guidance", // Changed role from admin to guidance
        pass: "123",
        role: "guidance", 
        name: "Ms. Delfin", 
        email: "santos@granby.edu",
      },
      {
        id: 3,
        user: "admin", // New Super Admin role
        pass: "admin123",
        role: "admin",
        name: "System Administrator",
        email: "admin@granby.edu",
      }
    ];
    localStorage.setItem("gh_users", JSON.stringify(initialUsers));
  }
};
seedUsers();

// --- DEFINE HANDLERS FIRST ---

function handleLogout() {
  localStorage.removeItem("gh_session");
  sessionStorage.removeItem("gh_entered");
  window.location.reload();
}

function handleLogin(identifier, p, showError) {
  const users = JSON.parse(localStorage.getItem("gh_users")) || [];
  const found = users.find(
    (u) => (u.user === identifier || u.email === identifier) && u.pass === p,
  );

  if (found) {
    // Destructure to remove password from session for security
    const { pass, ...sessionData } = found;
    
    localStorage.setItem("gh_session", JSON.stringify(sessionData));
    
    initApp();
  } else {
    showError("Invalid username/email or password.");
  }
}

function handleRegister(name, u, p, email, yl, course, sec, showError, showSuccess) {
  const users = JSON.parse(localStorage.getItem("gh_users")) || [];
  const exists = users.some((user) => user.user === u || user.email === email);

  if (exists) {
    return showError("Username or Email already exists!");
  }

  const newUser = {
    id: Date.now(),
    name,
    user: u,
    pass: p,
    email,
    yearLevel: yl,   // Save new field
    course: course,  // Save new field
    section: sec,    // Save new field
    role: "student",
  };

  users.push(newUser);
  localStorage.setItem("gh_users", JSON.stringify(users));

  if (showSuccess) {
    showSuccess();
  }
}

// --- ROUTER ---
function initApp() {
  const root = document.getElementById("app");
  const session = JSON.parse(localStorage.getItem("gh_session"));
  const hasEntered = sessionStorage.getItem("gh_entered");

  if (!session && !hasEntered) {
    renderLandingPage(root, () => {
      sessionStorage.setItem("gh_entered", "true");
      initApp();
    });
  } else if (!session) {
    renderLoginPage(root, handleLogin, handleRegister);
  } else {
    // ROUTING LOGIC BASED ON ROLE
    if (session.role === "admin") {
      renderAdminView(root, session, handleLogout);
    } else if (session.role === "guidance") {
      renderGuidanceView(root, session, handleLogout);
    } else {
      renderStudentView(root, session, handleLogout);
    }
  }
}

document.addEventListener("DOMContentLoaded", initApp);