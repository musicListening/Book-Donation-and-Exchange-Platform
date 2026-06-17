// components/StaffLayout.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Add useNavigate
import '../App.css';
import '../styles/Staff.css'; 

function StaffLayout({ children }) {
  const navigate = useNavigate(); // Add this for navigation

  const navItems = [
    { path: '/staff/dashboard', label: 'Dashboard' },
    { path: '/staff/bundle-management', label: 'Bundle Management' },
    { path: '/staff/donation-schedule', label: 'Donation Schedule' },
    { path: '/staff/inventory-management', label: 'Inventory Management' },
    { path: '/staff/order-fulfillment', label: 'Order Fulfillment' },
    { path: '/staff/verify-donation', label: 'Verify Donation' },
  ];

  // Add logout handler function
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    // Redirect to signup page
    navigate('/');
  };

  return (
    <div className="app-container">
      
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>ShareShelf</h2>
          <p>Staff Portal</p>
        </div>

        <div className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                'nav-item' + (isActive ? ' active' : '')
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          {/* Change from NavLink to button with onClick */}
          <button onClick={handleLogout} className="logout-btn">
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {children}
      </div>

    </div>
  );
}

export default StaffLayout;