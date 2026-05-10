import emailjs from "@emailjs/browser";
import { renderLoginPage } from "./auth.js";
import { renderStudentView } from "./student.js";
import { renderGuidanceView } from "./guidance.js";
import { renderLandingPage } from "./landing.js";
import { renderAdminView } from "./admin.js"
import "./styles/styles.css";

emailjs.init("6_rFpZEVOh3AVEsIM");
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
        email: "parungaorhaessian@gmail.com",
        yearLevel: "3rd Year",
        course: "BSIT",
        section: "3A"
      },
      {
        id: 99, // ID matches the appointment John Doe in seedAppointments
        user: "johndoe",
        pass: "pass123",
        role: "student",
        name: "John Doe",
        email: "johndoe@example.com",
        yearLevel: "1st Year",
        course: "BSIT",
        section: "1B"
      },
      {
        id: 100,
        user: "janesmith",
        pass: "pass123",
        role: "student",
        name: "Jane Smith",
        email: "janesmith@example.com",
        yearLevel: "4th Year",
        course: "BSED",
        section: "4C"
      },
      {
        id: 2,
        user: "guidance",
        pass: "123",
        role: "guidance", 
        name: "Ms. Delfin", 
        email: "jellopancake213@gmail.com",
      },
      {
        id: 3,
        user: "admin",
        pass: "admin123",
        role: "admin",
        name: "System Administrator",
        email: "jellopancake213@gmail.com",
      }
    ];
    localStorage.setItem("gh_users", JSON.stringify(initialUsers));
  }
};
const seedAppointments = () => {
  const existingApps = localStorage.getItem("gh_appointments");
  
  if (!existingApps) {
    const initialAppointments = [
      {
        id: Date.now() + 1,
        studentId: 1, // Matches Rhae from seedUsers
        studentName: "Rhae",
        studentEmail: "parungaorhaessian@gmail.com",
        type: "Academic Counseling",
        date: "2026-05-15",
        time: "10:00 AM",
        notes: "I need help with my shifting process.",
        status: "pending",
        counselorNotes: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: Date.now() + 2,
        studentId: 1,
        studentName: "Rhae",
        studentEmail: "parungaorhaessian@gmail.com",
        type: "Career Guidance",
        date: "2026-05-12",
        time: "02:30 PM",
        notes: "Discussing internship opportunities for BSIT.",
        status: "approved",
        counselorNotes: "Approved. Please bring your draft resume.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: Date.now() + 3,
        studentId: 99, // A different mock student
        studentName: "John Doe",
        studentEmail: "johndoe@example.com",
        type: "Personal Issue",
        date: "2026-05-08",
        time: "09:00 AM",
        notes: "Requesting a mental health break talk.",
        status: "rejected",
        counselorNotes: "Please coordinate with the health office first.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem("gh_appointments", JSON.stringify(initialAppointments));
  }
};

// Call it alongside your user seeder
seedUsers();
seedAppointments();

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
    course,  // Save new field
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