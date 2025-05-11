import React from "react";
import { motion } from "framer-motion";

const HomePage = () => {
  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <img src="/images/logo.png" alt="Logo" style={styles.logo} />
        <div style={styles.navLinks}>
          <a href="#home" style={styles.navLink}>Home</a>
          <a href="#about" style={styles.navLink}>About</a>
          <a href="#contact" style={styles.navLink}>Contact</a>
          <a href="/signup" style={styles.navLink}>Signup</a>
        </div>
      </nav>

      {/* Animated Banner Section */}
      <div style={styles.bannerSection}>
        <motion.div
          style={styles.animatedBanner}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 style={styles.bannerTitle}>Task Manager & Role-Based Access</h1>
          <p style={styles.bannerSubtitle}>Effortlessly manage tasks and assign roles with ease.</p>
          
          <div style={styles.iconContainer}>
              <motion.div style={styles.iconBox} whileHover={{ scale: 1.1 }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2206/2206368.png"
                  alt="Admin"
                  style={styles.icon}
                />
                <p>Admin</p>
              </motion.div>
              <motion.div style={styles.iconBox} whileHover={{ scale: 1.1 }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="Manager"
                  style={styles.icon}
                />
                <p>Manager</p>
              </motion.div>
              <motion.div style={styles.iconBox} whileHover={{ scale: 1.1 }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1077/1077012.png"
                  alt="User"
                  style={styles.icon}
                />
                <p>User</p>
              </motion.div>
            </div>

          {/* Animated Lines */}
          <motion.div
            style={styles.connectionLine}
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ duration: 1.5 }}
          />
        </motion.div>
      </div>
    

      {/* Title Section */}
      <div style={styles.titleSection}>
        <h1 style={styles.title}>Your Personal Taks Manager.</h1>
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
        <h2 style={styles.drawingTitle}>Inbuilt Drawing </h2>
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
          <motion.input
            type="text"
            placeholder="Your Name"
            style={styles.inputField}
            whileHover={{ scale: 1.05 }}
          />
          <motion.input
            type="email"
            placeholder="Your Email"
            style={styles.inputField}
            whileHover={{ scale: 1.05 }}
          />
          <motion.textarea
            placeholder="Your Enquiry"
            style={styles.textareaField}
            whileHover={{ scale: 1.05 }}
          />
          <motion.button
            type="submit"
            style={styles.ctaButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
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
    justifyContent: "space-between",
    padding: "15px 40px",
    backgroundColor: "#1f1f1f",
  },
  logo: { width: "100px" },
  navLinks: { display: "flex", gap: "20px" },
  navLink: { color: "#f5f5f5", textDecoration: "none", fontSize: "1.1rem" },
  bannerSection: {
    height: "500px",
    backgroundColor: "#222",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  animatedBanner: {
    textAlign: "center",
    padding: "20px",
    borderRadius: "10px",
  },
  bannerTitle: { fontSize: "2.5rem", fontWeight: "bold", color: "#fff" },
  bannerSubtitle: { fontSize: "1.2rem", marginTop: "10px", color: "#bbb" },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "50px",
    marginTop: "20px",
  },
  iconBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#333",
    padding: "20px",
    borderRadius: "10px",
  },
  icon: { width: "50px", height: "50px", marginBottom: "10px" },
  connectionLine: {
    height: "2px",
    backgroundColor: "#00c4ff",
    marginTop: "20px",
  },
  title: { fontSize: "3rem", fontWeight: "bold" },
  parallaxSection: {
    height: "400px",
    backgroundColor: "#333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    textAlign: "center",
  },
  // Enquiry Form Section
  enquirySection: {
    backgroundColor: "#ffffff",
    padding: "50px 20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    marginTop: "30px",
    borderRadius: "10px",
    maxWidth: "900px",
    margin: "0 auto",
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
  // Footer Styles
  footer: {
    padding: "20px 0",
    backgroundColor: "#1f1f1f",
    color: "#f5f5f5",
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-around",
    textAlign: "left",
    maxWidth: "1200px",
    margin: "0 auto",
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
    textAlign: "center",
    marginTop: "20px",
    fontSize: "0.9rem",
    color: "#777",
  },

  featuresSection: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    marginTop: "50px",
    flexWrap: "wrap",  // This ensures the cards wrap onto the next line on small screens
  },
  feature: {
    backgroundColor: "#1f1f1f",
    borderRadius: "10px",
    padding: "20px",
    flex: "0.4",  // Makes the card take up 40% of the available width
    minWidth: "250px", // Ensures a minimum width for the cards
    boxSizing: "border-box",  // Ensures padding doesn't cause overflow
  },
  featureImage: {
    width: "100%", // Make sure the image takes up full width of its container
    maxWidth: "250px", // Optional: restricts the image width
    marginBottom: "15px",
  },
  
  // Responsiveness using media queries
  "@media screen and (max-width: 768px)": {
    featuresSection: {
      flexDirection: "column",  // Stack the cards vertically on smaller screens
      alignItems: "center",     // Center align the cards on mobile
      gap: "20px",              // Smaller gap between cards
    },
    feature: {
      flex: "1",                // Makes each card take up full width in column layout
      minWidth: "100%",         // Ensures each card takes up full width on small screens
      maxWidth: "100%",         // Prevents any card from being larger than its container
      boxSizing: "border-box",  // Prevents any unwanted overflow
    },
    featureImage: {
      width: "100%",            // Ensures images fill the entire width of their container
    },
  },
  // Animated Drawing Section
  drawingSection: {
    marginTop: "80px", // Adds some space between the features section and the drawing section
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

  

  // Responsiveness using media queries
  "@media screen and (max-width: 768px)": {
    featuresSection: {
      flexDirection: "column",  // Stack the cards vertically on smaller screens
      alignItems: "center",     // Center align the cards on mobile
      gap: "20px",              // Smaller gap between cards
    },
    feature: {
      flex: "1",                // Makes each card take up full width in column layout
      minWidth: "100%",         // Ensures each card takes up full width on small screens
      maxWidth: "100%",         // Prevents any card from being larger than its container
      boxSizing: "border-box",  // Prevents any unwanted overflow
    },
    featureImage: {
      width: "100%",            // Ensures images fill the entire width of their container
      maxWidth: "100%",         // Makes sure images don't exceed their container size
    },
    bannerSection: {
      height: "600px",          // Adjust banner height for smaller screens
    },
    titleSection: {
      padding: "20px",
      margin: "20px 0",
    },
    enquirySection: {
      padding: "30px 10px",     // Adjust padding for smaller screens
    },
    footerContent: {
      flexDirection: "column",  // Stack footer content vertically on small screens
      alignItems: "center",     // Center footer content
      textAlign: "center",      // Align text to the center
    },
    navbar: {
      padding: "15px 20px",     // Reduce navbar padding for smaller screens
      flexDirection: "column",  // Stack navbar items vertically on small screens
      alignItems: "center",     // Center-align navbar items
    },
    navLinks: {
      flexDirection: "column",  
      alignItems: "center",     
      gap: "15px",              
    },
  },

};

export default HomePage;