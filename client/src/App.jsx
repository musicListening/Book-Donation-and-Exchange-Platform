import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import BundleManagement from './pages/staff/BundleManagement';
import DonationSchedule from './pages/staff/DonationSchedule';
import InventoryManagement from './pages/staff/InventoryManagement';
import OrderFulfillment from './pages/staff/OrderFulfillment';
import VerifyDonation from './pages/staff/VerifyDonation';

// NEW: Delivery & Logistics Pages (your 3 HTML files converted to React)
import CreateDeliveryPage from './pages/delivery/CreateDeliveryPage';       // Customer checkout
import DeliveryPersonPage from './pages/delivery/DeliveryPersonPage';   // Driver dashboard
import OrderHistoryPage from './pages/delivery/OrderHistoryPage';           // Order history table

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

        {/* Staff Routes */}
        <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/bundle-management" element={<BundleManagement />} />
        <Route path="/staff/donation-schedule" element={<DonationSchedule />} />
        <Route path="/staff/inventory-management" element={<InventoryManagement />} />
        <Route path="/staff/order-fulfillment" element={<OrderFulfillment />} />
        <Route path="/staff/verify-donation" element={<VerifyDonation />} />

        {/* NEW: Delivery & Logistics Routes */}
        <Route path="/create-delivery" element={<CreateDeliveryPage />} />
        <Route path="/delivery/DeliveryPersonPage" element={<DeliveryPersonPage />} />   {/* ← changed from /delivery-person */}
        <Route path="/order-history" element={<OrderHistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;