import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import { useNavigate, useLocation } from "react-router-dom";
import "./designerdashboard.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

function ProductionDashboard() {
  const [companyDetails, setCompanyDetails] = useState({
    company_name: "",
    full_name: "",
    address: "",
    gst_details: "",
  });
  const [successMessage, setSuccessMessage] = useState(null);

   /* 🔑 ➊  NEW state ↓↓↓  */
  const [member,  setMember]  = useState(null);   // whole member object
  const [company, setCompany] = useState({        // nested company part
    company_name: "",
    address:      "",
    gst_details:  "",
  });


  const [activeTab, setActiveTab] = useState("dashboard");


  const [customers, setCustomers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const [existingLogoUrl, setExistingLogoUrl] = useState(null);
    const [message, setMessage] = useState(null); 
    
      const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  

  const [showLogoutModal, setShowLogoutModal] = useState(false);
const [logoutLoading, setLogoutLoading] = useState(false);

  // Helper functions to check current route
  const isActive = (p) => location.pathname === p;
  const isCompanyPage = isActive("/company-profile");
  const isClientsPage = isActive("/clients");

  const [searchTerm, setSearchTerm] = useState("");


  

  // Filter customers based on search term (case-insensitive)
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.contact_number && c.contact_number.includes(searchTerm)) ||
    (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // get new clients count in last 30 days
  const getNewClientsCount = (custs) => {
    const now = new Date();
    const cutoff = new Date(now.setDate(now.getDate() - 30));
    return custs.filter((c) => new Date(c.created_at) >= cutoff).length;
  };

  // Search + Sort state
  const [custSearch, setCustSearch] = useState("");
  const [sortKey, setSortKey] = useState("name"); // 'name' | 'joined' | 'updated'

  const sortCustomers = (arr) => {
    return [...arr].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "joined") return new Date(b.created_at) - new Date(a.created_at);
      if (sortKey === "updated") return new Date(b.updated_at) - new Date(a.updated_at);
      return 0;
    });
  };

  const visibleCustomers = sortCustomers(
    customers.filter((c) =>
      c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(custSearch.toLowerCase()) ||
      (c.contact_number && c.contact_number.includes(custSearch))
    )
  );
  
useEffect(() => {
  (async () => {
    try {
      const [custRes, memberRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/accounts/all-customers/`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/accounts/member-profile/`, { withCredentials: true }),
      ]);

      setCustomers(custRes.data);
      setMember(memberRes.data.member);             
      setCompany(memberRes.data.company);

      // ✅ Safely handle company logo after setting it
      const companyData = memberRes.data.company;

      if (companyData && companyData.company_logo) {
        let logoUrl = "";

        if (companyData.company_logo.startsWith("http")) {
          logoUrl = companyData.company_logo;
        } else if (companyData.company_logo.startsWith("/")) {
          logoUrl = `${API_BASE_URL}${companyData.company_logo}`;
        } else {
          logoUrl = `${API_BASE_URL}/media/${companyData.company_logo}`;
        }

        setExistingLogoUrl(logoUrl);
      } else {
        setExistingLogoUrl(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
    }
  })();
}, []);


  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
 const [logoutMsg, setLogoutMsg] = useState(null);
 const [loggingOut, setLoggingOut] = useState(false);
 

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // When user clicks "Send to Production" button, open modal
  const confirmSendToProduction = (customerId) => {
    setSelectedCustomerId(customerId);
    setShowConfirmModal(true);
  };



  

function handleLogoutConfirm() {
  setShowLogoutConfirm(true);
}

function handleLogoutCancel() {
  setShowLogoutConfirm(false);
  setLogoutMsg(null);
}


  

  // Confirm action: update status and close modal
 // Confirm action: update status and close modal

