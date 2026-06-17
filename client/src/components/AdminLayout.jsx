import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const navItems = [
  { path: "/admin/dashboard", label: "Analytics", icon: "bar_chart" },
  { path: "/admin/users", label: "User Management", icon: "manage_accounts" },
  { path: "/admin/reports/custom", label: "Reports", icon: "description" },
  { path: "/admin/config", label: "System Config", icon: "settings" },
];

export default function AdminLayout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="ss-layout">
      {sidebarOpen && (
        <div className="ss-layout__overlay" onClick={() => setSidebarOpen(false)} />
      )}
      {/* ── Sidebar ── */}
      <aside className={`ss-sidebar ${sidebarOpen ? "ss-sidebar--open" : ""}`}>
        <div className="ss-sidebar__logo-area">
          <a href="/" className="ss-sidebar__brand">
            <span className="ss-sidebar__brand-icon">
              <i className="fa-solid fa-book-open" />
            </span>
            <span className="ss-sidebar__brand-name">ShareShelf</span>
          </a>
          <div className="ss-sidebar__portal-label">Admin Portal</div>
        </div>

        <nav className="ss-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                "ss-sidebar__nav-item" + (isActive ? " ss-sidebar__nav-item--active" : "")
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
                <span>Administrator</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="ss-sidebar__logout">
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="ss-layout__main">
        <header className="ss-layout__topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="ss-layout__sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="ss-layout__page-title">{title}</h1>
          </div>
          <div className="ss-layout__topbar-user">
            <span className="ss-layout__topbar-name">{user?.name || "Admin User"}</span>
            <div className="ss-layout__topbar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>
        <div className="ss-layout__content">{children}</div>
      </div>
    </div>
  );
}