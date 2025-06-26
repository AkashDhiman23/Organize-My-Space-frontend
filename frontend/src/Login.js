import React, { useState, useEffect } from "react";
import { color, motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(
        `${API_BASE_URL}/accounts/login/`, {
      withCredentials: true,
    });
  }, []);

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const csrftoken = getCookie("csrftoken");

      const res = await axios.post(
        `${API_BASE_URL}/accounts/login/`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "X-CSRFToken": csrftoken,
          },
          withCredentials: true,
        }
      );

      setSuccess("Login successful! Redirecting...");
      setError(null);

      const userRole = res.data.role?.toLowerCase();

      setTimeout(() => {
        switch (userRole) {
          case "admin":
            navigate("/dashboard");
            break;
          case "designer":
            navigate("/designer");
            break;
          case "manager":
            navigate("/manager");
            break;
          case "production":
            navigate("/production-dashboard");
            break;
          default:
            navigate("/dashboard");
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or login failed");
      setSuccess(null);
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
          <h2>LOGIN</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              
              <input
                type="email"
                name="email"
                className="auth-input"
                placeholder="Email"
                onChange={handleChange}
                value={formData.email}
                required
              />
            </div>
            <div className="input-group">
              
              <input
                type="password"
                name="password"
                className="auth-input"
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

          {/* Success & Error Messages */}
          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}

          <p className="signup-link" style={{ marginTop:"10px" }}>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
         <div className="d-flex justify-content-center my-4">
  <Link to="/" className="btn btn-dark" style={{ color: "white" }}>
    ← Back to Home
  </Link>
</div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;