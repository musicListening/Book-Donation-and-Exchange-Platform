// components/StaffLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import '../styles/Staff.css';

const navItems = [
  { path: '/staff/dashboard',           label: 'Dashboard',        icon: 'dashboard' },
  { path: '/staff/bundle-management',   label: 'Bundle Management',icon: 'inventory_2' },
  { path: '/staff/donation-schedule',   label: 'Donation Schedule',icon: 'calendar_month' },
  { path: '/staff/inventory-management',label: 'Inventory',        icon: 'warehouse' },
  { path: '/staff/order-fulfillment',   label: 'Order Fulfillment',icon: 'local_shipping' },
  { path: '/staff/verify-donation',     label: 'Verify Donation',  icon: 'fact_check' },
];

function StaffLayout({ children, title }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [now, setNow]                   = useState(new Date());

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
    navigate('/login');
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
          <div className="ss-sidebar__portal-label">Staff Portal</div>
        </div>

        <nav className="ss-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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
              <div className="ss-sidebar__footer-avatar">{initials}</div>
              <div className="ss-sidebar__footer-info">
                <strong>{user.name}</strong>
                <span>Operations Staff</span>
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

        {/* ══ TOPBAR ══════════════════════════════════════════ */}
        <header className="ss-layout__topbar">

          {/* Left — hamburger + page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <button
              className="ss-layout__sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <div style={{ minWidth: 0 }}>
              {/* breadcrumb-style sub-label */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.8px',
                textTransform: 'uppercase', color: '#8A9A9A',
                marginBottom: '2px', fontFamily: 'Inter, sans-serif',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>location_on</span>
                Staff Portal · Sri Lanka
              </div>

              {/* Main page title */}
              <h1 className="ss-layout__page-title" style={{ margin: 0 }}>
                {title || 'Staff Portal'}
              </h1>
            </div>
          </div>

          {/* Right — clock + notifications + user menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

            {/* Date & time chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(26,107,104,0.06)',
              border: '1px solid rgba(26,107,104,0.12)',
              borderRadius: '10px', padding: '6px 12px',
              fontSize: '12px', color: '#5C6A6A',
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#1A6B68' }}>schedule</span>
              {dateStr} · {timeStr}
            </div>

            {/* Notification bell */}
            <button style={{
              position: 'relative', width: '38px', height: '38px',
              background: 'rgba(26,107,104,0.06)',
              border: '1px solid rgba(26,107,104,0.12)',
              borderRadius: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#1A6B68', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,107,104,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(26,107,104,0.06)'}
              title="Notifications"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
              {/* badge */}
              <span style={{
                position: 'absolute', top: '5px', right: '5px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#E76F51', border: '1.5px solid white',
              }} />
            </button>

            {/* User menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: userMenuOpen ? 'rgba(26,107,104,0.1)' : 'rgba(26,107,104,0.06)',
                  border: '1px solid rgba(26,107,104,0.15)',
                  borderRadius: '12px', padding: '6px 12px 6px 6px',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,107,104,0.1)'}
                onMouseLeave={e => !userMenuOpen && (e.currentTarget.style.background = 'rgba(26,107,104,0.06)')}
              >
                {/* Avatar */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '9px',
                  background: 'linear-gradient(135deg, #1A6B68, #0F4F4D)',
                  color: 'white', fontFamily: 'Inter, sans-serif',
                  fontSize: '13px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(26,107,104,0.3)',
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
                {/* Name + role */}
                <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 600, color: '#1E2A2A',
                    fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                    maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {user?.name || 'Staff Member'}
                  </div>
                  <div style={{
                    fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px',
                    textTransform: 'uppercase', color: '#1A6B68',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    Operations Staff
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{
                  fontSize: '16px', color: '#8A9A9A',
                  transform: userMenuOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}>
                  expand_more
                </span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 200 }}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    minWidth: '220px', background: 'white',
                    border: '1px solid rgba(26,107,104,0.12)',
                    borderRadius: '14px',
                    boxShadow: '0 16px 48px rgba(26,107,104,0.14)',
                    padding: '8px', zIndex: 300,
                    animation: 'fadeInDown 0.15s ease',
                  }}>
                    {/* Header */}
                    <div style={{
                      padding: '10px 12px 12px',
                      borderBottom: '1px solid rgba(26,107,104,0.08)',
                      marginBottom: '6px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '11px',
                          background: 'linear-gradient(135deg, #1A6B68, #0F4F4D)',
                          color: 'white', fontSize: '15px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Inter, sans-serif',
                          boxShadow: '0 3px 10px rgba(26,107,104,0.3)',
                        }}>{initials}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#1E2A2A', fontFamily: 'Inter, sans-serif' }}>
                            {user?.name || 'Staff Member'}
                          </div>
                          <div style={{
                            fontSize: '11px', color: 'white', fontFamily: 'Inter, sans-serif',
                            background: 'linear-gradient(135deg, #1A6B68, #2A9D8F)',
                            padding: '2px 8px', borderRadius: '50px', display: 'inline-block',
                            marginTop: '3px', fontWeight: 600,
                          }}>
                            Operations Staff
                          </div>
                        </div>
                      </div>
                      <div style={{
                        marginTop: '8px', fontSize: '11px', color: '#8A9A9A',
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
                      </div>
                    </div>

                    {/* Menu items */}
                    {[
                      { icon: 'person', label: 'My Profile' },
                      { icon: 'settings', label: 'Settings' },
                    ].map(item => (
                      <button key={item.label} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        width: '100%', padding: '9px 12px', border: 'none',
                        background: 'none', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 500, color: '#5C6A6A',
                        fontFamily: 'Inter, sans-serif', textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,107,104,0.07)'; e.currentTarget.style.color = '#1A6B68'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#5C6A6A'; }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}

                    <div style={{ borderTop: '1px solid rgba(26,107,104,0.08)', margin: '6px 0' }} />

                    <button onClick={handleLogout} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      width: '100%', padding: '9px 12px', border: 'none',
                      background: 'none', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 600, color: '#C65D53',
                      fontFamily: 'Inter, sans-serif', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,93,83,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="ss-layout__content">{children}</div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default StaffLayout;