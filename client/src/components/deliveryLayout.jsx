import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Navbar.css';

const navItems = [
  { path: '/delivery', label: 'Deliveries', icon: 'local_shipping' },
  { path: '/delivery/history', label: 'Order History', icon: 'history' },
  { path: '/delivery/profile', label: 'My Profile', icon: 'person' },
];

function DeliveryLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/delivery' || path === '/delivery/DeliveryPersonPage') {
      return 'Deliveries';
    } else if (path === '/delivery/history' || path === '/delivery/order-history') {
      return 'Order History';
    } else if (path === '/delivery/profile') {
      return 'My Profile';
    }
    return 'Delivery Portal';
  };

  return (
    <div className="ss-layout">
      {sidebarOpen && (
        <div className="ss-layout__overlay" onClick={() => setSidebarOpen(false)} />
      )}
      {/* ── Sidebar ── */}
      <aside className={`ss-sidebar ${sidebarOpen ? 'ss-sidebar--open' : ''}`}>
        <div className="ss-sidebar__logo-area">
          <a href="/" className="ss-sidebar__brand">
            <span className="ss-sidebar__brand-icon">
              <i className="fa-solid fa-book-open" />
            </span>
            <span className="ss-sidebar__brand-name">ShareShelf</span>
          </a>
          <div className="ss-sidebar__portal-label">Logistics &amp; Delivery</div>
        </div>

        <nav className="ss-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/delivery'}
              className={({ isActive }) =>
                'ss-sidebar__nav-item' + (isActive ? ' ss-sidebar__nav-item--active' : '')
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ss-sidebar__footer">
          {user?.name && (
            <div className="ss-sidebar__footer-user">
              <div className="ss-sidebar__footer-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ss-sidebar__footer-info">
                <strong>{user.name}</strong>
                <span>Delivery Driver</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="ss-sidebar__logout">
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="ss-layout__main">
        <header className="ss-layout__topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="ss-layout__sidebar-toggle" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="ss-layout__page-title">{getTitle()}</h1>
          </div>
          <div className="ss-layout__topbar-user">
            <span className="ss-layout__topbar-name">{user?.name || "Delivery Driver"}</span>
            <div className="ss-layout__topbar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "D"}
            </div>
          </div>
        </header>
        <div className="ss-layout__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DeliveryLayout;