import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import CustomReportGeneration from './pages/CustomReportGeneration';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/reports" element={<CustomReportGeneration />} />
        <Route path="/dev/report" element={<CustomReportGeneration />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

