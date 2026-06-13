import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public Pages
import HomePage from './pages/public/HomePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CustomReportGeneration from './pages/admin/CustomReportGeneration';
import SystemConfig from './pages/admin/SystemConfig';

import './App.css'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route path="/admin/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/reports/custom" element={<CustomReportGeneration />} />
        <Route path="/admin/config" element={<SystemConfig />} />  
      </Routes>
    </Router>
  );
}

export default App;