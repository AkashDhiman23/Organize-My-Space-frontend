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
    doorMaterial: "",
  });

  const [drawingsCount, setDrawingsCount] = useState(0);
  const [drawings, setDrawings] = useState([]);
  const [loadingDrawings, setLoadingDrawings] = useState(true);

  // Calculate square feet safely
  const squareFeet =
    (parseFloat(size.length) || 0) * (parseFloat(size.width) || 0);
  const canAddDrawing = drawingsCount < 4;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: cust } = await axios.get(
          `http://localhost:8000/accounts/customers/${customerId}/`,
          { withCredentials: true }
        );
        setCustomer(cust);

        const { data: proj } = await axios.get(
          `http://localhost:8000/accounts/customers/${customerId}/project/`,
          { withCredentials: true }
        );

        setSize({
          length: proj.length_ft ?? "",
          width: proj.width_ft ?? "",
          depth: proj.depth_in ?? "",
          materialName: proj.material_name ?? "",
          bodyColor: proj.body_color ?? "",
          doorColor: proj.door_color ?? "",
          bodyMaterial: proj.body_material ?? "",
          doorMaterial: proj.door_material ?? "",
        });
      } catch (err) {
        console.error("fetch error:", err);
      }
    };
    fetchData();
  }, [customerId]);

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        setLoadingDrawings(true);
        const { data } = await axios.get(
          `http://localhost:8000/accounts/customers/${customerId}/project/drawings/`,
          { withCredentials: true }
        );

        const BASE = "http://localhost:8000";

        const normalizedDrawings = data.map((d) => {
          const file = d.file.startsWith("http")
            ? d.file
            : `${BASE}/media/${d.file.replace(/^\/?/, "")}`;
          return {
            ...d,
            file,
            image_url:
              /\.(jpe?g|png)$/i.test(file) // regex to check extension
                ? file
                : null,
          };
        });

        setDrawings(normalizedDrawings);
        setDrawingsCount(normalizedDrawings.length);
      } catch (err) {
        console.error("Error fetching drawings:", err);
        setDrawings([]);
        setDrawingsCount(0);
      } finally {
        setLoadingDrawings(false);
      }
    };

    fetchDrawings();
  }, [customerId]);

  const goBack = () => navigate(-1);

  const goToCanvas = () =>
    navigate(`/draw/${customerId}?drawingNum=${drawingsCount + 1}`);

  const handleChange = (key, value) => {
    // For number inputs, make sure to store empty string or numbers only
    if (["length", "width", "depth"].includes(key)) {
      if (value === "") {
        setSize((prev) => ({ ...prev, [key]: "" }));
      } else {
        const num = Number(value);
        if (!isNaN(num)) {
          setSize((prev) => ({ ...prev, [key]: num }));
        }
      }
    } else {
      setSize((prev) => ({ ...prev, [key]: value }));
    }
  };

  const saveProject = async () => {
    if (!size.length || !size.width) {
      alert("Length and width required");
      return;
    }
    if (drawingsCount < 2) {
      alert("You must add at least 2 drawings.");
      return;
    }

    const body = new FormData();
    body.append("length_ft", size.length);
    body.append("width_ft", size.width);
    body.append("depth_in", size.depth || 0);
    body.append("material_name", size.materialName);
    body.append("body_color", size.bodyColor);
    body.append("door_color", size.doorColor);
    body.append("body_material", size.bodyMaterial);
    body.append("door_material", size.doorMaterial);

    try {
      // Consider using PUT if this is an update
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

  // Destructure for cleaner JSX
  const {
    length,
    width,
    depth,
    materialName,
    bodyColor,
    doorColor,
    bodyMaterial,
    doorMaterial,
  } = size;

  return (
    <div className="project-detail-page">
      <div className="pd-header-row">
        <button className="back-btn small" onClick={goBack}>
          <i className="bi bi-arrow-left-short" /> Back
        </button>

        <h2 className="customer-name-header">
          Customer – {customer?.name || "Customer"}
        </h2>

        <span className="drawings-count">{drawingsCount}/4 drawings</span>
      </div>

      <div className="pd-main-grid">
        <div className="pd-form">
          {customer && (
            <div className="cust-card mb-3">
              <p>
                <strong>Name:</strong> {customer.name}
              </p>
              <p>
                <strong>Email:</strong> {customer.email}
              </p>
              <p>
                <strong>Phone:</strong> {customer.contact_number}
              </p>
            </div>
          )}

          <section className="form-section">
            <h4>Dimensions</h4>
            <div className="two-col">
              <label htmlFor="length">Height (ft)</label>
              <input
                id="length"
                type="number"
                value={length}
                onChange={(e) => handleChange("length", e.target.value)}
              />

              <label htmlFor="width">Width (ft)</label>
              <input
                id="width"
                type="number"
                value={width}
                onChange={(e) => handleChange("width", e.target.value)}
              />

              <label htmlFor="depth">Depth (in)</label>
              <input
                id="depth"
                type="number"
                value={depth}
                onChange={(e) => handleChange("depth", e.target.value)}
              />
            </div>
          </section>

          <section className="form-section">
            <h4>Material</h4>
            <label htmlFor="materialName">Material Name</label>
            <input
              id="materialName"
              type="text"
              value={materialName}
              onChange={(e) => handleChange("materialName", e.target.value)}
            />

            <div className="two-col">
              <label htmlFor="bodyColor">Body Colour</label>
              <input
                id="bodyColor"
                type="text"
                value={bodyColor}
                onChange={(e) => handleChange("bodyColor", e.target.value)}
              />

              <label htmlFor="doorColor">Door Colour</label>
              <input
                id="doorColor"
                type="text"
                value={doorColor}
                onChange={(e) => handleChange("doorColor", e.target.value)}
              />
            </div>

            <div className="two-col">
              <label htmlFor="bodyMaterial">Body Material</label>
              <input
                id="bodyMaterial"
                type="text"
                value={bodyMaterial}
                onChange={(e) => handleChange("bodyMaterial", e.target.value)}
              />

              <label htmlFor="doorMaterial">Door Material</label>
              <input
                id="doorMaterial"
                type="text"
                value={doorMaterial}
                onChange={(e) => handleChange("doorMaterial", e.target.value)}
              />
            </div>
          </section>

          <p className="mt-2">
            <strong>Sq ft:</strong> {squareFeet}
          </p>

          <div className="pd-buttons">
            <button
              className="btn-dark"
              disabled={!canAddDrawing}
              onClick={goToCanvas}
              type="button"
            >
              {canAddDrawing
                ? drawingsCount === 0
                  ? "Add Drawing"
                  : "Add Another Drawing"
                : "4 Drawings Max"}
            </button>
            <button className="btn-primary" onClick={saveProject} type="button">
              Save Project
            </button>
          </div>

          <p className="min-note">* Minimum 2 drawings required to save</p>
        </div>

        <aside className="pd-drawings">
          <h4>Drawings</h4>

          {loadingDrawings ? (
            <p className="text-muted">Loading…</p>
          ) : drawingsCount === 0 ? (
            <p className="text-muted">No drawings added yet.</p>
          ) : (
            <div className="draw-grid">
              {drawings.map((d) => (
                <div key={d.id} className="draw-card">
                  {d.image_url ? (
                    <img src={d.image_url} alt={`Drawing ${d.drawing_num}`} />
                  ) : (
                    <i className="bi bi-file-earmark-text display-6 text-secondary" />
                  )}

                  <div className="draw-links">
                    <a
                      href={d.file}
                      target="_blank"
                      rel="noreferrer"
                      className="d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-eye" />
                      View Drawing {d.drawing_num}
                    </a>
                    <a
                      href={d.file}
                      download
                      className="d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-download" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ProjectDetail;