import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  BookOpen,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  User,
  Star,
} from "lucide-react";
import { authAPI } from "../services/api";
import "../styles/AdminLayout.css";

const navItems = [
  { path: "/admin/dashboard", label: "Analytics", icon: BarChart3 },
  { path: "/admin/users", label: "User Management", icon: Users },
  { path: "/admin/reviews", label: "Reviews", icon: Star },
  { path: "/admin/reports/custom", label: "Reports", icon: FileText },
  { path: "/admin/config", label: "System Config", icon: Settings },
];

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AdminLayout({ children, title, hideHeaderLabel = false, hideNotifications = false }) {
  const navigate = useNavigate();
  // State declarations
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // getUser helper
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  };

  const handleLogout = () => {
    const u = getUser();
    if (u?.id) authAPI.logout(u.id);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("ss_current_user");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const user = getUser();
  // initials derivation
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="admin-layout-container">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn("admin-sidebar-shell", sidebarOpen && "sidebar-open")}>
        {/* Brand */}
        <div className="sidebar-brand-block">
          <h1 className="brand-title">ShareShelf</h1>
          <p className="brand-tagline">
            Platform management & analytics.
          </p>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav-block">
          <p className="nav-group-title">Operations</p>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn("nav-item-link", isActive && "nav-item-active")
              }
              onClick={() => setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="nav-active-bar"
                    style={{ opacity: isActive ? 1 : 0 }}
                  />
                  <Icon className="w-4 h-4 nav-item-icon" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer-block">
          <div className="user-profile-summary">
            <div className="user-avatar-badge">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
              ) : initials}
            </div>
            <div className="user-profile-details">
              <p className="user-name-text">{user?.name || "Admin User"}</p>
              <p className="user-role-text">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sign-out-btn"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="main-content-flow">
        {/* TopBar */}
        <header className="top-header-bar">
          <button
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h2 className="topbar-title">{title || "Admin Console"}</h2>

          <div className="topbar-actions">
            <div className="topbar-date-badge">
              <span className="date-pulse-dot" />
              {dateStr} · {timeStr}
            </div>

            {!hideNotifications && (
              <button
                className="topbar-notification-btn"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-muted" />
                <span className="notification-badge-count">3</span>
              </button>
            )}

            <div className="topbar-user-menu-wrapper">
              <button
                className={cn("topbar-user-menu-trigger", userMenuOpen && "menu-active")}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="avatar-small">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                  ) : initials}
                </div>
                <span className="user-name-label">{user?.name || "Admin User"}</span>
                <ChevronDown className={cn("chevron-icon", userMenuOpen && "chevron-rotated")} />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="dropdown-click-overlay"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="dropdown-menu-box">
                    <div className="dropdown-user-info">
                      <p className="dropdown-user-name">{user?.name || "Admin User"}</p>
                      <p className="dropdown-user-role">Administrator</p>
                    </div>
                    <div className="dropdown-separator" />
                    <button
                      onClick={() => { navigate('/admin/profile'); setUserMenuOpen(false); }}
                      className="dropdown-logout-btn"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </button>
                    <div className="dropdown-separator" />
                    <button
                      onClick={handleLogout}
                      className="dropdown-logout-btn"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="main-content-scroll">
          {children}
        </div>
      </main>
    </div>
  );
}
