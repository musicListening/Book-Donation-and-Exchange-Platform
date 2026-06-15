import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../styles/delivery.css';

function DeliveryLayout() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Delivery Driver',
        role: user.role || 'DELIVERY STAFF'
      });
    }
  }, []);

  const navItems = [
    { path: '/delivery', label: 'Active Deliveries' },
    { path: '/delivery/order-history', label: 'Order History' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return currentUser.name[0].toUpperCase();
    }
    return 'DD';
  };

  return (
    <div className="delivery-app-container">
      
      {/* SIDEBAR - EXACTLY LIKE STAFF */}
      <div className="delivery-sidebar">
        <div className="delivery-sidebar-header">
          <h2>ShareShelf</h2>
          <p>Delivery Portal</p>
        </div>

        <div className="delivery-sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                'delivery-nav-item' + (isActive ? ' active' : '')
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="delivery-sidebar-footer">
          <button onClick={handleLogout} className="delivery-logout-btn">
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - EXACTLY LIKE STAFF */}
      <div className="delivery-main-content">
        {/* Header with User Info - EXACTLY LIKE STAFF */}
        <div className="delivery-content-header">
          <h1>Delivery Dashboard</h1>
          <div className="delivery-user-info">
            <span className="delivery-user-role">{currentUser.name}</span>
            <span className="delivery-user-title">{currentUser.role}</span>
            <div className="delivery-user-avatar">{getUserInitials()}</div>
          </div>
        </div>

        {/* Online Status Bar */}
        <div className="delivery-status-bar">
          <div className="delivery-status-indicator online">
            <span className="status-dot"></span>
            <span>Online</span>
          </div>
        </div>

        {/* Page Content */}
        <Outlet />
      </div>
    </div>
  );
}

export default DeliveryLayout;