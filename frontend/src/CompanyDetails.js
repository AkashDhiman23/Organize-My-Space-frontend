import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom'; 
import './Signup.css';

function CompanyDetails() {
  const { adminId } = useParams(); 
  const navigate = useNavigate();  

  const [companyData, setCompanyData] = useState({
    companyName: '',
    address: '',
    gstDetails: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setCompanyData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/accounts/create-company/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminId,
          CompanyName: companyData.companyName,
          Address: companyData.address,
          GSTDetails: companyData.gstDetails
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Company details saved successfully!');
        navigate('/dashboard'); // ✅ Use navigate instead of window.location.href
      } else {
        setError(data.detail || 'Failed to save company details');
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
          ADD YOUR COMPANY DETAILS
        </motion.h1>
      </div>

      <div className="right-section">
        <motion.div
          className="form-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2>Company Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fas fa-building" />
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                onChange={handleChange}
                value={companyData.companyName}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-map-marker-alt" />
              <input
                type="text"
                name="address"
                placeholder="Address"
                onChange={handleChange}
                value={companyData.address}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-file-invoice" />
              <input
                type="text"
                name="gstDetails"
                placeholder="GST Details"
                onChange={handleChange}
                value={companyData.gstDetails}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Finish'}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
        </motion.div>
      </div>
    </div>
  );
}

export default CompanyDetails;
