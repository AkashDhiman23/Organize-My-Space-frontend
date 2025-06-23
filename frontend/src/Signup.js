import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

/* helper: read cookie for CSRF */
const getCookie = (name) => {
  const v = `; ${document.cookie}`.split(`; ${name}=`);
  return v.length === 2 ? v.pop().split(";").shift() : "";
};

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
    if (!form.email) {
      setError("Enter e‑mail first");
      return;
    }
    setError(null);
    setInfo(null);
    setOtpLoading(true);

    try {
      const res = await fetch("http://localhost:8000/accounts/send-otp/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ email: form.email }),
      });
      if (!res.ok) throw new Error(await res.text());
      setOtpSent(true);
      setInfo("OTP sent! Check your inbox.");
    } catch (err) {
      setError(err.message || "Could not send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!form.otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/accounts/signup/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          password: form.password,
          company_name: form.companyName,
          address: form.address,
          gst_details: form.gstDetails,
          otp: form.otp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Signup failed");
      navigate("/login");
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
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={form.companyName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Company Address"
              value={form.address}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="gstDetails"
              placeholder="GST Details"
              value={form.gstDetails}
              onChange={handleChange}
              required
            />

            <div className="otp-row">
              <input
                type="text"
                name="otp"
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