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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (u?.id) fetch((import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://book-donation-and-exchange-platform.onrender.com/api')) + '/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u.id }) }).catch(() => {});
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
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (user?.name?.charAt(0)?.toUpperCase() || 'D')}
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
          <div className="ss-layout__topbar-user" style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', border: '1px solid #DEE2E6', borderRadius: 8, background: 'white', cursor: 'pointer' }}
            >
              <span className="ss-layout__topbar-name">{user?.name || "Delivery Driver"}</span>
              <div className="ss-layout__topbar-avatar" style={{ overflow: 'hidden' }}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (user?.name?.charAt(0)?.toUpperCase() || 'D')}
              </div>
            </button>
            {userMenuOpen && (
              <>
                <div onClick={() => setUserMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  background: 'white', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  border: '1px solid #E9ECEF', minWidth: 160, zIndex: 100, overflow: 'hidden'
                }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #F1F3F5' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{user?.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#6C757D' }}>Delivery Driver</p>
                  </div>
                  <button
                    onClick={() => { navigate('/delivery/profile'); setUserMenuOpen(false); }}
                    style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                    onMouseEnter={e => e.target.style.background = '#F8F9FA'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    Profile
                  </button>
                  <div style={{ height: 1, background: '#F1F3F5' }} />
                  <button
                    onClick={handleLogout}
                    style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#E63946' }}
                    onMouseEnter={e => e.target.style.background = '#FFF5F5'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
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