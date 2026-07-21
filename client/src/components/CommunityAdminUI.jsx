import { useEffect, useState } from "react";

// ============================================================
// SHARED DESIGN TOKENS — used by every Community Admin screen
// (Dashboard, Events, Messages) so they look and behave the same.
// ============================================================
export const colors = {
  primary: "#006D5B",
  primaryContainer: "#1B8C78",
  primaryFixed: "#C8F0EA",
  onPrimaryContainer: "#E8F5F2",
  onPrimary: "#FFFFFF",
  secondary: "#8B5E3C",
  secondaryContainer: "#FFD5B8",
  onSecondaryContainer: "#6B472A",
  tertiaryFixed: "#E6F4F0",
  tertiaryContainer: "#2D6A4F",
  onTertiaryContainer: "#B2DFCC",
  tertiary: "#1B4D3E",
  surface: "#F8FDFB",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F2F9F6",
  surfaceContainerHigh: "#E8F2EF",
  surfaceContainer: "#EEF6F3",
  onSurface: "#1A2E28",
  onSurfaceVariant: "#3D5A52",
  outlineVariant: "#C5D9D3",
  error: "#BA1A1A",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#93000A",
};

export const sidebarColors = {
  background: "#0A3B32",
  text: "#FFFFFF",
  textHover: "#E8F5F2",
  border: "rgba(255, 255, 255, 0.15)",
  activeBackground: "rgba(255, 255, 255, 0.12)",
  hoverBackground: "rgba(255, 255, 255, 0.08)",
  icon: "#FFFFFF",
  iconHover: "#C8F0EA",
};

export const NAV_LINKS = [
  { key: "dashboard", icon: "dashboard", label: "Dashboard", path: "/community-admin/dashboard" },
  { key: "events", icon: "calendar_today", label: "Events", path: "/community-admin/events" },
  { key: "messages", icon: "forum", label: "Messages", path: "/community-admin/messages" },
];

export function Icon({ name, size = 24, style = {} }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: size, lineHeight: 1, ...style }}>
      {name}
    </span>
  );
}

// Fonts + global resets shared by every Community Admin page.
export function CommunityAdminFonts() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${colors.surface}; font-family: 'Inter', sans-serif; }
        a { text-decoration: none; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-family: 'Material Symbols Outlined'; }
        .content-wrapper { flex: 1; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent !important; border: none !important; }
        ::-webkit-scrollbar-thumb { background: ${colors.primaryContainer}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${colors.primary}; }
        * { scrollbar-width: thin; scrollbar-color: ${colors.primaryContainer} transparent; }
      `}</style>
    </>
  );
}

// One Sidebar component reused by every Community Admin page.
export function CommunitySidebar({ active, open, onClose, navigate, isMd }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (navigate) navigate("/login"); else window.location.href = "/login";
    if (onClose) onClose();
  };

  const content = (
    <aside style={{ height: "100%", width: 280, background: sidebarColors.background, borderRight: `1px solid ${sidebarColors.border}`, display: "flex", flexDirection: "column", padding: "28px 20px" }}>
      <div style={{ marginBottom: 48, paddingLeft: 12 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: sidebarColors.text, marginBottom: 8, letterSpacing: "-0.5px" }}>Community Admin</h1>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {NAV_LINKS.map((link) => {
          const isActive = link.key === active;
          return (
            <a
              key={link.key}
              onClick={(e) => { e.preventDefault(); if (navigate) navigate(link.path); if (onClose) onClose(); }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", textDecoration: "none", borderRadius: 10, fontWeight: isActive ? 600 : 400, color: isActive ? sidebarColors.text : "rgba(255, 255, 255, 0.7)", background: isActive ? sidebarColors.activeBackground : "transparent", borderLeft: isActive ? `3px solid ${colors.primaryFixed}` : "3px solid transparent", fontSize: 14, lineHeight: "20px", transition: "all 0.2s ease", cursor: "pointer" }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = sidebarColors.hoverBackground; e.currentTarget.style.color = sidebarColors.textHover; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"; } }}
            >
              <Icon name={link.icon} size={20} style={{ color: "inherit" }} />
              <span style={{ fontWeight: isActive ? 600 : 400 }}>{link.label}</span>
            </a>
          );
        })}
      </nav>
      <div style={{ marginTop: "auto", paddingTop: 24, borderTop: `1px solid ${sidebarColors.border}` }}>
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", width: "100%", background: "transparent", border: "none", borderRadius: 10, color: "rgba(255, 255, 255, 0.7)", fontSize: 14, cursor: "pointer", transition: "all 0.2s ease", fontFamily: "'Inter', sans-serif" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = sidebarColors.hoverBackground; e.currentTarget.style.color = sidebarColors.textHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"; }}
        >
          <Icon name="logout" size={20} style={{ color: "inherit" }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  if (!isMd) {
    return (
      <>
        {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />}
        <div style={{ position: "fixed", left: 0, top: 0, height: "100%", zIndex: 50, transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", transform: open ? "translateX(0)" : "translateX(-100%)" }}>{content}</div>
      </>
    );
  }
  return <div style={{ position: "fixed", left: 0, top: 0, height: "100%", zIndex: 50 }}>{content}</div>;
}

// One sticky header reused by every Community Admin page.
export function CommunityHeader({ title, isMd, onMenuClick }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: colors.surfaceContainerLowest, borderBottom: `1px solid ${colors.outlineVariant}`, display: "flex", justifyContent: "space-between", alignItems: "center", height: 70, padding: "0 28px", boxShadow: "0 1px 2px rgba(0,0,0,0.03)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {!isMd && (
          <button onClick={onMenuClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: colors.primary, display: "flex", borderRadius: 8 }}>
            <Icon name="menu" size={24} />
          </button>
        )}
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: colors.primary }}>{title}</h2>
      </div>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.primaryFixed, display: "flex", alignItems: "center", justifyContent: "center", color: colors.primary, fontWeight: 600 }}>
        <Icon name="person" size={20} />
      </div>
    </header>
  );
}

// Shared responsive breakpoint hook so every page reacts the same way.
export function useIsMdScreen() {
  const [isMd, setIsMd] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setIsMd(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMd;
}
