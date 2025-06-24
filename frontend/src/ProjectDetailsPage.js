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
    productName: "",
    bodyColor: "",
    doorColor: "",
    bodyMaterial: "",
    doorMaterial: "",
  });

  const [projectStatus, setProjectStatus] = useState("");
  const [drawingsCount, setDrawingsCount] = useState(0);
  const [drawings, setDrawings] = useState([]);
  const [loadingDrawings, setLoadingDrawings] = useState(true);

  // Calculate square feet safely
  const squareFeet = (parseFloat(size.length) || 0) * (parseFloat(size.width) || 0);

  const canAddDrawing = drawingsCount < 4 && projectStatus !== "Completed";

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
          productName: proj.product_name ?? "",
          bodyColor: proj.body_color ?? "",
          doorColor: proj.door_color ?? "",
          bodyMaterial: proj.body_material ?? "",
          doorMaterial: proj.door_material ?? "",
        });

        setProjectStatus(proj.status ?? "");
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
            image_url: /\.(jpe?g|png)$/i.test(file) ? file : null,
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

  const goToCanvas = () => {
    if (canAddDrawing) {
      navigate(`/draw/${customerId}?drawingNum=${drawingsCount + 1}`);
    }
  };

  const handleChange = (key, value) => {
    if (["length", "width", "depth"].includes(key)) {
      // Allow empty string or numeric values only
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
    body.append("product_name", size.productName);
    body.append("body_color", size.bodyColor);
    body.append("door_color", size.doorColor);
    body.append("body_material", size.bodyMaterial);
    body.append("door_material", size.doorMaterial);

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

  const {
    length,
    width,
    depth,
    productName,
    bodyColor,
    doorColor,
    bodyMaterial,
    doorMaterial,
  } = size;

  return (
    <div className="project-detail-page">
      <div className="pd-header-row" role="banner">
        <button
          className="btn back-btn"
          onClick={goBack}
          aria-label="Go back"
          type="button"
        >
          <i className="bi bi-arrow-left-short" aria-hidden="true" /> Back
        </button>

        <h2 className="customer-name-header">{`Product name  – ${size?.productName }`}</h2>

        <span className="drawings-count" aria-live="polite">
          {drawingsCount}/4 drawings
        </span>
      </div>

      <div className="pd-main-grid">
        <div className="pd-form" role="main">
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

          <section className="form-section" aria-labelledby="dimensions-heading">
            <h4 id="dimensions-heading">Dimensions</h4>
            <div className="two-col">
              <label htmlFor="length">Height (ft)</label>
              <input
                id="length"
                type="number"
                value={length}
                min="0"
                step="any"
                onChange={(e) => handleChange("length", e.target.value)}
                aria-describedby="square-footage"
              />

              <label htmlFor="width">Width (ft)</label>
              <input
                id="width"
                type="number"
                value={width}
                min="0"
                step="any"
                onChange={(e) => handleChange("width", e.target.value)}
                aria-describedby="square-footage"
              />

              <label htmlFor="depth">Depth (in)</label>
              <input
                id="depth"
                type="number"
                value={depth}
                min="0"
                step="any"
                onChange={(e) => handleChange("depth", e.target.value)}
              />
            </div>
          </section>

          <section className="form-section" aria-labelledby="material-heading">
            <h4 id="material-heading">Material</h4>

            

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

          <p className="mt-2" id="square-footage">
            <strong>Sq ft:</strong> {squareFeet.toFixed(2)}
          </p>

          <div className="pd-buttons">
            <button
              className="btn-dark"
              disabled={!canAddDrawing}
              onClick={goToCanvas}
              type="button"
              style={{
                cursor: canAddDrawing ? "pointer" : "not-allowed",
              }}
              aria-disabled={!canAddDrawing}
              aria-describedby="drawings-info"
            >
              {projectStatus === "Completed"
                ? "Project Completed - Cannot Add Drawings"
                : canAddDrawing
                ? drawingsCount === 0
                  ? "Add Drawing"
                  : "Add Another Drawing"
                : "4 Drawings Max"}
            </button>

            {/* Uncomment if you want to enable Save Project button */}
            {/* <button className="btn-primary" onClick={saveProject} type="button">
              Save Project
            </button> */}
          </div>

          <p className="min-note" id="drawings-info">
            * Minimum 2 drawings required to save
          </p>
        </div>
<aside className="container my-5" aria-label="Project drawings">
  <h4 className="mb-4 fw-semibold">Drawings</h4>

  {loadingDrawings ? (
    <p className="text-muted">Loading…</p>
  ) : drawingsCount === 0 ? (
    <p className="text-muted">No drawings added yet.</p>
  ) : (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
      {drawings.map((d) => (
        <div key={d.id} className="col">
          <div className="card h-100 shadow-sm border-0 rounded-3 p-2">
            {d.image_url ? (
              <img
                src={d.image_url}
                alt={`Drawing ${d.drawing_num}`}
                className="card-img-top rounded"
                style={{ objectFit: "cover", height: "140px" }}
              />
            ) : (
              <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: "140px" }}>
                <i className="bi bi-file-earmark-text display-4 text-secondary" aria-hidden="true" />
              </div>
            )}
            <div className="card-body">
              <h6 className="card-title">Drawing {d.drawing_num}</h6>
              <div className="d-flex flex-column gap-2">
                <a
                  href={d.file}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-eye me-1" aria-hidden="true" />
                  View
                </a>
                <a
                  href={d.file}
                  download
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-download me-1" aria-hidden="true" />
                  Download
                </a>
              </div>
            </div>
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
