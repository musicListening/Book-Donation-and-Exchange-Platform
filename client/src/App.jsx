import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages - Check the actual file names in your pages/auth folder
import Login from './pages/auth/Login';
import Signup from './pages/auth/signup.jsx';

// User Pages - Match the actual file names (lowercase with dashes)
import UserDashboard from './pages/user/UserDashboard';
import Cart from './pages/user/cart';
import Donate from './pages/user/donate';
import Marketplace from './pages/user/marketplace';
import MyCrafts from './pages/user/my-crafts';
import Notifications from './pages/user/notifications';
import Orders from './pages/user/orders';
import Profile from './pages/user/profile';

// Public Pages
import HomePage from './pages/public/HomePage';

// Admin Pages - Check if these files exist
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

// Delivery & Logistics Pages
import CreateDeliveryPage from './pages/delivery/CreateDeliveryPage';
import DeliveryPersonPage from './pages/delivery/DeliveryPersonPage';
import OrderHistoryPage from './pages/delivery/OrderHistoryPage';

// Community Admin Pages
import CommunityDashboard from './pages/community/community_admin_dashboard';
import MessageModeration from './pages/community/community_admin_community_management';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />

        {/* User Routes */}
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/my-crafts" element={<MyCrafts />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
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

        {/* Delivery & Logistics Routes */}
        <Route path="/create-delivery" element={<CreateDeliveryPage />} />
        <Route path="/delivery/person" element={<DeliveryPersonPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />

        {/* Community Admin Routes */}
        <Route path="/community-admin" element={<Navigate to="/community-admin/dashboard" replace />} />
        <Route path="/community-admin/dashboard" element={<CommunityDashboard />} />
        <Route path="/community-admin/messages" element={<MessageModeration />} />
      </Routes>
    </Router>
  );
}

export default App;