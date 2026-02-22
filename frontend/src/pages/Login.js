import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
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
          <button className="btn btn-primary" type="submit">Sign In</button>
        </form>
        <button className="link-btn" onClick={() => navigate("/register")}>
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
}

export default Login;
