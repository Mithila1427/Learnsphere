import React, { useState } from "react";
import API from "../api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleLogin = async (e) => {
    e.preventDefault(); // stop page reload
    try {
      const { data } = await API.post("/login", { email, password, role });
      console.log("Login success:", data);
      alert("Login successful!");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert("Login failed! Check credentials.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {/* <-- Use handleLogin here */}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
