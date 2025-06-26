import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom'; 
import './Signup.css';


const API_BASE_URL = "http://omsbackendenv-dev.ap-southeast-2.elasticbeanstalk.com";



// Helper function to get CSRF token from cookies
function getCookie(name) {
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
}


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

    const csrftoken = getCookie('csrftoken');

    try {
      const res = await fetch(`${API_BASE_URL}/accounts/create-company/`, {
        method: 'POST',
        credentials: 'include',  // Send cookies (sessionid)
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,  // CSRF token header
        },
        body: JSON.stringify({
          admin_id: adminId,
          company_name: companyData.companyName,
          address: companyData.address,
          gst_details: companyData.gstDetails
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Company details saved successfully!');
        navigate('/dashboard'); // Navigate on success
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