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
  { path: '/staff/verify-donation', label: 'Verify Donation' },
];

function StaffLayout({ children, title }) {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  // live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  // greeting
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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
                <strong>{user.name}</strong>
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
        
        {/* TOP BAR */}
        <div className="content-header">
          <div>
            <h1>{title || 'Staff Portal'}</h1>
            <div className="page-subtitle">
              Staff Portal · Sri Lanka
            </div>
          </div>
          
          <div className="user-info">
            {/* Date & time */}
            <div className="staff-datetime">
              <span>🕐</span>
              {dateStr} · {timeStr}
            </div>

            {/* Notification bell */}
            <button className="staff-notification-btn" title="Notifications">
              <span>🔔</span>
              <span className="notification-badge"></span>
            </button>

            {/* User menu */}
            <div className="staff-user-menu-wrapper">
              <button 
                className="staff-user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="staff-user-avatar">{initials}</div>
                <div className="staff-user-info-text">
                  <div className="staff-user-name">{user?.name || 'Staff Member'}</div>
                  <div className="staff-user-role-badge">Operations</div>
                </div>
                <span className="dropdown-arrow">{userMenuOpen ? '▲' : '▼'}</span>
              </button>

              {userMenuOpen && (
                <>
                  <div 
                    className="dropdown-overlay" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="staff-dropdown">
                    <div className="staff-dropdown-header">
                      <div className="staff-dropdown-avatar">{initials}</div>
                      <div>
                        <div className="staff-dropdown-name">{user?.name || 'Staff Member'}</div>
                        <div className="staff-dropdown-role">Operations Staff</div>
                      </div>
                    </div>
                    <div className="staff-dropdown-greeting">
                      {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
                    </div>
                    
                    <div className="staff-dropdown-divider"></div>
                    
                    <button className="staff-dropdown-item">
                      <span>👤</span> My Profile
                    </button>
                    <button className="staff-dropdown-item">
                      <span>⚙️</span> Settings
                    </button>
                    
                    <div className="staff-dropdown-divider"></div>
                    
                    <button className="staff-dropdown-item staff-dropdown-logout" onClick={handleLogout}>
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
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