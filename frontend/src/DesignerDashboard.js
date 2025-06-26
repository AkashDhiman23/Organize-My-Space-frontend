import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./designerdashboard.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ;

function DesignerDashboard() {
  const [companyDetails, setCompanyDetails] = useState({
    company_logo:"",
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
    company_logo:"",
  });

  const [customers, setCustomers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
const [logoutMsg, setLogoutMsg] = useState(null);
const [loggingOut, setLoggingOut] = useState(false);
 const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
   const [existingLogoUrl, setExistingLogoUrl] = useState(null);

  // Helper functions to check current route
  const isActive = (p) => location.pathname === p;
  const isCompanyPage = isActive("/company-profile");
  const isClientsPage = isActive("/clients");

  const [searchTerm, setSearchTerm] = useState("");




function handleLogoutConfirm() {
  setShowLogoutConfirm(true);
}

function handleLogoutCancel() {
  setShowLogoutConfirm(false);
  setLogoutMsg(null);
}


  

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

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [projectSearch, setProjectSearch] = useState("");
 
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


const sanitizeClassName = (str) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[\/\\]/g, "")
    .replace(/[^a-z0-9-]/g, "");

 

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // When user clicks "Send to Production" button, open modal
  const confirmSendToProduction = (customerId) => {
    setSelectedCustomerId(customerId);
    setShowConfirmModal(true);
  };

  // Confirm action: update status and close modal
 // Confirm action: update status and close modal
const handleConfirm = async () => {
  if (!selectedCustomerId) return;
  setActionLoading(true);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/accounts/projects/customer/${selectedCustomerId}/send-to-production/`,
      {}, // empty body since backend overrides status anyway
      {
        headers: { "X-CSRFToken": csrftoken },
        withCredentials: true,
      }
    );

    const updatedStatus = response.data.status || "In Production";

    // Update local customer list
    setCustomers(prev =>
      prev.map(c =>
        c.id === selectedCustomerId
          ? {
              ...c,
              latest_project: {
                ...c.latest_project,
                status: updatedStatus,
              },
            }
          : c
      )
    );

    setShowConfirmModal(false);
    setSelectedCustomerId(null);
    setSuccessMessage(`Project status updated to ${updatedStatus} and sent to Production.`);
  } catch (err) {
    console.error(err);
    setSuccessMessage("Failed to update project status.");
  } finally {
    setActionLoading(false);
  }
};


const visibleCustomers = customers.filter(
  (c) =>
    (selectedStatus === "All" || c.latest_project?.status === selectedStatus) &&
    (
      c.name?.toLowerCase().includes(projectSearch.toLowerCase()) ||
      c.latest_project?.product_name?.toLowerCase().includes(projectSearch.toLowerCase())
    )
);


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
          <li className={`nav-item ${isClientsPage ? "active" : ""}`} onClick={() => navigate("/clients")}>
            <i className="bi bi-speedometer2" /> Dashboard
          </li>
          <li className={`nav-item ${isActive("/my-projects") ? "active" : ""}`} onClick={() => navigate("/my-projects")}>
            <i className="bi bi-folder2-open" /> Projects
          </li>
        
        
          <li className={`nav-item ${isActive("/designer-profile") ? "active" : ""}`} onClick={() => navigate("/company-profile")}>
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
       <nav className="top-navbar">
  <div className="company-logo" >
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
    Welcome to Designer Dashboard
  </div>
</nav>

        {/* Content */}
        <div className="main-content">
          {isCompanyPage ? (
  <section className="profile-card bg-white shadow-sm rounded-4 px-4 py-5 my-4">
    <div className="row gy-5 gx-4 align-items-start">
      {/* Avatar + quick info */}
      <div className="col-lg-4 text-center">
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
        <h4 className="fw-semibold mb-1">{member?.full_name || "—"}</h4>
        <span className="badge bg-primary-soft text-primary px-3 py-1 mb-2">
          {member?.role || "—"}
        </span>
        <p className="text-muted small mb-0">
          <i className="bi bi-envelope me-1"></i>
          {member?.email || "—"}
        </p>
      </div>

      {/* Details */}
      <div className="col-lg-8">
        {/* company block */}
        <h6 className="section-heading">
          <i className="bi bi-building me-2"></i>Company Details
        </h6>
                <div className="detail-grid mb-4">
          <div className="detail-row"><span>Name</span><strong>{company.company_name || "—"}</strong></div>
          <div className="detail-row"><span>Address</span><strong>{company.address || "—"}</strong></div>
          <div className="detail-row"><span>GST No.</span><strong>{company.gst_details || "—"}</strong></div>
        </div>

        <h6 className="section-heading">
          <i className="bi bi-person-lines-fill me-2"></i>Member Info
        </h6>
        <div className="detail-grid">
          <div className="detail-row"><span>Full Name</span><strong>{member?.full_name || "—"}</strong></div>
          <div className="detail-row"><span>Email</span><strong>{member?.email || "—"}</strong></div>
          <div className="detail-row"><span>Role</span><strong>{member?.role || "—"}</strong></div>
        </div>

      </div>
    </div>
  </section>
  
) : isClientsPage ? (
            <section className="clients-container container py-4 d-flex">
              {/* Left Sidebar */}
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

              {/* Right Content */}
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

      {/* NEW cells */}
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
          ) : (
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

              {/* Customer Table */}
              {/* ✅ Bootstrap Horizontal Tabs - always shown */}
<ul className="nav nav-tabs mb-3">
  {["All", "Pending", "In Design", "In Production", "Completed"].map((status) => (
    <li className="nav-item" key={status}>
      <button
        className={`nav-link ${selectedStatus === status ? "active" : ""}`}
        onClick={() => setSelectedStatus(status)}
      >
        {status}
      </button>
    </li>
  ))}
</ul>

              {visibleCustomers.length === 0 ? (

                
                <p className="text-muted">No customers found.</p>

                
              ) : (
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th><b>Project Name</b></th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Address</th>
                        <th>Project Deadline</th>
                     
      <th>Project Status</th>
                      <th>Joined</th>
                      <th>Last Update</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCustomers.map((c) => (
                      <tr key={c.id}>
                           <td><b>{c.latest_project?.product_name || "No Project"}</b></td>
                        <td>{c.name}</td>
                        <td>{c.email}</td>
                        <td>{c.contact_number}</td>
                        <td>{c.address || "N/A"}</td>
                        <td>
  {c.latest_project?.deadline_date ? (
    new Date(c.latest_project.deadline_date).toLocaleDateString()
  ) : (
    "No Deadline"
  )}
</td>
                      

                   <td>
  {c.latest_project ? (
    <span
      className={`badge status-badge ${c.latest_project.status
        .toLowerCase()
        .replace(/\s+/g, "-")}`}
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
                              navigate(`/project-details/${c.id}`);
                            }}
                            title="View Project Details"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="btn-icon"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              width="16"
                              height="16"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 16h8M8 12h8m-8-4h8M4 20h16a2 2 0 002-2v-6a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2z"
                              />
                            </svg>
                            Project Details
                          </a>

                       <a
  href="#"
  className="btn-link btn-send"
  style={{
    pointerEvents:
      c.latest_project?.status === "Completed" || c.latest_project?.status === "In Production"
        ? "none"
        : "auto",
    opacity:
      c.latest_project?.status === "Completed" || c.latest_project?.status === "In Production"
        ? 0.5
        : 1,
  }}
  aria-disabled={
    c.latest_project?.status === "Completed" || c.latest_project?.status === "In Production"
  }
  onClick={(e) => {
    e.preventDefault();
    confirmSendToProduction(c.id);
  }}
  title="Send to Production"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="btn-icon"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    width="16"
    height="16"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.752 11.168l-3.197-2.132a1 1 0 00-1.555.83v4.27a1 1 0 001.555.83l3.197-2.132a1 1 0 000-1.666z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
  Send to Production
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

      
    </div>


    



  );
}

export default DesignerDashboard;
