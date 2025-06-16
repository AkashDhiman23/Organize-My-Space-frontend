import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Projectdetails.css";

function ProjectDetail() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [size, setSize] = useState({
    length: "",
    width: "",
    depth: "",
    materialName: "",
    bodyColor: "",
    doorColor: "",
    bodyMaterial: "",
    doorMaterial: ""
  });
  const [drawingsCount, setDrawingsCount] = useState(0);
  const squareFeet = (+size.length || 0) * (+size.width || 0);

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
        setSize(prev => ({
          ...prev,
          length: d.length_ft || "",
          width: d.width_ft || "",
          depth: d.depth_in || "",
          materialName: d.material_name || "",
          bodyColor: d.body_color || "",
          doorColor: d.door_color || "",
          bodyMaterial: d.body_material || "",
          doorMaterial: d.door_material || ""
        }));
        setDrawingsCount(d.drawings_count || 0);
      } catch (err) {
        console.error("fetch error:", err);
      }
    })();
  }, [customerId]);

  const goBack = () => navigate(-1);
  const goToCanvas = () =>
    navigate(`/draw/${customerId}?drawingNum=${drawingsCount + 1}`);

  const saveProject = async () => {
    if (!size.length || !size.width) {
      alert("Length and width required");
      return;
    }
    if (drawingsCount < 2) {
      alert("You must add at least 2 drawings.");
      return;
    }

    const body = {
      length_ft: size.length,
      width_ft: size.width,
      depth_in: size.depth || 0,
      material_name: size.materialName,
      body_color: size.bodyColor,
      door_color: size.doorColor,
      body_material: size.bodyMaterial,
      door_material: size.doorMaterial
    };

    try {
      await axios.post(
        `http://localhost:8000/accounts/customers/${customerId}/project/`,
        body,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );
      alert("Project info saved!");
      goBack();
    } catch (err) {
      console.error("save error:", err);
      alert(err.response?.data?.detail || "Failed to save project info.");
    }
  };

  const canAddDrawing = drawingsCount < 4;

  return (
    <div className="project-detail-page">
      <h2>Project Details – {customer?.name || "Customer"}</h2>

      {customer && (
        <div className="customer-info-card">
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.contact_number}</p>
        </div>
      )}

      <div className="size-grid">
        <div className="form-section">
          <h4>Project Dimensions</h4>
          <label>Length (ft)</label>
          <input
            type="number"
            value={size.length}
            onChange={e => setSize({ ...size, length: e.target.value })}
          />
          <label>Width (ft)</label>
          <input
            type="number"
            value={size.width}
            onChange={e => setSize({ ...size, width: e.target.value })}
          />
          <label>Depth (inch)</label>
          <input
            type="number"
            value={size.depth}
            onChange={e => setSize({ ...size, depth: e.target.value })}
          />
        </div>

        <div className="form-section">
          <h4>Material Details</h4>
          <label>Material Name</label>
          <input
            type="text"
            value={size.materialName}
            onChange={e => setSize({ ...size, materialName: e.target.value })}
          />
        </div>

        <div className="form-section">
          <h4>Colors</h4>
          <label>Body Color</label>
          <input
            type="text"
            value={size.bodyColor}
            onChange={e => setSize({ ...size, bodyColor: e.target.value })}
          />
          <label>Door Color</label>
          <input
            type="text"
            value={size.doorColor}
            onChange={e => setSize({ ...size, doorColor: e.target.value })}
          />
        </div>

        <div className="form-section">
          <h4>Material Types</h4>
          <label>Body Material</label>
          <input
            type="text"
            value={size.bodyMaterial}
            onChange={e => setSize({ ...size, bodyMaterial: e.target.value })}
          />
          <label>Door Material</label>
          <input
            type="text"
            value={size.doorMaterial}
            onChange={e => setSize({ ...size, doorMaterial: e.target.value })}
          />
        </div>
      </div>

      <p><strong>Square Feet:</strong> {squareFeet}</p>
      <p><strong>Drawings added:</strong> {drawingsCount} (need 2–4)</p>

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
      <button className="back-btn" onClick={goBack}>← Back</button>
    </div>
  );
}

export default ProjectDetail;