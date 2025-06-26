import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './VerifyOtp.css';

const API_BASE_URL = "http://omsbackendenv-dev.ap-southeast-2.elasticbeanstalk.com";


function VerifyOtp() {
  const { admin_id } = useParams(); // from the URL: /verify-otp/:admin_id
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // for back navigation

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/accounts/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id, otp })
      });

      const data = await res.json();

      if (res.ok && data.message === "OTP verified successfully") {
        setSuccess(true);
        alert('OTP verified! You can now log in.');
        window.location.href = '/admin-login'; // Or your dashboard URL
      } else {
        setError(data.detail || 'OTP verification failed');
      }
    } catch {
      setError('Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="left-section">
        <motion.h1
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          VERIFY YOUR EMAIL
        </motion.h1>
      </div>

      <div className="right-section">
        <motion.div
          className="form-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2>Enter OTP</h2>
          <p className="subtitle">Check your email for the OTP</p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fas fa-key" />
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
          </form>

           {/* Back Button */}
          <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">OTP verified successfully!</p>}
        </motion.div>
      </div>
    </div>
  );
}

export default VerifyOtp;