/* ─────────────────────── send‑to‑manager flow ─────────────────────── */
  const confirmSendToManager = (id) => {
    setSelectedCustomerId(id);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedCustomerId) return;
    setActionLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/accounts/projects/customer/${selectedCustomerId}/send-to-manager/`,
        {},
        { headers: { "X-CSRFToken": csrftoken }, withCredentials: true }
      );

      /* 🔄  auto‑refresh customers from backend */
      // await fetchAll();

      setSuccessMessage("Project marked Completed and sent to the manager.");
    } catch (err) {
      console.error(err);
      setSuccessMessage("Failed to update project status.");
    } finally {
      setShowConfirmModal(false);
      setSelectedCustomerId(null);
      setActionLoading(false);
    }
  };


  // Cancel action: close modal
  const handleCancel = () => {
    setShowConfirmModal(false);
    setSelectedCustomerId(null);
  };

  // Utility function to get a cookie value by name
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

// In your React code:
const csrftoken = getCookie('csrftoken');
async function handleLogout() {
  setLoggingOut(true);
  setLogoutMsg(null);

  try {
    const response = await fetch(`${API_BASE_URL}/accounts/logout/`, {
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



  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Hi, {member?.full_name || "User"}</h2>
        <hr className="sidebar-divider" />

       <ul className="sidebar-menu">
  <li
    className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
    onClick={() => setActiveTab("dashboard")}
    role="button"
  >
    <i className="bi bi-speedometer2" /> Dashboard
  </li>

  <li
    className={`nav-item ${activeTab === "projects" ? "active" : ""}`}
    onClick={() => setActiveTab("projects")}
    role="button"
  >
    <i className="bi bi-folder2-open" /> Projects
  </li>

  <li
    className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
    onClick={() => setActiveTab("profile")}
    role="button"
  >
    <i className="bi bi-person-badge" /> My Profile
  </li>

<li
  className="nav-item logout-item"
  onClick={handleLogoutConfirm}
  style={{ cursor: "pointer" }}
>
  <i className="bi bi-box-arrow-right" /> Logout
</li>
</ul>
      </aside>

      {/* Main area */}
      <main className="main-area">
        {/* Top navbar */}
      <nav className="top-navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1rem" }}>
  {/* Left side: logo and company name */}
  <div className="company-logo" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
    <span>{company.company_name || "Your Company"}</span>
  </div>

  {/* Right side: welcome message */}
  <div className="welcome-text" style={{ fontWeight: "800", fontSize: "1.5rem", color: "#333" }}>
    Welcome to Production Dashboard
  </div>
</nav>


        {/* Content */}
        <div className="main-content">
      {activeTab === "profile" && (
  <div className="profile-section">
    <h2>Profile</h2>

    {member ? (
      <section
        className="profile-card bg-white shadow-sm rounded-4 px-4 py-5 my-4 mx-auto"
        style={{ maxWidth: "900px" }}
      >
        <div className="row gy-5 gx-4 align-items-start">
          {/* Avatar + quick info */}
          <div className="col-lg-4 text-center">
            <div className="avatar-circle mx-auto mb-3">
              {logoPreviewUrl ? (
                <img
                  src={logoPreviewUrl}
                  alt="Company Logo Preview"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              ) : existingLogoUrl ? (
                <img
                  src={existingLogoUrl}
                  alt="Company Logo"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              ) : (
                <i className="bi bi-building fs-1 text-secondary"></i>
              )}
            </div>
            <h4 className="fw-semibold mb-1">{member.full_name || "—"}</h4>
            <span className="badge bg-primary-soft text-primary px-3 py-1 mb-2">
              {member.role || "—"}
            </span>
            <p className="text-muted small mb-0">
              <i className="bi bi-envelope me-1"></i>
              {member.email || "—"}
            </p>
          </div>

          {/* Details */}
          <div className="col-lg-8">
            {/* Company block */}
            <h6 className="section-heading">
              <i className="bi bi-building me-2"></i>Company Details
            </h6>
            <div className="detail-grid mb-4">
              <div className="detail-row">
                <span>Name</span>
                <strong>{company.company_name || "—"}</strong>
              </div>
              <div className="detail-row">
                <span>Address</span>
                <strong>{company.address || "—"}</strong>
              </div>
              <div className="detail-row">
                <span>GST No.</span>
                <strong>{company.gst_details || "—"}</strong>
              </div>
            </div>

            <h6 className="section-heading">
              <i className="bi bi-person-lines-fill me-2"></i>Member Info
            </h6>
            <div className="detail-grid">
              <div className="detail-row">
                <span>Full Name</span>
                <strong>{member.full_name || "—"}</strong>
              </div>
              <div className="detail-row">
                <span>Email</span>
                <strong>{member.email || "—"}</strong>
              </div>
              <div className="detail-row">
                <span>Role</span>
                <strong>{member.role || "—"}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    ) : (
      <p>Loading profile information...</p>
    )}
  </div>
)}
{activeTab === "dashboard" && (
  <section className="clients-container container py-4 d-flex">
    {/* Sidebar for filters */}
    <aside className="clients-sidebar p-4 me-6">
      <h4 className="sidebar-title mb-3">Client Filters</h4>
      <input
        type="text"
        placeholder="Search clients..."
        className="search-input mb-2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <p className="filter-info text-muted">Filter and manage your clients easily.</p>
    </aside>

    {/* Clients main section */}
    <div className="clients-main flex-grow-1">
      <h3 className="mb-4 text-secondary fw-bold">Clients Overview</h3>
      <div className="summary-row">
        <div className="summary-card total-clients">
          <h5>Total Clients</h5>
          <p>{filteredCustomers.length}</p>
        </div>
        <div className="summary-card new-clients">
          <h5>New Clients (Last 30 days)</h5>
          <p>{getNewClientsCount(filteredCustomers)}</p>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <p className="text-center text-muted">No clients found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Project</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.contact_number}</td>
                  <td>{c.address || "N/A"}</td>
                  <td>{c.latest_project?.product_name || "—"}</td>
                    <td>
        {c.latest_project ? (
           <span
                      className={`badge status-badge ${c.latest_project.status.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {c.latest_project.status}
                    </span>
        ) : (
          "—"
        )}
      </td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </section>
)}

