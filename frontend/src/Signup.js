import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

const API_BASE_URL = "http://omsbackendenv-dev.ap-southeast-2.elasticbeanstalk.com";

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    address: "",
    gstDetails: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const sendOtp = async () => {
    if (!form.email.trim()) {
      setError("Please enter your email first.");
      return;
    }
    setError(null);
    setInfo(null);
    setOtpLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/accounts/send-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.detail || "Could not send OTP");

      setOtpSent(true);
      setInfo("OTP sent! Please check your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/accounts/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          company_name: form.companyName.trim(),
          address: form.address.trim(),
          gst_details: form.gstDetails.trim(),
          otp: form.otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));

      // Store JWT tokens if returned
      if (data.access && data.refresh) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
      }

      setInfo("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
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
            <input
              type="text"
              name="fullName"
              className="auth-input"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              className="auth-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              className="auth-input"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            <input
              type="password"
              name="confirmPassword"
              className="auth-input"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
            <input
              type="text"
              name="companyName"
              className="auth-input"
              placeholder="Company Name"
              value={form.companyName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="address"
              className="auth-input"
              placeholder="Company Address"
              value={form.address}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="gstDetails"
              className="auth-input"
              placeholder="GST Details"
              value={form.gstDetails}
              onChange={handleChange}
              required
            />

            <div className="otp-row">
              <input
                type="text"
                name="otp"
                className="auth-input"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={handleChange}
                disabled={!otpSent}
                required
              />
              <button
                type="button"
                className="link-btn"
                onClick={sendOtp}
                disabled={otpLoading}
              >
                {otpLoading ? "Sending…" : "Send OTP"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-100 mt-2"
            >
              {loading ? "Signing up…" : "Sign up"}
            </button>
          </form>

          {info && <p className="info">{info}</p>}
          {error && <p className="error-message">{error}</p>}

          <p className="switch-auth mt-3 text-center">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}