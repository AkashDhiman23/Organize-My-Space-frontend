import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import "./ManagerDashboard.css";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";


function ManagerDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [customers, setCustomers] = useState([]);
  
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    contact_number: "",
    address: "",
  });
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [productions, setProductions] = useState([]);
  const [existingLogoUrl, setExistingLogoUrl] = useState(null);
  const [message, setMessage] = useState(null); 

  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteNotes, setDeleteNotes] = useState({});
  const [isDeleting, setIsDeleting] = useState({});
  const [companyDetails, setCompanyDetails] = useState({
    company_name: "",
    full_name: "",
    company_logo: "",

  });

  

  /* ── filter date ─────────────────────────────────────────────── */
const [selectedDate, setSelectedDate] = useState("");   // "" = no filter

/* helper: normalise yyyy-mm-dd string from a Date or ISO */
const formatDay = (d) => new Date(d).toISOString().slice(0, 10);

/* ── filter customers by selected date ───────────────────────── */
const customersOnDate = selectedDate
  ? customers.filter((c) => formatDay(c.created_at) === selectedDate)
  : customers;

const newCustomersCount = customersOnDate.length;
  const [successMessage, setSuccessMessage] = useState(null);


  // Profile state for Profile tab
  const [profile, setProfile] = useState(null);
  const [profileCompany, setProfileCompany] = useState({
    company_name: "",
    address: "",
    gst_details: "",
    company_logo: "",
  });
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    
    fetchCustomers();
    fetchTeamMembers();
    fetchProjects();
    fetchProfileData();
  }, []);

  // Fetch company details
  const fetchCompanyDetails = async () => {
    try {
      const res = await axios.get("http://localhost:8000/accounts/company-details/", {
        withCredentials: true,
      });
      setCompanyDetails(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch company details.");
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/accounts/customers/", {
        withCredentials: true,
      });
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch customers.");
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8000/accounts/team-members/",
        { withCredentials: true }
      );
      setTeamMembers(data);           // array of { id, full_name, email, role }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch team members.");
    }
  };

  // Fetch projects (without overwriting teamMembers)
  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:8000/accounts/projects-list/", {
        withCredentials: true,
      });
      setProductions(res.data.productions); 
      setProjects(res.data.projects);
      setDesigners(res.data.designers);
      console.log("Projects loaded:", res.data.projects);
      // Removed setTeamMembers here to avoid overwriting teamMembers
    } catch (err) {
      console.error(err);
      alert("Failed to fetch projects.");
    }
  };

  const assignedProjects   = projects.filter(
  p => p.assigned_designer || p.assigned_production
).length;

const unassignedProjects = projects.filter(
  p => !p.assigned_designer && !p.assigned_production
).length;

