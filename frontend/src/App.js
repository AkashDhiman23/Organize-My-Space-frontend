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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp/:adminId" element={<VerifyOtp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/designer" element={<DesignerDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/draw/:customerId" element={<DrawingCanvasPage />} />
      </Routes>
    </Router>
  );
}

export default App; 