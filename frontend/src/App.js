import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import VerifyOtp from './VerifyOtp';
import DesignerDashboard from './DesignerDashboard';
import ManagerDashboard from './ManagerDashboard';
import DrawingCanvasPage from "./DrawingCanvasPage";
import ProjectDetailsPage from "./ProjectDetailsPage"
import ProductionDashboard from './ProductionDashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
         <Route path="/my-projects" element={<DesignerDashboard />} />
        
        <Route path="/company-profile" element={<DesignerDashboard />} />
        <Route path="/verify-otp/:adminId" element={<VerifyOtp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/designer" element={<DesignerDashboard />} />
        <Route path="/clients" element={<DesignerDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/draw/:customerId" element={<DrawingCanvasPage />} />
        <Route path="/project-details/:customerId" element={<ProjectDetailsPage />} />
        <Route path="/production-dashboard" element={<ProductionDashboard />} />
      </Routes>
    </Router>
  );
}

export default App; 