import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import CompanyDetails from './CompanyDetails';
import VerifyOtp from './VerifyOtp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/CompanyDetails/:adminId" element={<CompanyDetails />} />
        <Route path="/verify-otp/:adminId" element={<VerifyOtp />} />
      </Routes>
    </Router>
  );
}

export default App; 