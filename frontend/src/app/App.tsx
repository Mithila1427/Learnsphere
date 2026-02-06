import { useState } from "react";
import { LoginPage } from "@/app/components/LoginPage";
import { RegisterPage } from "@/app/components/RegisterPage";
import { StudentDashboard } from "@/app/components/StudentDashboard";
import { TeacherDashboard } from "@/app/components/TeacherDashboard";

type Page = "login" | "register" | "student-dashboard" | "teacher-dashboard";
type UserType = "student" | "teacher" | null;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [userType, setUserType] = useState<UserType>(null);

  // ✅ LOGIN
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("LOGIN SENDING:", email, password);

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
localStorage.setItem("role", data.role);
localStorage.setItem("name", data.name);
localStorage.setItem("email", data.email);


      setUserType(data.role);

      if (data.role === "student") {
        setCurrentPage("student-dashboard");
      } else {
        setCurrentPage("teacher-dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error");
    }
  };

  // ✅ REGISTER
  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    role: "student" | "teacher"
  ) => {
    try {
      console.log("REGISTER SENDING:", name, email, password, role);

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      console.log("REGISTER RESPONSE:", data);

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful. Please login.");
      setCurrentPage("login");
    } catch (error) {
      console.error("Register error:", error);
      alert("Server error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUserType(null);
    setCurrentPage("login");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentPage("register")}
          />
        );

      case "register":
        return (
          <RegisterPage
            onRegister={handleRegister}
            onNavigateToLogin={() => setCurrentPage("login")}
          />
        );

      case "student-dashboard":
        return <StudentDashboard onLogout={handleLogout} />;

      case "teacher-dashboard":
        return <TeacherDashboard onLogout={handleLogout} />;

      default:
        return null;
    }
  };

  return <div className="size-full">{renderPage()}</div>;
}
