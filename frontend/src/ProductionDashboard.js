import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManagerDashboard.css";

function ProductionDashboard() {
  const [productionOrders, setProductionOrders] = useState([]);
  const [companyDetails, setCompanyDetails] = useState({
    company_name: "",
    full_name: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProductionOrders();
    fetchCompanyDetails();
  }, []);

  const fetchProductionOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/production/orders/", // Change to your real API endpoint
        { withCredentials: true }
      );
      setProductionOrders(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch production orders.");
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

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Production Dashboard</h2>
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
          <section className="production-list">
            {productionOrders.length === 0 && <p>No production orders found.</p>}

            {productionOrders.map((order) => (
              <div className="production-card" key={order.id}>
                <h3>Order: {order.order_number || order.id}</h3>
                <p>
                  <strong>Product:</strong> {order.product_name || "N/A"}
                </p>
                <p>
                  <strong>Quantity:</strong> {order.quantity || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {order.status || "N/A"}
                </p>

                <div className="action-buttons">
                  <button onClick={() => navigate(`/production-details/${order.id}`)}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProductionDashboard;
