import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import "./ManagerDashboard.css";

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

  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteNotes, setDeleteNotes] = useState({});
  const [isDeleting, setIsDeleting] = useState({});
  const [companyDetails, setCompanyDetails] = useState({
    company_name: "",
    full_name: "",

  });

  // Profile state for Profile tab
  const [profile, setProfile] = useState(null);
  const [profileCompany, setProfileCompany] = useState({
    company_name: "",
    address: "",
    gst_details: "",
  });

  useEffect(() => {
    fetchCompanyDetails();
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

  // Fetch profile data for Profile tab
  const fetchProfileData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/accounts/member-profile/", {
        withCredentials: true,
      });
      setProfile(res.data.member || res.data);
      setProfileCompany(res.data.company || { company_name: "", address: "", gst_details: "" });
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

      alert("Customer and Project added successfully!");
      fetchCustomers();
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to add customer and project.");
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

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar" role="navigation" aria-label="Manager dashboard navigation">
        <h2>Hi, {companyDetails.full_name}</h2>
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
            role="button"
            tabIndex={0}
            onClick={() => alert("Logout clicked!")}
            onKeyPress={(e) => e.key === "Enter" && alert("Logout clicked!")}
          >
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </li>
        </ul>
      </aside>

      {/* Main Area */}
      <main className="main-area">
        <nav className="top-navbar">
          <div className="company-logo">
            🌟 <span>{companyDetails.company_name}</span>
          </div>
          
          <div className="user-profile">
            <span className="user-name">{companyDetails.full_name}</span>
          </div>
        </nav>

        <div className="main-content">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <>
              <h2>Welcome, {companyDetails.full_name}!</h2>
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
                  <h3>{projects.length}</h3>
                  <p>Projects</p>
                  <i className="bi bi-kanban stat-icon"></i>
                </div>
              </div>
              <p>This dashboard provides quick insights into your company.</p>
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

        </div>
      </main>
    </div>
  );
}

export default ManagerDashboard;

