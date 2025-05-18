import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "admin", // or 'member' if needed
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/accounts/login/", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      localStorage.setItem("token", res.data.access);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="left-section">
        <motion.h1
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="highlight"
        >
          WELCOME BACK
        </motion.h1>
      </div>

      <div className="right-section">
        <motion.div
          className="form-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="back-button"
          >
            ← Back to Home
          </button>

          <h2>LOGIN</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fas fa-envelope" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                value={formData.email}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-lock" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                value={formData.password}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
