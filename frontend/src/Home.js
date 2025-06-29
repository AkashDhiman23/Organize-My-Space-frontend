
import { motion } from "framer-motion";
import React, { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const HomePage = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    enquiry_text: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE_URL}/accounts/enquiries/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to submit enquiry");
      }

      setSuccess("Thanks for reaching out! We'll get back to you soon.");
      setForm({ name: "", email: "", enquiry_text: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logoContainer}>
          <a href="/">
            <img src="/images/logo.png" alt="Logo" style={styles.logo} />
          </a>
        </div>
        <div style={styles.navLinksContainer}>
          <a href="/" style={styles.navLink}>Home</a>
         <a
  href="#get-in-touch"
  style={styles.navLink}
  onClick={(e) => {
    e.preventDefault();
    document.getElementById('get-in-touch')?.scrollIntoView({ behavior: 'smooth' });
  }}
>
  Contact
</a>
          <a href="/login" style={styles.navLink}>Sign in</a>
        </div>
      </nav>

     {/* Slideshow Banner Section */}
<div style={styles.bannerSection}>
  <Carousel
    autoPlay
    infiniteLoop
    showThumbs={false}
    showStatus={false}
    interval={4000}
    showArrows={false} 
  >
    {[
      {
        src: "/images/banner.jpg",
        title: "Effortless Task Management",
        subtitle: "Stay on top of your to-do list with ease.",
      },
      {
        src: "/images/banner3.png",
        title: "Organize Your Digital Space",
        subtitle: "Smart solutions for smart people.",
      },
    ].map((item, index) => (
      <div key={index} style={styles.slideContainer}>
        <img src={item.src} alt={`Slide ${index + 1}`} style={styles.slideImage} />
        <div style={styles.slideTextOverlay}>
          <h2 style={styles.slideTitle}>{item.title}</h2>
          <p style={styles.slideSubtitle}>{item.subtitle}</p>
        </div>
      </div>
    ))}
  </Carousel>
</div>

      {/* Title Section */}
      <div style={styles.titleSection}>
        <h1 style={styles.title}>Your Personal Task Manager.</h1>
        <p style={styles.subtitle}>Organize Your Home with Style</p>
      </div>

      {/* Parallax Section */}
      <div style={styles.parallaxSection}>
        <div style={styles.parallaxContent}>
          <h2>Experience Stylish Home Organizing</h2>
          <p>Revolutionize the way you manage your data with our innovative solutions.</p>
          <div style={styles.callToAction}>
            
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <div style={styles.feature}>
          <motion.img
            src="/images/kitchen.png"
            alt="Kitchen"
            style={styles.featureImage}
            whileHover={{ scale: 1.05 }}
          />
          <h3 style={styles.featureTitle}>Smart Kitchen Management</h3>
          <p style={styles.featureText}>Keep track of your kitchen items effortlessly.</p>
        </div>

        <div style={styles.feature}>
          <motion.img
            src="/images/wardrobe.png"
            alt="Wardrobe"
            style={styles.featureImage}
            whileHover={{ scale: 1.05 }}
          />
          <h3 style={styles.featureTitle}>Organize Your Wardrobe</h3>
          <p style={styles.featureText}>Transform your closet with intuitive tools.</p>
        </div>
      </div>

      {/* Animated Drawing Feature Section */}
      <div style={styles.drawingSection}>
        <h2 style={styles.drawingTitle}>Inbuilt Drawing</h2>
        <p style={styles.drawingText}>
          Experience real-time animated freehand drawing! Watch as the lines come to life dynamically.
        </p>

        {/* Freehand SVG Drawing */}
        <motion.svg
          width="400"
          height="300"
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M20 150 C 80 50, 150 50, 200 150 S 320 250, 380 150"
            stroke="white"
            strokeWidth="3"
            fill="transparent"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        </motion.svg>
      </div>

      {/* Enquiry Form Section */}
         <div id="get-in-touch" style={styles.enquirySection}>
      <h2 style={styles.enquiryTitle}>Get in Touch</h2>
      <p style={styles.enquiryText}>
        We'd love to hear from you! Fill out the form below and we'll get back
        to you as soon as possible.
      </p>
      <form style={styles.enquiryForm} onSubmit={handleSubmit}>
        <motion.input
          type="text"
          name="name"
          placeholder="Your Name"
          style={styles.inputField}
          value={form.name}
          onChange={handleChange}
          whileHover={{ scale: 1.05 }}
          required
        />
        <motion.input
          type="email"
          name="email"
          placeholder="Your Email"
          style={styles.inputField}
          value={form.email}
          onChange={handleChange}
          whileHover={{ scale: 1.05 }}
          required
        />
        <motion.textarea
          name="enquiry_text"
          placeholder="Your Enquiry"
          style={styles.textareaField}
          value={form.enquiry_text}
          onChange={handleChange}
          whileHover={{ scale: 1.05 }}
          required
        />
        <motion.button
          type="submit"
          style={styles.ctaButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? "Submitting…" : "Submit"}
        </motion.button>
      </form>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: 10 }}>{success}</p>}
    </div>


      {/* Footer */}
     <footer style={styles.footer}>
  <div style={styles.footerContainer}>
    <div style={styles.footerLeft}>
      <img src="/images/logo.png" alt="Logo" style={styles.logo} />
      <h3 style={styles.footerLogo}>Organize My Space</h3>
      <p style={styles.footerTagline}>Simplifying your life, one space at a time.</p>
    </div>

    <div style={styles.footerMiddle}>
      <p style={styles.footerItem}>1234 Street Name, City, Country</p>
      <p style={styles.footerItem}>Phone: (123) 456-7890</p>
      <p style={styles.footerItem}>Email: organizemyyspace@gmail.com</p>
    </div>
  </div>

  {/* ✅ Bottom full-width copyright section */}
  <div style={styles.footerBottom}>
    <p style={styles.footerNote}>© 2025 Organize My Space</p>
    <p style={styles.footerNote}>All rights reserved.</p>
  </div>
