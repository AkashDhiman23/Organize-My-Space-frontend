import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManagerDashboard.css";

function DesignerDashboard() {
  const [customers, setCustomers] = useState([]);
  const [companyDetails, setCompanyDetails] = useState({
    company_name: "",
    full_name: "",
  });

  const [uploadingCustomerId, setUploadingCustomerId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    fetchCompanyDetails();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/accounts/all-customers/",
        { withCredentials: true }
      );
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch customers.");
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/accounts/company-details/",
        { withCredentials: true }
      );
      setCompanyDetails(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch company details.");
    }
  };

  const handleFileChange = (e) => setUploadFile(e.target.files[0]);

  const uploadImage = async () => {
    if (!uploadFile) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("image_file", uploadFile);

    try {
      await axios.post(
        `http://localhost:8000/accounts/customers/${uploadingCustomerId}/designs/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      alert("Image uploaded successfully!");
      setUploadingCustomerId(null);
      setUploadFile(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Designer Dashboard</h2>
      </aside>

      <main className="main-area">
        {/* top nav */}
        <nav className="top-navbar">
          <div className="company-logo">
            <span>{companyDetails.company_name}</span>
          </div>
          <ul className="nav-links">
            <li>
              <button className="nav-link active">Dashboard</button>
            </li>
          </ul>
          <div className="user-profile">
            <span className="user-name">{companyDetails.full_name}</span>
            <button
              className="btn-logout"
              onClick={() => alert("Logout clicked!")}
            >
              Logout
            </button>
          </div>
        </nav>

        {/* main content */}
        <div className="main-content">
          <section className="customer-list">
            {customers.length === 0 && <p>No customers found.</p>}

            {customers.map((customer) => (
              <div className="customer-card" key={customer.id}>
                <h3>{customer.name}</h3>
                <p>
                  <strong>Email:</strong> {customer.email}
                </p>
                <p>
                  <strong>Contact Number:</strong> {customer.contact_number}
                </p>
                <p>
                  <strong>Address:</strong> {customer.address || "N/A"}
                </p>

                {/* ----- action buttons ----- */}
                <div className="design-buttons">
                  <button onClick={() => navigate(`/project-details/${customer.id}`)}>
                    Project Details
                  </button>

                  <button
                    onClick={() => {
                      setUploadingCustomerId(customer.id);
                      setUploadFile(null);
                    }}
                  >
                    Upload Image
                  </button>
                </div>

                {/* ----- image upload ----- */}
                {uploadingCustomerId === customer.id && (
                  <div className="upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button onClick={uploadImage}>Upload</button>
                    <button onClick={() => setUploadingCustomerId(null)}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

export default DesignerDashboard;
