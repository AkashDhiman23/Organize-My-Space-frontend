import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Signup.css';

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '', // New field for full name
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState(null); // Store the admin ID after successful signup

  const handleChange = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/accounts/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName, // Sending the full name in the request
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();

      if (res.ok && data.admin_id) {
        setAdminId(data.admin_id);
        alert('Signup successful! Check your email for the OTP.');
        window.location.href = `/verify-otp/${data.admin_id}`; // Redirect to OTP verification page
      } else {
        setError(data.detail || 'Signup failed');
      }
    } catch {
      setError('Could not connect to server');
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
        >
          SIGN UP FOR YOUR ACCOUNT
        </motion.h1>
      </div>

      <div className="right-section">
        <motion.div
          className="form-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2>SIGN UP</h2>
          <p className="subtitle">Use your email to create an account</p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fas fa-user" />
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                onChange={handleChange}
                value={formData.fullName}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-envelope" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
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
            <div className="input-group">
              <i className="fas fa-lock" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                value={formData.confirmPassword}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Signing up…' : 'Sign up'}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}

          <div className="divider">OR</div>

          <div className="social-buttons">
            <button className="google-btn">
              <i className="fab fa-google" /> Google
            </button>
            <button className="facebook-btn">
              <i className="fab fa-facebook-f" /> Facebook
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Signup;
