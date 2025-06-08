import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    address: '',
    gstDetails: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e =>
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  // Utility to get cookie by name
  const getCookie = name => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const csrfToken = getCookie('csrftoken'); // If cookie is set by Django

      const res = await fetch('http://localhost:8000/accounts/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, // send CSRF token in headers
        },
        credentials: 'include', // include cookies for session auth
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          company_name: formData.companyName,
          address: formData.address,
          gst_details: formData.gstDetails,
        }),
      });

      const data = await res.json();
      console.log('Signup response:', data);

      if (res.ok && data.admin_id) {
        alert('Signup successful!');
        navigate('/dashboard');
      } else {
        // If backend sends validation errors or message
        setError(data.detail || JSON.stringify(data));
      }
    } catch (error) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="left-section">
        <h1>SIGN UP FOR YOUR ACCOUNT</h1>
      </div>

      <div className="right-section">
        <div className="form-container">
          <h2>SIGN UP</h2>
          <p className="subtitle">Use your email to create an account</p>
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              onChange={handleChange}
              value={formData.fullName}
              required
            />
            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              value={formData.email}
              required
            />
            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
              required
            />
            {/* Confirm Password */}
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              value={formData.confirmPassword}
              required
            />
            {/* Company Name */}
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              onChange={handleChange}
              value={formData.companyName}
              required
            />
            {/* Address */}
            <input
              type="text"
              name="address"
              placeholder="Company Address"
              onChange={handleChange}
              value={formData.address}
              required
            />
            {/* GST Details */}
            <input
              type="text"
              name="gstDetails"
              placeholder="GST Details"
              onChange={handleChange}
              value={formData.gstDetails}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Signing up…' : 'Sign up'}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}

          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;