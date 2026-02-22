import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../App.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { name, email, password });
      alert("Registered! Please login.");
      navigate("/login");
    } catch (err) {
      alert("Error registering");
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="glass-input"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="glass-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="glass-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Create Account</button>
        </form>
        <button className="link-btn" onClick={() => navigate("/login")}>
          Already have an account? Sign In
        </button>
      </div>
    </div>
  );
}

export default Register;
