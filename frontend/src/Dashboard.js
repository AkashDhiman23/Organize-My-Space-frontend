// AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const CHART_COLORS = ["#4e79a7", "#f28e2b", "#59a14f"];


function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const [membersOpen, setMembersOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

 
  // Add member form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Designer');
  const [password, setPassword] = useState('');
 

  // Company settings form states
  const [companyName, setCompanyName] = useState('');
  const [fullNames, setFullNames] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [settingsMessage, setSettingsMessage] = useState(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);


  const [selectedDate, setSelectedDate] = useState("");
const [newCustomersCount, setNewCustomersCount] = useState(0);

const [successMessage, setSuccessMessage] = useState(null);
const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
const [logoutMsg, setLogoutMsg] = useState(null);
const [loggingOut, setLoggingOut] = useState(false);


  // ── State Variables ──
  const [activeTab, setActiveTab] = useState("dashboard");
  const [members, setMembers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(null);
  
 
  const [message, setMessage] = useState(null);


  const assignedProjects = customers.filter(
  c => c.latest_project && (c.latest_project.assigned_designer || c.latest_project.assigned_production)
).length;

const unassignedProjects = customers.filter(
  c => !c.latest_project || (!c.latest_project.assigned_designer && !c.latest_project.assigned_production)
).length;

const completedProjects = customers.filter(
  c =>
    c.latest_project &&
    (
      (typeof c.latest_project.progress_percentage === "number" && c.latest_project.progress_percentage >= 100) ||
      (c.latest_project.status?.toLowerCase() === "completed")
    )
).length;

  const projectPieData = [
    { name: "Assigned", value: assignedProjects },
    { name: "Unassigned", value: unassignedProjects },
    { name: "Completed", value: completedProjects },
  ];

  const overviewBarData = [
    { name: "Customers", value: customers.length },
    { name: "Team", value: members.length },
    { name: "Projects", value: customers.length },
  ];



  const fetchAll = useCallback(async () => {
  try {
    const [mRes, cRes, pRes, sRes] = await Promise.all([
      fetch("http://16.176.159.91:8000/accounts/members/", { credentials: "include" }),
      fetch("http://16.176.159.91:8000/accounts/all_customers_admin/", { credentials: "include" }),
      fetch("http://16.176.159.91:8000/accounts/projects-list/", { credentials: "include" }),
      fetch("http://16.176.159.91:8000/accounts/admin_settings/", { credentials: "include" }),
    ]);

    if (mRes.ok) {
      const membersData = await mRes.json();
      console.log("Members Data:", membersData);
      setMembers(membersData);
    }

    if (cRes.ok) {
      const customersData = await cRes.json();
      console.log("Customers Data:", customersData);
      setCustomers(customersData);
    }

    if (pRes.ok) {
      const projectsData = await pRes.json();
      console.log("Projects Data:", projectsData);
      setProjects(Array.isArray(projectsData) ? projectsData : projectsData.projects || []);
    }

    if (sRes.ok) {
      const settingsData = await sRes.json();
      console.log("Settings Data:", settingsData);
      if (settingsData.company_logo) {
        const fullUrl = settingsData.company_logo.startsWith("http")
          ? settingsData.company_logo
          : `http://16.176.159.91:8000${settingsData.company_logo.startsWith("/") ? "" : "/media/"}${settingsData.company_logo}`;
        setCompanyLogoUrl(fullUrl);
      }
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}, []);

  useEffect(() => {
    if (["dashboard", "projects", "view-members", "settings"].includes(activeTab)) {
      fetchAll();
    }
  }, [activeTab, fetchAll]);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [message]);



  // Load username from session on mount
  useEffect(() => {
    setUsername(sessionStorage.getItem('full_name') || 'Admin');
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

  
  

  const COLORS = ['#4caf50', '#ff9800'];

  // Helper to get CSRF token from cookies
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const handleAddMember = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Ensure CSRF token is set
    await fetch("http://16.176.159.91:8000/accounts/get-csrf/", {
      credentials: 'include',
    });

    const res = await fetch('http://16.176.159.91:8000/accounts/create-member/', {
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


  
function handleLogoutConfirm() {
  setShowLogoutConfirm(true);
}

function handleLogoutCancel() {
  setShowLogoutConfirm(false);
  setLogoutMsg(null);
}

const csrftoken = getCookie('csrftoken');
async function handleLogout() {
  setLoggingOut(true);
  setLogoutMsg(null);

  try {
    const response = await fetch("http://16.176.159.91:8000/accounts/logout/", {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      setLogoutMsg({ type: "success", text: data.message || "Logged out successfully." });

      setTimeout(() => {
        window.location.href = "/login";
      }, 10);
    } else {
      setLogoutMsg({ type: "error", text: "Logout failed. Please try again." });
    }
  } catch (err) {
    console.error("Logout error:", err);
    setLogoutMsg({ type: "error", text: "Something went wrong." });
  } finally {
    setLoggingOut(false);
    setShowLogoutConfirm(false); // hide confirmation box
  }

  
}

 
const teamMembers = members;   // alias so ESLint sees it
  
// Fetch company details with logo URL on mount
useEffect(() => {
  async function fetchSettings() {
    try {
      const res = await fetch('http://16.176.159.91:8000/accounts/admin_settings/', {
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
          : `http://16.176.159.91:8000/media/company_logos${data.company_logo}`;
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

      const res = await fetch('http://16.176.159.91:8000/accounts/admin_settings/', {
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
  const renderDashboard = () =>
  activeTab === "dashboard" && (
    <>
     

   

      {/* ── Grid layout ─────────────────────────────── */}
      <div className="dash-grid">
        {/* ◀ LEFT: Charts Section ◀ */}
        <div className="charts-stack">
          <div className="chart-box">
            <h4 className="chart-title">Project Distribution</h4>
            <PieChart width={300} height={240}>
              <Pie
                data={projectPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                label
              >
                <Cell fill="#4e79a7" />
                <Cell fill="#f28e2b" />
                <Cell fill="#59a14f" />
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={32} />
            </PieChart>
          </div>

          <div className="chart-box">
            <h4 className="chart-title">Overview</h4>
            <BarChart width={300} height={240} data={overviewBarData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </div>
        </div>

        {/* ▶ RIGHT: Stat Cards ▶ */}
        <div className="stats-cards">
          <div className="stat-card">
            <h3>{customers.length}</h3>
            <p>Total Customers</p>
            <i className="bi bi-people-fill stat-icon"></i>
          </div>

          

          <div className="stat-card">
            <h3>{teamMembers.length}</h3>
            <p>Team Members</p>
            <i className="bi bi-people stat-icon"></i>
          </div>

          <div className="stat-card">
            <h3>{customers.length}</h3>
            <p>Projects</p>
            <i className="bi bi-kanban stat-icon"></i>
          </div>

          <div className="stat-card">
            <h3>{assignedProjects}</h3>
            <p>Assigned Projects</p>
            <i className="bi bi-check2-circle stat-icon"></i>
          </div>

          <div className="stat-card">
            <h3>{unassignedProjects}</h3>
            <p>Unassigned Projects</p>
            <i className="bi bi-question-circle stat-icon"></i>
          </div>

          <div className="stat-card">
            <h3>{completedProjects}</h3>
            <p>Completed Projects</p>
            <i className="bi bi-flag stat-icon"></i>
          </div>
        </div>
      </div>
    </>
  );

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

        <li className={`menu-item ${membersOpen ? 'open' : ''}`}>
  <button
    type="button"
    className={`menu-header ${membersOpen ? 'active' : ''}`}
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
  </button>

  {membersOpen && (
    <ul className="submenu">
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

           <li
  className="nav-item logout-item"
  onClick={handleLogoutConfirm}
  style={{ cursor: "pointer" }}
>
  <i className="bi bi-box-arrow-right" /> Logout
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
        style={{ width: 80, height: 50, borderRadius: '50%', overflow: 'hidden' }}
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
 {/* Success / error message box */}
{successMessage && (
  <div className="modal-overlay">
    <div className="modal-box">
      <p>{successMessage}</p>
      <div className="modal-buttons">
        <button
          className="btn btn-confirm"
          onClick={() => setSuccessMessage(null)}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

{/* Logout Confirmation Modal */}
{showLogoutConfirm && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h4>Confirm Logout</h4>
      <p>Are you sure you want to logout?</p>
      <div className="modal-buttons">
        <button
          className="btn btn-confirm"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out…" : "Yes, Logout"}
        </button>
        <button
          className="btn btn-cancel"
          onClick={handleLogoutCancel}
          disabled={loggingOut}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{/* Logout message (success or error) */}
{logoutMsg && (
  <div
    className={`${logoutMsg.type}-message modal-overlay`}
    onClick={() => setLogoutMsg(null)}
  >
    <div className="modal-box" style={{ cursor: "pointer" }}>
      {logoutMsg.text}
    </div>
  </div>
)}
      
 



    </div>




  );
}
