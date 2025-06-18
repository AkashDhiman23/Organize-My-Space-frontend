// src/Signup.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";                // ← keep your styling

/* ────────────────────────────────────────────────────────── */
/*  Helper: read cookie (for CSRF or sessionid)             */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(";").shift() : null;
};
/* ────────────────────────────────────────────────────────── */

export default function Signup() {
  /* form state */
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

  /* ui state */
  const [loading, setLoading]   = useState(false);  // for signup
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent]   = useState(false);
  const [error, setError]       = useState(null);
  const [info,  setInfo]        = useState(null);

  const navigate = useNavigate();

  /* ────────────────── generic change handler ────────────────── */
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ───────────────────────── SEND OTP ───────────────────────── */
  const sendOtp = async () => {
    if (!form.email) {
      setError("Enter e‑mail first"); return;
    }
    setError(null); setInfo(null); setOtpLoading(true);

    try {
      const res = await fetch("http://localhost:8000/accounts/send-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
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

  /* ───────────────────────── SIGN‑UP ───────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setInfo(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match"); return;
    }
    if (!form.otp) {
      setError("Please enter the OTP"); return;
    }

    setLoading(true);
    try {
     const res = await fetch("http://localhost:8000/accounts/signup/", {
  method: "POST", // <-- this is correct
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": getCookie("csrftoken") || "",
  },
  credentials: "include",
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

      alert("Signup successful!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────────── MARK‑UP ───────────────────────── */
  return (
    <div className="signup-page">
      <div className="left-section">
        <h1>SIGN UP FOR YOUR ACCOUNT</h1>
      </div>

      <div className="right-section">
        <div className="form-container">
          <h2>SIGN UP</h2>
          <p className="subtitle">Use your email to create an account</p>

          <form onSubmit={handleSubmit}>
            {/* fullname / email */}
            <input name="fullName"  placeholder="Full Name"
                   value={form.fullName}  onChange={handleChange} required />
            <input name="email"     type="email" placeholder="you@example.com"
                   value={form.email}     onChange={handleChange} required />

            {/* passwords */}
            <input name="password"        type="password" placeholder="Password"
                   value={form.password}  onChange={handleChange} required />
            <input name="confirmPassword" type="password" placeholder="Confirm Password"
                   value={form.confirmPassword} onChange={handleChange} required />

            {/* company info */}
            <input name="companyName" placeholder="Company Name"
                   value={form.companyName} onChange={handleChange} required />
            <input name="address"     placeholder="Company Address"
                   value={form.address}     onChange={handleChange} required />
            <input name="gstDetails"  placeholder="GST Details"
                   value={form.gstDetails}  onChange={handleChange} required />

            {/* OTP + link */}
            <div className="otp-row">
              <input name="otp" placeholder="Enter OTP"
                     value={form.otp} onChange={handleChange}
                     disabled={!otpSent} required />
              <button
                type="button"
                className="link-btn"
                disabled={otpLoading}
                onClick={sendOtp}
              >
                {otpLoading ? "Sending…" : "Send OTP"}
              </button>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Signing up…" : "Sign up"}
            </button>
          </form>

          {info  && <p className="info">{info}</p>}
          {error && <p className="error-message">{error}</p>}

          <p className="switch-auth">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}