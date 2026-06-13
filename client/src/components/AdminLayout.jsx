import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/AdminLayout.css";

const navItems = [
  { path: "/admin/AdminDashboard", label: "Analytics", icon: "📊" },
  { path: "/admin/users", label: "User Management", icon: "👥" },
  { path: "/admin/reports/custom", label: "Reports", icon: "📄" },
  { path: "/admin/config", label: "System Config", icon: "⚙️" },
];

export default function AdminLayout({ children, title }) {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">📚</span>
          <h2>PROJENIUS</h2>
          <p className="subtitle">Admin Portal</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="icon">{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item logout">
            <span className="icon">🚪</span> Sign Out
          </Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <h1>{title}</h1>
          <div className="user-profile">
            <span>Admin User</span>
            <div className="avatar">A</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
