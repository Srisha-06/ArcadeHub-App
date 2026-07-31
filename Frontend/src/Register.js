import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "./Register.css";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    const response = await fetch("http://localhost:8080/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const result = await response.text();
    alert(result);

    if (result === "User registered successfully") {
      navigate("/");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create Account 🚀</h2>
        <p className="subtitle">Join ArcadeHub</p>

        <input
          type="text"
          placeholder="Enter Username"
          onChange={(e) => setUsername(e.target.value)}
        />

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

        <button className="register-btn" onClick={handleRegister}>
          Register
        </button>

        <button className="login-btn" onClick={() => navigate("/")}>
          Already have account? Login
        </button>
      </div>
    </div>
  );
};