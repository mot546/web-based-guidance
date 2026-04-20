import { renderLoginPage } from "./auth.js";
import { renderStudentView } from "./student.js";
import { renderAdminView } from "./admin.js";
import "./styles/styles.css";

// --- DATABASE SEEDING ---
const seedUsers = () => {
  const existingUsers = localStorage.getItem("gh_users");
  if (!existingUsers) {
    const initialUsers = [
      { id: 1, user: "student", pass: "123", role: "student", name: "Alice" },
      { id: 2, user: "admin", pass: "123", role: "admin", name: "Counselor Ramos" },
    ];
    localStorage.setItem("gh_users", JSON.stringify(initialUsers));
  }
};
seedUsers();

// --- HANDLERS ---
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
    initApp();
  } else {
    alert("Invalid credentials!");
  }
}

function handleRegister(name, u, p) {
  const users = JSON.parse(localStorage.getItem("gh_users")) || [];
  if (users.find((user) => user.user === u)) return alert("Username taken!");

  const newUser = { id: Date.now(), name, user: u, pass: p, role: "student" };
  users.push(newUser);
  localStorage.setItem("gh_users", JSON.stringify(users));

  alert("Registered! You can now login.");
  // We don't need to do anything else; renderLoginPage will handle the toggle
}

// --- MAIN ROUTER ---
function initApp() {
  const root = document.getElementById("app");
  const session = JSON.parse(localStorage.getItem("gh_session"));

  if (!session) {
    // Pass the handlers into the login page module
    renderLoginPage(root, handleLogin, handleRegister);
  } else if (session.role === "admin") {
    renderAdminView(root, session);
  } else {
    renderStudentView(root, session);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
