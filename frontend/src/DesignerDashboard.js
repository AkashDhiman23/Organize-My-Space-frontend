import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./designerdashboard.css";

function DesignerDashboard() {
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

  const [customers, setCustomers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

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
        axios.get("http://localhost:8000/accounts/all-customers/", { withCredentials: true }),
        axios.get("http://localhost:8000/accounts/member-profile/", { withCredentials: true }),
      ]);

      setCustomers(custRes.data);
      setMember(memberRes.data); 
      setMember(memberRes.data.member);             
      setCompany(memberRes.data.company);   
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
    }
  })();
}, []);

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
    await axios.post(
      `http://localhost:8000/accounts/projects/customer/${selectedCustomerId}/send-to-production/`,
      { status: "Assigned" },
      { headers: { "X-CSRFToken": csrftoken }, withCredentials: true }
    );

    // update local state
    setCustomers(prev =>
      prev.map(c =>
        c.id === selectedCustomerId ? { ...c, status: "Assigned" } : c
      )
    );

    // close confirm dialog
    setShowConfirmModal(false);
    setSelectedCustomerId(null);

    // show success message
    setSuccessMessage("Project status updated to Assigned and sent to Production ");
  } catch (err) {
    console.error(err);
    setSuccessMessage("Failed to update project status.");
  } finally {
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
    try {
      const response = await fetch('http://localhost:8000/accounts/logout/', {
        method: 'POST',
        credentials: 'include', // Sends session cookie
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); 
        window.location.href = '/login'; // Redirect to login
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong.");
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
         <li className="nav-item" onClick={handleLogout}>
  <i className="bi bi-box-arrow-right" /> Logout
</li>

        </ul>
      </aside>

      {/* Main area */}
      <main className="main-area">
        {/* Top navbar */}
        <nav className="top-navbar">
          <div className="company-logo" onClick={() => navigate("/")}>
            <span>{ company.company_name || "Your Company"}</span>
          </div>
          <ul className="nav-links">
            <li className={`nav-link ${isClientsPage ? "active" : ""}`} onClick={() => navigate("/clients")}>
              <i className="bi bi-people" />Dashboard
            </li>
            <li className={`nav-link ${isActive("/my-projects") ? "active" : ""}`} onClick={() => navigate("/my-projects")}>
              <i className="bi bi-folder2-open" /> Projects
            </li>
           
          </ul>
        </nav>

        {/* Content */}
        <div className="main-content">
          {isCompanyPage ? (
  <section className="profile-card bg-white shadow-sm rounded-4 px-4 py-5 my-4">
    <div className="row gy-5 gx-4 align-items-start">
      {/* Avatar + quick info */}
      <div className="col-lg-4 text-center">
        <div className="avatar-circle mx-auto mb-3">
          <i className="bi bi-person-fill"></i>
        </div>
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
    <th>Project</th>          {/* NEW */}
    <th>Status</th>           {/* NEW */}
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
            className={`badge ${
              c.latest_project.status === "In Production"
                ? "bg-secondary"
                : c.latest_project.status === "In Design"
                ? "bg-warning text-dark"
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
  {c.latest_project?.status ? (
    <span
      style={{
        display: "inline-block",
        backgroundColor:
          c.latest_project.status === "In Production"
            ? "grey"
            : c.latest_project.status === "In Design"
            ? "yellow"
            : "transparent",
        color: "black",
        height: "25px",
        padding:"2px",
        
        borderRadius: "4px",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "0.85rem",
        userSelect: "none",
      }}
    >
      {c.latest_project.status}
    </span>
  ) : (
    "N/A"
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
                             style={{ pointerEvents: c.latest_project?.status === "Completed" ? "none" : "auto", opacity: c.latest_project?.status === "Completed" ? 0.5 : 1 }}
  aria-disabled={c.latest_project?.status === "Completed"}
                            onClick={(e) => {
                              e.preventDefault();
                              confirmSendToProduction(c.id);
                            }}
                            title="Send to production"
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
