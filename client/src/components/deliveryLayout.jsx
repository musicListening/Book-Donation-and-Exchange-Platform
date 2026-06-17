import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import '../styles/Delivery.css';   // ← relative path from components to styles

function DeliveryLayout() {
  const navigate = useNavigate();

  const navItems = [
    { path: '/delivery', label: 'Delivery Page', icon: 'grid_view' },
    { path: '/delivery/history', label: 'Order History', icon: 'history' },
    { path: '/delivery/profile', label: 'Profile', icon: 'person' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="delivery-layout app-container">
      {/* Sidebar – identical structure to StaffLayout */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>ShareShelf</h2>
          <p>LOGISTICS DELIVERY</p>
        </div>

        <div className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/delivery'}
              className={({ isActive }) =>
                'nav-item' + (isActive ? ' active' : '')
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DeliveryLayout;