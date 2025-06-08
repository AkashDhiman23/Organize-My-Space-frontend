import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManagerDashboard.css";

function ManagerDashboard() {
  const [customers, setCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    contact_number: "",
    address: "",
  });
  const [deleteNotes, setDeleteNotes] = useState({});
  const [isDeleting, setIsDeleting] = useState({});
  const [companyDetails, setCompanyDetails] = useState({
    company_name: "",
    full_name: "",
  });

  useEffect(() => {
    fetchCustomers();
    fetchCompanyDetails();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/accounts/all-customers/", {
        withCredentials: true,
      });
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch customers.");
    }
  };

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

  const getStatusFromProgress = (progress) => {
    if (progress === 0) return "Not Started";
    if (progress > 0 && progress < 50) return "Designing";
    if (progress >= 50 && progress < 100) return "Production";
    if (progress >= 100) return "Completed";
    return "Unknown";
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/accounts/customers/",
        {
          name: newCustomer.name,
          email: newCustomer.email,
          contact_number: newCustomer.contact_number,
          address: newCustomer.address,
          progress_percentage: 30, // default status = Designing
        },
        { withCredentials: true }
      );
      setNewCustomer({ name: "", email: "", contact_number: "", address: "" });
      setShowAddForm(false);
      fetchCustomers();
      alert("Customer added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add customer.");
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
        {
          progress_percentage,
        },
        {
          withCredentials: true,
        }
      );
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Manager Dashboard</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-add">
          {showAddForm ? "Close Form" : "Add New Customer"}
        </button>
      </aside>

      <main className="main-area">
        <nav className="top-navbar">
          <div className="company-logo">🌟 <span>{companyDetails.company_name}</span></div>

          <ul className="nav-links">
            <li><button className="nav-link active">Dashboard</button></li>
            <li><button className="nav-link">Reports</button></li>
            <li><button className="nav-link">Settings</button></li>
          </ul>

          <div className="user-profile">
            <span className="user-name">{companyDetails.full_name}</span>
            <button className="btn-logout" onClick={() => alert("Logout clicked!")}>Logout</button>
          </div>
        </nav>

        <div className="main-content">
          <div className="company-info-box">
            <p><strong>Company:</strong> {companyDetails.company_name}</p>
            <p><strong>Manager:</strong> {companyDetails.full_name}</p>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddCustomer} className="customer-form">
              <h3>Add New Customer</h3>
              <input
                type="text"
                placeholder="Name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={newCustomer.contact_number}
                onChange={(e) => setNewCustomer({ ...newCustomer, contact_number: e.target.value })}
                required
              />
              <textarea
                placeholder="Address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                rows={3}
              />

              <button type="submit" className="btn-submit">
                Add Customer
              </button>
            </form>
          )}

          <section className="customer-list">
            {customers.length === 0 && <p>No customers found.</p>}

            {customers.map((customer) => (
              <div className="customer-card" key={customer.id}>
                <div className="customer-header">
                  <h3>{customer.name}</h3>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteCustomer(customer.id)}
                    disabled={isDeleting[customer.id]}
                  >
                    {isDeleting[customer.id] ? "Deleting..." : "Delete"}
                  </button>
                </div>

                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Contact Number:</strong> {customer.contact_number}</p>
                <p><strong>Address:</strong> {customer.address || "N/A"}</p>

                <div className="progress-wrapper">
                  <label>Status Progress:</label>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${customer.progress_percentage}%` }}
                    ></div>
                  </div>
                  <span>{getStatusFromProgress(customer.progress_percentage)}</span>
                </div>

                <p>
                  <strong>Status:</strong>{" "}
                  <select
                    value={getStatusFromProgress(customer.progress_percentage)}
                    onChange={(e) => handleStatusChange(customer.id, e.target.value)}
                    disabled={isDeleting[customer.id]}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Designing">Designing</option>
                    <option value="Production">Production</option>
                    <option value="Completed">Completed</option>
                  </select>
                </p>

                <textarea
                  placeholder="Note for deletion"
                  value={deleteNotes[customer.id] || ""}
                  onChange={(e) =>
                    setDeleteNotes((prev) => ({ ...prev, [customer.id]: e.target.value }))
                  }
                  className="note-textarea"
                  disabled={isDeleting[customer.id]}
                />
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ManagerDashboard;