{activeTab === "projects" && (
  <section className="customer-list-section">
    {/* Search + Sort */}
    <div className="customer-toolbar">
      <input
        type="text"
        placeholder="Search Customers..."
        className="search-input mb-2"
        value={custSearch}
        onChange={(e) => setCustSearch(e.target.value)}
      />
      <select
        className="form-select customer-sort"
        value={sortKey}
        onChange={(e) => setSortKey(e.target.value)}
      >
        <option value="name">Sort • Name A-Z</option>
        <option value="joined">Sort • Newest Joined</option>
        <option value="updated">Sort • Recently Updated</option>
      </select>
    </div>

    {/* Customers Table */}
    {visibleCustomers.length === 0 ? (
      <p className="text-muted">No customers found.</p>
    ) : (
      <table className="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Address</th>
            <th>Project Name</th>
            <th>Project Status</th>
            <th>Joined</th>
            <th>Last Update</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleCustomers.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.contact_number}</td>
              <td>{c.address || "N/A"}</td>
              <td>{c.latest_project?.product_name || "No Project"}</td>
              <td>
        {c.latest_project ? (
           <span
                      className={`badge status-badge ${c.latest_project.status.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {c.latest_project.status}
                    </span>
        ) : (
          "—"
        )}
      </td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
              <td>{new Date(c.updated_at).toLocaleString()}</td>
              <td>
                <a
                  href="#"
                  className="btn-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/project-details-product/${c.id}`);
                  }}
                >
                  View Details
                </a>
                <a
                  href="#"
                  className="btn-link btn-send"
                  onClick={(e) => {
                    e.preventDefault();
                    confirmSendToProduction(c.id);
                  }}
                  style={{
                    pointerEvents: c.latest_project?.status === "Completed" ? "none" : "auto",
                    opacity: c.latest_project?.status === "Completed" ? 0.5 : 1,
                  }}
                >
                  Send to Manager
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </section>
)}

        </div>
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Confirm Action</h4>
            <p>Are you sure you want to send this project to production?</p>
            <div className="modal-buttons">
              <button
                className="btn btn-confirm"
                onClick={handleConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Yes"}
              </button>
              <button
                className="btn btn-cancel"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                No
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

export default ProductionDashboard;