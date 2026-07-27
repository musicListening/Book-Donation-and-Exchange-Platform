import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';
import './Navbar.css';

/**
 * Unified Navbar Component
 *
 * Props:
 *  - variant: 'public' | 'user' | 'community'  (default: 'public')
 *  - user: object from localStorage { name, points }
 *  - cartCount: number (optional, shown on user variant)
 *  - activePage: string (for community tabs)
 *  - onTabChange: fn (for community tabs)
 */
export default function Navbar({
  variant = 'public',
  user = null,
  cartCount = 0,
  activePage,
  onTabChange,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login', redirectTo: null });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('ss_current_user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // ─── PUBLIC NAV LINKS ────────────────────────────────────────
  // Links with `hash` use smooth-scroll instead of React Router NavLink
  const publicLinks = [
    { to: '/', label: 'Home' },
    { label: 'How It Works', hash: 'how-it-works' },
    { to: '/marketplace', label: 'Marketplace', requiresLogin: true },
    { label: 'About', hash: 'about' },
  ];

  const scrollToSection = useCallback((id) => {
    // If not on homepage, navigate there first then scroll
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileOpen(false);
  }, [location.pathname, navigate]);

  // ─── USER NAV LINKS ──────────────────────────────────────────
  const userLinks = [
    { to: '/user-dashboard', label: 'Dashboard' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/orders', label: 'My Orders' },
    { to: '/donate', label: 'Donate' },

  ];

  // ─── COMMUNITY NAV TABS ───────────────────────────────────────
  const communityTabs = [
    { key: 'events', label: 'Events', icon: 'event' },
    { key: 'groups', label: 'Groups', icon: 'groups' },
  ];

  const links = variant === 'user' ? userLinks : publicLinks;

  return (
    <>
      <header className={`ss-navbar ${scrolled ? 'ss-navbar--scrolled' : ''} ${mobileOpen ? 'ss-navbar--open' : ''}`}>
        <div className="ss-navbar__inner">

          {/* ── LOGO ── */}
          <Link to="/" className="ss-navbar__logo">
            <span className="ss-navbar__logo-icon">
              <i className="fa-solid fa-book-open" />
            </span>
            <span className="ss-navbar__logo-text">ShareShelf</span>
          </Link>

          {/* ── DESKTOP LINKS ── */}
          {variant === 'community' ? (
            <nav className="ss-navbar__links ss-navbar__links--tabs">
              {communityTabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`ss-navbar__tab ${activePage === tab.key ? 'ss-navbar__tab--active' : ''}`}
                  onClick={() => onTabChange && onTabChange(tab.key)}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          ) : (
            <nav className="ss-navbar__links">
              {links.map((link) =>
                link.hash ? (
                  <button
                    key={link.label}
                    className="ss-navbar__link ss-navbar__link--btn"
                    onClick={() => scrollToSection(link.hash)}
                  >
                    {link.label}
                  </button>
                ) : link.requiresLogin ? (
                  <button
                    key={link.label}
                    className="ss-navbar__link ss-navbar__link--btn"
                    onClick={() => setAuthModal({ isOpen: true, mode: 'login', redirectTo: link.to })}
                  >
                    {link.label}
                  </button>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `ss-navbar__link ${isActive ? 'ss-navbar__link--active' : ''}`
                    }
                  >
                    {link.label}
                  </NavLink>
                )
              )}
            </nav>
          )}

          {/* ── ACTIONS ── */}
          <div className="ss-navbar__actions">
            {variant === 'public' && (
              <>
                <button onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })} className="ss-navbar__btn ss-navbar__btn--ghost">Sign Up</button>
                <button onClick={() => setAuthModal({ isOpen: true, mode: 'login' })} className="ss-navbar__btn ss-navbar__btn--primary">Log In</button>
              </>
            )}

            {variant === 'user' && (
              <>
                {user && (
                  <span className="ss-navbar__points-badge">
                    <i className="fa-solid fa-coins" />
                    <span>{user.points ?? 0}</span> pts
                  </span>
                )}
                {cartCount >= 0 && (
                  <Link to="/cart" className="ss-navbar__cart" aria-label="Cart">
                    <i className="fa-solid fa-basket-shopping" />
                    {cartCount > 0 && (
                      <span className="ss-navbar__cart-badge">{cartCount}</span>
                    )}
                  </Link>
                )}
                {user && (
                  <div className="ss-navbar__user-menu">
                    <button className="ss-navbar__avatar" aria-label="User menu" style={user.profileImage ? { padding: 0, overflow: 'hidden' } : {}}>
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        user.name?.[0]?.toUpperCase() ?? 'U'
                      )}
                    </button>
                    <div className="ss-navbar__dropdown">
                      <div className="ss-navbar__dropdown-header">
                        <strong>{user.name}</strong>
                        <span>{user.points ?? 0} pts</span>
                      </div>
                      <Link to="/profile" className="ss-navbar__dropdown-item">
                        <i className="fa-solid fa-user" /> Profile
                      </Link>
                      <Link to="/notifications" className="ss-navbar__dropdown-item">
                        <i className="fa-solid fa-bell" /> Notifications
                      </Link>
                      <button onClick={handleLogout} className="ss-navbar__dropdown-item ss-navbar__dropdown-item--logout">
                        <i className="fa-solid fa-right-from-bracket" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {variant === 'community' && (
              <button onClick={() => setAuthModal({ isOpen: true, mode: 'login' })} className="ss-navbar__btn ss-navbar__btn--primary">
                Sign In
              </button>
            )}

            {/* ── MOBILE HAMBURGER ── */}
            <button
              className={`ss-navbar__hamburger ${mobileOpen ? 'ss-navbar__hamburger--open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        <div className={`ss-navbar__mobile ${mobileOpen ? 'ss-navbar__mobile--open' : ''}`}>
          {variant === 'community' ? (
            communityTabs.map((tab) => (
              <button
                key={tab.key}
                className={`ss-navbar__mobile-link ${activePage === tab.key ? 'ss-navbar__mobile-link--active' : ''}`}
                onClick={() => { onTabChange && onTabChange(tab.key); setMobileOpen(false); }}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))
          ) : (
            links.map((link) =>
              link.hash ? (
                <button
                  key={link.label}
                  className="ss-navbar__mobile-link"
                  onClick={() => { scrollToSection(link.hash); setMobileOpen(false); }}
                >
                  {link.label}
                </button>
              ) : link.requiresLogin ? (
                <button
                  key={link.label}
                  className="ss-navbar__mobile-link"
                  onClick={() => { setMobileOpen(false); setAuthModal({ isOpen: true, mode: 'login', redirectTo: link.to }); }}
                >
                  {link.label}
                </button>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `ss-navbar__mobile-link ${isActive ? 'ss-navbar__mobile-link--active' : ''}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </NavLink>
              )
            )
          )}

          <div className="ss-navbar__mobile-actions">
              {variant === 'public' && (
              <>
                <button onClick={() => { setMobileOpen(false); setAuthModal({ isOpen: true, mode: 'signup' }); }} className="ss-navbar__btn ss-navbar__btn--ghost">Sign Up</button>
                <button onClick={() => { setMobileOpen(false); setAuthModal({ isOpen: true, mode: 'login' }); }} className="ss-navbar__btn ss-navbar__btn--primary">Log In</button>
              </>
            )}
            {variant === 'user' && user && (
              <button onClick={handleLogout} className="ss-navbar__btn ss-navbar__btn--logout-mobile">
                <i className="fa-solid fa-right-from-bracket" /> Sign Out
              </button>
            )}
          </div>
        </div>
      </header>
      {/* Spacer so content doesn't hide under fixed navbar */}
      <div className="ss-navbar__spacer" />

      <AuthModal 
        isOpen={authModal.isOpen} 
        initialMode={authModal.mode}
        redirectTo={authModal.redirectTo}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))} 
      />
    </>
  );
}