const completedProjects  = projects.filter(
  p =>
    (typeof p.progress_percentage === "number" && p.progress_percentage >= 100) ||
    (p.status?.toLowerCase() === "completed")
).length;

  const fetchProfileData = async () => {
  try {
    const res = await axios.get(
      "http://localhost:8000/accounts/member-profile/",
      { withCredentials: true }
    );

    const member  = res.data.member  || res.data;   // member section
    const company = res.data.company || {};         // company section

    setProfile(member);

    setProfileCompany({
      company_name: company.company_name || "",
      address:      company.address      || "",
      gst_details:  company.gst_details  || "",
    });

    if (company.company_logo) {
      let logoUrl = "";

      if (company.company_logo.startsWith("http")) {
        logoUrl = company.company_logo;
      } else if (company.company_logo.startsWith("/")) {
        logoUrl = `http://localhost:8000${company.company_logo}`;
      } else {
        logoUrl = `http://localhost:8000/media/${company.company_logo}`;
      }

      setExistingLogoUrl(logoUrl);
    } else {
      setExistingLogoUrl(null);
    }
  } catch (err) {
    console.error("Failed to fetch profile data", err);
    alert("Failed to load profile data.");
  }
};
  const getStatusFromProgress = (progress) => {
    if (progress === 0) return "Not Started";
    if (progress > 0 && progress < 50) return "Designing";
    if (progress >= 50 && progress < 100) return "Production";
    if (progress >= 100) return "Completed";
    return "Unknown";
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
    const response = await fetch("http://localhost:8000/accounts/logout/", {
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


    // Automatically clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const handleAddCustomer = async (e) => {
    e.preventDefault();

    const payload = {
      name: newCustomer.name,
      email: newCustomer.email,
      contact_number: newCustomer.contact_number,
      address: newCustomer.address,
      progress_percentage: 0,
      product_name: newCustomer.product_name || "",
      length_ft: parseFloat(newCustomer.length_ft) || 0,
      width_ft: parseFloat(newCustomer.width_ft) || 0,
      depth_in: parseFloat(newCustomer.depth_in) || 0,
      body_color: newCustomer.body_color || "",
      door_color: newCustomer.door_color || "",
      body_material: newCustomer.body_material || "",
      door_material: newCustomer.door_material || "",
      deadline_date: newCustomer.deadline_date || null,
      status: "Pending",
    };

    try {
      await axios.post("http://localhost:8000/accounts/add-customer-project/", payload, {
        withCredentials: true,
      });

      setNewCustomer({
        name: "",
        email: "",
        contact_number: "",
        address: "",
        product_name: "",
        length_ft: "",
        width_ft: "",
        depth_in: "",
        body_color: "",
        door_color: "",
        body_material: "",
        door_material: "",
        deadline_date: "",
      });

         setMessage({ type: "success", text: "Customer and Project added successfully!" });
      fetchCustomers();
      fetchProjects();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to add customer and project." });

    }
  };

  const handleDeleteCustomer = async (id) => {
    const note = deleteNotes[id];
    if (!note || note.trim() === "") {
      alert("Please enter a note before deleting.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete this customer?\nNote: ${note}`)) {
      return;
    }
    try {
      setIsDeleting((prev) => ({ ...prev, [id]: true }));
      await axios.delete(`http://localhost:8000/accounts/customers/${id}/`, {
        data: { note },
        withCredentials: true,
      });
      setDeleteNotes((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      alert("Customer deleted successfully.");
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer. Please try again.");
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleStatusChange = async (id, statusText) => {
    let progress_percentage = 0;
    if (statusText === "Not Started") progress_percentage = 0;
    else if (statusText === "Designing") progress_percentage = 30;
    else if (statusText === "Production") progress_percentage = 70;
    else if (statusText === "Completed") progress_percentage = 100;
    try {
      await axios.patch(
        `http://localhost:8000/accounts/customers/${id}/`,
        { progress_percentage },
        { withCredentials: true }
      );
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const assignDesigner = async (projectId, designerId) => {
    try {
      await axios.patch(
        `http://localhost:8000/accounts/projects-assign/${projectId}/`,
        { assigned_designer: designerId },
        { withCredentials: true }
      );
      fetchProjects();
    } catch (error) {
      console.error("Failed to assign designer:", error);
      alert("Failed to assign designer. Please try again.");
    }
  };

  async function assignProduction(projectId, productionId) {
    try {
      await axios.patch(
        `http://localhost:8000/accounts/projects-assign-production/${projectId}/`,
        { assigned_production: productionId || null },
        { withCredentials: true }
      );

      // Refresh projects array or optimistically update state:
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, assigned_production: productionId } : p
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to assign production.");
    }
  }
  /* Data for charts */
const projectPieData = [
  { name: "Assigned",   value: assignedProjects },
  { name: "Unassigned", value: unassignedProjects },
  { name: "Completed",  value: completedProjects },
];

const overviewBarData = [
  { name: "Customers", value: customers.length },
  { name: "Team",      value: teamMembers.length },
  { name: "Projects",  value: projects.length },
];
   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
const [logoutMsg, setLogoutMsg] = useState(null);
const [loggingOut, setLoggingOut] = useState(false);


function handleLogoutConfirm() {
  setShowLogoutConfirm(true);
}

function handleLogoutCancel() {
  setShowLogoutConfirm(false);
  setLogoutMsg(null);
}
  

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar" role="navigation" aria-label="Manager dashboard navigation">
        <h2>Hi, {profile?.full_name || "Loading..."}</h2>
        <ul className="sidebar-menu">
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && setActiveTab("dashboard")}
            aria-current={activeTab === "dashboard" ? "page" : undefined}
          >
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </li>
          <li
            className={activeTab === "add-customer" ? "active" : ""}
            onClick={() => setActiveTab("add-customer")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && setActiveTab("add-customer")}
            aria-current={activeTab === "add-customer" ? "page" : undefined}
          >
            <i className="bi bi-person-plus me-2"></i> Add Customer
          </li>
          <li
            className={activeTab === "projects" ? "active" : ""}
            onClick={() => setActiveTab("projects")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && setActiveTab("projects")}
            aria-current={activeTab === "projects" ? "page" : undefined}
          >
            <i className="bi bi-kanban-fill me-2"></i> Projects
          </li>
          <li
            className={activeTab === "team" ? "active" : ""}
            onClick={() => setActiveTab("team")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && setActiveTab("team")}
            aria-current={activeTab === "team" ? "page" : undefined}
          >
            <i className="bi bi-people-fill me-2"></i> Team Members
          </li>
          <li
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && setActiveTab("profile")}
            aria-current={activeTab === "profile" ? "page" : undefined}
          >
            <i className="bi bi-person-circle me-2"></i> Profile
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

      {/* Main Area */}
      <main className="main-area">
        <nav className="top-navbar">
          <div className="company-logo d-flex align-items-center gap-2">
  {logoUrl ? (
    <img
      src={logoUrl}
      alt="Company Logo"
      style={{ height: 32, width: 32, objectFit: "contain", borderRadius: 6 }}
    />
  ) : (
    <i className="bi bi-building fs-5 text-secondary"></i> 
  )}
  <span>{profileCompany?.company_name || "Your Company"}</span>
</div>

          
          <div className="user-profile">
            <span className="user-name">{profile?.full_name || "—"}</span>

          </div>
        </nav>

        <div className="main-content">
     
     {activeTab === "dashboard" && (
  <>
    <h2 className="mb-3">Welcome, {profile?.full_name || "Manager"}!</h2>

    {/* ── Date filter row ────────────────────────────────────── */}
    <div className="date-filter">
      <label htmlFor="filterDate">Show customers added on: </label>
      <input
        id="filterDate"
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
    
    </div>

    {/* ── Two-column layout ─────────────────────────────────── */}
    <div className="dash-grid">
      {/* ◀ LEFT: charts ◀────────────────────────────────────── */}
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
            <Bar dataKey="value" radius={[4,4,0,0]} />
          </BarChart>
        </div>
      </div>

      {/* ▶ RIGHT: stat cards ▶──────────────────────────────── */}
      <div className="stats-cards">
        <div className="stat-card">
          <h3>{customers.length}</h3>
          <p>Total Customers</p>
          <i className="bi bi-people-fill stat-icon"></i>
        </div>

        {/* NEW: customers created on selected date */}
        <div className="stat-card highlight-card">
          <h3>{newCustomersCount}</h3>
          <p>
            {selectedDate ? `New on ${selectedDate}` : "New Customers"}
          </p>
          <i className="bi bi-calendar-event stat-icon"></i>
        </div>

        <div className="stat-card">
          <h3>{teamMembers.length}</h3>
          <p>Team Members</p>
          <i className="bi bi-people stat-icon"></i>
        </div>

        <div className="stat-card">
          <h3>{projects.length}</h3>
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
)}



          {/* Add Customer */}
          {activeTab === "add-customer" && (
            <form onSubmit={handleAddCustomer} className="add-customer-form">
              <h3>Add New Customer</h3>
              <div className="form-grid">
                {/* Left side: Customer Info */}
                <section className="customer-info">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact_number">Contact Number</label>
                    <input
                      id="contact_number"
                      type="text"
                      value={newCustomer.contact_number}
                      onChange={(e) => setNewCustomer({ ...newCustomer, contact_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      rows={3}
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    />
                  </div>
                </section>

                {/* Right side: Product / Project Details */}
                <section className="product-details">
                  <h4>Project Details</h4>

                  <div className="product-grid">
                    <div className="form-group">
                      <label htmlFor="product_name">Product Name</label>
                      <input
                        id="product_name"
                        type="text"
                        value={newCustomer.product_name || ""}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, product_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="length_ft">Height (ft)</label>
                      <input
                        id="length_ft"
                        type="number"
                        step="0.01"
                        value={newCustomer.length_ft || ""}
                        onChange={(e) => setNewCustomer({ ...newCustomer, length_ft: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="width_ft">Width (ft)</label>
                      <input
                        id="width_ft"
                        type="number"
                        step="0.01"
                        value={newCustomer.width_ft || ""}
                        onChange={(e) => setNewCustomer({ ...newCustomer, width_ft: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="depth_in">Depth (in)</label>
                      <input
                        id="depth_in"
                        type="number"
                        step="0.01"
                        value={newCustomer.depth_in || ""}
                        onChange={(e) => setNewCustomer({ ...newCustomer, depth_in: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="body_color">Body Color</label>
                      <input
                        id="body_color"
                        type="text"
                        value={newCustomer.body_color || ""}
                        onChange={(e) => setNewCustomer({ ...newCustomer, body_color: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="door_color">Door Color</label>
                      <input
                        id="door_color"
                        type="text"
                        value={newCustomer.door_color || ""}
                        onChange={(e) => setNewCustomer({ ...newCustomer, door_color: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="body_material">Body Material</label>
                      <input
                        id="body_material"
                        type="text"
                        value={newCustomer.body_material || ""}
                        onChange={(e) => setNewCustomer({ ...newCustomer, body_material: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="door_material">Door Material</label>
                      <input
                        id="door_material"
                        type="text"
                        value={newCustomer.door_material || ""}
                        onChange={(e) => setNewCustomer({ ...newCustomer, door_material: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="deadline_date">Project Deadline</label>
                      <input
                        id="deadline_date"
                        type="date"
                        value={newCustomer.deadline_date || ""}
                        onChange={(e) => setNewCustomer({ ...newCustomer, deadline_date: e.target.value })}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <button type="submit" className="btn-submit">
                Save All Details
              </button>
            </form>
          )}

          {/* Projects */}
          {activeTab === "projects" && (
            <div>
              <h2>Projects</h2>

              {projects.length === 0 ? (
                <p>No projects found.</p>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Project&nbsp;ID</th>
                      <th>Customer</th>
                      <th>Product&nbsp;Name</th>
                      <th>Status</th>
                      <th>Assigned&nbsp;Designer</th>
                      <th>Assign&nbsp;to&nbsp;Designer</th>
                      <th>Assigned&nbsp;Production</th>
                      <th>Assign&nbsp;to&nbsp;Production</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {projects.map((proj) => {
                      const assignedDesigner = designers.find(d => d.id === proj.assigned_designer);
                      const assignedProduction = productions.find(p => p.id === proj.assigned_production);

                      return (
                        <tr key={proj.id}>
                          <td>{proj.id}</td>
                          <td>{proj.customer_name || proj.customer}</td>
                          <td>{proj.product_name}</td>
                          <td>{proj.status}</td>

                          {/* designer cells */}
                          <td>{assignedDesigner ? assignedDesigner.full_name : "None"}</td>
                          <td>
                            <select
                              value={proj.assigned_designer || ""}
                              onChange={(e) => assignDesigner(proj.id, e.target.value)}
                              disabled={!!proj.assigned_designer}   // disable if already assigned
                            >
                              <option value="">-- Select Designer --</option>
                              {designers.map((d) => (
                                <option key={d.id} value={d.id}>{d.full_name}</option>
                              ))}
                            </select>
                          </td>

                          {/* production cells */}
                          <td>{assignedProduction ? assignedProduction.full_name : "None"}</td>
                          <td>
                            <select
                              value={proj.assigned_production || ""}
                              onChange={(e) => assignProduction(proj.id, e.target.value)}
                              disabled={!!proj.assigned_production} // disable if already assigned
                            >
                              <option value="">-- Select Production --</option>
                              {productions.map((p) => (
                                <option key={p.id} value={p.id}>{p.full_name}</option>
                              ))}
                            </select>
                          </td>

                          <td>
                            <a
                              href="#"
                              className="btn-link"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/project-details-manager/${proj.customer}`);
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
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Team Members */}
          {activeTab === "team" && (
  <div className="team-section">
    <h2>All Team Members</h2>

    {teamMembers.length === 0 ? (
      <p>No team members found.</p>
    ) : (
      <div className="team-members-grid">
        {teamMembers.map((member) => (
          <div key={member.id} className="team-member-card bg-white shadow-sm rounded-3 p-3 mb-3 d-flex align-items-center">
            <div className="avatar-circle me-3">
              <i className="bi bi-person-fill" style={{ fontSize: "2rem", color: "#0d6efd" }}></i>
            </div>
            <div className="member-info">
              <h5 className="mb-1">{member.full_name}</h5>
              <p className="mb-0 text-muted small">{member.role}</p>
              <p className="mb-0">
                <i className="bi bi-envelope me-1"></i>
                {member.email}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

  {/* Message box */}
      {message && (
        <div
          style={{
            padding: "10px 15px",
            margin: "15px 0",
            borderRadius: 4,
            color: message.type === "success" ? "green" : "red",
            backgroundColor: message.type === "success" ? "#e6ffe6" : "#ffe6e6",
            border: `1px solid ${message.type === "success" ? "green" : "red"}`,
            textAlign: "center",
            position: "relative",
            maxWidth: 400,
          }}
          role="alert"
          aria-live="assertive"
        >
          {message.text}
          <button
            onClick={() => setMessage(null)}
            style={{
              position: "absolute",
              top: 5,
              right: 8,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 16,
              lineHeight: 1,
            }}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
  )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
  <div className="profile-section">
    <h2>Profile</h2>

    {profile ? (
      <section className="profile-card bg-white shadow-sm rounded-4 px-4 py-5 my-4 mx-auto" style={{ maxWidth: "900px" }}>
        <div className="row gy-5 gx-4 align-items-start">
          {/* Avatar + quick info */}
          <div className="col-lg-4 text-center">
            <div className="avatar-circle mx-auto mb-3">
              <i className="bi bi-person-fill"></i>
            </div>
            <h4 className="fw-semibold mb-1">{profile.full_name || "—"}</h4>
            <span className="badge bg-primary-soft text-primary px-3 py-1 mb-2">
              {profile.role || "—"}
            </span>
            <p className="text-muted small mb-0">
              <i className="bi bi-envelope me-1"></i>
              {profile.email || "—"}
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
                <strong>{profileCompany.company_name || "—"}</strong>
              </div>
              <div className="detail-row">
                <span>Address</span>
                <strong>{profileCompany.address || "—"}</strong>
              </div>
              <div className="detail-row">
                <span>GST No.</span>
                <strong>{profileCompany.gst_details || "—"}</strong>
              </div>
            </div>

            <h6 className="section-heading">
              <i className="bi bi-person-lines-fill me-2"></i>Member Info
            </h6>
            <div className="detail-grid">
              <div className="detail-row">
                <span>Full Name</span>
                <strong>{profile.full_name || "—"}</strong>
              </div>
              <div className="detail-row">
                <span>Email</span>
                <strong>{profile.email || "—"}</strong>
              </div>
              <div className="detail-row">
                <span>Role</span>
                <strong>{profile.role || "—"}</strong>
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

        
      </main>
      
      

    </div>

    
  );
}

export default ManagerDashboard;

