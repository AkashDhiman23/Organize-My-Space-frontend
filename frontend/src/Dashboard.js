import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Designer');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [settingsMessage, setSettingsMessage] = useState(null);

  const [members, setMembers] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const storedName = sessionStorage.getItem('username') || 'Admin';
    setUsername(storedName);
  }, []);

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

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchCompanyDetails();
    } else if (activeTab === 'add-member') {
      fetchMembers();
    } else if (activeTab === 'projects') {
      fetchCustomers();
    }
  }, [activeTab]);

  const fetchCompanyDetails = async () => {
    try {
      const res = await fetch('http://localhost:8000/accounts/company-details/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch company details');
      const data = await res.json();
      setCompanyName(data.company_name || '');
      setAddress(data.address || '');
      setGstNumber(data.gst_number || '');
    } catch (err) {
      setSettingsMessage('Error loading company details: ' + err.message);
    }
  };

  const fetchCustomers = async () => {
    try {
      const r = await fetch('http://localhost:8000/accounts/customers_admin/', {
        credentials: 'include',
      });
      if (!r.ok) throw new Error('Customers fetch failed');
      setCustomers(await r.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch('http://localhost:8000/accounts/members/', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch members');
      setMembers(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to get CSRF token from cookies
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/accounts/create-member/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
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
      fetchMembers(); // refresh member list
    } catch (error) {
      setMessage('Error creating member: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const csrftoken = getCookie('csrftoken');
      const response = await fetch('http://localhost:8000/accounts/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Logout failed');
      }

      sessionStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed: ' + error.message);
    }
  };

  const handleSaveCompanyDetails = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/accounts/company-details/', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
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

  /* ------------- render helpers ------------- */

  const renderCustomers = () =>
    customers.length === 0 ? (
      <p className="text-muted fst-italic">No customers found.</p>
    ) : (
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover table-bordered align-middle mb-0 bg-white">
          <thead className="table-primary text-primary fw-semibold">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Manager</th>
              <th>Status</th>
              <th style={{ minWidth: '180px' }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={c.id} className="align-middle">
                <td>{i + 1}</td>
                <td className="fw-semibold">{c.name}</td>
                <td>{c.email}</td>
                <td>{c.manager_name || '—'}</td>
                <td>
                  <span
                    className={`badge ${
                      c.status === 'Active'
                        ? 'bg-success'
                        : c.status === 'Pending'
                        ? 'bg-warning text-dark'
                        : 'bg-secondary'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td>
                  <div className="progress rounded-pill" style={{ height: '14px' }}>
                    <div
                      className={`progress-bar ${
                        c.progress_percentage === 100
                          ? 'bg-success'
                          : c.progress_percentage >= 50
                          ? 'bg-info'
                          : 'bg-warning'
                      }`}
                      style={{ width: `${c.progress_percentage}%` }}
                      aria-valuenow={c.progress_percentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                  <small className="text-muted">{c.progress_percentage}%</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  const renderMembers = () =>
    members.length === 0 ? (
      <p className="text-muted fst-italic">No members yet.</p>
    ) : (
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover table-bordered align-middle mb-0 bg-white">
          <thead className="table-secondary text-secondary fw-semibold">
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.id}>
                <td>{i + 1}</td>
                <td className="fw-semibold">{m.full_name}</td>
                <td>{m.email}</td>
                <td>{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>
            <div className="stats">
              <div className="card">Ongoing Projects: 3</div>
              <div className="card">New Projects: 1</div>
              <div className="card">Total Members: {members.length}</div>
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

            <div className="members-list mt-4">
              <h3>All Members</h3>
              {renderMembers()}
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="project-section">
            <h2>Project Management</h2>
            <h3 className="mt-4">Customers</h3>
            {renderCustomers()}
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
                disabled={loading}
              />
              <textarea
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="text"
                placeholder="GST Number"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                required
                disabled={loading}
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
