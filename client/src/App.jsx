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

import Notifications from './pages/user/notifications';
import Orders from './pages/user/orders';
import Profile from './pages/user/profile';
import MysteryBoxes from './pages/user/MysteryBoxes';

// Public Pages
import HomePage from './pages/public/HomePage';

// Admin Pages - Check if these files exist
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CustomReportGeneration from './pages/admin/CustomReportGeneration';
import SystemConfig from './pages/admin/SystemConfig';
import AdminProfile from './pages/admin/AdminProfile';
import ReviewManagement from './pages/admin/ReviewManagement';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import BundleManagement from './pages/staff/BundleManagement';
import DonationSchedule from './pages/staff/DonationSchedule';
import OrderFulfillment from './pages/staff/OrderFulfillment';
import SubmitCraft from './pages/user/SubmitCraft';
import CraftApproval from './pages/staff/CraftApproval';

// Delivery & Logistics Pages
import DeliveryPersonPage from './pages/delivery/DeliveryPersonPage';   // Driver dashboard
import OrderHistoryPage from './pages/delivery/OrderHistoryPage';           // Order history table
import DriverProfile from './pages/delivery/DriverProfile';
import DeliveryLayout from './components/deliveryLayout';

// Community Pages
import CommunityHome from './pages/community/community_home';  // Community Hub
import LibrisDashboard from './pages/community/community_admin_dashboard';  // Dashboard
import MessageModeration from './pages/community/community_management';  // Messages
import EventManagement from './pages/community/event_management';  // Event Management (with add/edit/delete)
import CommunityProfile from './pages/community/CommunityProfile';

// Staff Profile
import StaffProfile from './pages/staff/StaffProfile';

// Auth Guard
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<HomePage />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />

        {/* User Routes */}
        <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/community-home" element={<ProtectedRoute><CommunityHome /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />

        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/mystery-boxes" element={<ProtectedRoute><MysteryBoxes /></ProtectedRoute>} />
        <Route path="/submit-craft" element={<ProtectedRoute><SubmitCraft /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="PLATFORM_ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="PLATFORM_ADMIN"><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/reports/custom" element={<ProtectedRoute requiredRole="PLATFORM_ADMIN"><CustomReportGeneration /></ProtectedRoute>} />
        <Route path="/admin/config" element={<ProtectedRoute requiredRole="PLATFORM_ADMIN"><SystemConfig /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute requiredRole="PLATFORM_ADMIN"><ReviewManagement /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute requiredRole="PLATFORM_ADMIN"><AdminProfile /></ProtectedRoute>} />

        {/* Staff Routes */}
        <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
        <Route path="/staff/dashboard" element={<ProtectedRoute requiredRole="OPERATIONS_STAFF"><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/bundle-management" element={<ProtectedRoute requiredRole="OPERATIONS_STAFF"><BundleManagement /></ProtectedRoute>} />
        <Route path="/staff/donation-schedule" element={<ProtectedRoute requiredRole="OPERATIONS_STAFF"><DonationSchedule /></ProtectedRoute>} />
        <Route path="/staff/order-fulfillment" element={<ProtectedRoute requiredRole="OPERATIONS_STAFF"><OrderFulfillment /></ProtectedRoute>} />
        <Route path="/staff/craft-approval" element={<ProtectedRoute requiredRole="OPERATIONS_STAFF"><CraftApproval /></ProtectedRoute>} />
        <Route path="/staff/marketplace" element={<ProtectedRoute requiredRole="OPERATIONS_STAFF"><CraftApproval /></ProtectedRoute>} />
        <Route path="/staff/profile" element={<ProtectedRoute requiredRole="OPERATIONS_STAFF"><StaffProfile /></ProtectedRoute>} />

        {/* Community Admin Routes */}
        <Route path="/community-admin" element={<Navigate to="/community-admin/dashboard" replace />} />
        <Route path="/community-admin/dashboard" element={<ProtectedRoute requiredRole="COMMUNITY_ADMIN"><LibrisDashboard /></ProtectedRoute>} />
        <Route path="/community-admin/events" element={<ProtectedRoute requiredRole="COMMUNITY_ADMIN"><EventManagement /></ProtectedRoute>} />
        <Route path="/community-admin/messages" element={<ProtectedRoute requiredRole="COMMUNITY_ADMIN"><MessageModeration /></ProtectedRoute>} />
        <Route path="/community-admin/event-management" element={<ProtectedRoute requiredRole="COMMUNITY_ADMIN"><EventManagement /></ProtectedRoute>} />
        <Route path="/community-admin/profile" element={<ProtectedRoute requiredRole="COMMUNITY_ADMIN"><CommunityProfile /></ProtectedRoute>} />
      
        {/* Delivery & Logistics Routes */}
        <Route path="/delivery" element={<ProtectedRoute requiredRole="DELIVERY_PERSONNEL"><DeliveryLayout /></ProtectedRoute>}>
          <Route index element={<DeliveryPersonPage />} />
          <Route path="DeliveryPersonPage" element={<DeliveryPersonPage />} />
          <Route path="history" element={<OrderHistoryPage />} />
          <Route path="order-history" element={<OrderHistoryPage />} />
          <Route path="profile" element={<DriverProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;