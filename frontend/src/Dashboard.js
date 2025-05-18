import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('');

  // Form states for Add Member
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Designer');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Company settings state (no logo)
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [settingsMessage, setSettingsMessage] = useState(null);

  useEffect(() => {
    const storedName = sessionStorage.getItem('username') || 'Admin';
    setUsername(storedName);
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (settingsMessage) {
      const timer = setTimeout(() => setSettingsMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [settingsMessage]);

  // Fetch company details when Settings tab is active
  useEffect(() => {
    if (activeTab === 'settings') {
      const token = sessionStorage.getItem('token');
      fetch('http://localhost:8000/accounts/company-details/', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch company details');
          return res.json();
        })
        .then((data) => {
          setCompanyName(data.company_name || '');
          setAddress(data.address || '');
          setGstNumber(data.gst_number || '');
        })
        .catch((err) => {
          setSettingsMessage('Error loading company details: ' + err.message);
        });
    }
  }, [activeTab]);

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = sessionStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8000/accounts/create-member/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          role,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create member');
      }

      await response.json();

      setMessage('Member added successfully!');
      setFullName('');
      setEmail('');
      setRole('Designer');
      setPassword('');
    } catch (error) {
      setMessage('Error creating member: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Save updated company details to backend
  const handleSaveCompanyDetails = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/accounts/company-details/', {
        method: 'PUT', // Or 'POST' depending on your API
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_name: companyName,
          address,
          gst_number: gstNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save company details');
      }

      await response.json();
      setSettingsMessage('Company settings saved successfully!');
    } catch (error) {
      setSettingsMessage('Error saving settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>
            <div className="stats">
              <div className="card">Ongoing Projects: 3</div>
              <div className="card">New Projects: 1</div>
              <div className="card">Total Members: 5</div>
            </div>
          </div>
        );
      case 'add-member':
        return (
          <div className="form-section">
            <h2>Add New Staff Member</h2>
            <form className="member-form" onSubmit={handleAddMember}>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="dropdown"
                required
                disabled={loading}
              >
                <option value="Designer">Designer</option>
                <option value="Manager">Manager</option>
                <option value="Production">Production</option>
              </select>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
            {message && <p className="message">{message}</p>}
          </div>
        );
      case 'projects':
        return (
          <div className="project-section">
            <h2>Project Management</h2>
            <ul>
              <li>Project A – Ongoing</li>
              <li>Project B – New</li>
              <li>Project C – Completed</li>
            </ul>
          </div>
        );
      case 'settings':
        return (
          <div className="settings-section">
            <h2>Company Settings</h2>
            <form className="settings-form" onSubmit={handleSaveCompanyDetails}>
              <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <textarea
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="GST Number"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
            {settingsMessage && <p className="message">{settingsMessage}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h1>Admin</h1>
        <nav>
          <ul>
            <li
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </li>
            <li
              className={activeTab === 'add-member' ? 'active' : ''}
              onClick={() => setActiveTab('add-member')}
            >
              Add Member
            </li>
            <li
              className={activeTab === 'projects' ? 'active' : ''}
              onClick={() => setActiveTab('projects')}
            >
              Projects
            </li>
            <li
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </li>
            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
              Logout
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-panel">
        <header>
          <h2>Welcome, {username}</h2>
          <div className="company-logo">
            <img src="/placeholder-logo.png" alt="Company Logo" />
          </div>
        </header>
        <section className="main-content">{renderContent()}</section>
      </main>
    </div>
  );
}

export default AdminDashboard;
