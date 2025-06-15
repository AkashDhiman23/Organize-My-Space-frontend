import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Projectdetails.css";

function ProjectDetail() {
  const { customerId } = useParams();
  const navigate       = useNavigate();

  /* ───── state ───── */
  const [customer, setCustomer] = useState(null);
  const [size, setSize]         = useState({ length: "", width: "", depth: "" });
  const [drawingsCount, setDrawingsCount] = useState(0);
  const squareFeet = (+size.length || 0) * (+size.width || 0);

  /* ───── fetch data once ───── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:8000/accounts/customers/${customerId}/`,
          { withCredentials: true }
        );
        setCustomer(data);

        const res = await axios.get(
          `http://localhost:8000/accounts/customers/${customerId}/project/`,
          { withCredentials: true }
        );
        const d = res.data;
        setSize({ length: d.length_ft, width: d.width_ft, depth: d.depth_in });
        setDrawingsCount(d.drawings_count || 0);
      } catch (err) {
        console.error("fetch error:", err);
      }
    })();
  }, [customerId]);

  /* ───── helpers ───── */
  const goBack     = () => navigate(-1);
  const goToCanvas = () => navigate(`/draw/${customerId}?drawingNum=${drawingsCount + 1}`);

  const saveProject = async () => {
    if (!size.length || !size.width) {
      alert("Length and width required"); return;
    }
    if (drawingsCount < 2) {
      alert("You must add at least 2 drawings."); return;
    }

    const body = new FormData();
    body.append("length_ft", size.length);
    body.append("width_ft",  size.width);
    body.append("depth_in",  size.depth || 0);

    try {
      await axios.post(
        `http://localhost:8000/accounts/customers/${customerId}/project/`,
        body,
        { withCredentials: true }
      );
      alert("Project info saved!");
      goBack();
    } catch (err) {
      console.error("save error:", err);
      alert("Failed to save project info.");
    }
  };

  /* ───── render ───── */
  const canAddDrawing = drawingsCount < 4;

  return (
    <div className="project-detail-page">
      <button className="back-btn" onClick={goBack}>← Back</button>

      <h2>
        Project Details –{" "}
        {customer ? `${customer.name} (ID #${customer.id || customerId})`
                  : `Customer #${customerId}`}
      </h2>

      {customer && (
        <div className="customer-info-card">
          <p><strong>ID :</strong> {customer.id || customerId}</p>
          <p><strong>Name :</strong> {customer.name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.contact_number || "—"}</p>
        </div>
      )}

      <div className="size-grid">
        <input
          type="number" placeholder="Length (ft)"
          value={size.length}
          onChange={e => setSize({ ...size, length: e.target.value })}
        />
        <input
          type="number" placeholder="Width (ft)"
          value={size.width}
          onChange={e => setSize({ ...size, width: e.target.value })}
        />
        <input
          type="number" placeholder="Depth (inch)"
          value={size.depth}
          onChange={e => setSize({ ...size, depth: e.target.value })}
        />
      </div>

      <p><strong>Square Feet:</strong> {squareFeet}</p>
      <p><strong>Drawings added:</strong> {drawingsCount} (need 2–4)</p>

      {/* Button never receives boolean, only a real handler or undefined */}
      <button
        className="add-drawing-btn"
        onClick={canAddDrawing ? goToCanvas : undefined}
        disabled={!canAddDrawing}
      >
        {canAddDrawing
          ? drawingsCount === 0 ? "Add Drawing" : "Add Another Drawing"
          : "Maximum of 4 drawings"}
      </button>

      <button className="save-btn" onClick={saveProject}>Save Project</button>
    </div>
  );
} 

export default ProjectDetail;
