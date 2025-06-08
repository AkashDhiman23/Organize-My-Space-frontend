import React from "react";
import { motion } from "framer-motion";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const HomePage = () => {
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
          <a href="#about" style={styles.navLink}>About</a>
          <a href="/designer" style={styles.navLink}>Designer</a>
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
        >
          {[
            {
              src: "/images/banner.jpg",
              title: "Effortless Task Management",
              subtitle: "Stay on top of your to-do list with ease.",
            },
            {
              src: "/images/banner2.png",
              title: "Role-Based Access Control",
              subtitle: "Assign roles and control access intelligently.",
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
            <motion.button
              style={styles.ctaButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn more
            </motion.button>
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
      <div style={styles.enquirySection}>
        <h2 style={styles.enquiryTitle}>Get in Touch</h2>
        <p style={styles.enquiryText}>We'd love to hear from you! Fill out the form below and we'll get back to you as soon as possible.</p>
        <form style={styles.enquiryForm}>
          <motion.input type="text" placeholder="Your Name" style={styles.inputField} whileHover={{ scale: 1.05 }} />
          <motion.input type="email" placeholder="Your Email" style={styles.inputField} whileHover={{ scale: 1.05 }} />
          <motion.textarea placeholder="Your Enquiry" style={styles.textareaField} whileHover={{ scale: 1.05 }} />
          <motion.button type="submit" style={styles.ctaButton} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Submit
          </motion.button>
        </form>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.companyDetails}>
            <h3 style={styles.companyName}>Organize My Space</h3>
            <p style={styles.companyAddress}>1234 Street Name, City, Country</p>
            <p style={styles.companyPhone}>Phone: (123) 456-7890</p>
            <p style={styles.companyEmail}>Email: support@organize.com</p>
          </div>
          <p style={styles.footerText}>© 2025 Organize My Space. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Styles
const styles = {
  container: {
    width: "100vw",
    minHeight: "100vh",
    backgroundColor: "#121212",
    color: "#f5f5f5",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    overflowX: "hidden",
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
    padding: "20px",
    backgroundColor: "#1f1f1f",
    color: "#f5f5f5",
    position: "relative",
    minHeight: "120px",
  },

  footerContent: {
    display: "flex",
    justifyContent: "space-between",
    textAlign: "left",
    maxWidth: "1200px",
    margin: "0 auto",
    flexWrap: "wrap",
    alignItems: "flex-end", // Align all items to bottom
  },

  companyDetails: {
    flex: "1",
  },

  companyName: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginBottom: "10px",
  },

  companyAddress: { fontSize: "1rem", marginBottom: "5px" },
  companyPhone: { fontSize: "1rem", marginBottom: "5px" },
  companyEmail: { fontSize: "1rem" },

  footerText: {
    fontSize: "0.9rem",
    color: "#ccc", // brighter color for better contrast
    whiteSpace: "nowrap",
    margin: 0,
  },

};

export default HomePage;