</footer>



    </div>
  );
};

// Styles
const styles = {



  container: {
    minHeight: "100vh",
    maxHeight: "none",
    backgroundColor: "#121212",
    color: "#f5f5f5",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
      overflowX: "auto",
  overflowY: "auto", 
  },
 navbar: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 20px",
  backgroundColor: "#1f1f1f",
  flexWrap: "wrap",
},

logoContainer: {
  flex: "1",
},

logo: {
  width: "150px",
},

navLinksContainer: {
  flex: "2",
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "20px",
},

navLink: {
  color: "#f5f5f5",
  textDecoration: "none",
  fontSize: "1.1rem",
},

  slideContainer: {
    position: "relative",
    height: "800px",
      overflow: "hidden", 
  },
  slideImage: {
    width: "100%",
    height: "800px",
    objectFit: "cover",
  },
  slideTextOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "20px",
    borderRadius: "10px",
  },
  slideTitle: {
    fontSize: "2.5rem",
    marginBottom: "10px",
  },
  slideSubtitle: {
    fontSize: "1.2rem",
  },
  titleSection: {
    padding: "40px 20px",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#aaa",
  },
  parallaxSection: {
    height: "400px",
    backgroundColor: "#333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    textAlign: "center",
  },
  callToAction: {
    marginTop: "20px",
  },
  ctaButton: {
    padding: "15px 30px",
    backgroundColor: "#3674B5",
    borderRadius: "30px",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
    transition: "0.3s ease",
  },
  featuresSection: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    marginTop: "50px",
    flexWrap: "wrap",
  },
  feature: {
    backgroundColor: "#1f1f1f",
    borderRadius: "10px",
    padding: "20px",
    flex: "0.4",
    minWidth: "250px",
    boxSizing: "border-box",
  },
  featureImage: {
    width: "100%",
    maxWidth: "250px",
    marginBottom: "15px",
  },
  drawingSection: {
    marginTop: "80px",
  },
  drawingTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  drawingText: {
    fontSize: "1.2rem",
    marginBottom: "30px",
    color: "#aaa",
  },
  enquirySection: {
    backgroundColor: "#ffffff",
    padding: "50px 20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    marginTop: "30px",
    borderRadius: "10px",
    maxWidth: "900px",
    margin: "0 auto",
    color: "#000",
    marginBottom: "50px",
  },
  enquiryTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  },
  enquiryText: {
    fontSize: "1.1rem",
    color: "#777",
    marginBottom: "30px",
  },
  enquiryForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  inputField: {
    padding: "15px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#f8f8f8",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    transition: "0.3s ease",
    outline: "none",
  },
  textareaField: {
    padding: "15px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#f8f8f8",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    transition: "0.3s ease",
    outline: "none",
    height: "150px",
    resize: "none",
  },
  footer: {
  backgroundColor: "#0e0e0e",
  color: "#e5e5e5",
  padding: "50px 20px",
  fontFamily: "'Segoe UI', sans-serif",
  fontSize: "0.95rem",
  borderTop: "1px solid #333",
},

footerContainer: {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "60px",
},

footerLeft: {
  flex: "1 1 250px",
  minWidth: "250px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
},

footerLogo: {
  fontSize: "1.8rem",
  fontWeight: "700",
  marginTop: "10px",
  marginBottom: "5px",
  color: "#ffffff",
},

footerTagline: {
  color: "#aaa",
  marginBottom: "20px",
  fontSize: "1rem",
},

footerMiddle: {
  flex: "1 1 250px",
  minWidth: "250px",
  display: "flex",
  flexDirection: "column",
},

footerItem: {
  marginBottom: "8px",
  color: "#dcdcdc",
  lineHeight: "1.5",
},

footerRight: {
  flex: "1 1 250px",
  minWidth: "250px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
},

footerNote: {
  color: "#999",
  marginBottom: "5px",
  fontSize: "0.85rem",
},

logo: {
  height: "80px",
  marginBottom: "10px",
  
},
footerBottom: {
  marginTop: "30px",
  textAlign: "center",
  borderTop: "1px solid #333",
  paddingTop: "15px",
},


// Responsive
"@media (max-width: 768px)": {
  footerContainer: {
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  footerLeft: {
    alignItems: "center",
  },
  footerMiddle: {
    alignItems: "center",
  },
  footerRight: {
    alignItems: "center",
  },
},

};


export default HomePage;
