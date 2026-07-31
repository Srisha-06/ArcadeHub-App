import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "./Login.css";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
  const response = await fetch("http://localhost:8080/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const user = await response.json();

  if (user) {
    // ✅ actual username save
    localStorage.setItem("username", user.username);

    alert("Login Successful!");
    navigate("/dashboard");
  } else {
    alert("Invalid Credentials!");
  }
};

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back 👋</h2>
        <p className="subtitle">Login to ArcadeHub</p>

        <input
          type="email"
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <button className="register-btn" onClick={() => navigate("/register")}>
          New user? Register
        </button>
      </div>
    </div>
  );
};