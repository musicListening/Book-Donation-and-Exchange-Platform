// components/StaffLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Staff.css';

const navItems = [
  { path: '/staff/dashboard', label: 'Dashboard' },
  { path: '/staff/bundle-management', label: 'Bundle Management' },
  { path: '/staff/donation-schedule', label: 'Donation Schedule' },

  { path: '/staff/order-fulfillment', label: 'Order Fulfillment' },
  { path: '/staff/craft-approval', label: 'Marketplace' },
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
              <div className="sidebar-user-avatar">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : initials}
              </div>
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
        
        {/* TOP BAR */}
        <div className="content-header">
          <div>
            <h1>{title || 'Staff Portal'}</h1>
          </div>
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                border: '1px solid #DEE2E6', borderRadius: 8, background: 'white',
                cursor: 'pointer', fontSize: 13, fontWeight: 500
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', overflow: 'hidden',
                background: '#1E4D4B', color: 'white', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0
              }}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials}
              </div>
              <span>{user?.name || 'Staff'}</span>
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
                    <p style={{ margin: 0, fontSize: 11, color: '#6C757D' }}>Operations Staff</p>
                  </div>
                  <button
                    onClick={() => { navigate('/staff/profile'); setUserMenuOpen(false); }}
                    style={{
                      display: 'block', width: '100%', padding: '10px 16px', border: 'none',
                      background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500
                    }}
                    onMouseEnter={e => e.target.style.background = '#F8F9FA'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    Profile
                  </button>
                  <div style={{ height: 1, background: '#F1F3F5' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block', width: '100%', padding: '10px 16px', border: 'none',
                      background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#E63946'
                    }}
                    onMouseEnter={e => e.target.style.background = '#FFF5F5'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
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