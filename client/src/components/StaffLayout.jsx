// components/StaffLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Staff.css';

const navItems = [
  { path: '/staff/dashboard', label: 'Dashboard' },
  { path: '/staff/bundle-management', label: 'Bundle Management' },
  { path: '/staff/donation-schedule', label: 'Donation Schedule' },
  { path: '/staff/inventory-management', label: 'Inventory Management' },
  { path: '/staff/order-fulfillment', label: 'Order Fulfillment' },

];

function StaffLayout({ children, title }) {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('ss_current_user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('ss_current_user') || '{}');
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

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
          {user?.name && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">{initials}</div>
              <div className="sidebar-user-details">
                {/* Only show first letter of name */}
              <strong>{user.name || 'Staff User'}</strong>
                <span>Operations Staff</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn"> 
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        
        {/* TOP BAR - Only title, no user info/date/time */}
        <div className="content-header">
          <div>
            <h1>{title || 'Staff Portal'}</h1>
          
          </div>
        </div>
        
        {/* Page Content */}
        <div className="staff-page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default StaffLayout;