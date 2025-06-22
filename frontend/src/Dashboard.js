// AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import './Dashboard.css';



/* Helper for month names */
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [membersOpen, setMembersOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const [members, setMembers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);

  // Add member form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Designer');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  // Company settings form states
  const [companyName, setCompanyName] = useState('');
  const [fullNames, setFullNames] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [settingsMessage, setSettingsMessage] = useState(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);

  // Load username from session on mount
  useEffect(() => {
    setUsername(sessionStorage.getItem('full_name') || 'Admin');
  }, []);

  // Fetch all required data
  const fetchAll = useCallback(async () => {
    try {
      const [mRes, cRes, pRes, compRes] = await Promise.all([
        fetch('http://localhost:8000/accounts/members/', { credentials: 'include' }),
        fetch('http://localhost:8000/accounts/all_customers_admin/', { credentials: 'include' }),
        fetch('http://localhost:8000/accounts/projects/', { credentials: 'include' }),
        fetch('http://localhost:8000/accounts/admin_settings/', { credentials: 'include' }),
      ]);

      if (mRes.ok) setMembers(await mRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
      if (pRes.ok) setProjects(await pRes.json());

      if (compRes.ok) {
  const data = await compRes.json();
  setCompanyName(data.company_name || '');
  setAddress(data.address || '');
  setGstNumber(data.gst_details || '');

  // Fix: data.company_logo may be a full URL or a relative path
  // Adjust base URL if needed (backend should ideally send full URL)
  if (data.company_logo) {
    // If company_logo already includes "http" or starts with "/", use as is
    if (data.company_logo.startsWith('http') || data.company_logo.startsWith('/')) {
      setExistingLogoUrl(data.company_logo.startsWith('http')
        ? data.company_logo
        : `http://localhost:8000${data.company_logo}`
      );
    } else {
      // Otherwise prepend media folder
      setExistingLogoUrl(`http://localhost:8000/media/${data.company_logo}`);
    }
  } else {
    setExistingLogoUrl(null);
  }
}
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch fresh data when relevant tab is active
  useEffect(() => {
    if (['dashboard', 'projects', 'view-members', 'add-member', 'settings'].includes(activeTab)) {
      fetchAll();
    }
  }, [activeTab, fetchAll]);

  // Auto-clear messages
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

  // Group members by role
  const groupedMembers = {
    Designer: members.filter((m) => m.role === 'Designer'),
    Manager: members.filter((m) => m.role === 'Manager'),
    Production: members.filter((m) => m.role === 'Production'),
  };

  // Create project counts by month for bar chart
  const projectsByMonth = monthNames.map((m, i) => ({
    month: m,
    projects: projects.filter((p) => {
      if (!p.created_at) return false;
      const dt = new Date(p.created_at);
      return dt.getMonth() === i;
    }).length,
  }));

  // Create pie chart data for project status
  const projectStatusData = (() => {
    if (!projects.length) return [];
    const counts = {};
    projects.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Helper to get CSRF token from cookies
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  // Add member form submit handler
  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/accounts/create-member/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ full_name: fullName, email, role, password }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create member');
      }
      setMessage('Member added successfully!');
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('Designer');
      fetchAll();
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/accounts/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
      });
      sessionStorage.clear();
      window.location.href = '/login';
    } catch {
      alert('Logout failed');
    }
  };

  
// Fetch company details with logo URL on mount
useEffect(() => {
  async function fetchSettings() {
    try {
      const res = await fetch('http://localhost:8000/accounts/admin_settings/', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();

      setCompanyName(data.company_name || '');
      setAddress(data.address || '');
      setGstNumber(data.gst_details || '');
      setFullNames(data.full_name || '');


      // Here, data.company_logo is the path or URL from DB
      // Make sure it's a full URL or prepend your MEDIA URL if relative
      if (data.company_logo) {
        // For example, if relative path: 'uploads/logo.png'
        const fullLogoUrl = data.company_logo.startsWith('http')
          ? data.company_logo
          : `http://localhost:8000/media/company_logos${data.company_logo}`;
        setExistingLogoUrl(fullLogoUrl);
      } else {
        setExistingLogoUrl(null);
      }
    } catch (err) {
      console.error(err);
    }
  }
  fetchSettings();
}, []);

// When user selects new file, preview it
const handleLogoChange = (e) => {
  const file = e.target.files[0];
  setCompanyLogo(file);
  if (file) {
    const previewUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(previewUrl);
  } else {
    setLogoPreviewUrl(null);
  }
};


  // Save settings handler
  const handleSaveCompanyDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSettingsMessage(null);

    try {
      const formData = new FormData();
      formData.append('company_name', companyName);
      formData.append('address', address);
      formData.append('gst_details', gstNumber);
      if (companyLogo) formData.append('company_logo', companyLogo);

      const res = await fetch('http://localhost:8000/accounts/admin_settings/', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'), // implement getCookie accordingly
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to save settings');
      const data = await res.json();

      setSettingsMessage('Settings saved successfully');
      setExistingLogoUrl(data.company_logo || existingLogoUrl); // Update existing logo URL if changed
      setCompanyLogo(null);
      setLogoPreviewUrl(null);
    } catch (err) {
      setSettingsMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Member table component for role groups
  const MemberTable = ({ title, data }) => (
    <div className="table-wrapper flex-fill mx-2">
      <h5 className="table-title">{title}</h5>
      {data.length === 0 ? (
        <p className="text-muted fst-italic">No {title.toLowerCase()} found.</p>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-bordered table-hover mb-0 bg-white">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m, i) => (
                <tr key={m.id}>
                  <td>{i + 1}</td>
                  <td>{m.full_name}</td>
                  <td>{m.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCustomers = () =>
  customers.length === 0 ? (
    <p className="text-muted fst-italic">No customers found.</p>
  ) : (
    <div className="table-responsive shadow-sm rounded">
      <table className="table table-hover table-bordered align-middle mb-0 bg-white">
        <thead className="table-primary text-primary fw-semibold">
          <tr>
            <th>Sr no</th>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Address</th>
            <th>Project Name</th>
            <th>Project Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c, i) => (
            <tr key={c.id}>
              <td>{i + 1}</td>
              <td className="fw-semibold">{c.name}</td>
              <td>{c.email}</td>
              <td>{c.contact_number || "—"}</td>
              <td>{c.address || "—"}</td>

              <td>{c.latest_project?.product_name || "No Project"}</td>

              <td>
                {c.latest_project?.status ? (
                  <span
                    className={`badge ${
                      c.latest_project.status === "In Production"
                        ? "bg-secondary"
                        : c.latest_project.status === "In Design"
                        ? "bg-warning text-dark"
                        : c.latest_project.status === "Completed"
                        ? "bg-success"
                        : "bg-light text-muted"
                    }`}
                    style={{ fontSize: "0.75rem" }}
                  >
                    {c.latest_project.status}
                  </span>
                ) : (
                  "—"
                )}
              </td>

              <td>{new Date(c.created_at).toLocaleDateString()}</td>

              <td className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate(`/project-details-manager/${c.id}`)}
                >
                  Details
                </button>

              
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Dashboard overview content with charts
  const renderDashboard = () => (
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>

      <div className="stats-cards">
        <div className="card stat-card">
          <h3>{projects.length}</h3>
          <p>Total Projects</p>
        </div>
        <div className="card stat-card">
          <h3>{members.length}</h3>
          <p>Total Staff Members</p>
        </div>
        <div className="card stat-card">
          <h3>{customers.length}</h3>
          <p>Total Customers</p>
        </div>
        <div className="card stat-card">
          <h3>
            {projects.length
              ? Math.round(
                  projects.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) /
                    projects.length
                )
              : 0}
            %
          </h3>
          <p>Avg Project Progress</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h4>Projects by Month</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={projectsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="projects" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h4>Project Status Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={projectStatusData.length ? projectStatusData : [{ name: 'No Data', value: 1 }]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#82ca9d"
                dataKey="value"
                label
              >
                {(projectStatusData.length ? projectStatusData : [{ name: '', value: 1 }]).map(
                  (_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                )}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Member grids: 3 tables side by side
  const renderMemberGrids = () => (
    <div>
      <h2 className="mb-4">All Staff Members (By Role)</h2>
      <div className="d-flex flex-wrap">
        <MemberTable title="Designers" data={groupedMembers.Designer} />
        <MemberTable title="Managers" data={groupedMembers.Manager} />
        <MemberTable title="Production" data={groupedMembers.Production} />
      </div>
    </div>
  );

  // Add member form
  const renderAddMember = () => (
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
        <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
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

  // Company settings form
  const renderSettings = () => (
  <div className="main-content container my-4" style={{ maxWidth: '700px' }}>
    <section className="profile-card bg-white shadow-sm rounded-4 px-4 py-5">
            <div className="row gy-5 gx-4 align-items-start">

          {/* Left side: Logo preview or placeholder */}
          <div className="col-lg-4 text-center">
            <div
              className="avatar-circle mx-auto mb-3 bg-light d-flex align-items-center justify-content-center"
              style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden' }}
            >
              {logoPreviewUrl ? (
                <img
                  src={logoPreviewUrl}
                  alt="Company Logo Preview"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : existingLogoUrl ? (
                <img
                  src={existingLogoUrl}
                  alt="Company Logo"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : (
                <i className="bi bi-building fs-1 text-secondary"></i>
              )}
            </div>

            <p className="text-muted small">Upload a company logo</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              disabled={loading}
              className="form-control form-control-sm mt-2"
            />
          </div>

        {/* Right side: Form inputs in a detail grid style */}
        <div className="col-lg-8">
          <h6 className="section-heading mb-4">
            <i className="bi bi-building me-2"></i> Company Details
          </h6>

          <form onSubmit={handleSaveCompanyDetails}>
            <div className="detail-grid mb-3">
              <label className="form-label w-100 mb-1" htmlFor="companyName">
                <i className="bi bi-pen-fill me-1"></i> Company Name
              </label>
              <input
                id="companyName"
                type="text"
                className="form-control"
                placeholder="Company Name"
                value={companyName}
                disabled
              />
            </div>

            <div className="detail-grid mb-3">
              <label className="form-label w-100 mb-1" htmlFor="address">
                <i className="bi bi-pen-fill me-1"></i> Address
              </label>
              <textarea
                id="address"
                className="form-control"
                placeholder="Company Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                required
                disabled={loading}
              />
            </div>

            <div className="detail-grid mb-4">
              <label className="form-label w-100 mb-1" htmlFor="gstNumber">
                <i className="bi bi-pen-fill me-1"></i> GST Number
              </label>
              <input
                id="gstNumber"
                type="text"
                className="form-control"
                placeholder="GST Number"
                value={gstNumber}
                disabled
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </form>
          {settingsMessage && (
            <div className="alert alert-info mt-3" role="alert">
              {settingsMessage}
            </div>
          )}
        </div>
      </div>
    </section>
  </div>
);

  // Content switcher
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'view-members':
        return renderMemberGrids();
      case 'add-member':
        return renderAddMember();
      case 'projects':
        return (
          <div className="project-section">
            <h2>Customers & Projects</h2>
            {renderCustomers()}
          </div>
        );
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h1>Admin Dashboard</h1>
        <nav>
          <ul>
            <li
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              <i className="bi bi-speedometer2 me-2" />
              Dashboard
            </li>

            <li>
              <div
    className={`dropdown-header ${membersOpen ? 'active' : ''}`}
    onClick={() => setMembersOpen(!membersOpen)}
  >
    <i className="bi bi-people me-2" />
    Members
    <span className="ms-auto">
      {membersOpen ? (
        <i className="bi bi-caret-up-fill" />
      ) : (
        <i className="bi bi-caret-down-fill" />
      )}
    </span>
  </div>

  {/* ▼ NEW: wrapper keeps sub-list same width & background */}
  {membersOpen && (
    <div className="dropdown-collapse">
      <ul className="dropdown-menu">
        <li
          className={activeTab === 'view-members' ? 'active' : ''}
          onClick={() => setActiveTab('view-members')}
        >
          <i className="bi bi-list-ul me-2" />
          View All
        </li>
        <li
          className={activeTab === 'add-member' ? 'active' : ''}
          onClick={() => setActiveTab('add-member')}
        >
          <i className="bi bi-person-plus me-2" />
          Add New
        </li>
      </ul>
    </div>
  )}
            </li>

            <li
              className={activeTab === 'projects' ? 'active' : ''}
              onClick={() => setActiveTab('projects')}
            >
              <i className="bi bi-folder me-2" />
              Projects
            </li>

            <li
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              <i className="bi bi-gear me-2" />
              Settings
            </li>

            <li onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2" />
              Logout
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-panel">
  <header className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
    <div className="d-flex align-items-center">
      {/* Company logo */}
      <div
        className="avatar-circle bg-light d-flex align-items-center justify-content-center me-3"
        style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden' }}
      >
        {existingLogoUrl ? (
          <img
            src={existingLogoUrl}
            alt="Company Logo"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        ) : (
          <i className="bi bi-building fs-3 text-secondary"></i>
        )}
      </div>
      
      {/* Company name */}
      <h4 className="mb-0">{companyName || "Your Company"}</h4>
    </div>

    {/* Welcome message */}
    <h2 className="mb-0">Welcome, {fullNames}</h2>
  </header>

  <section className="main-content">{renderContent()}</section>
</main>

    </div>
  );
}
