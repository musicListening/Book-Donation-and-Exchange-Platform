import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/AdminLayout.css";

const navItems = [
  { path: "/admin/dashboard", label: "Analytics" },
  { path: "/admin/users", label: "User Management" },
  { path: "/admin/reports/custom", label: "Reports" },
  { path: "/admin/config", label: "System Config" },
];

export default function AdminLayout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>ShareShelf</h2>
          <p className="subtitle">Admin Portal</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout" style={{
            background: 'none',
            border: 'none',
            width: '100%',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            color: 'var(--color-text-muted)',
            transition: 'all 0.2s ease'
          }}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <h1>{title}</h1>
          <div className="user-profile">
            <span>{user?.name || 'Admin User'}</span>
            <div className="avatar">{user?.name?.charAt(0) || 'A'}</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}