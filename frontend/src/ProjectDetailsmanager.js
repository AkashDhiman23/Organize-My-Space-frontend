import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Projectdetails.css";

function ProjectDetailsmanager() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [size, setSize] = useState({
    length: "",
    width: "",
    depth: "",
    status:"",
    productName: "",
    bodyColor: "",
    doorColor: "",
    bodyMaterial: "",
    doorMaterial: "",
  });

  const [projectStatus, setProjectStatus] = useState("");

  const [productionImagesCount, setProductionImagesCount] = useState(0);
  const [productionImages, setProductionImages] = useState([]);
  const [loadingProductionImages, setLoadingProductionImages] = useState(true);

  const [drawingsCount, setDrawingsCount] = useState(0);
  const [drawings, setDrawings] = useState([]);
  const [loadingDrawings, setLoadingDrawings] = useState(true);

  // Calculate square feet safely
  const squareFeet =
    (parseFloat(size.length) || 0) * (parseFloat(size.width) || 0);

  const canAddProductionImage = productionImagesCount < 4;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customer info
        const { data: cust } = await axios.get(
          `http://16.176.159.91:8000/accounts/customers/${customerId}/`,
          { withCredentials: true }
        );
        setCustomer(cust);

        // Fetch project info
        const { data: proj } = await axios.get(
          `http://16.176.159.91:8000/accounts/customers/${customerId}/project/`,
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

  // Fetch production images
  useEffect(() => {
    const fetchProductionImages = async () => {
      try {
        setLoadingProductionImages(true);
        const { data } = await axios.get(
          `http://16.176.159.91:8000/accounts/customers/${customerId}/project/production-images/`,
          { withCredentials: true }
        );

        const BASE = "http://16.176.159.91:8000";

        const normalizedImages = data.map((img) => {
          const file = img.file.startsWith("http")
            ? img.file
            : `${BASE}/media/${img.file.replace(/^\/?/, "")}`;
          return {
            ...img,
            file,
            image_url:
              /\.(jpe?g|png)$/i.test(file) ? file : null,
          };
        });

        setProductionImages(normalizedImages);
        setProductionImagesCount(normalizedImages.length);
      } catch (err) {
        console.error("Error fetching production images:", err);
        setProductionImages([]);
        setProductionImagesCount(0);
      } finally {
        setLoadingProductionImages(false);
      }
    };

    fetchProductionImages();
  }, [customerId]);

  // Fetch drawings
  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        setLoadingDrawings(true);
        const { data } = await axios.get(
          `http://16.176.159.91:8000/accounts/customers/${customerId}/project/drawings/`,
          { withCredentials: true }
        );

        const BASE = "http://16.176.159.91:8000";

        const normalizedDrawings = data.map((d) => {
          const file = d.file.startsWith("http")
            ? d.file
            : `${BASE}/media/${d.file.replace(/^\/?/, "")}`;
          return {
            ...d,
            file,
            image_url:
              /\.(jpe?g|png)$/i.test(file) ? file : null,
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

  const handleChange = (key, value) => {
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

  // Upload new production images handler
  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    // Limit to max 4 images total
    if (productionImagesCount + files.length > 4) {
      alert("You can upload max 4 production images in total.");
      return;
    }

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        // Adjust the endpoint and payload to your API specification
        await axios.post(
          `http://16.176.159.91:8000/accounts/customers/${customerId}/project/production-images/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
      }

      // After upload, reload production images
      const { data } = await axios.get(
        `http://16.176.159.91:8000/accounts/customers/${customerId}/project/production-images/`,
        { withCredentials: true }
      );
      const BASE = "http://16.176.159.91:8000";
      const normalizedImages = data.map((img) => {
        const file = img.file.startsWith("http")
          ? img.file
          : `${BASE}/media/${img.file.replace(/^\/?/, "")}`;
        return {
          ...img,
          file,
          image_url: /\.(jpe?g|png)$/i.test(file) ? file : null,
        };
      });
      setProductionImages(normalizedImages);
      setProductionImagesCount(normalizedImages.length);

      alert("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images.");
    }

    // Reset the input so same files can be uploaded again if needed
    event.target.value = null;
  };

  const saveProject = async () => {
    if (!size.length || !size.width) {
      alert("Length and width required");
      return;
    }
    if (productionImagesCount < 2) {
      alert("You must add at least 2 production images.");
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
        `http://16.176.159.91:8000/accounts/customers/${customerId}/project/`,
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
      <div className="pd-header-row">
        <button className="btn back-btn" onClick={goBack}>
          <i className="bi bi-arrow-left-short" /> Back
        </button>

        <h2 className="customer-name-header">{`Product name  – ${size?.productName }`}</h2>

        <span className="drawings-count">
          {productionImagesCount}/4 production images
        </span>
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

      

         
        </div>

   <aside className="container my-5">
  {/* Production Images Section */}
  <h4 className="mb-4 fw-semibold">Production Images</h4>

  {loadingProductionImages ? (
    <p className="text-muted">Loading…</p>
  ) : productionImagesCount === 0 ? (
    <p className="text-muted">No production images added yet.</p>
  ) : (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
      {productionImages.map((img) => (
        <div key={img.id} className="col">
          <div className="card h-100 shadow-sm border-0 rounded-3 p-2 custom-hover">
            {img.image_url ? (
              <img
                src={img.image_url}
                alt={`Production Image ${img.image_num}`}
                className="card-img-top rounded"
                style={{ objectFit: "cover", height: "180px" }}
              />
            ) : (
              <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: "180px" }}>
                <i className="bi bi-file-earmark-text display-4 text-secondary" />
              </div>
            )}
            <div className="card-body pt-3">
              <h6 className="card-title fw-semibold mb-2">Production Image {img.image_num}</h6>
              <div className="d-flex flex-column gap-2">
                <a
                  href={img.file}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-eye me-1" />
                  View
                </a>
                <a
                  href={img.file}
                  download
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-download me-1" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Drawings Section */}
  <h4 className="mt-5 mb-4 fw-semibold">Drawings</h4>

  {loadingDrawings ? (
    <p className="text-muted">Loading…</p>
  ) : drawingsCount === 0 ? (
    <p className="text-muted">No drawings added yet.</p>
  ) : (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
      {drawings.map((d) => (
        <div key={d.id} className="col">
          <div className="card h-100 shadow-sm border-0 rounded-3 p-2 custom-hover">
            {d.image_url ? (
              <img
                src={d.image_url}
                alt={`Drawing ${d.drawing_num}`}
                className="card-img-top rounded"
                style={{ objectFit: "cover", height: "140px" }}
              />
            ) : (
              <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: "140px" }}>
                <i className="bi bi-file-earmark-text display-4 text-secondary" />
              </div>
            )}
            <div className="card-body pt-3">
              <h6 className="card-title fw-semibold mb-2">Drawing {d.drawing_num}</h6>
              <div className="d-flex flex-column gap-2">
                <a
                  href={d.file}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-eye me-1" />
                  View
                </a>
                <a
                  href={d.file}
                  download
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-download me-1" />
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

export default ProjectDetailsmanager;
