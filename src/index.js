import { renderLoginPage } from "./auth.js";
import { renderStudentView } from "./student.js";
import { renderAdminView } from "./admin.js";
import { renderLandingPage } from "./landing.js";
import "./styles/styles.css";

const seedUsers = () => {
  const existingUsers = localStorage.getItem("gh_users");
  if (!existingUsers) {
    const initialUsers = [
      {
        id: 1,
        user: "student",
        pass: "123",
        role: "student",
        name: "Alice",
        email: "alice@granby.edu",
      },
      {
        id: 2,
        user: "admin",
        pass: "123",
        role: "admin",
        name: "Mr. Bossbeza",
        email: "jellopancake213@gmail.com",
      },
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
    localStorage.setItem(
      "gh_session",
      JSON.stringify({
        id: found.id,
        name: found.name,
        role: found.role,
        email: found.email,
      }),
    );
    initApp();
  } else {
    showError("Invalid username/email or password.");
  }
}

function handleRegister(name, u, p, email, showError) {
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
    role: "student",
  };
  users.push(newUser);
  localStorage.setItem("gh_users", JSON.stringify(users));

  const root = document.getElementById("app");
  renderLoginPage(root, handleLogin, handleRegister);
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
  } else if (session.role === "admin") {
    renderAdminView(root, session, handleLogout);
  } else {
    renderStudentView(root, session, handleLogout);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
